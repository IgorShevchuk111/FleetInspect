import type { Shift } from '@/features/driver-journal/types/ driver-journal';

import { calculateShiftMinutes, sortShiftsChronologically } from './shifts';

const MAX_SHARED_ALLOWANCE = 3;
const MINIMUM_WEEKLY_REST_MINUTES = 24 * 60;

const EXTENDED_DAILY_DRIVING_MINUTES = 9 * 60;
const MAX_DAILY_DRIVING_MINUTES = 10 * 60;
const MAX_EXTENDED_DRIVING_DAYS = 2;

const REGULAR_SHIFT_SPREAD_MINUTES = 13 * 60;
const MAX_SHIFT_SPREAD_MINUTES = 15 * 60;

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

function usesSharedAllowance(shift: Shift) {
    const rest = Number(shift.rest) || 0;

    const shiftMinutes = calculateShiftMinutes(shift);

    const hasReducedDailyRest =
        shift.restType === 'daily' &&
        rest >= 9 * 60 &&
        rest < 11 * 60;

    const hasExtendedShift =
        shiftMinutes > REGULAR_SHIFT_SPREAD_MINUTES &&
        shiftMinutes <= MAX_SHIFT_SPREAD_MINUTES;

    return hasReducedDailyRest || hasExtendedShift;
}

export function buildSharedAllowanceUsage(
    shifts: Shift[],
): Map<string, number> {
    const sortedShifts =
        sortShiftsChronologically(shifts);

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

        if (usesSharedAllowance(shift)) {
            allowanceUsed += 1;
        }

        usageByShiftId.set(
            shift.id,
            allowanceUsed,
        );
    }

    return usageByShiftId;
}

export function buildExtendedDrivingUsage(
    shifts: Shift[],
): Map<string, number> {
    const sortedShifts =
        sortShiftsChronologically(shifts);

    const usageByShiftId = new Map<string, number>();
    const usageByWeek = new Map<string, number>();

    for (const shift of sortedShifts) {
        const weekKey = getFixedWeekKey(
            shift.date,
        );

        if (!weekKey) {
            usageByShiftId.set(shift.id, 0);
            continue;
        }

        let extendedDrivingDaysUsed =
            usageByWeek.get(weekKey) ?? 0;

        const drivingMinutes =
            Number(shift.driving) || 0;

        const isExtendedDriving =
            drivingMinutes >
            EXTENDED_DAILY_DRIVING_MINUTES &&
            drivingMinutes <=
            MAX_DAILY_DRIVING_MINUTES;

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