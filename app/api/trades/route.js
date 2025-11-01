// route.js
import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb.js"; // <- adjust path if needed

// ---------------- SETTINGS ----------------
const DB_NAME = "avvalues";
const TRADES = "trades";
const RATE = "rate_limits";

const WINDOW_24H_MS = 24 * 60 * 60 * 1000;
const PER_MINUTE_MAX = 60; // global minute cap per fingerprint (lenient)
const PER_HOUR_MAX = 600;  // global hour cap per fingerprint (lenient)

// Strict IP-only caps (hard to bypass)
const IP_MINUTE_LIMIT = 5;
const IP_HOUR_LIMIT = 50;

// duplicate/content guard
const DUP_WINDOW_MS = 6 * 60 * 60 * 1000; // 6 hours
const DUP_LIMIT = 3; // same content >=3 in 6 hours -> block

// username limits
const MAX_DISCORD_LEN = 64;
const MAX_ROBLOX_LEN = 20;

// ----------------- helpers -----------------
function cleanStr(s = "") {
  return String(s || "").trim();
}

// Roblox: allow alphanumeric + underscore, no spaces
function validateRoblox(name = "") {
  if (!name) return false;
  if (name.length > MAX_ROBLOX_LEN) return false;
  // no spaces allowed
  if (/\s/.test(name)) return false;
  // allow letters (any case), numbers, underscore, dot, hyphen
  return /^[A-Za-z0-9_.-]+$/.test(name);
}

// Discord: any trimmed string up to MAX length (front-end already encourages "username#tag")
// We only trim and cap length here.
function validateDiscord(name = "") {
  if (!name) return false;
  const s = String(name).trim();
  return s.length > 0 && s.length <= MAX_DISCORD_LEN;
}

// Make a fingerprint from ip + ua (server-side)
function makeFingerprint(ip = "", ua = "") {
  return `${ip}_${(ua || "").slice(0, 140)}`; // UA trimmed to avoid huge strings
}

// Return normalized players arrays (ensure names exist)
function normalizePlayers(arr = []) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((u) => {
      if (!u) return null;
      const Name = cleanStr(u.Name || u.name || u.Name || "");
      const Id = cleanStr(u.Id || u.id || "");
      return Name ? { Name, Id } : null;
    })
    .filter(Boolean);
}

// create title from player names (keeps current style)
function titleFor(p1, p2) {
  const p1n = (p1 || []).slice(0, 6).map((x) => x.Name).join(", ");
  const p2n = (p2 || []).slice(0, 6).map((x) => x.Name).join(", ");
  if (!p1n && !p2n) return "Untitled trade";
  return `${p1n || "—"} FOR ${p2n || "—"}`;
}

// simple deep equal for name lists (used for self-trade)
function namesSignature(list = []) {
  return (list || [])
    .map((u) => (u.Name || "").toLowerCase())
    .filter(Boolean)
    .sort()
    .join("|");
}

// ----------------- DB index helpers -----------------
async function ensureIndexes(db) {
  // Safe to call multiple times
  try {
    await db.collection(TRADES).createIndex({ title: 1, description: 1 }, { name: "title_description_idx" });
    await db.collection(TRADES).createIndex({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60, name: "ttl_createdAt_7d" });
    // rate_limits for buckets + TTL
    await db.collection(RATE).createIndex({ ip: 1, ua: 1, bucket: 1 }, { name: "rate_bucket_idx" });
    await db.collection(RATE).createIndex({ createdAt: 1 }, { expireAfterSeconds: 2 * 24 * 60 * 60, name: "ttl_rate_2d" });
  } catch (e) {
    // index creation should not block operations; log for debugging
    console.error("ensureIndexes error:", e?.message || e);
  }
}

