import type { Stop } from "@/lib/types";
import { project, type Bounds } from "./projection";

type RouteLineProps = {
  stops: Stop[];
  bounds: Bounds;
  showLabels?: boolean;
};

/** Reusable route rendering: polyline through the stops plus stop dots. */
export function RouteLine({ stops, bounds, showLabels = true }: RouteLineProps) {
  if (stops.length === 0) return null;
  const points = stops.map((stop) => project(stop, bounds));

  return (
    <>
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {points.map((point, index) => (
        <div
          key={`${stops[index]!.name}-${index}`}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${point.x}%`, top: `${point.y}%` }}
        >
          <span className="block h-2.5 w-2.5 rounded-full border-2 border-accent bg-background" />
          {showLabels ? (
            <span className="mt-1 hidden whitespace-nowrap text-[10px] text-muted-foreground sm:block">
              {stops[index]!.name}
            </span>
          ) : null}
        </div>
      ))}
    </>
  );
}
