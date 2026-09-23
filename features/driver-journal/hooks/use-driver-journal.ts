'use client';

import { useEffect, useState } from 'react';

import {
    createDriverJournalShift,
    deleteDriverJournalShift,
    getDriverJournalShifts,
    updateDriverJournalShift,
} from '@/features/driver-journal/services/driver-journal';

import type {
    Shift,
    ShiftFormData,
} from '@/features/driver-journal/types/ driver-journal';

import { durationToMinutes } from '@/features/driver-journal/utils/duration';
import { calculateShiftMinutes } from '@/features/driver-journal/utils/shifts';

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

        if (
            shiftEnd.getTime() >=
            currentStart.getTime()
        ) {
            continue;
        }

        if (
            !previousEnd ||
            shiftEnd.getTime() >
            previousEnd.getTime()
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
            (currentStart.getTime() -
                previousEnd.getTime()) /
            60000,
        ),
    );
}

function recalculateRest(shifts: Shift[]) {
    return shifts.map((shift) => ({
        ...shift,
        rest: calculateRest(
            shifts,
            shift,
        ),
    }));
}

function sortShifts(shifts: Shift[]) {
    return [...shifts].sort((a, b) => {
        const dateComparison =
            b.date.localeCompare(a.date);

        if (dateComparison !== 0) {
            return dateComparison;
        }

        return b.start.localeCompare(a.start);
    });
}

function mapDatabaseShift(
    shift: any,
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
            shift.rest_type ?? 'unspecified',
        end: shift.end ?? '',
        endDate:
            shift.end_date ?? shift.date,
        earn: Number(shift.earn),
    };
}

export function useDriverJournal() {
    const [shifts, setShifts] =
        useState<Shift[]>([]);

    const [isAddShiftOpen, setIsAddShiftOpen] =
        useState(false);

    const [editingShift, setEditingShift] =
        useState<Shift | null>(null);

    useEffect(() => {
        async function loadShifts() {
            try {
                const data =
                    await getDriverJournalShifts();

                const mappedShifts =
                    data.map(mapDatabaseShift);

                const recalculatedShifts =
                    recalculateRest(
                        mappedShifts,
                    );

                setShifts(
                    sortShifts(
                        recalculatedShifts,
                    ),
                );
            } catch (error) {
                console.error(
                    'Failed to load driver journal shifts:',
                    error,
                );
            }
        }

        loadShifts();
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
                restType: createdShift.rest_type === 'weekly' ? 'weekly' : 'daily',
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

            const updatedShiftModel: Shift =
            {
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
                restType: updatedShift.rest_type === 'weekly' ? 'weekly' : 'daily',
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

            setEditingShift(null);
        } catch (error) {
            console.error(
                'Failed to delete driver journal shift:',
                error,
            );
        }
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
        deleteShift,
    };
}