// ----------------- Throttle function (hardening) -----------------
async function throttle(db, fingerprint, ip, ua) {
  const rate = db.collection(RATE);
  const now = Date.now();

  const minuteBucket = Math.floor(now / 60000);
  const hourBucket = Math.floor(now / 3600000);

  // fingerprint-based
  const minuteKey = { id: fingerprint, bucket: `m:${minuteBucket}` };
  const hourKey = { id: fingerprint, bucket: `h:${hourBucket}` };

  // ip-only keys
  const ipMinuteKey = { id: ip, bucket: `ipm:${minuteBucket}` };
  const ipHourKey = { id: ip, bucket: `iph:${hourBucket}` };

  const bulk = [
    {
      updateOne: {
        filter: minuteKey,
        update: { $setOnInsert: { createdAt: new Date(), ua }, $inc: { count: 1 } },
        upsert: true,
      },
    },
    {
      updateOne: {
        filter: hourKey,
        update: { $setOnInsert: { createdAt: new Date(), ua }, $inc: { count: 1 } },
        upsert: true,
      },
    },
    {
      updateOne: {
        filter: ipMinuteKey,
        update: { $setOnInsert: { createdAt: new Date() }, $inc: { count: 1 } },
        upsert: true,
      },
    },
    {
      updateOne: {
        filter: ipHourKey,
        update: { $setOnInsert: { createdAt: new Date() }, $inc: { count: 1 } },
        upsert: true,
      },
    },
  ];

  try {
    await rate.bulkWrite(bulk, { ordered: false });
  } catch (e) {
    // non-fatal
  }

  // read counts
  const [mDoc, hDoc, ipMDoc, ipHDoc] = await Promise.all([
    rate.findOne(minuteKey, { projection: { count: 1 } }),
    rate.findOne(hourKey, { projection: { count: 1 } }),
    rate.findOne(ipMinuteKey, { projection: { count: 1 } }),
    rate.findOne(ipHourKey, { projection: { count: 1 } }),
  ]);

  // check fingerprint caps
  if ((mDoc?.count ?? 0) > PER_MINUTE_MAX) return { ok: false, code: 429, msg: "Too many requests (minute cap)." };
  if ((hDoc?.count ?? 0) > PER_HOUR_MAX) return { ok: false, code: 429, msg: "Too many requests (hour cap)." };

  // ip-only strict caps
  if ((ipMDoc?.count ?? 0) > IP_MINUTE_LIMIT) return { ok: false, code: 429, msg: "Too many requests from this IP (minute)." };
  if ((ipHDoc?.count ?? 0) > IP_HOUR_LIMIT) return { ok: false, code: 429, msg: "Too many requests from this IP (hour)." };

  return { ok: true };
}

// ----------------- API handlers -----------------

/*
// Optional lockdown mode (set SITE_LOCKDOWN="true" in env to disable GET/POST)
if (process.env.SITE_LOCKDOWN === "true") {
  export async function GET() {
    return new Response("Trade Hub temporarily offline for maintenance.", { status: 503 });
  }
  export async function POST() {
    return new Response("Trade Hub temporarily offline for maintenance.", { status: 503 });
  }
  export async function DELETE() {
    return new Response("Trade Hub temporarily offline for maintenance.", { status: 503 });
  }
}
  */
// GET - list recent trades (basic)
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await ensureIndexes(db);

    // --- Validate units before inserting trade ---
const unitsCollection = db.collection("units");

// Helper function to verify and normalize units
async function validateUnit(unitName) {
  if (!unitName) throw new Error("Unit name missing");
  const match = await unitsCollection.findOne({ Name: unitName });
  if (!match) throw new Error(`Invalid or unknown unit: ${unitName}`);
  // Return canonical Name and Value to ensure perfect matching
  return {
    Name: match.Name,
    Value: Number(match.Value ?? 0),
  };
}

// Replace raw user-provided unit arrays with verified data
const validatedPlayer1 = await Promise.all(player1.map(async (u) => await validateUnit(u.Name)));
const validatedPlayer2 = await Promise.all(player2.map(async (u) => await validateUnit(u.Name)));

