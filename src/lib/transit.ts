import { supabase } from "@/integrations/supabase/client";
import { liveThresholdMs } from "./config";
import type { Bus, BusRoute, LatLng, LiveLocation, Stop, TrackedBus } from "./types";

function parseStops(value: unknown): Stop[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const stop = raw as Record<string, unknown>;
    const lat = Number(stop['lat']);
    const lng = Number(stop['lng']);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return [];
    return [{ name: String(stop['name'] ?? "Stop"), lat, lng }];
  });
}

export async function fetchRoutes(): Promise<BusRoute[]> {
  const { data, error } = await supabase.from("routes").select("id, name, stops").order("name");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    stops: parseStops(row.stops),
  }));
}

export async function fetchBuses(): Promise<Bus[]> {
  const { data, error } = await supabase
    .from("buses")
    .select("id, bus_number, route_id")
    .order("bus_number");
  if (error) throw error;
  return data ?? [];
}

export async function fetchLiveLocations(): Promise<LiveLocation[]> {
  const { data, error } = await supabase
    .from("live_locations")
    .select("id, bus_id, latitude, longitude, speed, heading, accuracy, updated_at");
  if (error) throw error;
  return data ?? [];
}

export async function fetchFleet(): Promise<TrackedBus[]> {
  const [routes, buses, locations] = await Promise.all([
    fetchRoutes(),
    fetchBuses(),
    fetchLiveLocations(),
  ]);
  const routeById = new Map(routes.map((route) => [route.id, route]));
  const locationByBus = new Map(locations.map((location) => [location.bus_id, location]));
  return buses.map((bus) => ({
    bus,
    route: bus.route_id ? (routeById.get(bus.route_id) ?? null) : null,
    location: locationByBus.get(bus.id) ?? null,
  }));
}

/** Upsert the current position of a bus (driver side). */
export async function pushLocation(input: {
  busId: string;
  latitude: number;
  longitude: number;
  speed?: number | null;
  heading?: number | null;
  accuracy?: number | null;
}): Promise<void> {
  const { error } = await supabase.from("live_locations").upsert(
    {
      bus_id: input.busId,
      latitude: input.latitude,
      longitude: input.longitude,
      speed: input.speed ?? null,
      heading: input.heading ?? null,
      accuracy: input.accuracy ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "bus_id" },
  );
  if (error) throw error;
}

export function isLive(location: LiveLocation | null): boolean {
  if (!location) return false;
  return Date.now() - new Date(location.updated_at).getTime() < liveThresholdMs;
}

export function formatSpeed(speed: number | null | undefined): string {
  if (speed == null) return "—";
  return `${Math.round(speed)} km/h`;
}

export function formatAgo(iso: string | null | undefined): string {
  if (!iso) return "no signal";
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
}

export function toLatLng(location: LiveLocation): LatLng {
  return { lat: location.latitude, lng: location.longitude };
}
