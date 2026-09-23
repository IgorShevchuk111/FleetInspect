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
  shift: number;
  break: number;
  rest: number;
  working: number;
  earn: number;
  twoWeekDriving: number;
  weeklyDrivingRemaining: number;
  twoWeekDrivingRemaining: number;
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
    <div className="flex items-center justify-between gap-4 py-2">
      <span className={prominent ? 'font-medium' : 'text-muted-foreground'}>
        {label}
      </span>

      <span
        className={
          prominent ? 'font-semibold tabular-nums' : 'font-medium tabular-nums'
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
          <Button type="button" variant="outline" size="sm">
            Weekly summary
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Weekly summary</DialogTitle>

            <DialogDescription>
              {formatDateRange(currentWeekStart, currentWeekEnd)}
              <span className="block">Monday – Sunday</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="divide-y">
              <SummaryRow
                label="Driving"
                value={formatDuration(summary.driving)}
                prominent
              />

              <SummaryRow label="Shift" value={formatDuration(summary.shift)} />

              <SummaryRow
                label="Working time"
                value={formatDuration(summary.working)}
                prominent
              />

              <SummaryRow label="Break" value={formatDuration(summary.break)} />

              <SummaryRow label="Rest" value={formatDuration(summary.rest)} />

              <SummaryRow
                label="Earned"
                value={`£${summary.earn.toFixed(2)}`}
                prominent
              />
            </div>

            <div className="border-t pt-2">
              <SummaryRow
                label="Weekly driving"
                value={`${formatDuration(summary.driving)} / 56h`}
                prominent
              />

              <SummaryRow
                label="Weekly driving remaining"
                value={formatDuration(summary.weeklyDrivingRemaining)}
              />

              <SummaryRow
                label="2-week driving"
                value={`${formatDuration(summary.twoWeekDriving)} / 90h`}
              />

              <SummaryRow
                label="2-week driving remaining"
                value={formatDuration(summary.twoWeekDrivingRemaining)}
              />

              <PeriodLabel>
                {formatDateRange(twoWeekStart, currentWeekEnd)}
              </PeriodLabel>
            </div>

            <div className="border-t pt-2">
              <SummaryRow
                label="17-week avg working"
                value={`${formatDuration(
                  Math.round(summary.average17WeekWorking),
                )} / week`}
              />

              <PeriodLabel>
                {formatDateRange(seventeenWeekStart, currentWeekEnd)}
              </PeriodLabel>
            </div>

            <div className="border-t pt-2">
              <SummaryRow
                label="Year-to-date earnings"
                value={`£${summary.annualEarned.toFixed(2)}`}
                prominent
              />

              <PeriodLabel>
                {formatDateRange(yearStart, currentWeekEnd)}
              </PeriodLabel>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
