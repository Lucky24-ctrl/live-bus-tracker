import { createServerFn } from "@tanstack/react-start";

/**
 * Returns the Geoapify API key so the browser can load interactive map
 * tiles directly from Geoapify's tile CDN. The key is read from the
 * project secret store at request time — it is never hardcoded and never
 * shipped in the client bundle as a literal.
 */
export const getGeoapifyMapKey = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["GEOAPIFY_API_KEY"];
  if (!key) {
    throw new Error("GEOAPIFY_API_KEY secret is not configured");
  }
  return { key };
});
