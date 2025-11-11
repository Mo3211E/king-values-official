// app/mobile/MobileHome.jsx
"use client";

import Link from "next/link";

export default function MobileHome() {
  return (
    <div className="m-card" style={{ padding: 16 }}>
      <div className="m-title" style={{ marginBottom: 8 }}>
        AV Values — Mobile
      </div>
      <div className="m-sub" style={{ marginBottom: 14 }}>
        Lightning-fast on mobile with the same galaxy vibe.
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <Link href="/units" className="m-btn">Browse Values</Link>
        <Link href="/tradehub" className="m-btn">Trade Hub</Link>
        <Link href="/tradecalculator" className="m-btn">Open Calculator</Link>
        <a
          className="m-btn"
          href="https://discord.gg/cUGkAtsFNT"
          target="_blank"
          rel="noopener noreferrer"
        >
          Join Discord
        </a>
      </div>
    </div>
  );
}
