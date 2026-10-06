'use client';

import { useEffect, useState } from 'react';

import {
  Banknote,
  CalendarDays,
  Clock3,
  Moon,
  Timer,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { Calendar } from '@/components/ui/calendar';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type {
  RestType,
  Shift,
  ShiftFormData,
} from '@/features/driver-journal/types/ driver-journal';

import { minutesToDuration } from '@/features/driver-journal/utils/duration';

import { countExtendedDrivingDays } from '@/features/driver-journal/utils/compliance';

import { buildExtendedShiftUsage } from '@/features/driver-journal/utils/compliance-usage';

import { getStartOfWeek } from '@/features/driver-journal/utils/dates';

import { getWeeklyRestValidation } from '@/features/driver-journal/utils/weekly-rest-rules';

import { DurationInputField } from './duration-input';

type ShiftDialogProps = {
  open: boolean;
  shift?: Shift | null;
  shifts?: Shift[];
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

function dateStringToDate(value: string) {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function dateToDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  const date = dateStringToDate(value);

  if (!date) {
    return 'Select date';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(value);
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

  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

function getPreviousCompletedShift(
  shifts: Shift[],
  currentDate: string,
  currentStart: string,
  editingShiftId?: string,
) {
  const currentStartDateTime = getDateTime(currentDate, currentStart);

  if (!currentStartDateTime) {
    return null;
  }

  let previousShift: Shift | null = null;
  let previousEndDateTime: Date | undefined;

  for (const currentShift of shifts) {
    if (editingShiftId && currentShift.id === editingShiftId) {
      continue;
    }

    if (!currentShift.end) {
      continue;
    }

    const endDate = currentShift.endDate ?? currentShift.date;

    const shiftEndDateTime = getDateTime(endDate, currentShift.end);

    if (!shiftEndDateTime) {
      continue;
    }

    if (shiftEndDateTime >= currentStartDateTime) {
      continue;
    }

    if (!previousEndDateTime || shiftEndDateTime > previousEndDateTime) {
      previousEndDateTime = shiftEndDateTime;
      previousShift = currentShift;
    }
  }

  if (!previousShift || !previousEndDateTime) {
    return null;
  }

  const restMinutes = Math.max(
    0,
    Math.round(
      (currentStartDateTime.getTime() - previousEndDateTime.getTime()) / 60000,
    ),
  );

  return {
    shift: previousShift,
    endDate: previousShift.endDate ?? previousShift.date,
    endTime: previousShift.end,
    endDateTime: previousEndDateTime,
    restMinutes,
  };
}

function formatRestDuration(minutes: number) {
  const duration = minutesToDuration(minutes);

  return `${duration.hours}h ${duration.minutes}m`;
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: typeof CalendarDays;
  title: string;
}) {
  return (
    <div className="mb-3 flex min-w-0 items-center gap-2">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>

      <span className="text-sm font-medium">{title}</span>
    </div>
  );
}

function DatePicker({
  id,
  value,
  onChange,
  disabled = false,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const selectedDate = dateStringToDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        className="inline-flex min-w-0 flex-1 items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-left text-sm font-normal shadow-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
      >
        <CalendarDays className="mr-2 size-4 shrink-0 text-muted-foreground" />

        <span className="truncate">{formatDate(value)}</span>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) {
              return;
            }

            onChange(dateToDateString(date));
            setOpen(false);
          }}
          captionLayout="dropdown"
          startMonth={new Date(2000, 0)}
          endMonth={new Date(2100, 11)}
        />
      </PopoverContent>
    </Popover>
  );
}

