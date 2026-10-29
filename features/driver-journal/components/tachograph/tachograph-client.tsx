'use client';

import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LimitCard } from '@/features/driver-journal/components/limit-card';
import { useTranslations } from '@/features/driver-journal/i18n/use-translations';
import { TimeDialog } from '@/features/driver-journal/components/tachograph/time-dialog';
import type { RestOptions } from '@/features/driver-journal/components/tachograph/rest-form';

type Mode = 'start' | 'rest';

export default function TachographClient() {
  const [activeMode, setActiveMode] = useState<Mode>('rest');
  const { t } = useTranslations();

  const [activeDialog, setActiveDialog] = useState<'work' | 'rest' | null>(
    null,
  );

  const modes: { id: Mode; label: string }[] = [
    { id: 'start', label: t('tachographWork') },
    { id: 'rest', label: t('tachographRest') },
  ];

  const handleConfirm = (
    date: string,
    time: string,
    restOptions?: RestOptions,
  ) => {
    if (activeDialog === 'work') {
      // TODO: Save the new shift using addShift().
      setActiveMode('start');
    }

    if (activeDialog === 'rest') {
      // TODO: Pass the selected options to updateShift().
      setActiveMode('rest');
    }

    setActiveDialog(null);
  };
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl ">
        <ToggleGroup
          type="single"
          value={activeMode}
          onValueChange={(value) => {
            if (!value) return;

            setActiveDialog(value === 'start' ? 'work' : 'rest');
          }}
          className="bg-card px-2 py-4 border-b-2 border-border rounded-none h-auto w-full"
        >
          {modes.map(({ id, label }) => (
            <ToggleGroupItem
              key={id}
              value={id}
              aria-label={label}
              className="flex-1 text-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90"
              onClick={() => {
                setActiveDialog(id === 'start' ? 'work' : 'rest');
              }}
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <section className="space-y-3 p-2 sm:p-4">
          <LimitCard
            title={t('workingDay')}
            count={3}
            limits={[
              { remaining: '13:00', value: '13' },
              { remaining: '15:00', value: '15' },
            ]}
          />

          <LimitCard
            title={t('dailyDriving')}
            count={2}
            limits={[
              { remaining: '9:00', value: '9' },
              { remaining: '10:00', value: '10' },
            ]}
          />

          <LimitCard
            title={t('breakTime')}
            current="0:00"
            limits={[
              { remaining: '0:15', value: '15' },
              { remaining: '0:45', value: '45' },
            ]}
          />

          <LimitCard
            title={t('dailyRest')}
            count={3}
            current="8:54"
            limits={[
              { value: '9', good: true, remaining: '9:00' },
              { value: '11', good: false, remaining: '11:00' },
            ]}
            active
            progress={50}
            warningAt={50}
            successAt={80}
          />

          <LimitCard
            title={t('weeklyRest')}
            current="0:00"
            limits={[
              { remaining: '24:00', value: '24' },
              { remaining: '45:00', value: '45' },
            ]}
          />

          <LimitCard
            title={t('weeklyDriving')}
            labelPosition="right-[-2rem] -top-4"
            current="0:00"
            limits={[{ remaining: '56:00', value: '56:00' }]}
          />
          <LimitCard
            labelPosition="right-[-2rem] -top-4"
            current="0:00"
            title={t('twoWeekDriving')}
            limits={[{ remaining: '90:00', value: '90:00' }]}
          />

          <LimitCard
            labelPosition="right-[-2rem] -top-4"
            title={t('workingWeek')}
            current="42:00"
            limits={[{ remaining: '18:00', value: '60:00' }]}
          />

          <LimitCard
            labelPosition="right-[-2rem] -top-4"
            title={t('averageWorkingTime')}
            current="46:30"
            limits={[{ remaining: '1:30', value: '48:00' }]}
          />
        </section>
      </div>

      <TimeDialog
        mode={activeDialog ?? 'work'}
        open={activeDialog !== null}
        onOpenChange={(open) => {
          if (!open) setActiveDialog(null);
        }}
        onConfirm={handleConfirm}
      />
    </main>
  );
}
