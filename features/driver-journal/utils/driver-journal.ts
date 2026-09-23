
import type {
    DurationInput,
    JournalTotals,
    Shift,
} from '@/features/driver-journal/types/ driver-journal';

const DAILY_DRIVING_LIMIT = 9 * 60;
const EXTENDED_DAILY_DRIVING_LIMIT = 10 * 60;
const WEEKLY_DRIVING_LIMIT = 56 * 60;
const TWO_WEEK_DRIVING_LIMIT = 90 * 60;
const MAX_EXTENDED_DRIVING_DAYS = 2;

const REGULAR_DAILY_REST = 11 * 60;
const REDUCED_DAILY_REST = 9 * 60;
const MAX_REDUCED_DAILY_RESTS = 3;

const REGULAR_WEEKLY_REST = 45 * 60;
const MINIMUM_REDUCED_WEEKLY_REST = 24 * 60;

const REGULAR_SHIFT_SPREAD = 13 * 60;
const MAX_SHIFT_SPREAD = 15 * 60;

export type RestStatus =
    | 'daily-invalid'
    | 'daily-reduced'
    | 'daily-full'
    | 'weekly-invalid'
    | 'weekly-reduced'
    | 'weekly-full';

export function durationToMinutes(duration: DurationInput): number;
export function durationToMinutes(
    hours: number,
    minutes: number,
): number;
export function durationToMinutes(
    value: DurationInput | number,
    minutes = 0,
): number {
    if (typeof value === 'object') {
        return value.hours * 60 + value.minutes;
    }

    return value * 60 + minutes;
}

export function minutesToDuration(totalMinutes: number) {
    const minutes = Math.max(0, Math.round(totalMinutes));

    return {
        hours: Math.floor(minutes / 60),
        minutes: minutes % 60,
    };
}

export function formatDuration(totalMinutes: number): string {
    const minutes = Math.max(0, Math.round(totalMinutes));

    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function getStartOfWeek(date: Date): Date {
    const result = new Date(date);

    result.setHours(0, 0, 0, 0);

    const day = result.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + diff);

    return result;
}

export function getEndOfWeek(date: Date): Date {
    const result = getStartOfWeek(date);

    result.setDate(result.getDate() + 6);
    result.setHours(23, 59, 59, 999);

    return result;
}

export function formatWeek(date: Date): string {
    return `${formatDate(getStartOfWeek(date))} – ${formatDate(
        getEndOfWeek(date),
    )}`;
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export function parseDateTime(
    date: string,
    time: string,
    endDate?: string,
): Date {
    const actualDate = endDate || date;

    if (!actualDate || !time) {
        return new Date(NaN);
    }

    const [year, month, day] = actualDate.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    if (
        !Number.isFinite(year) ||
        !Number.isFinite(month) ||
        !Number.isFinite(day) ||
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes)
    ) {
        return new Date(NaN);
    }

    return new Date(
        year,
        month - 1,
        day,
        hours,
        minutes,
    );
}

export function calculateShiftMinutes(shift: Shift): number;

export function calculateShiftMinutes(
    date: string,
    start: string,
    endDate: string,
    end: string,
): number;

export function calculateShiftMinutes(
    shiftOrDate: Shift | string,
    start?: string,
    endDate?: string,
    end?: string,
): number {
    const date =
        typeof shiftOrDate === 'object'
            ? shiftOrDate.date
            : shiftOrDate;

    const startTime =
        typeof shiftOrDate === 'object'
            ? shiftOrDate.start
            : start ?? '';

    const actualEndDate =
        typeof shiftOrDate === 'object'
            ? shiftOrDate.endDate || shiftOrDate.date
            : endDate || date;

    const endTime =
        typeof shiftOrDate === 'object'
            ? shiftOrDate.end
            : end ?? '';

    if (
        !date ||
        !startTime ||
        !actualEndDate ||
        !endTime
    ) {
        return 0;
    }

    const startDateTime = parseDateTime(
        date,
        startTime,
    );

    const endDateTime = parseDateTime(
        date,
        endTime,
        actualEndDate,
    );

    if (
        Number.isNaN(startDateTime.getTime()) ||
        Number.isNaN(endDateTime.getTime())
    ) {
        return 0;
    }

    let difference =
        endDateTime.getTime() -
        startDateTime.getTime();

    if (difference < 0) {
        difference += 24 * 60 * 60 * 1000;
    }

    return Math.round(difference / 60000);
}

export function calculateWorkingMinutes(
    shift: Shift,
): number {
    return Math.max(
        0,
        shift.shift - shift.break,
    );
}

