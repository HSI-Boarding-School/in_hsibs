import { motion } from "motion/react";
import { Iconify } from "../../../../../components/iconify/iconify";

type LoadingVariant = "calendar" | "list";

export function MonitoringLoadingState({
  variant,
  label,
}: {
  variant: LoadingVariant;
  label: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid gap-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/12 bg-primary-soft/22 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Iconify icon="svg-spinners:ring-resize" width={19} />
          </span>
          <div>
            <p className="text-xs font-extrabold text-primary-dark">Memuat {label}</p>
            <p className="mt-0.5 text-[0.65rem] font-semibold text-muted">Menyinkronkan data terbaru dari Supabase</p>
          </div>
        </div>
        <span className="hidden rounded-full bg-surface px-2.5 py-1 text-[0.6rem] font-black text-primary ring-1 ring-border/60 sm:inline-flex">
          LIVE DATA
        </span>
      </div>

      {variant === "calendar" ? <CalendarSkeleton /> : <ListSkeleton />}
      <span className="sr-only">Memuat {label}</span>
    </motion.div>
  );
}

function Skeleton({ className }: { className: string }) {
  return <span className={`block animate-pulse rounded-lg bg-surface-strong/85 ${className}`} />;
}

function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-[1fr_300px] gap-4 max-lg:grid-cols-1">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface/72 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="ml-2 h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-border/65">
          {Array.from({ length: 7 }, (_, index) => (
            <div key={`weekday-${index}`} className="bg-surface-strong/76 p-2">
              <Skeleton className="mx-auto h-2 w-7" />
            </div>
          ))}
          {Array.from({ length: 35 }, (_, index) => (
            <div key={`day-${index}`} className="min-h-20 bg-bg/40 p-2 max-sm:min-h-14">
              <Skeleton className="h-5 w-5 rounded-full" />
              {index % 4 === 0 && (
                <div className="mt-4 flex gap-1">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-2 w-2 rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border/70 bg-surface/72 p-5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="mt-2 h-3 w-24" />
        <div className="mt-6 grid gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="rounded-xl border border-border/55 p-3">
              <div className="flex gap-3">
                <Skeleton className="h-3 w-3 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="mt-2 h-2.5 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <>
      <div className="flex flex-wrap gap-2 rounded-xl border border-border/65 bg-surface/72 p-2">
        <Skeleton className="h-9 min-w-48 flex-1" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex gap-4 px-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="grid gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-xl border border-border/65 bg-surface/72 p-[18px]">
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="mt-4 h-4 w-2/5" />
                <Skeleton className="mt-2 h-3 w-3/5" />
                <div className="mt-4 flex gap-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-11 w-11 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
