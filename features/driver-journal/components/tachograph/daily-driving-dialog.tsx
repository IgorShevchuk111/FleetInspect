'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type DailyDrivingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMinutes: number;
  onSave: (minutes: number) => Promise<boolean>;
};

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

export function DailyDrivingDialog({
  open,
  onOpenChange,
  initialMinutes,
  onSave,
}: DailyDrivingDialogProps) {
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setHours('0');
    setMinutes('0');
    setError(null);
  }, [open]);

  const totalMinutes = Number(hours) * 60 + Number(minutes);

  const handleSave = async () => {
    setError(null);

    const hoursValue = Number(hours);
    const minutesValue = Number(minutes);

    if (
      !Number.isInteger(hoursValue) ||
      !Number.isInteger(minutesValue) ||
      hoursValue < 0 ||
      minutesValue < 0 ||
      minutesValue > 59 ||
      totalMinutes > 24 * 60
    ) {
      setError('Enter a valid driving duration.');
      return;
    }

    setIsSaving(true);

    try {
      const success = await onSave(totalMinutes);

      if (success) {
        onOpenChange(false);
      }
    } catch {
      setError('Could not save driving time. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          fixed inset-0 left-0 top-0 z-50
          flex h-[100dvh] w-full max-w-none
          translate-x-0 translate-y-0
          flex-col gap-0 overflow-hidden
          rounded-none border-0 p-0
          sm:left-1/2 sm:top-1/2
          sm:h-auto sm:max-h-[85dvh]
          sm:w-[calc(100%-2rem)] sm:max-w-lg
          sm:-translate-x-1/2 sm:-translate-y-1/2
          sm:rounded-xl sm:border sm:p-0
        "
      >
        <DialogHeader className="shrink-0 border-b px-5 py-5 text-left sm:px-6">
          <DialogTitle className="text-lg font-semibold">
            Daily driving
          </DialogTitle>

          <DialogDescription className="sr-only">
            Enter and save your total daily driving time.
          </DialogDescription>

          <div className="pt-3">
            <p className="text-xs text-muted-foreground">
              Current driving time
            </p>

            <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
              {formatDuration(initialMinutes)}
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-5 py-6 sm:px-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0 space-y-2">
              <Label
                htmlFor="driving-hours"
                className="text-xs font-medium text-muted-foreground"
              >
                Hours
              </Label>

              <Input
                id="driving-hours"
                type="number"
                min="0"
                max="24"
                value={hours}
                disabled={isSaving}
                className="h-11 tabular-nums"
                onChange={(event) => {
                  setHours(event.target.value);
                  setError(null);
                }}
              />
            </div>

            <div className="min-w-0 space-y-2">
              <Label
                htmlFor="driving-minutes"
                className="text-xs font-medium text-muted-foreground"
              >
                Minutes
              </Label>

              <Input
                id="driving-minutes"
                type="number"
                min="0"
                max="59"
                value={minutes}
                disabled={isSaving}
                className="h-11 tabular-nums"
                onChange={(event) => {
                  setMinutes(event.target.value);
                  setError(null);
                }}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button
            type="button"
            className="h-11 w-full"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
