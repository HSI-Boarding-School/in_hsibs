import { useState, useCallback } from "react";
import { Calendar } from "../../../../../components/calendar/Calendar";
import { CalendarForm } from "../../../../../components/calendar/CalendarForm";
import type { CalendarEvent } from "../../../../../components/calendar/types";
import {
  createMonitoringCalendarEvent,
  deleteMonitoringCalendarEvent,
  updateMonitoringCalendarEvent,
  useMonitoringCalendarEvents,
} from "../../../../../models/monitoring";
import { MonitoringLoadingState } from "./MonitoringLoadingState";
import { useToast } from "../../../../../components/ui/ToastProvider";
import { getErrorMessage } from "../../../../../lib/errors";

export function CalendarView() {
  const { events, setEvents, isLoading, error } = useMonitoringCalendarEvents();
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [formDate, setFormDate] = useState<string | undefined>(undefined);
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);

  const handleAddEvent = useCallback((dateStr?: string) => {
    setActiveEvent(null);
    setFormDate(dateStr);
    setFormOpen(true);
  }, []);

  const handleOpenEvent = useCallback((event: CalendarEvent) => {
    setActiveEvent(event);
    setFormDate(event.date);
    setFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: Omit<CalendarEvent, "id">) => {
      try {
        if (activeEvent) {
          const updated = await updateMonitoringCalendarEvent(activeEvent.id, data);
          setEvents((current) => current.map((event) => event.id === activeEvent.id ? updated : event));
          toast.success("Event diperbarui", updated.title);
        } else {
          const created = await createMonitoringCalendarEvent(data);
          setEvents((current) => [...current, created]);
          toast.success("Event ditambahkan", created.title);
        }
      } catch (error) {
        toast.error(
          activeEvent ? "Event gagal diperbarui" : "Event gagal ditambahkan",
          getErrorMessage(error, "Gagal menyimpan event."),
        );
        throw error;
      }
    },
    [activeEvent, setEvents, toast],
  );

  const handleDeleteEvent = useCallback(async () => {
    if (!activeEvent) return;
    try {
      await deleteMonitoringCalendarEvent(activeEvent.id);
      setEvents((current) => current.filter((event) => event.id !== activeEvent.id));
      toast.success("Event dihapus", activeEvent.title);
    } catch (error) {
      toast.error("Event gagal dihapus", getErrorMessage(error, "Gagal menghapus event."));
      throw error;
    }
  }, [activeEvent, setEvents, toast]);

  if (isLoading) {
    return <MonitoringLoadingState variant="calendar" label="event kalender" />;
  }

  return (
    <>
      {error && (
        <div className="mb-3 rounded-2xl border border-orange/20 bg-orange/8 px-4 py-3 text-xs font-bold text-orange">
          {error}
        </div>
      )}
      <Calendar
        events={events}
        onAddEvent={handleAddEvent}
        onEventClick={handleOpenEvent}
        typeLabels={{ learn: "Learn", project: "Project", report: "Report" }}
      />
      <CalendarForm
        open={formOpen}
        event={activeEvent}
        defaultDate={formDate}
        onClose={() => { setFormOpen(false); setActiveEvent(null); }}
        onSubmit={handleFormSubmit}
        onDelete={activeEvent ? handleDeleteEvent : undefined}
      />
    </>
  );
}
