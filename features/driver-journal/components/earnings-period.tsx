'use client';

import { useState } from 'react';

import { Banknote, CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Shift } from '@/features/driver-journal/types/driver-journal';

type EarningsPeriodProps = {
  allShifts: Shift[];
  defaultStartDate: string;
  defaultEndDate: string;
};

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDateLabel(value: string): string {
  const date = parseDate(value);

  if (!date) return 'Select date';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

export function EarningsPeriod({
  allShifts,
  defaultStartDate,
  defaultEndDate,
}: EarningsPeriodProps) {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const validPeriod =
    Boolean(parseDate(startDate)) &&
    Boolean(parseDate(endDate)) &&
    startDate <= endDate;

  const totalEarned = validPeriod
    ? allShifts.reduce((total, shift) => {
        if (shift.date >= startDate && shift.date <= endDate) {
          return total + (Number(shift.earn) || 0);
        }

        return total;
      }, 0)
    : 0;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-2">
        <Banknote className="size-4 shrink-0 text-muted-foreground" />

        <h4 className="text-sm font-semibold leading-heading text-foreground">
          Earnings period
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0 space-y-1.5">
          <span className="text-caption leading-body text-muted-foreground">
            From
          </span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full min-w-0 justify-start gap-2 font-normal"
              >
                <CalendarIcon className="size-4 shrink-0" />
                <span className="truncate">{formatDateLabel(startDate)}</span>
              </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                startMonth={new Date(2000, 0)}
                endMonth={new Date(new Date().getFullYear() + 1, 11)}
                selected={parseDate(startDate)}
                defaultMonth={parseDate(startDate)}
                onSelect={(date) => {
                  if (date) setStartDate(toDateString(date));
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="min-w-0 space-y-1.5">
          <span className="text-caption leading-body text-muted-foreground">
            To
          </span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full min-w-0 justify-start gap-2 font-normal"
              >
                <CalendarIcon className="size-4 shrink-0" />
                <span className="truncate">{formatDateLabel(endDate)}</span>
              </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                startMonth={new Date(2000, 0)}
                endMonth={new Date(new Date().getFullYear() + 1, 11)}
                selected={parseDate(endDate)}
                defaultMonth={parseDate(endDate)}
                onSelect={(date) => {
                  if (date) setEndDate(toDateString(date));
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {!validPeriod ? (
        <p className="text-sm text-destructive">
          Select a valid date range. The end date must not be before the start
          date.
        </p>
      ) : (
        <div className="flex items-end justify-between gap-3 border-t border-border/50 pt-3">
          <div className="min-w-0">
            <p className="text-caption leading-body text-muted-foreground">
              {formatDateLabel(startDate)} – {formatDateLabel(endDate)}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">Total earned</p>
          </div>

          <p className="shrink-0 text-lg font-semibold leading-heading tabular-nums text-foreground">
            {formatCurrency(totalEarned)}
          </p>
        </div>
      )}
    </div>
  );
}
