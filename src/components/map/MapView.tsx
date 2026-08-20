import { MapPin } from "lucide-react";

import { defaultCenter, isMapboxConfigured } from "@/lib/config";
import { isLive } from "@/lib/transit";
import type { LatLng, Stop, TrackedBus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BusMarker } from "./BusMarker";
import { RouteLine } from "./RouteLine";
import { boundsOf, project } from "./projection";

type MapViewProps = {
  buses?: TrackedBus[];
  stops?: Stop[];
  marker?: LatLng | null;
  selectedBusId?: string | null;
  onSelectBus?: (busId: string) => void;
  className?: string;
};

/**
 * Reusable map surface.
 *
 * Placeholder implementation: coordinates are projected onto a schematic grid
 * so the whole app works without any API key. Once a Mapbox public token is
 * configured, this single component is the only place that has to change.
 */
export function MapView({
  buses = [],
  stops = [],
  marker = null,
  selectedBusId = null,
  onSelectBus,
  className,
}: MapViewProps) {
  const points: LatLng[] = [
    ...stops,
    ...buses.flatMap((tracked) =>
      tracked.location ? [{ lat: tracked.location.latitude, lng: tracked.location.longitude }] : [],
    ),
    ...(marker ? [marker] : []),
  ];
  const bounds = boundsOf(points, defaultCenter);

  return (
    <div
      className={cn(
        "grid-canvas relative isolate w-full overflow-hidden rounded-xl border border-border",
        className,
      )}
    >
      <RouteLine stops={stops} bounds={bounds} />

      {buses.map((tracked) => {
        if (!tracked.location) return null;
        const position = project(
          { lat: tracked.location.latitude, lng: tracked.location.longitude },
          bounds,
        );
        return (
          <BusMarker
            key={tracked.bus.id}
            label={tracked.bus.bus_number}
            heading={tracked.location.heading}
            live={isLive(tracked.location)}
            selected={selectedBusId === tracked.bus.id}
            onClick={onSelectBus ? () => onSelectBus(tracked.bus.id) : undefined}
            x={position.x}
            y={position.y}
          />
        );
      })}

      {marker ? (
        <div
          className="absolute -translate-x-1/2 -translate-y-full text-primary"
          style={(() => {
            const p = project(marker, bounds);
            return { left: `${p.x}%`, top: `${p.y}%` };
          })()}
        >
          <MapPin className="h-6 w-6" />
        </div>
      ) : null}

      <span className="absolute bottom-2 left-3 text-[10px] uppercase tracking-widest text-muted-foreground">
        {isMapboxConfigured ? "Mapbox • live" : "Schematic map preview"}
      </span>
    </div>
  );
}