export function ShiftDialog({
  open,
  shift,
  shifts = [],
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
      ? getWeeklyRestValidation(shifts, form.date, form.start, shift?.id)
      : {
          valid: true,
          isReduced: false,
        };

  const previousCompletedShift = !isEditing
    ? getPreviousCompletedShift(shifts, form.date, form.start)
    : null;

  const canEnterRestOfShift = isEditing || hasSelectedRestType;

  /*
   * Driving allowance:
   *
   * This uses the fixed Monday-Sunday week.
   */
  const selectedDate = dateStringToDate(form.date) ?? new Date();

  const currentWeekStart = getStartOfWeek(selectedDate);

  const extendedDrivingDaysUsed = countExtendedDrivingDays(
    shifts,
    currentWeekStart,
  );

  const drivingMaximum =
    extendedDrivingDaysUsed < MAX_EXTENDED_DRIVING_DAYS
      ? EXTENDED_DAILY_DRIVING_LIMIT
      : DAILY_DRIVING_LIMIT;

  /*
   * Extended-shift allowance:
   *
   * This is deliberately NOT based on Monday-Sunday.
   *
   * It uses the new compliance-usage logic where
   * extended shifts reset after a qualifying weekly rest.
   *
   * Only shifts before the current shift are included.
   */
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

  const extendedShiftUsage = buildExtendedShiftUsage(shiftsBeforeCurrentShift);

  const previousShiftsChronological = [...shiftsBeforeCurrentShift].sort(
    (a, b) => {
      const dateA = getDateTime(a.date, a.start)?.getTime() ?? 0;

      const dateB = getDateTime(b.date, b.start)?.getTime() ?? 0;

      return dateA - dateB;
    },
  );

  const lastPreviousShift =
    previousShiftsChronological[previousShiftsChronological.length - 1];

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

  const actualDrivingMinutes = form.driving.hours * 60 + form.driving.minutes;

  const actualBreakMinutes = form.break.hours * 60 + form.break.minutes;

  const actualShiftMinutes = getFormShiftMinutes(
    form.date,
    form.start,
    form.endDate,
    form.end,
  );

  const workingMinutes = Math.max(0, actualShiftMinutes - actualBreakMinutes);

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
    if (!isEditing && !hasSelectedRestType && form.date && form.start) {
      setIsRestTypeDialogOpen(true);
    }
  }

  function handleStartDateChange(value: string) {
    updateField('date', value);

    if (!isEditing && value && form.start) {
      setHasSelectedRestType(false);
      setIsRestTypeDialogOpen(true);
    }
  }

  function handleStartTimeChange(value: string) {
    updateField('start', value);

    if (!isEditing && value && form.date) {
      setHasSelectedRestType(false);
      setIsRestTypeDialogOpen(true);
    }
  }

  function handleRestTypeSelection(restType: RestType) {
    updateField('restType', restType);
    setHasSelectedRestType(true);
    setIsRestTypeDialogOpen(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isEditing && !hasSelectedRestType) {
      openRestTypeDialog();
      return;
    }

    if (form.restType === 'weekly' && !weeklyRestValidation.valid) {
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

  const isWeeklyRestBlocked =
    form.restType === 'weekly' && !weeklyRestValidation.valid;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setIsRestTypeDialogOpen(false);
          }

          onOpenChange(nextOpen);
        }}
      >
        <DialogContent
          className="
            flex
            h-[100dvh]
            max-h-[100dvh]
            w-screen
            max-w-none
            flex-col
            gap-0
            overflow-hidden
            rounded-none
            p-0
            sm:h-auto
            sm:max-h-[90vh]
            sm:w-[calc(100vw-2rem)]
            sm:max-w-xl
            sm:rounded-lg
          "
        >
          <DialogHeader
            className="
              shrink-0
              border-b
              px-4
              py-3
              sm:px-6
              sm:py-4
            "
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Clock3 className="size-4.5 text-primary" />
              </div>

              <div className="min-w-0">
                <DialogTitle className="text-lg">
                  {isEditing ? 'Edit shift' : 'Add shift'}
                </DialogTitle>

                <DialogDescription className="mt-0.5 text-xs">
                  {isEditing
                    ? 'Update your driving shift details.'
                    : 'Enter your driving shift details.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          >
            <div
              className="
                min-h-0
                min-w-0
                flex-1
                touch-pan-y
                overflow-x-hidden
                overflow-y-auto
                overscroll-contain
              "
            >
              <div className="min-w-0 space-y-4 px-4 py-4 sm:px-6">
                <section className="min-w-0">
                  <SectionHeader icon={CalendarDays} title="Shift times" />

                  <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                    <div className="min-w-0 space-y-1.5">
                      <Label
                        htmlFor="start-date"
                        className="text-xs text-muted-foreground"
                      >
                        Start
                      </Label>

                      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
                        <DatePicker
                          id="start-date"
                          value={form.date}
                          onChange={handleStartDateChange}
                        />

                        <Input
                          id="start-time"
                          type="time"
                          value={form.start}
                          onChange={(event) =>
                            handleStartTimeChange(event.target.value)
                          }
                          className="w-[7.5rem]"
                        />
                      </div>
                    </div>

                    <div className="min-w-0 space-y-1.5">
                      <Label
                        htmlFor="end-date"
                        className="text-xs text-muted-foreground"
                      >
                        End
                      </Label>

                      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
                        <DatePicker
                          id="end-date"
                          value={form.endDate}
                          onChange={(value) => updateField('endDate', value)}
                          disabled={!canEnterRestOfShift}
                        />

                        <Input
                          id="end-time"
                          type="time"
                          value={form.end}
                          onChange={(event) =>
                            updateField('end', event.target.value)
                          }
                          disabled={!canEnterRestOfShift}
                          className="w-[7.5rem]"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="min-w-0 border-t pt-4">
                  <SectionHeader icon={Timer} title="Driving & break" />

                  <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                    <div
                      className={`min-w-0 rounded-lg border bg-muted/20 px-3 py-2.5 ${
                        !canEnterRestOfShift ? 'opacity-50' : ''
                      }`}
                    >
                      <DurationInputField
                        label="Driving"
                        value={form.driving}
                        onChange={(value) => updateField('driving', value)}
                        disabled={!canEnterRestOfShift}
                      />

                      {actualDrivingMinutes > 0 ? (
                        <p className="mt-2 text-sm font-semibold tabular-nums">
                          {formatRestDuration(actualDrivingMinutes)} /{' '}
                          {formatRestDuration(drivingMaximum)}
                        </p>
                      ) : null}

                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        Max today: {formatRestDuration(drivingMaximum)} ·
                        Extended days {extendedDrivingDaysUsed}/
                        {MAX_EXTENDED_DRIVING_DAYS} used
                      </p>
                    </div>

                    <div
                      className={`min-w-0 rounded-lg border bg-muted/20 px-3 py-2.5 ${
                        !canEnterRestOfShift ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">Shift</span>

                        {actualShiftMinutes > 0 ? (
                          <span className="text-sm font-semibold tabular-nums">
                            {formatRestDuration(actualShiftMinutes)} /{' '}
                            {formatRestDuration(shiftMaximum)}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        Max today: {formatRestDuration(shiftMaximum)} · Extended
                        shifts {extendedShiftsUsed}/{MAX_EXTENDED_SHIFTS} used
                      </p>
                    </div>

                    <div
                      className={`min-w-0 rounded-lg border bg-muted/20 px-3 py-2.5 ${
                        !canEnterRestOfShift ? 'opacity-50' : ''
                      }`}
                    >
                      <DurationInputField
                        label="Break"
                        value={form.break}
                        onChange={(value) => updateField('break', value)}
                        disabled={!canEnterRestOfShift}
                      />
                    </div>

                    <div
                      className={`min-w-0 rounded-lg border bg-muted/20 px-3 py-2.5 ${
                        !canEnterRestOfShift ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">Working</span>

                        {actualShiftMinutes > 0 ? (
                          <span className="text-sm font-semibold tabular-nums">
                            {formatRestDuration(workingMinutes)}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Shift time minus break
                      </p>
                    </div>
                  </div>
                </section>

                <section className="min-w-0 border-t pt-4">
                  <SectionHeader icon={Moon} title="Rest & earnings" />

                  <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                    <div className="min-w-0 space-y-1.5">
                      <Label
                        htmlFor="rest-type"
                        className="text-xs text-muted-foreground"
                      >
                        Rest type
                      </Label>

                      <Select
                        value={form.restType}
                        onValueChange={(value) =>
                          updateField('restType', value as RestType)
                        }
                        disabled={!canEnterRestOfShift}
                      >
                        <SelectTrigger
                          id="rest-type"
                          className="w-full min-w-0"
                        >
                          <SelectValue placeholder="Select rest type" />
                        </SelectTrigger>

                        <SelectContent
                          position="popper"
                          side="bottom"
                          sideOffset={6}
                          className="z-[100] min-w-[var(--radix-select-trigger-width)] bg-background"
                        >
                          <SelectItem value="daily">Daily rest</SelectItem>

                          <SelectItem value="weekly">Weekly rest</SelectItem>
                        </SelectContent>
                      </Select>

                      {form.restType === 'weekly' &&
                      weeklyRestValidation.valid &&
                      weeklyRestValidation.isReduced ? (
                        <p className="text-xs text-amber-600">
                          Reduced weekly rest: 24–44h 59m. Your next weekly rest
                          must be regular.
                        </p>
                      ) : null}

                      {form.restType === 'weekly' &&
                      weeklyRestValidation.valid &&
                      !weeklyRestValidation.isReduced ? (
                        <p className="text-xs text-green-600">
                          Regular weekly rest: 45 hours or more.
                        </p>
                      ) : null}

                      {form.restType === 'weekly' &&
                      !weeklyRestValidation.valid ? (
                        <p className="text-xs font-medium text-destructive">
                          {weeklyRestValidation.message}
                        </p>
                      ) : null}
                    </div>

                    <div
                      className={`min-w-0 space-y-1.5 ${
                        !canEnterRestOfShift ? 'opacity-50' : ''
                      }`}
                    >
                      <Label
                        htmlFor="earn"
                        className="text-xs text-muted-foreground"
                      >
                        Earn (£)
                      </Label>

                      <div className="relative min-w-0">
                        <Banknote className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                          id="earn"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={form.earn}
                          onFocus={handleEarnFocus}
                          onBlur={handleEarnBlur}
                          onChange={handleEarnChange}
                          disabled={!canEnterRestOfShift}
                          className="min-w-0 max-w-full pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <DialogFooter
              className="
                shrink-0
                flex-row
                flex-wrap
                items-center
                justify-center
                gap-2
                border-t
                px-4
                py-3
                pb-[calc(0.75rem+env(safe-area-inset-bottom))]
                sm:px-6
                sm:py-3
                sm:pb-3
              "
            >
              {isEditing ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              ) : null}

              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="min-w-20"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  isWeeklyRestBlocked || (!isEditing && !hasSelectedRestType)
                }
                className="min-w-28"
              >
                {isEditing ? 'Save changes' : 'Add shift'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRestTypeDialogOpen}
        onOpenChange={(nextOpen) => {
          setIsRestTypeDialogOpen(nextOpen);
        }}
      >
        <DialogContent className="z-[100] w-[calc(100vw-2rem)] max-w-sm">
          <DialogHeader>
            <DialogTitle>What type of rest?</DialogTitle>
          </DialogHeader>

          {previousCompletedShift ? (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {formatDateTime(previousCompletedShift.endDateTime)} →
                {form.date && form.start
                  ? (() => {
                      const startDateTime = getDateTime(form.date, form.start);

                      return startDateTime
                        ? ` ${formatDateTime(startDateTime)}`
                        : '';
                    })()
                  : ''}
              </p>

              <p className="text-sm font-medium">
                Rest: {formatRestDuration(previousCompletedShift.restMinutes)}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {form.date && form.start
                ? (() => {
                    const startDateTime = getDateTime(form.date, form.start);

                    return startDateTime ? (
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(startDateTime)}
                      </p>
                    ) : null;
                  })()
                : null}

              <p className="text-sm text-muted-foreground">
                No previous completed shift
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              className="flex-1"
              onClick={() => handleRestTypeSelection('daily')}
            >
              Daily rest
            </Button>

            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleRestTypeSelection('weekly')}
            >
              Weekly rest
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setIsRestTypeDialogOpen(false)}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete shift?</AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. This shift will be permanently
              removed from the journal.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
