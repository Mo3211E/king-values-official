import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { MongoClient } from "mongodb";

const MONGO_URI = "mongodb+srv://moelborno32:MongoDBJordan2017@cluster0.kbnc90s.mongodb.net/avvalues?appName=Cluster0";
const DB_NAME = "avvalues";
const COLLECTION = "units";
const CSV_FILE = path.resolve("./AV_AIO.csv");
const JSON_FILE = path.resolve("./app/data/units.json");

function loadCsvRows() {
  if (!fs.existsSync(CSV_FILE)) throw new Error(`CSV not found at ${CSV_FILE}`);

  // Read whole file
  let text = fs.readFileSync(CSV_FILE, "utf8").replace(/^\uFEFF/, "");

  // ✅ Skip extra rows before header line
  const headerIndex = text.indexOf("Name,Value");
  if (headerIndex > 0) {
    text = text.slice(headerIndex);
  }

  const parsed = Papa.parse(text, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: true,
  });

  if (parsed.errors?.length) {
    console.error("PapaParse errors:", parsed.errors.slice(0, 3));
  }

  const rows = (parsed.data || []).map(r => ({
    name: String(r["Name"] ?? "").trim(),
    value: String(r["Value (RR)"] ?? r["Value"] ?? "").trim(),
    demand: String(r["Demand"] ?? "").trim(),
  })).filter(r => r.name);

  console.log(`🔍 Detected delimiter: ','`);
  return rows;
}

async function main() {
  console.log("📘 Reading CSV...");
  const updates = loadCsvRows();
  console.log(`✅ Parsed ${updates.length} rows from CSV.`);
  if (updates.length) console.log("👀 First 5 names:", updates.slice(0, 5).map(r => r.name));

  const client = new MongoClient(MONGO_URI);
  let updated = 0, inserted = 0;
  try {
    await client.connect();
    const col = client.db(DB_NAME).collection(COLLECTION);

    for (const { name, value, demand } of updates) {
      const res = await col.updateOne(
        { Name: name },
        { $set: { Value: value, Demand: demand } }
      );
      if (res.matchedCount === 0) {
        await col.insertOne({
          Name: name,
          Value: value,
          Demand: demand,
          Category: "Units",
          Stability: "Stable",
          Obtainment: "Unknown",
          Justification: "Added via CSV sync",
          votes: {},
          feedbacks: [],
        });
        inserted++;
      } else {
        updated++;
      }
    }
    console.log(`✅ ${updated} units updated in MongoDB`);
    console.log(`🆕 ${inserted} new units added to MongoDB`);
  } catch (e) {
    console.error("❌ MongoDB error:", e.message);
  } finally {
    await client.close();
    console.log("🔒 Database connection closed.");
  }

  console.log("🧩 Updating local units.json...");
  if (!fs.existsSync(JSON_FILE)) throw new Error(`units.json not found at ${JSON_FILE}`);

  const backup = JSON_FILE.replace(/\.json$/i, `.${Date.now()}.backup.json`);
  fs.copyFileSync(JSON_FILE, backup);

  const units = JSON.parse(fs.readFileSync(JSON_FILE, "utf8"));
  const byName = new Map(units.map(u => [String(u.Name || "").trim(), u]));

  for (const { name, value, demand } of updates) {
    const hit = byName.get(name);
    if (hit) {
      hit.Value = value;
      hit.Demand = demand;
    } else {
      units.push({
        Name: name,
        Value: value,
        Demand: demand,
        Category: "Units",
        Stability: "Stable",
        Obtainment: "Unknown",
        Justification: "Added via CSV sync",
        votes: {},
        feedbacks: [],
      });
    }
  }

  fs.writeFileSync(JSON_FILE, JSON.stringify(units, null, 2));
  console.log(`💾 units.json successfully updated! (backup: ${path.basename(backup)})`);
}

main().catch(err => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
