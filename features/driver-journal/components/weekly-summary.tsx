'use client';

import { type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  getEndOfWeek,
  getStartOfWeek,
} from '@/features/driver-journal/utils/dates';
import { formatDuration } from '@/features/driver-journal/utils/duration';

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
    <div className="flex min-h-10 items-center justify-between gap-3 py-2">
      <span
        className={
          prominent
            ? 'text-caption leading-body font-medium text-foreground'
            : 'text-caption leading-body text-muted-foreground'
        }
      >
        {label}
      </span>

      <span
        className={`shrink-0 text-right text-[length:var(--font-size-secondary)] leading-body tabular-nums ${
          prominent ? 'font-semibold' : 'font-medium'
        } text-foreground`}
      >
        {value}
      </span>
    </div>
  );
}

function PeriodLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 text-caption leading-body text-muted-foreground">
      {children}
    </p>
  );
}

function SummarySection({
  title,
  children,
  bordered = true,
}: {
  title: string;
  children: ReactNode;
  bordered?: boolean;
}) {
  return (
    <section
      className={
        bordered ? 'space-y-2 border-t border-border pt-4' : 'space-y-2'
      }
    >
      <h3 className="text-[length:var(--font-size-secondary)] font-semibold leading-heading text-muted-foreground">
        {title}
      </h3>

      {children}
    </section>
  );
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
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="min-h-9">
          Weekly Summary
        </Button>
      </DialogTrigger>

      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[90vh] sm:w-[calc(100vw-2rem)] sm:max-w-sm sm:rounded-lg">
        <DialogHeader className="shrink-0 border-b border-border px-4 py-4 text-left sm:px-6">
          <DialogTitle className="text-heading font-semibold leading-heading text-foreground">
            Weekly Summary
          </DialogTitle>

          <DialogDescription className="text-caption leading-body">
            {formatDateRange(currentWeekStart, currentWeekEnd)}
            <span className="block">Monday – Sunday</span>
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          <div className="space-y-5">
            <SummarySection title="This week" bordered={false}>
              <div className="divide-y divide-border rounded-lg border border-border px-3">
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
            </SummarySection>

            <SummarySection title="Driving limits">
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
            </SummarySection>

            <SummarySection title="Working time">
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
            </SummarySection>

            <SummarySection title="Earnings">
              <SummaryRow
                label="Year-to-date"
                value={`£${summary.annualEarned.toFixed(2)}`}
                prominent
              />

              <PeriodLabel>
                {formatDateRange(yearStart, currentWeekEnd)}
              </PeriodLabel>
            </SummarySection>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
