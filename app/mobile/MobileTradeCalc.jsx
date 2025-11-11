// app/mobile/MobileTradeCalc.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function toNumber(v) {
  const s = String(v || "").toLowerCase();
  if (s.includes("owner")) return 1e12;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function MobileTradeCalc() {
  const [you, setYou] = useState([]);
  const [other, setOther] = useState([]);

  // Restore pending trade from sessionStorage (keeps desktop logic consistent)
  useEffect(() => {
    const saved = sessionStorage.getItem("pendingTradeUnits");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.you) setYou(data.you);
        if (data.other) setOther(data.other);
      } catch {}
    }
  }, []);

  const youTotal = useMemo(() => you.reduce((s, u) => s + toNumber(u.Value), 0), [you]);
  const otherTotal = useMemo(() => other.reduce((s, u) => s + toNumber(u.Value), [other]));
  const diff = otherTotal - youTotal;

  const verdict =
    diff === 0 ? { t: "Fair", c: "#aaa" }
    : diff > 0 ? { t: `Win (+${diff.toLocaleString()})`, c: "#4ade80" }
               : { t: `Loss (${Math.abs(diff).toLocaleString()})`, c: "#ef4444" };

  return (
    <div className="m-card" style={{ padding: 14 }}>
      <div className="m-title" style={{ marginBottom: 10 }}>Trade Calculator</div>

      {/* Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <Link className="m-btn" href="/units">Add Units</Link>
        <button
          className="m-btn"
          onClick={() => {
            sessionStorage.setItem("pendingTradeUnits", JSON.stringify({ you: [], other: [] }));
            setYou([]); setOther([]);
          }}
        >
          Clear
        </button>
      </div>

      {/* Boxes */}
      <div className="m-grid" style={{ marginBottom: 10 }}>
        <div className="m-card" style={{ padding: 10 }}>
          <div className="m-title" style={{ marginBottom: 6 }}>You</div>
          <div style={{ display: "grid", gap: 8 }}>
            {you.length === 0 && <div className="m-sub">No units added yet.</div>}
            {you.map((u, i) => (
              <button
                key={i}
                className="m-card"
                style={{ padding: 8, textAlign: "left" }}
                onClick={() => {
                  sessionStorage.setItem("pendingTradeUnits", JSON.stringify({ you, other }));
                  window.location.href = `/units/${encodeURIComponent(u.Name)}`;
                }}
              >
                <div className="m-title" style={{ fontSize: "1rem" }}>{u.Name}</div>
                <div className="m-kv"><span>Value</span><span>{u.Value ?? "N/A"}</span></div>
                <div className="m-kv"><span>Demand</span><span>{u.Demand ?? "N/A"}</span></div>
              </button>
            ))}
          </div>
        </div>

        <div className="m-card" style={{ padding: 10 }}>
          <div className="m-title" style={{ marginBottom: 6 }}>Other</div>
          <div style={{ display: "grid", gap: 8 }}>
            {other.length === 0 && <div className="m-sub">No units added yet.</div>}
            {other.map((u, i) => (
              <button
                key={i}
                className="m-card"
                style={{ padding: 8, textAlign: "left" }}
                onClick={() => {
                  sessionStorage.setItem("pendingTradeUnits", JSON.stringify({ you, other }));
                  window.location.href = `/units/${encodeURIComponent(u.Name)}`;
                }}
              >
                <div className="m-title" style={{ fontSize: "1rem" }}>{u.Name}</div>
                <div className="m-kv"><span>Value</span><span>{u.Value ?? "N/A"}</span></div>
                <div className="m-kv"><span>Demand</span><span>{u.Demand ?? "N/A"}</span></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div className="m-card" style={{ padding: 10 }}>
        <div className="m-kv">
          <span>Total (You)</span>
          <span>{youTotal.toLocaleString()}</span>
        </div>
        <div className="m-kv">
          <span>Total (Other)</span>
          <span>{otherTotal.toLocaleString()}</span>
        </div>
        <div className="m-kv" style={{ fontWeight: 800, color: verdict.c }}>
          <span>Result</span>
          <span>{verdict.t}</span>
        </div>
      </div>
    </div>
  );
}
