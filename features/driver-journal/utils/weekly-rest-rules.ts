
import type { Shift } from '@/features/driver-journal/types/ driver-journal';

const MINIMUM_WEEKLY_REST_MINUTES = 24 * 60;
const REGULAR_WEEKLY_REST_MINUTES = 45 * 60;

type WeeklyRestValidation = {
    valid: boolean;
    isReduced: boolean;
    message?: string;
};

function getDateTime(date: string, time: string): number | null {
    if (!date || !time) {
        return null;
    }

    const value = new Date(`${date}T${time}`);

    if (Number.isNaN(value.getTime())) {
        return null;
    }

    return value.getTime();
}

function getShiftStart(shift: Shift): number | null {
    return getDateTime(shift.date, shift.start);
}

function getShiftEnd(shift: Shift): number | null {
    if (!shift.end) {
        return null;
    }

    return getDateTime(shift.endDate || shift.date, shift.end);
}

/**
 * Calculates the actual rest immediately before
 * the current Weekly Rest start.
 */
function getCurrentRestMinutes(
    shifts: Shift[],
    currentDate: string,
    currentStartTime: string,
    editingShiftId?: string,
): number {
    const currentStart = getDateTime(
        currentDate,
        currentStartTime,
    );

    if (currentStart === null) {
        return 0;
    }

    let latestPreviousEnd: number | null = null;

    for (const shift of shifts) {
        if (shift.id === editingShiftId) {
            continue;
        }

        const shiftEnd = getShiftEnd(shift);

        if (shiftEnd === null || shiftEnd >= currentStart) {
            continue;
        }

        if (
            latestPreviousEnd === null ||
            shiftEnd > latestPreviousEnd
        ) {
            latestPreviousEnd = shiftEnd;
        }
    }

    if (latestPreviousEnd === null) {
        return 0;
    }

    return Math.max(
        0,
        Math.round(
            (currentStart - latestPreviousEnd) / 60000,
        ),
    );
}

/**
 * Finds the most recent Weekly Rest before
 * the current Weekly Rest.
 */
function getLastWeeklyRest(
    shifts: Shift[],
    currentDate: string,
    currentStartTime: string,
    editingShiftId?: string,
): Shift | null {
    const currentStart = getDateTime(
        currentDate,
        currentStartTime,
    );

    if (currentStart === null) {
        return null;
    }

    let lastWeeklyRest: Shift | null = null;
    let lastWeeklyRestStart: number | null = null;

    for (const shift of shifts) {
        if (shift.id === editingShiftId) {
            continue;
        }

        if (shift.restType !== 'weekly') {
            continue;
        }

        const shiftStart = getShiftStart(shift);

        if (shiftStart === null || shiftStart >= currentStart) {
            continue;
        }

        if (
            lastWeeklyRestStart === null ||
            shiftStart > lastWeeklyRestStart
        ) {
            lastWeeklyRest = shift;
            lastWeeklyRestStart = shiftStart;
        }
    }

    return lastWeeklyRest;
}

export function getWeeklyRestValidation(
    shifts: Shift[],
    date: string,
    start: string,
    editingShiftId?: string,
): WeeklyRestValidation {
    if (!date || !start) {
        return {
            valid: true,
            isReduced: false,
        };
    }

    const currentRest = getCurrentRestMinutes(
        shifts,
        date,
        start,
        editingShiftId,
    );

    // Less than 24 hours is never a valid Weekly Rest.
    if (currentRest < MINIMUM_WEEKLY_REST_MINUTES) {
        return {
            valid: false,
            isReduced: false,
            message: 'Weekly rest must be at least 24 hours.',
        };
    }

    // 45 hours or more is always a Regular Weekly Rest.
    if (currentRest >= REGULAR_WEEKLY_REST_MINUTES) {
        return {
            valid: true,
            isReduced: false,
        };
    }

    // 24h to less than 45h = Reduced Weekly Rest.
    const lastWeeklyRest = getLastWeeklyRest(
        shifts,
        date,
        start,
        editingShiftId,
    );

    // First Reduced Weekly Rest is allowed.
    if (!lastWeeklyRest) {
        return {
            valid: true,
            isReduced: true,
        };
    }

    const previousWasReduced =
        lastWeeklyRest.rest >= MINIMUM_WEEKLY_REST_MINUTES &&
        lastWeeklyRest.rest < REGULAR_WEEKLY_REST_MINUTES;

    // Reduced → Reduced is not allowed.
    if (previousWasReduced) {
        return {
            valid: false,
            isReduced: true,
            message:
                'Your previous weekly rest was reduced. You must now take a regular weekly rest of at least 45 hours.',
        };
    }

    // Previous Weekly Rest was Regular, so Reduced is allowed.
    return {
        valid: true,
        isReduced: true,
    };
}
