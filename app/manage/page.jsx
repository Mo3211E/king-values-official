"use client";

import { useEffect, useState } from "react";
import GalaxyBackground from "../components/GalaxyBackground";
import CompactUnitCard from "../components/CompactUnitCard";

export default function ManageAdsPage() {
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({ active: 0, maxActive: 20, remaining: 20 });
  const [error, setError] = useState("");

  // fetch user's trades
  async function load() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/manage/trades", { cache: "no-store" });

      if (res.status === 401) {
        setError("You must log in with Discord to use Manage Ads.");
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to load ads.");
        setLoading(false);
        return;
      }

      setTrades(data.trades);
      setStats({
        active: data.active,
        maxActive: data.maxActive,
        remaining: data.remaining,
      });
    } catch (err) {
      setError("Server unreachable.");
    }

    setLoading(false);
  }

// FIRST: Verify session BEFORE loading trades
useEffect(() => {
  async function checkSession() {
    try {
      const r = await fetch("/api/auth/session", { cache: "no-store" });
      if (!r.ok) return; // do NOT set error, just quietly return
      const s = await r.json();
      if (!s.loggedIn) return; // wait for redirect, don't break the page
    } catch (e) {
      return;
    }

    // If session exists → load trades
    load();
  }
  checkSession();
}, []);

  async function deleteTrade(id) {
    if (!confirm("Delete this trade?")) return;

    try {
      const res = await fetch(`/api/manage/trades?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.error || "Failed to delete.");
        return;
      }

      setTrades((t) => t.filter((x) => x._id !== id));
      setStats((s) => ({
  ...s,
  active: Math.max(0, s.active - 1),
  remaining: Math.min(s.maxActive, s.remaining + 1),
}));
    } catch (err) {
      alert("Server unreachable.");
    }
  }

  async function updateDescription(id, newDesc) {
    try {
      const res = await fetch("/api/manage/trades", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeId: id, description: newDesc }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Failed to update description.");
        return;
      }

      setTrades((t) =>
        t.map((x) =>
          x._id === id ? { ...x, description: newDesc } : x
        )
      );
    } catch {
      alert("Server unreachable.");
    }
  }

  return (
    <main className="relative min-h-screen text-white">
      <GalaxyBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <h1
          className="text-center font-extrabold text-[3rem] mb-6 text-transparent bg-clip-text"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #c6a4ff, #f3b5ff, #b9b4ff, #c6a4ff)",
            textShadow: "0 0 40px rgba(198,164,255,0.35)",
          }}
        >
          Manage Your Trade Ads
        </h1>

        {/* STATS */}
        <div className="text-center mb-8 text-lg font-semibold text-violet-200">
          Active Trades:{" "}
          <span className="text-pink-300">
            {stats.active}/{stats.maxActive}
          </span>{" "}
          — Remaining Slots:{" "}
          <span className="text-emerald-300">{stats.remaining}</span>
        </div>

        {/* ERROR */}
        {error && (
          <p className="text-center text-red-400 font-bold mb-8">{error}</p>
        )}

        {/* LOADING */}
        {loading && (
          <p className="text-center text-violet-300 text-lg">
            Loading your ads…
          </p>
        )}

        {/* NO TRADES */}
        {!loading && trades.length === 0 && !error && (
          <p className="text-center text-white/70 text-lg">
            You have no active trades.
          </p>
        )}

        {/* TRADES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {trades.map((ad) => (
            <div
              key={ad._id}
              className="rounded-2xl p-5 shadow-xl border transition-all hover:scale-[1.01]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(20,0,40,0.65), rgba(0,0,0,0.85))",
                borderColor: "rgba(180,150,255,0.25)",
                boxShadow:
                  "0 0 18px rgba(200,170,255,0.15), inset 0 0 8px rgba(160,120,255,0.12)",
              }}
            >
              <h2
                className="text-lg font-bold mb-3 text-violet-200"
                dangerouslySetInnerHTML={{
                  __html: ad.title.replace(
                    /\bFOR\b/gi,
                    '<span class="animated-gold"> FOR </span>'
                  ),
                }}
              />

              {ad.description && (
                <textarea
                  defaultValue={ad.description}
                  onBlur={(e) =>
                    updateDescription(ad._id, e.target.value.slice(0, 200))
                  }
                  rows="2"
                  className="w-full px-3 py-2 rounded-md bg-black/30 border border-violet-600/40 text-white mb-3 outline-none text-sm"
                />
              )}

              <div className="flex gap-4 mb-4">
                {/* OFFERING */}
                <div className="flex-1">
                  <p className="font-semibold text-pink-300 mb-1 text-sm">You</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ad.player1.map((u, idx) => (
                      <CompactUnitCard key={idx} u={u} clickable={true} />
                    ))}
                  </div>
                </div>

                {/* LOOKING FOR */}
                <div className="flex-1">
                  <p className="font-semibold text-blue-300 mb-1 text-sm">Them</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ad.player2.map((u, idx) => (
                      <CompactUnitCard key={idx} u={u} clickable={true} />
                    ))}
                  </div>
                </div>
              </div>

              {/* VALUE DIFF */}
              <p className="font-bold text-violet-300 mb-2 text-sm">
                {ad.verdict}
              </p>

              {/* DELETE BUTTON */}
              <button
                onClick={() => deleteTrade(ad._id)}
                className="w-full py-2 mt-2 rounded-lg font-bold text-red-300 border border-red-600/40 bg-red-900/20 hover:bg-red-900/40 transition"
              >
                Delete Trade
              </button>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
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
