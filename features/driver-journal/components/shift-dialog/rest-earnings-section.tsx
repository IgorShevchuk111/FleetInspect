'use client';

import { Banknote } from 'lucide-react';

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
    <section className="min-w-0 space-y-5">
      <div className="min-w-0 space-y-2">
        <Label htmlFor="rest-type" className="text-sm text-muted-foreground">
          Rest type
        </Label>

        <Select
          value={form.restType}
          onValueChange={(value) => onRestTypeChange(value as RestType)}
          disabled={!canEnterRestOfShift}
        >
          <SelectTrigger
            id="rest-type"
            className="h-10 min-h-8 w-full min-w-0 appearance-none rounded-md border border-input bg-background px-2 text-[length:var(--font-size-body)]"
          >
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
          <p className="text-xs leading-relaxed text-muted-foreground">
            No previous completed shift. Rest duration cannot be calculated yet.
          </p>
        )}

        {showReducedWeeklyRest && (
          <p className="text-xs leading-relaxed text-warning">
            Reduced weekly rest: 24–44h 59m. Your next weekly rest must be
            regular.
          </p>
        )}

        {showRegularWeeklyRest && (
          <p className="text-xs leading-relaxed text-success">
            Regular weekly rest: 45 hours or more.
          </p>
        )}

        {showWeeklyRestBlocked && (
          <p className="text-xs font-medium leading-relaxed text-danger">
            {weeklyRestValidation.message}
          </p>
        )}
      </div>

      <div className="min-w-0 space-y-2">
        <Label htmlFor="earn" className="text-sm text-muted-foreground">
          Earn (£)
        </Label>

        <div className="relative min-w-0">
          <Input
            id="earn"
            type="number"
            min={0}
            step={0.01}
            placeholder="0"
            value={form.earn}
            onFocus={onEarnFocus}
            onChange={onEarnChange}
            onBlur={onEarnBlur}
            disabled={!canEnterRestOfShift}
            className="h-10 min-h-8 w-full min-w-0 appearance-none rounded-md border border-input bg-background px-2 text-[length:var(--font-size-body)]"
          />
        </div>
      </div>
    </section>
  );
}
