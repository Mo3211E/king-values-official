// app/colorConfig.js

// ----------- NAME COLORS (Units & Skins) -----------
export const unitColors = {
  "DBZ Broly": "#ffa0e4",
  "Diavolo": "#9900ff",
  "Gogeta": "#ff5e0c",
  "Giselle": "#0aff69",
  "Seven": "#ffa0e4",
  "Seiko": "#ffa0e4",
  "Octopus": "#ffa0e4",
  "Subaru": "#ff0000",
  "Esdeath": "#ff0000",
  "Choi Jong-In": "#ff0000",
  "Mark": "#ff0000",
  "Katakuri": "#ff0000",
  "Jin Mori": "#ff0000",
  "Coyote Starrk": "#ff0000",
  "Frieren": "#ff0000",
  "Ragna": "#ff0000",
  "Diego": "#ffa0e4",
  "Gilgamesh": "#ffa0e4",
  "Rengoku": "#ffa0e4",
  "Toji": "#ffa0e4",
  "Mahito": "#ffa0e4",
  "Mechamaru": "#ffa0e4",
  "Hatsune Miku": "#ffa0e4",
  "Killer Bee": "#ffa0e4",
  "Rock Lee": "#ffa0e4",
  "Ginyu": "#ffa0e4",
  "Bardock": "#ffa0e4",
  "Okarun": "#ffa0e4",
  "Aladdin": "#ffa0e4",
  "Lucy": "#ffa0e4",
  "David": "#ffa0e4",
  "Haruka Rin (Evo)": "#ffa0e4",
  "Unevo Haruka Rin": "#ffa0e4",
  "Emilia": "#ffa0e4",
  "Fubuki": "#ffa0e4",
  "Peeny-Weeny": "#ffa0e4",
  "Momo": "#ffa0e4",
  "Judar": "#ffa0e4",
  "Kareem": "#ffa0e4",
  "Rem and Ram": "#ffa0e4",
  "Weather Report": "#ffa0e4",
  "Sakuya": "#ffa0e4",
  "Hiei": "#ffa0e4",
  "Hibana": "#ffa0e4",
  "Arcueid": "#ffa0e4",
  "Reimu": "#ffa0e4",
  "Vergil": "#ffa0e4",
  "Dante": "#ffa0e4",
  "Merlin": "#ffa0e4",
  "Rudeus": "#ffa0e4",
  "Quetzalcoatl": "#ffa0e4",
  "Alibaba": "#ffa0e4",
  "Deidara": "#ffa0e4",
  "Sasori": "#ffa0e4",
  "Julius": "#ffa0e4",
  "Sion": "#ffa0e4",
  "LagShooter": "#ffa0e4",
  "Mereoleona": "#ff0000",
  "Rimuru": "#ff0000",
  "Escanor": "#ff9900",
  "Kaguya": "#ffffff",
  "Vanguard Event Skins": "#40e696",
  "Kimono Saber": "#ff0000",
  "Suit Gojo": "#ff0000",
  "Fern": "#ff0000",
  "Casual Gilgamesh": "#ff0000",
  "Drip Goku": "#ff0000",
  "Casual Ichigo": "#ff0000",
  "Baddie Vergil": "#ff0000",
  "Baddie Katakuri": "#ff0000",
  "A Pimp Named Slickback": "#ff0000",
  "Goth Ackermans": "#ff0000",
  "Timika": "#ff0000",
  "Mark Variants": "#ff0000",
  "Summer Rimuru": "#ff0000",
  "Final Boss": "#ff0000",
  "Ascended Nirvana": "#ff0000",
  "Knight Artorias": "#ff0000",
  "Event Banner Skins": "#ff0000",
  "Ishtar": "#0aff69",
  "Galaxy Ishtar": "#ff0000",
  "Janny": "#ffa0e4",
  "Roy Mustang": "#ffa0e4",
  "Doorman": "#ffa0e4",
  "Kye": "#ffa0e4",
  "Lucy UmaFuma": "#ffa0e4",
  "Witch UmaFuma": "#ffa0e4",
  "Goblin Slayer": "#ffa0e4",
  "Priestess": "#ffa0e4"
};

