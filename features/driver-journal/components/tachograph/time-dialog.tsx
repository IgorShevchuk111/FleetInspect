'use client';

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
import { useTranslations } from '@/features/driver-journal/i18n/use-translations';

type TimeDialogProps = {
  open: boolean;
  mode: 'work' | 'rest';
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: string, time: string) => void;
};

export function TimeDialog({
  open,
  mode,
  onOpenChange,
  onConfirm,
}: TimeDialogProps) {
  const { language, t } = useTranslations();
  const dateLocale = language === 'uk' ? uk : enGB;

  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));

  useEffect(() => {
    if (open) {
      const now = new Date();
      setDate(now);
      setTime(format(now, 'HH:mm'));
    }
  }, [open, mode]);

  function handleConfirm() {
    onConfirm(format(date, 'yyyy-MM-dd'), time);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
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
              {mode === 'work' ? t('startTime') : t('restStartTime')}
            </Label>
            <Input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>

          <Button onClick={handleConfirm} disabled={!time}>
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