export function calculateShiftTotals(
    shifts: Shift[],
): JournalTotals {
    return shifts.reduce(
        (totals, shift) => {
            totals.driving += shift.driving;
            totals.shift += shift.shift;
            totals.break += shift.break;
            totals.rest += shift.rest;
            totals.working +=
                calculateWorkingMinutes(shift);
            totals.earn += shift.earn;

            return totals;
        },
        {
            driving: 0,
            shift: 0,
            break: 0,
            rest: 0,
            working: 0,
            earn: 0,
        },
    );
}

export function isSameWeek(
    dateA: Date,
    dateB: Date,
): boolean {
    return (
        getStartOfWeek(dateA).getTime() ===
        getStartOfWeek(dateB).getTime()
    );
}

export function getShiftsForWeek(
    shifts: Shift[],
    weekStart: Date,
): Shift[] {
    const start = getStartOfWeek(weekStart);
    const end = getEndOfWeek(weekStart);

    return shifts.filter((shift) => {
        if (!shift.date) {
            return false;
        }

        const date = new Date(
            `${shift.date}T00:00:00`,
        );

        return date >= start && date <= end;
    });
}

function sortShiftsChronologically(
    shifts: Shift[],
): Shift[] {
    return [...shifts].sort((a, b) => {
        const dateA = parseDateTime(
            a.date,
            a.start,
        );

        const dateB = parseDateTime(
            b.date,
            b.start,
        );

        return (
            dateA.getTime() -
            dateB.getTime()
        );
    });
}

export function getRestStatus(
    shift: Shift,
): RestStatus {
    const rest = Number(shift.rest) || 0;

    if (shift.restType === 'weekly') {
        if (
            rest >= REGULAR_WEEKLY_REST
        ) {
            return 'weekly-full';
        }

        if (
            rest >= MINIMUM_REDUCED_WEEKLY_REST
        ) {
            return 'weekly-reduced';
        }

        return 'weekly-invalid';
    }

    if (
        rest >= REGULAR_DAILY_REST
    ) {
        return 'daily-full';
    }

    if (
        rest >= REDUCED_DAILY_REST
    ) {
        return 'daily-reduced';
    }

    return 'daily-invalid';
}

export function countExtendedDrivingDays(
    shifts: Shift[],
    weekStart?: Date,
): number {
    const relevantShifts = weekStart
        ? getShiftsForWeek(
            shifts,
            weekStart,
        )
        : shifts;

    return relevantShifts.filter(
        (shift) =>
            shift.driving >
            DAILY_DRIVING_LIMIT &&
            shift.driving <=
            EXTENDED_DAILY_DRIVING_LIMIT,
    ).length;
}

/**
 * A shift over 13 hours requires reduced daily rest
 * in order to remain within the 15-hour maximum spread.
 *
 * A reduced daily rest is also any daily rest from
 * 9 hours up to, but not including, 11 hours.
 *
 * Both situations use the SAME allowance.
 *
 * If both apply to the same shift, they count only once.
 */
function usesReducedDailyRestAllowance(
    shift: Shift,
): boolean {
    const rest = Number(shift.rest) || 0;

    const shiftMinutes =
        calculateShiftMinutes(shift);

    const hasReducedDailyRest =
        shift.restType === 'daily' &&
        rest >= REDUCED_DAILY_REST &&
        rest < REGULAR_DAILY_REST;

    const hasExtendedShift =
        shiftMinutes > REGULAR_SHIFT_SPREAD &&
        shiftMinutes <= MAX_SHIFT_SPREAD;

    return (
        hasReducedDailyRest ||
        hasExtendedShift
    );
}

export function calculateDailyRestCompliance(
    shifts: Shift[],
) {
    const sorted =
        sortShiftsChronologically(shifts);

    let reducedUsed = 0;

    for (const shift of sorted) {
        const rest = Number(shift.rest) || 0;

        if (
            shift.restType === 'weekly' &&
            rest >= MINIMUM_REDUCED_WEEKLY_REST
        ) {
            reducedUsed = 0;
            continue;
        }

        if (
            usesReducedDailyRestAllowance(
                shift,
            )
        ) {
            reducedUsed += 1;
        }
    }

    return {
        reducedDailyRestUsed:
            reducedUsed,

        reducedDailyRestRemaining:
            Math.max(
                0,
                MAX_REDUCED_DAILY_RESTS -
                reducedUsed,
            ),
    };
}

export function calculateReducedDailyRestRemaining(
    shifts: Shift[],
): number {
    return calculateDailyRestCompliance(
        shifts,
    ).reducedDailyRestRemaining;
}

export function getWeeklyRestStatus(
    restMinutes: number,
): 'regular' | 'reduced' | 'invalid' {
    if (
        restMinutes >= REGULAR_WEEKLY_REST
    ) {
        return 'regular';
    }

    if (
        restMinutes >= MINIMUM_REDUCED_WEEKLY_REST
    ) {
        return 'reduced';
    }

    return 'invalid';
}

