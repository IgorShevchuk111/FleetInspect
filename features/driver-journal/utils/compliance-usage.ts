import type { Shift } from '@/features/driver-journal/types/driver-journal';

import type { RestCompensation } from '../services/driver-journal';

import {
    calculateShiftMinutes,
    sortShiftsChronologically,
} from './shifts';

const MAX_SHARED_ALLOWANCE = 3;
const MAX_EXTENDED_SHIFTS = 3;

const MINIMUM_WEEKLY_REST_MINUTES = 24 * 60;

const EXTENDED_DAILY_DRIVING_MINUTES = 9 * 60;

const MAX_EXTENDED_DRIVING_DAYS = 2;

const REGULAR_SHIFT_SPREAD_MINUTES = 13 * 60;

const MAX_SHIFT_SPREAD_MINUTES = 15 * 60;

const REGULAR_DAILY_REST_MINUTES = 11 * 60;

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
            Number(compensation.daily_rest_minutes) >= 9 * 60 &&
            Number(compensation.daily_rest_minutes) <
            REGULAR_DAILY_REST_MINUTES,
    );
}

function usesSharedAllowance(
    shift: Shift,
    restCompensations: RestCompensation[] = [],
) {
    const rest = Number(shift.rest) || 0;

    const hasReducedDailyRest =
        shift.restType === 'daily' &&
        rest >= 9 * 60 &&
        rest < REGULAR_DAILY_REST_MINUTES;

    const hasReducedDailyRestCompensation =
        hasAcceptedReducedDailyRestCompensation(
            shift.id,
            restCompensations,
        );

    return (
        hasReducedDailyRest ||
        hasReducedDailyRestCompensation
    );
}

/**
 * Counts reduced daily rests.
 *
 * The allowance resets after a qualifying weekly rest.
 *
 * Extended shifts are deliberately NOT included here.
 */
export function buildSharedAllowanceUsage(
    shifts: Shift[],
    restCompensations: RestCompensation[] = [],
): Map<string, number> {
    const sortedShifts = sortShiftsChronologically(shifts);

    const usageByShiftId = new Map<string, number>();

    let allowanceUsed = 0;

    for (const shift of sortedShifts) {
        const rest = Number(shift.rest) || 0;

        if (
            shift.restType === 'weekly' &&
            rest >= MINIMUM_WEEKLY_REST_MINUTES
        ) {
            allowanceUsed = 0;

            usageByShiftId.set(
                shift.id,
                allowanceUsed,
            );

            continue;
        }

        if (
            usesSharedAllowance(
                shift,
                restCompensations,
            )
        ) {
            allowanceUsed += 1;
        }

        usageByShiftId.set(
            shift.id,
            allowanceUsed,
        );
    }

    return usageByShiftId;
}

/**
 * Counts extended driving days in each fixed week.
 *
 * Fixed week:
 * Monday 00:00 -> Sunday 24:00.
 *
 * Any shift over 9 hours of driving consumes
 * one extended-driving day allowance for display,
 * including a shift already over the 10-hour maximum.
 *
 * Examples:
 *
 * 10h45 -> 1/2
 * 9h04  -> 2/2
 *
 * The counter resets on Monday.
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

        let extendedDrivingDaysUsed =
            usageByWeek.get(weekKey) ?? 0;

        const drivingMinutes =
            Number(shift.driving) || 0;

        const isExtendedDriving =
            drivingMinutes > EXTENDED_DAILY_DRIVING_MINUTES;

        if (isExtendedDriving) {
            extendedDrivingDaysUsed += 1;
        }

        usageByWeek.set(
            weekKey,
            extendedDrivingDaysUsed,
        );

        usageByShiftId.set(
            shift.id,
            extendedDrivingDaysUsed,
        );
    }

    return usageByShiftId;
}

/**
 * Counts actual extended shifts.
 *
 * Extended shift:
 * >13h and <=15h.
 *
 * Maximum:
 * 3 extended shifts between qualifying weekly rests.
 *
 * The counter resets after a qualifying weekly rest.
 *
 * This counter is deliberately separate from
 * the reduced daily rest allowance.
 */
export function buildExtendedShiftUsage(
    shifts: Shift[],
): Map<string, number> {
    const sortedShifts = sortShiftsChronologically(shifts);

    const usageByShiftId = new Map<string, number>();

    let extendedShiftsUsed = 0;

    for (const shift of sortedShifts) {
        const rest = Number(shift.rest) || 0;

        if (
            shift.restType === 'weekly' &&
            rest >= MINIMUM_WEEKLY_REST_MINUTES
        ) {
            extendedShiftsUsed = 0;

            usageByShiftId.set(
                shift.id,
                extendedShiftsUsed,
            );

            continue;
        }

        const shiftMinutes =
            calculateShiftMinutes(shift);

        const isExtendedShift =
            shiftMinutes > REGULAR_SHIFT_SPREAD_MINUTES &&
            shiftMinutes <= MAX_SHIFT_SPREAD_MINUTES;

        if (isExtendedShift) {
            extendedShiftsUsed += 1;
        }

        usageByShiftId.set(
            shift.id,
            extendedShiftsUsed,
        );
    }

    return usageByShiftId;
}

export function normalizeDrivingMinutes(
    value: number,
) {
    const minutes = Number(value);

    if (!Number.isFinite(minutes)) {
        return 0;
    }

    return Math.round(minutes);
}

export {
    MAX_SHARED_ALLOWANCE,
    MAX_EXTENDED_SHIFTS,
    MAX_EXTENDED_DRIVING_DAYS,
};