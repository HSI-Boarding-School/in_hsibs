import { useState, useCallback } from "react";
import { Calendar } from "../../../../../components/calendar/Calendar";
import { CalendarForm } from "../../../../../components/calendar/CalendarForm";
import { calendarEvents as initialEvents } from "../../../../../data/monitoring/calendarData";
import type { CalendarEvent } from "../../../../../components/calendar/types";

let nextId = 100;

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
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
