'use client';

import { Clock3 } from 'lucide-react';

import { Button } from '@/components/ui/button';

type JournalHeaderProps = {
  onAddShift: () => void;
};

export function JournalHeader({ onAddShift }: JournalHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Driver Journal
        </h1>

        <p className="mt-2 text-muted-foreground">
          Record your driving, shifts, breaks and working time.
        </p>
      </div>

      <Button onClick={onAddShift}>
        <Clock3 className="mr-2 size-4" />
        Add shift
      </Button>
    </div>
  );
}
