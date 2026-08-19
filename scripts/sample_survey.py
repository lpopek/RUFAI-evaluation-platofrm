#!/usr/bin/env python3
"""
Skrypt losujacy zestaw do ankiety MOS.

Z pelnego katalogu (178 kombinacji color/top) losuje N zestawow do jednej ankiety.
Kazdy zestaw = jedna trojka plain/rl_aes/rl_tech dla wybranej kombinacji, przy
USTALONYM seedzie bazowym (domyslnie 5 — ten sam seed we wszystkich trzech metodach,
zeby izolowac metode, nie losowosc).

Uzycie:
    python scripts/sample_survey.py                      # 10 zestawow, seed 5
    python scripts/sample_survey.py --n 15 --seed-base 3
    python scripts/sample_survey.py --rng 42             # powtarzalne losowanie

Zrodlo katalogu: data/tasks_catalog.json jesli istnieje, inaczej data/tasks.json
(zakladajac ze to pelny katalog 178). Zapis: data/tasks.json (ankieta do wgrania).

WAZNE: uruchom raz, zeby wydzielic katalog:
    cp data/tasks.json data/tasks_catalog.json
inaczej skrypt nadpisze katalog wynikiem losowania.
"""
import json, argparse, random, os, sys, re

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--catalog", default=None)
    ap.add_argument("--out", default="data/tasks.json")
    ap.add_argument("--n", type=int, default=10)
    ap.add_argument("--seed-base", type=int, default=5)
    ap.add_argument("--rng", type=int, default=None)
    args = ap.parse_args()

    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    rel = lambda p: p if os.path.isabs(p) else os.path.join(here, p)

    catalog_path = args.catalog
    if catalog_path is None:
        cand = rel("data/tasks_catalog.json")
        catalog_path = cand if os.path.exists(cand) else rel("data/tasks.json")
    else:
        catalog_path = rel(catalog_path)

    catalog = json.load(open(catalog_path, encoding="utf-8"))
    tasks = catalog["tasks"]
    print(f"Katalog: {catalog_path} ({len(tasks)} kombinacji)")

    if args.n > len(tasks):
        sys.exit(f"BLAD: prosisz o {args.n} zestawow, katalog ma tylko {len(tasks)}")

    rng = random.Random(args.rng)
    chosen = rng.sample(tasks, args.n)

    out_tasks, seed_warnings = [], []
    for t in chosen:
        avail = t.get("meta", {}).get("available_seeds", [args.seed_base])
        use_seed = args.seed_base
        if args.seed_base not in avail:
            use_seed = min(avail, key=lambda s: abs(s - args.seed_base))
            seed_warnings.append((t["id"], args.seed_base, use_seed))
        usid = f"{use_seed:04d}"
        color, top = t["meta"]["color"], t["meta"]["top"]
        base = f"{color}-{top}-s{usid}"
        new_imgs = [{
            "id": f"{base}-{img['method']}",
            "method": img["method"],
            "url": re.sub(r'seed_\d+\.png', f'seed_{usid}.png', img["url"]),
        } for img in t["images"]]
        out_tasks.append({
            "id": base,
            "meta": {**t["meta"], "seed": use_seed},
            "prompt": t["prompt"],
            "images": new_imgs,
        })

    out_path = rel(args.out)
    json.dump({"tasks": out_tasks}, open(out_path, "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    print(f"Zapisano {len(out_tasks)} zestawow do {out_path} (seed bazowy {args.seed_base})")
    if seed_warnings:
        print(f"\nUWAGA: {len(seed_warnings)} kombinacji bez seeda {args.seed_base}, uzyto najblizszego:")
        for cid, want, got in seed_warnings:
            print(f"  {cid}: chciano {want}, uzyto {got}")

if __name__ == "__main__":
    main()
