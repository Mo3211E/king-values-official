"use client";

import * as ColorConfig from "../colorConfig";

const SHINY_GOLD = ColorConfig.SHINY_GOLD || "#efbf04";
const CARD_BG =
  "linear-gradient(180deg, #2a0040 18%, #000000ff 44%, #2a0040 67%)";

function splitName(raw) {
  if (!raw) return { shiny: "", base: "" };
  const trimmed = raw.trim();
  if (trimmed.startsWith("Shiny ")) {
    return { shiny: "Shiny", base: trimmed.slice(6).trim() };
  }
  return { shiny: "", base: trimmed };
}

export default function MobileCompactUnitCard({ u, clickable = true }) {
  const { Name, Category, Image, Value } = u;
  const { shiny, base } = splitName(Name);

  const nameColor = ColorConfig.getNameColor(Category, shiny ? base : Name);
  const hoverColor = shiny ? SHINY_GOLD : nameColor;

  const card = (
    <div
      className={`mobile-compact-card relative rounded-xl overflow-hidden flex items-center justify-center ${
        clickable ? "cursor-pointer" : "cursor-default"
      }`}
      style={{
        background: CARD_BG,
        width: "90px",
        height: "90px",
        borderRadius: "1rem",
        position: "relative",
        ["--glow"]: hoverColor,
        boxShadow: "0 0 6px rgba(0,0,0,0.65)",
      }}
    >
      {/* Image */}
      {Image && (
        <img
          src={Image}
          alt={Name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Top blur */}
      <div className="absolute top-0 left-0 w-full h-[20px] bg-black/45 backdrop-blur-sm z-5" />
      {/* Bottom blur */}
      <div className="absolute bottom-0 left-0 w-full h-[18px] bg-black/45 backdrop-blur-sm z-5" />

      {/* Name */}
      <div
        className="absolute top-0 left-0 w-full text-center font-extrabold text-[0.7rem] px-1 pt-[2px] z-10"
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
                marginRight: "0.15em",
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
      <div className="absolute bottom-0 left-0 w-full text-center font-bold text-white text-[0.7rem] pb-[2px] z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
        Value: {Value ? Value.toLocaleString() : "N/A"}
      </div>

      <style jsx>{`
        .mobile-compact-card::before {
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

        .mobile-compact-card:hover::before {
          background: linear-gradient(135deg, var(--glow), black, var(--glow));
          box-shadow:
            0 0 10px var(--glow),
            0 0 18px var(--glow),
            inset 0 0 6px var(--glow);
          filter: brightness(1.15);
        }

        .mobile-compact-card:hover {
          transform: ${clickable ? "translateY(-1px)" : "none"};
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