// Reassign the validated arrays
player1.splice(0, player1.length, ...validatedPlayer1);
player2.splice(0, player2.length, ...validatedPlayer2);


    const q = new URL(req.url).searchParams;
    const limit = Math.min(100, Number(q.get("limit") || 50));
    const skip = Math.max(0, Number(q.get("skip") || 0));

    const docs = await db
      .collection(TRADES)
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({ success: true, data: docs });
  } catch (err) {
    console.error("GET /api/trades error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - create a trade (with hardening)
export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });

    // gather request meta
let ip = (req.headers.get("x-forwarded-for") || "").split(",").shift()?.trim();
if (!ip || ip === "") ip = req.headers.get("x-real-ip");
if (!ip || ip === "") ip = req.ip || "0.0.0.0";
    const ua = req.headers.get("user-agent") || "";
    const fingerprint = makeFingerprint(ip, ua);

    const discordRaw = cleanStr(body.discord || "");
    const robloxRaw = cleanStr(body.roblox || "");
    const description = cleanStr(body.description || "");
    const player1Raw = Array.isArray(body.player1) ? body.player1 : [];
    const player2Raw = Array.isArray(body.player2) ? body.player2 : [];

    // require at least one contact (discord OR roblox)
    const hasDiscord = discordRaw.length > 0;
    const hasRoblox = robloxRaw.length > 0;
    if (!hasDiscord && !hasRoblox) {
      return NextResponse.json({ error: "Either Discord or Roblox username is required." }, { status: 400 });
    }

    // server-side validation
    if (hasDiscord && !validateDiscord(discordRaw)) {
      return NextResponse.json({ error: "Discord username invalid or too long." }, { status: 400 });
    }
    if (hasRoblox && !validateRoblox(robloxRaw)) {
      return NextResponse.json({ error: "Roblox username invalid. No spaces allowed." }, { status: 400 });
    }

    // normalize players
    const player1 = normalizePlayers(player1Raw);
    const player2 = normalizePlayers(player2Raw);

    // must have at least one unit on each side
    if (!player1.length || !player2.length) {
      return NextResponse.json({ error: "Add units/items to both offering and looking-for fields." }, { status: 400 });
    }

    // create title
    const title = cleanStr(body.title || titleFor(player1, player2));

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await ensureIndexes(db);

    // run throttle
    const guard = await throttle(db, fingerprint, ip, ua);
    if (!guard.ok) return NextResponse.json({ error: guard.msg }, { status: guard.code });

    // 2-per-24h rule enforced by BOTH fingerprint and IP
    const since = new Date(Date.now() - WINDOW_24H_MS);

    const recentByFingerprint = await db.collection(TRADES).countDocuments({
      fingerprint,
      createdAt: { $gte: since },
    });

    const recentByIp = await db.collection(TRADES).countDocuments({
      ip,
      createdAt: { $gte: since },
    });

    const MAX_TRADES_PER_WINDOW = 2;
    if (recentByFingerprint >= MAX_TRADES_PER_WINDOW || recentByIp >= MAX_TRADES_PER_WINDOW) {
      // compute first timestamp of relevant set to tell wait time
      const oldest = await db
        .collection(TRADES)
        .find({
          $or: [{ fingerprint }, { ip }],
          createdAt: { $gte: since },
        })
        .sort({ createdAt: 1 })
        .limit(1)
        .toArray();

      const firstTime = oldest[0]?.createdAt?.getTime() || Date.now();
      const waitMs = firstTime + WINDOW_24H_MS - Date.now();
      if (waitMs > 0) {
        const hours = Math.max(0, Math.floor(waitMs / 3600000));
        const mins = Math.max(0, Math.floor((waitMs % 3600000) / 60000));
        return NextResponse.json(
          { error: `Limit reached. Try again in ~${hours}h ${mins}m.` },
          { status: 429 }
        );
      }
    }

    // duplicate content guard (blocks same content posted many times in recent window)
    const dupWindow = new Date(Date.now() - DUP_WINDOW_MS);
    const dupCount = await db.collection(TRADES).countDocuments({
      title,
      "player1.0": { $exists: true },
      "player2.0": { $exists: true },
      createdAt: { $gte: dupWindow },
    });

    if (dupCount >= DUP_LIMIT) {
      return NextResponse.json({ error: "Duplicate trade spam detected." }, { status: 429 });
    }

    // self-trade guard: compare name lists signatures
    const p1sig = namesSignature(player1);
    const p2sig = namesSignature(player2);
    if (p1sig && p1sig === p2sig) {
      return NextResponse.json({ error: "Cannot trade the same items for the same items." }, { status: 400 });
    }
