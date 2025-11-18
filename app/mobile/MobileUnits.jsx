/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import GalaxyBackground from "../components/GalaxyBackground";
import MobileUnitCard from "../components/MobileUnitCard";
import MobileCompactUnitCard from "../components/MobileCompactUnitCard";

export default function MobileUnits() {
  const [tab, setTab] = useState("All");
  const [showShiny, setShowShiny] = useState(true);
  const [showNormal, setShowNormal] = useState(true);
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("value");
  const [stableOnly, setStableOnly] = useState(false);
  const [showGuidePopup, setShowGuidePopup] = useState(false);
  const [search, setSearch] = useState("");
  const [unitsData, setUnitsData] = useState([]);
  const [progress, setProgress] = useState(90);

  const unitBtnRef = useRef(null);
  const filterBtnRef = useRef(null);

  // Fetch units once
  useEffect(() => {
    async function fetchUnits() {
      try {
        const cached = sessionStorage.getItem("unitsCache");
        if (cached) {
          setUnitsData(JSON.parse(cached));
          return;
        }
        const res = await fetch("/api/units");
        if (!res.ok) throw new Error("Failed to fetch units");
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data.data || [];
        setUnitsData(arr);
        sessionStorage.setItem("unitsCache", JSON.stringify(arr));
      } catch (err) {
        console.error("Error loading units:", err);
      }
    }
    fetchUnits();
  }, []);

  // Loading bar finish
  useEffect(() => {
    if (!unitsData.length) {
      const t = setTimeout(() => setProgress(100), 800);
      return () => clearTimeout(t);
    }
  }, [unitsData]);

  // Show guide popup once (shared key with desktop)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSeenGuide = localStorage.getItem("hasSeenGuide");
    if (!hasSeenGuide) {
      setShowGuidePopup(true);
      localStorage.setItem("hasSeenGuide", "true");
    }
  }, []);

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e) {
      if (
        unitBtnRef.current &&
        !unitBtnRef.current.contains(e.target) &&
        filterBtnRef.current &&
        !filterBtnRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Preprocess units with numeric value & cached fields
  const processedUnits = useMemo(() => {
    return (unitsData || [])
      .map((u) => {
        const valStr = String(u.Value || "").trim();
        let numericValue = Number(valStr);
        if (Number.isNaN(numericValue)) numericValue = 0;
        const priority = valStr.toLowerCase().includes("owner")
          ? 1e12
          : numericValue;

        return {
          ...u,
          _value: priority,
          _name: String(u.Name || "").trim(),
          _category: String(u.Category || "").trim(),
        };
      })
      .filter((u) => u._name.length > 0);
  }, [unitsData]);

  // Filtering + sorting
  const filteredUnits = useMemo(() => {
    let list = processedUnits;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u) => {
        const name = u._name.toLowerCase();
        const inGame = String(u["In Game Name"] || "").toLowerCase();
        const just = String(u.Justification || "").toLowerCase();
        const obt = String(u.Obtainment || "").toLowerCase();
        return (
          name.includes(q) ||
          inGame.includes(q) ||
          just.includes(q) ||
          obt.includes(q)
        );
      });
    }

    if (tab !== "All") {
      list = list.filter((u) => u._category === tab);
    }

    if (tab === "Units" || tab === "All") {
      list = list.filter((u) => {
        const shiny = u._name.startsWith("Shiny ");
        if (!showShiny && shiny) return false;
        if (!showNormal && !shiny) return false;
        return true;
      });
    }

    if (stableOnly) {
      list = list.filter(
        (u) => String(u.Stability || "").toLowerCase() === "stable"
      );
    }

    if (sortBy === "demand") {
      const num = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };
      list = [...list].sort((a, b) => num(b.Demand) - num(a.Demand));
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

  // Loading screen
  if (!unitsData.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0034] via-[#300060] to-[#0a0015]" />
        <div className="relative w-3/4 h-2 rounded-full overflow-hidden bg-[#220042] shadow-[0_0_20px_rgba(180,100,255,0.25)]">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#a663ff] via-[#e3b2ff] to-[#ffffff] transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <h1 className="mt-10 text-3xl font-extrabold tracking-[0.35em] drop-shadow-[0_0_20px_rgba(200,150,255,0.8)]">
          Loading Values...
        </h1>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <GalaxyBackground />

      <div className="relative z-10">
        {/* GUIDE POPUP (centered like desktop, close on X only) */}
{showGuidePopup && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm min-h-screen"
       onClick={() => setShowGuidePopup(false)}>
    <div
      className="relative w-[90%] max-w-lg bg-[#0d0a1a] text-white rounded-2xl p-6 border border-[#b58bff]/40 shadow-[0_0_40px_rgba(180,140,255,0.4)]"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setShowGuidePopup(false)}
        className="absolute top-3 right-4 text-gray-300 hover:text-white text-2xl z-[10000]"
      >
        ✕
      </button>

      <h2 className="text-2xl font-bold text-[#cda6ff] mb-4 text-center">
        Values Guide
      </h2>

      <ul className="list-disc list-inside space-y-2 text-[0.95rem] leading-relaxed text-white/90">
        <li>STATE: Finalized, Live & Accurate Values (100% up to date)</li>
        <li>Rarities: Exclusive, Secret, Familiar, Mythic, Robux</li>
        <li>Values are based on rerolls | 1 Value = 1 tradable RR</li>
        <li>Demand [1–10] reflects community desirability</li>
        <li>Stability represents value consistency over time</li>
      </ul>
    </div>
  </div>
)}


        {/* Fixed Guide button under navbar */}
        <button
          onClick={() => setShowGuidePopup(true)}
          className="fixed top-[75px] right-4 z-[900] flex items-center justify-center gap-1.5 h-[40px] px-4 rounded-full font-bold text-[0.95rem] hover:scale-[1.05] transition-all"
          style={{
            backgroundImage:
              "linear-gradient(#12001f,#0a0015),linear-gradient(45deg,#b57aff,#d4a6ff)",
            backgroundOrigin: "padding-box,border-box",
            backgroundClip: "padding-box,border-box",
            border: "2px solid transparent",
          }}
        >
          <span className="text-lg font-extrabold">?</span>
          <span>Guide</span>
        </button>

        {/* TITLE */}
        <div className="pt-16 pb-4 text-center">
          <h1
            className="font-extrabold text-[2.7rem] text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(90deg,#c6a4ff,#f3b5ff,#b9b4ff,#c6a4ff)",
              backgroundSize: "300% 300%",
              animation: "titleGradient 12s ease-in-out infinite",
            }}
          >
            Values
          </h1>
        </div>

        {/* CATEGORY / CONTROLS BAR */}
        <div className="px-3 mb-2">
          <div className="relative">
            {/* SCROLLABLE CATEGORY CHIPS */}
           <div id="chipRow" className="flex items-center gap-2 overflow-x-scroll whitespace-nowrap rounded-2xl bg-black/40 px-2 py-2 scroll-smooth scrollbar-thin scrollbar-thumb-[#a883ff] scrollbar-track-[#1a0034]">
              {/* REAL SCROLLBAR UNDER CATEGORIES */}
