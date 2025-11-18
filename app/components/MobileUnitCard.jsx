"use client";

import Link from "next/link";
import * as ColorConfig from "../colorConfig";

const SHINY_GOLD = ColorConfig.SHINY_GOLD || "#efbf04";
const CARD_BG =
  "linear-gradient(180deg, #2a0040 0%, #000000ff 50%, #2a0040 100%)";

function splitName(raw) {
  if (!raw) return { shiny: "", base: "" };
  const trimmed = raw.trim();
  if (trimmed.startsWith("Shiny ")) {
    return { shiny: "Shiny", base: trimmed.slice(6).trim() };
  }
  return { shiny: "", base: trimmed };
}

function fmt(v) {
  if (v === undefined || v === null || v === "") return "N/A";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString();
}

function titleSize(text) {
  const len = text?.length ?? 0;
  if (len <= 10) return "1.25rem";
  if (len <= 14) return "1.1rem";
  if (len <= 18) return "1rem";
  if (len <= 24) return "0.95rem";
  return "0.9rem";
}

export default function MobileUnitCard({ u }) {
  const { Name, Category, Image, Value, Demand, Stability } = u;
  const { shiny, base } = splitName(Name);

  const categoryLabelColor = ColorConfig.getCategoryLabelColor(Category);
  const baseNameColor = ColorConfig.getNameColor(
    Category,
    shiny ? base : Name
  );

  const hoverColor = shiny ? SHINY_GOLD : baseNameColor;
  const titleFont = titleSize(Name);
  const imgSize = 90;
  const cardHeight = "230px";

  const content = (
    <div
      className={`mobile-card rounded-2xl flex flex-col transition-all duration-200 relative overflow-hidden ${
        Category === "Robux Items" ? "robux" : ""
      }`}
      style={{
        background: CARD_BG,
        padding: "0.4rem 0.4rem 0.8rem 0.4rem",
        width: "140px",
        height: cardHeight,
        borderRadius: "1rem",
        position: "relative",
        ["--glow"]: hoverColor,
        boxShadow: "0 0 6px rgba(0,0,0,0.65)",
      }}
    >
      {/* Title */}
      <div
        className="text-center font-extrabold leading-tight mb-[2px] h-[2.3em] flex items-center justify-center px-1"
        style={{
          fontSize: titleFont,
          textShadow: `0 0 4px ${
            shiny ? SHINY_GOLD : baseNameColor
          }66, 0 0 10px ${shiny ? SHINY_GOLD : baseNameColor}40`,
        }}
      >
        {baseNameColor.startsWith("linear-gradient") ? (
          <span
            style={{
              background: baseNameColor,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "800",
              fontSize: "inherit",
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
            <span style={{ color: baseNameColor }}>{base}</span>
          </>
        ) : (
          <span style={{ color: baseNameColor }}>{Name}</span>
        )}
      </div>

      {/* Category */}
      <div
        className="text-center font-semibold mb-[3px]"
        style={{
          fontSize: "0.8rem",
          marginTop: "-6px",
          ...(categoryLabelColor?.startsWith("linear-gradient")
            ? {
                background: categoryLabelColor,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
              }
            : { color: categoryLabelColor }),
        }}
      >
        {Category}
      </div>

      {/* Image */}
      {Image && (
        <div
          className="mx-auto my-[3px] rounded-xl overflow-hidden flex items-center justify-center bg-black/20"
          style={{ width: imgSize, height: imgSize }}
        >
          <img
            src={Image}
            alt={Name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Stats */}
      <div className="px-2.5 pt-3 text-[0.8rem]">
        <Row label="Value" value={fmt(Value)} />
        <Row label="Demand" value={Demand ?? "N/A"} />
        <Row label="Stability" value={Stability ?? "N/A"} />
      </div>

      <style jsx>{`
        .mobile-card::before {
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

        .mobile-card:not(.robux):hover::before {
          background: linear-gradient(135deg, var(--glow), black, var(--glow));
          box-shadow:
            0 0 10px var(--glow),
            0 0 18px var(--glow),
            inset 0 0 6px var(--glow);
          filter: brightness(1.15);
        }

        .mobile-card.robux:hover::before {
          background: linear-gradient(
            135deg,
            red,
            orange,
            yellow,
            green,
            cyan,
            blue,
            violet
          );
          box-shadow:
            0 0 14px rgba(255, 255, 255, 0.6),
            0 0 24px rgba(255, 255, 255, 0.4),
            inset 0 0 8px rgba(255, 255, 255, 0.5);
          filter: brightness(1.2);
        }

        .mobile-card:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );

  return (
    <Link href={`/units/${encodeURIComponent(Name)}`} className="block">
      {content}
    </Link>
  );
}

function Row({ label, value }) {
  const color =
    ColorConfig.getStatColor?.(label, value) || "#ffffff";
  const isGradient = typeof color === "string" && color.startsWith("linear-gradient");

  return (
    <div className="flex items-center justify-between py-1">
      <span className="font-semibold text-white/85">{label}:</span>
      {isGradient ? (
        <span
          className="font-extrabold"
          style={{
            background: color,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 6px rgba(255,255,255,0.25)",
          }}
        >
          {value}
        </span>
      ) : (
        <span
          className="font-bold"
          style={{
            color,
            textShadow: "0 0 6px rgba(255,255,255,0.25)",
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}
