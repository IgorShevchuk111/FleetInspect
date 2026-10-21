'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { enGB, uk } from 'date-fns/locale';

import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { useTranslations } from '@/features/driver-journal/i18n/use-translations';
import type { ShiftFormData } from '@/features/driver-journal/types/driver-journal';
import { minutesToDuration } from '@/features/driver-journal/utils/duration';
import { getMaxShiftEndDateTime } from '@/features/driver-journal/utils/shift-status';

type ShiftTimesSectionProps = {
  form: ShiftFormData;
  hasUnfinishedPreviousShift: boolean;
  canEnterRestOfShift: boolean;
  shiftMaximum: number;
  sharedAllowanceUsed: number;
  actualShiftMinutes: number;
  onStartDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onStartTimeBlur: () => void;
  onEndDateChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
};

function dateStringToDate(value: string): Date | undefined {
  if (!value) return undefined;

  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) return undefined;

  return new Date(year, month - 1, day);
}

function dateToDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDate(value: string, language: 'en' | 'uk'): string {
  const date = dateStringToDate(value);

  if (!date) {
    return language === 'uk' ? 'Виберіть дату' : 'Select date';
  }

  return new Intl.DateTimeFormat(language === 'uk' ? 'uk-UA' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDuration(minutes: number): string {
  const duration = minutesToDuration(minutes);

  return `${duration.hours}h ${duration.minutes}m`;
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
  const { language, t } = useTranslations();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        aria-label={`${t(id === 'start-date' ? 'startDate' : 'endDate')}: ${formatDate(value, language)}`}
        className="inline-flex h-10 w-full min-w-0 items-center justify-start gap-2 rounded-md border border-input bg-background px-3 text-left text-md font-normal shadow-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
      >
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{formatDate(value, language)}</span>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          locale={language === 'uk' ? uk : enGB}
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) return;

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

export function ShiftTimesSection({
  form,
  hasUnfinishedPreviousShift,
  canEnterRestOfShift,
  shiftMaximum,
  sharedAllowanceUsed,
  actualShiftMinutes,
  onStartDateChange,
  onStartTimeChange,
  onStartTimeBlur,
  onEndDateChange,
  onEndTimeChange,
}: ShiftTimesSectionProps) {
  const { language, t } = useTranslations();

  const maximumEnd =
    form.date && form.start
      ? getMaxShiftEndDateTime(form.date, form.start, shiftMaximum)
      : null;

  const maximumType =
    shiftMaximum >= 15 * 60 ? t('extendedMaximum') : t('regularMaximum');

  return (
    <section className="min-w-0 space-y-5">
      <div className="min-w-0 space-y-2">
        <Label htmlFor="start-date" className="text-muted-foreground text-lg">
          {t('start')}
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
            aria-label={t('startTime')}
            className="h-10 min-h-8 w-full min-w-0 appearance-none rounded-md border border-input bg-background px-2"
          />
        </div>
      </div>

      <div className="min-w-0 space-y-2">
        <Label htmlFor="end-date" className="text-muted-foreground text-lg">
          {t('end')}
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
            aria-label={t('endTime')}
            className="h-10 min-h-8 w-full min-w-0 appearance-none rounded-md border border-input bg-background px-2"
          />
        </div>

        {maximumEnd && (
          <p className="text-small leading-relaxed text-muted-foreground">
            {maximumType}: {formatDate(maximumEnd.date, language)},{' '}
            {maximumEnd.time}
          </p>
        )}
      </div>

      <div className="flex min-w-0 items-center justify-between gap-3 border-t border-border pt-3">
        <div className="min-w-0 space-y-1">
          <Label className="text-muted-foreground text-lg">{t('shift')}</Label>
          <p className="text-small leading-relaxed text-muted-foreground">
            {t('sharedAllowance')}: {sharedAllowanceUsed}/3 {t('used')}
          </p>
        </div>

        <span className="shrink-0 tabular-nums">
          {formatDuration(actualShiftMinutes)} / {formatDuration(shiftMaximum)}
        </span>
      </div>

      {hasUnfinishedPreviousShift && (
        <p className="text-small font-medium leading-body text-danger">
          {t('previousShiftMustFinish')}
        </p>
      )}
    </section>
  );
}
