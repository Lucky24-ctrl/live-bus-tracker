import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { MapView } from "@/components/map/MapView";
import { RouteCard } from "@/components/transit/RouteCard";
import { LiveBadge } from "@/components/transit/LiveBadge";
import { useFleet } from "@/hooks/use-fleet";
import { formatAgo, formatSpeed, isLive } from "@/lib/transit";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Fleet admin — BusLive" },
      {
        name: "description",
        content: "Operator overview of routes, buses and the freshness of every live signal.",
      },
      { property: "og:title", content: "Fleet admin — BusLive" },
      {
        property: "og:description",
        content: "Operator overview of routes, buses and live signal health.",
      },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { data: fleet = [], isPending } = useFleet();
  const [routeId, setRouteId] = useState<string | null>(null);

  const routes = [...new Map(fleet.flatMap((t) => (t.route ? [[t.route.id, t.route]] : []))).values()];
  const selectedRoute = routes.find((route) => route.id === routeId) ?? null;
  const liveCount = fleet.filter((t) => isLive(t.location)).length;

  return (
    <AppShell title="Fleet admin" subtitle="Routes, buses and signal health at a glance.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Routes" value={String(routes.length)} />
        <Stat label="Buses" value={String(fleet.length)} />
        <Stat label="Reporting now" value={`${liveCount}/${fleet.length}`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[20rem_1fr]">
        <div className="flex flex-col gap-3">
          {routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              busCount={fleet.filter((t) => t.route?.id === route.id).length}
              active={route.id === routeId}
              onSelect={(id) => setRouteId(id === routeId ? null : id)}
            />
          ))}
          {!isPending && routes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No routes configured yet.</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <MapView
            buses={
              selectedRoute ? fleet.filter((t) => t.route?.id === selectedRoute.id) : fleet
            }
            stops={selectedRoute?.stops ?? []}
            className="h-64 sm:h-80"
          />

          <div className="panel overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3">Bus</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Speed</th>
                  <th className="px-4 py-3">Last ping</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {fleet.map((tracked) => (
                  <tr key={tracked.bus.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{tracked.bus.bus_number}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {tracked.route?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">{formatSpeed(tracked.location?.speed)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatAgo(tracked.location?.updated_at)}
                    </td>
                    <td className="px-4 py-3">
                      <LiveBadge live={isLive(tracked.location)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}
