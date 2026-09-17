'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { DurationInput } from '@/features/driver-journal/types/ driver-journal';

type DurationInputFieldProps = {
  label: string;
  value: DurationInput;
  onChange: (value: DurationInput) => void;
};

export function DurationInputField({
  label,
  value,
  onChange,
}: DurationInputFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label
            htmlFor={`${label}-hours`}
            className="text-sm text-muted-foreground"
          >
            Hours
          </Label>

          <Input
            id={`${label}-hours`}
            type="number"
            min="0"
            placeholder="0"
            value={value.hours}
            onChange={(event) =>
              onChange({
                ...value,
                hours: Number(event.target.value),
              })
            }
          />
        </div>

        <div className="space-y-1">
          <Label
            htmlFor={`${label}-minutes`}
            className="text-sm text-muted-foreground"
          >
            Minutes
          </Label>

          <Input
            id={`${label}-minutes`}
            type="number"
            min="0"
            max="59"
            placeholder="0"
            value={value.minutes}
            onChange={(event) =>
              onChange({
                ...value,
                minutes: Number(event.target.value),
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
