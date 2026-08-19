import { getDb } from './_db.js';

export default async function handler(req, res) {
  try {
    // Walidacja POST PRZED polaczeniem z baza — tanie odrzucenie smieci.
    if (req.method === 'POST') {
      const b = req.body;
      if (!b || !b.taskId || !b.rater || !b.scores || !b.ranking) {
        res.status(400).json({ error: 'Wymagane pola: taskId, rater, scores, ranking' });
        return;
      }
      // Odrzuc zgloszenie bez ZADNEJ oceny MOS (min. jedna ocena > 0).
      const mosValues = Object.values(b.scores || {}).filter((v) => Number(v) > 0);
      if (mosValues.length === 0) {
        res.status(400).json({ error: 'Zgloszenie musi zawierac co najmniej jedna ocene MOS' });
        return;
      }
    }

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

      // Atomowy, inkrementalny numer zgloszenia. findOneAndUpdate z upsert
      // gwarantuje unikalnosc nawet przy rownoleglych zapisach.
      const counters = db.collection('counters');
      const counterDoc = await counters.findOneAndUpdate(
        { _id: 'submissionSeq' },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: 'after' }
      );
      let submissionId = counterDoc?.value?.seq ?? counterDoc?.seq;
      if (submissionId == null) {
        const fresh = await counters.findOne({ _id: 'submissionSeq' });
        submissionId = fresh?.seq ?? 1;
      }

      const doc = {
        submissionId,
        type: b.type || 'evaluation',
        taskId: b.taskId,
        rater: b.rater,
        sessionId: b.sessionId || null,
        participant: b.participant || null,
        lang: b.lang || null,
        scores: b.scores,
        ranking: b.ranking,
        promptMatch: b.promptMatch ?? null,
        wouldBuy: b.wouldBuy ?? null,
        savedAt: new Date().toISOString(),
      };
      await col.insertOne(doc);
      res.status(200).json({ ok: true, submissionId });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
}