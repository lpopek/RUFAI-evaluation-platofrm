import { getDb } from './_db.js';

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const col = db.collection('results');

    if (req.method === 'GET') {
      const results = await col.find({}, { projection: { _id: 0 } })
        .sort({ savedAt: 1 })
        .toArray();
      res.status(200).json({ count: results.length, results });
      return;
    }

    if (req.method === 'POST') {
      const b = req.body;
      if (!b || !b.taskId || !b.rater || !b.scores || !b.ranking) {
        res.status(400).json({ error: 'Wymagane pola: taskId, rater, scores, ranking' });
        return;
      }
      const doc = {
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
      await col.insertOne(doc);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
}