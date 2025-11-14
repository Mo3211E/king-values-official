"use client";

import Link from "next/link";

export default function MobileHome() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center text-center text-white px-4 py-10 relative overflow-x-hidden">

      {/* Static Galaxy Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 30% 50%, #150032 0%, #060016 60%, #000 100%)",
        }}
      />

      {/* Wrapper */}
      <div className="w-full max-w-[90%] flex flex-col items-center">

        {/* Subtitle */}
        <p
          className="text-2xl font-semibold tracking-[4px] text-transparent bg-clip-text mb-2"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #ffffffcc, #d3cfff, #ffffffcc)",
            backgroundSize: "200% 200%",
            textShadow: "0 0 12px rgba(211,207,255,0.45)",
          }}
        >
          #1 Community Led
        </p>

        {/* Title */}
        <Link href="/units" className="w-full">
          <h1
            className="font-extrabold text-[3rem] leading-[1.1] text-transparent bg-clip-text cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #c6a4ff, #f3b5ff, #b9b4ff, #c6a4ff)",
              backgroundSize: "300% 300%",
              textShadow:
                "0 0 25px rgba(198,164,255,0.35), 0 0 50px rgba(243,181,255,0.25)",
            }}
          >
            Anime Vanguards
            <br />
            Trading Value List
          </h1>
        </Link>

        {/* Intro */}
        <div
          className="mt-6 text-[1.25rem] font-semibold text-transparent bg-clip-text"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #bfaaff, #c7b6ff, #e2d7ff, #bfaaff)",
            backgroundSize: "250% 250%",
            textShadow:
              "0 0 18px rgba(199,182,255,0.4), 0 0 30px rgba(226,215,255,0.2)",
          }}
        >
          This Value List is Made and Agreed Upon by a Collective Group of AV
          Competitive Players and Traders (Listed Below)
        </div>

        {/* Creator Section */}
        <div
          className="mt-8 text-[1.15rem] font-medium text-transparent bg-clip-text px-2 leading-snug"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #b5e7ff, #a8f0ff, #c6ffff, #b5e7ff)",
            backgroundSize: "250% 250%",
            textShadow:
              "0 0 18px rgba(181,231,255,0.3), 0 0 45px rgba(198,255,255,0.2)",
          }}
        >
          I am the Creator – <span className="font-bold">King Mo3211</span>
          <br />
          Please Subscribe to my YouTube as Appreciation 🙏
          <br />
          <a
            href="https://www.youtube.com/@King_Mo3211"
            target="_blank"
            className="text-[#f9cb9c] hover:text-[#ffe7b1] transition-all duration-300"
          >
            https://www.youtube.com/@King_Mo3211
          </a>
        </div>

        {/* Features & FAQ */}
        <div className="w-full flex flex-col gap-8 mt-14">

          {/* Site Features */}
          <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-[#7d66ff] to-[#a988ff] shadow-[0_0_20px_rgba(160,120,255,0.2)]">
            <div className="rounded-2xl bg-[#0e0e16]/90 backdrop-blur-md p-6 text-center">
              <h2 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#b9a6ff] to-[#e4d8ff] text-[1.85rem] mb-5">
                Site Features
              </h2>

              <div className="grid gap-4">
                {[
                  {
                    title: "Accurate Values",
                    desc: "Community led values with precise demand & stability ratings.",
                  },
                  {
                    title: "Live Trade Hub",
                    desc: "Post and locate public trades instantly.",
                  },
                  {
                    title: "Community Feedback",
                    desc: "Give feedback on any card to improve value accuracy.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-[1.1px] bg-gradient-to-r from-[#a697ff]/60 to-[#8a7cff]/60"
                  >
                    <div className="rounded-xl bg-[#141423]/95 p-4 text-left">
                      <p className="font-semibold text-[#d5ceff] text-[1.4rem]">
                        {item.title}
                      </p>
                      <p className="text-white/75 text-[1.1rem] mt-1.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-[#8692ff] to-[#a5b0ff] shadow-[0_0_20px_rgba(130,140,255,0.2)]">
            <div className="rounded-2xl bg-[#0e0e16]/90 backdrop-blur-md p-6 text-center">
              <h2 className="font-bold text-transparent bg-gradient-to-r from-[#cdd6ff] to-[#f0f3ff] bg-clip-text text-[1.85rem] mb-4">
                FAQ
              </h2>

              <p className="text-[1.25rem] text-white/70 italic mb-5">
                Tap a question to reveal the answer.
              </p>

              <div className="flex flex-col gap-3">
                {[
                  {
                    q: "How often are values updated?",
                    a: "Values are updated daily based on market activity.",
                  },
                  {
                    q: "Who manages the values?",
                    a: "A verified team of competitive AV players & traders.",
                  },
                  {
                    q: "Are values official?",
                    a: "They are community-accepted, but not made by AV developers.",
                  },
                ].map((item, i) => (
                  <details
                    key={i}
                    className="bg-[#141423]/95 rounded-xl p-4 text-left"
                  >
                    <summary className="font-semibold text-[#d8d2ff] text-[1.25rem] cursor-pointer">
                      {item.q}
                    </summary>
                    <p className="text-white/75 text-[1.1rem] mt-2">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className="text-white/90 text-[1.2rem] leading-snug mt-10 mb-14">
          <p>
            <span className="text-[#f9cb9c]">Co-Owners:</span> Me, Zog, Partyware, Pop<br />
            <span className="text-[#f9cb9c]">Value Team:</span> Connos, Gohary, Knull, Void, Kegs, Celestial, Fadi, Exs, Feh, Nathan, Simple, Awesometicklenip, Nat, Manjiro, Aync, Paper<br />
            <span className="text-[#f9cb9c]">Value Researchers:</span> Fugo, atsuo, prizza, jesko, fivestarasap, elykiye, spork, squiddy, anaxendel, mozilla<br />
            <span className="text-[#f9cb9c]">Partners:</span> Peryfc, Illusion
          </p>
        </div>

        {/* Discord */}
        <div className="w-full rounded-3xl p-[2px] bg-[linear-gradient(90deg,#c6a4ff,#f3b5ff,#b9b4ff,#c6a4ff)] mb-14">
          <div className="rounded-3xl bg-[#0e0e15] p-8 text-center">
            <h2
              className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f7b3ff] to-[#c6a4ff] text-[1.9rem]"
            >
              Join our Discord
            </h2>

            <p className="text-white/80 mt-3 mb-6 text-[1.2rem]">
              Complete trades faster with our community.
            </p>

            <a
              href="https://discord.gg/cUGkAtsFNT"
              target="_blank"
              className="inline-block px-8 py-3 rounded-2xl font-semibold"
              style={{
                background:
                  "linear-gradient(90deg, rgba(160,90,255,0.85), rgba(240,150,255,0.8))",
                border: "1px solid rgba(190,160,255,0.4)",
                color: "white",
              }}
            >
              Join Discord
            </a>
          </div>
        </div>

        {/* AV Sheet */}
        <div className="w-full rounded-3xl p-[2px] bg-[linear-gradient(90deg,#ffe49e,#ffb07c,#ff9ee6)] mb-10">
          <div className="rounded-3xl bg-[#0e0e15] p-6 text-[1.2rem] text-white/80 leading-snug">
            For AV Tierlists, DPS Sheets & Obtainment Info — visit{" "}
            <a
              href="https://docs.google.com/spreadsheets/d/11aH9bAatxfnMfuqJz7wG8RdWotIT0k6xELix12HczHM/edit?gid=106537974#gid=106537974"
              target="_blank"
              className="text-[#f9cb9c] font-semibold"
            >
              The AV Sheet
            </a>
            .
          </div>
        </div>

        <p className="text-white/70 text-[1.1rem] mt-4 max-w-[95%] leading-snug mb-16">
          King Values is the #1 Anime Vanguards Value List & Trade Hub for Roblox players — updated daily with verified data.
        </p>
      </div>
    </div>
  );
}
