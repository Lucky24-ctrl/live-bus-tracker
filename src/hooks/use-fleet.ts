import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { fetchFleet, fetchRoutes } from "@/lib/transit";

/** Fleet (buses + routes + latest positions) with live updates over Realtime. */
export function useFleet() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["fleet"], queryFn: fetchFleet });

  useEffect(() => {
    const channel = supabase
      .channel("live-locations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_locations" },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["fleet"] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useRoutes() {
  return useQuery({ queryKey: ["routes"], queryFn: fetchRoutes });
}
