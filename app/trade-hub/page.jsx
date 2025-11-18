"use client";

import { useState, useMemo, useEffect } from "react";
import GalaxyBackground from "../components/GalaxyBackground";
import CompactUnitCard, {
  TradeBoardUnitCard,
} from "../components/CompactUnitCard";
import TradePickerModal from "../components/TradePickerModal";

function toNumber(v) {
  const s = String(v ?? "").toLowerCase();

  // text Owner's Choice → Infinity
  if (s.includes("owner")) return Infinity;

  // remove commas and parse number
  const n = Number(s.replace(/,/g, ""));
  if (!Number.isFinite(n)) return 0;

  // old sentinel "highest number" → also treat as Infinity
  if (n >= 1_000_000_000_000) return Infinity;

  return n;
}

export default function TradeHub() {
  const [ads, setAds] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [description, setDescription] = useState("");
  const [discord, setDiscord] = useState("");
  const [roblox, setRoblox] = useState("");
  const [discordValid, setDiscordValid] = useState(true);
  const [robloxValid, setRobloxValid] = useState(true);

  // Trade sides (player1 = You, player2 = Other Player)
  const [player1, setPlayer1] = useState([]); // units with optional TradeRole
  const [player2, setPlayer2] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searchOffer, setSearchOffer] = useState("");
  const [searchLooking, setSearchLooking] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorActive, setErrorActive] = useState(false);
  const [advVerdictFilter, setAdvVerdictFilter] = useState("");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSide, setPickerSide] = useState("you"); // "you" | "other"

  const [loggedIn, setLoggedIn] = useState(false);

  // Totals
  const p1Total = useMemo(
    () => player1.reduce((s, u) => s + toNumber(u.Value), 0),
    [player1]
  );
  const p2Total = useMemo(
    () => player2.reduce((s, u) => s + toNumber(u.Value), 0),
    [player2]
  );

  // Verdict (live line between boxes)
  const liveVerdict = useMemo(() => {
    if (p1Total === Infinity && p2Total === Infinity) return "Fair (N/A)";
    if (p1Total === Infinity) return "Loss (N/A)";
    if (p2Total === Infinity) return "Win (N/A)";

    if (p1Total === p2Total) return "Fair (0)";
    if (p1Total < p2Total)
      return `Win (${(p2Total - p1Total).toLocaleString()})`;
    return `Loss (${(p1Total - p2Total).toLocaleString()})`;
  }, [p1Total, p2Total]);

  // Auto-generated trade title
  const generatedTitle = useMemo(() => {
    const you = player1.map((u) => u.Name).join(", ");
    const them = player2.map((u) => u.Name).join(", ");
    if (!you && !them) return "";
    return `${you || "?"} FOR ${them || "?"}`;
  }, [player1, player2]);

  // Check if user is logged in (via manage route)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await res.json();

        if (data?.user?.id) {
          window.session = data;
          setLoggedIn(true);

          // Autofill and lock Discord username
          if (data.user.username) {
            setDiscord(data.user.username);
          }
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
    })();
  }, []);

  async function startThreadForTrade(ad) {
    try {
      if (!window.session?.user?.id) {
        alert("You must be logged in with Discord to start a trade chat.");
        return;
      }

      const res = await fetch("/api/trades/start-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trade: ad,
          viewerDiscordId: window.session.user.id,
          viewerDiscordName: window.session.user.username,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        console.error("start-thread error:", data);
        alert(data.error || "Failed to create trade chat.");
        return;
      }

      // Optional: open Discord web thread link in new tab
      if (data.link) {
        window.open(data.link, "_blank");
      } else {
        alert("Trade chat created! Check your Discord DMs.");
      }
    } catch (err) {
      console.error("startThreadForTrade error:", err);
      alert("Error creating trade chat. Please try again.");
    }
  }

  // Load trades
async function loadTrades() {
  setLoading(true);
  try {
    const res = await fetch(`/api/trades`, { cache: "no-store" });
    const data = await res.json();
    if (data.success) {
      setAds(data.data);
    }
  } catch (err) {
    console.error("Failed to load trades:", err);
  } finally {
    setLoading(false);
  }
}


