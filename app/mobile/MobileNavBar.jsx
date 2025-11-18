"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function MobileNavBar() {
  const [shootingStars, setShootingStars] = useState([]);
  const [scrollVisible, setScrollVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  // 🌌 Horizontal glow streams (same as desktop, but fewer + optimized for mobile)
  useEffect(() => {
    const colors = [
      "linear-gradient(to right, rgba(255,255,255,0), rgba(255,215,245,0.9), rgba(255,190,230,0.7), rgba(255,255,255,0))",
      "linear-gradient(to right, rgba(255,255,255,0), rgba(250,210,255,0.8), rgba(255,160,220,0.7), rgba(255,255,255,0))",
    ];

    const arr = Array.from({ length: 22 }).map((_, i) => ({
      top: `${(i * 4.5) % 100}%`,
      left: `${Math.random() * 100}%`,
      color: colors[Math.floor(Math.random() * colors.length)],
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${3 + Math.random() * 2}s`,
    }));

    setShootingStars(arr);
  }, []);

  // 📜 Scroll hide/show identical to desktop
  useEffect(() => {
    const handleScroll = () => {
      const curr = window.scrollY;
      if (curr > lastScroll && curr > 45) {
        setScrollVisible(false);
      } else {
        setScrollVisible(true);
      }
      setLastScroll(curr);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  // 🔗 Navigation
  const navItems = [
    { href: "/units", label: "Values", icon: "/icons/values.png" },
    {
      href: "/trade-calculator",
      label: "Trade Calc",
      icon: "/icons/trade-calculator.png",
    },
    { href: "/trade-hub", label: "Trade Hub", icon: "/icons/trade-hub.png" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full px-4 py-2 flex items-center justify-between z-50 overflow-visible transition-all duration-700 ${
        scrollVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-10 pointer-events-none"
      }`}
    >
      {/* 💫 Mobile horizontal streams */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {shootingStars.map((s, i) => (
          <div
            key={i}
            className="mobile-stream"
            style={{
              top: s.top,
              left: s.left,
              animationDelay: s.animationDelay,
              animationDuration: s.animationDuration,
              background: s.color,
            }}
          />
        ))}
      </div>

      {/* ◀️ Logo + Title (scaled down for mobile but identical style) */}
      <Link
        href="/"
        className="z-10 cursor-pointer select-none flex items-center gap-1.5"
      >
        <Image
          src="/logo.png"
          alt="AV Logo"
          width={32}
          height={32}
          unoptimized
          priority
          className="transition-transform duration-300 hover:scale-105"
          style={{
            filter: `
              drop-shadow(0 0 5px rgba(255, 230, 180, 0.45))
              drop-shadow(0 0 10px rgba(255, 210, 150, 0.25))
              drop-shadow(0 0 16px rgba(255, 230, 255, 0.25))
            `,
          }}
        />

        <h1
          className="font-extrabold text-[1.35rem] leading-[1.15] bg-clip-text text-transparent transition-all duration-300 hover:scale-[1.05]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #ffe6ff, #f7d9ff, #ffffff, #ffe6ff)",
            backgroundSize: "300% 300%",
            animation: "titleGradient 12s ease-in-out infinite",
            WebkitTextStroke: "0.45px rgba(255, 215, 130, 0.35)",
            textShadow: `
              0 0 8px rgba(255, 230, 180, 0.25),
              0 0 14px rgba(255, 210, 150, 0.15),
              0 0 18px rgba(255, 230, 255, 0.15)
            `,
          }}
        >
          King Values
        </h1>
      </Link>

      {/* 🔹 Mobile Nav Buttons (scaled perfectly) */}
      <div className="z-10 flex space-x-2">
        {navItems.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="flex items-center gap-1 px-2.5 py-[0.25rem] rounded-md transition-all duration-200 hover:scale-[1.04]"
            style={{
              background:
                "linear-gradient(145deg, rgba(35,0,70,0.85), rgba(15,0,35,0.7))",
              border: "1px solid rgba(240,200,255,0.45)",
              boxShadow: "0 0 4px rgba(255,220,255,0.18)",
              color: "#fff0ff",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 10px rgba(255,220,255,0.45)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 4px rgba(255,220,255,0.18)")
            }
          >
            <Image
              src={item.icon}
              alt={item.label + " icon"}
              width={18}   // <<< smaller for mobile
              height={18}
              unoptimized
              priority
              className="icon-clean"
            />
            <span className="text-[0.82rem]">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        .mobile-stream {
          position: absolute;
          width: 150px;
          height: 1px;
          opacity: 0;
          border-radius: 1px;
          filter: drop-shadow(0 0 4px rgba(255, 180, 255, 0.65));
          animation: mobileStream linear infinite;
        }

        @keyframes mobileStream {
          0% {
            transform: translateX(-250px);
            opacity: 0;
          }
          10% {
            opacity: 0.45;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            transform: translateX(1800px);
            opacity: 0;
          }
        }

        @keyframes titleGradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>

      <style jsx global>{`
        .icon-clean {
          filter: brightness(0) invert(1);
          opacity: 0.92;
          transition: opacity 0.25s ease, filter 0.25s ease;
        }

        .icon-clean:hover {
          filter: brightness(1.2)
            drop-shadow(0 0 5px rgba(255, 200, 255, 0.55));
          opacity: 1;
        }
      `}</style>
    </nav>
  );
}
  