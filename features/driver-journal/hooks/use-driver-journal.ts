'use client';

import { useEffect, useState } from 'react';

import {
    createDriverJournalShift,
    createRestCompensation,
    deleteDriverJournalShift,
    deleteRestCompensation,
    getDriverJournalShifts,
    getRestCompensations,
    updateDriverJournalShift,
    updateRestCompensation,
} from '@/features/driver-journal/services/driver-journal';

import type {
    Shift,
    ShiftFormData,
} from '@/features/driver-journal/types/ driver-journal';

import { durationToMinutes } from '@/features/driver-journal/utils/duration';
import {
    mapDatabaseShift,
    recalculateShiftRest,
    sortShifts,
} from '@/features/driver-journal/utils/journal-shifts';

import type { RestCompensation } from '../services/driver-journal';

export function useDriverJournal() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [restCompensations, setRestCompensations] = useState<
        RestCompensation[]
    >([]);
    const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
    const [editingShift, setEditingShift] =
        useState<Shift | null>(null);

    useEffect(() => {
        async function loadDriverJournal() {
            try {
                const [shiftData, compensationData] =
                    await Promise.all([
                        getDriverJournalShifts(),
                        getRestCompensations(),
                    ]);

                const mappedShifts = shiftData.map(mapDatabaseShift);
                const recalculatedShifts =
                    recalculateShiftRest(mappedShifts);

                setShifts(sortShifts(recalculatedShifts));
                setRestCompensations(compensationData);
            } catch (error) {
                console.error(
                    'Failed to load driver journal:',
                    error,
                );
            }
        }

        loadDriverJournal();
    }, []);

    async function saveRestValues(updatedShifts: Shift[]) {
        await Promise.all(
            updatedShifts.map((shift) =>
                updateDriverJournalShift(shift.id, {
                    rest: shift.rest,
                }),
            ),
        );
    }

    async function addShift(data: ShiftFormData) {
        try {
            const createdShift =
                await createDriverJournalShift({
                    date: data.date,
                    start: data.start,
                    end_date: data.endDate || data.date,
                    driving: durationToMinutes(data.driving),
                    break: durationToMinutes(data.break),
                    rest: 0,
                    rest_type: data.restType,
                    end: data.end || null,
                    earn: data.earn,
                });

            const newShift = mapDatabaseShift(createdShift);

            const updatedShifts = recalculateShiftRest([
                ...shifts,
                newShift,
            ]);

            await saveRestValues(updatedShifts);

            setShifts(sortShifts(updatedShifts));
            setIsAddShiftOpen(false);
        } catch (error) {
            console.error(
                'Failed to add driver journal shift:',
                error,
            );
        }
    }

    function startEditingShift(shift: Shift) {
        setEditingShift(shift);
    }

    async function updateShift(
        shiftId: string,
        data: ShiftFormData,
    ) {
        try {
            const currentShift = shifts.find(
                (shift) => shift.id === shiftId,
            );

            const restTypeChanged =
                currentShift &&
                currentShift.restType !== data.restType;

            const relatedCompensations = restTypeChanged
                ? restCompensations.filter(
                    (compensation) =>
                        compensation.reduced_weekly_rest_shift_id ===
                        shiftId ||
                        compensation.compensation_shift_id ===
                        shiftId,
                )
                : [];

            if (relatedCompensations.length > 0) {
                await Promise.all(
                    relatedCompensations.map((compensation) =>
                        deleteRestCompensation(compensation.id),
                    ),
                );
            }

            const updatedShift =
                await updateDriverJournalShift(shiftId, {
                    date: data.date,
                    start: data.start,
                    end_date: data.endDate || data.date,
                    driving: durationToMinutes(data.driving),
                    break: durationToMinutes(data.break),
                    rest: 0,
                    rest_type: data.restType,
                    end: data.end || null,
                    earn: data.earn,
                });

            const updatedShiftModel =
                mapDatabaseShift(updatedShift);

            const updatedShifts = recalculateShiftRest(
                shifts.map((shift) =>
                    shift.id === shiftId
                        ? updatedShiftModel
                        : shift,
                ),
            );

            await saveRestValues(updatedShifts);

            setShifts(sortShifts(updatedShifts));

            if (relatedCompensations.length > 0) {
                setRestCompensations((current) =>
                    current.filter(
                        (compensation) =>
                            compensation.reduced_weekly_rest_shift_id !==
                            shiftId &&
                            compensation.compensation_shift_id !==
                            shiftId,
                    ),
                );
            }

            setEditingShift(null);
        } catch (error) {
            console.error(
                'Failed to update driver journal shift:',
                error,
            );
        }
    }

    function cancelEditingShift() {
        setEditingShift(null);
    }

    async function deleteShift(shiftId: string) {
        try {
            await deleteDriverJournalShift(shiftId);

            const relatedCompensations =
                restCompensations.filter(
                    (compensation) =>
                        compensation.reduced_weekly_rest_shift_id ===
                        shiftId ||
                        compensation.compensation_shift_id ===
                        shiftId,
                );

            await Promise.all(
                relatedCompensations.map((compensation) =>
                    deleteRestCompensation(compensation.id),
                ),
            );

            const remainingShifts = shifts.filter(
                (shift) => shift.id !== shiftId,
            );

            const updatedShifts =
                recalculateShiftRest(remainingShifts);

            await saveRestValues(updatedShifts);

            setShifts(sortShifts(updatedShifts));

            setRestCompensations((current) =>
                current.filter(
                    (compensation) =>
                        compensation.reduced_weekly_rest_shift_id !==
                        shiftId &&
                        compensation.compensation_shift_id !==
                        shiftId,
                ),
            );

            setEditingShift(null);
        } catch (error) {
            console.error(
                'Failed to delete driver journal shift:',
                error,
            );
        }
    }

    async function acceptRestCompensation(
        reducedWeeklyRestShiftId: string,
        compensationShiftId: string,
        dailyRestMinutes: number,
        compensationMinutes: number,
    ) {
        try {
            const existing = restCompensations.find(
                (compensation) =>
                    compensation.reduced_weekly_rest_shift_id ===
                    reducedWeeklyRestShiftId &&
                    compensation.compensation_shift_id ===
                    compensationShiftId,
            );

            if (existing) {
                const updated =
                    await updateRestCompensation(existing.id, {
                        decision: 'accepted',
                        daily_rest_minutes: dailyRestMinutes,
                        compensation_minutes: compensationMinutes,
                    });

                setRestCompensations((current) =>
                    current.map((compensation) =>
                        compensation.id === existing.id
                            ? updated
                            : compensation,
                    ),
                );

                return;
            }

            const created =
                await createRestCompensation({
                    reduced_weekly_rest_shift_id:
                        reducedWeeklyRestShiftId,
                    compensation_shift_id: compensationShiftId,
                    decision: 'accepted',
                    daily_rest_minutes: dailyRestMinutes,
                    compensation_minutes: compensationMinutes,
                });

            setRestCompensations((current) => [
                ...current,
                created,
            ]);
        } catch (error) {
            console.error(
                'Failed to accept rest compensation:',
                error,
            );
        }
    }

    async function cancelRestCompensation(
        compensationId: string,
    ) {
        try {
            await deleteRestCompensation(compensationId);

            setRestCompensations((current) =>
                current.filter(
                    (compensation) =>
                        compensation.id !== compensationId,
                ),
            );
        } catch (error) {
            console.error(
                'Failed to cancel rest compensation:',
                error,
            );
        }
    }

    return {
        shifts,
        restCompensations,
        isAddShiftOpen,
        setIsAddShiftOpen,
        addShift,
        editingShift,
        startEditingShift,
        updateShift,
        cancelEditingShift,
        deleteShift,
        acceptRestCompensation,
        cancelRestCompensation,
    };
}