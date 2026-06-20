import { useMemo } from "react";
import type { CalendarEvent } from "../types";

export function useEvent(
  events: CalendarEvent[],
  selectEventId: string | null,
  selectedRange: { start: string; end: string } | null,
  openForm: boolean
): CalendarEvent | undefined {
  const currentEvent = events.find((ev) => ev.id === selectEventId);

  const defaultValues = useMemo<CalendarEvent>(
    () => ({
      id: "",
      title: "",
      description: "",
      color: "#1565C0",
      allDay: false,
      date: "",
      type: "learn",
      status: "scheduled",
      start: selectedRange ? selectedRange.start : new Date().toISOString(),
      end: selectedRange ? selectedRange.end : new Date().toISOString(),
    }),
    [selectedRange]
  );

  if (!openForm) return undefined;

  if (currentEvent || selectedRange) {
    return { ...defaultValues, ...currentEvent };
  }

  return defaultValues;
}
