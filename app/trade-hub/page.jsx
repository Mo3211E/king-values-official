"use client";
import { useState, useMemo, useEffect } from "react";
import TradeBox from "../components/TradeBox";
import GalaxyBackground from "../components/GalaxyBackground";
import CompactUnitCard from "../components/CompactUnitCard";

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function TradeHub() {
  const [ads, setAds] = useState([]);
  const [description, setDescription] = useState("");
  const [discord, setDiscord] = useState("");
  const [roblox, setRoblox] = useState("");
  const [discordValid, setDiscordValid] = useState(true);
  const [robloxValid, setRobloxValid] = useState(true);
  const [player1, setPlayer1] = useState([]);
  const [player2, setPlayer2] = useState([]);
  const [search] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchOffer, setSearchOffer] = useState("");
  const [searchLooking, setSearchLooking] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorActive, setErrorActive] = useState(false);


  const p1Total = useMemo(
    () => player1.reduce((s, u) => s + toNumber(u.Value), 0),
    [player1]
  );
  const p2Total = useMemo(
    () => player2.reduce((s, u) => s + toNumber(u.Value), 0),
    [player2]
  );

  const verdict = useMemo(() => {
    if (p1Total === p2Total) return "Fair Trade";
    if (p1Total < p2Total) return "Win for Advertiser";
    return "Loss for Advertiser";
  }, [p1Total, p2Total]);

  // Auto-generate trade title
  const generatedTitle = useMemo(() => {
    const you = player1.map((u) => u.Name).join(", ");
    const them = player2.map((u) => u.Name).join(", ");
    if (!you && !them) return "";
    return `${you || "?"} FOR ${them || "?"}`;
  }, [player1, player2]);

  // Load trades
  async function loadTrades(query = "") {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/trades${query ? `?search=${encodeURIComponent(query)}` : ""}`
      );
      const data = await res.json();
      if (data.success) setAds(data.data || []);
    } catch (err) {
      console.error("Failed to load trades:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrades(search);
  }, [search]);

  // Post new trade
  const postTrade = async () => {
    setErrorMsg("");
    setErrorActive(false);

    // --- FRONTEND VALIDATION ---
    if (!player1.length || !player2.length) {
      setErrorMsg("Add Units/Items to both fields.");
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
      verdict,
      discord,
      roblox,
    };

    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAd),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Interpret backend responses
        if (data.error?.includes("Limit reached")) {
          setErrorMsg("Maximum Trades Reached — try again in 24 hours.");
        } else if (data.error?.includes("Add Units")) {
          setErrorMsg("Add Units/Items to both fields.");
        } else if (data.error?.includes("Invalid trade")) {
          setErrorMsg("Missing Required Fields — please check inputs.");
        } else {
          setErrorMsg(data.error || "An unexpected error occurred.");
        }
        setErrorActive(true);
        return;
      }

      // Success — reset form
      setAds([data.trade, ...ads]);
      setDescription("");
      setPlayer1([]);
      setPlayer2([]);
      setDiscord("");
      setRoblox("");
      setErrorMsg("");
      setErrorActive(false);
    } catch (err) {
      console.error("Post trade failed:", err);
      setErrorMsg("Server unreachable — please try again later.");
      setErrorActive(true);
    }
  };

  const filteredAds = ads.filter((ad) => {
    const offerQuery = searchOffer.toLowerCase();
    const lookQuery = searchLooking.toLowerCase();

    const matchesOffer =
      !offerQuery ||
      ad.player1.some((u) => {
        const name = u.Name?.toLowerCase() || "";
        const inGame = u["In Game Name"]?.toLowerCase() || "";
        return name.includes(offerQuery) || inGame.includes(offerQuery);
      });

    const matchesLooking =
      !lookQuery ||
      ad.player2.some((u) => {
        const name = u.Name?.toLowerCase() || "";
        const inGame = u["In Game Name"]?.toLowerCase() || "";
        return name.includes(lookQuery) || inGame.includes(lookQuery);
      });

    return matchesOffer && matchesLooking;
  });

  return (
    <main className="relative min-h-screen text-white overflow-visible">
      <GalaxyBackground />

      {/* Discord Banner (Moved Above Title — Fixed Border + Reduced Gap) */}
      <div
        className="rounded-2xl p-5 mb--2 text-center text-white shadow-2xl border mx-auto max-w-3xl relative"
        style={{
          background:
            "linear-gradient(180deg, rgba(25,0,50,0.85), rgba(10,0,20,0.9))",
          border: "2px solid rgba(190,160,255,0.5)",
          boxShadow:
            "0 0 25px rgba(200,170,255,0.35), inset 0 0 10px rgba(150,100,255,0.15)",
          marginTop: "-2rem", // hugs the top but keeps full border visible
          paddingTop: "0.8rem",
          zIndex: 5,
        }}
      >
        <h2
          className="text-2xl sm:text-3xl font-extrabold mb-2"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #f7b3ff, #c6a4ff, #e2b5ff)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            textShadow:
              "0 0 20px rgba(230,180,255,0.45), 0 0 35px rgba(200,150,255,0.25)",
          }}
        >
          Join our Discord
        </h2>
        <p className="mb-3 text-white/85 text-base sm:text-lg font-medium">
          Complete and Finalize Trades Found on this Page Faster & Easier
        </p>
        <a
          href="https://discord.gg/cUGkAtsFNT"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-2 rounded-xl font-bold text-lg transition-all hover:scale-[1.05] pulse-glow"
          style={{
            background:
              "linear-gradient(90deg, rgba(160,90,255,0.85), rgba(240,150,255,0.8))",
            border: "1px solid rgba(190,160,255,0.4)",
            boxShadow:
              "0 0 25px rgba(200,150,255,0.3), inset 0 0 10px rgba(180,120,255,0.25)",
            color: "white",
            textShadow:
              "0 0 15px rgba(230,200,255,0.4), 0 0 25px rgba(190,140,255,0.2)",
          }}
        >
          Join Discord
        </a>
      </div>

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-visible">
        {/* Title */}
        <h1
          className="font-extrabold text-[3rem] sm:text-[3.5rem] md:text-[4rem] leading-tight mb-8 bg-clip-text text-transparent text-center mx-auto w-fit mt-[-2rem]"
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


        {/* Trade Boxes */}
        <div className="flex flex-col md:flex-row items-start md:items-stretch justify-center gap-8 mb-4">
          <TradeBox title="Your Offer" units={player1} setUnits={setPlayer1} />
          <TradeBox title="Their Offer" units={player2} setUnits={setPlayer2} />
        </div>

        {/* Verdict Display */}
        <div className="flex items-center justify-center gap-8 mb-8 text-center">
          <div className="text-2xl md:text-3xl font-extrabold w-1/3 text-right">
            You
          </div>
          <div className="w-1/3 text-center">
            <h2
              className={`text-2xl sm:text-3xl font-extrabold ${p1Total === p2Total
                ? "text-gray-300"
                : p1Total < p2Total
                  ? "text-emerald-400"
                  : "text-red-500"
                }`}
              style={{
                textShadow:
                  p1Total === p2Total
                    ? "0 0 12px rgba(200,150,255,0.5)"
                    : p1Total < p2Total
                      ? "0 0 15px rgba(0,255,180,0.6)"
                      : "0 0 15px rgba(255,100,100,0.6)",
              }}
            >
              {p1Total === p2Total
                ? `Fair (0)`
                : p1Total < p2Total
                  ? `Win (${(p2Total - p1Total).toLocaleString()})`
                  : `Loss (${(p1Total - p2Total).toLocaleString()})`}
            </h2>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold w-1/3 text-left">
            Other Player
          </div>
        </div>

        {/* Post Trade Section */}
        <div
          className={`rounded-2xl p-6 mb-12 shadow-2xl border transition-all ${errorActive ? "border-2 border-red-500" : ""
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
            onChange={(e) => {
              let value = e.target.value;
              // track if invalid before cleaning
              const invalid = /[A-Z\s]/.test(value);
              value = value.toLowerCase().replace(/\s+/g, "");
              setDiscord(value.slice(0, 32)); // 32 max for Discord
              setDiscordValid(!invalid);
            }}
            placeholder="Discord Username and/or"
            maxLength={15}
            className={`w-full px-3 py-2 rounded-lg mb-3 outline-none text-white placeholder-white/60 transition-all ${discordValid ? "" : "border-red-500 bg-red-950/30"
              }`}
            style={{
              background: discordValid
                ? "rgba(255,255,255,0.06)"
                : "rgba(255,100,100,0.08)",
              border: discordValid
                ? "1px solid rgba(190,160,255,0.35)"
                : "1px solid rgba(255,100,100,0.6)",
              boxShadow: discordValid
                ? "inset 0 0 8px rgba(160,120,255,0.12)"
                : "inset 0 0 6px rgba(255,80,80,0.2)",
            }}
          />

          {/* Roblox Username */}
          <input
            value={roblox}
            onChange={(e) => {
              let value = e.target.value;
              // Only disallow spaces and symbols other than letters, numbers, or underscore
              const invalid = /\s|[^a-zA-Z0-9_]/.test(value);
              value = value.replace(/[^a-zA-Z0-9_]/g, ""); // keep caps allowed
              setRoblox(value.slice(0, 20)); // 20 max for Roblox
              setRobloxValid(!invalid);
            }}
            placeholder="Roblox Username (To be contacted about the trade)"
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
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-10 text-center">
          {/* Offering Search */}
          <input
            value={searchOffer}
            onChange={(e) => setSearchOffer(e.target.value)}
            placeholder="Search offerings..."
            className="flex-1 px-3 py-2 rounded-lg outline-none text-white placeholder-white/60 text-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(190,160,255,0.35)",
              boxShadow: "inset 0 0 8px rgba(160,120,255,0.12)",
            }}
          />

          {/* “FOR” separator */}
          <span
            className="animated-gold text-lg font-bold select-none"
            style={{ padding: "0 10px", whiteSpace: "nowrap" }}
          >
            FOR
          </span>

          {/* Looking For Search */}
          <input
            value={searchLooking}
            onChange={(e) => setSearchLooking(e.target.value)}
            placeholder="Search looking for..."
            className="flex-1 px-3 py-2 rounded-lg outline-none text-white placeholder-white/60 text-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(190,160,255,0.35)",
              boxShadow: "inset 0 0 8px rgba(160,120,255,0.12)",
            }}
          />
        </div>

        {loading && (
          <p className="text-center text-violet-300 mb-4">Loading trades...</p>
        )}

        {/* Posted Trades */}
        <div className="space-y-8">
          {filteredAds.map((ad, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 shadow-xl border"
              style={{
                background:
                  "linear-gradient(180deg, rgba(20,0,40,0.65), rgba(0,0,0,0.85))",
                borderColor: "rgba(180,150,255,0.25)",
                boxShadow:
                  "0 0 18px rgba(200,170,255,0.15), inset 0 0 8px rgba(160,120,255,0.12)",
              }}
            >
              <h3
                className="text-xl font-bold mb-2 text-violet-200"
                dangerouslySetInnerHTML={{
                  __html: ad.title
                    // color the commas
                    .replace(/,/g, '<span style="color:#c49eff;">,</span>')
                    // apply gradient animation to “for”
                    .replace(
                      /\bFOR\b/gi,
                      '<span class="animated-gold"> FOR </span>'
                    ),
                }}
              ></h3>

              {ad.description && (
                <p className="mb-4 text-white/85">{ad.description}</p>
              )}

              <div className="flex flex-col md:flex-row gap-6 mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2 text-pink-300">
                    Offering
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 justify-center">
                    {ad.player1.map((u, idx) => (
                      <CompactUnitCard key={idx} u={u} clickable={true} />
                    ))}
                  </div>
                  <p className="mt-1 text-white/80">
                    Total: {ad.p1Total.toLocaleString()}
                  </p>
                </div>

                <div className="flex-1">
                  <h4 className="font-semibold mb-2 text-blue-300">
                    Looking For
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 justify-center">
                    {ad.player2.map((u, idx) => (
                      <CompactUnitCard key={idx} u={u} clickable={true} />
                    ))}
                  </div>
                  <p className="mt-1 text-white/80">
                    Total: {ad.p2Total.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Verdict + Usernames (same line, bottom right) */}
              <div className="flex justify-between items-center mt-2 mb-1">
                <p className="font-bold text-violet-300">{ad.verdict}</p>
                {(ad.discord || ad.roblox) && (
                  <div className="text-sm text-white/70 flex gap-4 text-right">
                    {ad.discord && <span>Discord: {ad.discord}</span>}
                    {ad.roblox && <span>Roblox: {ad.roblox}</span>}
                  </div>
                )}
              </div>
              <p className="text-xs text-white/50 mt-1">
                Posted: {new Date(ad.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
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

  @keyframes pulseGlow {
    0% {
      box-shadow: 0 0 20px rgba(200,150,255,0.3),
        inset 0 0 8px rgba(180,120,255,0.25);
    }
    50% {
      box-shadow: 0 0 35px rgba(230,180,255,0.45),
        inset 0 0 12px rgba(200,150,255,0.3);
    }
    100% {
      box-shadow: 0 0 20px rgba(200,150,255,0.3),
        inset 0 0 8px rgba(180,120,255,0.25);
    }
  }

  .pulse-glow {
    animation: pulseGlow 3.5s ease-in-out infinite;
  }

  /* ---- Animated light-gold gradient for the word “for” ---- */
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
`}</style>
    </main>
  );
}