// ----------- CATEGORY COLORS -----------
export const categoryColors = {
  Units: "#797979ff",          // dark grey for category label on cards
  Familiars: "#3c78d8",      // force familiar names to this color
  Skins: "#00ffff",
  Stats: "#008b8b"           // 🆕 dark turquoise for Stats
};

export const SHINY_GOLD = "#efbf04";

// ---------- DEMAND COLORS ----------
export const demandColors = {
  "9": "linear-gradient(90deg, #00ff84, #4dffb8)", // bright green gradient for max demand
  "10": "linear-gradient(90deg, #00ffa3, #80ffe0, #ccfff5)", // special gradient
  "7": "#80ff80",
  "8": "#40ff60",
  "5": "#aaff80",
  "6": "#99ff80",
  "3": "#ff6666",
  "4": "#ff8080",
  "1": "#ff3333",
  "2": "#ff4d4d",
  default: "#ffffff",
};

// ---------- STABILITY COLORS ----------
export const stabilityColors = {
  Stable: "#00ff80", // bright green
  Hyped: "#ffe87d", // goldish yellow
  Overpriced: "linear-gradient(90deg, #8c52ff, #b87fff, #d6b3ff)", // galaxy purple gradient to fit site theme
  Underpriced: "linear-gradient(90deg, #ff5252ff, #f8b79dff, #ff6767ff)",
  Varies: "linear-gradient(90deg, #0f0cc2ff, #67a8f7ff, #2818bbff)",
  Unstable: "#ff5e5e", // red
  Declining: "#cc2d1bff", // deep red
  default: "#ffffff",
};

// ---------- VALUE COLORS ----------
export const valueColors = {
  "Owner's Choice": "linear-gradient(90deg, #fff3a0, #ffd84d, #fff8cc)",
  default: "#ffffff",
};

export function splitNameParts(full) {
  if (!full) return { shiny: "", base: "" };
  const has = full.trim().toLowerCase().startsWith("shiny ");
  return has
    ? { shiny: "Shiny", base: full.replace(/^Shiny\s+/i, "").trim() }
    : { shiny: "", base: full.trim() };
}

// Return the display color for a name given category
export function getNameColor(category, rawName) {
  const { shiny, base } = splitNameParts(rawName || "");

  // 🟡 Gold for shiny names
  if (shiny) return SHINY_GOLD;

  // 🌈 Rainbow gradient for all Robux Items
  if (category === "Robux Items") {
    return "linear-gradient(90deg, red, orange, yellow, green, cyan, blue, violet)";
  }

  // Normal category colors for Familiars and others
  if (category === "Familiars" || category === "Robux Items" || category === "Stats") {
    return categoryColors[category];
  }

  // Default: look up by base name or fallback to white
  return unitColors[base] || "#ffffff";
}

// Category label color on the card (we always want Units dark grey)
export function getCategoryLabelColor(category) {
  // 🌈 Rainbow gradient for the category label as well
  if (category === "Robux Items") {
    return "linear-gradient(90deg, red, orange, yellow, green, cyan, blue, violet)";
  }

  if (category === "Stats") return categoryColors.Stats;
  if (category === "Units") return categoryColors.Units;
  return categoryColors[category] || "#a9b0bb";
}

export function getStatColor(label, value) {
  const v = String(value ?? "").trim();
  const low = v.toLowerCase();

  if (label === "Value") {
    if (low.includes("owner")) return valueColors["Owner's Choice"];
    return valueColors.default;
  }

  if (label === "Demand") {
    const num = parseInt(v, 10);
    return demandColors[num] || demandColors.default;
  }

  if (label === "Stability") {
    return stabilityColors[v] || stabilityColors.default;
  }

  return "#ffffff";
}
