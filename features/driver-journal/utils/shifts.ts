import type { JournalTotals, Shift } from '@/features/driver-journal/types/ driver-journal';

import { getEndOfWeek, getStartOfWeek, parseDateTime } from './dates';

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

    if (!date || !startTime || !actualEndDate || !endTime) {
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
            totals.working += calculateWorkingMinutes(shift);
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

export function sortShiftsChronologically(
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

        return dateA.getTime() - dateB.getTime();
    });
}