import { createFileRoute } from "@tanstack/react-router";

/**
 * Server-side Geoapify forward geocoding: place/stop name -> coordinates.
 * The API key is read from the GEOAPIFY_API_KEY secret on the server only.
 */
export const Route = createFileRoute("/api/public/geocode")({
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

        const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
        if (query.length < 2 || query.length > 120) {
          return Response.json(
            { ok: false, error: "Query parameter 'q' must be 2-120 characters" },
            { status: 400 },
          );
        }

        const upstream = new URL("https://api.geoapify.com/v1/geocode/search");
        upstream.searchParams.set("text", query);
        upstream.searchParams.set("limit", "5");
        upstream.searchParams.set("apiKey", apiKey);

        const response = await fetch(upstream);
        if (!response.ok) {
          const body = await response.text();
          console.error(`[geoapify] geocode failed [${response.status}]: ${body}`);
          return Response.json(
            { ok: false, status: response.status, error: body },
            { status: 502 },
          );
        }

        const data = (await response.json()) as {
          features?: Array<{
            properties?: { formatted?: string; name?: string; place_id?: string };
            geometry?: { coordinates?: [number, number] };
          }>;
        };

        const results = (data.features ?? []).map((feature) => ({
          name: feature.properties?.name ?? feature.properties?.formatted ?? query,
          formatted: feature.properties?.formatted ?? null,
          lat: feature.geometry?.coordinates?.[1] ?? null,
          lng: feature.geometry?.coordinates?.[0] ?? null,
        }));

        return Response.json({ ok: true, results });
      },
    },
  },
});
