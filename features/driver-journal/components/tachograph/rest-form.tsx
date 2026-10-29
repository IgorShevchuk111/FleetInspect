'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTranslations } from '@/features/driver-journal/i18n/use-translations';

export type RestType = 'daily' | 'weekly';

export type RestOptions = {
  restType: RestType;
  useCompensation: boolean;
};

type RestFormProps = {
  value: RestOptions;
  onChange: (value: RestOptions) => void;
  compensationAvailable?: string;
};

export function RestForm({
  value,
  onChange,
  compensationAvailable = '21:00',
}: RestFormProps) {
  const { language, t } = useTranslations();
  const isUkrainian = language === 'uk';
  const restTypes = [
    { value: 'daily', label: t('dailyRest') },
    { value: 'weekly', label: t('weeklyRest') },
  ] as const;

  function updateValue(partial: Partial<RestOptions>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>{t('restType')}</Label>

        <RadioGroup
          value={value.restType}
          onValueChange={(restType: RestType) => {
            updateValue({ restType });
          }}
          className="space-y-3"
        >
          {restTypes.map(({ value: restType, label }) => (
            <div key={restType} className="flex items-center gap-2">
              <RadioGroupItem id={`${restType}-rest`} value={restType} />

              <Label
                htmlFor={`${restType}-rest`}
                className="cursor-pointer font-normal text-md"
              >
                {label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2 rounded-md border p-3">
        <div className="flex items-start gap-2">
          <Checkbox
            id="use-compensation"
            checked={value.useCompensation}
            onCheckedChange={(checked) => {
              updateValue({ useCompensation: checked === true });
            }}
          />

          <div className="space-y-1">
            <Label
              htmlFor="use-compensation"
              className="cursor-pointer font-medium"
            >
              {isUkrainian ? 'Використати компенсацію' : 'Use compensation'}
            </Label>

            <p className="text-sm text-muted-foreground">
              {isUkrainian ? 'Доступно' : 'Available'}: {compensationAvailable}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
