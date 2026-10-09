import type {
    JournalTotals,
    Shift,
} from '@/features/driver-journal/types/driver-journal';

import {
    getEndOfWeek,
    getStartOfWeek,
    parseDateTime,
} from '@/features/driver-journal/utils/dates';

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
            `${shift.date} T00:00:00`,
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

function getShiftStartDateTime(
    shift: Shift,
): number | null {
    if (!shift.date || !shift.start) {
        return null;
    }

    const value = new Date(
        `${shift.date}T${shift.start}`,
    );

    if (Number.isNaN(value.getTime())) {
        return null;
    }

    return value.getTime();
}

export function getPreviousShift(
    shifts: Shift[],
    currentDate: string,
    currentStartTime: string,
    editingShiftId?: string,
): Shift | null {
    if (!currentDate || !currentStartTime) {
        return null;
    }

    const currentStart = new Date(
        `${currentDate}T${currentStartTime}`,
    ).getTime();

    if (Number.isNaN(currentStart)) {
        return null;
    }

    let previousShift: Shift | null = null;
    let previousStart: number | null = null;

    for (const shift of shifts) {
        if (shift.id === editingShiftId) {
            continue;
        }


        const shiftStart = getShiftStartDateTime(shift);

        if (
            shiftStart === null ||
            shiftStart >= currentStart
        ) {
            continue;
        }

        if (
            previousStart === null ||
            shiftStart > previousStart
        ) {
            previousShift = shift;
            previousStart = shiftStart;
        }


    }

    return previousShift;
}

export function getPreviousCompletedShift(
    shifts: Shift[],
    currentDate: string,
    currentStartTime: string,
    editingShiftId?: string,
): Shift | null {
    const previousShift = getPreviousShift(
        shifts,
        currentDate,
        currentStartTime,
        editingShiftId,
    );

    if (!previousShift || !previousShift.end) {
        return null;
    }

    return previousShift;
}
