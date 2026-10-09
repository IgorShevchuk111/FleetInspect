'use client';

import { Banknote, Moon } from 'lucide-react';

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
} from '@/features/driver-journal/types/driver-journal';

type WeeklyRestValidation = {
  valid: boolean;
  isReduced: boolean;
  message?: string;
};

type RestEarningsSectionProps = {
  form: ShiftFormData;
  canEnterRestOfShift: boolean;
  previousCompletedShift: Shift | null;
  weeklyRestValidation: WeeklyRestValidation;
  isWeeklyRestBlocked: boolean;
  onRestTypeChange: (value: RestType) => void;
  onEarnFocus: () => void;
  onEarnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEarnBlur: () => void;
};

function SectionHeader() {
  return (
    <div className="mb-3 flex min-w-0 items-center gap-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Moon aria-hidden="true" className="size-4 text-muted-foreground" />
      </div>

      <h3 className="text-sm font-medium leading-heading">
        Rest &amp; earnings
      </h3>
    </div>
  );
}

export function RestEarningsSection({
  form,
  canEnterRestOfShift,
  previousCompletedShift,
  weeklyRestValidation,
  isWeeklyRestBlocked,
  onRestTypeChange,
  onEarnFocus,
  onEarnChange,
  onEarnBlur,
}: RestEarningsSectionProps) {
  const showWeeklyRestUnavailable =
    form.restType === 'weekly' && !previousCompletedShift;

  const showReducedWeeklyRest =
    form.restType === 'weekly' &&
    Boolean(previousCompletedShift) &&
    weeklyRestValidation.valid &&
    weeklyRestValidation.isReduced;

  const showRegularWeeklyRest =
    form.restType === 'weekly' &&
    Boolean(previousCompletedShift) &&
    weeklyRestValidation.valid &&
    !weeklyRestValidation.isReduced;

  const showWeeklyRestBlocked =
    form.restType === 'weekly' && isWeeklyRestBlocked;

  return (
    <section className="min-w-0 border-t border-border pt-4">
      <SectionHeader />

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <div className="min-w-0 space-y-1.5">
          <Label
            htmlFor="rest-type"
            className="text-caption text-muted-foreground"
          >
            Rest type
          </Label>

          <Select
            value={form.restType}
            onValueChange={(value) => onRestTypeChange(value as RestType)}
            disabled={!canEnterRestOfShift}
          >
            <SelectTrigger id="rest-type" className="w-full min-w-0">
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

          {showWeeklyRestUnavailable && (
            <p className="text-caption leading-body text-muted-foreground">
              No previous completed shift. Rest duration cannot be calculated
              yet.
            </p>
          )}

          {showReducedWeeklyRest && (
            <p className="text-caption leading-body text-warning">
              Reduced weekly rest: 24–44h 59m. Your next weekly rest must be
              regular.
            </p>
          )}

          {showRegularWeeklyRest && (
            <p className="text-caption leading-body text-success">
              Regular weekly rest: 45 hours or more.
            </p>
          )}

          {showWeeklyRestBlocked && (
            <p className="text-caption font-medium leading-body text-danger">
              {weeklyRestValidation.message}
            </p>
          )}
        </div>

        <div
          className={`min-w-0 space-y-1.5 ${
            !canEnterRestOfShift ? 'opacity-50' : ''
          }`}
        >
          <Label htmlFor="earn" className="text-caption text-muted-foreground">
            Earn (£)
          </Label>

          <div className="relative min-w-0">
            <Banknote
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              id="earn"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.earn}
              onFocus={onEarnFocus}
              onBlur={onEarnBlur}
              onChange={onEarnChange}
              disabled={!canEnterRestOfShift}
              className="min-w-0 max-w-full pl-9"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
