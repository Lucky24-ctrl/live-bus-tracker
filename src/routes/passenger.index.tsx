import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { BusCard } from "@/components/transit/BusCard";
import { useFleet } from "@/hooks/use-fleet";
import { isLive } from "@/lib/transit";

export const Route = createFileRoute("/passenger/")({
  head: () => ({
    meta: [
      { title: "Live bus map — BusLive" },
      {
        name: "description",
        content: "Watch every tracked city bus move on the live map and pick one to follow.",
      },
      { property: "og:title", content: "Live bus map — BusLive" },
      {
        property: "og:description",
        content: "Watch every tracked city bus move on the live map and pick one to follow.",
      },
    ],
  }),
  component: PassengerMap,
});

function PassengerMap() {
  const { data: fleet = [], isPending, error } = useFleet();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [routeFilter, setRouteFilter] = useState<string>("all");

  const routes = useMemo(() => {
    const map = new Map<string, string>();
    for (const tracked of fleet) {
      if (tracked.route) map.set(tracked.route.id, tracked.route.name);
    }
    return [...map.entries()];
  }, [fleet]);

  const visible = useMemo(
    () => (routeFilter === "all" ? fleet : fleet.filter((t) => t.route?.id === routeFilter)),
    [fleet, routeFilter],
  );

  const liveCount = visible.filter((t) => isLive(t.location)).length;

  return (
    <AppShell
      title="Live map"
      subtitle={`${liveCount} of ${visible.length} buses currently reporting`}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <InteractiveMap className="h-[22rem] sm:h-[32rem]" />

        <div className="flex flex-col gap-3">
          <select
            value={routeFilter}
            onChange={(event) => setRouteFilter(event.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            aria-label="Filter by route"
          >
            <option value="all">All routes</option>
            {routes.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          {error ? (
            <p className="text-sm text-destructive">Could not load the fleet.</p>
          ) : isPending ? (
            <p className="text-sm text-muted-foreground">Loading buses…</p>
          ) : (
            <div className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1">
              {visible.map((tracked) => (
                <BusCard
                  key={tracked.bus.id}
                  tracked={tracked}
                  active={tracked.bus.id === selectedId}
                  onSelect={setSelectedId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
