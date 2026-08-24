import { createFileRoute } from "@tanstack/react-router";

/**
 * Server-side proxy for Geoapify Static Maps images.
 *
 * The browser requests /api/public/map-image?style=...&marker=... and this
 * route forwards the request to Geoapify with the secret API key attached
 * server-side. The key never reaches the client bundle.
 */

const ALLOWED_STYLES = new Set([
  "osm-carto",
  "osm-bright",
  "osm-bright-smooth",
  "dark-matter",
  "dark-matter-brown",
  "klokantech-basic",
  "positron",
]);

const MAX_MARKERS = 50;

function clampInt(value: string | null, min: number, max: number, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export const Route = createFileRoute("/api/public/map-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const apiKey = process.env["GEOAPIFY_API_KEY"];
        if (!apiKey) {
          return Response.json(
            { ok: false, error: "GEOAPIFY_API_KEY secret is not configured" },
            { status: 500 },
          );
        }

        const incoming = new URL(request.url);

        const style = incoming.searchParams.get("style") ?? "osm-carto";
        if (!ALLOWED_STYLES.has(style)) {
          return Response.json({ ok: false, error: "Invalid map style" }, { status: 400 });
        }

        const upstream = new URL("https://maps.geoapify.com/v1/staticmap");
        upstream.searchParams.set("style", style);
        upstream.searchParams.set("width", String(clampInt(incoming.searchParams.get("width"), 128, 1920, 1024)));
        upstream.searchParams.set("height", String(clampInt(incoming.searchParams.get("height"), 128, 1920, 768)));

        const markers = incoming.searchParams.getAll("marker").slice(0, MAX_MARKERS);
        for (const marker of markers) {
          upstream.searchParams.append("marker", marker);
        }

        // When no markers are provided the caller must supply center/zoom,
        // otherwise Geoapify auto-fits the map to the markers.
        const center = incoming.searchParams.get("center");
        const zoom = incoming.searchParams.get("zoom");
        if (center && /^lonlat:-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(center)) {
          upstream.searchParams.set("center", center);
          upstream.searchParams.set("zoom", String(clampInt(zoom, 1, 20, 12)));
        } else if (markers.length === 0) {
          return Response.json(
            { ok: false, error: "Provide at least one marker or a valid center" },
            { status: 400 },
          );
        }

        upstream.searchParams.set("apiKey", apiKey);

        const response = await fetch(upstream);
        if (!response.ok) {
          const body = await response.text();
          console.error(`[geoapify] staticmap failed [${response.status}]: ${body}`);
          return Response.json(
            { ok: false, status: response.status, error: body },
            { status: 502 },
          );
        }

        return new Response(response.body, {
          status: 200,
          headers: {
            "content-type": response.headers.get("content-type") ?? "image/png",
            "cache-control": "public, max-age=10",
          },
        });
      },
    },
  },
});
