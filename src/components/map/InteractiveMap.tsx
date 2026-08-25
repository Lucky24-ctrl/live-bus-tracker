import { ClientOnly } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Suspense, lazy } from "react";

import { defaultCenter } from "@/lib/config";
import { getGeoapifyMapKey } from "@/lib/geoapify-key.functions";
import type { LatLng, Stop, TrackedBus } from "@/lib/types";
import { cn } from "@/lib/utils";

// Leaflet touches browser globals at import time, so it is only ever
// loaded lazily on the client — never during SSR.
const LeafletMap = lazy(() => import("./LeafletMap"));

type InteractiveMapProps = {
  buses?: TrackedBus[];
  stops?: Stop[];
  marker?: LatLng | null;
  selectedBusId?: string | null;
  className?: string;
};

function MapLoading() {
  return (
    <div className="flex h-full min-h-40 items-center justify-center text-sm text-muted-foreground">
      Loading map…
    </div>
  );
}

/**
 * Interactive map surface used across the app.
 *
 * Fetches the Geoapify API key from the server at runtime (nothing
 * hardcoded, no VITE_ variable), shows a visible loading state while the
 * key and tiles load, and a clear error state if the key is missing —
 * instead of falling back to any fake or static map.
 */
export function InteractiveMap({
  buses = [],
  stops = [],
  marker = null,
  selectedBusId = null,
  className,
}: InteractiveMapProps) {
  const { data, isPending, error } = useQuery({
    queryKey: ["geoapify-map-key"],
    queryFn: () => getGeoapifyMapKey(),
    staleTime: Infinity,
    retry: 1,
  });

  return (
    <div
      className={cn(
        "relative isolate w-full overflow-hidden rounded-xl border border-border bg-muted",
        className,
      )}
    >
      {isPending ? (
        <MapLoading />
      ) : error || !data?.key ? (
        <div className="flex h-full min-h-40 flex-col items-center justify-center gap-1 p-4 text-center">
          <p className="text-sm font-medium text-destructive">Map unavailable</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            The Geoapify API key is missing or could not be loaded from the server. Configure the
            GEOAPIFY_API_KEY secret and reload.
          </p>
        </div>
      ) : (
        <ClientOnly fallback={<MapLoading />}>
          <Suspense fallback={<MapLoading />}>
            <LeafletMap
              center={defaultCenter}
              zoom={13}
              apiKey={data.key}
              buses={buses}
              stops={stops}
              marker={marker}
              selectedBusId={selectedBusId}
            />
          </Suspense>
        </ClientOnly>
      )}

      <span className="absolute left-3 top-2 z-[1000] rounded bg-background/70 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        Geoapify • interactive
      </span>
    </div>
  );
}
