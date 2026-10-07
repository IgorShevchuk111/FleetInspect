'use client';

import { BedDouble } from 'lucide-react';

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { Shift } from '@/features/driver-journal/types/ driver-journal';

import type { RestCompensation } from '../services/driver-journal';
import { getStartOfWeek } from '../utils/dates';

import { WeeklyShiftSection } from './weekly-shift-section';

type ShiftsTableProps = {
  shifts: Shift[];
  restCompensations: RestCompensation[];
  onAcceptRestCompensation: (
    reducedWeeklyRestShiftId: string,
    compensationShiftId: string,
    dailyRestMinutes: number,
    compensationMinutes: number,
  ) => Promise<void>;
  onCancelRestCompensation: (compensationId: string) => Promise<void>;
  onEdit: (shift: Shift) => void;
  onDelete: (shift: Shift) => void;
};

type WeekGroup = {
  key: string;
  weekStart: Date;
  shifts: Shift[];
};

function TachographDrivingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5.5 16.5L9.8 13.3M18.5 16.5L14.2 13.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getWeekKey(weekStart: Date) {
  return [
    weekStart.getFullYear(),
    String(weekStart.getMonth() + 1).padStart(2, '0'),
    String(weekStart.getDate()).padStart(2, '0'),
  ].join('-');
}

function groupShiftsByWeek(shifts: Shift[]): WeekGroup[] {
  const weeks = new Map<string, WeekGroup>();

  for (const shift of shifts) {
    const weekStart = getStartOfWeek(new Date(`${shift.date}T12:00:00`));

    const key = getWeekKey(weekStart);
    const existing = weeks.get(key);

    if (existing) {
      existing.shifts.push(shift);
      continue;
    }

    weeks.set(key, {
      key,
      weekStart,
      shifts: [shift],
    });
  }

  return Array.from(weeks.values()).sort((a, b) => b.key.localeCompare(a.key));
}

const tableClass = `
  w-full
  table-fixed
  border-separate
  border-spacing-0
  text-[13px]
  [&_tbody_tr]:border-b
  [&_tbody_td]:border-r
  [&_tbody_td]:border-border/30
  [&_tbody_td:last-child]:border-r-0
  [&_thead_th]:border-r
  [&_thead_th]:border-border/30
  [&_thead_th:last-child]:border-r-0
`;

const headerClass = `
  bg-muted/70
  px-0.5
  py-2
  text-center
  text-xs
  font-semibold
  uppercase
  tracking-wide
  text-foreground
`;

function TableColumns() {
  return (
    <colgroup>
      <col className="w-[20%]" />
      <col className="w-[15%]" />
      <col className="w-[15%]" />
      <col className="w-[15%]" />
      <col className="w-[20%]" />
      <col className="w-[15%]" />
    </colgroup>
  );
}

export function ShiftsTable({
  shifts,
  restCompensations,
  onAcceptRestCompensation,
  onCancelRestCompensation,
  onEdit,
  onDelete,
}: ShiftsTableProps) {
  const sortedWeeks = groupShiftsByWeek(shifts);

  if (sortedWeeks.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        No shifts yet.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="sticky top-0 z-30 w-full min-w-0 bg-background shadow-sm">
        <Table className={tableClass}>
          <TableColumns />

          <TableHeader className="bg-muted/70">
            <TableRow className="border-b border-border/60 bg-muted/70">
              <TableHead className={headerClass}>Start</TableHead>

              <TableHead className={headerClass}>
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <TachographDrivingIcon />
                  <span>Driving</span>
                </div>
              </TableHead>

              <TableHead className={headerClass}>Shift</TableHead>

              <TableHead className={headerClass}>
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <BedDouble className="size-5" aria-hidden="true" />
                  <span>Rest</span>
                </div>
              </TableHead>

              <TableHead className={headerClass}>End</TableHead>

              <TableHead className={headerClass}>Actions</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      <div className="w-full min-w-0 overflow-x-hidden">
        <Table className={tableClass}>
          <TableColumns />

          <TableBody>
            {sortedWeeks.map((week) => (
              <WeeklyShiftSection
                key={week.key}
                weekStart={week.weekStart}
                shifts={week.shifts}
                allShifts={shifts}
                restCompensations={restCompensations}
                onAcceptRestCompensation={onAcceptRestCompensation}
                onCancelRestCompensation={onCancelRestCompensation}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
