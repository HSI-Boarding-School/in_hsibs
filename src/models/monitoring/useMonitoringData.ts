import { useEffect, useState } from "react";
import type { CalendarEvent } from "../../components/calendar/types";
import type { LearnSession } from "../../data/monitoring/learnData";
import { getMonitoringCalendarEvents, getMonitoringLearnSessions } from "./monitoring.repository";

export function useMonitoringCalendarEvents(fallback: CalendarEvent[]) {
  const [events, setEvents] = useState<CalendarEvent[]>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getMonitoringCalendarEvents()
      .then((data) => {
        if (!ignore && data.length) setEvents(data);
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof Error ? err.message : "Gagal memuat calendar event.");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return { events, setEvents, isLoading, error };
}

export function useMonitoringLearnSessions(fallback: LearnSession[]) {
  const [sessions, setSessions] = useState<LearnSession[]>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getMonitoringLearnSessions()
      .then((data) => {
        if (!ignore && data.length) setSessions(data);
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof Error ? err.message : "Gagal memuat learn session.");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return { sessions, setSessions, isLoading, error };
}
