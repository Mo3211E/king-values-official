// app/mobile/MobileUnitPage.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function MobileUnitPage() {
  const { id } = useParams();
  const router = useRouter();
  const [unit, setUnit] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/unit/${encodeURIComponent(id)}`, { cache: "no-store" });
      const data = await res.json();
      setUnit(data && !data.error ? data : null);
    })();
  }, [id]);

  if (!unit) {
    return (
      <div className="m-card" style={{ padding: 16 }}>
        <div className="m-title">Unit not found</div>
        <button className="m-btn" style={{ marginTop: 10 }} onClick={() => router.back()}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="m-card" style={{ padding: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
        <button className="m-btn" onClick={() => router.back()} aria-label="Back">←</button>
        <div className="m-title" style={{ fontSize: "1.1rem" }}>{unit.Name}</div>
      </div>

      <img src={unit.Image || "/placeholder.png"} alt="" className="m-unit-img" />

      <div style={{ marginTop: 10 }}>
        <div className="m-kv"><span>Value</span><span>{unit.Value ?? "N/A"}</span></div>
        <div className="m-kv"><span>Demand</span><span>{unit.Demand ?? "N/A"}</span></div>
        <div className="m-kv"><span>Stability</span><span>{unit.Stability ?? "N/A"}</span></div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div className="m-title" style={{ fontSize: "1rem", marginBottom: 6 }}>Details</div>
        <div className="m-sub">IGN: {unit["In Game Name"] ?? "N/A"}</div>
        <div className="m-sub">Obtainment: {unit.Obtainment ?? "N/A"}</div>
        <div className="m-sub">Justification: {unit.Justification ?? "N/A"}</div>
      </div>
    </div>
  );
}
