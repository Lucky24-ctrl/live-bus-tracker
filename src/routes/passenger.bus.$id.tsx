import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { MapView } from "@/components/map/MapView";
import { LiveBadge } from "@/components/transit/LiveBadge";
import { useFleet } from "@/hooks/use-fleet";
import { formatAgo, formatSpeed, isLive } from "@/lib/transit";

export const Route = createFileRoute("/passenger/bus/$id")({
  head: () => ({
    meta: [
      { title: "Bus details — BusLive" },
      {
        name: "description",
        content: "Follow a single bus: live position, speed, heading and the stops on its route.",
      },
      { property: "og:title", content: "Bus details — BusLive" },
      {
        property: "og:description",
        content: "Follow a single bus: live position, speed, heading and its route stops.",
      },
    ],
  }),
  component: BusDetail,
});

function BusDetail() {
  const { id } = Route.useParams();
  const { data: fleet = [], isPending } = useFleet();
  const tracked = fleet.find((item) => item.bus.id === id) ?? null;

  if (isPending) {
    return (
      <AppShell title="Loading bus…">
        <p className="text-sm text-muted-foreground">Fetching the latest position.</p>
      </AppShell>
    );
  }

  if (!tracked) {
    return (
      <AppShell title="Bus not found" subtitle="This bus is not part of the tracked fleet.">
        <Link to="/passenger" className="text-sm text-accent underline">
          Back to the live map
        </Link>
      </AppShell>
    );
  }

  const { bus, route, location } = tracked;
  const stats = [
    { label: "Speed", value: formatSpeed(location?.speed) },
    { label: "Heading", value: location?.heading != null ? `${Math.round(location.heading)}°` : "—" },
    {
      label: "Accuracy",
      value: location?.accuracy != null ? `±${Math.round(location.accuracy)} m` : "—",
    },
    { label: "Last ping", value: formatAgo(location?.updated_at) },
  ];

  return (
    <AppShell title={bus.bus_number} subtitle={route?.name ?? "Unassigned route"}>
      <div className="mb-4">
        <LiveBadge live={isLive(location)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <MapView
          buses={[tracked]}
          stops={route?.stops ?? []}
          selectedBusId={bus.id}
          className="h-[20rem] sm:h-[28rem]"
        />

        <div className="flex flex-col gap-4">
          <div className="panel grid grid-cols-2 gap-4 p-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="font-display text-lg font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="panel p-4">
            <h2 className="font-display text-sm font-semibold">Stops</h2>
            <ol className="mt-3 space-y-2">
              {(route?.stops ?? []).map((stop, index) => (
                <li key={stop.name} className="flex items-center gap-3 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-accent/50 text-[11px] text-accent">
                    {index + 1}
                  </span>
                  {stop.name}
                </li>
              ))}
              {(route?.stops.length ?? 0) === 0 ? (
                <li className="text-sm text-muted-foreground">No stops configured.</li>
              ) : null}
            </ol>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
