'use client';

import { useState, type ReactNode } from 'react';

import { Banknote, CalendarDays, Clock3, Gauge } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Shift } from '@/features/driver-journal/types/driver-journal';
import {
  getEndOfWeek,
  getStartOfWeek,
} from '@/features/driver-journal/utils/dates';
import { formatDuration } from '@/features/driver-journal/utils/duration';

import { EarningsPeriod } from '@/features/driver-journal/components/earnings-period';

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
  allShifts: Shift[];
};

type SummaryRowProps = {
  label: string;
  value: string;
  detail?: string;
  prominent?: boolean;
};

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function SummaryRow({
  label,
  value,
  detail,
  prominent = false,
}: SummaryRowProps) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3 border-b border-border/50 py-2 last:border-b-0">
      <span className="min-w-0 flex-1 text-caption leading-body text-muted-foreground">
        {label}
      </span>

      <div className="flex max-w-[65%] shrink-0 flex-col items-end gap-0.5 text-right">
        <span
          className={`text-[length:var(--font-size-secondary)] leading-body tabular-nums text-foreground ${
            prominent ? 'font-semibold' : 'font-medium'
          }`}
        >
          {value}
        </span>

        {detail && (
          <span className="text-caption leading-body text-muted-foreground">
            {detail}
          </span>
        )}
      </div>
    </div>
  );
}

function SummarySection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof CalendarDays;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2 border-t border-border pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" />

        <h3 className="text-[length:var(--font-size-secondary)] font-semibold leading-heading text-muted-foreground">
          {title}
        </h3>
      </div>

      <div>{children}</div>
    </section>
  );
}

export function WeeklySummary({
  summary,
  weekStart,
  sharedAllowanceUsed,
  allShifts,
}: WeeklySummaryProps) {
  const [open, setOpen] = useState(false);

  const currentWeekStart = getStartOfWeek(weekStart);
  const currentWeekEnd = getEndOfWeek(weekStart);

  const twoWeekStart = new Date(currentWeekStart);
  twoWeekStart.setDate(twoWeekStart.getDate() - 7);

  const seventeenWeekStart = new Date(currentWeekStart);
  seventeenWeekStart.setDate(seventeenWeekStart.getDate() - 16 * 7);

  const yearStart = new Date(currentWeekEnd.getFullYear(), 0, 1);

  const earningsPeriodStart = formatDateInput(currentWeekStart);
  const earningsPeriodEnd = formatDateInput(currentWeekEnd);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[90vh] sm:w-[calc(100vw-2rem)] sm:max-w-xl sm:rounded-lg">
        <DialogHeader className="shrink-0 border-b border-border px-4 py-4 text-left sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <CalendarDays className="size-4 text-primary" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-heading font-semibold leading-heading text-foreground">
                Weekly Summary
              </DialogTitle>

              <DialogDescription className="text-caption leading-body">
                {formatShortDate(currentWeekStart)} –{' '}
                {formatShortDate(currentWeekEnd)}
                <span className="mt-0.5 block">Monday – Sunday</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-5 px-4 py-5 sm:px-6">
            <SummarySection icon={Clock3} title="Shift">
              <SummaryRow
                label="Extended shifts / reduced rests"
                value={`${sharedAllowanceUsed}/3 used`}
                detail="Since last weekly rest"
                prominent
              />
            </SummarySection>

            <SummarySection icon={Gauge} title="Driving limits">
              <SummaryRow
                label="Weekly driving"
                value={`${formatDuration(summary.driving)} / 56h`}
                detail={`Extended driving days: ${summary.extendedDrivingDaysUsed}/2 used`}
                prominent
              />

              <SummaryRow
                label="2-week driving"
                value={`${formatDuration(summary.twoWeekDriving)} / 90h`}
                detail={`${formatShortDate(twoWeekStart)} – ${formatShortDate(currentWeekEnd)}`}
                prominent
              />
            </SummarySection>

            <SummarySection icon={CalendarDays} title="Working time">
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
                detail={`${formatShortDate(seventeenWeekStart)} – ${formatShortDate(currentWeekEnd)}`}
                prominent
              />
            </SummarySection>

            <SummarySection icon={Banknote} title="Earnings">
              <div className="pt-3">
                <EarningsPeriod
                  key={`${earningsPeriodStart}-${earningsPeriodEnd}`}
                  allShifts={allShifts}
                  defaultStartDate={earningsPeriodStart}
                  defaultEndDate={earningsPeriodEnd}
                />
              </div>
            </SummarySection>
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-row justify-center gap-2 border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-3">
          <Button
            type="button"
            variant="outline"
            className="min-h-10"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
