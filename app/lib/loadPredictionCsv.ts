import Papa from "papaparse";
import { withFourHourCache } from "./cacheBuster";




export type PredictionPoint = {
  t: Date;
  y: number;
};

type RawRow = {
  date?: string;
  water_level_cm?: string;
};

function fourHourBucket(): number {
  const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
  return Math.floor(Date.now() / FOUR_HOURS_MS);
}



export async function loadPredictionCsv(csvPath: string): Promise<PredictionPoint[]> {

  const url = withFourHourCache(csvPath);
  const res = await fetch(url, { cache: "no-store" });
  
  if (!res.ok) throw new Error(`Failed to fetch CSV (${res.status}): ${csvPath}`);

  const text = await res.text();

  const parsed = Papa.parse<RawRow>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors?.length) {
    throw new Error(`CSV parse error: ${parsed.errors[0].message}`);
  }

  const points: PredictionPoint[] = parsed.data
    .map((r) => {
      if (!r.date || r.water_level_cm == null) return null;

      // date: "YYYY-MM-DD"
      const t = new Date(r.date);
      const y = Number(r.water_level_cm);

      if (Number.isNaN(t.getTime()) || Number.isNaN(y)) return null;
      return { t, y };
    })
    .filter((p): p is PredictionPoint => p !== null)
    .sort((a, b) => a.t.getTime() - b.t.getTime());

  if (points.length === 0) throw new Error(`No valid rows in CSV: ${csvPath}`);
  return points;
}
