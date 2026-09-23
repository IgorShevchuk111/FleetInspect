import type { Shift } from '@/features/driver-journal/types/ driver-journal';

import { calculateShiftMinutes } from '../utils/driver-journal';

const REDUCED_DAILY_REST_MINUTES = 9 * 60;
const REGULAR_DAILY_REST_MINUTES = 11 * 60;

const REGULAR_SHIFT_SPREAD_MINUTES = 13 * 60;
const MAX_SHIFT_SPREAD_MINUTES = 15 * 60;

const MAX_SHARED_ALLOWANCE = 3;

const EXTENDED_DAILY_DRIVING_MINUTES = 9 * 60;
const MAX_DAILY_DRIVING_MINUTES = 10 * 60;
const MAX_EXTENDED_DRIVING_DAYS = 2;

const MINIMUM_WEEKLY_REST_MINUTES = 24 * 60;

function getMaxEndTime(shift: Shift, minutes: number) {
    const startDate = new Date(`${shift.date}T${shift.start}`);

    if (Number.isNaN(startDate.getTime())) {
        return null;
    }

    const maxEnd = new Date(startDate.getTime() + minutes * 60 * 1000);

    return maxEnd.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

export function hasExtendedShift(shift: Shift) {
    const shiftMinutes = calculateShiftMinutes(
        shift.date,
        shift.start,
        shift.endDate || shift.date,
        shift.end,
    );

    return (
        shiftMinutes > REGULAR_SHIFT_SPREAD_MINUTES &&
        shiftMinutes <= MAX_SHIFT_SPREAD_MINUTES
    );
}

export function isReducedDailyRest(shift: Shift) {
    const rest = Number(shift.rest) || 0;

    return (
        shift.restType === 'daily' &&
        rest >= REDUCED_DAILY_REST_MINUTES &&
        rest < REGULAR_DAILY_REST_MINUTES
    );
}

export function getShiftStatus(
    shift: Shift,
    shiftMinutes: number,
    sharedAllowanceUsedBeforeShift: number,
) {
    const regularMaxEnd = getMaxEndTime(
        shift,
        REGULAR_SHIFT_SPREAD_MINUTES,
    );

    const extendedMaxEnd = getMaxEndTime(
        shift,
        MAX_SHIFT_SPREAD_MINUTES,
    );

    if (shiftMinutes > MAX_SHIFT_SPREAD_MINUTES) {
        return {
            label: extendedMaxEnd
                ? `Over limit · max ${extendedMaxEnd}`
                : 'Over limit · max 15h',
            className: 'text-red-600 dark:text-red-400',
        };
    }

    if (shiftMinutes > REGULAR_SHIFT_SPREAD_MINUTES) {
        if (sharedAllowanceUsedBeforeShift >= MAX_SHARED_ALLOWANCE) {
            return {
                label: 'Extended · Not allowed',
                className: 'text-red-600 dark:text-red-400',
            };
        }

        return {
            label: extendedMaxEnd
                ? `Extended · max ${extendedMaxEnd}`
                : 'Extended · max 15h',
            className: 'text-orange-600 dark:text-orange-400',
        };
    }

    return {
        label: regularMaxEnd
            ? `Regular · max ${regularMaxEnd}`
            : 'Regular · max 13h',
        className: 'text-green-600 dark:text-green-400',
    };
}

function normalizeDrivingMinutes(value: number) {
    const minutes = Number(value);

    if (!Number.isFinite(minutes)) {
        return 0;
    }

    return Math.round(minutes);
}

export function getDrivingStatus(
    drivingMinutes: number,
    extendedDrivingDaysUsedBefore: number,
) {
    const minutes = normalizeDrivingMinutes(drivingMinutes);

    if (minutes > MAX_DAILY_DRIVING_MINUTES) {
        return {
            label: 'Over limit · Max 10h',
            className: 'text-red-600 dark:text-red-400',
            showCounter: false,
            notAllowed: true,
        };
    }

    if (minutes > EXTENDED_DAILY_DRIVING_MINUTES) {
        if (extendedDrivingDaysUsedBefore >= MAX_EXTENDED_DRIVING_DAYS) {
            return {
                label: 'Extended driving · Not allowed',
                className: 'text-red-600 dark:text-red-400',
                showCounter: true,
                notAllowed: true,
            };
        }

        return {
            label: 'Extended',
            className: 'text-orange-600 dark:text-orange-400',
            showCounter: true,
            notAllowed: false,
        };
    }

    return null;
}

export function getRestStatus(shift: Shift) {
    const rest = Number(shift.rest) || 0;

    if (shift.restType === 'weekly') {
        if (rest < MINIMUM_WEEKLY_REST_MINUTES) {
            return {
                label: 'Insufficient weekly rest',
                className: 'text-red-600 dark:text-red-400',
            };
        }

        if (rest < 45 * 60) {
            return {
                label: 'Reduced weekly rest',
                className: 'text-orange-600 dark:text-orange-400',
            };
        }

        return {
            label: 'Regular weekly rest',
            className: 'text-green-600 dark:text-green-400',
        };
    }

    if (rest < REDUCED_DAILY_REST_MINUTES) {
        return {
            label: 'Insufficient daily rest',
            className: 'text-red-600 dark:text-red-400',
        };
    }

    if (rest < REGULAR_DAILY_REST_MINUTES) {
        return {
            label: 'Reduced daily rest',
            className: 'text-orange-600 dark:text-orange-400',
        };
    }

    return {
        label: 'Regular daily rest',
        className: 'text-green-600 dark:text-green-400',
    };
}