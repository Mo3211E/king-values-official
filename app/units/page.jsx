/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as ColorConfig from "../colorConfig";
import Link from "next/link";
import UnitCard from "../components/UnitCard";
import CompactUnitCard from "../components/CompactUnitCard";
import GalaxyBackground from "../components/GalaxyBackground";
import Image from "next/image";

/* ----------------------- Safe adapters to colorConfig ----------------------- */

const SHINY_GOLD = ColorConfig.SHINY_GOLD || "#efbf04";

const getCategoryLabelColor =
  ColorConfig.getCategoryLabelColor ||
  ((cat) => {
    if (cat === "Units") return "#a9b0bb";
    if (cat === "Familiars") return "#3c78d8";
    if (cat === "Robux Items") return "#f9cb9c";
    return "#a9b0bb";
  });

const glowColors = {
  Shiny: "#efbf04",
  Rainbow: "#00e0ff",
  Dark: "#800080",
  Perfect: "#00ff88",
  Default: "#888",
};

function tryGetTitleColor(category, rawName) {
  const tries = [
    { fn: ColorConfig.getNameColor, two: true },
    { fn: ColorConfig.getNameColor, two: false },
  ];
  for (const t of tries) {
    if (typeof t.fn === "function") {
      try {
        const result = t.two ? t.fn(category, rawName) : t.fn(rawName);
        if (typeof result === "string" && result) return result;
      } catch { }
    }
  }
  return "#ffffff";
}

/* --------------------------------- Page ------------------------------------ */

export default function UnitsPage() {
  const [tab, setTab] = useState("All");
  const [showShiny, setShowShiny] = useState(true);
  const [showNormal, setShowNormal] = useState(true);
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("value");
  const [stableOnly, setStableOnly] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [search, setSearch] = useState("");
  const [unitsData, setUnitsData] = useState([]);
  const [progress, setProgress] = useState(90); // Start at 90%
  const [showGuidePopup, setShowGuidePopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize(); // set once on mount
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem("hasSeenGuide");
    if (!hasSeenGuide) {
      setShowGuidePopup(true);
      localStorage.setItem("hasSeenGuide", "true");
    }
  }, []);

  const unitBtnRef = useRef(null);
  const filterBtnRef = useRef(null);

const processedUnits = useMemo(() => {
  return (unitsData || [])
    .map((u) => {
      const val = String(u.Value || "").trim();
      let numericValue = Number(val);
      if (isNaN(numericValue)) numericValue = 0;

      // Give “Owner’s Choice” highest priority
      const priority =
        val.toLowerCase().includes("owner") ? 1e12 : numericValue;

      return {
        ...u,
        _value: priority,
        _name: String(u.Name || "").trim(),
        _category: String(u.Category || "").trim(),
      };
    })
    .filter((u) => u._name.length > 0);
}, [unitsData]);

  useEffect(() => {
    if (isMobile) setCompact(true);
  }, [isMobile]);

  useEffect(() => {
    async function fetchUnits() {
      try {
        const cached = sessionStorage.getItem("unitsCache");
if (cached) {
  setUnitsData(JSON.parse(cached));
  return;
}
        const res = await fetch("/api/units");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setUnitsData(data);
        sessionStorage.setItem("unitsCache", JSON.stringify(data));
      } catch (err) {
        console.error("Error loading units:", err);
      }
    }
    fetchUnits();
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (
        !unitBtnRef.current?.parentElement.contains(e.target) &&
        !filterBtnRef.current?.parentElement.contains(e.target)
      ) {
        setMenuOpen(false);
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!unitsData.length) {
      const timer = setTimeout(() => setProgress(100), 800); // Smooth finish
      return () => clearTimeout(timer);
    }
  }, [unitsData]);

  // 🔍 Fast, non-laggy search (same logic as UnitPickerModal)
  const filteredUnits = useMemo(() => {
    let list = processedUnits;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u) =>
        String(u._name || "").toLowerCase().includes(q) ||
        String(u.Justification || "").toLowerCase().includes(q) ||
        String(u.Obtainment || "").toLowerCase().includes(q) ||
        String(u["In Game Name"] || "").toLowerCase().includes(q)
      );
    }

    // Category (tab)
    if (tab !== "All") list = list.filter((u) => u._category === tab);

    // Shiny toggle
    if (tab === "Units" || tab === "All") {
      list = list.filter((u) => {
        const isShiny = u._name.startsWith("Shiny ");
        if (!showShiny && isShiny) return false;
        if (!showNormal && !isShiny) return false;
        return true;
      });
    }

    // Stable filter
    if (stableOnly)
      list = list.filter(
        (u) => u.Stability?.toLowerCase() === "stable"
      );

