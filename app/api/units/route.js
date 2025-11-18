import clientPromise from "../../../lib/mongodb";
import unitsData from "../../data/units.json";

export async function GET() {
  console.log("🔍 API /units triggered");

  try {
    const client = await clientPromise;
    const db = client.db("avvalues");
    const collection = db.collection("units");

    const units = await collection.find({}).toArray();

    if (!units || units.length === 0) {
      console.warn("⚠️ No MongoDB data found, sending fallback JSON");
      return Response.json(unitsData);
    }

    console.log(`✅ Returning ${units.length} units from MongoDB`);
    return Response.json(units);
  } catch (err) {
    console.error("❌ Error in /api/units:", err);
    return Response.json(unitsData);
  }
}
