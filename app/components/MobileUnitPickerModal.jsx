"use client";

import { useMemo, useState, useEffect } from "react";
import MobileCompactUnitCard from "./MobileCompactUnitCard";

function toNumber(v) {
  const s = String(v || "").trim().toLowerCase();
  if (s.includes("owner")) return 1e12; // Highest possible value
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export default function MobileUnitPickerModal({ onClose, onSelect }) {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("value-desc");
  const [unitsRaw, setUnitsRaw] = useState([]);

  // Load units (same as desktop)
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
        if (!res.ok) throw new Error("Failed to fetch");
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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="relative rounded-2xl w-[95vw] max-w-md shadow-2xl border flex flex-col"
        style={{
          maxHeight: "80vh",
          background:
            "radial-gradient(circle at center, rgba(20,0,40,0.95) 0%, rgba(5,0,20,0.9) 60%, rgba(0,0,0,0.95) 100%)",
          borderColor: "rgba(180,150,255,0.35)",
          boxShadow: "0 0 28px rgba(200,170,255,0.3)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-center px-4 py-2 border-b relative"
          style={{ borderColor: "rgba(180,150,255,0.25)" }}
        >
          <h2
            className="text-xl font-bold text-center"
            style={{
              background:
                "linear-gradient(90deg, #b892ff, #e0b3ff, #caa4ff, #b892ff)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              textShadow:
                "0 0 8px rgba(190,150,255,0.35), 0 0 16px rgba(240,200,255,0.25)",
            }}
          >
            Select What to Add
          </h2>
          <button
            className="absolute right-3 text-red-400 hover:text-red-200 text-xl px-1.5 rounded-lg transition hover:shadow-[0_0_12px_rgba(255,50,50,0.7)]"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Controls */}
        <div
          className="grid grid-cols-1 gap-2 px-3 py-2 border-b"
          style={{ borderColor: "rgba(180,150,255,0.25)" }}
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
              font-size: 0.85rem;
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

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="picker-input px-3 py-2 outline-none placeholder-white/70"
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
            <option value="value-desc">Sort: Value (High → Low)</option>
            <option value="value-asc">Sort: Value (Low → High)</option>
            <option value="demand-desc">Sort: Demand (High → Low)</option>
            <option value="demand-asc">Sort: Demand (Low → High)</option>
            <option value="name-asc">Sort: Name (A → Z)</option>
            <option value="name-desc">Sort: Name (Z → A)</option>
          </select>
        </div>

        {/* Grid */}
        <div
          className="overflow-y-auto flex-1 custom-scrollbar px-3 pb-3 pt-2"
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

          <div className="grid grid-cols-3 gap-2 justify-center">
            {unitsRaw.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-6">
                <div className="w-1/2 h-2 bg-[#220042] rounded-full overflow-hidden shadow-[0_0_18px_rgba(180,100,255,0.25)] mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-[#a663ff] via-[#e3b2ff] to-[#ffffff] animate-pulse"
                    style={{ width: "80%" }}
                  />
                </div>
                <h2 className="text-lg font-bold text-[#e0b3ff]">
                  Loading Units…
                </h2>
              </div>
            ) : (
              filtered.slice(0, 500).map((u, i) => (
                <button
                  key={i}
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
                  <MobileCompactUnitCard u={u} clickable={false} />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
