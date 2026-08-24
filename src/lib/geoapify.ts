import { defaultCenter } from "./config";
import { isLive } from "./transit";
import type { LatLng, Stop, TrackedBus } from "./types";

const MAX_MARKERS = 40;

export type StaticMapInput = {
  buses?: TrackedBus[];
  stops?: Stop[];
  marker?: LatLng | null;
  selectedBusId?: string | null;
  width?: number;
  height?: number;
  style?: string;
};

/**
 * Builds a URL to the server-side Geoapify static map proxy
 * (/api/public/map-image). Markers are encoded as Geoapify marker
 * parameters; the API key is attached by the server route, so nothing
 * secret reaches the browser.
 */
export function buildStaticMapUrl(input: StaticMapInput): string {
  const params = new URLSearchParams();
  params.set("style", input.style ?? "osm-carto");
  params.set("width", String(input.width ?? 1024));
  params.set("height", String(input.height ?? 768));

  let markerCount = 0;
  const addMarker = (value: string) => {
    if (markerCount >= MAX_MARKERS) return;
    params.append("marker", value);
    markerCount += 1;
  };

  // Route stops: small circles along the route.
  for (const stop of input.stops ?? []) {
    addMarker(`lonlat:${stop.lng},${stop.lat};type:circle;color:#38bdf8;size:small`);
  }

  // Buses: material icon, amber when live, slate when stale, rose when selected.
  for (const tracked of input.buses ?? []) {
    const location = tracked.location;
    if (!location) continue;
    const selected = input.selectedBusId != null && input.selectedBusId === tracked.bus.id;
    const color = selected ? "#f43f5e" : isLive(location) ? "#f59e0b" : "#64748b";
    addMarker(
      `lonlat:${location.longitude},${location.latitude};type:material;icon:directions_bus;iconsize:medium;color:${color};strokecolor:#ffffff`,
    );
  }

  // One-off pin (e.g. a searched stop).
  if (input.marker) {
    addMarker(
      `lonlat:${input.marker.lng},${input.marker.lat};type:awesome;icon:map-marker;iconsize:large;color:#e11d48`,
    );
  }

  if (markerCount === 0) {
    params.set("center", `lonlat:${defaultCenter.lng},${defaultCenter.lat}`);
    params.set("zoom", "12");
  }

  return `/api/public/map-image?${params.toString()}`;
}
