'use client';

import { Label } from '@/components/ui/label';
import { DurationInputField } from '@/features/driver-journal/components/duration-input';
import type {
  DurationInput,
  ShiftFormData,
} from '@/features/driver-journal/types/driver-journal';
import { minutesToDuration } from '@/features/driver-journal/utils/duration';
import { Label } from '@/components/ui/label';

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
  return (
    <section className="min-w-0 space-y-5">
      {/* Driving */}
      <div className="min-w-0 space-y-2">
        <DurationInputField
          label="Driving"
          value={form.driving}
          onChange={onDrivingChange}
          disabled={!canEnterRestOfShift}
        />

        {actualDrivingMinutes > 0 && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {formatDuration(actualDrivingMinutes)} /{' '}
            {formatDuration(drivingMaximum)}
          </p>
        )}

        <p className="text-small leading-relaxed text-muted-foreground">
          Max today: {formatDuration(drivingMaximum)} · Extended days{' '}
          {extendedDrivingDaysUsed}/2 used
        </p>
      </div>

      {/* Break */}
      <div className="min-w-0">
        <DurationInputField
          label="Break"
          value={form.break}
          onChange={onBreakChange}
          disabled={!canEnterRestOfShift}
        />
      </div>

      {/* Working time */}
      <div className="flex min-w-0 items-center justify-between gap-3 border-t border-border pt-3">
        <div className="min-w-0 space-y-1">
          <Label className=" text-muted-foreground">Working</Label>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Shift time minus break
          </p>
        </div>

        <span className="shrink-0  tabular-nums">
          {formatDuration(workingMinutes)}
        </span>
      </div>
    </section>
  );
}
