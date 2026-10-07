'use client';

import { Timer } from 'lucide-react';

import type {
  DurationInput,
  ShiftFormData,
} from '@/features/driver-journal/types/ driver-journal';

import { DurationInputField } from '@/features/driver-journal/components/duration-input';
import { minutesToDuration } from '@/features/driver-journal/utils/duration';

type DrivingBreakSectionProps = {
  form: ShiftFormData;
  canEnterRestOfShift: boolean;
  actualDrivingMinutes: number;
  actualShiftMinutes: number;
  workingMinutes: number;
  drivingMaximum: number;
  shiftMaximum: number;
  extendedDrivingDaysUsed: number;
  extendedShiftsUsed: number;
  onDrivingChange: (value: DurationInput) => void;
  onBreakChange: (value: DurationInput) => void;
};

function formatDuration(minutes: number) {
  const duration = minutesToDuration(minutes);

  return `${duration.hours}h ${duration.minutes}m`;
}

function SectionHeader() {
  return (
    <div className="mb-3 flex min-w-0 items-center gap-2">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
        <Timer className="size-3.5 text-muted-foreground" />
      </div>

      <span className="text-sm font-medium">Driving & break</span>
    </div>
  );
}

export function DrivingBreakSection({
  form,
  canEnterRestOfShift,
  actualDrivingMinutes,
  actualShiftMinutes,
  workingMinutes,
  drivingMaximum,
  shiftMaximum,
  extendedDrivingDaysUsed,
  extendedShiftsUsed,
  onDrivingChange,
  onBreakChange,
}: DrivingBreakSectionProps) {
  return (
    <section className="min-w-0 border-t pt-4">
      <SectionHeader />

      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <div
          className={`min-w-0 rounded-lg border bg-muted/20 px-3 py-2.5 ${
            !canEnterRestOfShift ? 'opacity-50' : ''
          }`}
        >
          <DurationInputField
            label="Driving"
            value={form.driving}
            onChange={onDrivingChange}
            disabled={!canEnterRestOfShift}
          />

          {actualDrivingMinutes > 0 ? (
            <p className="mt-2 text-sm font-semibold tabular-nums">
              {formatDuration(actualDrivingMinutes)} /{' '}
              {formatDuration(drivingMaximum)}
            </p>
          ) : null}

          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Max today: {formatDuration(drivingMaximum)} · Extended days{' '}
            {extendedDrivingDaysUsed}/2 used
          </p>
        </div>

        <div
          className={`min-w-0 rounded-lg border bg-muted/20 px-3 py-2.5 ${
            !canEnterRestOfShift ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Shift</span>

            {actualShiftMinutes > 0 ? (
              <span className="text-sm font-semibold tabular-nums">
                {formatDuration(actualShiftMinutes)} /{' '}
                {formatDuration(shiftMaximum)}
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Max today: {formatDuration(shiftMaximum)} · Extended shifts{' '}
            {extendedShiftsUsed}/3 used
          </p>
        </div>

        <div
          className={`min-w-0 rounded-lg border bg-muted/20 px-3 py-2.5 ${
            !canEnterRestOfShift ? 'opacity-50' : ''
          }`}
        >
          <DurationInputField
            label="Break"
            value={form.break}
            onChange={onBreakChange}
            disabled={!canEnterRestOfShift}
          />
        </div>

        <div
          className={`min-w-0 rounded-lg border bg-muted/20 px-3 py-2.5 ${
            !canEnterRestOfShift ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Working</span>

            {actualShiftMinutes > 0 ? (
              <span className="text-sm font-semibold tabular-nums">
                {formatDuration(workingMinutes)}
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-[11px] text-muted-foreground">
            Shift time minus break
          </p>
        </div>
      </div>
    </section>
  );
}
