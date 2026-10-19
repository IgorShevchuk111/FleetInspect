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
  extendedDrivingDaysUsed: number;
};

type WeeklySummaryProps = {
  summary: WeeklySummaryData;
  weekStart: Date;
  sharedAllowanceUsed: number;
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
    <div className="flex min-h-11 items-center justify-between gap-4 py-2">
      <span className="font-semibold">{label}</span>

      <span className={`shrink-0 text-right   tabular-nums  text-foreground`}>
        {value}
      </span>
    </div>
  );
}

function PeriodLabel({ children }: { children: ReactNode }) {
  return <p className=" text-muted-foreground text-small">{children}</p>;
}

function SummarySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={title === 'Shift' ? '' : 'border-t border-border pt-5'}>
      <h1 className="font-semibold text-heading text-muted-foreground">
        {title}
      </h1>

      {children}
    </section>
  );
}

export function WeeklySummary({
  summary,
  weekStart,
  sharedAllowanceUsed,
}: WeeklySummaryProps) {
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-9 bg-accent"
        >
          Weekly Summary
        </Button>
      </DialogTrigger>

      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[90vh] sm:w-[calc(100vw-2rem)] sm:max-w-sm sm:rounded-lg">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-5 text-left sm:px-6">
          <DialogTitle className="text-title">Weekly Summary</DialogTitle>

          <DialogDescription className="mt-1  ">
            {formatDateRange(currentWeekStart, currentWeekEnd)}
            <span className="mt-0.5 block">Monday – Sunday</span>
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
          <div className="space-y-6">
            <SummarySection title="Shift">
              <div className="divide-y divide-border">
                <SummaryRow
                  label="Extended shifts / reduced rests"
                  value={`${sharedAllowanceUsed}/3 used`}
                  prominent
                />
              </div>

              <PeriodLabel>Since last weekly rest</PeriodLabel>
            </SummarySection>

            <SummarySection title="Driving limits">
              <SummaryRow
                label="Weekly driving"
                value={`${formatDuration(summary.driving)} / 56h`}
                prominent
              />

              <PeriodLabel>
                Extended driving days: {summary.extendedDrivingDaysUsed}/2 used
              </PeriodLabel>

              <div className="divide-y divide-border">
                <SummaryRow
                  label="2-week driving"
                  value={`${formatDuration(summary.twoWeekDriving)} / 90h`}
                  prominent
                />
              </div>

              <PeriodLabel>
                {formatDateRange(twoWeekStart, currentWeekEnd)}
              </PeriodLabel>
            </SummarySection>
            <SummarySection title="Working time">
              <div className="divide-y divide-border">
                <SummaryRow
                  label="This week"
                  value={formatDuration(summary.working)}
                  prominent
                />

                <SummaryRow
                  label="17-week average"
                  value={`${formatDuration(
                    Math.round(summary.average17WeekWorking),
                  )} / week`}
                  prominent
                />
              </div>

              <PeriodLabel>
                {formatDateRange(seventeenWeekStart, currentWeekEnd)}
              </PeriodLabel>
            </SummarySection>
            <SummarySection title="Earnings">
              <div className="divide-y divide-border">
                <SummaryRow
                  label="Earned this week"
                  value={`£${summary.earn.toFixed(2)}`}
                  prominent
                />

                <SummaryRow
                  label="Year-to-date"
                  value={`£${summary.annualEarned.toLocaleString('en-GB', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
                  prominent
                />
              </div>

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
