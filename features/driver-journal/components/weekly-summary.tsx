'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import type { Shift } from '@/features/driver-journal/types/ driver-journal';

import { getEndOfWeek, getStartOfWeek } from '../utils/dates';
import { formatDuration } from '../utils/duration';
import {
  buildExtendedDrivingUsage,
  buildExtendedShiftUsage,
  normalizeDrivingMinutes,
} from '../utils/compliance-usage';

const DAILY_DRIVING_LIMIT_MINUTES = 9 * 60;
const EXTENDED_DAILY_DRIVING_LIMIT_MINUTES = 10 * 60;
const REGULAR_SHIFT_SPREAD_MINUTES = 13 * 60;
const MAX_SHIFT_SPREAD_MINUTES = 15 * 60;
const MAX_EXTENDED_DRIVING_DAYS = 2;
const MAX_EXTENDED_SHIFTS = 3;

type WeeklySummaryData = {
  driving: number;
  working: number;
  earn: number;
  twoWeekDriving: number;
  average17WeekWorking: number;
  annualEarned: number;
};

type WeeklySummaryProps = {
  summary: WeeklySummaryData;
  weekStart: Date;
  allShifts: Shift[];
};

type SummaryRowProps = {
  label: string;
  value: string;
  prominent?: boolean;
};

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDateRange(start: Date, end: Date) {
  return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}

function SummaryRow({ label, value, prominent = false }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className={prominent ? 'font-medium' : 'text-muted-foreground'}>
        {label}
      </span>

      <span
        className={
          prominent
            ? 'shrink-0 font-semibold tabular-nums'
            : 'shrink-0 font-medium tabular-nums'
        }
      >
        {value}
      </span>
    </div>
  );
}

function PeriodLabel({ children }: { children: ReactNode }) {
  return <p className="mt-0.5 text-xs text-muted-foreground">{children}</p>;
}