<div
  className="w-full h-3 overflow-x-auto scrollbar-thin scrollbar-thumb-[#a883ff] scrollbar-track-[#1a0034]"
  onScroll={(e) => {
    const scrollPos = e.currentTarget.scrollLeft;
    const chips = document.getElementById("chipRow");
    if (chips) chips.scrollLeft = scrollPos;
  }}
>
  <div className="h-full" style={{ width: "200%" }}></div>
</div>

              {/* Search */}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="px-3 py-[0.35rem] rounded-full text-sm flex-shrink-0 min-w-[120px]"
                style={{
                  background:
                    "linear-gradient(145deg,rgba(35,0,70,0.9),rgba(15,0,35,0.85))",
                  border: "1px solid rgba(210,180,255,0.5)",
                  color: "white",
                }}
              />

              <ChipMobile
                label="All"
                active={tab === "All"}
                onClick={() => {
                  setTab("All");
                  setMenuOpen(false);
                }}
              />

              {/* Units with Shiny/Normal popup */}
              <div className="relative flex-shrink-0" ref={unitBtnRef}>
                <ChipWithIconMobile
                  icon="/icons/units.png"
                  label="Units"
                  active={tab === "Units"}
                  onClick={() => {
                    setTab("Units");
                    setMenuOpen((o) => !o);
                  }}
                />
                {menuOpen && (
                  <div className="absolute bottom-[115%] left-1/2 -translate-x-1/2 w-[180px] rounded-xl border border-white/35 bg-[linear-gradient(180deg,#111,#2a2a2a)] px-3 py-2 text-xs shadow-[0_10px_35px_rgba(0,0,0,0.45)] z-[9999]">
                    <div className="font-semibold mb-1">Show:</div>

                    <label className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        className="accent-green-400"
                        checked={showShiny}
                        onChange={(e) => {
                          const v = e.target.checked;
                          if (!v && !showNormal) return;
                          setShowShiny(v);
                        }}
                      />
                      <span>Shiny Units</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="accent-green-400"
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

              <ChipWithIconMobile
                icon="/icons/familiars.png"
                label="Familiars"
                active={tab === "Familiars"}
                onClick={() => {
                  setTab("Familiars");
                  setMenuOpen(false);
                }}
              />

              <ChipWithIconMobile
                icon="/icons/skins.png"
                label="Skins"
                active={tab === "Skins"}
                onClick={() => {
                  setTab("Skins");
                  setMenuOpen(false);
                }}
              />

              <ChipWithIconMobile
                icon="/icons/robux-items.png"
                label="Robux"
                active={tab === "Robux Items"}
                onClick={() => {
                  setTab("Robux Items");
                  setMenuOpen(false);
                }}
              />

              {/* Compact toggle */}
              <ChipMobile
                label={compact ? "Normal" : "Compact"}
                active={compact}
                onClick={() => setCompact((c) => !c)}
                gradient
              />

              {/* Filter menu */}
              <div className="relative flex-shrink-0" ref={filterBtnRef}>
                <ChipMobile
                  label="Filter"
                  active={filterOpen}
                  onClick={() => setFilterOpen((o) => !o)}
                  gradient
                />

                {filterOpen && (
                  <div className="absolute bottom-[115%] right-0 w-[190px] rounded-xl border border-white/35 bg-[linear-gradient(180deg,#111,#2a2a2a)] px-3 py-2 text-xs shadow-[0_10px_35px_rgba(0,0,0,0.45)] z-[9999]">
                    <div className="font-semibold mb-1">Sort By:</div>

                    <label className="flex items-center gap-2 mb-1 cursor-pointer">
                      <div
                        onClick={() => setSortBy("value")}
                        className={`w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                          sortBy === "value" ? "bg-[#efbf04]" : "bg-transparent"
                        }`}
                      >
                        {sortBy === "value" && (
                          <div className="w-2 h-2 rounded-full bg-black" />
                        )}
                      </div>
                      <span>Value</span>
                    </label>

                    <label className="flex items-center gap-2 mb-2 cursor-pointer">
                      <div
                        onClick={() => setSortBy("demand")}
                        className={`w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                          sortBy === "demand"
                            ? "bg-[#efbf04]"
                            : "bg-transparent"
                        }`}
                      >
                        {sortBy === "demand" && (
                          <div className="w-2 h-2 rounded-full bg-black" />
                        )}
                      </div>
                      <span>Demand</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => setStableOnly((s) => !s)}
                        className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
                      >
                        {stableOnly && (
                          <div className="w-3 h-3 rounded-full bg-[#efbf04]" />
                        )}
                      </div>
                      <span>Stable Only</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
            {/* Browser's horizontal scrollbar shows under this container */}
          </div>
        </div>

        {/* GRID */}
        <div className="px-3 pb-10">
          <div
            className={
              compact
                ? "grid grid-cols-3 gap-2 justify-items-center"
                : "grid grid-cols-2 gap-2 justify-items-center"
            }
          >
            {filteredUnits.map((u) =>
              compact ? (
                <MobileCompactUnitCard key={u.Name} u={u} />
              ) : (
                <MobileUnitCard key={u.Name} u={u} />
              )
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

/* Small chip components for mobile */

function ChipMobile({ label, active, onClick, gradient }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-[0.3rem] rounded-full text-[0.8rem] font-semibold whitespace-nowrap flex-shrink-0 ${
        active
          ? "shadow-[0_0_10px_rgba(255,255,255,0.25)] border-white/70"
          : "border-white/40"
      }`}
      style={{
        background: gradient
          ? "linear-gradient(180deg,#6900af 0%,#000 100%)"
          : "linear-gradient(180deg,#111,#2f2f2f)",
        border: "1px solid rgba(255,255,255,0.35)",
      }}
    >
      {label}
    </button>
  );
}

function ChipWithIconMobile({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-[0.3rem] rounded-full text-[0.8rem] font-semibold whitespace-nowrap flex-shrink-0 ${
        active
          ? "shadow-[0_0_10px_rgba(255,255,255,0.25)] border-white/70"
          : "border-white/40"
      }`}
      style={{
        background: "linear-gradient(180deg,#111,#2f2f2f)",
        border: "1px solid rgba(255,255,255,0.4)",
      }}
    >
      <img
        src={icon}
        alt={label}
        width={18}
        height={18}
        className="select-none"
      />
      <span>{label}</span>
    </button>
  );
}
