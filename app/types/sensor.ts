export interface Sensor {
  name: string;
  station_id: number;
  latitude: number;
  longitude: number;
  summary?: string;
  href?: string;
  periods?: Record<string, string>;
  csvPath?: string;

  evalImagePath?: string; // 👈 ny
}

export type SensorMap = Record<string, Sensor>;
export type UiSensor = Sensor & { key: string };
