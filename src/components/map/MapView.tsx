import { useState } from "react";

import { buildStaticMapUrl } from "@/lib/geoapify";
import type { LatLng, Stop, TrackedBus } from "@/lib/types";
import { cn } from "@/lib/utils";

type MapViewProps = {
  buses?: TrackedBus[];
  stops?: Stop[];
  marker?: LatLng | null;
  selectedBusId?: string | null;
  onSelectBus?: (busId: string) => void;
  className?: string;
};

/**
 * Reusable map surface backed by Geoapify.
 *
 * Renders a Geoapify static map image fetched through the server-side proxy
 * (/api/public/map-image), so the Geoapify API key never reaches the browser.
 * Bus positions, route stops and pins are baked into the image as markers;
 * the image refreshes whenever the live fleet data changes.
 */
export function MapView({
  buses = [],
  stops = [],
  marker = null,
  selectedBusId = null,
  className,
}: MapViewProps) {
  const [failed, setFailed] = useState(false);
  const src = buildStaticMapUrl({ buses, stops, marker, selectedBusId });

  return (
    <div
      className={cn(
        "relative isolate w-full overflow-hidden rounded-xl border border-border bg-muted",
        className,
      )}
    >
      {failed ? (
        <div className="flex h-full min-h-40 items-center justify-center text-sm text-muted-foreground">
          Map unavailable
        </div>
      ) : (
        <img
          key={src}
          src={src}
          alt="Live bus locations map"
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}

      <span className="absolute bottom-2 left-3 rounded bg-background/70 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        Geoapify • live
      </span>
    </div>
  );
}
