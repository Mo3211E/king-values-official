/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

export default function Home() {
  const [flipped, setFlipped] = useState([false, false, false]);
  const toggleFlip = (i) =>
    setFlipped((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });

  const stars = useMemo(
    () =>
      Array.from({ length: 52 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
      })),
    []
  );

  const shootingStars = useMemo(
    () =>
      Array.from({ length: 13 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 30}%`,
        left: `${Math.random() * 83}%`,
        delay: `${i * 0.8 + Math.random() * 2}s`,
      })),
    []
  );

  return (
    <div className="relative min-h-screen flex flex-col items-center text-center text-white px-4 sm:px-6 md:px-8 py-16 overflow-hidden">
      {/* Galaxy Background */}
      <div
        className="absolute inset-0 z-0 will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 30% 50%, #150032 0%, #060016 60%, #000 100%)",
          backgroundSize: "150% 150%",
          animation: "galaxyShift 70s ease-in-out infinite",
        }}
      />

      {/* Stars */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {stars.map((s) => (
          <div
            key={s.id}
            className="star will-change-opacity"
            style={{
              top: s.top,
              left: s.left,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>

      {/* Shooting Stars */}
      <div className="absolute top-[8%] left-0 w-full h-[350px] overflow-visible z-0 pointer-events-none">
        {shootingStars.map((s) => (
          <div
            key={s.id}
            className="shooting-star will-change-transform"
            style={{
              top: s.top,
              left: s.left,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-[90rem]">
        {/* Subtitle */}
        <p
          className="text-3xl sm:text-4xl mb-2 font-semibold tracking-[6px] sm:tracking-[8px] text-transparent bg-clip-text"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #ffffffcc, #d3cfff, #ffffffcc)",
            backgroundSize: "200% 200%",
            animation: "titleGradient 10s ease-in-out infinite",
            textShadow: "0 0 20px rgba(211, 207, 255, 0.5)",
          }}
        >
          #1 Community Led
        </p>

        {/* Title */}
        <Link href="/units" passHref>
          <h1
            className="font-extrabold text-[4rem] sm:text-[6rem] md:text-[7rem] leading-tight bg-clip-text text-transparent pb-4 mb-5 cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #c6a4ff, #f3b5ff, #b9b4ff, #c6a4ff)",
              backgroundSize: "300% 300%",
              animation: "titleGradient 12s ease-in-out infinite",
              textShadow:
                "0 0 40px rgba(198,164,255,0.35), 0 0 70px rgba(243,181,255,0.25)",
            }}
          >
            Anime Vanguards
            <br />
            Trading Value List
          </h1>
        </Link>

        {/* Intro */}
        <div
          className="mt-8 text-[1.6rem] sm:text-[2rem] font-semibold bg-clip-text text-transparent px-2"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #bfaaff, #c7b6ff, #e2d7ff, #bfaaff)",
            backgroundSize: "300% 300%",
            animation: "subtitleSweep 14s linear infinite",
            textShadow:
              "0 0 25px rgba(199,182,255,0.4), 0 0 50px rgba(226,215,255,0.2)",
          }}
        >
          This Value List is Made and Agreed Upon by a Collective Group of AV
          <br className="hidden sm:block" />
          Competitive Players and Traders (Listed Below)
        </div>

        {/* Creator */}
        <div
          className="text-[1.4rem] sm:text-[1.8rem] font-medium mt-8 bg-clip-text text-transparent px-4"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #b5e7ff, #a8f0ff, #c6ffff, #b5e7ff)",
            backgroundSize: "300% 300%",
            animation: "subtitleSweep 10s linear infinite",
            textShadow:
              "0 0 25px rgba(181,231,255,0.3), 0 0 60px rgba(198,255,255,0.2)",
          }}
        >
          I am the Creator – <span className="font-bold">King Mo3211</span>
          <br />
          Please Subscribe to my YouTube as Appreciation 🙏
          <br />
          <a
            href="https://www.youtube.com/@King_Mo3211"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#f9cb9c] hover:text-[#ffe7b1] transition-all duration-300 hover:drop-shadow-[0_0_20px_rgba(255,240,180,0.8)] break-all"
          >
            https://www.youtube.com/@King_Mo3211
          </a>
        </div>

        {/* Site Features + FAQ (Compact, Balanced, Modern Look) */}
        <div className="w-full max-w-[90rem] flex flex-col lg:flex-row justify-center items-start gap-8 mt-16 mb-14 px-4 sm:px-6">
          {/* Site Features */}
          <div className="flex-1 rounded-2xl p-[1.5px] bg-gradient-to-r from-[#7d66ff] to-[#a988ff] shadow-[0_0_25px_rgba(160,120,255,0.2)]">
            <div className="rounded-2xl bg-[#0e0e16]/90 backdrop-blur-md p-6 sm:p-8 h-full flex flex-col justify-start items-center text-center transition-all duration-300 hover:shadow-[0_0_35px_rgba(160,140,255,0.25)]">
              <h2 className="font-bold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-[#b9a6ff] to-[#e4d8ff] text-[2.3rem] tracking-wide">
                Site Features
              </h2>
              <div className="grid gap-4 w-full">
                {[
                  {
                    title: "Accurate Values",
                    desc: "Community led values that accurately represent present value, demand, and stability",
                  },
                  {
                    title: "Live Trade Hub",
                    desc: "Post and/or search for public trades, easily completing wanted trades ",
                  },
                  {
                    title: "Community Feedback",
                    desc: "Click on any card and provide feedback, allowing us to accurately represent the playerbase",
                  },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-[1.2px] bg-gradient-to-r from-[#a697ff]/60 to-[#8a7cff]/60"
                  >
                    <div className="rounded-xl bg-[#141423]/95 p-5 text-left sm:text-center hover:bg-[#18182b] transition-all duration-300">
                      <p className="font-semibold text-[#d5ceff] text-[1.75rem] leading-snug">
                        {f.title}
                      </p>
                      <p className="text-white/75 text-[1.45rem] mt-1.5 leading-snug">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="flex-1 rounded-2xl p-[1.5px] bg-gradient-to-r from-[#8692ff] to-[#a5b0ff] shadow-[0_0_25px_rgba(130,140,255,0.2)]">
            <div className="rounded-2xl bg-[#0e0e16]/90 backdrop-blur-md p-6 sm:p-8 h-full flex flex-col justify-start items-center text-center transition-all duration-300 hover:shadow-[0_0_35px_rgba(150,170,255,0.25)]">
              <h2 className="font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#cdd6ff] to-[#f0f3ff] text-[2.3rem] tracking-wide">
                FAQ
              </h2>
              <p className="text-[1.5rem] text-white/70 mb-6 italic">
                Click a question to reveal the answer.
              </p>
              <div className="grid gap-4 w-full">
                {[
                  {
                    q: "How often are values updated?",
                    a: "Values are updated daily to accurately represent present changes in demand, value, and community acceptance",
                  },
                  {
                    q: "Who manages the values?",
                    a: "A trusted team of competitive players and traders who actively watch trades, demands, and community value feedback",
                  },
                  {
                    q: "Are the values official?",
                    a: "The values are accepted as official by the community, but not sponsored by Anime Vanguards itself",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`faq-card relative h-[90px] perspective cursor-pointer rounded-xl p-[1.2px] bg-gradient-to-r from-[#aeb6ff]/60 to-[#8f96ff]/60`}
                    onClick={() => toggleFlip(i)}
                  >
                    <div
                      className={`faq-inner transition-transform duration-600 transform ${flipped[i] ? "rotate-y-180" : ""
                        } h-full`}
                    >
                      <div className="faq-front absolute inset-0 bg-[#141423]/95 rounded-xl p-4 flex items-center justify-center text-[1.55rem] font-semibold text-[#d8d2ff] leading-tight">
                        {item.q}
                      </div>
                      <div className="faq-back absolute inset-0 bg-[#1a1a2b]/95 rounded-xl p-4 flex items-center justify-center text-[1.45rem] text-white/75 transform rotate-y-180 leading-tight">
                        {item.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Credits (moved below Site Features + FAQ) */}
        <div
          className="max-w-[75rem] text-white/90 mt-3 mb-20 px-4 text-[1.6rem] sm:text-[1.8rem] leading-relaxed"
          style={{
            textShadow: "0 0 20px rgba(249,203,156,0.25)",
          }}
        >
          <p className="mt-3 font-medium">
            <span className="text-[#f9cb9c]">Co-Owners:</span> Me (King Mo3211), Zog, Pop{" "}
            <br />
            <span className="text-[#f9cb9c]">Value Team:</span> Gohary, Zen, Karna, Zoldic, Kegs, Nathan, Fadi, Paper, Coolcockatoo
            Feh, Fadi, Simple, Rum, Nat, Manjiro, Aync, Thefeeit
            <br />
            <span className="text-[#f9cb9c]">Partners:</span> Faxi Macro, Noahbamboah, Illusion (Discord Server){" "}
          </p>
        </div>

{/* Discord */}
<div className="max-w-[60rem] w-full rounded-3xl p-[2px] bg-[linear-gradient(90deg,#c6a4ff,#f3b5ff,#b9b4ff,#c6a4ff)] animate-gradientSlow mb-20 text-[1.8rem]">
  <div
    className="rounded-3xl bg-[#0e0e15] p-10 text-center"
    style={{ textShadow: "0 0 25px rgba(198,164,255,0.3)" }}
  >
    <h2
      className="font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#f7b3ff] to-[#c6a4ff] text-[2.3rem]"
      style={{
        backgroundSize: "300% 300%",
        animation: "titleGradient 12s ease-in-out infinite",
      }}
    >
      Join our Discord
    </h2>

    <p className="text-white/80 mb-6">
      Complete and finalize trades faster with the community — join our Discord server below!
    </p>

    <a
      href="https://discord.gg/cUGkAtsFNT"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block px-10 py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.05] pulse-glow"
      style={{
        background:
          "linear-gradient(90deg, rgba(160,90,255,0.85), rgba(240,150,255,0.8))",
        border: "1px solid rgba(190,160,255,0.4)",
        boxShadow:
          "0 0 25px rgba(200,150,255,0.3), inset 0 0 10px rgba(180,120,255,0.25)",
        color: "white",
        textShadow:
          "0 0 15px rgba(230,200,255,0.4), 0 0 25px rgba(190,140,255,0.2)",
      }}
    >
      Join Discord
    </a>
  </div>
</div>

        {/* AV Sheet */}
        <div className="max-w-[70rem] w-full rounded-3xl p-[2px] bg-[linear-gradient(90deg,#ffe49e,#ffb07c,#ff9ee6)] animate-gradientSlow text-[1.8rem] mb-10">
          <div
            className="rounded-3xl bg-[#0e0e15] p-8"
            style={{ textShadow: "0 0 25px rgba(255,228,158,0.3)" }}
          >
            <p className="leading-relaxed text-white/80">
              For other AV inquiries, like Overall Tierlist, DPS Comparison
              Sheets, and Unit/Familiar Obtainment info, refer to{" "}
              <a
                href="https://docs.google.com/spreadsheets/d/11aH9bAatxfnMfuqJz7wG8RdWotIT0k6xELix12HczHM/edit?gid=106537974#gid=106537974"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f9cb9c] hover:text-[#ffe7b1] transition-colors duration-300 font-semibold"
              >
                The AV Sheet
              </a>
              .
            </p>
          </div>
        </div>


        <p className="text-white/70 text-[1.4rem] mt-6 max-w-[75rem] mx-auto leading-relaxed">
  King Values is the #1 Anime Vanguards Value List & Trade Hub for Roblox players.
  Updated daily with verified community data, we offer the most accurate values,
  tier lists, and fair trade comparisons for every unit and familiar in Anime Vanguards.
</p>

      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes galaxyShift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes titleGradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes subtitleSweep {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes pulseGlow {
          0%,
          100% {
            text-shadow: 0 0 15px rgba(255, 240, 180, 0.4);
          }
          50% {
            text-shadow: 0 0 25px rgba(255, 240, 180, 0.8);
          }
        }

        .animate-pulseGlow {
          animation: pulseGlow 2.5s ease-in-out infinite;
        }

        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          opacity: 0.6;
          border-radius: 50%;
          animation: twinkle 5s infinite alternate;
        }

        @keyframes twinkle {
          0% {
            opacity: 0.3;
          }
          100% {
            opacity: 0.9;
          }
        }

        .shooting-star {
          position: absolute;
          width: 100px;
          height: 2px;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.8) 20%,
            rgba(160, 120, 255, 0.6) 60%,
            rgba(255, 120, 200, 0) 100%
          );
          opacity: 0;
          animation: diagonalShoot 5s ease-out infinite;
        }

        @keyframes diagonalShoot {
          0% {
            transform: translate(-30px, -30px) rotate(45deg) scaleX(1);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          60% {
            transform: translate(250px, 250px) rotate(45deg) scaleX(0.3);
            opacity: 0.5;
          }
          100% {
            transform: translate(450px, 450px) rotate(45deg) scaleX(0);
            opacity: 0;
          }
        }

        .animate-gradientSlow {
          animation: subtitleSweep 10s ease-in-out infinite;
          background-size: 300% 300%;
        }

        .perspective {
          perspective: 1000px;
        }
        .faq-inner {
          transform-style: preserve-3d;
          will-change: transform;
        }
        .faq-front,
        .faq-back {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
