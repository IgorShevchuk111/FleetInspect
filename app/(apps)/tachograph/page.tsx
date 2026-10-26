'use client';

import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LimitCard } from '@/features/driver-journal/components/limit-card';

type Mode = 'start' | 'rest';

const modes: { id: Mode; label: string }[] = [
  { id: 'start', label: 'Робота' },
  { id: 'rest', label: 'Відпочинок' },
];

export default function TachographPage() {
  const [activeMode, setActiveMode] = useState<Mode>('rest');

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl ">
        <ToggleGroup
          type="single"
          value={activeMode}
          onValueChange={(value) => {
            if (value) setActiveMode(value as Mode);
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
            title="Робочий день"
            count={3}
            limits={[
              { remaining: '13:00', value: '13' },
              { remaining: '15:00', value: '15' },
            ]}
          />

          <LimitCard
            title="Добове водіння"
            count={2}
            limits={[
              { remaining: '9:00', value: '9' },
              { remaining: '10:00', value: '10' },
            ]}
          />

          <LimitCard
            title="Перерва"
            current="0:00"
            limits={[
              { remaining: '0:15', value: '15' },
              { remaining: '0:45', value: '45' },
            ]}
          />

          <LimitCard
            title="Добовий відпочинок"
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
            title="Тижневий відпочинок"
            current="0:00"
            limits={[
              { remaining: '24:00', value: '24' },
              { remaining: '45:00', value: '45' },
            ]}
          />

          <LimitCard
            labelPosition="right-[-2rem] -top-4"
            current="0:00"
            title="Тижневе водіння"
            limits={[{ remaining: '56:00', value: '56:00' }]}
          />
          <LimitCard
            labelPosition="right-[-2rem] -top-4"
            current="0:00"
            title="Двотижневе водіння"
            limits={[{ remaining: '90:00', value: '90:00' }]}
          />

          <LimitCard
            labelPosition="right-[-2rem] -top-4"
            title="Робочий тиждень"
            current="42:00"
            limits={[{ remaining: '18:00', value: '60:00' }]}
          />

          <LimitCard
            labelPosition="right-[-2rem] -top-4"
            title="Середній робочий час"
            current="46:30"
            limits={[{ remaining: '1:30', value: '48:00' }]}
          />
        </section>
      </div>
    </main>
  );
}
