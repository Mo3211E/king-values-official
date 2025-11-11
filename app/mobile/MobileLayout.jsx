// app/mobile/MobileLayout.jsx
"use client";

import { usePathname } from "next/navigation";
import "./../styles/mobile.css";
import MobileNavBar from "./MobileNavBar";
import MobileHome from "./MobileHome";
import MobileUnits from "./MobileUnits";
import MobileUnitPage from "./MobileUnitPage";
import MobileTradeHub from "./MobileTradeHub";
import MobileTradeCalc from "./MobileTradeCalc";

export default function MobileLayout({ children }) {
  const pathname = usePathname();

  const which = (() => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/units/") && pathname !== "/units") return "unit";
    if (pathname.startsWith("/units")) return "units";
    if (pathname.startsWith("/tradehub")) return "tradehub";
    if (pathname.startsWith("/tradecalculator")) return "tradecalc";
    return "fallback";
  })();

  return (
    <div className="mobile-bg">
      <div className="mobile-wrap">
        {which === "home" && <MobileHome />}
        {which === "units" && <MobileUnits />}
        {which === "unit" && <MobileUnitPage />}
        {which === "tradehub" && <MobileTradeHub />}
        {which === "tradecalc" && <MobileTradeCalc />}
        {which === "fallback" && (
          <div className="m-card" style={{ padding: 14 }}>
            <div className="m-title">Loading…</div>
            <div className="m-sub">This page is not yet mobile-optimized. Using fallback.</div>
            <div style={{ marginTop: 10 }}>{children}</div>
          </div>
        )}
      </div>

      <MobileNavBar />
    </div>
  );
}
