'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/features/driver-journal/i18n/use-translations';

import type { DurationInput } from '@/features/driver-journal/types/driver-journal';

type DurationInputFieldProps = {
  label: string;
  value: DurationInput;
  onChange: (value: DurationInput) => void;
  disabled?: boolean;
};

export function DurationInputField({
  label,
  value,
  onChange,
  disabled = false,
}: DurationInputFieldProps) {
  const { t } = useTranslations();

  const handleFocus = (field: 'hours' | 'minutes') => {
    if (disabled) return;

    if (value[field] === 0) {
      onChange({
        ...value,
        [field]: '' as unknown as number,
      });
    }
  };

  const handleChange = (field: 'hours' | 'minutes', inputValue: string) => {
    if (disabled) return;

    if (inputValue === '') {
      onChange({
        ...value,
        [field]: '' as unknown as number,
      });
      return;
    }

    onChange({
      ...value,
      [field]: Number(inputValue),
    });
  };

  const handleBlur = (field: 'hours' | 'minutes') => {
    if (disabled) return;

    if (value[field] === ('' as unknown as number)) {
      onChange({
        ...value,
        [field]: 0,
      });
    }
  };

  return (
    <div className="min-w-0 space-y-2">
      <Label className="text-muted-foreground text-lg">{label}</Label>

      <div className="grid min-w-0 grid-cols-2 gap-3">
        <div className="min-w-0 space-y-1">
          <Label
            htmlFor={`${label}-hours`}
            className="text-muted-foreground text-md"
          >
            {t('hours')}
          </Label>

          <Input
            id={`${label}-hours`}
            type="number"
            min="0"
            placeholder="0"
            value={value.hours}
            disabled={disabled}
            onFocus={() => handleFocus('hours')}
            onBlur={() => handleBlur('hours')}
            onChange={(event) => handleChange('hours', event.target.value)}
            className="h-10 w-full min-w-0 rounded-md border-input px-3 text-body shadow-none"
          />
        </div>

        <div className="min-w-0 space-y-1">
          <Label
            htmlFor={`${label}-minutes`}
            className="text-muted-foreground text-md"
          >
            {t('minutes')}
          </Label>

          <Input
            id={`${label}-minutes`}
            type="number"
            min="0"
            max="59"
            placeholder="0"
            value={value.minutes}
            disabled={disabled}
            onFocus={() => handleFocus('minutes')}
            onBlur={() => handleBlur('minutes')}
            onChange={(event) => handleChange('minutes', event.target.value)}
            className="h-10 w-full min-w-0 rounded-md border-input px-3 text-body shadow-none"
          />
        </div>
      </div>
    </div>
  );
}