// Sort by value/demand
if (sortBy === "demand") {
  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  list = [...list].sort((a, b) => toNumber(b.Demand) - toNumber(a.Demand));
} else {
  list = [...list].sort((a, b) => {
  if (b._value !== a._value) return b._value - a._value;
  const da = Number(a.Demand) || 0;
  const db = Number(b.Demand) || 0;
  return db - da;
});

}

    return list;
  }, [
    processedUnits,
    search,
    tab,
    showShiny,
    showNormal,
    sortBy,
    stableOnly,
  ]);

  if (!unitsData.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0034] via-[#300060] to-[#0a0015]" />

        {/* Purple Stream Bar */}
        <div className="relative w-3/4 h-2 rounded-full overflow-hidden bg-[#220042] shadow-[0_0_20px_rgba(180,100,255,0.25)]">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#a663ff] via-[#e3b2ff] to-[#ffffff] transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <h1 className="mt-10 text-4xl font-extrabold tracking-widest drop-shadow-[0_0_20px_rgba(200,150,255,0.8)]">
          Loading Values...
        </h1>

        {/* Static Background Stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute w-[2px] h-[2px] bg-white rounded-full opacity-60"
              style={{
                top: `${(i * 97) % 100}%`,
                left: `${(i * 43) % 100}%`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full text-white overflow-visile">
      <GalaxyBackground />
      <div className="relative z-10">

        {/* ---------------- GUIDE POPUP ---------------- */}
        {showGuidePopup && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowGuidePopup(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-[90%] max-w-lg bg-[#0d0a1a] text-white rounded-2xl p-6 border border-[#b58bff]/40 shadow-[0_0_40px_rgba(180,140,255,0.4)] animate-fadeIn"
            >
              <button
                onClick={() => setShowGuidePopup(false)}
                className="absolute top-3 right-4 text-gray-400 hover:text-gray-200 text-2xl"
              >
                ✕
              </button>

              <h2 className="text-3xl font-bold text-[#cda6ff] mb-4 text-center">Values Guide</h2>

              <ul className="list-disc list-inside space-y-3 text-[1.05rem] leading-relaxed text-white/90">
              <li>STATE: Finalized, Live, & Accurate Values | 100% up to date</li>
                <li>
                  Rarities:{" "}
                  <span style={{ color: "#ffa0e4" }}>Exclusive</span> |{" "}
                  <span style={{ color: "#ff0000" }}>Secret</span> |{" "}
                  <span style={{ color: "#3c78d8" }}>Familiar</span> |{" "}
                  <span style={{ color: "#0aff69" }}>Mythic</span> |{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(90deg, red, orange, yellow, green, cyan, blue, violet)",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    Robux Item
                  </span>
                  {" "}| Vanguard Colors are special and reflect the Vanguard unit.
                </li>
                <li>Values are based on rerolls | 1 Value = 1 Tradeable RR</li>
                <li>Demand [1-10] - Displays desire from the community</li>
                <li>Stability - A value's measure of being consistent over time</li>
              </ul>
            </div>
          </div>
        )}

        {/* ---------------- VALUES TITLE ---------------- */}
        <div className="pt-8 pb-8 text-center">
          <h1
            className="font-extrabold text-[5rem] sm:text-[6rem] md:text-[6.5rem] leading-tight text-transparent bg-clip-text text-center mx-auto mt-[-15px] mb-[40px]"
            style={{
              backgroundImage: "linear-gradient(90deg, #c6a4ff, #f3b5ff, #b9b4ff, #c6a4ff)",
              backgroundSize: "300% 300%",
              animation: "titleGradient 12s ease-in-out infinite",
              textShadow: "0 0 40px rgba(198,164,255,0.35), 0 0 70px rgba(243,181,255,0.25)",
            }}
          >
            Values
          </h1>
        </div>

        {/* ---------------- CATEGORY BAR ---------------- */}
        <div className="relative category-bar flex items-center justify-center gap-3.5 mb-8 flex-nowrap">
          {/* Search bar (like UnitPickerModal) */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="px-4 py-2 outline-none placeholder-white/70 w-[150px] sm:w-[180px] md:w-[200px]"
            style={{
              background:
                "linear-gradient(145deg, rgba(35,0,70,0.9), rgba(15,0,35,0.85))",
              color: "white",
              border: "1px solid rgba(210,180,255,0.5)",
              boxShadow: "0 0 10px rgba(180,120,255,0.15)",
              borderRadius: "9999px",
            }}
          />

          <Chip label="All" active={tab === "All"} onClick={() => setTab("All")} />
          <div className="relative">
            <div ref={unitBtnRef} className="inline-block">
              <ChipWithIcon
                icon="/icons/units.png"
                label="Units"
                active={tab === "Units"}
                onClick={() => {
                  setTab("Units");
                  setMenuOpen((o) => !o);
                }}
              />
            </div>

            {menuOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 translate-y-[-100%] rounded-xl border border-white/35 bg-[linear-gradient(180deg,#111,#2a2a2a)] px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50">
                <div className="text-sm font-semibold mb-[2px]">Show:</div>
                <label className="flex items-center gap-3 text-sm mb-[2px]">
                  <input
                    type="checkbox"
                    className="accent-green"
                    checked={showShiny}
                    onChange={(e) => {
                      const v = e.target.checked;
                      if (!v && !showNormal) return;
                      setShowShiny(v);
                    }}
                  />
                  <span>Shiny Units</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-green"
                    checked={showNormal}
                    onChange={(e) => {
                      const v = e.target.checked;
                      if (!v && !showShiny) return;
                      setShowNormal(v);
                    }}
                  />
                  <span>Normal Units</span>
                </label>
              </div>
            )}
          </div>

          <ChipWithIcon
            icon="/icons/familiars.png"
            label="Familiars"
            active={tab === "Familiars"}
            onClick={() => setTab("Familiars")}
          />
          <ChipWithIcon
            icon="/icons/skins.png"
            label="Skins"
            active={tab === "Skins"}
            onClick={() => setTab("Skins")}
          />
          <ChipWithIcon
            icon="/icons/robux-items.png"
            label="Robux Items"
            active={tab === "Robux Items"}
            onClick={() => setTab("Robux Items")}
          />

          {/* Compact View Button (restored) */}
          <Chip
            label={compact ? "Normal View" : "Compact View"}
            active={compact}
            onClick={() => setCompact((c) => !c)}
            gradient
          />

          <div className="relative">
            <div ref={filterBtnRef} className="inline-block">
              <Chip
                label="Filter By"
                active={filterOpen}
                onClick={() => setFilterOpen((f) => !f)}
                gradient
              />
            </div>

            {filterOpen && (
              <div className="absolute left-full ml-3 -top-3 translate-y-[-50%] rounded-xl border border-white/35 bg-[linear-gradient(180deg,#111,#2a2a2a)] px-4 py-3 text-sm shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-[170px] z-50">
                <div className="font-semibold mb-1">Sort By:</div>
                <label className="flex items-center gap-2 mb-1 cursor-pointer">
                  <div
                    onClick={() => setSortBy("value")}
                    className={`w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${sortBy === "value" ? "bg-[#efbf04]" : "bg-transparent"
                      }`}
                  >
                    {sortBy === "value" && (
                      <div className="w-2 h-2 rounded-full bg-black" />
                    )}
                  </div>
                  <span>Value</span>
                </label>

                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <div
                    onClick={() => setSortBy("demand")}
                    className={`w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${sortBy === "demand" ? "bg-[#efbf04]" : "bg-transparent"
                      }`}
                  >
                    {sortBy === "demand" && (
                      <div className="w-2 h-2 rounded-full bg-black" />
                    )}
                  </div>
                  <span>Demand</span>
                </label>

                <label className="flex flex-nowrap items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setStableOnly((s) => !s)}
                    className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shrink-0"
                  >
                    {stableOnly && (
                      <div className="w-3 h-3 rounded-full bg-[#efbf04]" />
                    )}
                  </div>
                  <span className="font-semibold whitespace-nowrap">
                    Stable Cards Only
                  </span>
                </label>
              </div>
            )}
          </div>
    {/* Fixed Guide button (top-right, under navbar) */}
<button
  onClick={() => setShowGuidePopup(true)}
  className="fixed top-[85px] right-[25px] z-[900] flex items-center justify-center gap-2 h-[45px] px-5 rounded-full font-bold text-white transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_0_15px_rgba(190,140,255,0.4)]"
  title="Guide"
  style={{
    backgroundImage:
      'linear-gradient(#12001f, #0a0015), linear-gradient(45deg,#b57aff,#d4a6ff)',
    backgroundOrigin: 'padding-box, border-box',
    backgroundClip: 'padding-box, border-box',
    border: '2px solid transparent',
    borderRadius: '9999px',
  }}
>
  <span className="text-lg font-extrabold leading-none">?</span>
  <span>Guide</span>
</button>
        </div>

        {/* ---------------- GRID ---------------- */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(120,0,200,0.15), transparent 70%)",
            filter: "blur(60px)",
            zIndex: 0,
          }}
        />
        <div
          className="relative grid px-4 pb-8 z-10"
          style={{ gridTemplateColumns: "1fr auto 1fr" }}
        >
          <div
            className={`grid justify-center ${isMobile ? "mobile-grid" : ""}`}
            style={{
              gridColumn: "2 / 3",
              gap: isMobile ? "8px" : "20px",
              gridTemplateColumns: isMobile
                ? "repeat(auto-fill, minmax(95px, 1fr))"
                : compact
                  ? "repeat(9, 140px)"
                  : "repeat(6, 215px)",
              justifyItems: "center",
              alignItems: "start",
            }}
          >
            {filteredUnits.map((u) =>
              compact ? (
                <CompactUnitCard
                  key={`${u.Name}-${u.Category}-${u.Value}`}
                  u={u}
                />
              ) : (
                <UnitCard
                  key={`${u.Name}-${u.Category}-${u.Value}`}
                  u={u}
                  compact={false}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Chip Component ------------------------------ */

function Chip({ label, active, onClick, gradient = false }) {
  return (
    <button
      type="button"
      className={`chip ${active ? "active" : ""} flex items-center gap-1.5`}
      onClick={onClick}
    >
      <span>{label}</span>
      <style jsx>{`
        .chip {
          background: ${gradient
          ? "linear-gradient(180deg, #6900afff 0%, #000000ff 100%)"
          : "linear-gradient(180deg, #111, #2f2f2f)"
        };
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: #fff;
          border-radius: 9999px;
          padding: 0.42rem 0.92rem;
          font-weight: 800;
          letter-spacing: 0.2px;
          transition: transform 0.08s ease, box-shadow 0.15s ease;
        }
        .chip:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2),
            0 6px 20px rgba(0, 0, 0, 0.45);
        }
        .chip.active {
          background: ${gradient
          ? "linear-gradient(180deg, #6900afff 0%, #000000ff 100%)"
          : "linear-gradient(180deg, #222, #101010)"
        };
          border-color: rgba(255, 255, 255, 0.6);
          box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </button>
  );
}

/* ------------------------- CHIP WITH ICON COMPONENT ------------------------ */
function ChipWithIcon({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold border transition-all duration-150 ${active
        ? "border-white bg-[linear-gradient(180deg,#222,#101010)] shadow-[0_0_10px_rgba(255,255,255,0.25)]"
        : "border-white/40 bg-[linear-gradient(180deg,#111,#2f2f2f)]"
        } hover:scale-[1.05]`}
    >
      <Image
        src={icon}
        alt={label}
        width={26}
        height={26}
        className="select-none"
      />
      {label}
    </button>
  );
}

<style jsx global>{`
  @media (max-width: 768px) {
    /* 🌙 Mobile grid and scaling */
    .mobile-grid {
      width: 100%;
      max-width: 95vw;
      margin: 0 auto;
      display: grid;
      justify-items: center;
      align-items: start;
      grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
      gap: 8px;
      padding-bottom: 25px;
    }

    /* Compact card resizing */
    .unit-card,
    .compact-unit-card {
      transform: scale(0.8);
      transform-origin: top center;
      border-radius: 12px !important;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
      margin: 0 auto;
    }

    /* Clean buttons and category layout */
    .category-bar {
      display: flex;
      flex-wrap: nowrap;
      justify-content: center;
      gap: 6px 8px;
      margin-bottom: 1rem;
    }

    .chip {
      flex: 1 1 auto;
      text-align: center;
      min-width: 85px;
      max-width: 130px;
      padding: 0.25rem 0.55rem;
      font-size: 0.8rem;
    }

    /* Resize search bar */
    input[type="text"] {
      width: 120px !important;
      font-size: 0.9rem;
    }

    /* Compact titles */
    h1,
    h2 {
      margin-top: 0.4rem;
      margin-bottom: 0.4rem;
      font-size: 1.1rem;
    }

    /* Disable hover glow on mobile */
    .unit-card:hover,
    .compact-unit-card:hover {
      box-shadow: none !important;
    }
  }
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}
`}</style>



