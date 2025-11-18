"use client";
import { useMemo, useState, useEffect } from "react";
import TradeBox from "../components/TradeBox";
import GalaxyBackground from "../components/GalaxyBackground";

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


export default function TradeCalculator() {
  const [you, setYou] = useState([]);
  const [other, setOther] = useState([]);

  useEffect(() => {
  const saved = sessionStorage.getItem("pendingTradeUnits");
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.you) setYou(data.you);
      if (data.other) setOther(data.other);
      sessionStorage.removeItem("pendingTradeUnits");
    } catch {}
  }
}, []);

  const youTotal = useMemo(() => you.reduce((s, u) => s + toNumber(u.Value), 0), [you]);
  const otherTotal = useMemo(() => other.reduce((s, u) => s + toNumber(u.Value), 0), [other]);

// Declare verdictText and diff FIRST
let verdictText = "";
let diff = otherTotal - youTotal;

// Owner’s Choice rules
if (youTotal === Infinity && otherTotal === Infinity) {
  verdictText = "Fair (N/A)";
} else if (youTotal === Infinity) {
  verdictText = "Loss (N/A)";
} else if (otherTotal === Infinity) {
  verdictText = "Win (N/A)";
} else {
  // Normal numeric calculation
  verdictText =
    diff === 0
      ? "Fair (0)"
      : diff > 0
      ? `Win (${diff.toLocaleString()})`
      : `Loss (${Math.abs(diff).toLocaleString()})`;
}


const verdictColor =
  youTotal === Infinity && otherTotal === Infinity
    ? "text-gray-300"
    : otherTotal === Infinity
    ? "text-emerald-400"
    : youTotal === Infinity
    ? "text-red-500"
    : diff === 0
    ? "text-gray-300"
    : diff > 0
    ? "text-emerald-400"
    : "text-red-500";

  return (
   <main className="min-h-screen text-white relative overflow-visible flex flex-col justify-center items-center">
      <GalaxyBackground />

      <section className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center h-full -mt-28">
        <h1
          className="text-center font-extrabold text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] leading-tight mb-10 bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #c6a4ff, #f3b5ff, #b9b4ff, #c6a4ff)",
            backgroundSize: "300% 300%",
            animation: "titleGradient 12s ease-in-out infinite",
            textShadow:
              "0 0 40px rgba(198,164,255,0.35), 0 0 70px rgba(243,181,255,0.25)",
          }}
        >
          Trade Calculator
        </h1>

        {/* Header row with You / Verdict / Other Player */}
<div className="flex items-center justify-center gap-8 mb-6 text-center">
  <div className="text-2xl md:text-3xl font-extrabold w-1/3 text-right">You</div>
  <div className="w-1/3 text-center">
    <h2
      className={`text-2xl sm:text-3xl font-extrabold ${verdictColor}`}
      style={{
        textShadow:
          diff === 0
            ? "0 0 12px rgba(200,150,255,0.5)"
            : diff > 0
            ? "0 0 15px rgba(0,255,180,0.6)"
            : "0 0 15px rgba(255,100,100,0.6)",
      }}
    >
      {verdictText}
    </h2>
  </div>
  <div className="text-2xl md:text-3xl font-extrabold w-1/3 text-left">
    Other Player
  </div>
</div>

{/* Trade boxes below */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 justify-center items-start text-center">
  <div>
    <TradeBox title="Your Offer" units={you} setUnits={setYou} />
  </div>
  <div>
    <TradeBox title="Their Offer" units={other} setUnits={setOther} />
  </div>
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
          html, body {
  overflow: hidden;
}
      `}</style>
    </main>
  );
}
