import type { LatLng } from "@/lib/types";

export type Bounds = { minLat: number; maxLat: number; minLng: number; maxLng: number };

const MIN_SPAN = 0.01;

export function boundsOf(points: LatLng[], fallback: LatLng): Bounds {
  const source = points.length > 0 ? points : [fallback];
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  for (const point of source) {
    minLat = Math.min(minLat, point.lat);
    maxLat = Math.max(maxLat, point.lat);
    minLng = Math.min(minLng, point.lng);
    maxLng = Math.max(maxLng, point.lng);
  }
  if (maxLat - minLat < MIN_SPAN) {
    const mid = (maxLat + minLat) / 2;
    minLat = mid - MIN_SPAN / 2;
    maxLat = mid + MIN_SPAN / 2;
  }
  if (maxLng - minLng < MIN_SPAN) {
    const mid = (maxLng + minLng) / 2;
    minLng = mid - MIN_SPAN / 2;
    maxLng = mid + MIN_SPAN / 2;
  }
  return { minLat, maxLat, minLng, maxLng };
}

/** Projects a coordinate into 0-100 percentage space with padding. */
export function project(point: LatLng, bounds: Bounds): { x: number; y: number } {
  const pad = 12;
  const scale = 100 - pad * 2;
  const x = pad + ((point.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * scale;
  const y = pad + ((bounds.maxLat - point.lat) / (bounds.maxLat - bounds.minLat)) * scale;
  return { x, y };
}
