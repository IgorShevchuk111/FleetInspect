'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

type JournalHeaderProps = {
  onAddShift: () => void;
};

export function JournalHeader({ onAddShift }: JournalHeaderProps) {
  return (
    <div className="mb-2 flex items-center justify-between sm:mb-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Driver Journal
      </h1>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onAddShift}
        aria-label="Add shift"
        className="size-9"
      >
        <Plus className="size-6" />
      </Button>
    </div>
  );
}
