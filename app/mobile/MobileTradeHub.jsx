// app/mobile/MobileTradeHub.jsx
"use client";

import Link from "next/link";

export default function MobileTradeHub() {
  return (
    <div className="m-card" style={{ padding: 14 }}>
      <div className="m-title" style={{ marginBottom: 10 }}>Trade Hub</div>

      <div className="m-sub" style={{ marginBottom: 10 }}>
        Post, browse, and complete trades faster on mobile.
      </div>

      <Link className="m-btn" href="/tradecalculator">Open Calculator</Link>

      <div style={{ marginTop: 14 }}>
        <a className="m-btn" href="https://discord.gg/cUGkAtsFNT" target="_blank" rel="noopener noreferrer">
          Join Discord
        </a>
      </div>

      {/* You can mount your existing trade list in a compact slot below if needed */}
      <div style={{ marginTop: 12 }}>
        <div className="m-sub">Recent trades appear here (compact).</div>
      </div>
    </div>
  );
}
