import { Route as RouteIcon } from "lucide-react";

import type { BusRoute } from "@/lib/types";
import { cn } from "@/lib/utils";

type RouteCardProps = {
  route: BusRoute;
  busCount?: number;
  active?: boolean;
  onSelect?: (routeId: string) => void;
};

export function RouteCard({ route, busCount, active, onSelect }: RouteCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(route.id)}
      className={cn(
        "panel w-full p-4 text-left transition-colors hover:border-accent/60",
        active && "border-accent",
      )}
    >
      <div className="flex items-center gap-2">
        <RouteIcon className="h-4 w-4 text-accent" />
        <span className="font-display text-sm font-semibold">{route.name}</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {route.stops.length} stops
        {busCount != null ? ` · ${busCount} bus${busCount === 1 ? "" : "es"}` : ""}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {route.stops.slice(0, 4).map((stop) => (
          <span
            key={stop.name}
            className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
          >
            {stop.name}
          </span>
        ))}
      </div>
    </button>
  );
}
