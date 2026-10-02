'use client';

import { BedDouble, CircleGauge } from 'lucide-react';

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
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

export function ShiftsTable({
  shifts,
  restCompensations,
  onAcceptRestCompensation,
  onCancelRestCompensation,
  onEdit,
  onDelete,
}: ShiftsTableProps) {
  const weeks = new Map<string, Shift[]>();

  for (const shift of shifts) {
    const weekStart = getStartOfWeek(new Date(`${shift.date}T12:00:00`));

    const key = [
      weekStart.getFullYear(),
      String(weekStart.getMonth() + 1).padStart(2, '0'),
      String(weekStart.getDate()).padStart(2, '0'),
    ].join('-');

    const existing = weeks.get(key) ?? [];

    existing.push(shift);

    weeks.set(key, existing);
  }

  const sortedWeeks = Array.from(weeks.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, weekShifts]) => ({
      key,
      weekStart: new Date(`${key}T12:00:00`),
      shifts: weekShifts,
    }));

  if (sortedWeeks.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        No shifts yet.
      </div>
    );
  }

  const tableClass = `
    w-full
    table-fixed
    border-separate
    border-spacing-0
    text-sm
    [&_tbody_tr]:border-b
    [&_tbody_td]:border-r
    [&_tbody_td]:border-border/30
    [&_tbody_td:last-child]:border-r-0
    [&_thead_th]:border-r
    [&_thead_th]:border-border/30
    [&_thead_th:last-child]:border-r-0
  `;

  const headerClass =
    'bg-background px-1 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground';

  return (
    <div className="w-full">
      {/* STICKY TABLE HEADER */}
      <div className="sticky top-0 z-30 w-full bg-background">
        <Table className={tableClass}>
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
            <col className="w-[20%]" />
            <col className="w-[15%]" />
          </colgroup>

          <TableHeader className="bg-background">
            <tr className="border-b bg-background">
              <TableHead className={headerClass}>Start</TableHead>

              <TableHead className={headerClass}>
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <CircleGauge className="size-4" />
                  <span>Driving</span>
                </div>
              </TableHead>

              <TableHead className={headerClass}>Shift</TableHead>

              <TableHead className={headerClass}>
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <BedDouble className="size-4" />
                  <span>Rest</span>
                </div>
              </TableHead>

              <TableHead className={headerClass}>End</TableHead>

              <TableHead className={headerClass}>Actions</TableHead>
            </tr>
          </TableHeader>
        </Table>
      </div>

      {/* TABLE BODY */}
      <div className="w-full">
        <Table className={tableClass}>
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
            <col className="w-[20%]" />
            <col className="w-[15%]" />
          </colgroup>

          <TableBody>
            {sortedWeeks.map(({ key, weekStart, shifts: weekShifts }) => (
              <WeeklyShiftSection
                key={key}
                weekStart={weekStart}
                shifts={weekShifts}
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
