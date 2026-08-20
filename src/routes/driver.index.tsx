import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { useFleet } from "@/hooks/use-fleet";
import { formatAgo, isLive } from "@/lib/transit";
import { LiveBadge } from "@/components/transit/LiveBadge";

export const Route = createFileRoute("/driver/")({
  head: () => ({
    meta: [
      { title: "Driver sign-on — BusLive" },
      {
        name: "description",
        content: "Drivers pick their bus and start sharing device location with passengers.",
      },
      { property: "og:title", content: "Driver sign-on — BusLive" },
      {
        property: "og:description",
        content: "Pick your bus and start broadcasting your live position.",
      },
    ],
  }),
  component: DriverHome,
});

function DriverHome() {
  const { data: fleet = [], isPending } = useFleet();
  const [busId, setBusId] = useState<string>("");
  const navigate = useNavigate();

  return (
    <AppShell
      title="Driver sign-on"
      subtitle="Select the bus you are driving, then start broadcasting."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel p-5">
          <label htmlFor="bus" className="text-xs uppercase tracking-wider text-muted-foreground">
            Your bus
          </label>
          <select
            id="bus"
            value={busId}
            onChange={(event) => setBusId(event.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select a bus…</option>
            {fleet.map((tracked) => (
              <option key={tracked.bus.id} value={tracked.bus.id}>
                {tracked.bus.bus_number} — {tracked.route?.name ?? "Unassigned"}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!busId}
            onClick={() => navigate({ to: "/driver/tracking", search: { busId } })}
            className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Start tracking
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            Your browser will ask for location permission. Keep this tab open while driving.
          </p>
        </div>

        <div className="panel p-5">
          <h2 className="font-display text-sm font-semibold">Fleet status</h2>
          {isPending ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {fleet.map((tracked) => (
                <li
                  key={tracked.bus.id}
                  className="flex items-center justify-between gap-3 border-b border-border pb-2 text-sm last:border-0"
                >
                  <span>{tracked.bus.bus_number}</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {formatAgo(tracked.location?.updated_at)}
                    <LiveBadge live={isLive(tracked.location)} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
