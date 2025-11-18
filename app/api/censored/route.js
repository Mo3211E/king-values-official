import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("avvalues");
    const collection = db.collection("censored_words");
    const words = await collection.find({}).toArray();
    return NextResponse.json({ success: true, words });
  } catch (err) {
    console.error("Fetch censored words error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { word } = await req.json();
    if (!word || !word.trim()) {
      return NextResponse.json(
        { error: "Word required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("avvalues");
    const collection = db.collection("censored_words");

    await collection.updateOne(
      { word: word.toLowerCase() },
      { $set: { word: word.toLowerCase() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Add censored word error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
