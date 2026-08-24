import { createFileRoute } from "@tanstack/react-router";

/**
 * Server-side Geoapify reverse geocoding: lat/lng -> human-readable place.
 * Intended for debugging driver/bus positions. Server-only API key.
 */
export const Route = createFileRoute("/api/public/reverse-geocode")({
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

        const params = new URL(request.url).searchParams;
        const lat = Number(params.get("lat"));
        const lng = Number(params.get("lng"));
        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng) ||
          lat < -90 ||
          lat > 90 ||
          lng < -180 ||
          lng > 180
        ) {
          return Response.json(
            { ok: false, error: "Provide valid 'lat' and 'lng' query parameters" },
            { status: 400 },
          );
        }

        const upstream = new URL("https://api.geoapify.com/v1/geocode/reverse");
        upstream.searchParams.set("lat", String(lat));
        upstream.searchParams.set("lon", String(lng));
        upstream.searchParams.set("apiKey", apiKey);

        const response = await fetch(upstream);
        if (!response.ok) {
          const body = await response.text();
          console.error(`[geoapify] reverse geocode failed [${response.status}]: ${body}`);
          return Response.json(
            { ok: false, status: response.status, error: body },
            { status: 502 },
          );
        }

        const data = (await response.json()) as {
          features?: Array<{
            properties?: {
              formatted?: string;
              name?: string;
              street?: string;
              city?: string;
              state?: string;
              country?: string;
            };
          }>;
        };
        const first = data.features?.[0]?.properties;

        return Response.json({
          ok: true,
          lat,
          lng,
          formatted: first?.formatted ?? null,
          place: first
            ? {
                name: first.name ?? null,
                street: first.street ?? null,
                city: first.city ?? null,
                state: first.state ?? null,
                country: first.country ?? null,
              }
            : null,
        });
      },
    },
  },
});
