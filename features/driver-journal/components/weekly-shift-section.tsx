import { TableCell, TableRow } from '@/components/ui/table';

import type { Shift } from '@/features/driver-journal/types/ driver-journal';

import type { RestCompensation } from '../services/driver-journal';

import { formatWeek } from '../utils/dates';
import { calculateShiftMinutes } from '../utils/shifts';
import { calculateWeeklySummary } from '../utils/weekly-summary';

import {
  buildExtendedDrivingUsage,
  buildExtendedShiftUsage,
  buildSharedAllowanceUsage,
  normalizeDrivingMinutes,
} from '../utils/compliance-usage';

import { buildWeeklyRestCompensationCandidates } from '../utils/weekly-rest-compensation';

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
  restCompensations: RestCompensation[];
  onEdit: (shift: Shift) => void;
  onDelete: (shift: Shift) => void;
  onAcceptRestCompensation: (
    reducedWeeklyRestShiftId: string,
    compensationShiftId: string,
    dailyRestMinutes: number,
    compensationMinutes: number,
  ) => Promise<void>;
  onCancelRestCompensation: (compensationId: string) => Promise<void>;
};

export function WeeklyShiftSection({
  weekStart,
  shifts,
  allShifts,
  restCompensations,
  onEdit,
  onDelete,
  onAcceptRestCompensation,
  onCancelRestCompensation,
}: WeeklyShiftSectionProps) {
  const weeklySummary = calculateWeeklySummary(
    allShifts,
    weekStart,
    restCompensations,
  );

  const sortedShifts = [...shifts].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.start}`).getTime();
    const dateB = new Date(`${b.date}T${b.start}`).getTime();

    return dateB - dateA;
  });

  const sharedAllowanceUsage = buildSharedAllowanceUsage(
    allShifts,
    restCompensations,
  );

  const extendedDrivingUsage = buildExtendedDrivingUsage(allShifts);

  const extendedShiftUsage = buildExtendedShiftUsage(allShifts);

  const weeklyRestCompensationCandidates =
    buildWeeklyRestCompensationCandidates(allShifts, restCompensations);

  return (
    <>
      <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
        <TableCell colSpan={6} className="p-0">
          <div className="border-b bg-background px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex flex-col items-center">
              <div className="text-center text-sm font-semibold leading-tight sm:text-base">
                Week: {formatWeek(weekStart)}
              </div>

              <div className="mt-1 flex items-center justify-center gap-3">
                <div className="text-xs text-muted-foreground">
                  {shifts.length} {shifts.length === 1 ? 'shift' : 'shifts'}
                </div>

                <WeeklySummary
                  weekStart={weekStart}
                  summary={weeklySummary}
                  allShifts={allShifts}
                />
              </div>
            </div>
          </div>
        </TableCell>
      </TableRow>

      {sortedShifts.map((shift) => {
        const shiftMinutes = calculateShiftMinutes(
          shift.date,
          shift.start,
          shift.endDate || shift.date,
          shift.end,
        );

        const baseSharedAllowanceUsedAfter =
          sharedAllowanceUsage.get(shift.id) ?? 0;

        const baseReducedDailyRest = isReducedDailyRest(shift);

        const extendedShift = hasExtendedShift(shift);

        const acceptedCompensationForShift = restCompensations.find(
          (compensation) =>
            compensation.compensation_shift_id === shift.id &&
            compensation.decision === 'accepted',
        );

        const effectiveRestMinutes =
          shift.restType === 'daily'
            ? Math.max(
                0,
                Number(shift.rest) -
                  Number(
                    acceptedCompensationForShift?.compensation_minutes ?? 0,
                  ),
              )
            : Number(shift.rest);

        const compensationUsesReducedDailyRest =
          Boolean(acceptedCompensationForShift) &&
          shift.restType === 'daily' &&
          effectiveRestMinutes >= 9 * 60 &&
          effectiveRestMinutes < 11 * 60;

        const reducedDailyRest =
          baseReducedDailyRest || compensationUsesReducedDailyRest;

        const compensationAddsAllowance =
          compensationUsesReducedDailyRest && !baseReducedDailyRest;

        const sharedAllowanceUsedAfter =
          baseSharedAllowanceUsedAfter + (compensationAddsAllowance ? 1 : 0);

        const currentShiftUsesAllowance = reducedDailyRest;

        const sharedAllowanceUsedBefore = Math.max(
          0,
          sharedAllowanceUsedAfter - (currentShiftUsesAllowance ? 1 : 0),
        );

        const drivingMinutes = normalizeDrivingMinutes(shift.driving);

        const drivingUsageAfter = extendedDrivingUsage.get(shift.id) ?? 0;

        const extendedShiftUsageAfter = extendedShiftUsage.get(shift.id) ?? 0;

        const extendedDriving = drivingMinutes > 9 * 60;

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

        const restStatus = getRestStatus(shift, effectiveRestMinutes);

        const candidatesForShift = weeklyRestCompensationCandidates.get(
          shift.id,
        );

        const savedCompensationsForShift = restCompensations.filter(
          (compensation) =>
            compensation.reduced_weekly_rest_shift_id === shift.id ||
            compensation.compensation_shift_id === shift.id,
        );

        return (
          <ShiftRow
            key={shift.id}
            shift={shift}
            drivingStatus={drivingStatus}
            shiftStatus={shiftStatus}
            restStatus={restStatus}
            drivingUsageAfter={drivingUsageAfter}
            sharedAllowanceUsedAfter={sharedAllowanceUsedAfter}
            extendedShiftUsageAfter={extendedShiftUsageAfter}
            reducedDailyRest={reducedDailyRest}
            extendedShift={extendedShift}
            weeklyRestCompensationCandidates={candidatesForShift}
            restCompensations={savedCompensationsForShift}
            onAcceptRestCompensation={onAcceptRestCompensation}
            onCancelRestCompensation={onCancelRestCompensation}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}

      {sortedShifts.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={6}
            className="h-20 px-2 py-4 text-center text-sm text-muted-foreground"
          >
            No shifts this week.
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
