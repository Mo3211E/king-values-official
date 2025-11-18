"use client";

import * as ColorConfig from "../colorConfig";

const SHINY_GOLD = ColorConfig.SHINY_GOLD || "#efbf04";

// Final size choice (Option 1)
const CARD_WIDTH = 190;
const CARD_HEIGHT = 300;
const IMAGE_SIZE = 115;

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

export default function MobileViewUnitCard({
  u,
  compact = false, // kept for signature compatibility
  isLink = false,  // kept for signature compatibility
  onClick,
}) {
  const { Name, Category, Image, Value, Demand, Stability } = u || {};
  const safeName = Name || "Unknown";
  const { shiny, base } = splitName(safeName);

  const categoryLabelColor = ColorConfig.getCategoryLabelColor?.(Category);
  const baseNameColor = ColorConfig.getNameColor
    ? ColorConfig.getNameColor(Category, shiny ? base : safeName)
    : "#ffffff";

  const hoverColor = shiny ? SHINY_GOLD : baseNameColor;

  const titleFontSize = (() => {
    const len = safeName.length;
    if (len <= 10) return "1.5rem";
    if (len <= 16) return "1.35rem";
    if (len <= 22) return "1.2rem";
    return "1.05rem";
  })();

  const wrapperProps = {
    className:
      "inline-block cursor-pointer select-none touch-manipulation rounded-2xl",
    onClick,
    style: { width: CARD_WIDTH, maxWidth: "100%" },
  };

  const card = (
    <div
      className="relative mobile-view-card flex flex-col"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: "1.1rem",
        padding: "0.55rem 0.55rem 0.75rem 0.55rem",
        background:
          "linear-gradient(180deg, rgba(20,5,45,0.98) 0%, rgba(5,0,20,0.98) 100%)",
        boxShadow:
          "0 0 16px rgba(0,0,0,0.8), 0 0 24px rgba(130,90,220,0.28)",
        position: "relative",
        ["--glow"]: hoverColor,
      }}
    >
      {/* Title */}
      <div
        className="text-center font-extrabold leading-tight mb-[4px] h-[2.4em] flex items-center justify-center px-1"
        style={{
          fontSize: titleFontSize,
          textShadow: `0 0 6px ${
            shiny ? SHINY_GOLD : baseNameColor
          }80, 0 0 18px ${
            shiny ? SHINY_GOLD : baseNameColor
          }55, 0 0 24px rgba(0,0,0,0.9)`,
        }}
      >
        {typeof baseNameColor === "string" &&
        baseNameColor.startsWith("linear-gradient") ? (
          <span
            style={{
              background: baseNameColor,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 800,
            }}
          >
            {safeName}
          </span>
        ) : shiny ? (
          <>
            <span
              style={{
                color: SHINY_GOLD,
                marginRight: "0.25em",
                textShadow: `0 0 6px ${SHINY_GOLD}90, 0 0 16px ${SHINY_GOLD}70`,
              }}
            >
              Shiny
            </span>
            <span style={{ color: baseNameColor }}>{base}</span>
          </>
        ) : (
          <span style={{ color: baseNameColor }}>{safeName}</span>
        )}
      </div>

      {/* Category */}
      <div
        className="text-center font-semibold mb-[6px]"
        style={{
          fontSize: "0.9rem",
          ...(categoryLabelColor?.startsWith("linear-gradient")
            ? {
                background: categoryLabelColor,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
              }
            : { color: categoryLabelColor || "#e5ddff" }),
          textShadow: "0 0 8px rgba(0,0,0,0.8)",
        }}
      >
        {Category || "Units"}
      </div>

      {/* Image */}
      {Image && (
        <div
          className="mx-auto mb-2 rounded-xl overflow-hidden flex items-center justify-center bg-black/35"
          style={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            boxShadow: "0 0 10px rgba(0,0,0,0.85)",
          }}
        >
          <img
            src={Image}
            alt={safeName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Stats */}
      <div className="flex-1 flex flex-col justify-between px-2.5 pt-2 text-[0.9rem]">
        <StatRow label="Value" value={fmt(Value)} />
        <StatRow label="Demand" value={Demand ?? "N/A"} />
        <StatRow label="Stability" value={Stability ?? "N/A"} />
      </div>

      {/* Gradient border */}
      <style jsx>{`
        .mobile-view-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 1.1rem;
          padding: 2px;
          background: linear-gradient(135deg, #ffffff, #000000, #ffffff);
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          transition: all 0.3s ease;
        }

        .mobile-view-card:hover::before {
          background: linear-gradient(
            135deg,
            var(--glow),
            #000000,
            var(--glow)
          );
          box-shadow:
            0 0 14px var(--glow),
            0 0 24px var(--glow),
            inset 0 0 8px var(--glow);
          filter: brightness(1.1);
        }

        .mobile-view-card:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );

  return <div {...wrapperProps}>{card}</div>;
}

function StatRow({ label, value }) {
  const color =
    ColorConfig.getStatColor?.(label, value) || "#ffffff";
  const isGradient =
    typeof color === "string" && color.startsWith("linear-gradient");

  return (
    <div className="flex items-center justify-between py-[3px]">
      <span className="font-semibold text-white/85 text-[0.9rem]">
        {label}:
      </span>
      {isGradient ? (
        <span
          className="font-extrabold text-[0.95rem]"
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
          className="font-bold text-[0.95rem]"
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
