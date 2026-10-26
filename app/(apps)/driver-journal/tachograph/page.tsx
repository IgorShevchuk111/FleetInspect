'use client';

import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LimitCard } from '@/features/driver-journal/components/limit-card';
import { useTranslations } from '@/features/driver-journal/i18n/use-translations';
import { TimeDialog } from '@/features/driver-journal/components/tachograph/time-dialog';
type Mode = 'start' | 'rest';

export default function TachographPage() {
  const [activeMode, setActiveMode] = useState<Mode>('rest');
  const { t } = useTranslations();

  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);

  const modes: { id: Mode; label: string }[] = [
    { id: 'start', label: t('tachographWork') },
    { id: 'rest', label: t('tachographRest') },
  ];
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl ">
        <ToggleGroup
          type="single"
          value={activeMode}
          onValueChange={(value) => {
            if (!value) return;

            if (value === 'start') {
              setIsStartDialogOpen(true);
              return;
            }

            if (value === 'rest') {
              setIsEndDialogOpen(true);
            }
          }}
          className="bg-card px-2 py-4 border-b-2 border-border rounded-none h-auto w-full"
        >
          {modes.map(({ id, label }) => (
            <ToggleGroupItem
              key={id}
              value={id}
              aria-label={label}
              className=" text-lg"
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
            progress={88}
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
        mode="work"
        open={isStartDialogOpen}
        onOpenChange={setIsStartDialogOpen}
        onConfirm={(date, start) => {
          // TODO: Save the new shift using addShift().
          setActiveMode('start');
        }}
      />

      <TimeDialog
        mode="rest"
        open={isEndDialogOpen}
        onOpenChange={setIsEndDialogOpen}
        onConfirm={(date, restStart) => {
          // TODO: Finish the active shift using updateShift().
          setActiveMode('rest');
        }}
      />
    </main>
  );
}
