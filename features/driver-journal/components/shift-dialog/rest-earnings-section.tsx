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
} from '@/features/driver-journal/types/ driver-journal';

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
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
        <Moon className="size-3.5 text-muted-foreground" />
      </div>

      <span className="text-sm font-medium">Rest & earnings</span>
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
  return (
    <section className="min-w-0 border-t pt-4">
      <SectionHeader />

      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="rest-type" className="text-xs text-muted-foreground">
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

          {form.restType === 'weekly' && !previousCompletedShift ? (
            <p className="text-xs text-muted-foreground">
              No previous completed shift. Rest duration cannot be calculated
              yet.
            </p>
          ) : null}

          {form.restType === 'weekly' &&
          previousCompletedShift &&
          weeklyRestValidation.valid &&
          weeklyRestValidation.isReduced ? (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Reduced weekly rest: 24–44h 59m. Your next weekly rest must be
              regular.
            </p>
          ) : null}

          {form.restType === 'weekly' &&
          previousCompletedShift &&
          weeklyRestValidation.valid &&
          !weeklyRestValidation.isReduced ? (
            <p className="text-xs text-green-600 dark:text-green-400">
              Regular weekly rest: 45 hours or more.
            </p>
          ) : null}

          {form.restType === 'weekly' && isWeeklyRestBlocked ? (
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              {weeklyRestValidation.message}
            </p>
          ) : null}
        </div>

        <div
          className={`min-w-0 space-y-1.5 ${
            !canEnterRestOfShift ? 'opacity-50' : ''
          }`}
        >
          <Label htmlFor="earn" className="text-xs text-muted-foreground">
            Earn (£)
          </Label>

          <div className="relative min-w-0">
            <Banknote className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

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
