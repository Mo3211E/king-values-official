"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import UnitPickerModal from "./UnitPickerModal";
import CompactUnitCard from "./CompactUnitCard";

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



export default function TradeBox({ title, units, setUnits }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter(); // 🆕 router for navigation

const totalValue = useMemo(() => {
  const numericValues = units.map((u) => toNumber(u.Value));

  if (numericValues.includes(Infinity)) return Infinity;

  return numericValues.reduce((sum, v) => sum + v, 0);
}, [units]);


  const removeAt = (idx) => {
    const next = [...units];
    next.splice(idx, 1);
    setUnits(next);
  };

  return (
    <div
      className="rounded-2xl w-full text-left border shadow-xl p-4 sm:p-5 mx-auto"
      style={{
        background:
          "linear-gradient(180deg, rgba(20,0,40,0.65) 0%, rgba(3,0,15,0.8) 60%, rgba(0,0,0,0.85) 100%)",
        borderColor: "rgba(180,150,255,0.25)",
        boxShadow:
          "0 0 24px rgba(200,170,255,0.15), inset 0 0 8px rgba(160,120,255,0.12)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-wide">{title}</h2>
        <p className="text-white/90 text-sm sm:text-base">
          Value: {totalValue === Infinity ? "∞" : totalValue.toLocaleString()}
        </p>
      </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
{units.map((u, i) => (
  <div
    key={`${u.Name}-${i}`}
    className="relative group cursor-pointer"
    onClick={() => {
      // 🧠 Save current trade state to sessionStorage before leaving
      sessionStorage.setItem(
        "pendingTradeUnits",
        JSON.stringify({
          you: units,
          title: title,
        })
      );

      // Navigate to the unit’s info page
      router.push(`/units/${encodeURIComponent(u.Name)}`);
    }}
  >
    <CompactUnitCard u={u} clickable={true} />

    {/* Remove Button */}
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent navigation when clicking remove
        removeAt(i);
      }}
      className="absolute top-[4px] right-[4px] bg-black/60 text-xs px-[6px] py-[2px] rounded-md border border-red-500/70 text-red-400 hover:text-white hover:border-red-400 hover:shadow-[0_0_12px_rgba(255,80,80,0.8)] transition z-50"
      style={{
        pointerEvents: "all",
      }}
    >
      ✕
    </button>
  </div>
))}

        <button
          onClick={() => setIsOpen(true)}
          className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-5xl transition grid place-items-center hover:scale-105"
          aria-label={`Add unit to ${title}`}
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

      {isOpen && (
        <UnitPickerModal
          onClose={() => setIsOpen(false)}
          onSelect={(unit) => {
            setUnits([...units, unit]);
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}
