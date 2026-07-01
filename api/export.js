import { getDb } from './_db.js';

// Endpoint dostępny WYŁĄCZNIE dla badacza — wymaga tajnego klucza.
// Nie jest linkowany ani widoczny nigdzie w interfejsie aplikacji.
// Użycie: GET /api/export?key=TWOJ_SEKRET  (lub nagłówek x-export-key)

function toCsv(rows) {
  if (!rows.length) return '';
  const header = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [header.join(',')];
  for (const r of rows) lines.push(header.map((h) => esc(r[h])).join(','));
  return lines.join('\n');
}

export default async function handler(req, res) {
  const expected = process.env.EXPORT_SECRET;
  const provided = req.query.key || req.headers['x-export-key'];

  if (!expected) {
    res.status(500).json({ error: 'Brak skonfigurowanego EXPORT_SECRET na serwerze' });
    return;
  }
  if (!provided || provided !== expected) {
    res.status(401).json({ error: 'Brak dostępu — nieprawidłowy lub brakujący klucz' });
    return;
  }

  try {
    const db = await getDb();
    const docs = await db.collection('results').find({}).sort({ savedAt: 1 }).toArray();

    const rows = [];
    for (const d of docs) {
      const base = {
        type: d.type,
        taskId: d.taskId,
        rater: d.rater,
        sessionId: d.sessionId,
        participant_age: d.participant?.age ?? '',
        participant_gender: d.participant?.gender ?? '',
        participant_exp: d.participant?.exp ?? '',
        lang: d.lang,
        savedAt: d.savedAt,
      };
      for (const [imgId, mos] of Object.entries(d.scores || {})) {
        rows.push({ ...base, imgId, mos, rank: d.ranking?.[imgId] ?? '' });
      }
    }

    const format = req.query.format || 'csv';
    if (format === 'json') {
      res.status(200).json({ count: docs.length, results: docs });
      return;
    }

    const csv = toCsv(rows);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="wyniki.csv"');
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
}