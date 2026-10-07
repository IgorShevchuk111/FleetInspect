'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type {
  RestType,
  Shift,
  ShiftFormData,
} from '@/features/driver-journal/types/ driver-journal';

type RestTypeDialogProps = {
  open: boolean;
  form: ShiftFormData;
  previousCompletedShift: Shift | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (restType: RestType) => void;
};

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

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(value);
}

function formatRestDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

export function RestTypeDialog({
  open,
  form,
  previousCompletedShift,
  onOpenChange,
  onSelect,
}: RestTypeDialogProps) {
  const currentStartDateTime = getDateTime(form.date, form.start);

  const previousEndDateTime = previousCompletedShift
    ? getDateTime(
        previousCompletedShift.endDate ?? previousCompletedShift.date,
        previousCompletedShift.end,
      )
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[100] w-[calc(100vw-2rem)] max-w-sm">
        <DialogHeader>
          <DialogTitle>What type of rest?</DialogTitle>
        </DialogHeader>

        {previousCompletedShift ? (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {previousEndDateTime ? formatDateTime(previousEndDateTime) : ''}
              {' → '}
              {currentStartDateTime ? formatDateTime(currentStartDateTime) : ''}
            </p>

            <p className="text-sm font-medium">
              Rest: {formatRestDuration(previousCompletedShift.rest)}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {currentStartDateTime ? (
              <p className="text-sm text-muted-foreground">
                {formatDateTime(currentStartDateTime)}
              </p>
            ) : null}

            <p className="text-sm text-muted-foreground">
              No previous completed shift
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            className="flex-1"
            onClick={() => onSelect('daily')}
          >
            Daily rest
          </Button>

          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onSelect('weekly')}
          >
            Weekly rest
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
