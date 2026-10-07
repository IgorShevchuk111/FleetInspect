'use client';

import { useEffect, useState } from 'react';

import { countExtendedDrivingDays } from '@/features/driver-journal/utils/compliance';
import { buildExtendedShiftUsage } from '@/features/driver-journal/utils/compliance-usage';
import { minutesToDuration } from '@/features/driver-journal/utils/duration';
import { getStartOfWeek } from '@/features/driver-journal/utils/dates';
import {
    getPreviousCompletedShift,
    getPreviousShift,
} from '@/features/driver-journal/utils/shifts';
import { getWeeklyRestValidation } from '@/features/driver-journal/utils/weekly-rest-rules';

import type {
    RestType,
    Shift,
    ShiftFormData,
} from '@/features/driver-journal/types/ driver-journal';

type ShiftDialogProps = {
    open: boolean;
    shift?: Shift | null;
    shifts: Shift[];
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: ShiftFormData) => void;
    onDelete?: () => void;
};

const DAILY_DRIVING_LIMIT = 9 * 60;
const EXTENDED_DAILY_DRIVING_LIMIT = 10 * 60;
const REGULAR_SHIFT_SPREAD = 13 * 60;
const MAX_SHIFT_SPREAD = 15 * 60;
const MAX_EXTENDED_DRIVING_DAYS = 2;
const MAX_EXTENDED_SHIFTS = 3;

function getCurrentTime() {
    const now = new Date();

    return [
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
    ].join(':');
}

function getTodayDate() {
    const today = new Date();

    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0'),
    ].join('-');
}

function getInitialForm(): ShiftFormData {
    const today = getTodayDate();

    return {
        date: today,
        start: getCurrentTime(),
        driving: {
            hours: 0,
            minutes: 0,
        },
        break: {
            hours: 0,
            minutes: 0,
        },
        restType: 'daily',
        end: '',
        endDate: today,
        earn: 0,
    };
}

function getShiftForm(shift: Shift): ShiftFormData {
    return {
        date: shift.date,
        start: shift.start,
        driving: minutesToDuration(shift.driving),
        break: minutesToDuration(shift.break),
        restType: shift.restType,
        end: shift.end ?? '',
        endDate: shift.endDate ?? shift.date,
        earn: shift.earn,
    };
}

function getDateTime(date: string, time: string) {
    if (!date || !time) {
        return undefined;
    }

    const value = new Date(`${date}T${time}`);

    if (Number.isNaN(value.getTime())) {
        return undefined;
    }

    return value;
}

function getFormShiftMinutes(
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string,
) {
    if (!startDate || !startTime || !endDate || !endTime) {
        return 0;
    }

    const start = getDateTime(startDate, startTime);
    const end = getDateTime(endDate, endTime);

    if (!start || !end) {
        return 0;
    }

    return Math.max(
        0,
        Math.round((end.getTime() - start.getTime()) / 60000),
    );
}

