import { MongoClient, Db } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoDb: Db | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

function createClient(): MongoClient {
  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 0,
    maxIdleTimeMS: 60000,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    retryWrites: true,
    retryReads: true,
  });
  return client;
}

async function connectClient(client: MongoClient): Promise<MongoClient> {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    return client;
  } catch (error) {
    await client.close().catch(() => {});
    throw error;
  }
}

export async function getMongoClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = createClient();
      global._mongoClientPromise = connectClient(client);
    }
    return global._mongoClientPromise;
  }

  if (!global._mongoClientPromise) {
    const client = createClient();
    global._mongoClientPromise = connectClient(client);
  }

  try {
    const client = await global._mongoClientPromise;
    await client.db("admin").command({ ping: 1 });
    return client;
  } catch {
    const client = createClient();
    global._mongoClientPromise = connectClient(client);
    return global._mongoClientPromise;
  }
}

export async function getDb(): Promise<Db> {
  if (process.env.NODE_ENV === "development" && global._mongoDb) {
    try {
      await global._mongoDb.command({ ping: 1 });
      return global._mongoDb;
    } catch {
      global._mongoDb = undefined;
    }
  }

  const client = await getMongoClient();
  const db = client.db("salonBook");

  if (process.env.NODE_ENV === "development") {
    global._mongoDb = db;
  }

  return db;
}

export async function closeMongoClient(): Promise<void> {
  if (global._mongoClientPromise) {
    const client = await global._mongoClientPromise;
    await client.close();
    global._mongoClientPromise = undefined;
    global._mongoDb = undefined;
  }
}