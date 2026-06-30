import { readFile } from 'fs/promises';
import { join } from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const file = join(process.cwd(), 'data', 'tasks.json');
    const raw = await readFile(file, 'utf-8');
    res.status(200).json(JSON.parse(raw));
  } catch (err) {
    res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
}