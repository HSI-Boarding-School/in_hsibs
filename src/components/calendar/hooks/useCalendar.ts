import { useState, useCallback, useMemo } from "react";
import type { CalendarViewType } from "../types";

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function useCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState<CalendarViewType>("month");
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [filtersOpen, setFiltersOpen] = useState(false);

  const selectedDate = useMemo(() => {
    if (selectedDay === null) return null;
    return new Date(year, month, selectedDay);
  }, [year, month, selectedDay]);

  const weekStart = useMemo(() => {
    return selectedDate ? getWeekStart(selectedDate) : getWeekStart(today);
  }, [selectedDate]);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);

  const goPrev = useCallback(() => {
    if (view === "month") {
      if (month === 0) {
        setYear((y) => y - 1);
        setMonth(11);
      } else {
        setMonth((m) => m - 1);
      }
    } else if (view === "week") {
      const prev = new Date(weekStart);
      prev.setDate(prev.getDate() - 7);
      setYear(prev.getFullYear());
      setMonth(prev.getMonth());
      setSelectedDay(prev.getDate());
    } else {
      if (selectedDay !== null) {
        const prev = new Date(year, month, selectedDay);
        prev.setDate(prev.getDate() - 1);
        setYear(prev.getFullYear());
        setMonth(prev.getMonth());
        setSelectedDay(prev.getDate());
      }
    }
  }, [month, view, weekStart, selectedDay, year]);

  const goNext = useCallback(() => {
    if (view === "month") {
      if (month === 11) {
        setYear((y) => y + 1);
        setMonth(0);
      } else {
        setMonth((m) => m + 1);
      }
    } else if (view === "week") {
      const next = new Date(weekStart);
      next.setDate(next.getDate() + 7);
      setYear(next.getFullYear());
      setMonth(next.getMonth());
      setSelectedDay(next.getDate());
    } else {
      if (selectedDay !== null) {
        const next = new Date(year, month, selectedDay);
        next.setDate(next.getDate() + 1);
        setYear(next.getFullYear());
        setMonth(next.getMonth());
        setSelectedDay(next.getDate());
      }
    }
  }, [month, view, weekStart, selectedDay, year]);

  const goToday = useCallback(() => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDay(now.getDate());
  }, []);

  const selectDay = useCallback((day: number | null) => {
    setSelectedDay(day);
  }, []);

  const changeView = useCallback((newView: CalendarViewType) => {
    setView(newView);
  }, []);

  const toggleFilters = useCallback(() => {
    setFiltersOpen((prev) => !prev);
  }, []);

  const selectedDateStr =
    selectedDay !== null
      ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
      : null;

  return {
    year,
    setYear,
    month,
    setMonth,
    view,
    selectedDay,
    filtersOpen,
    selectedDateStr,
    selectedDate,
    weekStart,
    weekDays,
    goPrev,
    goNext,
    goToday,
    selectDay,
    changeView,
    toggleFilters,
    setFiltersOpen,
  };
}
