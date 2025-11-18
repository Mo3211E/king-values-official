import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = { maxPoolSize: 10 };

if (!uri) throw new Error("⚠️ Missing MONGODB_URI in .env.local");

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // reuse the same client during hot reloads in dev
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// 👇 Default export required by Next.js API routes
export default clientPromise;
