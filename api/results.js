import { kv } from '@vercel/kv';

// Wyniki w Vercel KV pod listą "results".
// Każdy wpis to komplet ocen jednej trójki od jednego uczestnika:
// MOS dla 3 grafik + ranking + metryczka uczestnika (doklejana do każdego wpisu).

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const raw = await kv.lrange('results', 0, -1);
      const results = (raw || []).map((r) => (typeof r === 'string' ? JSON.parse(r) : r));
      res.status(200).json({ count: results.length, results });
      return;
    }

    if (req.method === 'POST') {
      const b = req.body;
      if (!b || !b.taskId || !b.rater || !b.scores || !b.ranking) {
        res.status(400).json({ error: 'Wymagane pola: taskId, rater, scores, ranking' });
        return;
      }
      const entry = {
        type: b.type || 'evaluation',
        taskId: b.taskId,
        rater: b.rater,
        sessionId: b.sessionId || null,
        participant: b.participant || null,
        lang: b.lang || null,
        scores: b.scores,
        ranking: b.ranking,
        savedAt: new Date().toISOString(),
      };
      await kv.rpush('results', JSON.stringify(entry));
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
}
