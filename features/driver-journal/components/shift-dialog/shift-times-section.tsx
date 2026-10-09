'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';

import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import type { ShiftFormData } from '@/features/driver-journal/types/driver-journal';

type ShiftTimesSectionProps = {
  form: ShiftFormData;
  hasUnfinishedPreviousShift: boolean;
  canEnterRestOfShift: boolean;
  onStartDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onStartTimeBlur: () => void;
  onEndDateChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
};

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
        aria-label={`${id === 'start-date' ? 'Start' : 'End'} date: ${formatDate(value)}`}
        className="
          inline-flex
          h-10
          min-w-0
          w-full
          items-center
          justify-start
          gap-2
          rounded-md
          border
          border-input
          bg-background
          px-3
          text-left
          text-sm
          font-normal
          shadow-xs
          outline-none
          transition-colors
          hover:bg-accent
          hover:text-accent-foreground
          focus-visible:border-ring
          focus-visible:ring-3
          focus-visible:ring-ring/50
          disabled:pointer-events-none
          disabled:opacity-50
        "
      >
        <CalendarDays
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
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

function SectionHeader() {
  return (
    <div className="mb-3 flex min-w-0 items-center gap-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <CalendarDays
          aria-hidden="true"
          className="size-4 text-muted-foreground"
        />
      </div>

      <h3 className="text-sm font-medium leading-heading">Shift times</h3>
    </div>
  );
}

export function ShiftTimesSection({
  form,
  hasUnfinishedPreviousShift,
  canEnterRestOfShift,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  onStartTimeBlur,
}: ShiftTimesSectionProps) {
  return (
    <section className="min-w-0">
      <SectionHeader />

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <div className="min-w-0 space-y-1.5">
          <Label
            htmlFor="start-date"
            className="text-caption text-muted-foreground"
          >
            Start
          </Label>

          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_7.5rem] gap-2">
            <DatePicker
              id="start-date"
              value={form.date}
              onChange={onStartDateChange}
            />

            <Input
              id="start-time"
              type="time"
              value={form.start}
              onChange={(event) => onStartTimeChange(event.target.value)}
              onBlur={onStartTimeBlur}
              aria-label="Start time"
              className="w-full min-w-0"
            />
          </div>
        </div>

        <div className="min-w-0 space-y-1.5">
          <Label
            htmlFor="end-date"
            className="text-caption text-muted-foreground"
          >
            End
          </Label>

          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_7.5rem] gap-2">
            <DatePicker
              id="end-date"
              value={form.endDate}
              onChange={onEndDateChange}
              disabled={!canEnterRestOfShift}
            />

            <Input
              id="end-time"
              type="time"
              value={form.end}
              onChange={(event) => onEndTimeChange(event.target.value)}
              disabled={!canEnterRestOfShift}
              aria-label="End time"
              className="w-full min-w-0"
            />
          </div>
        </div>
      </div>

      {hasUnfinishedPreviousShift && (
        <p className="mt-2 text-sm font-medium leading-body text-danger">
          You must finish your previous shift before adding a new shift.
        </p>
      )}
    </section>
  );
}
