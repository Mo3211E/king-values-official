// app/api/trades/deleteOne/route.js
import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { authFromHeaders } from "../../../../lib/auth";

export async function DELETE(req) {
  try {
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

    const client = await clientPromise;
    const db = client.db("avvalues");
    const { ObjectId } = await import("mongodb");

    // Must match user on ownerId
    const result = await db.collection("trades").deleteOne({
      _id: new ObjectId(tradeId),
      ownerId: auth.accountId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Not found or unauthorized." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/trades/deleteOne error:", err);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}
