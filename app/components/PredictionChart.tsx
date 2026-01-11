"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import type { PredictionPoint } from "../lib/loadPredictionCsv";

type Props = {
  data: PredictionPoint[];
};

type ChartRow = {
  date: string; // YYYY-MM-DD
  y: number;
};

function toYmd(d: Date): string {
  // alltid YYYY-MM-DD
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function PredictionChart({ data }: Props) {
  const rows: ChartRow[] = data.map((p) => ({
    date: toYmd(p.t),
    y: p.y,
  }));

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 12, right: 16, left: 0, bottom: 28 }}>
          <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              type="category"
              interval={1}
              tick={{ fontSize: 11 }}
              angle={-35}
              textAnchor="end"
              height={70}
              label={{
                value: "Date",
                position: "insideBottom",
                offset: -10,
                style: {
                  fontSize: 12,
                  fill: "#334155", // slate-700
                  fontWeight: 500,
                },
              }}
            />

            <YAxis
              domain={[(dataMin: number) => dataMin - 5, "auto"]}
              tick={{ fontSize: 12 }}
              label={{
                value: "Water level (cm)",
                angle: -90,
                position: "insideLeft",
                offset: 10,          // 👈 större värde = längre ned
                style: {
                  fontSize: 13,
                  fill: "#334155",   // slate-700
                  fontWeight: 500,
                },
                dy: 40,
              }}
            />
            <Tooltip
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(v) => [Number(v).toFixed(2), "Water level (cm)"]}
          />
          <Line type="monotone" dataKey="y" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
