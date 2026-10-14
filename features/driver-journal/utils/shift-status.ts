
import type { Shift } from '@/features/driver-journal/types/driver-journal';

import { calculateShiftMinutes } from './shifts';
import {
    MAX_EXTENDED_DRIVING_DAYS,
    MAX_SHARED_ALLOWANCE,
    normalizeDrivingMinutes,
} from './compliance-usage';

const REDUCED_DAILY_REST_MINUTES = 9 * 60;
const REGULAR_DAILY_REST_MINUTES = 11 * 60;

const REGULAR_SHIFT_SPREAD_MINUTES = 13 * 60;
const MAX_SHIFT_SPREAD_MINUTES = 15 * 60;

const EXTENDED_DAILY_DRIVING_MINUTES = 9 * 60;
const MAX_DAILY_DRIVING_MINUTES = 10 * 60;

const REGULAR_WEEKLY_REST_MINUTES = 45 * 60;
const MINIMUM_WEEKLY_REST_MINUTES = 24 * 60;

function getMaxEndTime(shift: Shift, minutes: number) {
    const startDate = new Date(`${shift.date}T${shift.start}`);

    if (Number.isNaN(startDate.getTime())) {
        return null;
    }

    const maxEnd = new Date(
        startDate.getTime() + minutes * 60 * 1000,
    );

    return maxEnd.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

export function hasExtendedShift(shift: Shift) {
    const shiftMinutes = calculateShiftMinutes(shift);

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
    sharedAllowanceUsedBefore: number,
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
            className: 'text-danger',
        };
    }

    if (shiftMinutes > REGULAR_SHIFT_SPREAD_MINUTES) {
        if (sharedAllowanceUsedBefore >= MAX_SHARED_ALLOWANCE) {
            return {
                label: 'Extended · Not allowed',
                className: 'text-danger',
            };
        }

        return {
            label: extendedMaxEnd
                ? `Extended · max ${extendedMaxEnd}`
                : 'Extended · max 15h',
            className: 'text-warning',
        };
    }

    return {
        label: regularMaxEnd
            ? `Regular · max ${regularMaxEnd}`
            : 'Regular · max 13h',
        className: '',
    };
}

export function getDrivingStatus(
    drivingMinutes: number,
    extendedDrivingDaysUsedBefore: number,
) {
    const minutes = normalizeDrivingMinutes(drivingMinutes);

    if (minutes > MAX_DAILY_DRIVING_MINUTES) {
        return {
            label: 'Over limit · Max 10h',
            className: 'text-danger',
            showCounter: false,
            notAllowed: true,
        };
    }

    if (minutes > EXTENDED_DAILY_DRIVING_MINUTES) {
        if (extendedDrivingDaysUsedBefore >= MAX_EXTENDED_DRIVING_DAYS) {
            return {
                label: 'Extended driving · Not allowed',
                className: 'text-danger',
                showCounter: true,
                notAllowed: true,
            };
        }

        return {
            label: 'Extended',
            className: 'text-warning',
            showCounter: true,
            notAllowed: false,
        };
    }

    return null;
}

export function getRestStatus(
    shift: Shift,
    effectiveRestMinutes?: number,
) {
    const rest =
        effectiveRestMinutes ??
        (Number(shift.rest) || 0);

    if (shift.restType === 'weekly') {
        if (rest < MINIMUM_WEEKLY_REST_MINUTES) {
            return {
                label: 'Insufficient weekly rest',
                className: 'text-danger',
            };
        }

        if (rest < REGULAR_WEEKLY_REST_MINUTES) {
            return {
                label: 'Reduced weekly rest',
                className: 'text-warning',
            };
        }

        return {
            label: 'Regular weekly rest',
            className: 'text-success',
        };
    }

    if (rest < REDUCED_DAILY_REST_MINUTES) {
        return {
            label: 'Insufficient daily rest',
            className: 'text-danger',
        };
    }

    if (rest < REGULAR_DAILY_REST_MINUTES) {
        return {
            label: 'Reduced daily rest',
            className: 'text-warning',
        };
    }

    return {
        label: 'Regular daily rest',
        className: 'text-success',
    };
}


export function getMaxShiftEndDateTime(
    date: string,
    start: string,
    minutes: number,
) {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, mins] = start.split(':').map(Number);

    if (
        !year ||
        !month ||
        !day ||
        !start ||
        !Number.isFinite(hours) ||
        !Number.isFinite(mins) ||
        !Number.isFinite(minutes) ||
        minutes <= 0
    ) {
        return null;
    }

    const startDate = new Date(
        year,
        month - 1,
        day,
        hours,
        mins,
    );

    if (Number.isNaN(startDate.getTime())) {
        return null;
    }

    const maxEnd = new Date(
        startDate.getTime() + minutes * 60 * 1000,
    );

    const endDate = [
        maxEnd.getFullYear(),
        String(maxEnd.getMonth() + 1).padStart(2, '0'),
        String(maxEnd.getDate()).padStart(2, '0'),
    ].join('-');

    const endTime = maxEnd.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    return { date: endDate, time: endTime };
}
