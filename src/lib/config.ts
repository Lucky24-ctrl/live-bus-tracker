/**
 * Runtime configuration read from environment variables.
 * Never hardcode keys — set these in the project environment.
 */
export const mapboxToken: string =
  (import.meta.env['VITE_LOVABLE_CONNECTOR_MAPBOX_PUBLIC_TOKEN'] as string | undefined) ??
  (import.meta.env['VITE_MAPBOX_PUBLIC_TOKEN'] as string | undefined) ??
  "";

export const isMapboxConfigured = mapboxToken.length > 0;

/** Default map centre used until live data arrives (Bengaluru city centre). */
export const defaultCenter = { lat: 12.9767, lng: 77.5946 };

/** How often the driver device pushes its position, in milliseconds. */
export const locationPushIntervalMs = 5000;

/** A bus is considered live if its last ping is newer than this. */
export const liveThresholdMs = 60_000;
