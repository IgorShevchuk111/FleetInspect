'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { useTranslations } from '@/features/driver-journal/i18n/use-translations';

import type { Shift } from '@/features/driver-journal/types/driver-journal';

import type { RestCompensation } from '../services/driver-journal';
import { formatWeek } from '../utils/dates';
import { prepareWeeklyShiftRows } from '../utils/weekly-shift-view';
import { calculateWeeklySummary } from '../utils/weekly-summary';

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
  const { t } = useTranslations();

  const weeklySummary = calculateWeeklySummary(
    allShifts,
    weekStart,
    restCompensations,
  );

  const rows = prepareWeeklyShiftRows(shifts, allShifts, restCompensations);

  return (
    <>
      <TableRow className="border-b border-border bg-muted/30 hover:bg-muted/30">
        <TableCell colSpan={6} className="p-0">
          <div className="border-b border-border bg-background px-card pt-8 pb-2 sm:px-card">
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-lg font-semibold leading-heading text-foreground">
                {t('week')}: {formatWeek(weekStart)}
              </h3>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="text-small leading-body text-foreground">
                  {shifts.length}{' '}
                  {shifts.length === 1 ? t('shiftSingular') : t('shiftPlural')}
                </span>

                <WeeklySummary
                  weekStart={weekStart}
                  summary={weeklySummary}
                  sharedAllowanceUsed={weeklySummary.sharedAllowanceUsed}
                  allShifts={allShifts}
                />
              </div>
            </div>
          </div>
        </TableCell>
      </TableRow>

      {rows.map((row) => (
        <ShiftRow
          key={row.shift.id}
          shift={row.shift}
          startsAfterWeeklyRest={row.startsAfterWeeklyRest}
          drivingStatus={row.drivingStatus}
          shiftStatus={row.shiftStatus}
          restStatus={row.restStatus}
          drivingUsageAfter={row.drivingUsageAfter}
          sharedAllowanceUsedAfter={row.sharedAllowanceUsedAfter}
          reducedDailyRest={row.reducedDailyRest}
          extendedShift={row.extendedShift}
          followingRestUsesAllowance={row.followingRestUsesAllowance}
          weeklyRestCompensationCandidates={
            row.weeklyRestCompensationCandidates
          }
          restCompensations={row.restCompensations}
          onAcceptRestCompensation={onAcceptRestCompensation}
          onCancelRestCompensation={onCancelRestCompensation}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {rows.length === 0 && (
        <TableRow>
          <TableCell
            colSpan={6}
            className="h-20 px-card py-card text-center text-sm text-muted-foreground"
          >
            {t('noShiftsThisWeek')}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
