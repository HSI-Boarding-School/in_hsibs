export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  subtitle?: string;
  type: "learn" | "project" | "report";
  status: "scheduled" | "submitted" | "due-soon" | "overdue";
}

type MonthEntry = { y: number; m: number };

const months: MonthEntry[] = [
  { y: 2025, m: 7 }, { y: 2025, m: 8 }, { y: 2025, m: 9 },
  { y: 2025, m: 10 }, { y: 2025, m: 11 }, { y: 2025, m: 12 },
  { y: 2026, m: 1 }, { y: 2026, m: 2 }, { y: 2026, m: 3 },
  { y: 2026, m: 4 }, { y: 2026, m: 5 }, { y: 2026, m: 6 },
];

const learnTitles: string[] = [
  "Who Am I Before I Work?",
  "Sprint Your Life",
  "Say It Right",
  "Navigate the Internet",
  "Design Thinking for Real Life",
  "Halal Wealth",
  "Work From Anywhere",
  "Go Global, Stay Muslim",
  "You Are Your Portfolio",
  "Lead Without Title",
  "Start Before You're Ready",
  "What Will You Leave?",
];

function generateEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  months.forEach((mo, i) => {
    const dateStr = `${mo.y}-${String(mo.m).padStart(2, "0")}-15`;
    events.push({
      id: `cal-learn-${i + 1}`,
      date: dateStr,
      title: learnTitles[i],
      subtitle: `Learn Sesi ${i + 1}`,
      type: "learn",
      status: "scheduled",
    });
  });

  events.push(
    {
      id: "cal-proj-p003-demo",
      date: "2025-12-01",
      title: "Demo IN_HSIBS Web App",
      subtitle: "Project P003 milestone",
      type: "project",
      status: "scheduled",
    },
    {
      id: "cal-proj-p001-showcase",
      date: "2025-11-30",
      title: "Design Challenge Deadline",
      subtitle: "Project P001 submission",
      type: "project",
      status: "overdue",
    },
    {
      id: "cal-report-weekly",
      date: "2025-12-20",
      title: "Weekly Report Submission",
      subtitle: "Minggu W25",
      type: "report",
      status: "submitted",
    },
    {
      id: "cal-report-monthly",
      date: "2025-12-28",
      title: "Monthly Evaluation Due",
      subtitle: "Evaluasi Des 2025",
      type: "report",
      status: "due-soon",
    },
    {
      id: "cal-report-daily-1",
      date: "2025-12-18",
      title: "Daily Log - S10",
      subtitle: "Tough mood + blocker",
      type: "report",
      status: "overdue",
    },
  );

  return events;
}

export const calendarEvents = generateEvents();
