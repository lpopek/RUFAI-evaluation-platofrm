#!/usr/bin/env node
/**
 * Skrypt losujacy zestaw do ankiety MOS (Node, zero zaleznosci).
 *
 * Z pelnego katalogu (178 kombinacji color/top) losuje N zestawow do jednej ankiety.
 * Kazdy zestaw = trojka plain/rl_aes/rl_tech dla wybranej kombinacji, przy USTALONYM
 * seedzie bazowym (domyslnie 5 — ten sam seed we wszystkich metodach izoluje metode).
 *
 * Uzycie:
 *   node scripts/sample_survey.js                      # 10 zestawow, seed 5
 *   node scripts/sample_survey.js --n 15 --seed-base 3
 *   node scripts/sample_survey.js --rng 42             # powtarzalne losowanie
 *
 * Zrodlo: data/tasks_catalog.json jesli istnieje, inaczej data/tasks.json.
 * Zapis:  data/tasks.json (ankieta do wgrania na platforme).
 *
 * WAZNE: uruchom raz `cp data/tasks.json data/tasks_catalog.json`, zeby wydzielic
 * katalog — inaczej skrypt nadpisze go wynikiem losowania.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, isAbsolute } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(__dirname);
const rel = (p) => (isAbsolute(p) ? p : join(root, p));

// --- parsowanie argumentow (proste --klucz wartosc) ---
function parseArgs(argv) {
  const a = { n: 10, seedBase: 5, rng: null, catalog: null, out: 'data/tasks.json' };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--n') a.n = parseInt(argv[++i], 10);
    else if (k === '--seed-base') a.seedBase = parseInt(argv[++i], 10);
    else if (k === '--rng') a.rng = parseInt(argv[++i], 10);
    else if (k === '--catalog') a.catalog = argv[++i];
    else if (k === '--out') a.out = argv[++i];
  }
  return a;
}

// --- deterministyczny RNG (mulberry32) dla powtarzalnosci z --rng ---
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t |= 0; t = (t + 0x6D2B79F5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// losowe probkowanie bez powtorzen (Fisher-Yates na kopii)
function sample(arr, n, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

const args = parseArgs(process.argv.slice(2));

// zrodlo katalogu
let catalogPath = args.catalog ? rel(args.catalog)
  : (existsSync(rel('data/tasks_catalog.json')) ? rel('data/tasks_catalog.json') : rel('data/tasks.json'));

const catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'));
const tasks = catalog.tasks;
console.log(`Katalog: ${catalogPath} (${tasks.length} kombinacji)`);

if (args.n > tasks.length) {
  console.error(`BLAD: prosisz o ${args.n} zestawow, katalog ma tylko ${tasks.length}`);
  process.exit(1);
}

const rand = args.rng == null ? Math.random : mulberry32(args.rng);
const chosen = sample(tasks, args.n, rand);

const sidStr = (s) => String(s).padStart(4, '0');
const warnings = [];
const outTasks = chosen.map((t) => {
  const avail = t.meta?.available_seeds ?? [args.seedBase];
  let useSeed = args.seedBase;
  if (!avail.includes(args.seedBase)) {
    useSeed = avail.reduce((best, s) => Math.abs(s - args.seedBase) < Math.abs(best - args.seedBase) ? s : best, avail[0]);
    warnings.push([t.id, args.seedBase, useSeed]);
  }
  const usid = sidStr(useSeed);
  const base = `${t.meta.color}-${t.meta.top}-s${usid}`;
  const images = t.images.map((img) => ({
    id: `${base}-${img.method}`,
    method: img.method,
    url: img.url.replace(/seed_\d+\.png/, `seed_${usid}.png`),
  }));
  return { id: base, meta: { ...t.meta, seed: useSeed }, prompt: t.prompt, images };
});

const outPath = rel(args.out);
writeFileSync(outPath, JSON.stringify({ tasks: outTasks }, null, 2), 'utf-8');
console.log(`Zapisano ${outTasks.length} zestawow do ${outPath} (seed bazowy ${args.seedBase})`);
if (warnings.length) {
  console.log(`\nUWAGA: ${warnings.length} kombinacji bez seeda ${args.seedBase}, uzyto najblizszego:`);
  for (const [id, want, got] of warnings) console.log(`  ${id}: chciano ${want}, uzyto ${got}`);
}
