import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb.js";

/* ------------------ LOCKDOWN MODE ------------------
if (process.env.SITE_LOCKDOWN === "true") {
  export async function GET() {
    return new Response("Trade Hub temporarily offline for maintenance.", { status: 503 });
  }
  export async function POST() {
    return new Response("Trade Hub temporarily offline for maintenance.", { status: 503 });
  }
}
*/
/** ----------------- SETTINGS ----------------- **/
const DB_NAME = "avvalues";
const TRADES = "trades";
const RATE = "rate_limits";

// Anti-abuse caps
const PER_MINUTE_MAX = 3;     // hard throttle per IP+UA
const PER_HOUR_MAX   = 10;     // hard throttle per IP+UA

// Your rule: 2 posts in a window anchored at the first post within 24h
const MAX_TRADES_PER_WINDOW = 2;
const WINDOW_24H_MS = 24 * 60 * 60 * 1000;

/** Get IP (works local, Vercel, proxies) */
function getIp(req) {
  const xf = req.headers.get("x-forwarded-for") || "";
  const ip = xf.split(",")[0]?.trim();
  return ip || "unknown";
}

/** Small helper to create needed indexes (runs lazily, harmless if exists) */
async function ensureIndexes(db) {
  const trades = db.collection(TRADES);
  const rate   = db.collection(RATE);

  // Search / duplicate checks
  await trades.createIndex({ title: 1, description: 1 });
  // TTL auto-delete after 7 days (1 week)
  await trades.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 7 * 24 * 60 * 60, name: "ttl_createdAt_7d" }
  );

  // Rate-limit docs auto-expire after 2 days
  await rate.createIndex(
    { ip: 1, ua: 1, bucket: 1, createdAt: 1 },
    { name: "rate_bucket" }
  );
  await rate.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 2 * 24 * 60 * 60, name: "ttl_rate_2d" }
  );
}

/** Hard throttle using per-minute & per-hour “buckets” */
async function throttle(db, id, ua) {
  const rate = db.collection(RATE);
  const now = Date.now();

  const minuteBucket = Math.floor(now / 60000);
  const hourBucket   = Math.floor(now / 3600000);

  const minuteKey = { id, ua, bucket: `m:${minuteBucket}` };
  const hourKey   = { id, ua, bucket: `h:${hourBucket}` };

  const ops = [
    {
      updateOne: {
        filter: minuteKey,
        update: { $setOnInsert: { createdAt: new Date() }, $inc: { count: 1 } },
        upsert: true,
      },
    },
    {
      updateOne: {
        filter: hourKey,
        update: { $setOnInsert: { createdAt: new Date() }, $inc: { count: 1 } },
        upsert: true,
      },
    },
  ];
  await rate.bulkWrite(ops, { ordered: false });

  const [mDoc, hDoc] = await Promise.all([
    rate.findOne(minuteKey, { projection: { count: 1 } }),
    rate.findOne(hourKey,   { projection: { count: 1 } }),
  ]);

  if ((mDoc?.count ?? 0) > PER_MINUTE_MAX) {
    return { ok: false, code: 429, msg: "Too many requests (minute cap)." };
  }
  if ((hDoc?.count ?? 0) > PER_HOUR_MAX) {
    return { ok: false, code: 429, msg: "Too many requests (hour cap)." };
  }
  // If same UA sends >15 requests/hour total, block regardless of IP
const uaCount = await rate.countDocuments({ ua, bucket: { $regex: "^h:" } });
if (uaCount > 15) {
  return { ok:false, code:429, msg:"Too many requests from this client signature." };
}
  return { ok: true };
}