useEffect(() => {
  loadTrades();
}, []);

  // Post new trade
  const postTrade = async () => {
    setErrorMsg("");
    setErrorActive(false);

    if (!player1.length || !player2.length) {
      setErrorMsg("Add units/items to both sides of the trade.");
      setErrorActive(true);
      return;
    }

    if (!discord.trim() && !roblox.trim()) {
      setErrorMsg("Missing Required Fields — enter Discord or Roblox username.");
      setErrorActive(true);
      return;
    }

    const newAd = {
      title: generatedTitle,
      description,
      player1,
      player2,
      p1Total,
      p2Total,
      verdict: liveVerdict,
      discord,
      roblox,
      accountId: window.session?.user?.id || "",
      accountName: window.session?.user?.username || "",
      accountType: "discord",
    };

    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAd),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.error?.includes("Limit reached")) {
          setErrorMsg(data.error);
        } else if (data.error?.includes("Add units")) {
          setErrorMsg("Add units/items to both sides of the trade.");
        } else if (data.error?.includes("Invalid trade")) {
          setErrorMsg("Missing Required Fields — please check inputs.");
        } else {
          setErrorMsg(data.error || "An unexpected error occurred.");
        }
        setErrorActive(true);
        return;
      }

      // Success
      setAds((prev) => [data.doc, ...prev]);
      setDescription("");
      setPlayer1([]);
      setPlayer2([]);
      setDiscord("");
      setRoblox("");
      setErrorMsg("");
      setErrorActive(false);
    } catch (err) {
      console.error("Post trade failed:", err);
      setErrorMsg(err?.message || "Server unreachable — please try again later.");
      setErrorActive(true);
    }
  };

  // Filter posted trades by OFFERING / LOOKING FOR searches
  const filteredAds = ads.filter((ad) => {
    const offerQuery = searchOffer.toLowerCase();
    const lookQuery = searchLooking.toLowerCase();

    const matchesOffer =
      !offerQuery ||
      ad.player1?.some((u) => {
        const name = u.Name?.toLowerCase() || "";
        const inGame = u["In Game Name"]?.toLowerCase() || "";
        return name.includes(offerQuery) || inGame.includes(offerQuery);
      });

    const matchesLooking =
      !lookQuery ||
      ad.player2?.some((u) => {
        const name = u.Name?.toLowerCase() || "";
        const inGame = u["In Game Name"]?.toLowerCase() || "";
        return name.includes(lookQuery) || inGame.includes(lookQuery);
      });

    let matchesVerdict = true;

    if (advVerdictFilter === "win") {
      matchesVerdict = ad.verdict.startsWith("Win");
    } else if (advVerdictFilter === "loss") {
      matchesVerdict = ad.verdict.startsWith("Loss");
    }

    return matchesOffer && matchesLooking && matchesVerdict;

  });

  // Remove unit from builder
  const removeFromSide = (side, index) => {
    if (side === "you") {
      setPlayer1((prev) => prev.filter((_, i) => i !== index));
    } else {
      setPlayer2((prev) => prev.filter((_, i) => i !== index));
    }
  };

const TRADES_PER_PAGE = 48;

const totalPages = Math.ceil(filteredAds.length / TRADES_PER_PAGE);

