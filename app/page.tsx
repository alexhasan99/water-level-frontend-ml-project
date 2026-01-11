"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { SensorMap, UiSensor } from "./types/sensor";
import { loadPredictionCsv, type PredictionPoint } from "./lib/loadPredictionCsv";
import PredictionChart from "./components/PredictionChart";
import { withFourHourCache } from "./lib/cacheBuster";

const SwedenMap = dynamic(() => import("./components/SwedenMap"), { ssr: false });

export default function Page() {
  const [sensors, setSensors] = useState<UiSensor[]>([]);
  const [selected, setSelected] = useState<UiSensor | null>(null);

  const [pred, setPred] = useState<PredictionPoint[] | null>(null);
  const [predError, setPredError] = useState<string | null>(null);
  const [loadingPred, setLoadingPred] = useState(false);

  useEffect(() => {
    fetch("/data/sensors.json", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: SensorMap) => {
        const list: UiSensor[] = Object.entries(data).map(([key, sensor]) => ({
          key,
          ...sensor,
        }));
        setSensors(list);
      });
  }, []);

  async function onSelectSensor(s: UiSensor) {
    setSelected(s);
    setPred(null);
    setPredError(null);

    if (!s.csvPath) {
      setPredError("No prediction CSV configured for this sensor.");
      return;
    }

    try {
      setLoadingPred(true);
      const points = await loadPredictionCsv(s.csvPath);
      setPred(points);
    } catch (e: any) {
      setPredError(e?.message ?? "Failed to load predictions.");
    } finally {
      setLoadingPred(false);
    }
  }

  const selectedImageUrl = useMemo(() => {
    if (!selected?.evalImagePath) return null;
    return withFourHourCache(selected.evalImagePath);
  }, [selected?.evalImagePath]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
      {/* Header */}
      <header className="mx-auto max-w-6xl px-6 pt-10 pb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
              <span className="h-2 w-2 rounded-full bg-brand-400" />
              Water level forecasting • Sweden
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
              Hydrology ML Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm md:text-base text-white/70">
              Interactive map with monitoring stations. Click on a sensor to view
              daily forecasts and compare model predictions with observed data.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="rounded-xl bg-white/10 px-4 py-3">
              <div className="text-xs text-white/60">Sensors</div>
              <div className="text-lg font-semibold">{sensors.length}</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3">
              <div className="text-xs text-white/60">Update interval</div>
              <div className="text-lg font-semibold">4h</div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        {/* Top grid: Map + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map card */}
          <div className="lg:col-span-2 rounded-xl2 bg-white/5 p-4 shadow-soft border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold">Map</div>
                <div className="text-xs text-white/60">Sweden • monitoring stations</div>
              </div>

              <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                Click on a point
              </div>
            </div>
            <SwedenMap sensors={sensors} onSelect={onSelectSensor} />
          </div>

          {/* Info card */}
          <aside className="rounded-xl2 bg-white/5 p-5 shadow-soft border border-white/10">
            {!selected ? (
              <div className="text-white/70">
                <div className="text-sm font-semibold text-white">Sensor details</div>
                <p className="mt-2 text-sm text-white/60">
                  Select a station on the map to view summary information,
                  prediction data, and evaluation plots.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-white/60">Selected sensor</div>
                    <h2 className="mt-1 text-xl font-semibold">{selected.name}</h2>
                    <div className="mt-2 text-sm text-white/70">
                      Station ID:{" "}
                      <span className="font-medium text-white">
                        {selected.station_id}
                      </span>
                    </div>
                  </div>

                  <span className="rounded-full bg-brand-500/20 text-brand-100 border border-brand-400/30 px-3 py-1 text-xs font-medium">
                    {selected.key}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <div className="text-xs text-white/60">Summary</div>
                    <div className="mt-1 text-sm text-white/85">
                      {selected.summary ?? "No summary available."}
                    </div>
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>

        {/* Bottom: Chart + Evaluation image */}
        <div className="mt-6 rounded-xl2 bg-white/5 p-5 shadow-soft border border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">
                {selected ? `Daily forecast — ${selected.name}` : "Daily forecast"}
              </div>
              <div className="text-xs text-white/60">
                Day-by-day water level (cm)
              </div>
            </div>

            <div className="flex gap-2">
              {pred ? (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                  Points:{" "}
                  <span className="text-white font-medium">{pred.length}</span>
                </span>
              ) : null}
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                Refresh: 4h
              </span>
            </div>
          </div>

          {!selected ? (
            <div className="mt-4 text-white/70">
              Select a sensor to display the forecast chart.
            </div>
          ) : loadingPred ? (
            <div className="mt-4 text-white/70">Loading CSV…</div>
          ) : predError ? (
            <div className="mt-4 text-red-200">{predError}</div>
          ) : pred ? (
            <div className="mt-4 rounded-xl bg-white p-4 text-slate-900">
              <PredictionChart data={pred} />

              {/* Evaluation image under chart */}
              <div className="mt-6 rounded-xl2 bg-white/5 p-5 shadow-soft border border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  Actual vs Predicted
                </div>
                <div className="text-sm font-semibold">
                  Model predictions compared with observed water levels.
                </div>

                {selectedImageUrl ? (
                  <div className="mt-3 overflow-hidden rounded-lg border border-[color:var(--card-border)] bg-white">
                    <img
                      src={selectedImageUrl}
                      alt={`Actual vs Predicted - ${selected.name}`}
                      className="w-full h-auto block"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-slate-600">
                    No evaluation image available for this sensor.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4 text-white/70">No data loaded yet.</div>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-8 text-xs text-white/50">
          Data sources: SMHI observations and model predictions (GitHub artifacts).
          The UI refreshes data using a 4-hour cache window.
        </div>
      </section>
    </main>
  );
}
