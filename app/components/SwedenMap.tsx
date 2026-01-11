"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect } from "react";
import type { UiSensor } from "../types/sensor";

interface Props {
  sensors: UiSensor[];
  onSelect: (sensor: UiSensor) => void;
}

const fixLeafletIcons = (): void => {
  // @ts-expect-error leaflet intern
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  });
};

export default function SwedenMap({ sensors, onSelect }: Props) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  return (
    <MapContainer center={[62, 15]} zoom={5} className="h-[70vh] w-full rounded-xl">
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {sensors.map((s) => (
        <Marker
          key={s.key}
          position={[s.latitude, s.longitude]}
          eventHandlers={{ click: () => onSelect(s) }}
        >
          <Popup>
  <div className="min-w-[180px]">
    <div className="text-base font-semibold text-slate-900">
      {s.name}
    </div>
    <div className="mt-1 text-sm text-slate-700">
      Station <span className="font-medium">{s.station_id}</span>
    </div>
    <div className="mt-2 text-xs text-slate-600">
      {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
    </div>
  </div>
</Popup>

        </Marker>
      ))}
    </MapContainer>
  );
}
