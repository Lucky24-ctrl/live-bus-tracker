import { createFileRoute } from "@tanstack/react-router";

/**
 * Server-side Geoapify connectivity check.
 *
 * The API key is read from the GEOAPIFY_API_KEY secret on the server only —
 * it is never exposed to the browser. Future authenticated Geoapify calls
 * (geocoding, routing, etc.) should follow the same pattern.
 */
export const Route = createFileRoute("/api/public/geoapify-health")({
  server: {
    handlers: {
      GET: async () => {
        const apiKey = process.env["GEOAPIFY_API_KEY"];
        if (!apiKey) {
          return Response.json(
            { ok: false, error: "GEOAPIFY_API_KEY secret is not configured" },
            { status: 500 },
          );
        }

        const url = new URL("https://api.geoapify.com/v1/geocode/search");
        url.searchParams.set("text", "Bengaluru, India");
        url.searchParams.set("limit", "1");
        url.searchParams.set("apiKey", apiKey);

        const response = await fetch(url);
        const body = await response.text();
        if (!response.ok) {
          return Response.json(
            { ok: false, status: response.status, error: body },
            { status: 502 },
          );
        }

        const data = JSON.parse(body) as {
          features?: Array<{
            properties?: { formatted?: string };
            geometry?: { coordinates?: [number, number] };
          }>;
        };
        const first = data.features?.[0];
        return Response.json({
          ok: true,
          features: data.features?.length ?? 0,
          sample: first
            ? {
                formatted: first.properties?.formatted ?? null,
                lat: first.geometry?.coordinates?.[1] ?? null,
                lng: first.geometry?.coordinates?.[0] ?? null,
              }
            : null,
        });
      },
    },
  },
});
