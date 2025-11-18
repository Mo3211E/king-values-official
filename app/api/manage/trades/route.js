// app/api/manage/trades/route.js
import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { authFromHeaders } from "../../../../lib/auth";

const DB_NAME = "avvalues";
const TRADES = "trades";

const MAX_ACTIVE = 20; // active slots for logged-in users

// ------------------------------------
// GET — return all active trades for logged-in user
// ------------------------------------
export async function GET(req) {
  const auth = authFromHeaders(req.headers);

  if (!auth) {
    return NextResponse.json(
      { error: "Not logged in." },
      { status: 401 }
    );
  }

  const accountId = auth.accountId;

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const trades = await db
      .collection(TRADES)
      .find(
        { ownerId: accountId },
        { projection: { ip: 0, ua: 0, fingerprint: 0 } }
      )
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      trades,
      active: trades.length,
      maxActive: MAX_ACTIVE,
      remaining: Math.max(0, MAX_ACTIVE - trades.length),
    });
  } catch (err) {
    console.error("GET /api/manage/trades error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// ------------------------------------
// DELETE — delete ONE of the user's trades
// ------------------------------------
export async function DELETE(req) {
  const auth = authFromHeaders(req.headers);

  if (!auth) {
    return NextResponse.json(
      { error: "Not logged in." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const tradeId = searchParams.get("id");

  if (!tradeId) {
    return NextResponse.json(
      { error: "Trade ID required." },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const { ObjectId } = await import("mongodb");

    const result = await db.collection(TRADES).deleteOne({
      _id: new ObjectId(tradeId),
      ownerId: auth.accountId, // ensure user owns this trade
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Trade not found or unauthorized." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/manage/trades error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// ------------------------------------
// PATCH — edit trade description
// ------------------------------------
export async function PATCH(req) {
  const auth = authFromHeaders(req.headers);

  if (!auth) {
    return NextResponse.json(
      { error: "Not logged in." },
      { status: 401 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { tradeId, description } = body;

  if (!tradeId) {
    return NextResponse.json(
      { error: "Trade ID required." },
      { status: 400 }
    );
  }

  const safeDesc = String(description || "").slice(0, 200);

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const { ObjectId } = await import("mongodb");

    const result = await db.collection(TRADES).updateOne(
      {
        _id: new ObjectId(tradeId),
        ownerId: auth.accountId,
      },
      { $set: { description: safeDesc } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Trade not found or unauthorized." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/manage/trades error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
