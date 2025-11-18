"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import GalaxyBackground from "../components/GalaxyBackground";
import MobileTradeBox from "../components/MobileTradeBox";

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function MobileTradeCalculator() {
  const [you, setYou] = useState([]);
  const [other, setOther] = useState([]);

  const tradeAreaRef = useRef(null);

  // Load any pending trade (if coming from other pages)
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

  const youTotal = useMemo(
    () => you.reduce((s, u) => s + toNumber(u.Value), 0),
    [you]
  );
  const otherTotal = useMemo(
    () => other.reduce((s, u) => s + toNumber(u.Value), 0),
    [other]
  );

  const diff = otherTotal - youTotal;

  const verdictText =
    diff === 0
      ? `Fair (0)`
      : diff > 0
      ? `Win (${diff.toLocaleString()})`
      : `Loss (${Math.abs(diff).toLocaleString()})`;

  const verdictColor =
    diff === 0
      ? "text-gray-300"
      : diff > 0
      ? "text-emerald-400"
      : "text-red-500";

  const handleScreenshot = async () => {
    if (!tradeAreaRef.current) return;
    const html2canvas = (await import("html2canvas")).default;

    const canvas = await html2canvas(tradeAreaRef.current, {
      backgroundColor: "#000000",
      useCORS: true,
      scale: 2, // higher quality
    });

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "av-trade.png";
    link.click();
  };

  return (
    <main className="min-h-screen text-white relative overflow-visible flex flex-col items-center">
      <GalaxyBackground />

      <section className="relative z-10 w-full max-w-5xl px-3 pt-20 pb-10 flex flex-col items-center">
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
          Trade Calculator
        </h1>

        {/* Screenshot button */}
        <button
          onClick={handleScreenshot}
          className="mb-4 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 bg-[linear-gradient(145deg,rgba(35,0,70,0.9),rgba(15,0,35,0.9))] border border-[rgba(210,180,255,0.7)] shadow-[0_0_10px_rgba(190,150,255,0.5)] active:scale-95"
        >
          <span>📸 Screenshot Trade Area</span>
        </button>

        {/* Everything inside this div is what gets screenshotted */}
        <div
          ref={tradeAreaRef}
          className="w-full rounded-3xl bg-black/40 border border-white/10 px-3 pt-4 pb-4 shadow-[0_0_25px_rgba(0,0,0,0.6)]"
        >
          {/* Header row */}
          <div className="flex items-center justify-between gap-2 mb-4 text-center">
            <div className="flex-1 text-right text-lg font-extrabold">
              You
            </div>
            <div className="flex-[1.4] text-center">
              <h2
                className={`text-xl font-extrabold ${verdictColor}`}
                style={{
                  textShadow:
                    diff === 0
                      ? "0 0 10px rgba(200,150,255,0.5)"
                      : diff > 0
                      ? "0 0 12px rgba(0,255,180,0.6)"
                      : "0 0 12px rgba(255,100,100,0.6)",
                }}
              >
                {verdictText}
              </h2>
            </div>
            <div className="flex-1 text-left text-lg font-extrabold">
              Other Player
            </div>
          </div>

          {/* Trade boxes stacked on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-start">
            <MobileTradeBox title="Your Offer" units={you} setUnits={setYou} />
            <MobileTradeBox
              title="Their Offer"
              units={other}
              setUnits={setOther}
            />
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
      `}</style>
    </main>
  );
}
