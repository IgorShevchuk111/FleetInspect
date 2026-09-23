'use client';

import { useEffect, useState } from 'react';

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

import { minutesToDuration } from '@/features/driver-journal/utils/driver-journal';

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
    rest: { hours: 0, minutes: 0 },
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
    rest: minutesToDuration(shift.rest),
    restType: shift.restType,
    end: shift.end ?? '',
    endDate: shift.endDate ?? shift.date,
    earn: shift.earn,
  };
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit shift' : 'Add shift'}</DialogTitle>

            <DialogDescription>
              {isEditing
                ? 'Update the details of your driving shift.'
                : 'Enter the details of your driving shift.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Start */}
            <div className="space-y-2">
              <Label>Start</Label>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="start-date"
                  type="date"
                  value={form.date}
                  onChange={(event) => updateField('date', event.target.value)}
                />

                <Input
                  id="start-time"
                  type="time"
                  value={form.start}
                  onChange={(event) => updateField('start', event.target.value)}
                />
              </div>
            </div>

            {/* End */}
            <div className="space-y-2">
              <Label>End</Label>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="end-date"
                  type="date"
                  value={form.endDate}
                  onChange={(event) =>
                    updateField('endDate', event.target.value)
                  }
                />

                <Input
                  id="end-time"
                  type="time"
                  value={form.end}
                  onChange={(event) => updateField('end', event.target.value)}
                />
              </div>
            </div>

            {/* Durations */}
            <div className="space-y-4">
              <DurationInputField
                label="Driving"
                value={form.driving}
                onChange={(value) => updateField('driving', value)}
              />

              <DurationInputField
                label="Break"
                value={form.break}
                onChange={(value) => updateField('break', value)}
              />
            </div>

            {/* Rest type */}
            <div className="space-y-2">
              <Label htmlFor="rest-type">Rest type</Label>

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

            {/* Earn */}
            <div className="space-y-2">
              <Label htmlFor="earn">Earn (£)</Label>

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
              />
            </div>

            <DialogFooter>
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="mr-auto"
                >
                  Delete
                </Button>
              )}

              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>

              <Button type="submit">
                {isEditing ? 'Save changes' : 'Add shift'}
              </Button>
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