export function useShiftDialog({
    open,
    shift,
    shifts,
    onOpenChange,
    onSubmit,
    onDelete,
}: ShiftDialogProps) {
    const [form, setForm] = useState<ShiftFormData>(getInitialForm());
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isRestTypeDialogOpen, setIsRestTypeDialogOpen] = useState(false);
    const [hasSelectedRestType, setHasSelectedRestType] = useState(false);

    const isEditing = Boolean(shift);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (shift) {
            setForm(getShiftForm(shift));
            setHasSelectedRestType(true);
            setIsRestTypeDialogOpen(false);
            return;
        }

        setForm(getInitialForm());
        setHasSelectedRestType(false);
        setIsRestTypeDialogOpen(false);
    }, [open, shift]);

    const weeklyRestValidation =
        form.restType === 'weekly'
            ? getWeeklyRestValidation(
                shifts,
                form.date,
                form.start,
                shift?.id,
            )
            : {
                valid: true,
                isReduced: false,
            };

    const previousShift = !isEditing
        ? getPreviousShift(shifts, form.date, form.start)
        : null;

    const previousCompletedShift = getPreviousCompletedShift(
        shifts,
        form.date,
        form.start,
        shift?.id,
    );

    const hasUnfinishedPreviousShift =
        !isEditing && previousShift !== null && !previousShift.end;

    const canEnterRestOfShift = isEditing || hasSelectedRestType;

    const selectedDate = (() => {
        if (!form.date) {
            return new Date();
        }

        const [year, month, day] = form.date.split('-').map(Number);

        if (!year || !month || !day) {
            return new Date();
        }

        return new Date(year, month - 1, day);
    })();

    const currentWeekStart = getStartOfWeek(selectedDate);

    const extendedDrivingDaysUsed = countExtendedDrivingDays(
        shifts,
        currentWeekStart,
    );

    const drivingMaximum =
        extendedDrivingDaysUsed < MAX_EXTENDED_DRIVING_DAYS
            ? EXTENDED_DAILY_DRIVING_LIMIT
            : DAILY_DRIVING_LIMIT;

    const candidateStartDateTime = getDateTime(form.date, form.start);

    const shiftsBeforeCurrentShift = candidateStartDateTime
        ? shifts.filter((currentShift) => {
            if (currentShift.id === shift?.id) {
                return false;
            }

            const currentShiftStartDateTime = getDateTime(
                currentShift.date,
                currentShift.start,
            );

            if (!currentShiftStartDateTime) {
                return false;
            }

            return currentShiftStartDateTime < candidateStartDateTime;
        })
        : [];

    const extendedShiftUsage = buildExtendedShiftUsage(
        shiftsBeforeCurrentShift,
    );

    const previousShiftsChronological = [...shiftsBeforeCurrentShift].sort(
        (a, b) => {
            const dateA = getDateTime(a.date, a.start)?.getTime() ?? 0;
            const dateB = getDateTime(b.date, b.start)?.getTime() ?? 0;

            return dateA - dateB;
        },
    );

    const lastPreviousShift =
        previousShiftsChronological[
        previousShiftsChronological.length - 1
        ];

    const previousExtendedShiftsUsed = lastPreviousShift
        ? (extendedShiftUsage.get(lastPreviousShift.id) ?? 0)
        : 0;

    const weeklyRestResetsExtendedShifts =
        form.restType === 'weekly' && weeklyRestValidation.valid;

    const extendedShiftsUsed = weeklyRestResetsExtendedShifts
        ? 0
        : previousExtendedShiftsUsed;

    const shiftMaximum =
        extendedShiftsUsed < MAX_EXTENDED_SHIFTS
            ? MAX_SHIFT_SPREAD
            : REGULAR_SHIFT_SPREAD;

    const actualDrivingMinutes =
        form.driving.hours * 60 + form.driving.minutes;

    const actualBreakMinutes =
        form.break.hours * 60 + form.break.minutes;

    const actualShiftMinutes = getFormShiftMinutes(
        form.date,
        form.start,
        form.endDate,
        form.end,
    );

    const workingMinutes = Math.max(
        0,
        actualShiftMinutes - actualBreakMinutes,
    );

    function updateField(
        field: keyof ShiftFormData,
        value: ShiftFormData[keyof ShiftFormData],
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function openRestTypeDialog() {
        if (
            !isEditing &&
            !hasSelectedRestType &&
            !hasUnfinishedPreviousShift &&
            form.date &&
            form.start
        ) {
            setIsRestTypeDialogOpen(true);
        }
    }

    function handleStartDateChange(value: string) {
        updateField('date', value);

        if (!isEditing && value && form.start) {
            setHasSelectedRestType(false);

            const nextPreviousShift = getPreviousShift(
                shifts,
                value,
                form.start,
            );

            if (nextPreviousShift && !nextPreviousShift.end) {
                setIsRestTypeDialogOpen(false);
                return;
            }

            setIsRestTypeDialogOpen(true);
        }
    }

    function handleStartTimeChange(value: string) {
        updateField('start', value);

        if (!isEditing && value && form.date) {
            setHasSelectedRestType(false);

            const nextPreviousShift = getPreviousShift(
                shifts,
                form.date,
                value,
            );

            if (nextPreviousShift && !nextPreviousShift.end) {
                setIsRestTypeDialogOpen(false);
                return;
            }

            setIsRestTypeDialogOpen(true);
        }
    }

    function handleEndDateChange(value: string) {
        updateField('endDate', value);
    }

    function handleEndTimeChange(value: string) {
        updateField('end', value);
    }

    function handleDrivingChange(value: ShiftFormData['driving']) {
        updateField('driving', value);
    }

    function handleBreakChange(value: ShiftFormData['break']) {
        updateField('break', value);
    }

    function handleRestTypeChange(value: RestType) {
        updateField('restType', value);
    }

    function handleRestTypeSelection(restType: RestType) {
        updateField('restType', restType);
        setHasSelectedRestType(true);
        setIsRestTypeDialogOpen(false);
    }

    function handleEarnFocus() {
        if (form.earn === 0) {
            updateField('earn', '' as unknown as number);
        }
    }

    function handleEarnChange(event: React.ChangeEvent<HTMLInputElement>) {
        const inputValue = event.target.value;

        if (inputValue === '') {
            updateField('earn', '' as unknown as number);
            return;
        }

        updateField('earn', Number(inputValue));
    }

    function handleEarnBlur() {
        if (form.earn === ('' as unknown as number)) {
            updateField('earn', 0);
        }
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (hasUnfinishedPreviousShift) {
            return;
        }

        if (!isEditing && !hasSelectedRestType) {
            openRestTypeDialog();
            return;
        }

        if (
            form.restType === 'weekly' &&
            !weeklyRestValidation.valid
        ) {
            return;
        }

        onSubmit(form);
    }

    function handleCancel() {
        setForm(getInitialForm());
        setIsRestTypeDialogOpen(false);
        setHasSelectedRestType(false);
        onOpenChange(false);
    }

    function handleDelete() {
        if (!onDelete) {
            return;
        }

        onDelete();
        setIsDeleteConfirmOpen(false);
        onOpenChange(false);
    }

    const isWeeklyRestBlocked =
        form.restType === 'weekly' &&
        !weeklyRestValidation.valid;

    return {
        form,
        isEditing,
        hasUnfinishedPreviousShift,
        canEnterRestOfShift,
        weeklyRestValidation,
        previousCompletedShift,
        extendedDrivingDaysUsed,
        drivingMaximum,
        extendedShiftsUsed,
        shiftMaximum,
        actualDrivingMinutes,
        actualShiftMinutes,
        workingMinutes,
        isWeeklyRestBlocked,
        hasSelectedRestType,
        isRestTypeDialogOpen,
        isDeleteConfirmOpen,
        setIsRestTypeDialogOpen,
        setIsDeleteConfirmOpen,
        handleStartDateChange,
        handleStartTimeChange,
        handleEndDateChange,
        handleEndTimeChange,
        handleDrivingChange,
        handleBreakChange,
        handleRestTypeChange,
        handleEarnFocus,
        handleEarnChange,
        handleEarnBlur,
        handleRestTypeSelection,
        handleSubmit,
        handleCancel,
        handleDelete,
    };
}