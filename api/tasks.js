import tasks from '../data/tasks.json' assert { type: 'json' };

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  res.status(200).json(tasks);
}
