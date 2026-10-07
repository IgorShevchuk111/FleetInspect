import type { Database } from '@/types/supabase/database';

import type { Shift } from '@/features/driver-journal/types/ driver-journal';

import { calculateShiftMinutes } from './shifts';

type DriverJournalShiftRow =
    Database['public']['Tables']['driver_journal_shifts']['Row'];

function getDateTime(date: string, time: string) {
    if (!date || !time) {
        return null;
    }

    const result = new Date(`${date}T${time}`);

    return Number.isNaN(result.getTime()) ? null : result;
}

function getShiftStart(shift: Shift) {
    return getDateTime(shift.date, shift.start);
}

function getShiftEnd(shift: Shift) {
    if (!shift.end) {
        return null;
    }

    return getDateTime(
        shift.endDate || shift.date,
        shift.end,
    );
}

export function calculateShiftRest(
    shifts: Shift[],
    currentShift: Shift,
) {
    const currentStart = getShiftStart(currentShift);

    if (!currentStart) {
        return 0;
    }

    let previousEnd: Date | null = null;

    for (const shift of shifts) {
        if (shift.id === currentShift.id) {
            continue;
        }

        const shiftEnd = getShiftEnd(shift);

        if (!shiftEnd) {
            continue;
        }

        if (shiftEnd.getTime() >= currentStart.getTime()) {
            continue;
        }

        if (
            !previousEnd ||
            shiftEnd.getTime() > previousEnd.getTime()
        ) {
            previousEnd = shiftEnd;
        }
    }

    if (!previousEnd) {
        return 0;
    }

    return Math.max(
        0,
        Math.round(
            (currentStart.getTime() - previousEnd.getTime()) /
            60000,
        ),
    );
}

export function recalculateShiftRest(shifts: Shift[]) {
    return shifts.map((shift) => ({
        ...shift,
        rest: calculateShiftRest(shifts, shift),
    }));
}

export function sortShifts(shifts: Shift[]) {
    return [...shifts].sort((a, b) => {
        const dateComparison = b.date.localeCompare(a.date);

        if (dateComparison !== 0) {
            return dateComparison;
        }

        return b.start.localeCompare(a.start);
    });
}

export function mapDatabaseShift(
    shift: DriverJournalShiftRow,
): Shift {
    return {
        id: shift.id,
        date: shift.date,
        start: shift.start,
        driving: shift.driving,
        shift: calculateShiftMinutes(
            shift.date,
            shift.start,
            shift.end_date ?? shift.date,
            shift.end ?? '',
        ),
        break: shift.break,
        rest: shift.rest,
        restType:
            shift.rest_type === 'weekly'
                ? 'weekly'
                : 'daily',
        end: shift.end ?? '',
        endDate: shift.end_date ?? shift.date,
        earn: Number(shift.earn),
    };
}