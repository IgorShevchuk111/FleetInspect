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

    return {
        shifts,
        isAddShiftOpen,
        setIsAddShiftOpen,
        addShift,
    };
}