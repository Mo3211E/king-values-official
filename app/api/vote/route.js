import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

// Limit in minutes between votes from the same IP for the same unit
const VOTE_COOLDOWN_MINUTES = 10080;

export async function POST(req) {
  try {
    const { unitId, voteType, reason } = await req.json();
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!unitId || !voteType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    if (!["up", "down"].includes(voteType)) {
      return NextResponse.json(
        { error: "Invalid vote type" },
        { status: 400 }
      );
    }

    const feedback = reason && reason.trim() !== "" ? reason.trim() : null;
    if (feedback && feedback.split(/\s+/).length > 30) {
      return NextResponse.json(
        { error: "Reason must be 30 words or fewer." },
        { status: 400 }
      );
    }

    // Connect to Mongo
    const client = await clientPromise;
    const db = client.db("avvalues");
    const units = db.collection("units");
    const logs = db.collection("vote_logs");

    // --- Check IP limit ---
    const now = new Date();
    const recentVote = await logs.findOne({
      unitId,
      ip,
      createdAt: { $gt: new Date(now.getTime() - VOTE_COOLDOWN_MINUTES * 60000) },
    });

    if (recentVote) {
      return NextResponse.json(
        {
          error: `You can only vote once`,
        },
        { status: 429 }
      );
    }

    // --- Log the vote attempt ---
    await logs.insertOne({
      unitId,
      ip,
      createdAt: now,
      voteType,
      reason: feedback,
    });

    // --- Prepare filter (supports ObjectId or name) ---
    const filter = ObjectId.isValid(unitId)
      ? { _id: new ObjectId(unitId) }
      : { name: unitId };

    // --- Safe update using aggregation pipeline ---
    const result = await units.updateOne(
      filter,
      [
        {
          $set: {
            votes: {
              up: { $ifNull: ["$votes.up", 0] },
              down: { $ifNull: ["$votes.down", 0] },
            },
            feedbacks: { $ifNull: ["$feedbacks", []] },
          },
        },
        {
          $set: {
            [`votes.${voteType}`]: {
              $add: [`$votes.${voteType}`, 1],
            },
          },
        },
        ...(feedback
          ? [
              {
                $set: {
                  feedbacks: {
                    $concatArrays: [
                      { $ifNull: ["$feedbacks", []] },
                      [
                        {
                          type: voteType,
                          reason: feedback,
                          date: now,
                          ip,
                        },
                      ],
                    ],
                  },
                },
              },
            ]
          : []),
      ],
      { upsert: true }
    );

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("Vote API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
