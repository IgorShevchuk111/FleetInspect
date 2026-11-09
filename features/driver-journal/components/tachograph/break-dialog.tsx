'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

import type { Database } from '@/types/supabase/database';

type DriverJournalBreakRow =
  Database['public']['Tables']['driver_journal_breaks']['Row'];

type BreakDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breaks: DriverJournalBreakRow[];
  disabled: boolean;
  onAdd: (startAt: string, endAt: string) => Promise<boolean>;
  onDelete: (breakId: string) => Promise<void>;
};

function toLocalDateTimeValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function parseLocalDateTime(value: string): Date | undefined {
  if (!value) return undefined;

  const [datePart, timePart] = value.split('T');

  if (!datePart || !timePart) return undefined;

  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  if (
    !year ||
    !month ||
    !day ||
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return undefined;
  }

  return new Date(year, month - 1, day, hours, minutes);
}

function updateDatePart(value: string, date: Date): string {
  const current = parseLocalDateTime(value) ?? new Date();

  const updated = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    current.getHours(),
    current.getMinutes(),
  );

  return toLocalDateTimeValue(updated);
}

function updateTimePart(value: string, time: string): string {
  if (!value) return '';

  const [hours, minutes] = time.split(':').map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return value;
  }

  const current = parseLocalDateTime(value);

  if (!current) return value;

  current.setHours(hours, minutes, 0, 0);

  return toLocalDateTimeValue(current);
}

function formatDate(value: string): string {
  const date = parseLocalDateTime(value);

  if (!date) return 'Select date';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatBreakDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value));
}

function formatDuration(startAt: string, endAt: string): string {
  const totalMinutes = Math.floor(
    (new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000,
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;

  return `${hours}h ${minutes}m`;
}

type DateTimeFieldProps = {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
};

function DateTimeField({
  id,
  label,
  value,
  disabled,
  onDateChange,
  onTimeChange,
}: DateTimeFieldProps) {
  const selectedDate = parseLocalDateTime(value);

  return (
    <div className="min-w-0 space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="h-11 w-full justify-start gap-2 px-3 font-normal"
          >
            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm">{formatDate(value)}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) onDateChange(date);
            }}
          />
        </PopoverContent>
      </Popover>

      <Input
        id={`${id}-time`}
        type="time"
        value={value ? value.split('T')[1] : ''}
        disabled={disabled}
        className="h-11 tabular-nums"
        onChange={(event) => onTimeChange(event.target.value)}
      />
    </div>
  );
}

export function BreakDialog({
  open,
  onOpenChange,
  breaks,
  disabled,
  onAdd,
  onDelete,
}: BreakDialogProps) {
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingBreakId, setDeletingBreakId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const now = new Date();
    const defaultStart = new Date(now.getTime() - 15 * 60000);

    setStartAt(toLocalDateTimeValue(defaultStart));
    setEndAt(toLocalDateTimeValue(now));
    setError(null);
  }, [open]);

  const sortedBreaks = [...breaks].sort(
    (a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime(),
  );

  const totalMinutes = breaks.reduce(
    (total, item) =>
      total +
      Math.floor(
        (new Date(item.end_at).getTime() - new Date(item.start_at).getTime()) /
          60000,
      ),
    0,
  );

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const handleAdd = async () => {
    setError(null);

    if (!startAt || !endAt) {
      setError('Select both dates and times.');
      return;
    }

    const startTimestamp = new Date(startAt).getTime();
    const endTimestamp = new Date(endAt).getTime();

    if (
      !Number.isFinite(startTimestamp) ||
      !Number.isFinite(endTimestamp) ||
      endTimestamp <= startTimestamp
    ) {
      setError('End time must be after start time.');
      return;
    }

    setIsSaving(true);

    try {
      const success = await onAdd(
        new Date(startTimestamp).toISOString(),
        new Date(endTimestamp).toISOString(),
      );

      if (success) {
        const now = new Date();

        setStartAt(toLocalDateTimeValue(new Date(now.getTime() - 15 * 60000)));
        setEndAt(toLocalDateTimeValue(now));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (breakId: string) => {
    setDeletingBreakId(breakId);

    try {
      await onDelete(breakId);
    } finally {
      setDeletingBreakId(null);
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
          <DialogTitle className="text-lg font-semibold">Breaks</DialogTitle>

          <DialogDescription className="sr-only">
            View, add and delete break intervals for this shift.
          </DialogDescription>

          <div className="flex items-end justify-between pt-3">
            <div>
              <p className="text-xs text-muted-foreground">Total break time</p>

              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
                {totalHours}h {String(remainingMinutes).padStart(2, '0')}m
              </p>
            </div>

            <p className="pb-1 text-sm text-muted-foreground">
              {breaks.length} {breaks.length === 1 ? 'break' : 'breaks'}
            </p>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <section className="space-y-3">
            <h3 className="text-sm font-medium">Add break</h3>

            <div className="grid grid-cols-2 gap-3">
              <DateTimeField
                id="break-start"
                label="Start"
                value={startAt}
                disabled={disabled || isSaving}
                onDateChange={(date) => {
                  setStartAt((current) => updateDatePart(current, date));
                  setError(null);
                }}
                onTimeChange={(time) => {
                  setStartAt((current) => updateTimePart(current, time));
                  setError(null);
                }}
              />

              <DateTimeField
                id="break-end"
                label="End"
                value={endAt}
                disabled={disabled || isSaving}
                onDateChange={(date) => {
                  setEndAt((current) => updateDatePart(current, date));
                  setError(null);
                }}
                onTimeChange={(time) => {
                  setEndAt((current) => updateTimePart(current, time));
                  setError(null);
                }}
              />
            </div>

            {error && (
              <p className="text-xs text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button
              type="button"
              className="h-11 w-full"
              disabled={disabled || isSaving || !startAt || !endAt}
              onClick={handleAdd}
            >
              {isSaving ? 'Saving...' : 'Add break'}
            </Button>
          </section>

          <section className="mt-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Recorded breaks</h3>

              <span className="text-xs text-muted-foreground">
                {breaks.length}
              </span>
            </div>

            {sortedBreaks.length === 0 ? (
              <div className="flex min-h-28 flex-col items-center justify-center rounded-xl border border-dashed px-4 text-center">
                <p className="text-sm font-medium">No breaks yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Added breaks will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y rounded-xl border">
                {sortedBreaks.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-3 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium tabular-nums">
                        {formatTime(item.start_at)} – {formatTime(item.end_at)}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatBreakDate(item.start_at)}
                        {formatBreakDate(item.start_at) !==
                          formatBreakDate(item.end_at) &&
                          ` – ${formatBreakDate(item.end_at)}`}
                        {' · '}
                        {formatDuration(item.start_at, item.end_at)}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={disabled || deletingBreakId !== null}
                      onClick={() => handleDelete(item.id)}
                      aria-label="Delete break"
                    >
                      {deletingBreakId === item.id ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
