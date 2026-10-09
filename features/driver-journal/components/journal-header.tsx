import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

type JournalHeaderProps = {
  onAddShift: () => void;
};

export function JournalHeader({ onAddShift }: JournalHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
          Driver Journal
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your shifts and rest periods
        </p>
      </div>

      <Button
        type="button"
        onClick={onAddShift}
        className="h-control shrink-0 gap-2 rounded-control px-control-x font-medium shadow-sm"
      >
        <Plus className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Add Shift</span>
        <span className="sm:hidden">Add</span>
      </Button>
    </header>
  );
}
