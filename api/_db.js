import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'mos_eval';

let cached = global._mongo;
if (!cached) cached = global._mongo = { client: null, promise: null };

export async function getDb() {
  if (!uri) throw new Error('Brak zmiennej środowiskowej MONGODB_URI');

  if (cached.client) return cached.client.db(dbName);

  if (!cached.promise) {
    const client = new MongoClient(uri, { maxPoolSize: 5 });
    cached.promise = client.connect().then((c) => {
      cached.client = c;
      return c;
    });
  }
  await cached.promise;
  return cached.client.db(dbName);
}