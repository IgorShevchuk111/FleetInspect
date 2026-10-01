import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  onDeclineRestCompensation: (
    reducedWeeklyRestShiftId: string,
    compensationShiftId: string,
  ) => Promise<void>;
  onCancelRestCompensation: (compensationId: string) => Promise<void>;
  onEdit: (shift: Shift) => void;
};

const headerClass =
  'sticky top-0 border-r border-border/40 bg-background px-1 py-2 text-left text-sm font-medium leading-tight text-muted-foreground sm:px-2 sm:py-2';

export function ShiftsTable({
  shifts,
  restCompensations,
  onAcceptRestCompensation,
  onDeclineRestCompensation,
  onCancelRestCompensation,
  onEdit,
}: ShiftsTableProps) {
  const shiftsByWeek = new Map<string, Shift[]>();

  for (const shift of shifts) {
    if (!shift.date) {
      continue;
    }

    const date = new Date(`${shift.date}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const weekStart = getStartOfWeek(date);

    const weekKey = [
      weekStart.getFullYear(),
      String(weekStart.getMonth() + 1).padStart(2, '0'),
      String(weekStart.getDate()).padStart(2, '0'),
    ].join('-');

    const weekShifts = shiftsByWeek.get(weekKey) ?? [];

    weekShifts.push(shift);

    shiftsByWeek.set(weekKey, weekShifts);
  }

  const weeks = Array.from(shiftsByWeek.entries())
    .map(([weekKey, weekShifts]) => ({
      weekStart: new Date(`${weekKey}T00:00:00`),
      shifts: weekShifts,
    }))
    .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());

  if (weeks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No shifts yet</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add your first shift to start your driver journal.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <Table
        containerClassName="
          max-h-[calc(100vh-180px)]
          overflow-auto
        "
        className="
        min-w-[466px]
        text-sm
        sm:min-w-[690px]
      
        [&_thead_th]:border-r
        [&_thead_th]:border-border/40
        [&_thead_th:last-child]:border-r-0
      
        [&_tbody_td:not(:first-child)]:border-r
        [&_tbody_td:not(:first-child)]:border-border/30
        [&_tbody_td:last-child]:border-r-0
      
        [&_tbody_td:first-child]:!sticky
        [&_tbody_td:first-child]:!left-0
        [&_tbody_td:first-child]:!z-30
        [&_tbody_td:first-child]:!bg-background
        [&_tbody_td:first-child]:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.25)]
      
        [&_tbody_td:last-child]:!static
        [&_tbody_td:last-child]:!right-auto
        [&_tbody_td:last-child]:!z-auto
        [&_tbody_td:last-child]:!shadow-none
      "
      >
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead
              className={`${headerClass} left-0 z-50 w-[52px] min-w-[52px] !bg-background shadow-[2px_0_4px_-2px_rgba(0,0,0,0.25)] sm:w-[90px] sm:min-w-[90px]`}
            >
              Start
            </TableHead>

            <TableHead
              className={`${headerClass} z-40 w-[64px] min-w-[64px] sm:w-[90px] sm:min-w-[90px]`}
            >
              Driving
            </TableHead>

            <TableHead
              className={`${headerClass} z-40 w-[60px] min-w-[60px] sm:w-[85px] sm:min-w-[85px]`}
            >
              Shift
            </TableHead>

            <TableHead
              className={`${headerClass} z-40 w-[46px] min-w-[46px] sm:w-[65px] sm:min-w-[65px]`}
            >
              Break
            </TableHead>

            <TableHead
              className={`${headerClass} z-40 w-[68px] min-w-[68px] sm:w-[100px] sm:min-w-[100px]`}
            >
              Rest
            </TableHead>

            <TableHead
              className={`${headerClass} z-40 w-[58px] min-w-[58px] sm:w-[80px] sm:min-w-[80px]`}
            >
              Earn
            </TableHead>

            <TableHead
              className={`${headerClass} z-40 w-[66px] min-w-[66px] sm:w-[100px] sm:min-w-[100px]`}
            >
              Working
            </TableHead>

            <TableHead
              className={`${headerClass} z-40 w-[52px] min-w-[52px] sm:w-[90px] sm:min-w-[90px]`}
            >
              End
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {weeks.map(({ weekStart, shifts: weekShifts }) => (
            <WeeklyShiftSection
              key={weekStart.toISOString()}
              weekStart={weekStart}
              shifts={weekShifts}
              allShifts={shifts}
              restCompensations={restCompensations}
              onAcceptRestCompensation={onAcceptRestCompensation}
              onDeclineRestCompensation={onDeclineRestCompensation}
              onCancelRestCompensation={onCancelRestCompensation}
              onEdit={onEdit}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
