export type CalendarEventType = "learn" | "project" | "report";
export type CalendarEventStatus = "scheduled" | "submitted" | "due-soon" | "overdue";

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  subtitle?: string;
  type: CalendarEventType;
  status: CalendarEventStatus;
  color?: string;
  allDay?: boolean;
  start?: string;
  end?: string;
  description?: string;
}

export type CalendarViewType = "month" | "week" | "day";

export interface CalendarFilters {
  colors: string[];
  startDate: string | null;
  endDate: string | null;
}
