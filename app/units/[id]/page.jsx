"use client";

import { useParams, useRouter } from "next/navigation";
import unitsData from "../../data/units.json";
import * as ColorConfig from "../../colorConfig";
import UnitCard from "../../components/UnitCard";
import { useEffect } from "react";
import VoteBox from "../../components/VoteBox";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* --------------------- Shared visual constants --------------------- */
const SHINY_GOLD = ColorConfig.SHINY_GOLD || "#efbf04";
const CARD_BG =
  "linear-gradient(180deg, rgba(12,24,50,0.98) 0%, rgba(7,18,40,0.98) 100%)";

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
      } catch {}
    }
  }
  return "#ffffff";
}

function splitName(raw) {
  if (!raw) return { shiny: "", base: "", firstWord: "" };
  const parts = raw.trim().split(/\s+/);
  const firstWord = parts[0] || "";
  if (raw.startsWith("Shiny ")) {
    return { shiny: "Shiny", base: raw.slice(6).trim(), firstWord };
  }
  return { shiny: "", base: raw, firstWord };
}

function fmt(v) {
  if (v === undefined || v === null || v === "") return "N/A";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString();
}

/* ----------------------------- Page ----------------------------- */

export default function UnitPage({ params }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
const { id } = useParams();
const router = useRouter();
const decodedId = decodeURIComponent(id).toLowerCase().trim();

const unit = unitsData.find(
  (u) => u.Name?.toLowerCase().trim() === decodedId
);

  if (!unit) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <h1 className="text-3xl font-bold">Unit not found.</h1>
      </div>
    );
  }

const Name = unit.Name || unit.name || "Unknown";
const Category = unit.Category || unit.category || "Units";
const Obtainment = unit.Obtainment || unit.obtainment || "Unknown";
const Justification =
unit.Justification || unit.justification || "Added via CSV sync";
const ValueHistory = unit.ValueHistory || unit.valueHistory || [];


  const { shiny, base } = splitName(Name);
  const baseNameColor = tryGetTitleColor(Category, shiny ? base : Name);

  return (
    <div
      className="min-h-screen text-white p-8 flex flex-col items-center"
      style={{
        background: "linear-gradient(180deg, #0a001a 0%, #12003a 100%)",
      }}
    >
      {/* Back Arrow (under navbar, top-left corner) */}
<div
  onClick={() => {
    const prevScroll = sessionStorage.getItem("scrollPos");
    router.back();
    if (prevScroll) {
      setTimeout(() => window.scrollTo(0, parseFloat(prevScroll)), 250);
    }
  }}
  className="absolute top-20 left-8 cursor-pointer flex items-center group transition-transform hover:scale-105"
>
  <img
    src="/icons/back-arrow.png" // 👈 place your arrow image here (see Step 3)
    alt="Go Back"
    className="w-6 h-6 mr-2 transition-all group-hover:brightness-150"
    style={{
      filter:
        "brightness(1.2) saturate(1.2) drop-shadow(0 0 8px rgba(192,192,192,0.4))",
    }}
  />
  <span
    className="text-lg font-extrabold"
    style={{
      background:
        "linear-gradient(90deg, #C0C0C0, #E8E8E8, #C0C0C0)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textShadow:
        "0 0 10px rgba(255,255,255,0.4), 0 0 20px rgba(180,180,180,0.3)",
    }}
  >
    Back
  </span>
</div>

      <h1 className="text-4xl font-extrabold mb-8">{Name}</h1>

      {/* main two-column layout */}
      <div className="flex flex-col md:flex-row gap-10 items-start w-full max-w-6xl">
        {/* ------------------- Left: card replica (click to go back) ------------------- */}
        <div className="flex flex-col items-center">
          <div className="text-center mb-3 text-2xl font-extrabold text-[#C0C0C0]">
            Click to go to Values
          </div>

          <UnitCard
            u={unit}
            compact={false}
            isLink={false}
            onClick={() => router.push("/units")}
          />
          {/* Voting Section */}
<VoteBox unitId={unit._id || unit.Name} />
        </div>

        {/* ------------------- Right: information + chart ------------------- */}
        <div className="flex-1 space-y-6">
          {unit.InGameName && (
  <div>
    <h2 className="text-2xl font-bold text-[#efbf04] mb-1">In Game Name:</h2>
    <p className="text-white/85">{unit.InGameName}</p>
  </div>
)}
{unit["In Game Name"] && (
  <div className="flex items-center flex-wrap gap-2">
    <h2 className="text-2xl font-bold text-[#efbf04] mb-1">In Game Name:</h2>
    <p className="text-white/85 text-2xl mb-1">{unit["In Game Name"]}</p>
  </div>
)}

          <div>
            <h2 className="text-2xl font-bold text-[#efbf04] mb-1">Obtainment:</h2>
            <p className="text-white/85">{Obtainment ?? "N/A"}</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#efbf04] mb-1">Justification:</h2>
            <p className="text-white/85">{Justification ?? "N/A"}</p>
          </div>

          <div className="bg-black/40 rounded-xl p-5 mt-6">
            <h2 className="text-xl font-semibold mb-2">Value History</h2>
            <ValueHistoryChart data={ValueHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Value History Chart ---------------------- */
function ValueHistoryChart({ data }) {
  if (!data || data.length === 0)
    return (
      <div className="text-white/60 text-center">
        No value history data available.
      </div>
    );

  const first = data[0].value;
  const last = data[data.length - 1].value;
  const trend =
    last > first ? "positive" : last < first ? "negative" : "neutral";

  const lineColor =
    trend === "positive"
      ? "#4ade80" // green
      : trend === "negative"
      ? "#ef4444" // red
      : "#a3a3a3"; // grey

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={data}
        margin={{ top: 15, right: 25, left: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#aaa", fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#aaa", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(0,0,0,0.8)",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          labelStyle={{ color: "#fff" }}
          formatter={(value) => [`${value}`, "Value"]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={3}
          dot={{ fill: lineColor, strokeWidth: 1, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
