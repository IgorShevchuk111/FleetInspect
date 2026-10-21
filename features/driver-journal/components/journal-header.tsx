'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslations } from '@/features/driver-journal/i18n/use-translations';

type JournalHeaderProps = {
  onAddShift: () => void;
};

export function JournalHeader({ onAddShift }: JournalHeaderProps) {
  const { t } = useTranslations();

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h1>{t('driverJournal')}</h1>

        <p className="mt-1 text-small text-muted-foreground">
          {t('manageShiftsAndRestPeriods')}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          onClick={onAddShift}
          className="h-control shrink-0 gap-1 rounded-control px-control-x font-medium shadow-sm"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t('addShift')}</span>
          <span className="sm:hidden">{t('add')}</span>
        </Button>
      </div>
    </header>
  );
}
