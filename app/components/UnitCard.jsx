"use client";

import Link from "next/link";
import * as ColorConfig from "../colorConfig";

/* --------------------------- Constants & Helpers --------------------------- */

const SHINY_GOLD = ColorConfig.SHINY_GOLD || "#efbf04";

const CARD_BG =
  "linear-gradient(180deg, #2a0040 0%, #000000ff 50%, #2a0040 100%)";

function splitName(raw) {
  if (!raw) return { shiny: "", base: "", firstWord: "" };
  const parts = raw.trim().split(/\s+/);
  const firstWord = parts[0] || "";
  if (raw.startsWith("Shiny ")) {
    return { shiny: "Shiny", base: raw.slice(6).trim(), firstWord };
  }
  return { shiny: "", base: raw, firstWord };
}

function fmt(v) {
  if (v === undefined || v === null || v === "") return "N/A";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString();
}

function titleSize(text) {
  const len = text?.length ?? 0;
  if (len <= 10) return "1.6rem";
  if (len <= 14) return "1.45rem";
  if (len <= 18) return "1.3rem";
  if (len <= 22) return "1.15rem";
  return "1rem";
}

/* ------------------------------- Component -------------------------------- */

export default function UnitCard({ u, compact, isLink = true, onClick }) {
  const { Name, Category, Image, Value, Demand, Stability } = u;
  const { shiny, base, firstWord } = splitName(Name);

  const categoryLabelColor = ColorConfig.getCategoryLabelColor(Category);
  const baseNameColor = ColorConfig.getNameColor(Category, shiny ? base : Name);

  const hoverColor = shiny ? SHINY_GOLD : baseNameColor;

  const titleFont = titleSize(Name);
  const imgSize = compact ? 180 : 125;
  const cardHeight = compact ? "225px" : "340px";

  const content = (
    <div
      className={`card rounded-2xl flex flex-col transition-all duration-200 relative overflow-hidden group ${Category === "Robux Items" ? "robux" : ""
        }`}
      style={{
        background: CARD_BG,
        padding: "0.5rem 0.5rem 1rem 0.5rem",
        width: "220px",
        margin: "0",
        height: cardHeight,
        position: "relative",
        borderRadius: "1rem",
        ["--glow"]: hoverColor,
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
      }}
      onClick={onClick}
    >
      {/* Title */}
      <div
        className="text-center font-extrabold leading-tight mb-[2px] h-[2.4em] flex items-center justify-center"
        style={{
          fontSize: titleFont,
          textShadow: `0 0 4px ${shiny ? SHINY_GOLD : baseNameColor
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
        className="text-center font-semibold mb-[4px]"
        style={{
          fontSize: "calc(1.6rem * 0.66)",
          marginTop: "-9px",
          ...(categoryLabelColor.startsWith("linear-gradient")
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
          className="mx-auto my-[2px] rounded-xl overflow-hidden flex items-center justify-center bg-black/15"
          style={{ width: imgSize, height: imgSize }}
        >
          <img src={Image} alt={Name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Stats */}
      <div className="px-3.5 pt-4">
        <Row label="Value" value={fmt(Value)} />
        <Row label="Demand" value={Demand ?? "N/A"} />
        <Row label="Stability" value={Stability ?? "N/A"} />
      </div>

      {/* Hover glow */}
      <style jsx>{`
  .card::before {
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

  /* ✨ Normal hover glow for non-Robux items */
  .card:not(.robux):hover::before {
    background: linear-gradient(135deg, var(--glow), black, var(--glow));
    box-shadow:
      0 0 15px var(--glow),
      0 0 30px var(--glow),
      inset 0 0 10px var(--glow);
    filter: brightness(1.2);
  }

  /* 🌈 Rainbow hover glow only for Robux Items */
  .card.robux:hover::before {
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
      0 0 20px rgba(255, 255, 255, 0.6),
      0 0 40px rgba(255, 255, 255, 0.4),
      inset 0 0 12px rgba(255, 255, 255, 0.5);
    filter: brightness(1.3);
  }

  .card:hover {
    transform: translateY(-2px);
  }
`}</style>
    </div>
  );

  return isLink ? (
    <Link href={`/units/${encodeURIComponent(Name)}`} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}

/* ----------------------------- Subcomponent ----------------------------- */

function Row({ label, value }) {
  const color =
    ColorConfig.getStatColor?.(label, value) || "#ffffff";
  const isGradient = color.startsWith("linear-gradient");

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="font-semibold text-white/85">{label}:</span>
      {isGradient ? (
        <span
          className="font-extrabold"
          style={{
            background: color,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 8px rgba(255,255,255,0.25)",
          }}
        >
          {value}
        </span>
      ) : (
        <span
          className="font-bold"
          style={{
            color,
            textShadow: "0 0 8px rgba(255,255,255,0.25)",
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

