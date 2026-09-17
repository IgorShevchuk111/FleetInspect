'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

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

import type {
  Shift,
  ShiftFormData,
} from '@/features/driver-journal/types/ driver-journal';

import { minutesToDuration } from '../utils/driver-journal';

import { DurationInputField } from './duration-input';

type ShiftDialogProps = {
  open: boolean;
  shift?: Shift | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ShiftFormData) => void;
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
  return {
    date: getTodayDate(),
    start: getCurrentTime(),
    driving: {
      hours: 0,
      minutes: 0,
    },
    shift: {
      hours: 0,
      minutes: 0,
    },
    break: {
      hours: 0,
      minutes: 0,
    },
    end: '',
  };
}

function getShiftForm(shift: Shift): ShiftFormData {
  return {
    date: shift.date,
    start: shift.start,
    driving: minutesToDuration(shift.driving),
    shift: minutesToDuration(shift.shift),
    break: minutesToDuration(shift.break),
    end: shift.end,
  };
}

export function ShiftDialog({
  open,
  shift,
  onOpenChange,
  onSubmit,
}: ShiftDialogProps) {
  const [form, setForm] = useState<ShiftFormData>(getInitialForm());

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit shift' : 'Add shift'}</DialogTitle>

          <DialogDescription>
            {isEditing
              ? 'Update the details of your driving shift.'
              : 'Enter the details of your driving shift.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>

            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(event) => updateField('date', event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Start</Label>

              <Input
                id="start"
                type="time"
                value={form.start}
                onChange={(event) => updateField('start', event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end">End</Label>

              <Input
                id="end"
                type="time"
                value={form.end}
                onChange={(event) => updateField('end', event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <DurationInputField
              label="Driving"
              value={form.driving}
              onChange={(value) => updateField('driving', value)}
            />

            <DurationInputField
              label="Shift"
              value={form.shift}
              onChange={(value) => updateField('shift', value)}
            />

            <DurationInputField
              label="Break"
              value={form.break}
              onChange={(value) => updateField('break', value)}
            />
          </div>

          <DialogFooter>
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
  );
}
