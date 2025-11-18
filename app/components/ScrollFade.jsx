"use client";

import { useEffect, useRef } from "react";

export default function ScrollFade() {
  const timer = useRef(null);

  useEffect(() => {
    const root = document.documentElement;

    // Detect current page for dynamic glow
    const path = window.location.pathname.toLowerCase();
    root.classList.remove("page-home", "page-units", "page-calculator", "page-tradehub");
    if (path === "/" || path.includes("home")) root.classList.add("page-home");
    else if (path.includes("units")) root.classList.add("page-units");
    else if (path.includes("trade-calculator")) root.classList.add("page-calculator");
    else if (path.includes("trade-hub")) root.classList.add("page-tradehub");

    const show = () => {
      root.classList.add("scrolling");
      if (timer.current) clearTimeout(timer.current);
      // Remove after delay
      timer.current = setTimeout(() => {
        root.classList.remove("scrolling");
      }, 900);
    };

    window.addEventListener("scroll", show, { passive: true });
    window.addEventListener("wheel", show, { passive: true });
    window.addEventListener("touchmove", show, { passive: true });

    return () => {
      window.removeEventListener("scroll", show);
      window.removeEventListener("wheel", show);
      window.removeEventListener("touchmove", show);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return null;
}
