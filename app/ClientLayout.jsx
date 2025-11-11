"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import GalaxyBackground from "./components/GalaxyBackground";
import NavBar from "./components/NavBar";
import ScrollFade from "./components/ScrollFade";

const MobileLayout = dynamic(() => import("./mobile/MobileLayout"), { ssr: false });

export default function ClientLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) return <MobileLayout>{children}</MobileLayout>;

  return (
    <>
      <GalaxyBackground />
      <ScrollFade />
      <NavBar />
      <main className="relative z-10 pt-28">{children}</main>
    </>
  );
}