// block mirrored trades (offering/looking swapped)
const mirrorExists = await db.collection(TRADES).countDocuments({
  "player1.Name": { $in: player2.map(u => u.Name) },
  "player2.Name": { $in: player1.map(u => u.Name) },
  createdAt: { $gte: since },
});
if (mirrorExists > 0) {
  return NextResponse.json({ error: "Mirror/self trade detected (same items swapped)." }, { status: 400 });
}

// block exact duplicate title by same fingerprint within 24h
const dupSameTitle = await db.collection(TRADES).countDocuments({
  fingerprint,
  title,
  createdAt: { $gte: since },
});
if (dupSameTitle > 0) {
  return NextResponse.json({ error: "Duplicate trade detected." }, { status: 429 });
}

    // Weekly user limit check (max 14 trades per user/discord/roblox)
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const userFilters = [{ fingerprint }, { ip }];
if (hasDiscord) userFilters.push({ discord: discordRaw });
if (hasRoblox) userFilters.push({ roblox: robloxRaw });

if (userFilters.length > 0) {
  const userTradeCount = await db.collection(TRADES).countDocuments({
    createdAt: { $gte: weekAgo },
    $or: userFilters,
  });

  const MAX_WEEKLY_TRADES = 14;
  const RESUME_THRESHOLD = 12;

  if (userTradeCount >= MAX_WEEKLY_TRADES) {
    return NextResponse.json({
      error: `User trade limit reached (${userTradeCount} active). You can post again once your active trades drop below ${RESUME_THRESHOLD}.`,
    }, { status: 429 });
  }
}

    // build doc (store the provided discord/roblox raw values)
    // re-cast unit values as numbers (prevents "Value: N/A")
    const doc = {
      title,
      description,
      player1,
      player2,
   p1Total: Number(body.p1Total ?? 0),
p2Total: Number(body.p2Total ?? 0),
      verdict: cleanStr(body.verdict || ""),
      discord: hasDiscord ? discordRaw.slice(0, MAX_DISCORD_LEN) : "",
      roblox: hasRoblox ? robloxRaw.slice(0, MAX_ROBLOX_LEN) : "",
      ip,
      ua: ua.slice(0, 200),
      fingerprint,
      createdAt: new Date(),
    };

    const ins = await db.collection(TRADES).insertOne(doc);

    return NextResponse.json({ success: true, id: ins.insertedId, doc });
  } catch (err) {
    console.error("POST /api/trades error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE - admin only, deletes all trades
export async function DELETE(req) {
  try {
    const adminKeyHeader = req.headers.get ? req.headers.get("x-admin-key") : null;
    const adminKeyEnv = process.env.ADMIN_KEY || "";
    if (!adminKeyHeader || adminKeyHeader !== adminKeyEnv) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // delete all trades and rate limits (admin action)
    await db.collection(TRADES).deleteMany({});
    await db.collection(RATE).deleteMany({});

    return NextResponse.json({ success: true, deletedAll: true });
  } catch (err) {
    console.error("DELETE /api/trades error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
