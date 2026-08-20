import { Bus as BusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type BusMarkerProps = {
  label: string;
  heading?: number | null;
  live?: boolean;
  selected?: boolean;
  onClick?: () => void;
  /** Position in percent of the map container. */
  x: number;
  y: number;
};

/** Reusable bus marker — map-library agnostic, positioned by percentage. */
export function BusMarker({ label, heading, live, selected, onClick, x, y }: BusMarkerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ left: `${x}%`, top: `${y}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
      aria-label={`Bus ${label}`}
    >
      <span className="flex flex-col items-center gap-1">
        <span
          className={cn(
            "relative flex h-9 w-9 items-center justify-center rounded-full border transition-transform",
            live
              ? "border-live bg-live text-live-foreground pulse-dot"
              : "border-border bg-muted text-muted-foreground",
            selected && "scale-115 ring-2 ring-primary ring-offset-2 ring-offset-background",
          )}
        >
          <BusIcon
            className="h-4 w-4"
            style={heading != null ? { transform: `rotate(${heading}deg)` } : undefined}
          />
        </span>
        <span className="rounded-md border border-border bg-card/90 px-1.5 py-0.5 text-[10px] font-medium tracking-wide">
          {label}
        </span>
      </span>
    </button>
  );
}
