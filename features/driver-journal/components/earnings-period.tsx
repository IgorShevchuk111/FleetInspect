'use client';

import { useState } from 'react';
import { enGB, uk } from 'date-fns/locale';
import { Banknote, CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Shift } from '@/features/driver-journal/types/driver-journal';
import { useTranslations } from '@/features/driver-journal/i18n/use-translations';

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

function formatDateLabel(value: string, locale: string): string {
  const date = parseDate(value);

  if (!date) return locale === 'uk-UA' ? 'Виберіть дату' : 'Select date';

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatCurrency(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
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
  const { language, t } = useTranslations();

  const locale = language === 'uk' ? 'uk-UA' : 'en-GB';

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

        <h3 className="text-muted-foreground ">{t('earningsPeriod')}</h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0 space-y-1.5">
          <span className="text-small ">{t('from')}</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full min-w-0 justify-start gap-2 font-normal"
              >
                <CalendarIcon className="size-4 shrink-0" />
                <span className="truncate">
                  {formatDateLabel(startDate, locale)}
                </span>
              </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                locale={language === 'uk' ? uk : enGB}
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
          <span className="text-small ">{t('to')}</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full min-w-0 justify-start gap-2 font-normal"
              >
                <CalendarIcon className="size-4 shrink-0" />
                <span className="truncate">
                  {formatDateLabel(endDate, locale)}
                </span>
              </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                locale={language === 'uk' ? uk : enGB}
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
        <p className="text-sm text-destructive">{t('invalidDateRange')}</p>
      ) : (
        <div className="flex items-end justify-between gap-3 border-t border-border/50 pt-3">
          <div className="min-w-0">
            <p className="text-small leading-body text-muted-foreground">
              {formatDateLabel(startDate, locale)} –{' '}
              {formatDateLabel(endDate, locale)}
            </p>

            <p className="mt-1 ">{t('totalEarned')}</p>
          </div>

          <p className="shrink-0 text-lg font-semibold leading-heading tabular-nums text-foreground">
            {formatCurrency(totalEarned, locale)}
          </p>
        </div>
      )}
    </div>
  );
}
