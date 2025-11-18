"use client";

import * as ColorConfig from "../colorConfig";
import React, { memo } from "react";

const SHINY_GOLD = ColorConfig.SHINY_GOLD || "#efbf04";
const CARD_BG =
  "linear-gradient(180deg, #2a0040 18%, #000000ff 44%, #2a0040 67%)";

/* --- Helper: Split shiny/base name --- */
function splitName(raw) {
  if (!raw) return { shiny: "", base: "", firstWord: "" };
  const parts = raw.trim().split(/\s+/);
  const firstWord = parts[0] || "";
  if (raw.startsWith("Shiny ")) {
    return { shiny: "Shiny", base: raw.slice(6).trim(), firstWord };
  }
  return { shiny: "", base: raw, firstWord };
}

export default function CompactUnitCard({ u, clickable = true }) {
  const { Name, Category, Image, Value } = u;
  const { shiny, base } = splitName(Name);

  const nameColor = ColorConfig.getNameColor(Category, shiny ? base : Name);
  const hoverColor = shiny ? SHINY_GOLD : nameColor;

  const card = (
    <div
      className={`compact-card relative rounded-xl overflow-hidden flex items-center justify-center ${
        clickable ? "cursor-pointer" : "cursor-default"
      }`}
      style={{
        background: CARD_BG,
        width: "140px",
        height: "140px",
        borderRadius: "1rem",
        position: "relative",
        ["--glow"]: hoverColor,
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
      }}
    >
      {/* Image */}
      {Image && (
        <img
          src={Image}
          alt={Name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Top blurred banner */}
      <div className="absolute top-0 left-0 w-full h-[28px] bg-black/45 backdrop-blur-sm z-5" />
      {/* Bottom blurred banner */}
      <div className="absolute bottom-0 left-0 w-full h-[26px] bg-black/45 backdrop-blur-sm z-5" />

      {/* Name rendering (matches full card logic) */}
      <div
        className="absolute top-0 left-0 w-full text-center font-extrabold text-[0.9rem] px-1 pt-1 z-10"
        style={{
          textShadow: `0 0 4px ${
            shiny ? SHINY_GOLD : nameColor
          }66, 0 0 10px ${shiny ? SHINY_GOLD : nameColor}40`,
        }}
      >
        {nameColor.startsWith("linear-gradient") ? (
          <span
            style={{
              background: nameColor,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "800",
            }}
          >
            {Name}
          </span>
        ) : shiny ? (
          <>
            <span
              style={{
                color: SHINY_GOLD,
                marginRight: "0.25em",
                textShadow: `0 0 4px ${SHINY_GOLD}80, 0 0 10px ${SHINY_GOLD}55`,
              }}
            >
              Shiny
            </span>
            <span style={{ color: nameColor }}>{base}</span>
          </>
        ) : (
          <span style={{ color: nameColor }}>{Name}</span>
        )}
      </div>

      {/* Value */}
      <div className="absolute bottom-0 left-0 w-full text-center font-bold text-white text-[0.85rem] pb-1 z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
        Value: {Value ? Value.toLocaleString() : "N/A"}
      </div>

      {/* Glow border */}
      <style jsx>{`
        .compact-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 1rem;
          padding: 2px;
          background: linear-gradient(135deg, white, black, white);
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          transition: all 0.3s ease;
        }

        .compact-card:hover::before {
          background: linear-gradient(135deg, var(--glow), black, var(--glow));
          box-shadow: 0 0 15px var(--glow), 0 0 25px var(--glow),
            inset 0 0 8px var(--glow);
          filter: brightness(1.2);
        }

        .compact-card:hover {
          transform: ${clickable ? "translateY(-2px)" : "none"};
        }
      `}</style>
    </div>
  );

  if (!clickable) return card;

  const encoded = encodeURIComponent(Name);
  return (
    <a href={`/units/${encoded}`} className="block group">
      {card}
    </a>
  );
}

export function TradeBoardUnitCard({ u }) {
  const { Name, Category, Image, Value } = u;
  const { shiny, base } = splitName(Name);

  const nameColor = ColorConfig.getNameColor(Category, shiny ? base : Name);

  // NEVER show "N/A" – always show Owner's Choice or a number
  const raw = Value;
  let displayValue;
  const rawStr = String(raw ?? "").toLowerCase();

  if (raw === Infinity || rawStr.includes("owner")) {
    displayValue = "Owner's Choice";
  } else {
    const n = Number(String(raw ?? "").replace(/,/g, ""));
    displayValue = Number.isFinite(n) ? n.toLocaleString() : "0";
  }

  const card = (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{
        width: "84px",
        height: "84px",
        background: CARD_BG,
        borderRadius: "0.8rem",
      }}
    >
      {Image && (
        <img
          src={Image}
          alt={Name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* top / bottom dark bands */}
      <div className="absolute top-0 left-0 w-full h-[18px] bg-black/55 backdrop-blur-sm" />
      <div className="absolute bottom-0 left-0 w-full h-[18px] bg-black/55 backdrop-blur-sm" />

      {/* Name */}
      <div
        className="absolute top-0 left-0 w-full text-center font-extrabold text-[0.7rem] px-1 pt-0.5"
        style={{
          textShadow: `0 0 4px ${
            shiny ? SHINY_GOLD : nameColor
          }66, 0 0 8px ${shiny ? SHINY_GOLD : nameColor}40`,
        }}
      >
        {nameColor.startsWith("linear-gradient") ? (
          <span
            style={{
              background: nameColor,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {Name}
          </span>
        ) : shiny ? (
          <>
            <span
              style={{
                color: SHINY_GOLD,
                marginRight: "0.15em",
                textShadow: `0 0 4px ${SHINY_GOLD}80, 0 0 8px ${SHINY_GOLD}55`,
              }}
            >
              Shiny
            </span>
            <span style={{ color: nameColor }}>{base}</span>
          </>
        ) : (
          <span style={{ color: nameColor }}>{Name}</span>
        )}
      </div>

      {/* Value (NEVER N/A) */}
      <div className="absolute bottom-0 left-0 w-full text-center font-semibold text-white text-[0.65rem] pb-0.5">
        Value: {displayValue}
      </div>
    </div>
  );

  const encoded = encodeURIComponent(Name || "");
  return (
    <a href={`/units/${encoded}`} className="block group">
      {card}
    </a>
  );
}
