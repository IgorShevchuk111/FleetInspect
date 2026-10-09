import type { RestCompensation } from '@/features/driver-journal/services/driver-journal';
import type { Shift } from '@/features/driver-journal/types/driver-journal';
import {
    calculateShiftMinutes,
    getShiftsForWeek,
    sortShiftsChronologically,
} from './shifts';

const DAILY_DRIVING_LIMIT = 9 * 60;
const EXTENDED_DAILY_DRIVING_LIMIT = 10 * 60;
const MAX_EXTENDED_DRIVING_DAYS = 2;

const REGULAR_DAILY_REST = 11 * 60;
const REDUCED_DAILY_REST = 9 * 60;
const MAX_REDUCED_DAILY_RESTS = 3;

const REGULAR_WEEKLY_REST = 45 * 60;
const MINIMUM_REDUCED_WEEKLY_REST = 24 * 60;

const REGULAR_SHIFT_SPREAD = 13 * 60;
const MAX_SHIFT_SPREAD = 15 * 60;
const MAX_EXTENDED_SHIFTS = 3;

export function countExtendedDrivingDays(
    shifts: Shift[],
    weekStart?: Date,
): number {
    const relevantShifts = weekStart
        ? getShiftsForWeek(shifts, weekStart)
        : shifts;

    return relevantShifts.filter(
        (shift) =>
            shift.driving > DAILY_DRIVING_LIMIT &&
            shift.driving <= EXTENDED_DAILY_DRIVING_LIMIT,
    ).length;
}

export function countExtendedShifts(
    shifts: Shift[],
    weekStart?: Date,
): number {
    const relevantShifts = weekStart
        ? getShiftsForWeek(shifts, weekStart)
        : shifts;

    return relevantShifts.filter((shift) => {
        const shiftMinutes = calculateShiftMinutes(shift);


        return (
            shiftMinutes > REGULAR_SHIFT_SPREAD &&
            shiftMinutes <= MAX_SHIFT_SPREAD
        );


    }).length;
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
    const shiftMinutes = calculateShiftMinutes(shift);

    const hasReducedDailyRest =
        shift.restType === 'daily' &&
        rest >= REDUCED_DAILY_REST &&
        rest < REGULAR_DAILY_REST;

    const hasExtendedShift =
        shiftMinutes > REGULAR_SHIFT_SPREAD &&
        shiftMinutes <= MAX_SHIFT_SPREAD;

    return hasReducedDailyRest || hasExtendedShift;
}

export function calculateDailyRestCompliance(
    shifts: Shift[],
) {
    const sorted = sortShiftsChronologically(shifts);

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

        if (usesReducedDailyRestAllowance(shift)) {
            reducedUsed += 1;
        }


    }

    return {
        reducedDailyRestUsed: reducedUsed,
        reducedDailyRestRemaining: Math.max(
            0,
            MAX_REDUCED_DAILY_RESTS - reducedUsed,
        ),
    };
}

export function getWeeklyRestStatus(
    restMinutes: number,
): 'regular' | 'reduced' | 'invalid' {
    if (restMinutes >= REGULAR_WEEKLY_REST) {
        return 'regular';
    }

    if (restMinutes >= MINIMUM_REDUCED_WEEKLY_REST) {
        return 'reduced';
    }

    return 'invalid';
}

export function calculateWeeklyRestCompliance(
    shifts: Shift[],
    compensations: RestCompensation[] = [],
) {
    const weeklyRestShifts = sortShiftsChronologically(shifts).filter(
        (shift) => shift.restType === 'weekly',
    );

    let reducedWeeklyRestUsed = 0;
    let totalCompensationOwed = 0;

    for (const shift of weeklyRestShifts) {
        const status = getWeeklyRestStatus(shift.rest);


        if (status !== 'reduced') {
            continue;
        }

        reducedWeeklyRestUsed += 1;

        const compensationOwed = Math.max(
            0,
            REGULAR_WEEKLY_REST - shift.rest,
        );

        const compensationTaken = compensations
            .filter(
                (compensation) =>
                    compensation.reduced_weekly_rest_shift_id === shift.id &&
                    compensation.decision === 'accepted',
            )
            .reduce(
                (total, compensation) =>
                    total +
                    Math.max(
                        0,
                        Number(compensation.compensation_minutes) || 0,
                    ),
                0,
            );

        totalCompensationOwed += Math.max(
            0,
            compensationOwed - compensationTaken,
        );


    }

    return {
        reducedWeeklyRestUsed,
        compensationOwed: totalCompensationOwed,
    };
}

export {
    MAX_EXTENDED_DRIVING_DAYS,
    MAX_EXTENDED_SHIFTS,
};
