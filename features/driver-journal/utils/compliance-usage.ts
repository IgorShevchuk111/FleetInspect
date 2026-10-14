
import type { Shift } from '@/features/driver-journal/types/driver-journal';

import type { RestCompensation } from '../services/driver-journal';

import {
    calculateShiftMinutes,
    sortShiftsChronologically,
} from './shifts';

const MAX_SHARED_ALLOWANCE = 3;

const MINIMUM_WEEKLY_REST_MINUTES = 24 * 60;

const EXTENDED_DAILY_DRIVING_MINUTES = 9 * 60;

const MAX_EXTENDED_DRIVING_DAYS = 2;

const REGULAR_SHIFT_SPREAD_MINUTES = 13 * 60;

const MAX_SHIFT_SPREAD_MINUTES = 15 * 60;

const REGULAR_DAILY_REST_MINUTES = 11 * 60;

const MINIMUM_REDUCED_DAILY_REST_MINUTES = 9 * 60;

/**
 * Returns the Monday date for the fixed Monday–Sunday week.
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

function hasAcceptedReducedDailyRestCompensation(
    shiftId: string,
    restCompensations: RestCompensation[],
) {
    return restCompensations.some(
        (compensation) =>
            compensation.compensation_shift_id === shiftId &&
            compensation.decision === 'accepted' &&
            Number(compensation.daily_rest_minutes) >=
            MINIMUM_REDUCED_DAILY_REST_MINUTES &&
            Number(compensation.daily_rest_minutes) <
            REGULAR_DAILY_REST_MINUTES,
    );
}

/**
 * Checks whether the rest recorded on this shift is a reduced daily rest.
 *
 * This describes the rest before this shift. When calculating shared
 * allowance usage, that rest is attributed to the preceding shift.
 */
export function usesReducedDailyRestAllowance(
    shift: Shift,
    restCompensations: RestCompensation[] = [],
) {
    const rest = Number(shift.rest) || 0;

    const hasReducedDailyRest =
        shift.restType === 'daily' &&
        rest >= MINIMUM_REDUCED_DAILY_REST_MINUTES &&
        rest < REGULAR_DAILY_REST_MINUTES;

    const hasReducedDailyRestCompensation =
        hasAcceptedReducedDailyRestCompensation(
            shift.id,
            restCompensations,
        );

    return hasReducedDailyRest || hasReducedDailyRestCompensation;
}

function hasExtendedShiftAllowance(shift: Shift) {
    const shiftMinutes = calculateShiftMinutes(shift);

    return (
        shiftMinutes > REGULAR_SHIFT_SPREAD_MINUTES &&
        shiftMinutes <= MAX_SHIFT_SPREAD_MINUTES
    );
}

/**
 * Counts shared allowance usage.
 *
 * A shift consumes at most one use when either:
 * - its shift duration is over 13 hours and no more than 15 hours; or
 * - the rest recorded on the following shift is a reduced daily rest.
 *
 * The rest is stored on the following shift, but its allowance usage
 * belongs to the preceding shift. If both conditions apply, only one
 * use is counted.
 *
 * The counter resets when a shift records a weekly rest of at least
 * 24 hours.
 */
export function buildSharedAllowanceUsage(
    shifts: Shift[],
    restCompensations: RestCompensation[] = [],
): Map<string, number> {
    const sortedShifts = sortShiftsChronologically(shifts);
    const usageByShiftId = new Map<string, number>();

    let allowanceUsed = 0;

    for (let index = 0; index < sortedShifts.length; index += 1) {
        const shift = sortedShifts[index];
        const rest = Number(shift.rest) || 0;

        if (
            shift.restType === 'weekly' &&
            rest >= MINIMUM_WEEKLY_REST_MINUTES
        ) {
            allowanceUsed = 0;
        }

        const followingShift = sortedShifts[index + 1];

        const followingRestUsesAllowance = followingShift
            ? usesReducedDailyRestAllowance(
                followingShift,
                restCompensations,
            )
            : false;

        const currentShiftUsesAllowance =
            hasExtendedShiftAllowance(shift) ||
            followingRestUsesAllowance;

        if (currentShiftUsesAllowance) {
            allowanceUsed += 1;
        }

        usageByShiftId.set(shift.id, allowanceUsed);
    }

    return usageByShiftId;
}

/**
 * Counts extended driving days in each fixed Monday–Sunday week.
 *
 * Any shift with more than 9 hours of driving consumes one day,
 * including a shift that exceeds the 10-hour maximum.
 *
 * This counter is independent of the shared allowance counter.
 */
export function buildExtendedDrivingUsage(
    shifts: Shift[],
): Map<string, number> {
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

        const drivingMinutes = Number(shift.driving) || 0;
        const isExtendedDriving =
            drivingMinutes > EXTENDED_DAILY_DRIVING_MINUTES;

        if (isExtendedDriving) {
            extendedDrivingDaysUsed += 1;
        }

        usageByWeek.set(weekKey, extendedDrivingDaysUsed);
        usageByShiftId.set(shift.id, extendedDrivingDaysUsed);
    }

    return usageByShiftId;
}

export function normalizeDrivingMinutes(value: number) {
    const minutes = Number(value);

    if (!Number.isFinite(minutes)) {
        return 0;
    }

    return Math.round(minutes);
}

export {
    MAX_SHARED_ALLOWANCE,
    MAX_EXTENDED_DRIVING_DAYS,
};
