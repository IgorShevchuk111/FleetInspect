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

import type { ShiftFormData } from '@/features/driver-journal/types/ driver-journal';

import { DurationInputField } from './duration-input';

type ShiftDialogProps = {
  open: boolean;
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

export function ShiftDialog({
  open,
  onOpenChange,
  onSubmit,
}: ShiftDialogProps) {
  const [form, setForm] = useState<ShiftFormData>(getInitialForm());

  useEffect(() => {
    if (open) {
      setForm(getInitialForm());
    }
  }, [open]);

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

    setForm(getInitialForm());
  }

  function handleCancel() {
    setForm(getInitialForm());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add shift</DialogTitle>

          <DialogDescription>
            Enter the details of your driving shift.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>

            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(event) => updateField('date', event.target.value)}
            />
          </div>

          {/* Start / End */}
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

          {/* Durations */}
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

            <Button type="submit">Add shift</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
