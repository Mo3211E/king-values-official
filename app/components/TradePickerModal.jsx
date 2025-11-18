"use client";

import { useMemo, useState, useEffect } from "react";
import CompactUnitCard from "./CompactUnitCard";

function toNumber(v) {
  const s = String(v || "").trim().toLowerCase();
  if (s.includes("owner")) return 1e12; // treat Owner's Choice as huge
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * TradePickerModal
 *
 * Props:
 *  - onClose(): void
 *  - onSelect(unit): void
 *      unit is the selected unit object to add to the trade
 *
 * This is a BIGGER, trading-only picker with three modes:
 *  Offers | Upgrades | Downgrades
 * and a compact grid optimal for screenshots & 8+ items.
 */
export default function TradePickerModal({ onClose, onSelect }) {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("value-desc");
  const [unitsRaw, setUnitsRaw] = useState([]);

  // Load units (same source as everything else)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const cached = sessionStorage.getItem("unitsCache");
        if (cached) {
          const data = JSON.parse(cached);
          if (alive) setUnitsRaw(data);
          return;
        }

        const res = await fetch("/api/units");
        if (!res.ok) throw new Error("Failed to fetch units.");
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data.data || [];
        if (alive) setUnitsRaw(arr);
        sessionStorage.setItem("unitsCache", JSON.stringify(arr));
      } catch (e) {
        console.error("Failed to load units:", e);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // debounce search
  useEffect(() => {
    const h = setTimeout(() => setDebouncedQ(q), 100);
    return () => clearTimeout(h);
  }, [q]);

    const specialCards = [
    {
      key: "offers",
      label: "Offers",
      image: "https://res.cloudinary.com/dwair06ro/image/upload/v1763498684/offers_u7al83.png",
      clickable: true,
    },
    {
      key: "upgrades",
      label: "Upgrades",
      image: "https://res.cloudinary.com/dwair06ro/image/upload/v1763498680/upgrades_pmt0yv.png",
      clickable: true,
    },
    {
      key: "downgrades",
      label: "Downgrades",
      image: "https://res.cloudinary.com/dwair06ro/image/upload/v1763498691/downgrades_shytxg.png",
      clickable: true,
    },
    {
      key: "bundles",
      label: "Bundles",
      image: "https://res.cloudinary.com/dwair06ro/image/upload/v1760922981/Release_bundle_qx1oy4.webp",
      clickable: true,
    },
    {
      key: "gamepasses",
      label: "Gamepasses",
      image: "https://res.cloudinary.com/dwair06ro/image/upload/v1760922999/Shiny_Hunter_sjmd4w.webp",
      clickable: true,
    },
  ];

  
  // Preprocess units
  const memoizedUnits = useMemo(() => {
    return unitsRaw
      .map((u) => ({
        ...u,
        _value: toNumber(u.Value),
        _name: String(u.Name || "").trim(),
        _category: String(u.Category || "").trim(),
        _demand: toNumber(u.Demand),
      }))
      .filter((u) => u._name.length > 0);
  }, [unitsRaw]);

  const categories = useMemo(() => {
    const set = new Set(
      memoizedUnits.map((u) => u._category).filter(Boolean)
    );
    return ["All", ...Array.from(set)];
  }, [memoizedUnits]);

  // Filter + sort
  const filtered = useMemo(() => {
    const ql = debouncedQ.trim().toLowerCase();
    let list = memoizedUnits;

    if (ql) {
      list = list.filter((u) => {
        const searchSpace = [
          u._name,
          u["In Game Name"],
          u.InGameName,
          u.IngameName,
          u.inGameName,
          u.Justification,
          u.Obtainment,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchSpace.includes(ql);
      });
    }

    if (category !== "All") {
      list = list.filter((u) => u._category === category);
    }

    switch (sort) {
      case "value-desc":
        list = [...list].sort((a, b) => b._value - a._value);
        break;
      case "value-asc":
        list = [...list].sort((a, b) => a._value - b._value);
        break;
      case "demand-desc":
        list = [...list].sort(
          (a, b) => toNumber(b.Demand) - toNumber(a.Demand)
        );
        break;
      case "demand-asc":
        list = [...list].sort(
          (a, b) => toNumber(a.Demand) - toNumber(b.Demand)
        );
        break;
      case "name-asc":
        list = [...list].sort((a, b) => a._name.localeCompare(b._name));
        break;
      case "name-desc":
        list = [...list].sort((a, b) => b._name.localeCompare(a._name));
        break;
    }

    return list;
  }, [memoizedUnits, debouncedQ, category, sort]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div
        className="relative rounded-3xl w-[95vw] max-w-5xl shadow-2xl border flex flex-col"
        style={{
          maxHeight: "85vh",
          background:
            "radial-gradient(circle at top, rgba(40,0,90,0.95) 0%, rgba(10,0,30,0.96) 55%, rgba(0,0,0,0.98) 100%)",
          borderColor: "rgba(190,160,255,0.5)",
          boxShadow:
            "0 0 32px rgba(210,180,255,0.45), inset 0 0 16px rgba(120,60,200,0.35)",
        }}
      >
        {/* HEADER ROW */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: "rgba(180,150,255,0.35)" }}
        >
          <div>
            <h2
              className="text-xl md:text-2xl font-extrabold"
              style={{
                background:
                  "linear-gradient(90deg, #c9a6ff, #f3b5ff, #bca7ff, #c9a6ff)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                textShadow:
                  "0 0 10px rgba(190,150,255,0.4), 0 0 22px rgba(240,200,255,0.25)",
              }}
            >
              Select What to Trade
            </h2>
            <p className="text-xs md:text-sm text-white/70 mt-1">
              Click a card to add it to your trade
            </p>
          </div>

          <button
            className="text-red-400 hover:text-red-200 text-2xl px-2 rounded-lg transition hover:shadow-[0_0_14px_rgba(255,60,60,0.8)]"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* MODE TOGGLE + CONTROLS */}
        <div
          className="px-5 py-3 border-b flex flex-col gap-3 md:gap-2"
          style={{ borderColor: "rgba(180,150,255,0.35)" }}
        >
          <style jsx>{`
            @keyframes galaxyPulse {
              0% {
                box-shadow: 0 0 6px rgba(200, 150, 255, 0.25),
                  0 0 12px rgba(180, 120, 255, 0.15);
              }
              50% {
                box-shadow: 0 0 16px rgba(220, 180, 255, 0.45),
                  0 0 26px rgba(190, 150, 255, 0.35);
              }
              100% {
                box-shadow: 0 0 6px rgba(200, 150, 255, 0.25),
                  0 0 12px rgba(180, 120, 255, 0.15);
              }
            }

            .picker-input,
            .picker-select {
              border-radius: 9999px;
              background: linear-gradient(
                145deg,
                rgba(35, 0, 70, 0.95),
                rgba(15, 0, 35, 0.9)
              );
              color: #f0e8ff;
              border: 1px solid rgba(210, 180, 255, 0.5);
              font-size: 0.9rem;
            }
            .picker-input:focus,
            .picker-select:focus,
            .picker-select:hover {
              animation: galaxyPulse 2.8s ease-in-out infinite;
              outline: none;
            }
            .picker-select option {
              background: rgba(25, 0, 50, 0.92);
              color: #e7d4ff;
            }
          `}</style>

          {/* SEARCH + FILTERS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, in-game name, justification, obtainment..."
              className="picker-input px-4 py-2 outline-none placeholder-white/70 col-span-1 md:col-span-1"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="picker-select px-3 py-2 outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="picker-select px-3 py-2 outline-none cursor-pointer"
            >
              <option value="value-desc">Value (High → Low)</option>
              <option value="value-asc">Value (Low → High)</option>
              <option value="demand-desc">Demand (High → Low)</option>
              <option value="demand-asc">Demand (Low → High)</option>
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
            </select>
          </div>
        </div>

        {/* GRID */}
        <div
          className="overflow-y-auto flex-1 px-5 pb-4 pt-3 custom-scrollbar"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#b891ff rgba(40,0,80,0.4)",
          }}
        >
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(25, 0, 50, 0.6);
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #b891ff, #7a55ff);
              border-radius: 8px;
              box-shadow: 0 0 6px rgba(190, 150, 255, 0.5);
            }
          `}</style>

          {/* Legend row: special cards you can add to the trade */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
            {specialCards.map((card) => (
              <button
                key={card.key}
                type="button"
                disabled={!card.clickable}
                onClick={() => {
                  if (!card.clickable) return;
                  onSelect({
                    Name: card.label,
                    Category: "Special",
                    Value: 0,
                    Image: card.image,
                  });
                }}
                className={`relative group ${
                  card.clickable ? "cursor-pointer" : "cursor-default opacity-75"
                }`}
              >
                <div
                  className="relative rounded-xl overflow-hidden"
                  style={{
                    width: "120px",
                    height: "120px",
                    background: "linear-gradient(180deg,#2a0040,#000,#2a0040)",
                    borderRadius: "1rem",
                    boxShadow:
                      "0 0 16px rgba(190,150,255,0.55), inset 0 0 10px rgba(0,0,0,0.8)",
                    border: "1px solid rgba(220,190,255,0.7)",
                  }}
                >
                  {card.image && (
                    <img
                      src={card.image}
                      alt={card.label}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  {/* Top banner with label */}
                  <div className="absolute top-0 left-0 w-full h-[24px] bg-black/55 backdrop-blur-sm" />
                  <div className="absolute top-0 left-0 w-full text-center font-extrabold text-[0.85rem] px-1 pt-0.5">
                    {card.label}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {unitsRaw.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center py-10">
              <div className="w-1/2 h-2 bg-[#220042] rounded-full overflow-hidden shadow-[0_0_18px_rgba(180,100,255,0.25)] mb-4">
                <div
                  className="h-full bg-gradient-to-r from-[#a663ff] via-[#e3b2ff] to-[#ffffff] animate-pulse"
                  style={{ width: "85%" }}
                />
              </div>
              <h2 className="text-lg font-bold text-[#e0b3ff]">
                Loading Units…
              </h2>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 justify-center">
              {filtered.slice(0, 600).map((u, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    onSelect({
                      ...u,
                      Name: u._name,
                      Category: u._category,
                      Value: u.Value ?? u._value,
                    })
                  }
                  className="group block focus:outline-none"
                >
                  <CompactUnitCard u={u} clickable={false} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