/** -------- GET: list trades (lightweight) -------- */
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await ensureIndexes(db);

    const trades = db.collection(TRADES);

    const search = req.nextUrl.searchParams.get("search") || "";
    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const projection = {
      title: 1,
      description: 1,
      verdict: 1,
      p1Total: 1,
      p2Total: 1,
      discord: 1,
      roblox: 1,
      player1: 1,
      player2: 1,
      createdAt: 1,
    };

    const results = await trades
      .find(query, { projection })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ success: true, results });
    await new Promise(r => setTimeout(r, 100 + Math.random() * 300));
  } catch (err) {
    console.error("GET /api/trades error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** -------- POST: create a trade --------
 *  Anyone can post. Limits:
 *   - Hard throttle (minute/hour) against floods
 *   - Business rule: 2 trades per window anchored at first post within 24h
 */
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await ensureIndexes(db);

    const ip = getIp(req);
    const ua = (req.headers.get("user-agent") || "unknown").slice(0, 200);
    const fingerprint = ip + "_" + ua; // unified identifier for anti-VPN flood protection

    // Hard-rate-limit to stop floods/raids
    const guard = await throttle(db, fingerprint, ua);
    if (!guard.ok) {
      return NextResponse.json({ error: guard.msg }, { status: guard.code });
    }

    const body = await req.json();
    const {
      title = "",
      description = "",
      player1 = [],
      player2 = [],
      p1Total = 0,
      p2Total = 0,
      verdict = "",
      discord = "",
      roblox = "",
    } = body || {};

// ---------- Strong validation ----------
if (!Array.isArray(player1) || !Array.isArray(player2)) {
  return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
}

// must have at least one unit in EACH side
if (player1.length === 0 || player2.length === 0) {
  return NextResponse.json({ error: "Add units/items to both fields." }, { status: 400 });
}

// reject trades missing both Discord & Roblox
if (!discord.trim() && !roblox.trim()) {
  return NextResponse.json({ error: "Missing Required Fields — enter Discord or Roblox username." }, { status: 400 });
}

// reject nonsense placeholders / too-short text
if (title.trim().length < 5 || title === description) {
  return NextResponse.json({ error: "Invalid or duplicate title." }, { status: 400 });
}

// reject trades that look like single-character spam
const joined = [title, description, discord, roblox].join("");
if (/^[aA\s]*$/.test(joined) || joined.length < 10) {
  return NextResponse.json({ error: "Trade content too short or spam-like." }, { status: 400 });
}

    if (typeof title !== "string" || title.trim().length < 3) {
      // auto-title is fine; just ensure not empty junk
      return NextResponse.json({ error: "Invalid title." }, { status: 400 });
    }

    const trades = db.collection(TRADES);

    // ----- Your 2-per-window-in-24h rule (anchored at first) -----
    const since = new Date(Date.now() - WINDOW_24H_MS);
    const recent = await trades
      .find({ fingerprint, createdAt: { $gte: since } }, { projection: { createdAt: 1 } })
      .sort({ createdAt: 1 }) // oldest first
      .toArray();

    if (recent.length >= MAX_TRADES_PER_WINDOW) {
      const first = recent[0].createdAt.getTime();
      const waitMs = first + WINDOW_24H_MS - Date.now();
      if (waitMs > 0) {
        const hours = Math.max(0, Math.floor(waitMs / 3600000));
        const mins  = Math.max(0, Math.floor((waitMs % 3600000) / 60000));
        return NextResponse.json(
          { error: `Limit reached. Try again in ~${hours}h ${mins}m.` },
          { status: 429 }
        );
      }
      // If we’re here, the oldest is past 24h → allow again (even if second is still <24h)
    }

    // Optional duplicate guard (same title + description)
    const dup = await trades.findOne({ fingerprint, title: title.trim(), description: description.trim() });
    if (dup) {
      return NextResponse.json({ error: "Duplicate trade already exists." }, { status: 409 });
    }

    const doc = {
      ip,
      ua,
      fingerprint,
      title: title.trim(),
      description: (description || "").trim().slice(0, 200),
      player1,
      player2,
      p1Total: Number(p1Total) || 0,
      p2Total: Number(p2Total) || 0,
      verdict: (verdict || "").slice(0, 60),
      discord: (discord || "").slice(0, 32),
      roblox: (roblox || "").slice(0, 20),
      createdAt: new Date(), // drives the 7-day TTL index
    };

    const result = await trades.insertOne(doc);
    return NextResponse.json({ success: true, trade: { _id: result.insertedId, ...doc } });
  } catch (err) {
    console.error("POST /api/trades error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** -------- DELETE: admin clean (keep admin-key here only) -------- */
export async function DELETE(req) {
  try {
    const ADMIN_KEY = process.env.ADMIN_KEY || "";
    const key = req.headers.get("x-admin-key");
    if (!ADMIN_KEY || key !== ADMIN_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const trades = db.collection(TRADES);

    const r = await trades.deleteMany({});
    return NextResponse.json({ success: true, deleted: r.deletedCount });
  } catch (err) {
    console.error("DELETE /api/trades error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
