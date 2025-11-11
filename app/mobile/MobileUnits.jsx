// app/mobile/MobileUnits.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function toPriorityValue(v) {
  const s = String(v || "").toLowerCase();
  if (s.includes("owner")) return 1e12;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function MobileUnits() {
  const [units, setUnits] = useState([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("value"); // value | demand

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/units", { cache: "no-store" });
      const data = await res.json();
      setUnits(Array.isArray(data) ? data : []);
    })();
  }, []);

  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    let list = units
      .map((u) => ({
        ...u,
        _value: toPriorityValue(u.Value),
        _name: String(u.Name || "").trim(),
        _ign: String(u["In Game Name"] || "").trim(),
      }))
      .filter((u) =>
        qn.length === 0
          ? true
          : u._name.toLowerCase().includes(qn) ||
            u._ign.toLowerCase().includes(qn)
      );

    if (sort === "demand") {
      const toNum = (v) => (Number.isFinite(+v) ? +v : 0);
      list = list.sort((a, b) => toNum(b.Demand) - toNum(a.Demand));
    } else {
      list = list.sort((a, b) => b._value - a._value);
    }
    return list;
  }, [units, q, sort]);

  return (
    <div className="m-card" style={{ padding: 12 }}>
      <div className="m-title" style={{ marginBottom: 12 }}>Values</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name / IGN"
          style={{
            flex: 1,
            minHeight: 40,
            borderRadius: 12,
            border: "1px solid rgba(190,160,255,0.25)",
            background: "rgba(10,7,18,0.6)",
            color: "#fff",
            padding: "0 12px",
          }}
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            minHeight: 40,
            borderRadius: 12,
            border: "1px solid rgba(190,160,255,0.25)",
            background: "rgba(10,7,18,0.6)",
            color: "#fff",
            padding: "0 10px",
          }}
        >
          <option value="value">Sort: Value</option>
          <option value="demand">Sort: Demand</option>
        </select>
      </div>

      <div className="m-grid">
        {filtered.map((u) => (
          <Link
            key={u._id || u.Name}
            href={`/units/${encodeURIComponent(u.Name)}`}
            className="m-card"
            style={{ padding: 10 }}
          >
            <div
              className="m-title"
              style={{ fontSize: "1.05rem", marginBottom: 6 }}
            >
              {u.Name}
            </div>
            <img src={u.Image || "/placeholder.png"} alt="" className="m-unit-img" />
            <div className="m-kv"><span>Value</span><span>{u.Value ?? "N/A"}</span></div>
            <div className="m-kv"><span>Demand</span><span>{u.Demand ?? "N/A"}</span></div>
            <div className="m-kv"><span>Stability</span><span>{u.Stability ?? "N/A"}</span></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
