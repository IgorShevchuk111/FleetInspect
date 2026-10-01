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
    RestType,
    Shift,
    ShiftFormData,
} from '@/features/driver-journal/types/ driver-journal';

import type { Database } from '@/types/supabase/database';

import { durationToMinutes } from '@/features/driver-journal/utils/duration';
import { calculateShiftMinutes } from '@/features/driver-journal/utils/shifts';

import type { RestCompensation } from '../services/driver-journal';

type DriverJournalShiftRow =
    Database['public']['Tables']['driver_journal_shifts']['Row'];

function getDateTime(date: string, time: string) {
    if (!date || !time) {
        return null;
    }

    const result = new Date(`${date}T${time}`);

    if (Number.isNaN(result.getTime())) {
        return null;
    }

    return result;
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

function calculateRest(
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

function recalculateRest(shifts: Shift[]) {
    return shifts.map((shift) => ({
        ...shift,
        rest: calculateRest(shifts, shift),
    }));
}

function sortShifts(shifts: Shift[]) {
    return [...shifts].sort((a, b) => {
        const dateComparison = b.date.localeCompare(a.date);

        if (dateComparison !== 0) {
            return dateComparison;
        }

        return b.start.localeCompare(a.start);
    });
}

function mapDatabaseShift(
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

export function useDriverJournal() {
    const [shifts, setShifts] = useState<Shift[]>([]);

    const [restCompensations, setRestCompensations] =
        useState<RestCompensation[]>([]);

    const [isAddShiftOpen, setIsAddShiftOpen] =
        useState(false);

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

                const mappedShifts =
                    shiftData.map(mapDatabaseShift);

                const recalculatedShifts =
                    recalculateRest(mappedShifts);

                setShifts(
                    sortShifts(recalculatedShifts),
                );

                setRestCompensations(
                    compensationData,
                );
            } catch (error) {
                console.error(
                    'Failed to load driver journal:',
                    error,
                );
            }
        }

        loadDriverJournal();
    }, []);

    async function saveRestValues(
        updatedShifts: Shift[],
    ) {
        await Promise.all(
            updatedShifts.map((shift) =>
                updateDriverJournalShift(
                    shift.id,
                    {
                        rest: shift.rest,
                    },
                ),
            ),
        );
    }

    async function addShift(
        data: ShiftFormData,
    ) {
        try {
            const createdShift =
                await createDriverJournalShift({
                    date: data.date,
                    start: data.start,
                    end_date:
                        data.endDate ||
                        data.date,
                    driving:
                        durationToMinutes(
                            data.driving,
                        ),
                    break:
                        durationToMinutes(
                            data.break,
                        ),
                    rest: 0,
                    rest_type: data.restType,
                    end:
                        data.end || null,
                    earn: data.earn,
                });

            const newShift: Shift = {
                id: createdShift.id,
                date: createdShift.date,
                start: createdShift.start,
                driving: createdShift.driving,
                shift: calculateShiftMinutes(
                    createdShift.date,
                    createdShift.start,
                    createdShift.end_date ??
                    createdShift.date,
                    createdShift.end ?? '',
                ),
                break: createdShift.break,
                rest: 0,
                restType:
                    createdShift.rest_type === 'weekly'
                        ? 'weekly'
                        : 'daily',
                end:
                    createdShift.end ?? '',
                endDate:
                    createdShift.end_date ??
                    createdShift.date,
                earn: Number(
                    createdShift.earn,
                ),
            };

            const allShifts = [
                ...shifts,
                newShift,
            ];

            const recalculatedShifts =
                recalculateRest(
                    allShifts,
                );

            await saveRestValues(
                recalculatedShifts,
            );

            setShifts(
                sortShifts(
                    recalculatedShifts,
                ),
            );

            setIsAddShiftOpen(false);
        } catch (error) {
            console.error(
                'Failed to add driver journal shift:',
                error,
            );
        }
    }

    function startEditingShift(
        shift: Shift,
    ) {
        setEditingShift(shift);
    }

    async function updateShift(
        shiftId: string,
        data: ShiftFormData,
    ) {
        try {
            const currentShift =
                shifts.find(
                    (shift) =>
                        shift.id === shiftId,
                );

            const restTypeChanged =
                currentShift &&
                currentShift.restType !==
                data.restType;

            const relatedCompensations =
                restTypeChanged
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
                    relatedCompensations.map(
                        (compensation) =>
                            deleteRestCompensation(
                                compensation.id,
                            ),
                    ),
                );
            }

            const updatedShift =
                await updateDriverJournalShift(
                    shiftId,
                    {
                        date: data.date,
                        start: data.start,
                        end_date:
                            data.endDate ||
                            data.date,
                        driving:
                            durationToMinutes(
                                data.driving,
                            ),
                        break:
                            durationToMinutes(
                                data.break,
                            ),
                        rest: 0,
                        rest_type: data.restType,
                        end:
                            data.end || null,
                        earn: data.earn,
                    },
                );

            const updatedShiftModel: Shift = {
                id: updatedShift.id,
                date: updatedShift.date,
                start: updatedShift.start,
                driving: updatedShift.driving,
                shift: calculateShiftMinutes(
                    updatedShift.date,
                    updatedShift.start,
                    updatedShift.end_date ??
                    updatedShift.date,
                    updatedShift.end ?? '',
                ),
                break: updatedShift.break,
                rest: 0,
                restType:
                    updatedShift.rest_type === 'weekly'
                        ? 'weekly'
                        : 'daily',
                end:
                    updatedShift.end ?? '',
                endDate:
                    updatedShift.end_date ??
                    updatedShift.date,
                earn: Number(
                    updatedShift.earn,
                ),
            };

            const allShifts =
                shifts.map((shift) =>
                    shift.id === shiftId
                        ? updatedShiftModel
                        : shift,
                );

            const recalculatedShifts =
                recalculateRest(
                    allShifts,
                );

            await saveRestValues(
                recalculatedShifts,
            );

            setShifts(
                sortShifts(
                    recalculatedShifts,
                ),
            );

            if (relatedCompensations.length > 0) {
                setRestCompensations(
                    (current) =>
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

    async function deleteShift(
        shiftId: string,
    ) {
        try {
            await deleteDriverJournalShift(
                shiftId,
            );

            const relatedCompensations =
                restCompensations.filter(
                    (compensation) =>
                        compensation.reduced_weekly_rest_shift_id ===
                        shiftId ||
                        compensation.compensation_shift_id ===
                        shiftId,
                );

            await Promise.all(
                relatedCompensations.map(
                    (compensation) =>
                        deleteRestCompensation(
                            compensation.id,
                        ),
                ),
            );

            const remainingShifts =
                shifts.filter(
                    (shift) =>
                        shift.id !== shiftId,
                );

            const recalculatedShifts =
                recalculateRest(
                    remainingShifts,
                );

            await saveRestValues(
                recalculatedShifts,
            );

            setShifts(
                sortShifts(
                    recalculatedShifts,
                ),
            );

            setRestCompensations(
                (current) =>
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
            const existing =
                restCompensations.find(
                    (compensation) =>
                        compensation.reduced_weekly_rest_shift_id ===
                        reducedWeeklyRestShiftId &&
                        compensation.compensation_shift_id ===
                        compensationShiftId,
                );

            if (existing) {
                const updated =
                    await updateRestCompensation(
                        existing.id,
                        {
                            decision: 'accepted',
                            daily_rest_minutes:
                                dailyRestMinutes,
                            compensation_minutes:
                                compensationMinutes,
                        },
                    );

                setRestCompensations(
                    (current) =>
                        current.map(
                            (compensation) =>
                                compensation.id ===
                                    existing.id
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
                    compensation_shift_id:
                        compensationShiftId,
                    decision: 'accepted',
                    daily_rest_minutes:
                        dailyRestMinutes,
                    compensation_minutes:
                        compensationMinutes,
                });

            setRestCompensations(
                (current) => [
                    ...current,
                    created,
                ],
            );
        } catch (error) {
            console.error(
                'Failed to accept rest compensation:',
                error,
            );
        }
    }

    async function declineRestCompensation(
        reducedWeeklyRestShiftId: string,
        compensationShiftId: string,
    ) {
        try {
            const existing =
                restCompensations.find(
                    (compensation) =>
                        compensation.reduced_weekly_rest_shift_id ===
                        reducedWeeklyRestShiftId &&
                        compensation.compensation_shift_id ===
                        compensationShiftId,
                );

            if (existing) {
                const updated =
                    await updateRestCompensation(
                        existing.id,
                        {
                            decision: 'declined',
                            daily_rest_minutes: 0,
                            compensation_minutes: 0,
                        },
                    );

                setRestCompensations(
                    (current) =>
                        current.map(
                            (compensation) =>
                                compensation.id ===
                                    existing.id
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
                    compensation_shift_id:
                        compensationShiftId,
                    decision: 'declined',
                    daily_rest_minutes: 0,
                    compensation_minutes: 0,
                });

            setRestCompensations(
                (current) => [
                    ...current,
                    created,
                ],
            );
        } catch (error) {
            console.error(
                'Failed to decline rest compensation:',
                error,
            );
        }
    }

    async function cancelRestCompensation(
        compensationId: string,
    ) {
        try {
            await deleteRestCompensation(
                compensationId,
            );

            setRestCompensations(
                (current) =>
                    current.filter(
                        (compensation) =>
                            compensation.id !==
                            compensationId,
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
        declineRestCompensation,
        cancelRestCompensation,
    };
}