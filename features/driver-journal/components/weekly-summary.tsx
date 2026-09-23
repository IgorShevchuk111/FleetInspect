'use client';

import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { getEndOfWeek, getStartOfWeek } from '../utils/dates';
import { formatDuration } from '../utils/duration';

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

export function WeeklySummary({ summary, weekStart }: WeeklySummaryProps) {
  const currentWeekStart = getStartOfWeek(weekStart);
  const currentWeekEnd = getEndOfWeek(weekStart);

  const twoWeekStart = new Date(currentWeekStart);
  twoWeekStart.setDate(twoWeekStart.getDate() - 7);

  const seventeenWeekStart = new Date(currentWeekStart);
  seventeenWeekStart.setDate(seventeenWeekStart.getDate() - 16 * 7);

  const yearStart = new Date(currentWeekEnd.getFullYear(), 0, 1);

  return (
    <div className="flex justify-end">
      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="min-h-9">
            Weekly summary
          </Button>
        </DialogTrigger>

        <DialogContent
          className="
            w-[calc(100%-1rem)]
            max-w-sm
            overflow-hidden
            p-0
            sm:w-full
          "
        >
          <DialogHeader className="border-b px-5 py-4 text-left sm:px-6 sm:py-5">
            <DialogTitle className="text-base sm:text-lg">
              Weekly summary
            </DialogTitle>

            <DialogDescription className="text-xs leading-relaxed sm:text-sm">
              {formatDateRange(currentWeekStart, currentWeekEnd)}
              <span className="block">Monday – Sunday</span>
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
            <div className="space-y-5">
              <section>
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
    </div>
  );
}
