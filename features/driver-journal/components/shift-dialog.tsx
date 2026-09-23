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

import { DurationInputField } from './duration-input';

type ShiftDialogProps = {
  open: boolean;
  shift?: Shift | null;
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
    driving: { hours: 0, minutes: 0 },
    break: { hours: 0, minutes: 0 },
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

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: typeof CalendarDays;
  title: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {' '}
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
        {' '}
        <Icon className="size-3.5 text-muted-foreground" />{' '}
      </div>
      <span className="text-sm font-medium">{title}</span>
    </div>
  );
}

export function ShiftDialog({
  open,
  shift,
  onOpenChange,
  onSubmit,
  onDelete,
}: ShiftDialogProps) {
  const [form, setForm] = useState<ShiftFormData>(getInitialForm());
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const isEditing = Boolean(shift);

  useEffect(() => {
    if (!open) return;

    if (shift) {
      setForm(getShiftForm(shift));
      return;
    }

    setForm(getInitialForm());
  }, [open, shift]);

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
    onSubmit(form);
  }

  function handleCancel() {
    setForm(getInitialForm());
    onOpenChange(false);
  }

  function handleDelete() {
    if (!onDelete) return;

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

  return (
    <>
      {' '}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-xl flex-col gap-0 overflow-hidden p-0 sm:max-h-[90vh]"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
          }}
        >
          {' '}
          <DialogHeader className="shrink-0 border-b px-4 py-3 sm:px-6 sm:py-4">
            {' '}
            <div className="flex min-w-0 items-center gap-3">
              {' '}
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                {' '}
                <Clock3 className="size-4.5 text-primary" />{' '}
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
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="space-y-4 px-4 py-4 sm:px-6">
                <section>
                  <SectionHeader icon={CalendarDays} title="Shift times" />

                  <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                    <div className="min-w-0 space-y-1.5">
                      <Label
                        htmlFor="start-date"
                        className="text-xs text-muted-foreground"
                      >
                        Start
                      </Label>

                      <div className="grid min-w-0 grid-cols-2 gap-2">
                        <Input
                          id="start-date"
                          type="date"
                          value={form.date}
                          onChange={(event) =>
                            updateField('date', event.target.value)
                          }
                          className="min-w-0"
                        />

                        <Input
                          id="start-time"
                          type="time"
                          value={form.start}
                          onChange={(event) =>
                            updateField('start', event.target.value)
                          }
                          className="min-w-0"
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

                      <div className="grid min-w-0 grid-cols-2 gap-2">
                        <Input
                          id="end-date"
                          type="date"
                          value={form.endDate}
                          onChange={(event) =>
                            updateField('endDate', event.target.value)
                          }
                          className="min-w-0"
                        />

                        <Input
                          id="end-time"
                          type="time"
                          value={form.end}
                          onChange={(event) =>
                            updateField('end', event.target.value)
                          }
                          className="min-w-0"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="border-t pt-4">
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

                <section className="border-t pt-4">
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
                        <SelectTrigger id="rest-type" className="w-full">
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
                    </div>

                    <div className="min-w-0 space-y-1.5">
                      <Label
                        htmlFor="earn"
                        className="text-xs text-muted-foreground"
                      >
                        Earn (£)
                      </Label>

                      <div className="relative">
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
                          className="pl-9"
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

                <Button type="submit" className="min-w-28">
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
        <AlertDialogContent>
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