function getShiftStartDateTime(shift: Shift) {
  if (!shift.date || !shift.start) {
    return null;
  }

  const date = new Date(`${shift.date}T${shift.start}`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getShiftEndDateTime(shift: Shift) {
  if (!shift.end) {
    return null;
  }

  const endDate = shift.endDate || shift.date;

  if (!endDate) {
    return null;
  }

  const date = new Date(`${endDate}T${shift.end}`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getShiftElapsedMinutes(shift: Shift, now: Date) {
  const start = getShiftStartDateTime(shift);

  if (!start) {
    return 0;
  }

  const end = getShiftEndDateTime(shift) ?? now;

  const minutes = Math.floor((end.getTime() - start.getTime()) / 60000);

  return Math.max(0, minutes);
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getLatestShift(shifts: Shift[]) {
  return [...shifts]
    .sort((a, b) => {
      const dateA = getShiftStartDateTime(a)?.getTime() ?? 0;
      const dateB = getShiftStartDateTime(b)?.getTime() ?? 0;

      return dateB - dateA;
    })
    .at(0);
}

export function WeeklySummary({
  summary,
  weekStart,
  allShifts,
}: WeeklySummaryProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const currentWeekStart = getStartOfWeek(weekStart);
  const currentWeekEnd = getEndOfWeek(weekStart);

  const actualCurrentWeekStart = getStartOfWeek(now);

  const isCurrentWeek =
    currentWeekStart.getTime() === actualCurrentWeekStart.getTime();

  const twoWeekStart = new Date(currentWeekStart);
  twoWeekStart.setDate(twoWeekStart.getDate() - 7);

  const seventeenWeekStart = new Date(currentWeekStart);
  seventeenWeekStart.setDate(seventeenWeekStart.getDate() - 16 * 7);

  const yearStart = new Date(currentWeekEnd.getFullYear(), 0, 1);

  const todayKey = getDateKey(now);

  const todayShifts = isCurrentWeek
    ? allShifts.filter((shift) => shift.date === todayKey)
    : [];

  const activeTodayShift =
    todayShifts.find((shift) => !shift.end) ?? getLatestShift(todayShifts);

  const todayDrivingMinutes = todayShifts.reduce(
    (total, shift) => total + normalizeDrivingMinutes(shift.driving),
    0,
  );

  const extendedDrivingUsage = buildExtendedDrivingUsage(allShifts);

  const todayExtendedDrivingDaysUsed = todayShifts.reduce(
    (maximumUsed, shift) =>
      Math.max(maximumUsed, extendedDrivingUsage.get(shift.id) ?? 0),
    0,
  );

  const drivingMaximum =
    todayExtendedDrivingDaysUsed < MAX_EXTENDED_DRIVING_DAYS
      ? EXTENDED_DAILY_DRIVING_LIMIT_MINUTES
      : DAILY_DRIVING_LIMIT_MINUTES;

  const extendedShiftUsage = buildExtendedShiftUsage(allShifts);

  const latestTodayShift = getLatestShift(todayShifts);

  const extendedShiftsUsed = latestTodayShift
    ? (extendedShiftUsage.get(latestTodayShift.id) ?? 0)
    : 0;

  const shiftMaximum =
    extendedShiftsUsed < MAX_EXTENDED_SHIFTS
      ? MAX_SHIFT_SPREAD_MINUTES
      : REGULAR_SHIFT_SPREAD_MINUTES;

  const todayShiftMinutes = activeTodayShift
    ? getShiftElapsedMinutes(activeTodayShift, now)
    : 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="min-h-9">
          Weekly Summary
        </Button>
      </DialogTrigger>

      <DialogContent
        className="
          flex
          h-[100dvh]
          max-h-[100dvh]
          w-screen
          max-w-none
          flex-col
          gap-0
          overflow-hidden
          rounded-none
          p-0
          sm:h-auto
          sm:max-h-[90vh]
          sm:w-full
          sm:max-w-sm
          sm:rounded-lg
        "
      >
        <DialogHeader className="shrink-0 border-b px-5 py-4 text-left sm:px-6 sm:py-5">
          <DialogTitle className="text-base sm:text-lg">
            Weekly Summary
          </DialogTitle>

          <DialogDescription className="text-xs leading-relaxed sm:text-sm">
            {formatDateRange(currentWeekStart, currentWeekEnd)}
            <span className="block">Monday – Sunday</span>
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
          <div className="space-y-5">
            {isCurrentWeek && todayShifts.length > 0 ? (
              <section>
                <h3 className="mb-2 text-sm font-semibold">
                  Today&apos;s limits
                </h3>

                <div className="divide-y rounded-lg border px-3">
                  <SummaryRow
                    label="Driving"
                    value={`${formatDuration(
                      todayDrivingMinutes,
                    )} / ${formatDuration(drivingMaximum)}`}
                    prominent
                  />

                  <div className="flex items-center justify-between gap-4 py-2">
                    <span className="text-xs text-muted-foreground">
                      Extended days
                    </span>

                    <span className="shrink-0 text-xs font-medium tabular-nums">
                      {todayExtendedDrivingDaysUsed}/{MAX_EXTENDED_DRIVING_DAYS}{' '}
                      used
                    </span>
                  </div>

                  <SummaryRow
                    label="Shift"
                    value={`${formatDuration(
                      todayShiftMinutes,
                    )} / ${formatDuration(shiftMaximum)}`}
                    prominent
                  />

                  <div className="flex items-center justify-between gap-4 py-2">
                    <span className="text-xs text-muted-foreground">
                      Extended shifts
                    </span>

                    <span className="shrink-0 text-xs font-medium tabular-nums">
                      {extendedShiftsUsed}/{MAX_EXTENDED_SHIFTS} used
                    </span>
                  </div>
                </div>
              </section>
            ) : null}

            <section>
              <h3 className="mb-2 text-sm font-semibold">This week</h3>

              <div className="divide-y rounded-lg border px-3">
                <SummaryRow
                  label="Driving"
                  value={formatDuration(summary.driving)}
                  prominent
                />

                <SummaryRow
                  label="Working time"
                  value={formatDuration(summary.working)}
                  prominent
                />

                <SummaryRow
                  label="Earned"
                  value={`£${summary.earn.toFixed(2)}`}
                  prominent
                />
              </div>
            </section>

            <section className="border-t pt-4">
              <h3 className="mb-1 text-sm font-semibold">Driving limits</h3>

              <SummaryRow
                label="Weekly driving"
                value={`${formatDuration(summary.driving)} / 56h`}
                prominent
              />

              <SummaryRow
                label="2-week driving"
                value={`${formatDuration(summary.twoWeekDriving)} / 90h`}
              />

              <PeriodLabel>
                {formatDateRange(twoWeekStart, currentWeekEnd)}
              </PeriodLabel>
            </section>

            <section className="border-t pt-4">
              <h3 className="mb-1 text-sm font-semibold">Working time</h3>

              <SummaryRow
                label="17-week average"
                value={`${formatDuration(
                  Math.round(summary.average17WeekWorking),
                )} / week`}
                prominent
              />

              <PeriodLabel>
                {formatDateRange(seventeenWeekStart, currentWeekEnd)}
              </PeriodLabel>
            </section>

            <section className="border-t pt-4">
              <h3 className="mb-1 text-sm font-semibold">Earnings</h3>

              <SummaryRow
                label="Year-to-date"
                value={`£${summary.annualEarned.toFixed(2)}`}
                prominent
              />

              <PeriodLabel>
                {formatDateRange(yearStart, currentWeekEnd)}
              </PeriodLabel>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
