import { useState, useCallback } from "react";
import { Calendar } from "../../../../../components/calendar/Calendar";
import { CalendarForm } from "../../../../../components/calendar/CalendarForm";
import { calendarEvents as initialEvents } from "../../../../../data/monitoring/calendarData";
import type { CalendarEvent } from "../../../../../components/calendar/types";
import { useMonitoringCalendarEvents } from "../../../../../models/monitoring";

let nextId = 100;

export function CalendarView() {
  const { events, setEvents, isLoading, error } = useMonitoringCalendarEvents(initialEvents);
  const [formOpen, setFormOpen] = useState(false);
  const [formDate, setFormDate] = useState<string | undefined>(undefined);

  const handleAddEvent = useCallback((dateStr?: string) => {
    setFormDate(dateStr);
    setFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (data: Omit<CalendarEvent, "id">) => {
      const newEvent: CalendarEvent = {
        ...data,
        id: `cal-custom-${nextId++}`,
      };
      setEvents((prev) => [...prev, newEvent]);
    },
    [],
  );

  return (
    <>
      {(isLoading || error) && (
        <div className={`mb-3 rounded-2xl border px-4 py-3 text-xs font-bold ${error ? "border-orange/20 bg-orange/8 text-orange" : "border-primary/15 bg-primary-soft/35 text-primary"}`}>
          {error ?? "Memuat event kalender dari Supabase..."}
        </div>
      )}
      <Calendar
        events={events}
        onAddEvent={handleAddEvent}
        typeLabels={{ learn: "Learn", project: "Project", report: "Report" }}
      />
      <CalendarForm
        open={formOpen}
        defaultDate={formDate}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