const paginatedAds = useMemo(() => {
  const start = (page - 1) * TRADES_PER_PAGE;
  return filteredAds.slice(start, start + TRADES_PER_PAGE);
}, [filteredAds, page]);


  return (
    <main className="relative min-h-screen text-white overflow-visible">
      <GalaxyBackground />
      {/* Crystal clean login panel */}
      <div className="fixed right-4 top-20 md:top-24 z-40">
        <div
          className="rounded-2xl px-5 py-4 w-72 shadow-lg border"
          style={{
            background: "rgba(22,10,50,0.72)",
            borderColor: "rgba(185,140,255,0.7)",
            boxShadow:
              "0 0 24px rgba(180,130,255,0.45), inset 0 0 14px rgba(210,170,255,0.25)",
            backdropFilter: "blur(14px)",
          }}

        >
          <div className="flex flex-col gap-3 text-center">

            {/* MODE BADGE */}
            <span
              className="px-4 py-1.5 rounded-full font-bold text-sm tracking-wide mx-auto"
              style={{
                background: loggedIn
                  ? "linear-gradient(90deg, #8affc1, #45ff94)"
                  : "linear-gradient(90deg, #ffffff, #e1d8ff)",
                color: loggedIn ? "#003b1c" : "#200040",
                boxShadow: "0 0 10px rgba(255,255,255,0.25)",
              }}
            >
              {loggedIn ? "Member" : "Guest Mode"}
            </span>

            {/* LOGIN BUTTON — PRIMARY CTA */}
            {!loggedIn ? (
              <button
                onClick={() => (window.location.href = "/api/auth/discord/login")}
                className="px-4 py-2 rounded-xl font-bold text-sm mx-auto transition shadow-md"
                style={{
                  background:
                    "linear-gradient(90deg, #7f54ff, #ae64ff, #d874ff)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  boxShadow:
                    "0 0 14px rgba(140,100,255,0.35), inset 0 0 6px rgba(255,255,255,0.2)",
                }}
              >
                Login with Discord
              </button>
            ) : (
              <a
                href="/manage"
                className="px-4 py-2 rounded-xl font-bold text-sm mx-auto transition shadow-md"
                style={{
                  background:
                    "linear-gradient(90deg, #54ffa6, #78ffd1, #9afff0)",
                  color: "#002a1a",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                Manage Trades
              </a>
            )}

            {/* MESSAGE BELOW */}
            <p className="text-white/85 font-semibold text-[0.9rem] leading-snug mt-2">
              {loggedIn
                ? "Your trades never expire and can be edited anytime, inventory/wishlist coming soon"
                : "Log in and join the Discord server to directly message trade owners on this page, increase trade limits (14->20), and manage/edit trades,"}
            </p>
          </div>
        </div>
      </div>
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-visible">
        {/* Title */}
        <h1
          className="font-extrabold text-[3rem] sm:text-[3.5rem] md:text-[4rem] leading-tight mb-10 bg-clip-text text-transparent text-center mx-auto w-fit"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #c6a4ff, #f3b5ff, #b9b4ff, #c6a4ff)",
            backgroundSize: "300% 300%",
            animation: "titleGradient 12s ease-in-out infinite",
            textShadow:
              "0 0 40px rgba(198,164,255,0.35), 0 0 70px rgba(243,181,255,0.25)",
          }}
        >
          Trade Hub
        </h1>

        {/* Trade Builder Boxes */}
        <div className="flex flex-col md:flex-row items-start md:items-stretch justify-center gap-6 mb-4">
          {/* YOU BOX */}
          <div
            className="flex-1 rounded-2xl w-full text-left border shadow-xl p-4 sm:p-5 mx-auto"
            style={{
              background: "rgba(25,5,55,0.45)",
              borderColor: "rgba(160,120,255,0.5)",
              boxShadow:
                "0 0 18px rgba(160,120,255,0.35), inset 0 0 12px rgba(200,160,255,0.25)",
              backdropFilter: "blur(12px)",
            }}

          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-bold tracking-wide">
                Your Offer
              </h2>
              <p className="text-white/90 text-sm sm:text-base">
                Value:{" "}
                {p1Total === Infinity ? "∞" : p1Total.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 justify-items-center">
              {player1.map((u, i) => (
                <div key={`${u.Name}-${i}`} className="relative group">
                  <CompactUnitCard u={u} clickable={true} />
                  <button
                    onClick={() => removeFromSide("you", i)}
                    className="absolute top-[4px] right-[4px] bg-black/60 text-xs px-[6px] py-[2px] rounded-md border border-red-500/70 text-red-400 hover:text-white hover:border-red-400 hover:shadow-[0_0_12px_rgba(255,80,80,0.8)] transition z-50"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                onClick={() => {
                  setPickerSide("you");
                  setPickerOpen(true);
                }}
                className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-4xl sm:text-5xl transition grid place-items-center hover:scale-105"
                aria-label="Add unit to your side"
                style={{
                  background:
                    "radial-gradient(100% 100% at 30% 20%, rgba(120,80,255,0.35) 0%, rgba(80,40,160,0.25) 40%, rgba(0,0,0,0.6) 100%)",
                  border: "1px solid rgba(190,160,255,0.35)",
                  boxShadow: "0 0 22px rgba(160,120,255,0.25)",
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* OTHER BOX */}
          <div
            className="flex-1 rounded-2xl w-full text-left border shadow-xl p-4 sm:p-5 mx-auto"
            style={{
              background: "rgba(25,5,55,0.45)",
              borderColor: "rgba(160,120,255,0.5)",
              boxShadow:
                "0 0 18px rgba(160,120,255,0.35), inset 0 0 12px rgba(200,160,255,0.25)",
              backdropFilter: "blur(12px)",
            }}

          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-bold tracking-wide">
                Their Offer
              </h2>
              <p className="text-white/90 text-sm sm:text-base">
                Value:{" "}
                {p2Total === Infinity ? "∞" : p2Total.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 justify-items-center">
              {player2.map((u, i) => (
                <div key={`${u.Name}-${i}`} className="relative group">
                  <CompactUnitCard u={u} clickable={true} />
                  <button
                    onClick={() => removeFromSide("other", i)}
                    className="absolute top-[4px] right-[4px] bg-black/60 text-xs px-[6px] py-[2px] rounded-md border border-red-500/70 text-red-400 hover:text-white hover:border-red-400 hover:shadow-[0_0_12px_rgba(255,80,80,0.8)] transition z-50"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                onClick={() => {
                  setPickerSide("other");
                  setPickerOpen(true);
                }}
                className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-4xl sm:text-5xl transition grid place-items-center hover:scale-105"
                aria-label="Add unit to other side"
                style={{
                  background:
                    "radial-gradient(100% 100% at 30% 20%, rgba(120,80,255,0.35) 0%, rgba(80,40,160,0.25) 40%, rgba(0,0,0,0.6) 100%)",
                  border: "1px solid rgba(190,160,255,0.35)",
                  boxShadow: "0 0 22px rgba(160,120,255,0.25)",
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Live Verdict Row */}
        <div className="flex items-center justify-center gap-8 mb-8 text-center">
          <div className="text-2xl md:text-3xl font-extrabold w-1/3 text-right">
            You
          </div>
          <div className="w-1/3 text-center">
            <h2
              className={`text-2xl sm:text-3xl font-extrabold ${liveVerdict.startsWith("Fair")
                ? "text-gray-300"
                : liveVerdict.startsWith("Win")
                  ? "text-emerald-400"
                  : "text-red-500"
                }`}
              style={{
                textShadow: liveVerdict.startsWith("Fair")
                  ? "0 0 12px rgba(200,150,255,0.5)"
                  : liveVerdict.startsWith("Win")
                    ? "0 0 15px rgba(0,255,180,0.6)"
                    : "0 0 15px rgba(255,100,100,0.6)",
              }}
            >
              {liveVerdict}
            </h2>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold w-1/3 text-left">
            Other Player
          </div>
        </div>

        {/* Post Trade Section */}
        <div
          className={`rounded-2xl p-6 mb-10 shadow-2xl border transition-all ${errorActive ? "border-2 border-red-500" : ""
            }`}
          style={{
            background:
              "linear-gradient(180deg, rgba(20,0,40,0.65) 0%, rgba(3,0,15,0.8) 60%, rgba(0,0,0,0.85) 100%)",
            borderColor: "rgba(180,150,255,0.25)",
            boxShadow:
              "0 0 24px rgba(200,170,255,0.15), inset 0 0 8px rgba(160,120,255,0.12)",
            backdropFilter: "blur(6px)",
          }}
        >
          {/* Discord Username */}
          <input
            value={discord}
            disabled={loggedIn}
            onChange={(e) => {
              let value = e.target.value;
              const invalid = /[A-Z\s]/.test(value);
              value = value.toLowerCase().replace(/\s+/g, "");
              setDiscord(value.slice(0, 32));
              setDiscordValid(!invalid);
            }}
            placeholder="Discord Username and/or"
            maxLength={32}
            className={`w-full px-3 py-2 rounded-lg mb-3 outline-none text-white placeholder-white/60 transition-all ${discordValid ? "" : "border-red-500 bg-red-950/30"
              }`}
            style={{
              background: loggedIn
                ? "rgba(120,255,180,0.15)"
                : discordValid
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,100,100,0.08)",
              cursor: loggedIn ? "not-allowed" : "text",  // <-- ADDED
              opacity: loggedIn ? 0.65 : 1,                // <-- ADDED
              border: discordValid
                ? "1px solid rgba(190,160,255,0.35)"
                : "1px solid rgba(255,100,100,0.6)",
              boxShadow: discordValid
                ? "inset 0 0 8px rgba(160,120,255,0.12)"
                : "inset 0 0 6px rgba(255,80,80,0.2)"
            }}
          />

          {/* Roblox Username */}
          <input
            value={roblox}
            onChange={(e) => {
              let value = e.target.value;
              const invalid = /\s|[^a-zA-Z0-9_]/.test(value);
              value = value.replace(/[^a-zA-Z0-9_]/g, "");
              setRoblox(value.slice(0, 20));
              setRobloxValid(!invalid);
            }}
            placeholder="Roblox Username (to be contacted about the trade)"
            maxLength={20}
            className={`w-full px-3 py-2 rounded-lg mb-3 outline-none text-white placeholder-white/60 transition-all ${robloxValid ? "" : "border-red-500 bg-red-950/30"
              }`}
            style={{
              background: robloxValid
                ? "rgba(255,255,255,0.06)"
                : "rgba(255,100,100,0.08)",
              border: robloxValid
                ? "1px solid rgba(190,160,255,0.35)"
                : "1px solid rgba(255,100,100,0.6)",
              boxShadow: robloxValid
                ? "inset 0 0 8px rgba(160,120,255,0.12)"
                : "inset 0 0 6px rgba(255,80,80,0.2)",
            }}
          />

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a note or description..."
            rows="2"
            maxLength={100}
            className="w-full px-3 py-2 rounded-lg mb-3 outline-none text-white placeholder-white/60"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(190,160,255,0.35)",
              boxShadow: "inset 0 0 8px rgba(160,120,255,0.12)",
            }}
          />

          <div className="flex justify-center">
            <button
              onClick={postTrade}
              className="px-10 py-2 rounded-lg font-bold transition"
              style={{
                background:
                  "linear-gradient(90deg, rgba(150,90,255,0.5), rgba(230,150,255,0.45))",
                border: "1px solid rgba(190,160,255,0.35)",
                boxShadow:
                  "0 0 14px rgba(180,120,255,0.3), inset 0 0 8px rgba(180,120,255,0.2)",
              }}
            >
              Post Trade
            </button>
          </div>
          {errorActive && (
            <p className="text-red-400 font-semibold mt-3 text-center">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Dual Search Bars (Offering / Looking For) */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-8 text-center">
          <input
            value={searchOffer}
            onChange={(e) => {
  setSearchOffer(e.target.value);
  setPage(1);
}}
            placeholder="Search offerings..."
            className="flex-1 px-3 py-2 rounded-lg outline-none text-white placeholder-white/60 text-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(190,160,255,0.35)",
              boxShadow: "inset 0 0 8px rgba(160,120,255,0.12)",
            }}
          />

          <span
            className="animated-gold text-lg font-bold select-none"
            style={{ padding: "0 10px", whiteSpace: "nowrap" }}
          >
            FOR
          </span>

          <input
            value={searchLooking}
           onChange={(e) => {
  setSearchLooking(e.target.value);
  setPage(1);
}}

            placeholder="Search looking for..."
            className="flex-1 px-3 py-2 rounded-lg outline-none text-white placeholder-white/60 text-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(190,160,255,0.35)",
              boxShadow: "inset 0 0 8px rgba(160,120,255,0.12)",
            }}
          />
        </div>

<div className="flex justify-center mb-6">
  <div className="relative inline-block">
    <select
      value={advVerdictFilter}
      onChange={(e) => {
  setAdvVerdictFilter(e.target.value);
  setPage(1);
}}
      className="custom-select"
    >
      <option value="">All Trades</option>
      <option value="win">Win for Advertiser</option>
      <option value="loss">Loss for Advertiser</option>
    </select>

    {/* Fake arrow, like TradePicker */}
    <span className="select-arrow" aria-hidden="true">
      ▾
    </span>
  </div>
</div>



        {loading && (
          <p className="text-center text-violet-300 mb-4">
            Loading trades...
          </p>
        )}

        {/* Posted Trades — ULTRA COMPACT GRID (3 per row on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedAds.map((ad, i) => {
            const p1Units = ad.player1 || [];
            const p2Units = ad.player2 || [];

            return (
              <div
                key={i}
                className="rounded-2xl p-4 shadow-xl border flex flex-col h-full"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(20,0,40,0.65), rgba(0,0,0,0.9))",
                  borderColor: "rgba(180,150,255,0.25)",
                  boxShadow:
                    "0 0 18px rgba(200,170,255,0.15), inset 0 0 8px rgba(160,120,255,0.12)",
                }}
              >
                {/* HEADER: Title + Description tightly stacked */}
                <div>
                  <h3
                    className="text-sm sm:text-base font-bold mb-1 text-violet-200 line-clamp-2"
                    dangerouslySetInnerHTML={{
                      __html: (ad.title || "")
                        .replace(
                          /,/g,
                          '<span style="color:#c49eff;">,</span>'
                        )
                        .replace(
                          /\bFOR\b/gi,
                          '<span class="animated-gold"> FOR </span>'
                        ),
                    }}
                  />

                  {ad.description && (
                    <p className="mb-2 text-xs text-white/80 line-clamp-2">
                      {ad.description}
                    </p>
                  )}
                </div>

                {/* MIDDLE: Offering / Looking For grids */}
                <div className="flex gap-3 mt-1 mb-3 flex-1">
                  {/* OFFERING SIDE */}
                  <div className="flex-1 flex flex-col">
                    <p className="font-semibold text-pink-300 mb-1 text-xs">
                      Offering
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {p1Units.slice(0, 8).map((u, idx) => (
                        <TradeBoardUnitCard key={`p1-${idx}`} u={u} />
                      ))}
                    </div>
                    <p className="mt-1 text-[0.7rem] text-white/75">
                      Total:{" "}
                      {ad.p1Total === Infinity
                        ? "∞"
                        : Number(ad.p1Total || 0).toLocaleString()}
                    </p>
                  </div>

                  {/* LOOKING FOR SIDE */}
                  <div className="flex-1 flex flex-col">
                    <p className="font-semibold text-blue-300 mb-1 text-xs">
                      Looking For
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {p2Units.slice(0, 8).map((u, idx) => (
                        <TradeBoardUnitCard key={`p2-${idx}`} u={u} />
                      ))}
                    </div>
                    <p className="mt-1 text-[0.7rem] text-white/75">
                      Total:{" "}
                      {ad.p2Total === Infinity
                        ? "∞"
                        : Number(ad.p2Total || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* FOOTER: Verdict + usernames hugging date */}
                <div className="mt-auto pt-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[0.8rem] text-violet-300">
                      {ad.verdict}
                    </p>
                    {(ad.discord || ad.roblox) && (
                      <div className="text-[0.65rem] text-white/70 flex flex-col items-end gap-0.5">
                        {/* MESSAGE BUTTON LOGIC */}
                        {ad.accountId ? (
                          loggedIn ? (
                            window.session?.user?.id !== ad.accountId && (
                              <button
                                onClick={() => startThreadForTrade(ad)}
                                className="mt-2 bg-purple-500 px-3 py-1 rounded-lg text-white text-sm hover:bg-purple-600"
                              >
                                Message
                              </button>
                            )
                          ) : (
                            <button
                              onClick={() => (window.location.href = "/api/auth/discord/login")}
                              className="mt-2 bg-purple-500 px-3 py-1 rounded-lg text-white text-sm hover:bg-purple-600"
                            >
                              Login to Message
                            </button>
                          )
                        ) : null}

                        {ad.discord && <span>Discord: {ad.discord}</span>}
                        {ad.roblox && <span>Roblox: {ad.roblox}</span>}
                      </div>
                    )}
                  </div>

                  <p className="text-[0.6rem] text-white/50 mt-1">
                    Posted: {new Date(ad.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
<div className="flex justify-center gap-6 mt-10">
  {page > 1 && (
    <button
      onClick={() => setPage(page - 1)}
      className="px-6 py-2 rounded-xl font-bold border border-violet-300/40 bg-violet-500/10 transition hover:shadow-[0_0_18px_rgba(180,130,255,0.45)] hover:bg-violet-500/20"
    >
      Previous Page
    </button>
  )}

  {page < totalPages && (
    <button
      onClick={() => setPage(page + 1)}
      className="px-6 py-2 rounded-xl font-bold border border-violet-300/40 bg-violet-500/10 transition hover:shadow-[0_0_18px_rgba(180,130,255,0.45)] hover:bg-violet-500/20"
    >
      Next Page
    </button>
  )}
</div>

      </section>

      <style jsx global>{`
        @keyframes titleGradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animated-gold {
          background: linear-gradient(
            90deg,
            #ffe29f,
            #ffcc70,
            #fff4c2,
            #ffe29f
          );
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: goldShift 6s ease-in-out infinite;
          font-weight: 700;
          text-shadow: 0 0 10px rgba(255, 230, 180, 0.4);
        }

        @keyframes goldShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* --- TRADEPICKER-STYLE SELECT DROPDOWN --- */
.custom-select {
  appearance: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;

  background: rgba(30, 15, 65, 0.65);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(185, 140, 255, 0.35);
  border-radius: 12px;

  padding: 10px 14px;
  padding-right: 40px; /* space for caret */

  color: white;
  font-weight: 600;
  font-size: 0.95rem;

  box-shadow: 0 0 18px rgba(185, 140, 255, 0.25),
              inset 0 0 8px rgba(185, 140, 255, 0.18);

  transition: all 0.25s ease;
  cursor: pointer;
  outline: none;
  text-align: center;
}

/* Glow on hover */
.custom-select:hover {
  border-color: rgba(215, 175, 255, 0.8);
  box-shadow: 0 0 22px rgba(215, 175, 255, 0.45),
              inset 0 0 10px rgba(215, 175, 255, 0.25);
}

/* Remove default blue highlight */
.custom-select option {
  background: #0d001e !important;
  color: white !important;
}

.select-arrow {
  position: absolute;
  right: 18px;               /* Inside the pill */
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;

  font-size: 1.15rem;        /* Bigger arrow */
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);

  /* Soft neon look like your other UI */
  text-shadow:
    0 0 6px rgba(200, 150, 255, 0.6),
    0 0 12px rgba(200, 150, 255, 0.35);
}

      `}</style>

      {/* Trade Picker Modal */}
      {pickerOpen && (
        <TradePickerModal
          onClose={() => setPickerOpen(false)}
          onSelect={(unit) => {
            const withRole = unit; // TradeRole no longer used for board layout
            if (pickerSide === "you") {
              setPlayer1((prev) => [...prev, withRole]);
            } else {
              setPlayer2((prev) => [...prev, withRole]);
            }
            setPickerOpen(false);
          }}
        />
      )}
    </main>
  );
}
