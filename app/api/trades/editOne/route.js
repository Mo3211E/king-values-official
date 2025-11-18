// app/api/trades/editOne/route.js
import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { authFromHeaders } from "../../../../lib/auth";

export async function PATCH(req) {
  try {
    const auth = authFromHeaders(req.headers);

    if (!auth) {
      return NextResponse.json(
        { error: "Not logged in." },
        { status: 401 }
      );
    }

    let body = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { tradeId, description, player1, player2 } = body;

    if (!tradeId) {
      return NextResponse.json(
        { error: "Trade ID required." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("avvalues");
    const { ObjectId } = await import("mongodb");

    // Only update fields that were included
    const updateDoc = {};

    if (typeof description === "string") {
      updateDoc.description = description.slice(0, 200);
    }

    // Optional advanced editing: updating unit lists
    if (Array.isArray(player1)) updateDoc.player1 = player1;
    if (Array.isArray(player2)) updateDoc.player2 = player2;

    // If units were updated, recalc totals & verdict
    if (Array.isArray(player1) || Array.isArray(player2)) {
      const toNumber = (v) => {
        const s = String(v ?? "").toLowerCase();
        if (s.includes("owner")) return Infinity;
        const n = Number(s.replace(/,/g, ""));
        return Number.isFinite(n) ? n : 0;
      };

      const p1Total = Array.isArray(player1)
        ? player1.reduce((s, u) => s + toNumber(u.Value), 0)
        : undefined;

      const p2Total = Array.isArray(player2)
        ? player2.reduce((s, u) => s + toNumber(u.Value), 0)
        : undefined;

      if (typeof p1Total === "number") updateDoc.p1Total = p1Total;
      if (typeof p2Total === "number") updateDoc.p2Total = p2Total;

      // Recompute verdict
      if (
        typeof p1Total === "number" &&
        typeof p2Total === "number"
      ) {
        let verdict = "Fair Trade";
        if (p1Total !== p2Total) {
          verdict =
            p1Total < p2Total ? "Win for Advertiser" : "Loss for Advertiser";
        }
        updateDoc.verdict = verdict;
      }
    }

    // Perform update only if the trade belongs to the user
    const result = await db.collection("trades").updateOne(
      {
        _id: new ObjectId(tradeId),
        ownerId: auth.accountId,
      },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          error: "Trade not found or you are not authorized.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/trades/editOne error:", err);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}
