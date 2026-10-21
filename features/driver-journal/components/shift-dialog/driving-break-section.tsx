'use client';

import { Label } from '@/components/ui/label';
import { DurationInputField } from '@/features/driver-journal/components/duration-input';
import { useTranslations } from '@/features/driver-journal/i18n/use-translations';
import type {
  DurationInput,
  ShiftFormData,
} from '@/features/driver-journal/types/driver-journal';
import { minutesToDuration } from '@/features/driver-journal/utils/duration';

type DrivingBreakSectionProps = {
  form: ShiftFormData;
  canEnterRestOfShift: boolean;
  actualDrivingMinutes: number;
  workingMinutes: number;
  drivingMaximum: number;
  extendedDrivingDaysUsed: number;
  onDrivingChange: (value: DurationInput) => void;
  onBreakChange: (value: DurationInput) => void;
};

function formatDuration(minutes: number): string {
  const duration = minutesToDuration(minutes);

  return `${duration.hours}h ${duration.minutes}m`;
}

export function DrivingBreakSection({
  form,
  canEnterRestOfShift,
  actualDrivingMinutes,
  workingMinutes,
  drivingMaximum,
  extendedDrivingDaysUsed,
  onDrivingChange,
  onBreakChange,
}: DrivingBreakSectionProps) {
  const { t } = useTranslations();

  return (
    <section className="min-w-0 space-y-5">
      <div className="min-w-0 space-y-2">
        <DurationInputField
          label={t('driving')}
          value={form.driving}
          onChange={onDrivingChange}
          disabled={!canEnterRestOfShift}
        />

        {actualDrivingMinutes > 0 && (
          <p className="text-small leading-relaxed text-muted-foreground">
            {formatDuration(actualDrivingMinutes)} /{' '}
            {formatDuration(drivingMaximum)}
          </p>
        )}

        <p className="text-small leading-relaxed text-muted-foreground">
          {t('maxToday')}: {formatDuration(drivingMaximum)} ·{' '}
          {t('extendedDays')} {extendedDrivingDaysUsed}/2 {t('used')}
        </p>
      </div>

      <div className="min-w-0">
        <DurationInputField
          label={t('break')}
          value={form.break}
          onChange={onBreakChange}
          disabled={!canEnterRestOfShift}
        />
      </div>

      <div className="flex min-w-0 items-center justify-between gap-3 border-t border-border pt-3">
        <div className="min-w-0 space-y-1">
          <Label className="text-muted-foreground  text-lg">
            {t('working')}
          </Label>
          <p className="text-small leading-relaxed text-muted-foreground">
            {t('shiftTimeMinusBreak')}
          </p>
        </div>

        <span className="shrink-0 tabular-nums">
          {formatDuration(workingMinutes)}
        </span>
      </div>
    </section>
  );
}
