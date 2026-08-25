import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { LatLng } from "@/lib/types";

const ATTRIBUTION =
  'Powered by <a href="https://www.geoapify.com/" target="_blank" rel="noreferrer">Geoapify</a> | © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

type LeafletMapProps = {
  center: LatLng;
  zoom?: number;
  apiKey: string;
  className?: string;
};

/**
 * Interactive Leaflet map rendered with real Geoapify raster tiles.
 *
 * Browser-only module: it imports Leaflet (and its CSS), so it must only
 * ever be loaded through React.lazy behind <ClientOnly> — never statically
 * imported from an SSR-reachable module.
 *
 * Supports zoom in/out, mouse + touch drag and panning out of the box,
 * and stays responsive via a ResizeObserver that keeps the map size in
 * sync with its container.
 */
export default function LeafletMap({ center, zoom = 13, apiKey, className }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: true,
    });

    const tiles = L.tileLayer(
      `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`,
      { maxZoom: 20, attribution: ATTRIBUTION },
    );
    tiles.on("tileerror", () => setTileError(true));
    tiles.addTo(map);

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(el);

    return () => {
      observer.disconnect();
      map.remove();
    };
    // The map is created once on mount; center/zoom/apiKey are stable props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className={className ?? "h-full w-full"} />
      {tileError ? (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center gap-1 bg-background/90 p-4 text-center">
          <p className="text-sm font-medium text-destructive">Map tiles failed to load</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            The Geoapify API key appears to be missing or invalid. Check the GEOAPIFY_API_KEY
            secret and try again.
          </p>
        </div>
      ) : null}
    </div>
  );
}
