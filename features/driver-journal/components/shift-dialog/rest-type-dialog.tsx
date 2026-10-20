'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from '@/features/driver-journal/i18n/use-translations';

import type {
  RestType,
  Shift,
  ShiftFormData,
} from '@/features/driver-journal/types/driver-journal';

type RestTypeDialogProps = {
  open: boolean;
  form: ShiftFormData;
  previousCompletedShift: Shift | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (restType: RestType) => void;
};

function getDateTime(date: string, time: string) {
  if (!date || !time) {
    return undefined;
  }

  const value = new Date(`${date}T${time}`);

  if (Number.isNaN(value.getTime())) {
    return undefined;
  }

  return value;
}

function formatDateTime(value: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(value);
}

export function RestTypeDialog({
  open,
  form,
  previousCompletedShift,
  onOpenChange,
  onSelect,
}: RestTypeDialogProps) {
  const { language, t } = useTranslations();
  const locale = language === 'uk' ? 'uk-UA' : 'en-GB';

  const currentStartDateTime = getDateTime(form.date, form.start);

  const previousEndDateTime = previousCompletedShift
    ? getDateTime(
        previousCompletedShift.endDate ?? previousCompletedShift.date,
        previousCompletedShift.end,
      )
    : undefined;

  const restMinutes =
    currentStartDateTime && previousEndDateTime
      ? Math.max(
          0,
          Math.round(
            (currentStartDateTime.getTime() - previousEndDateTime.getTime()) /
              60000,
          ),
        )
      : 0;

  const restHours = Math.floor(restMinutes / 60);
  const remainingMinutes = restMinutes % 60;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[100] w-[calc(100vw-2rem)] max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('whatTypeOfRest')}</DialogTitle>
        </DialogHeader>

        {previousCompletedShift ? (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {previousEndDateTime
                ? formatDateTime(previousEndDateTime, locale)
                : ''}
              {' → '}
              {currentStartDateTime
                ? formatDateTime(currentStartDateTime, locale)
                : ''}
            </p>

            <p className="text-sm font-medium">
              {t('rest')}: {restHours}
              {t('hoursShort')} {remainingMinutes}
              {t('minutesShort')}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {currentStartDateTime ? (
              <p className="text-sm text-muted-foreground">
                {formatDateTime(currentStartDateTime, locale)}
              </p>
            ) : null}

            <p className="text-sm text-muted-foreground">
              {t('noPreviousCompletedShift')}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            type="button"
            className="min-w-0 whitespace-normal px-2"
            onClick={() => onSelect('daily')}
          >
            {t('dailyRest')}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="min-w-0 whitespace-normal px-2"
            onClick={() => onSelect('weekly')}
          >
            {t('weeklyRest')}
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => onOpenChange(false)}
        >
          {t('close')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
