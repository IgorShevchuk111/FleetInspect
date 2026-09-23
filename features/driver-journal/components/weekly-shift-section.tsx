import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { Shift } from '@/features/driver-journal/types/ driver-journal';

import { formatWeek } from '../utils/dates';
import { calculateShiftMinutes } from '../utils/shifts';
import { calculateWeeklySummary } from '../utils/weekly-summary';

import {
  buildExtendedDrivingUsage,
  buildSharedAllowanceUsage,
  MAX_EXTENDED_DRIVING_DAYS,
  MAX_SHARED_ALLOWANCE,
  normalizeDrivingMinutes,
} from '../utils/compliance-usage';

import {
  getDrivingStatus,
  getRestStatus,
  getShiftStatus,
  hasExtendedShift,
  isReducedDailyRest,
} from './shift-status';

import { ShiftRow } from './shift-row';
import { WeeklySummary } from './weekly-summary';

type WeeklyShiftSectionProps = {
  weekStart: Date;
  shifts: Shift[];
  allShifts: Shift[];
  onEdit: (shift: Shift) => void;
};

const headerClass =
  'px-1 py-2 text-center text-sm font-medium leading-tight text-muted-foreground sm:px-2 sm:py-2';

export function WeeklyShiftSection({
  weekStart,
  shifts,
  allShifts,
  onEdit,
}: WeeklyShiftSectionProps) {
  const weeklySummary = calculateWeeklySummary(allShifts, weekStart);

  const sortedShifts = [...shifts].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.start}`).getTime();
    const dateB = new Date(`${b.date}T${b.start}`).getTime();

    return dateB - dateA;
  });

  const sharedAllowanceUsage = buildSharedAllowanceUsage(allShifts);
  const extendedDrivingUsage = buildExtendedDrivingUsage(shifts);

  return (
    <Card className="overflow-hidden rounded-xl border">
      <CardHeader className="border-b bg-muted/30 px-4 py-2.5 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-lg font-semibold leading-tight">
              {formatWeek(weekStart)}
            </CardTitle>

            <CardDescription className="mt-1 text-sm leading-tight">
              {shifts.length} {shifts.length === 1 ? 'shift' : 'shifts'}
            </CardDescription>
          </div>

          <div className="shrink-0 text-sm leading-tight text-muted-foreground">
            Mon – Sun
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto overscroll-x-contain">
          <Table className="min-w-[466px] text-sm sm:min-w-[690px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead
                  className={`${headerClass} sticky left-0 z-30 w-[52px] min-w-[52px] bg-background shadow-[2px_0_3px_-2px_rgba(0,0,0,0.2)] sm:w-[90px] sm:min-w-[90px]`}
                >
                  Start
                </TableHead>

                <TableHead
                  className={`${headerClass} w-[64px] min-w-[64px] sm:w-[90px] sm:min-w-[90px]`}
                >
                  Driving
                </TableHead>

                <TableHead
                  className={`${headerClass} w-[60px] min-w-[60px] sm:w-[85px] sm:min-w-[85px]`}
                >
                  Shift
                </TableHead>

                <TableHead
                  className={`${headerClass} w-[46px] min-w-[46px] sm:w-[65px] sm:min-w-[65px]`}
                >
                  Break
                </TableHead>

                <TableHead
                  className={`${headerClass} w-[68px] min-w-[68px] sm:w-[100px] sm:min-w-[100px]`}
                >
                  Rest
                </TableHead>

                <TableHead
                  className={`${headerClass} w-[58px] min-w-[58px] sm:w-[80px] sm:min-w-[80px]`}
                >
                  Earn
                </TableHead>

                <TableHead
                  className={`${headerClass} w-[66px] min-w-[66px] sm:w-[100px] sm:min-w-[100px]`}
                >
                  Working
                </TableHead>

                <TableHead
                  className={`${headerClass} sticky right-0 z-30 w-[52px] min-w-[52px] bg-background shadow-[-2px_0_3px_-2px_rgba(0,0,0,0.2)] sm:w-[90px] sm:min-w-[90px]`}
                >
                  End
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedShifts.map((shift) => {
                const shiftMinutes = calculateShiftMinutes(
                  shift.date,
                  shift.start,
                  shift.endDate || shift.date,
                  shift.end,
                );

                const sharedAllowanceUsedAfter =
                  sharedAllowanceUsage.get(shift.id) ?? 0;

                const reducedDailyRest = isReducedDailyRest(shift);
                const extendedShift = hasExtendedShift(shift);

                const currentShiftUsesAllowance =
                  reducedDailyRest || extendedShift;

                const sharedAllowanceUsedBefore = Math.max(
                  0,
                  sharedAllowanceUsedAfter -
                    (currentShiftUsesAllowance ? 1 : 0),
                );

                const drivingMinutes = normalizeDrivingMinutes(shift.driving);

                const drivingUsageAfter =
                  extendedDrivingUsage.get(shift.id) ?? 0;

                const extendedDriving =
                  drivingMinutes > 9 * 60 && drivingMinutes <= 10 * 60;

                const drivingUsageBefore = Math.max(
                  0,
                  drivingUsageAfter - (extendedDriving ? 1 : 0),
                );

                const drivingStatus = getDrivingStatus(
                  drivingMinutes,
                  drivingUsageBefore,
                );

                const shiftStatus = getShiftStatus(
                  shift,
                  shiftMinutes,
                  sharedAllowanceUsedBefore,
                );

                const restStatus = getRestStatus(shift);

                return (
                  <ShiftRow
                    key={shift.id}
                    shift={shift}
                    drivingStatus={drivingStatus}
                    shiftStatus={shiftStatus}
                    restStatus={restStatus}
                    onEdit={onEdit}
                  />
                );
              })}

              {sortedShifts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-20 px-2 py-4 text-center text-sm text-muted-foreground"
                  >
                    No shifts this week.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border-t px-4 py-3 sm:px-6 sm:py-4">
          <WeeklySummary weekStart={weekStart} summary={weeklySummary} />
        </div>
      </CardContent>
    </Card>
  );
}
