import { cn } from "@/lib/utils";

export function LiveBadge({ live, className }: { live: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        live
          ? "border-live/40 bg-live/15 text-live"
          : "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-live" : "bg-stale")} />
      {live ? "Live" : "Offline"}
    </span>
  );
}
