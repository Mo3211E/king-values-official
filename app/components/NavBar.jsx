"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function NavBar() {
  const [shootingStars, setShootingStars] = useState([]);
  const [scrollVisible, setScrollVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  // 🎇 Gentle layered horizontal stream (matches image)
  useEffect(() => {
    const colorOptions = [
      "linear-gradient(to right, rgba(255,255,255,0), rgba(255,215,245,0.9), rgba(255,190,230,0.7), rgba(255,255,255,0))",
      "linear-gradient(to right, rgba(255,255,255,0), rgba(250,210,255,0.8), rgba(255,160,220,0.7), rgba(255,255,255,0))",
    ];

    // Reduced and evenly spaced: smoother look with same direction
    const shootingArray = Array.from({ length: 40 }).map((_, i) => ({
      top: `${(i * 2.5) % 100}%`, // evenly spaced vertically
      left: `${Math.random() * 100}%`,
      color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${3 + Math.random() * 2}s`,
    }));

    setShootingStars(shootingArray);
  }, []);

  // 📜 Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 50) {
        setScrollVisible(false);
      } else {
        setScrollVisible(true);
      }
      setLastScroll(currentScroll);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  const navItems = [
    { href: "/units", label: "Values", icon: "/icons/values.png" },
    {
      href: "/trade-calculator",
      label: "Trade Calculator",
      icon: "/icons/trade-calculator.png",
    },
    { href: "/trade-hub", label: "Trade Hub", icon: "/icons/trade-hub.png" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full px-8 py-[0.7rem] flex items-center justify-between z-50 overflow-visible transition-all duration-700 ${
        scrollVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-10 pointer-events-none"
      }`}
    >
      {/* 🌌 Gentle horizontal streams (no bar) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {shootingStars.map((s, i) => (
          <div
            key={`shoot-${i}`}
            className="nav-stream"
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

{/* ✨ Title with Logo */}
<Link href="/" className="z-10 cursor-pointer select-none flex items-center gap-2">
  <Image
  src="/logo.png"
  alt="AV Logo"
  width={40}
  height={40}
  unoptimized
  priority
  className="transition-transform duration-300 hover:scale-105"
  style={{
    filter: `
      drop-shadow(0 0 6px rgba(255, 230, 180, 0.45))
      drop-shadow(0 0 12px rgba(255, 210, 150, 0.25))
      drop-shadow(0 0 20px rgba(255, 230, 255, 0.25))
    `,
    WebkitFilter: `
      drop-shadow(0 0 6px rgba(255, 230, 180, 0.45))
      drop-shadow(0 0 12px rgba(255, 210, 150, 0.25))
      drop-shadow(0 0 20px rgba(255, 230, 255, 0.25))
    `,
  }}
/>
  <h1
    className="font-extrabold text-[1.7rem] sm:text-[2.1rem] leading-[1.15] bg-clip-text text-transparent transition-all duration-300 hover:scale-[1.05]"
    style={{
      backgroundImage:
        "linear-gradient(90deg, #ffe6ff, #f7d9ff, #ffffff, #ffe6ff)",
      backgroundSize: "300% 300%",
      animation: "titleGradient 12s ease-in-out infinite",
      WebkitTextStroke: "0.6px rgba(255, 215, 130, 0.35)", // ✨ soft gold outline
      textShadow: `
        0 0 10px rgba(255, 230, 180, 0.25),
        0 0 20px rgba(255, 210, 150, 0.15),
        0 0 30px rgba(255, 230, 255, 0.15)
      `,
    }}
  >
    King Values
  </h1>
</Link>



      {/* 🔹 Navigation Links */}
      <div className="z-10 flex space-x-3 text-[0.95rem]">
        {navItems.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="flex items-center gap-1.5 px-3 py-[0.3rem] rounded-lg transition-all duration-200 hover:scale-[1.03]"
            style={{
              background:
                "linear-gradient(145deg, rgba(35,0,70,0.85), rgba(15,0,35,0.7))",
              color: "#fff0ff",
              border: "1px solid rgba(240,200,255,0.5)",
              boxShadow: "0 0 6px rgba(255,220,255,0.2)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 14px rgba(255,220,255,0.5)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 6px rgba(255,220,255,0.2)")
            }
          >
            <Image
              src={item.icon}
              alt={item.label + " icon"}
              width={24}
              height={24}
              unoptimized
              priority
              className="inline-block icon-clean"
            />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* ✨ CSS */}
      <style jsx>{`
        .nav-stream {
          position: absolute;
          width: 180px;
          height: 1px;
          border-radius: 1px;
          opacity: 0;
          filter: drop-shadow(0 0 4px rgba(255, 180, 255, 0.8));
          animation: horizontalStream linear infinite;
        }

        @keyframes horizontalStream {
          0% {
            transform: translateX(-300px);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          60% {
            opacity: 0.4;
          }
          100% {
            transform: translateX(2200px);
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
          opacity: 0.9;
          transition: opacity 0.3s ease, filter 0.3s ease;
        }

        .icon-clean:hover {
          filter: brightness(1.2)
            drop-shadow(0 0 6px rgba(255, 200, 255, 0.6));
          opacity: 1;
        }
      `}</style>
    </nav>
  );
}
