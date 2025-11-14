"use client";

import { useState, useMemo, useEffect } from "react";
import GalaxyBackground from "../components/GalaxyBackground";
import MobileTradeBox from "../components/MobileTradeBox";
import MobileCompactUnitCard from "../components/MobileCompactUnitCard";

function toNumber(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export default function MobileTradeHub() {
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

  // Totals + verdict (same logic as desktop)
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

  // Auto-generate trade title (same as desktop)
  const generatedTitle = useMemo(() => {
    const you = player1.map((u) => u.Name).join(", ");
    const them = player2.map((u) => u.Name).join(", ");
    if (!you && !them) return "";
    return `${you || "?"} FOR ${them || "?"}`;
  }, [player1, player2]);

  // Load trades (same as desktop)
  async function loadTrades(query = "") {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/trades${
          query ? `?search=${encodeURIComponent(query)}` : ""
        }`,
        {
          cache: "no-store",
        }
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setAds(data.data);
    } catch (err) {
      console.error("Failed to load trades:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrades(search);
  }, [search]);

  // Post new trade (same validation & error handling as desktop — bot proof stays)
  const postTrade = async () => {
    setErrorMsg("");
    setErrorActive(false);

    if (!player1.length || !player2.length) {
      setErrorMsg("Add Units/Items to both fields.");
      setErrorActive(true);
      return;
    }

    if (!discord.trim() && !roblox.trim()) {
      setErrorMsg(
        "Missing Required Fields — enter Discord or Roblox username."
      );
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

      // Success — prepend new ad, reset form
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
      setErrorMsg(
        err?.message || "Server unreachable — please try again later."
      );
      setErrorActive(true);
    }
  };

  // Filter posted ads by “offering” / “looking for” (same logic)
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

  const diff = p2Total - p1Total;
  const verdictHeaderText =
    p1Total === p2Total
      ? `Fair (0)`
      : p1Total < p2Total
      ? `Win (${(p2Total - p1Total).toLocaleString()})`
      : `Loss (${(p1Total - p2Total).toLocaleString()})`;

  const verdictColorHeader =
    p1Total === p2Total
      ? "text-gray-300"
      : p1Total < p2Total
      ? "text-emerald-400"
      : "text-red-500";

  return (
    <main className="relative min-h-screen text-white overflow-visible flex flex-col items-center">
      <GalaxyBackground />

      {/* Top content wrapper (similar to MobileTradeCalculator) */}
      <section className="relative z-10 w-full max-w-5xl px-3 pt-20 pb-10 flex flex-col items-center">
        {/* Discord Banner */}
        <div
          className="rounded-2xl p-4 mb-6 text-center text-white shadow-2xl border w-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(25,0,50,0.85), rgba(10,0,20,0.9))",
            border: "2px solid rgba(190,160,255,0.5)",
            boxShadow:
              "0 0 25px rgba(200,170,255,0.35), inset 0 0 10px rgba(150,100,255,0.15)",
          }}
        >
          <h2
            className="text-[1.6rem] font-extrabold mb-1"
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
          <p className="mb-3 text-white/85 text-[0.95rem] font-medium">
            Complete and finalize trades found on this page faster & easier.
          </p>
          <a
            href="https://discord.gg/cUGkAtsFNT"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-2 rounded-xl font-bold text-base transition-all hover:scale-[1.05] pulse-glow"
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

        {/* Title */}
        <h1
          className="text-center font-extrabold text-[2.4rem] leading-tight mb-6 bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #c6a4ff, #f3b5ff, #b9b4ff, #c6a4ff)",
            backgroundSize: "300% 300%",
            animation: "titleGradient 12s ease-in-out infinite",
            textShadow:
              "0 0 30px rgba(198,164,255,0.35), 0 0 50px rgba(243,181,255,0.25)",
          }}
        >
          Trade Hub
        </h1>

        {/* Top card: trade creation + verdict, styled similar to MobileTradeCalculator */}
        <div className="w-full rounded-3xl bg-black/40 border border-white/10 px-3 pt-4 pb-4 shadow-[0_0_25px_rgba(0,0,0,0.6)] mb-8">
          {/* Header row: You / Verdict / Other Player */}
          <div className="flex items-center justify-between gap-2 mb-4 text-center">
            <div className="flex-1 text-right text-lg font-extrabold">
              You
            </div>
            <div className="flex-[1.4] text-center">
              <h2
                className={`text-xl font-extrabold ${verdictColorHeader}`}
                style={{
                  textShadow:
                    p1Total === p2Total
                      ? "0 0 10px rgba(200,150,255,0.5)"
                      : p1Total < p2Total
                      ? "0 0 12px rgba(0,255,180,0.6)"
                      : "0 0 12px rgba(255,100,100,0.6)",
                }}
              >
                {verdictHeaderText}
              </h2>
            </div>
            <div className="flex-1 text-left text-lg font-extrabold">
              Other Player
            </div>
          </div>

          {/* Trade boxes stacked on mobile (uses SAME MobileTradeBox as MobileTradeCalculator) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-start mb-4">
            <MobileTradeBox
              title="Your Offer"
              units={player1}
              setUnits={setPlayer1}
            />
            <MobileTradeBox
              title="Their Offer"
              units={player2}
              setUnits={setPlayer2}
            />
          </div>

          {/* Contact + description + Post button inside same card for tight mobile layout */}
          <div
            className={`rounded-2xl p-3 shadow-inner border transition-all ${
              errorActive ? "border-2 border-red-500" : ""
            }`}
            style={{
              background:
                "linear-gradient(180deg, rgba(20,0,40,0.65) 0%, rgba(3,0,15,0.8) 60%, rgba(0,0,0,0.85) 100%)",
              borderColor: "rgba(180,150,255,0.25)",
              boxShadow:
                "0 0 16px rgba(200,170,255,0.2), inset 0 0 8px rgba(160,120,255,0.15)",
            }}
          >
            {/* Discord Username */}
            <input
              value={discord}
              onChange={(e) => {
                let value = e.target.value;
                const invalid = /[A-Z\s]/.test(value);
                value = value.toLowerCase().replace(/\s+/g, "");
                setDiscord(value.slice(0, 32));
                setDiscordValid(!invalid);
              }}
              placeholder="Discord Username and/or"
              maxLength={32}
              className={`w-full px-3 py-2 rounded-lg mb-2 outline-none text-white placeholder-white/60 text-sm transition-all ${
                discordValid ? "" : "border-red-500 bg-red-950/30"
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
                const invalid = /\s|[^a-zA-Z0-9_]/.test(value);
                value = value.replace(/[^a-zA-Z0-9_]/g, "");
                setRoblox(value.slice(0, 20));
                setRobloxValid(!invalid);
              }}
              placeholder="Roblox Username (To be contacted about the trade)"
              maxLength={20}
              className={`w-full px-3 py-2 rounded-lg mb-2 outline-none text-white placeholder-white/60 text-sm transition-all ${
                robloxValid ? "" : "border-red-500 bg-red-950/30"
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
              rows={2}
              maxLength={100}
              className="w-full px-3 py-2 rounded-lg mb-2 outline-none text-white placeholder-white/60 text-sm"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(190,160,255,0.35)",
                boxShadow: "inset 0 0 8px rgba(160,120,255,0.12)",
              }}
            />

            <div className="flex justify-center mt-1">
              <button
                onClick={postTrade}
                className="px-8 py-2 rounded-lg font-bold text-sm transition active:scale-95"
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
              <p className="text-red-400 font-semibold mt-2 text-center text-sm">
                {errorMsg}
              </p>
            )}
          </div>
        </div>

        {/* Dual search bars (Offering / Looking For) */}
        <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-3 mb-8 text-center">
          <input
            value={searchOffer}
            onChange={(e) => setSearchOffer(e.target.value)}
            placeholder="Search offerings..."
            className="flex-1 px-3 py-2 rounded-lg outline-none text-white placeholder-white/60 text-sm"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(190,160,255,0.35)",
              boxShadow: "inset 0 0 8px rgba(160,120,255,0.12)",
            }}
          />
          <span
            className="animated-gold text-base font-bold select-none"
            style={{ padding: "0 8px", whiteSpace: "nowrap" }}
          >
            FOR
          </span>
          <input
            value={searchLooking}
            onChange={(e) => setSearchLooking(e.target.value)}
            placeholder="Search looking for..."
            className="flex-1 px-3 py-2 rounded-lg outline-none text-white placeholder-white/60 text-sm"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(190,160,255,0.35)",
              boxShadow: "inset 0 0 8px rgba(160,120,255,0.12)",
            }}
          />
        </div>

        {loading && (
          <p className="text-center text-violet-300 mb-4 text-sm">
            Loading trades...
          </p>
        )}

        {/* Posted trades – ONE full trade per row, like desktop */}
        <div className="w-full flex flex-col gap-6">
          {filteredAds.map((ad, i) => (
            <div
              key={i}
              className="rounded-2xl p-4 shadow-xl border w-full"
              style={{
                background:
                  "linear-gradient(180deg, rgba(20,0,40,0.65), rgba(0,0,0,0.85))",
                borderColor: "rgba(180,150,255,0.25)",
                boxShadow:
                  "0 0 18px rgba(200,170,255,0.15), inset 0 0 8px rgba(160,120,255,0.12)",
              }}
            >
              <h3
                className="text-lg font-bold mb-2 text-violet-200"
                dangerouslySetInnerHTML={{
                  __html: ad.title
                    .replace(
                      /,/g,
                      '<span style="color:#c49eff;">,</span>'
                    )
                    .replace(
                      /\bFOR\b/gi,
                      '<span class="animated-gold"> FOR </span>'
                    ),
                }}
              ></h3>

              {ad.description && (
                <p className="mb-3 text-white/85 text-sm">
                  {ad.description}
                </p>
              )}

              <div className="flex flex-col md:flex-row gap-4 mb-3">
                {/* Offering */}
                <div className="flex-1">
                  <h4 className="font-semibold mb-1 text-pink-300 text-sm">
                    Offering
                  </h4>
                  <div className="grid grid-cols-3 gap-2 justify-center">
                    {ad.player1.map((u, idx) => (
                      <MobileCompactUnitCard
                        key={idx}
                        u={u}
                        clickable={true}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-white/80 text-xs">
                    Total: {(Number(ad.p1Total) || 0).toLocaleString()}
                  </p>
                </div>

                {/* Looking For */}
                <div className="flex-1">
                  <h4 className="font-semibold mb-1 text-blue-300 text-sm">
                    Looking For
                  </h4>
                  <div className="grid grid-cols-3 gap-2 justify-center">
                    {ad.player2.map((u, idx) => (
                      <MobileCompactUnitCard
                        key={idx}
                        u={u}
                        clickable={true}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-white/80 text-xs">
                    Total: {(Number(ad.p2Total) || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Verdict + usernames */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-1 gap-2">
                <p className="font-bold text-violet-300 text-sm">
                  {ad.verdict}
                </p>
                {(ad.discord || ad.roblox) && (
                  <div className="text-xs text-white/70 flex flex-wrap gap-3 justify-end">
                    {ad.discord && <span>Discord: {ad.discord}</span>}
                    {ad.roblox && <span>Roblox: {ad.roblox}</span>}
                  </div>
                )}
              </div>
              <p className="text-[0.65rem] text-white/50 mt-1">
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
            box-shadow: 0 0 20px rgba(200, 150, 255, 0.3),
              inset 0 0 8px rgba(180, 120, 255, 0.25);
          }
          50% {
            box-shadow: 0 0 35px rgba(230, 180, 255, 0.45),
              inset 0 0 12px rgba(200, 150, 255, 0.3);
          }
          100% {
            box-shadow: 0 0 20px rgba(200, 150, 255, 0.3),
              inset 0 0 8px rgba(180, 120, 255, 0.25);
          }
        }

        .pulse-glow {
          animation: pulseGlow 3.5s ease-in-out infinite;
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
      `}</style>
    </main>
  );
}