export function calculateWeeklyRestCompliance(
    shifts: Shift[],
) {
    const weeklyRestShifts =
        sortShiftsChronologically(
            shifts,
        ).filter(
            (shift) =>
                shift.restType === 'weekly',
        );

    let reducedWeeklyRestUsed = 0;
    let compensationOwed = 0;

    for (const shift of weeklyRestShifts) {
        const status =
            getWeeklyRestStatus(shift.rest);

        if (status === 'reduced') {
            reducedWeeklyRestUsed += 1;

            compensationOwed += Math.max(
                0,
                REGULAR_WEEKLY_REST -
                shift.rest,
            );
        }
    }

    return {
        reducedWeeklyRestUsed,
        compensationOwed,
    };
}

function getWeeklyDriving(
    shifts: Shift[],
    weekStart: Date,
): number {
    return getShiftsForWeek(
        shifts,
        weekStart,
    ).reduce(
        (total, shift) =>
            total + shift.driving,
        0,
    );
}

function calculate17WeekAverageWorking(
    shifts: Shift[],
    weekStart: Date,
): number {
    let totalWorking = 0;

    for (
        let index = 0;
        index < 17;
        index += 1
    ) {
        const start =
            getStartOfWeek(weekStart);

        start.setDate(
            start.getDate() -
            index * 7,
        );

        const weekShifts =
            getShiftsForWeek(
                shifts,
                start,
            );

        totalWorking +=
            weekShifts.reduce(
                (total, shift) =>
                    total +
                    calculateWorkingMinutes(
                        shift,
                    ),
                0,
            );
    }

    return totalWorking / 17;
}

function calculateAnnualEarned(
    shifts: Shift[],
    weekEnd: Date,
): number {
    const year =
        weekEnd.getFullYear();

    return shifts.reduce(
        (total, shift) => {
            if (!shift.date) {
                return total;
            }

            const date = new Date(
                `${shift.date}T00:00:00`,
            );

            if (
                date.getFullYear() !== year
            ) {
                return total;
            }

            return total + shift.earn;
        },
        0,
    );
}

export function calculateWeeklySummary(
    shifts: Shift[],
    weekStart: Date,
) {
    const currentWeekStart =
        getStartOfWeek(weekStart);

    const currentWeekShifts =
        getShiftsForWeek(
            shifts,
            currentWeekStart,
        );

    const currentTotals =
        calculateShiftTotals(
            currentWeekShifts,
        );

    const previousWeekStart =
        new Date(
            currentWeekStart,
        );

    previousWeekStart.setDate(
        previousWeekStart.getDate() -
        7,
    );

    const previousWeekDriving =
        getWeeklyDriving(
            shifts,
            previousWeekStart,
        );

    const twoWeekDriving =
        currentTotals.driving +
        previousWeekDriving;

    const extendedDrivingDaysUsed =
        countExtendedDrivingDays(
            shifts,
            currentWeekStart,
        );

    const dailyRestCompliance =
        calculateDailyRestCompliance(
            shifts,
        );

    const weeklyRestCompliance =
        calculateWeeklyRestCompliance(
            shifts,
        );

    const currentWeekEnd =
        getEndOfWeek(
            currentWeekStart,
        );

    return {
        ...currentTotals,

        twoWeekDriving,

        weeklyDrivingRemaining:
            Math.max(
                0,
                WEEKLY_DRIVING_LIMIT -
                currentTotals.driving,
            ),

        twoWeekDrivingRemaining:
            Math.max(
                0,
                TWO_WEEK_DRIVING_LIMIT -
                twoWeekDriving,
            ),

        extendedDrivingDaysUsed,

        extendedDrivingDaysRemaining:
            Math.max(
                0,
                MAX_EXTENDED_DRIVING_DAYS -
                extendedDrivingDaysUsed,
            ),

        reducedDailyRestUsed:
            dailyRestCompliance.reducedDailyRestUsed,

        reducedDailyRestRemaining:
            dailyRestCompliance.reducedDailyRestRemaining,

        // Kept for compatibility with WeeklySummaryData.
        extendedSpreadUsed: 0,

        extendedSpreadDaysRemaining:
            dailyRestCompliance.reducedDailyRestRemaining,

        average17WeekWorking:
            calculate17WeekAverageWorking(
                shifts,
                currentWeekStart,
            ),

        annualEarned:
            calculateAnnualEarned(
                shifts,
                currentWeekEnd,
            ),

        reducedWeeklyRestUsed:
            weeklyRestCompliance.reducedWeeklyRestUsed,

        compensationOwed:
            weeklyRestCompliance.compensationOwed,
    };
}
