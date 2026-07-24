import { useEffect } from "react";
import { supabase } from "../client";

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

/**
 * Subscribe ke perubahan real-time pada sebuah tabel.
 * Otomatis unsubscribe saat komponen unmount.
 *
 * @example
 * useRealtime("admin_task", "*", () => refetch());
 * useRealtime("laporan_mingguan", "INSERT", (payload) => console.log(payload));
 */
export function useRealtime(
  table: string,
  event: RealtimeEvent,
  callback: (payload: unknown) => void,
  filter?: string, // contoh: "status=eq.Terkirim"
) {
  useEffect(() => {
    let channel = supabase.channel(`realtime:${table}:${event}`).on(
      "postgres_changes" as Parameters<typeof channel.on>[0],
      {
        event,
        schema: "public",
        table,
        ...(filter ? { filter } : {}),
      },
      callback,
    );

    channel = channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, event, filter]);
}
