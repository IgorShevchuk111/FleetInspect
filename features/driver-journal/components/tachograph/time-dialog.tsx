'use client';
//#region imports
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { enGB, uk } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {
  RestForm,
  type RestOptions,
} from '@/features/driver-journal/components/tachograph/rest-form';

import { useTranslations } from '@/features/driver-journal/i18n/use-translations';
//#endregion

//#region Types
type TimeDialogProps = {
  open: boolean;
  mode: 'work' | 'rest';
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: string, time: string, restOptions?: RestOptions) => void;
};
//#endregion

//#region Constants
const INITIAL_REST_OPTIONS: RestOptions = {
  restType: 'daily',
  useCompensation: false,
};

const DIALOG_CONTENT_CLASS_NAME = `
  flex flex-col gap-0
  w-full max-w-lg
  h-auto max-h-[90dvh]
  overflow-y-auto
  rounded-lg p-6
  max-sm:fixed
  max-sm:inset-0
  max-sm:translate-x-0
  max-sm:translate-y-0
  max-sm:w-full
  max-sm:max-w-none
  max-sm:h-[100dvh]
  max-sm:max-h-[100dvh]
  max-sm:rounded-none
  max-sm:border-0
  max-sm:p-4
`;
//#endregion

// Component
export function TimeDialog({
  open,
  mode,
  onOpenChange,
  onConfirm,
}: TimeDialogProps) {
  // Hooks
  const { language, t } = useTranslations();
  const dateLocale = language === 'uk' ? uk : enGB;

  // State
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [restOptions, setRestOptions] =
    useState<RestOptions>(INITIAL_REST_OPTIONS);

  //Effects
  useEffect(() => {
    if (!open) return;

    const now = new Date();

    setDate(now);
    setTime(format(now, 'HH:mm'));
    setRestOptions({ ...INITIAL_REST_OPTIONS });
  }, [open, mode]);

  // Handlers
  function handleConfirm() {
    if (!time) return;

    onConfirm(
      format(date, 'yyyy-MM-dd'),
      time,
      mode === 'rest' ? restOptions : undefined,
    );

    onOpenChange(false);
  }

  // Render
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_CONTENT_CLASS_NAME}>
        <DialogHeader>
          <DialogTitle className="text-title">
            {mode === 'work' ? t('tachographWork') : t('tachographRest')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('date')}</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, 'PPP', { locale: dateLocale })}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    if (selectedDate) setDate(selectedDate);
                  }}
                  locale={dateLocale}
                  captionLayout="dropdown"
                  startMonth={new Date(2000, 0)}
                  endMonth={new Date(2100, 11)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>
              {mode === 'rest' ? t('restStartTime') : t('workStartTime')}
            </Label>

            <Input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
            />
          </div>

          {mode === 'rest' && (
            <RestForm
              value={restOptions}
              onChange={setRestOptions}
              compensationAvailable="21:00"
            />
          )}
        </div>

        <DialogFooter className="mt-4 flex  flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            {t('cancel')}
          </Button>

          <Button onClick={handleConfirm} disabled={!time} className="flex-1">
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
