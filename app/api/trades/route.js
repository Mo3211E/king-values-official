// app/api/trades/route.js
import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb.js"; // path: app/api/trades -> lib/

// ---------------- SETTINGS ----------------
const DB_NAME = "avvalues";
const TRADES = "trades";
const RATE = "rate_limits";

const WINDOW_24H_MS = 24 * 60 * 60 * 1000;
const PER_MINUTE_MAX = 60; // fingerprint minute cap (lenient)
const PER_HOUR_MAX = 600;  // fingerprint hour cap (lenient)

// Strict IP-only caps (hard to bypass)
const IP_MINUTE_LIMIT = 5;
const IP_HOUR_LIMIT = 50;

// duplicate/content guard
const DUP_WINDOW_MS = 6 * 60 * 60 * 1000; // 6 hours
const DUP_LIMIT = 3; // same content >=3 in 6 hours -> block

// username limits
const MAX_DISCORD_LEN = 64;
const MAX_ROBLOX_LEN = 20;

// logged-in / guest limits
const GUEST_MAX_WEEKLY_TRADES = 14;   // guests: 14 trades per rolling 7 days
const GUEST_RESUME_THRESHOLD = 12;    // when below this, they can post again
const LOGGED_MAX_ACTIVE_TRADES = 20;  // logged-in users: 20 active, never expire

// ----------------- helpers -----------------
function cleanStr(s = "") {
  return String(s || "").trim();
}

// Roblox: allow alphanumeric + underscore/dot/hyphen, no spaces
function validateRoblox(name = "") {
  if (!name) return false;
  if (name.length > MAX_ROBLOX_LEN) return false;
  if (/\s/.test(name)) return false;
  return /^[A-Za-z0-9_.-]+$/.test(name);
}

// Discord: any trimmed string up to MAX length
function validateDiscord(name = "") {
  if (!name) return false;
  const s = String(name).trim();
  return s.length > 0 && s.length <= MAX_DISCORD_LEN;
}

// Make a fingerprint from ip + ua (server-side)
function makeFingerprint(ip = "", ua = "") {
  return `${ip}_${(ua || "").slice(0, 140)}`;
}

// Return normalized players arrays (ensure names exist)
function normalizePlayers(arr = []) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((u) => {
      if (!u) return null;
      const Name = cleanStr(u.Name || u.name || "");
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

// simple signature for self-trade detection
function namesSignature(list = []) {
  return (list || [])
    .map((u) => (u.Name || "").toLowerCase())
    .filter(Boolean)
    .sort()
    .join("|");
}

// ----------------- DB index helpers -----------------
async function ensureIndexes(db) {
  const trades = db.collection(TRADES);
  const rate = db.collection(RATE);

  try {
    await trades.createIndex(
      { title: 1, description: 1 },
      { name: "title_desc", background: true }
    );
  } catch (_) {}

  // ✅ TTL only for GUEST trades (no ownerId). Logged-in trades never expire.
  try {
    await trades.createIndex(
      { createdAt: 1 },
      {
        expireAfterSeconds: 7 * 24 * 60 * 60,
        name: "ttl_7d_guests",
        background: true,
        partialFilterExpression: { ownerId: { $exists: false } },
      }
    );
  } catch (_) {}

  try {
    await rate.createIndex(
      { id: 1, bucket: 1 },
      { name: "rate_bucket", background: true }
    );
  } catch (_) {}
  try {
    await rate.createIndex(
      { createdAt: 1 },
      {
        expireAfterSeconds: 2 * 24 * 60 * 60,
        name: "ttl_rate_2d",
        background: true,
      }
    );
  } catch (_) {}
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
        update: {
          $setOnInsert: { createdAt: new Date(), ua },
          $inc: { count: 1 },
        },
        upsert: true,
      },
    },
    {
      updateOne: {
        filter: hourKey,
        update: {
          $setOnInsert: { createdAt: new Date(), ua },
          $inc: { count: 1 },
        },
        upsert: true,
      },
    },
    {
      updateOne: {
        filter: ipMinuteKey,
        update: {
          $setOnInsert: { createdAt: new Date() },
          $inc: { count: 1 },
        },
        upsert: true,
      },
    },
    {
      updateOne: {
        filter: ipHourKey,
        update: {
          $setOnInsert: { createdAt: new Date() },
          $inc: { count: 1 },
        },
        upsert: true,
      },
    },
  ];

  try {
    await rate.bulkWrite(bulk, { ordered: false });
  } catch {
    // non-fatal
  }

  const [mDoc, hDoc, ipMDoc, ipHDoc] = await Promise.all([
    rate.findOne(minuteKey, { projection: { count: 1 } }),
    rate.findOne(hourKey, { projection: { count: 1 } }),
    rate.findOne(ipMinuteKey, { projection: { count: 1 } }),
    rate.findOne(ipHourKey, { projection: { count: 1 } }),
  ]);

  if ((mDoc?.count ?? 0) > PER_MINUTE_MAX)
    return { ok: false, code: 429, msg: "Too many requests (minute cap)." };
  if ((hDoc?.count ?? 0) > PER_HOUR_MAX)
    return { ok: false, code: 429, msg: "Too many requests (hour cap)." };

  if ((ipMDoc?.count ?? 0) > IP_MINUTE_LIMIT)
    return {
      ok: false,
      code: 429,
      msg: "Too many requests from this IP (minute).",
    };
  if ((ipHDoc?.count ?? 0) > IP_HOUR_LIMIT)
    return {
      ok: false,
      code: 429,
      msg: "Too many requests from this IP (hour).",
    };

  if ((ipMDoc?.count ?? 0) > IP_MINUTE_LIMIT - 1) {
    console.warn("⚠️ Possible bot near-limit:", ip);
  }

  return { ok: true };
}

