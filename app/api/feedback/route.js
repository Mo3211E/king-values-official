import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

/* ---------------------------- GET (view feedbacks) ---------------------------- */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("avvalues");
    const collection = db.collection("units");

    const units = await collection
      .find({
        $or: [
          { "votes.up": { $gt: 0 } },
          { "votes.down": { $gt: 0 } },
          { feedbacks: { $exists: true, $ne: [] } },
        ],
      })
      .project({ name: 1, votes: 1, feedbacks: 1, _id: 0 })
      .toArray();

    const formatted = units.map((unit) => {
      const upVotes = unit.votes?.up || 0;
      const downVotes = unit.votes?.down || 0;

      const upFeedbacks = unit.feedbacks
        ? unit.feedbacks
            .filter((f) => f.type === "up" && f.reason && f.reason.trim() !== "")
            .map((f) => f.reason)
        : [];

      const downFeedbacks = unit.feedbacks
        ? unit.feedbacks
            .filter((f) => f.type === "down" && f.reason && f.reason.trim() !== "")
            .map((f) => f.reason)
        : [];

      return {
        title: `Unit Name: ${unit.name || "(Unnamed)"} - ${upVotes} Up, ${downVotes} Down`,
        explanations: {
          up: upFeedbacks.length > 0 ? upFeedbacks : ["(No written reasons provided)"],
          down: downFeedbacks.length > 0 ? downFeedbacks : ["(No written reasons provided)"],
        },
      };
    });

    formatted.sort((a, b) => {
      const totalA =
        parseInt(a.title.match(/(\d+) Up/)[1]) +
        parseInt(a.title.match(/(\d+) Down/)[1]);
      const totalB =
        parseInt(b.title.match(/(\d+) Up/)[1]) +
        parseInt(b.title.match(/(\d+) Down/)[1]);
      return totalB - totalA;
    });

    return NextResponse.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    console.error("Feedback fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ---------------------------- DELETE (clear all feedback) ---------------------------- */
export async function DELETE() {
  try {
    const client = await clientPromise;
    const db = client.db("avvalues");
    const collection = db.collection("units");

    // Reset votes and feedbacks on all units
    const result = await collection.updateMany(
      {},
      {
        $set: {
          votes: { up: 0, down: 0 },
          feedbacks: [],
        },
      }
    );

    // Optional: also clear IP logs if you’re using vote_logs
    const logs = db.collection("vote_logs");
    await logs.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Cleared all feedback and reset votes on ${result.modifiedCount} units.`,
    });
  } catch (err) {
    console.error("Feedback clear error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
