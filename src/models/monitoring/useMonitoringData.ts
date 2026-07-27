import { useCallback, useEffect, useState } from "react";
import type { CalendarEvent } from "../../components/calendar/types";
import type { LearnSession } from "../../data/monitoring/learnData";
import type { Project } from "../../data/monitoring/projectData";
import { getMonitoringCalendarEvents, getMonitoringLearnSessions, getMonitoringProjects, getMonitoringReportProgress, getMonitoringRiskReports, getMonitoringMukafaahRecords } from "./monitoring.repository";
import type { MonitoringMukafaahRecord, MonitoringReportProgress, MonitoringRiskReport } from "./monitoring.model";

export function useMonitoringCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getMonitoringCalendarEvents()
      .then((data) => {
        if (!ignore) setEvents(data);
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

export function useMonitoringLearnSessions() {
  const [sessions, setSessions] = useState<LearnSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      setSessions(await getMonitoringLearnSessions());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat learn session.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh().catch(() => undefined);
  }, [refresh]);

  return { sessions, setSessions, isLoading, error, refresh };
}

export function useMonitoringProjects(creatorId?: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      setProjects(await getMonitoringProjects(creatorId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data project.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    void refresh().catch(() => undefined);
  }, [refresh]);

  return { projects, setProjects, isLoading, error, refresh };
}

export function useMonitoringReportProgress() {
  const [reports, setReports] = useState<MonitoringReportProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getMonitoringReportProgress()
      .then((data) => {
        if (!ignore) setReports(data);
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof Error ? err.message : "Gagal memuat progres laporan.");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return { reports, isLoading, error };
}

export function useMonitoringRiskReports() {
  const [reports, setReports] = useState<MonitoringRiskReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getMonitoringRiskReports()
      .then((data) => {
        if (!ignore) setReports(data);
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof Error ? err.message : "Gagal memuat laporan At Risk.");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return { reports, isLoading, error };
}

export function useMonitoringMukafaah() {
  const [records, setRecords] = useState<MonitoringMukafaahRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getMonitoringMukafaahRecords()
      .then((data) => { if (!ignore) setRecords(data); })
      .catch((err) => { if (!ignore) setError(err instanceof Error ? err.message : "Gagal memuat kesiapan Mukafaah."); })
      .finally(() => { if (!ignore) setIsLoading(false); });
    return () => { ignore = true; };
  }, []);

  return { records, isLoading, error };
}
