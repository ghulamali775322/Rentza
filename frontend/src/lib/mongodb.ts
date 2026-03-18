// src/lib/mongodb.ts
import { MongoClient } from "mongodb";

if (!process.env.MONGO_URI) {
  throw new Error("Please define MONGO_URI in .env");
}

const client = new MongoClient(process.env.MONGO_URI);
const clientPromise = client.connect();

export default clientPromise;
