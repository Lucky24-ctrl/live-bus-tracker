import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { formatAgo, formatSpeed, isLive } from "@/lib/transit";
import type { TrackedBus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LiveBadge } from "./LiveBadge";

type BusCardProps = {
  tracked: TrackedBus;
  active?: boolean;
  onSelect?: (busId: string) => void;
};

export function BusCard({ tracked, active, onSelect }: BusCardProps) {
  const { bus, route, location } = tracked;

  return (
    <div
      className={cn(
        "panel flex items-center gap-3 p-3 transition-colors",
        active && "border-primary",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect?.(bus.id)}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-semibold">{bus.bus_number}</span>
          <LiveBadge live={isLive(location)} />
        </div>
        <p className="truncate text-xs text-muted-foreground">{route?.name ?? "Unassigned"}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatSpeed(location?.speed)} · {formatAgo(location?.updated_at)}
        </p>
      </button>
      <Link
        to="/passenger/bus/$id"
        params={{ id: bus.id }}
        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label={`Open details for ${bus.bus_number}`}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
