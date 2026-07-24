import { useEffect } from "react";
import { supabase } from "../client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

/**
 * Subscribe ke perubahan real-time pada sebuah tabel.
 * Otomatis unsubscribe saat komponen unmount.
 *
 * @example
 * useRealtime("admin_task", "*", () => refetch());
 */
export function useRealtime(
  table: string,
  event: RealtimeEvent,
  callback: (
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
  ) => void,
  filter?: string,
) {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}:${event}:${filter ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event: event as "*",
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        callback,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, event, filter]);
}
