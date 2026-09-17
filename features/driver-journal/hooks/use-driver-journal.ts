'use client';

import { useState } from 'react';

import { testShifts } from '@/features/driver-journal/data/test-shifts';

import type {
    Shift,
    ShiftFormData,
} from '@/features/driver-journal/types/ driver-journal';

import { durationToMinutes } from '@/features/driver-journal/utils/driver-journal';

export function useDriverJournal() {
    const [shifts, setShifts] = useState<Shift[]>(testShifts);
    const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);

    function addShift(data: ShiftFormData) {
        const newShift: Shift = {
            id: crypto.randomUUID(),
            date: data.date,
            start: data.start,
            driving: durationToMinutes(data.driving),
            shift: durationToMinutes(data.shift),
            break: durationToMinutes(data.break),
            end: data.end,
        };

        setShifts((current) => [
            ...current,
            newShift,
        ]);

        setIsAddShiftOpen(false);
    }

    function startEditingShift(shift: Shift) {
        setEditingShift(shift);
    }

    function updateShift(
        shiftId: string,
        data: ShiftFormData,
    ) {
        setShifts((current) =>
            current.map((shift) =>
                shift.id === shiftId
                    ? {
                        ...shift,
                        date: data.date,
                        start: data.start,
                        driving: durationToMinutes(data.driving),
                        shift: durationToMinutes(data.shift),
                        break: durationToMinutes(data.break),
                        end: data.end,
                    }
                    : shift,
            ),
        );

        setEditingShift(null);
    }

    function cancelEditingShift() {
        setEditingShift(null);
    }

    return {
        shifts,
        isAddShiftOpen,
        setIsAddShiftOpen,
        addShift,
        editingShift,
        startEditingShift,
        updateShift,
        cancelEditingShift,
    };
}