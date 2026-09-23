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

import {
  calculateShiftMinutes,
  calculateWeeklySummary,
  formatDuration,
  formatWeek,
} from '../utils/driver-journal';

import {
  getDrivingStatus,
  getRestStatus,
  getShiftStatus,
  hasExtendedShift,
  isReducedDailyRest,
} from './shift-status';

import { WeeklySummary } from './weekly-summary';

const REGULAR_SHIFT_SPREAD_MINUTES = 13 * 60;
const MAX_SHIFT_SPREAD_MINUTES = 15 * 60;
const MAX_SHARED_ALLOWANCE = 3;

const EXTENDED_DAILY_DRIVING_MINUTES = 9 * 60;
const MAX_DAILY_DRIVING_MINUTES = 10 * 60;
const MAX_EXTENDED_DRIVING_DAYS = 2;

const MINIMUM_WEEKLY_REST_MINUTES = 24 * 60;

type WeeklyShiftSectionProps = {
  weekStart: Date;
  shifts: Shift[];
  allShifts: Shift[];
  onEdit: (shift: Shift) => void;
};

function sortShiftsChronologically(shifts: Shift[]) {
  return [...shifts].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.start}`).getTime();
    const dateB = new Date(`${b.date}T${b.start}`).getTime();

    return dateA - dateB;
  });
}

/**
 * Returns the fixed Monday-Sunday week key.
 */
function getFixedWeekKey(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  date.setDate(date.getDate() + mondayOffset);

  return date.toISOString().slice(0, 10);
}

/**
 * Driving values should be whole minutes.
 *
 * Rounding here prevents values such as 600.0001
 * from being treated as more than 10 hours.
 */
function normalizeDrivingMinutes(value: number) {
  const minutes = Number(value);

  if (!Number.isFinite(minutes)) {
    return 0;
  }

  return Math.round(minutes);
}

function usesSharedAllowance(shift: Shift) {
  const rest = Number(shift.rest) || 0;

  const shiftMinutes = calculateShiftMinutes(
    shift.date,
    shift.start,
    shift.endDate || shift.date,
    shift.end,
  );

  const hasReducedDailyRest =
    shift.restType === 'daily' && rest >= 9 * 60 && rest < 11 * 60;

  const hasExtendedShift =
    shiftMinutes > REGULAR_SHIFT_SPREAD_MINUTES &&
    shiftMinutes <= MAX_SHIFT_SPREAD_MINUTES;

  return hasReducedDailyRest || hasExtendedShift;
}

function buildSharedAllowanceUsage(shifts: Shift[]) {
  const sortedShifts = sortShiftsChronologically(shifts);
  const usageByShiftId = new Map<string, number>();

  let allowanceUsed = 0;

  for (const shift of sortedShifts) {
    const rest = Number(shift.rest) || 0;

    /**
     * A valid weekly rest resets the shared
     * reduced-daily-rest / extended-shift allowance.
     */
    if (shift.restType === 'weekly' && rest >= MINIMUM_WEEKLY_REST_MINUTES) {
      allowanceUsed = 0;
      usageByShiftId.set(shift.id, allowanceUsed);
      continue;
    }

    if (usesSharedAllowance(shift)) {
      allowanceUsed += 1;
    }

    usageByShiftId.set(shift.id, allowanceUsed);
  }

  return usageByShiftId;
}

/**
 * Extended daily driving:
 *
 * - >9h and <=10h = one extended-driving allowance
 * - Maximum 2 per fixed Monday-Sunday week
 * - Counter resets every Monday
 * - Counter is intentionally NOT capped:
 *   1/2, 2/2, 3/2, 4/2...
 */
function buildExtendedDrivingUsage(shifts: Shift[]) {
  const sortedShifts = sortShiftsChronologically(shifts);
  const usageByShiftId = new Map<string, number>();
  const usageByWeek = new Map<string, number>();

  for (const shift of sortedShifts) {
    const weekKey = getFixedWeekKey(shift.date);

    if (!weekKey) {
      usageByShiftId.set(shift.id, 0);
      continue;
    }

    let extendedDrivingDaysUsed = usageByWeek.get(weekKey) ?? 0;

    const drivingMinutes = normalizeDrivingMinutes(shift.driving);

    const isExtendedDriving =
      drivingMinutes > EXTENDED_DAILY_DRIVING_MINUTES &&
      drivingMinutes <= MAX_DAILY_DRIVING_MINUTES;

    if (isExtendedDriving) {
      extendedDrivingDaysUsed += 1;
    }

    usageByWeek.set(weekKey, extendedDrivingDaysUsed);
    usageByShiftId.set(shift.id, extendedDrivingDaysUsed);
  }

  return usageByShiftId;
}

/**
 * Compact date for the journal table.
 *
 * Example:
 * 17/09
 *
 * The year is intentionally omitted because
 * the week header already identifies the year.
 */
function formatShiftDate(date: string, time: string) {
  if (!date) {
    return time || '—';
  }

  const dateTime = new Date(`${date}T${time || '00:00'}`);

  if (Number.isNaN(dateTime.getTime())) {
    return `${date} ${time || ''}`.trim();
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
  }).format(dateTime);
}

/**
 * Time is displayed as HH:mm only.
 * No seconds.
 */
function formatTime(time: string) {
  if (!time) {
    return '—';
  }

  return time.slice(0, 5);
}

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

  /**
   * Driving allowance is calculated only from this
   * fixed Monday-Sunday week.
   */
  const extendedDrivingUsage = buildExtendedDrivingUsage(shifts);

  return (
    <Card className="rounded-none border-0 shadow-none sm:rounded-xl sm:border sm:shadow-sm">
      <CardHeader className="px-0 py-3 sm:px-6 sm:py-6">
        <CardTitle className="text-base sm:text-lg">
          {formatWeek(weekStart)}
        </CardTitle>

        <CardDescription className="text-xs sm:text-sm">
          {shifts.length} {shifts.length === 1 ? 'shift' : 'shifts'}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 pb-3 sm:px-6 sm:pb-6">
        <div className="overflow-x-auto">
          <Table className="min-w-[429px] text-[10px] sm:min-w-[850px] sm:text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-30 w-[38px] min-w-[38px] bg-background px-0.5 py-1.5 text-[9px] shadow-[2px_0_3px_-2px_rgba(0,0,0,0.25)] sm:w-[110px] sm:min-w-[110px] sm:px-4 sm:py-2 sm:text-sm">
                  Start
                </TableHead>

                <TableHead className="w-[58px] min-w-[58px] px-0.5 py-1.5 text-[9px] sm:w-[110px] sm:min-w-[110px] sm:px-4 sm:py-2 sm:text-sm">
                  Driving
                </TableHead>

                <TableHead className="w-[55px] min-w-[55px] px-0.5 py-1.5 text-[9px] sm:w-[110px] sm:min-w-[110px] sm:px-4 sm:py-2 sm:text-sm">
                  Shift
                </TableHead>

                <TableHead className="w-[32px] min-w-[32px] px-0.5 py-1.5 text-[9px] sm:w-[90px] sm:min-w-[90px] sm:px-4 sm:py-2 sm:text-sm">
                  Break
                </TableHead>

                <TableHead className="w-[64px] min-w-[64px] px-0.5 py-1.5 text-[9px] sm:w-[120px] sm:min-w-[120px] sm:px-4 sm:py-2 sm:text-sm">
                  Rest
                </TableHead>

                <TableHead className="w-[45px] min-w-[45px] px-0.5 py-1.5 text-[9px] sm:w-[100px] sm:min-w-[100px] sm:px-4 sm:py-2 sm:text-sm">
                  Earn
                </TableHead>

                <TableHead className="w-[45px] min-w-[45px] px-0.5 py-1.5 text-[9px] sm:w-[120px] sm:min-w-[120px] sm:px-4 sm:py-2 sm:text-sm">
                  Working
                </TableHead>

                <TableHead className="sticky right-0 z-30 w-[38px] min-w-[38px] bg-background px-0.5 py-1.5 text-[9px] shadow-[-2px_0_3px_-2px_rgba(0,0,0,0.25)] sm:w-[110px] sm:min-w-[110px] sm:px-4 sm:py-2 sm:text-sm">
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

                const workingMinutes = Math.max(
                  0,
                  shiftMinutes - (Number(shift.break) || 0),
                );

                const sharedAllowanceUsedAfter =
                  sharedAllowanceUsage.get(shift.id) ?? 0;

                const currentShiftUsesAllowance = usesSharedAllowance(shift);

                const sharedAllowanceUsedBefore = Math.max(
                  0,
                  sharedAllowanceUsedAfter -
                    (currentShiftUsesAllowance ? 1 : 0),
                );

                const sharedAllowanceRemaining = Math.max(
                  0,
                  MAX_SHARED_ALLOWANCE - sharedAllowanceUsedAfter,
                );

                const restMinutes = Number(shift.rest) || 0;

                const reducedDailyRest = isReducedDailyRest(shift);

                const extendedShift = hasExtendedShift(shift);

                const allowanceNotAllowed =
                  currentShiftUsesAllowance &&
                  sharedAllowanceUsedBefore >= MAX_SHARED_ALLOWANCE;

                const drivingMinutes = normalizeDrivingMinutes(shift.driving);

                const drivingUsageAfter =
                  extendedDrivingUsage.get(shift.id) ?? 0;

                const extendedDriving =
                  drivingMinutes > EXTENDED_DAILY_DRIVING_MINUTES &&
                  drivingMinutes <= MAX_DAILY_DRIVING_MINUTES;

                const drivingUsageBefore = Math.max(
                  0,
                  drivingUsageAfter - (extendedDriving ? 1 : 0),
                );

                const drivingDaysRemaining = Math.max(
                  0,
                  MAX_EXTENDED_DRIVING_DAYS - drivingUsageAfter,
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
                  <TableRow
                    key={shift.id}
                    className="cursor-pointer"
                    onClick={() => onEdit(shift)}
                  >
                    <TableCell className="sticky left-0 z-20 w-[38px] min-w-[38px] bg-background px-0.5 py-1.5 shadow-[2px_0_3px_-2px_rgba(0,0,0,0.25)] sm:w-[110px] sm:min-w-[110px] sm:px-4 sm:py-2">
                      <div className="font-medium text-[10px] leading-tight sm:text-sm">
                        {formatShiftDate(shift.date, shift.start)}
                      </div>

                      <div className="text-[9px] text-muted-foreground sm:text-xs">
                        {formatTime(shift.start)}
                      </div>
                    </TableCell>

                    <TableCell className="w-[58px] min-w-[58px] px-0.5 py-1.5 text-[10px] sm:w-[110px] sm:min-w-[110px] sm:px-4 sm:py-2 sm:text-sm">
                      <div>{formatDuration(drivingMinutes)}</div>

                      {drivingStatus && (
                        <div
                          className={`mt-0.5 text-[8px] font-medium leading-tight sm:text-[10px] ${drivingStatus.className}`}
                        >
                          {drivingStatus.label}
                        </div>
                      )}

                      {drivingStatus?.showCounter && (
                        <div
                          className={`mt-0.5 text-[8px] font-medium leading-tight sm:text-[10px] ${
                            drivingStatus.notAllowed
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-orange-600 dark:text-orange-400'
                          }`}
                        >
                          {drivingUsageAfter}/2 used · {drivingDaysRemaining}{' '}
                          left
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="w-[55px] min-w-[55px] px-0.5 py-1.5 text-[10px] sm:w-[110px] sm:min-w-[110px] sm:px-4 sm:py-2 sm:text-sm">
                      <div>{formatDuration(shiftMinutes)}</div>

                      <div
                        className={`mt-0.5 text-[8px] font-medium leading-tight sm:text-[10px] ${shiftStatus.className}`}
                      >
                        {shiftStatus.label}
                      </div>
                    </TableCell>

                    <TableCell className="w-[32px] min-w-[32px] px-0.5 py-1.5 text-[10px] sm:w-[90px] sm:min-w-[90px] sm:px-4 sm:py-2 sm:text-sm">
                      {formatDuration(shift.break)}
                    </TableCell>

                    <TableCell className="w-[64px] min-w-[64px] px-0.5 py-1.5 text-[10px] sm:w-[120px] sm:min-w-[120px] sm:px-4 sm:py-2 sm:text-sm">
                      <div>{formatDuration(shift.rest)}</div>

                      {reducedDailyRest && (
                        <>
                          <div
                            className={`mt-0.5 text-[8px] font-medium leading-tight sm:text-[10px] ${
                              allowanceNotAllowed
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-orange-600 dark:text-orange-400'
                            }`}
                          >
                            {allowanceNotAllowed
                              ? 'Reduced daily rest · Not allowed'
                              : 'Reduced daily rest'}
                          </div>

                          <div
                            className={`mt-0.5 text-[8px] font-medium leading-tight sm:text-[10px] ${
                              allowanceNotAllowed
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-orange-600 dark:text-orange-400'
                            }`}
                          >
                            {sharedAllowanceUsedAfter}/3 used ·{' '}
                            {sharedAllowanceRemaining} left
                          </div>
                        </>
                      )}

                      {!reducedDailyRest && extendedShift && (
                        <>
                          <div
                            className={`mt-0.5 text-[8px] font-medium leading-tight sm:text-[10px] ${
                              allowanceNotAllowed
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-orange-600 dark:text-orange-400'
                            }`}
                          >
                            {allowanceNotAllowed
                              ? 'Extended shift · Not allowed'
                              : 'Extended shift'}
                          </div>

                          <div
                            className={`mt-0.5 text-[8px] font-medium leading-tight sm:text-[10px] ${
                              allowanceNotAllowed
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-orange-600 dark:text-orange-400'
                            }`}
                          >
                            {sharedAllowanceUsedAfter}/3 used ·{' '}
                            {sharedAllowanceRemaining} left
                          </div>
                        </>
                      )}

                      {!reducedDailyRest &&
                        !extendedShift &&
                        shift.restType !== 'weekly' && (
                          <div
                            className={`mt-0.5 text-[8px] font-medium leading-tight sm:text-[10px] ${restStatus.className}`}
                          >
                            {restStatus.label}
                          </div>
                        )}

                      {shift.restType === 'weekly' && (
                        <div
                          className={`mt-0.5 text-[8px] font-medium leading-tight sm:text-[10px] ${restStatus.className}`}
                        >
                          {restStatus.label}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="w-[45px] min-w-[45px] px-0.5 py-1.5 text-[10px] sm:w-[100px] sm:min-w-[100px] sm:px-4 sm:py-2 sm:text-sm">
                      £{Number(shift.earn).toFixed(2)}
                    </TableCell>

                    <TableCell className="w-[45px] min-w-[45px] px-0.5 py-1.5 text-[10px] sm:w-[120px] sm:min-w-[120px] sm:px-4 sm:py-2 sm:text-sm">
                      {formatDuration(workingMinutes)}
                    </TableCell>

                    <TableCell className="sticky right-0 z-20 w-[38px] min-w-[38px] bg-background px-0.5 py-1.5 shadow-[-2px_0_3px_-2px_rgba(0,0,0,0.25)] sm:w-[110px] sm:min-w-[110px] sm:px-4 sm:py-2">
                      <div className="text-[10px] leading-tight sm:text-sm">
                        {formatShiftDate(
                          shift.endDate || shift.date,
                          shift.end,
                        )}
                      </div>

                      <div className="text-[9px] text-muted-foreground sm:text-xs">
                        {formatTime(shift.end)}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {sortedShifts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-20 px-1 py-2 text-center text-muted-foreground sm:h-24"
                  >
                    No shifts this week.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 sm:mt-6">
          <WeeklySummary weekStart={weekStart} summary={weeklySummary} />
        </div>
      </CardContent>
    </Card>
  );
}
