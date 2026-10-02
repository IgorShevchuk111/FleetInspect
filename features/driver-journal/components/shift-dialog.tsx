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
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = dateStringToDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className="min-w-0 flex-1 justify-start text-left font-normal"
        >
          <CalendarDays className="mr-2 size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{formatDate(value)}</span>
        </Button>
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

  const isEditing = Boolean(shift);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (shift) {
      setForm(getShiftForm(shift));
      return;
    }

    setForm(getInitialForm());
  }, [open, shift]);

  const weeklyRestValidation =
    form.restType === 'weekly'
      ? getWeeklyRestValidation(shifts, form.date, form.start, shift?.id)
      : {
          valid: true,
          isReduced: false,
        };

  function updateField(
    field: keyof ShiftFormData,
    value: ShiftFormData[keyof ShiftFormData],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.restType === 'weekly' && !weeklyRestValidation.valid) {
      return;
    }

    onSubmit(form);
  }

  function handleCancel() {
    setForm(getInitialForm());
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="
    flex
    h-[100dvh]
    max-h-[100dvh]
    w-full
    max-w-full
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
          onOpenAutoFocus={(event) => {
            event.preventDefault();
          }}
        >
          <DialogHeader className="shrink-0 border-b px-4 py-3 sm:px-6 sm:py-4">
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
            <div className="min-h-0 min-w-0 flex-1 touch-pan-y overflow-x-hidden overflow-y-auto overscroll-contain">
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
                          onChange={(value) => updateField('date', value)}
                        />

                        <Input
                          id="start-time"
                          type="time"
                          value={form.start}
                          onChange={(event) =>
                            updateField('start', event.target.value)
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
                        />

                        <Input
                          id="end-time"
                          type="time"
                          value={form.end}
                          onChange={(event) =>
                            updateField('end', event.target.value)
                          }
                          className="w-[7.5rem]"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="min-w-0 border-t pt-4">
                  <SectionHeader icon={Timer} title="Driving & break" />

                  <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                    <div className="min-w-0 rounded-lg border bg-muted/20 px-3 py-2.5">
                      <DurationInputField
                        label="Driving"
                        value={form.driving}
                        onChange={(value) => updateField('driving', value)}
                      />
                    </div>

                    <div className="min-w-0 rounded-lg border bg-muted/20 px-3 py-2.5">
                      <DurationInputField
                        label="Break"
                        value={form.break}
                        onChange={(value) => updateField('break', value)}
                      />
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

                    <div className="min-w-0 space-y-1.5">
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
                          className="min-w-0 max-w-full pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <DialogFooter className="shrink-0 flex-row items-center justify-between gap-2 border-t px-4 py-3 sm:px-6">
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
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
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
                  disabled={isWeeklyRestBlocked}
                  className="min-w-28"
                >
                  {isEditing ? 'Save changes' : 'Add shift'}
                </Button>
              </div>
            </DialogFooter>
          </form>
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