// ----------------- API: GET -----------------
export async function GET(req) {
  try {
    const url = new URL(req.url);
    // remove forced limit → allow full collection
  const limit = Number(url.searchParams.get("limit") || 20000);
    const skip = Math.max(0, Number(url.searchParams.get("skip") || 0));
    const q = (url.searchParams.get("search") || "").trim().toLowerCase();
    const ownerId = (url.searchParams.get("ownerId") || "").trim();

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    // ✅ for "Manage Ads" – fetch only the logged-in user's trades
    if (ownerId) {
      filter.ownerId = ownerId;
    }

    const docs = await db
      .collection(TRADES)
      .find(filter, {
        projection: { ip: 0, ua: 0, fingerprint: 0 },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({ success: true, data: docs });
  } catch (err) {
    console.error("GET /api/trades error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ----------------- API: POST -----------------
export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body)
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await ensureIndexes(db);

    // request meta
    let ip =
      (req.headers.get("x-forwarded-for") || "")
        .split(",")
        .shift()
        ?.trim() ||
      req.headers.get("x-real-ip") ||
      "0.0.0.0";
    const ua = req.headers.get("user-agent") || "";
    const fingerprint = makeFingerprint(ip, ua);

    // ✅ account info for logged-in Discord users (set by frontend after OAuth)
    const accountId = cleanStr(body.accountId || "");       // discord user id
    const accountName = cleanStr(body.accountName || "");   // discord username
    const accountType = cleanStr(body.accountType || "");   // "discord"
    const isLoggedIn =
      accountType.toLowerCase() === "discord" && !!accountId;

    const discordRaw = cleanStr(body.discord || "");
    const robloxRaw = cleanStr(body.roblox || "");
    const description = cleanStr(body.description || "");
    const player1Raw = Array.isArray(body.player1) ? body.player1 : [];
    const player2Raw = Array.isArray(body.player2) ? body.player2 : [];

    // need at least one contact
    const hasDiscord = discordRaw.length > 0;
    const hasRoblox = robloxRaw.length > 0;
    if (!hasDiscord && !hasRoblox) {
      return NextResponse.json(
        { error: "Either Discord or Roblox username is required." },
        { status: 400 }
      );
    }

    // validate usernames
    if (hasDiscord && !validateDiscord(discordRaw)) {
      return NextResponse.json(
        { error: "Discord username invalid or too long." },
        { status: 400 }
      );
    }
    if (hasRoblox && !validateRoblox(robloxRaw)) {
      return NextResponse.json(
        { error: "Roblox username invalid. No spaces allowed." },
        { status: 400 }
      );
    }

  // normalize units from client — KEEP TradeRole
function normalizeWithRole(arr = []) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((u) => {
      if (!u) return null;
      const Name = cleanStr(u.Name || "");
      const Id = cleanStr(u.Id || "");
      const TradeRole = cleanStr(u.TradeRole || "offer").toLowerCase();

      // Special meta cards
      if (["offers", "upgrades", "downgrades", "bundles", "gamepasses"].includes(Name.toLowerCase())) {
        return { Name, Id, TradeRole, isSpecial: true };
      }

      // NORMAL UNITS MUST RETURN SOMETHING (this is what was missing)
      return { Name, Id, TradeRole };
    })
    .filter(Boolean);
}


const player1 = normalizeWithRole(player1Raw);
const player2 = normalizeWithRole(player2Raw);


    // verify & hydrate from Mongo 'units' (force numeric Value, include Image)
    const unitsCollection = db.collection("units");

    async function verifyAndHydrate(unitsArr) {
      const out = [];
      for (const u of unitsArr) {
  // ⭐ Skip MongoDB lookup for special meta cards
  if (u.isSpecial) {
    out.push({
      Name: u.Name,
      Value: 0,
      Category: "Special",
      "In Game Name": "",
      Image: "",
      Demand: "",
      ShinyType: "",
      TradeRole: u.TradeRole || "offer",
    });
    continue;
  }
        // Escape special regex chars in unit names like ( ) ~ [ ] + * ?
        const safeName = u.Name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const match = await unitsCollection.findOne(
          { Name: { $regex: `^${safeName}$`, $options: "i" } },
          {
            projection: {
              Name: 1,
              Value: 1,
              Category: 1,
              "In Game Name": 1,
              Image: 1,
              Demand: 1,
              ShinyType: 1,
            },
          }
        );
        if (!match)
          return {
            ok: false,
            msg: `Invalid or unknown unit: ${u.Name}`,
          };

out.push({
  Name: match.Name,
  Value: Number(match.Value ?? 0),
  Category: match.Category ?? "",
  "In Game Name": match["In Game Name"] ?? "",
  Image: match.Image || "",
  Demand: match.Demand ?? "",
  ShinyType: match.ShinyType ?? "",
  TradeRole: u.TradeRole || "offer", // 👈 preserve role
});
      }
      return { ok: true, list: out };
    }

    const p1Check = await verifyAndHydrate(player1);
    if (!p1Check.ok)
      return NextResponse.json({ error: p1Check.msg }, { status: 400 });
    const p2Check = await verifyAndHydrate(player2);
    if (!p2Check.ok)
      return NextResponse.json({ error: p2Check.msg }, { status: 400 });

    const player1Verified = p1Check.list;
    const player2Verified = p2Check.list;

    // server-authoritative totals
    const p1TotalServer = player1Verified.reduce(
      (s, u) => s + (Number(u.Value) || 0),
      0
    );
    const p2TotalServer = player2Verified.reduce(
      (s, u) => s + (Number(u.Value) || 0),
      0
    );

// must have at least one REAL unit total (across both sides)
// but allow trades where one side is ONLY meta cards
const realP1 = player1Verified.filter(u => !u.Category?.toLowerCase().includes("special"));
const realP2 = player2Verified.filter(u => !u.Category?.toLowerCase().includes("special"));

if (realP1.length === 0 && realP2.length === 0) {
  return NextResponse.json(
    { error: "Add at least one real unit to the trade." },
    { status: 400 }
  );
}

    // prevent mirror/self trades
    const p1sig = namesSignature(player1Verified);
    const p2sig = namesSignature(player2Verified);
    if (p1sig && p1sig === p2sig) {
      return NextResponse.json(
        { error: "Cannot trade the same items for the same items." },
        { status: 400 }
      );
    }

    const since24h = new Date(Date.now() - WINDOW_24H_MS);

    const mirrorExists = await db.collection(TRADES).countDocuments({
      "player1.Name": { $in: player2Verified.map((u) => u.Name) },
      "player2.Name": { $in: player1Verified.map((u) => u.Name) },
      createdAt: { $gte: since24h },
    });
    if (mirrorExists > 0) {
      return NextResponse.json(
        { error: "Mirror/self trade detected (same items swapped)." },
        { status: 400 }
      );
    }

    // title
    const title = cleanStr(
      body.title || titleFor(player1Verified, player2Verified)
    );

    // rate limits (fingerprint + IP)
    const guard = await throttle(db, fingerprint, ip, ua);
    if (!guard.ok)
      return NextResponse.json(
        { error: guard.msg },
        { status: guard.code }
      );

    // 2 per 24h across fingerprint/IP (kept for anti-bot, applies to everyone)
    const recentByFingerprint = await db.collection(TRADES).countDocuments({
      fingerprint,
      createdAt: { $gte: since24h },
    });
    const recentByIp = await db.collection(TRADES).countDocuments({
      ip,
      createdAt: { $gte: since24h },
    });

    const MAX_TRADES_PER_WINDOW = 2;
    if (
      recentByFingerprint >= MAX_TRADES_PER_WINDOW ||
      recentByIp >= MAX_TRADES_PER_WINDOW
    ) {
      const oldest = await db
        .collection(TRADES)
        .find({
          $or: [{ fingerprint }, { ip }],
          createdAt: { $gte: since24h },
        })
        .sort({ createdAt: 1 })
        .limit(1)
        .toArray();

      // createdAt could be Date or string from old docs — normalize safely
      const firstTime = new Date(
        oldest[0]?.createdAt || Date.now()
      ).getTime();
      const waitMs = firstTime + WINDOW_24H_MS - Date.now();
      if (waitMs > 0) {
        const hours = Math.max(0, Math.floor(waitMs / 3600000));
        const mins = Math.max(
          0,
          Math.floor((waitMs % 3600000) / 60000)
        );
        return NextResponse.json(
          {
            error: `Limit reached. Try again in ~${hours}h ${mins}m.`,
          },
          { status: 429 }
        );
      }
    }

    // duplicate content guard in the last DUP_WINDOW_MS
    const dupWindow = new Date(Date.now() - DUP_WINDOW_MS);
    const dupCount = await db.collection(TRADES).countDocuments({
      title,
      "player1.0": { $exists: true },
      "player2.0": { $exists: true },
      createdAt: { $gte: dupWindow },
    });
    if (dupCount >= DUP_LIMIT) {
      return NextResponse.json(
        { error: "Duplicate trade spam detected." },
        { status: 429 }
      );
    }

    // block exact duplicate title by same fingerprint within 24h
    const dupSameTitle = await db.collection(TRADES).countDocuments({
      fingerprint,
      title,
      createdAt: { $gte: since24h },
    });
    if (dupSameTitle > 0) {
      return NextResponse.json(
        { error: "Duplicate trade detected." },
        { status: 429 }
      );
    }

    // ✅ Guest vs Logged-in limits
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    if (isLoggedIn) {
      // Logged-in Discord user: up to 20 ACTIVE trades, never expire.
      const activeCount = await db.collection(TRADES).countDocuments({
        ownerId: accountId,
      });

      if (activeCount >= LOGGED_MAX_ACTIVE_TRADES) {
        return NextResponse.json(
          {
            error: `You have reached the maximum of ${LOGGED_MAX_ACTIVE_TRADES} active trade ads.`,
          },
          { status: 429 }
        );
      }
    } else {
      // Guest logic: 14 trades per rolling 7-day window
      const userFilters = [{ fingerprint }, { ip }];
      if (hasDiscord) userFilters.push({ discord: discordRaw });
      if (hasRoblox) userFilters.push({ roblox: robloxRaw });

      if (userFilters.length > 0) {
        const userTradeCount = await db
          .collection(TRADES)
          .countDocuments({
            createdAt: { $gte: weekAgo },
            $or: userFilters,
          });

        if (userTradeCount >= GUEST_MAX_WEEKLY_TRADES) {
          return NextResponse.json(
            {
              error: `User trade limit reached (${userTradeCount} in the last 7 days). You can post again once your active trades drop below ${GUEST_RESUME_THRESHOLD}.`,
            },
            { status: 429 }
          );
        }
      }
    }

    // verdict
    const verdict =
      p1TotalServer === p2TotalServer
        ? "Fair Trade"
        : p1TotalServer < p2TotalServer
        ? "Win for Advertiser"
        : "Loss for Advertiser";

    const doc = {
      title,
      description,
      player1: player1Verified,
      player2: player2Verified,
      p1Total: p1TotalServer,
      p2Total: p2TotalServer,
      verdict,
      discord: hasDiscord ? discordRaw.slice(0, MAX_DISCORD_LEN) : "",
      roblox: hasRoblox ? robloxRaw.slice(0, MAX_ROBLOX_LEN) : "",
      ip,
      ua: ua.slice(0, 200),
      fingerprint,
      createdAt: new Date(),

      // ✅ ownership fields for Manage Ads + non-expiring logged-in trades
      ownerId: isLoggedIn ? accountId : undefined,
      ownerName: isLoggedIn ? accountName : "",
      accountType: isLoggedIn ? accountType.toLowerCase() : "",
    };

    const ins = await db.collection(TRADES).insertOne(doc);
    return NextResponse.json({ success: true, id: ins.insertedId, doc });
  } catch (err) {
    console.error("POST /api/trades error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ----------------- API: DELETE (admin) -----------------
export async function DELETE(req) {
  try {
    const adminKeyHeader = req.headers.get
      ? req.headers.get("x-admin-key")
      : null;
    const adminKeyEnv = process.env.ADMIN_KEY || "";
    if (!adminKeyHeader || adminKeyHeader !== adminKeyEnv) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    await db.collection(TRADES).deleteMany({});
    await db.collection(RATE).deleteMany({});

    return NextResponse.json({ success: true, deletedAll: true });
  } catch (err) {
    console.error("DELETE /api/trades error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
