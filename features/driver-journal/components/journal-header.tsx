import { Button } from '@/components/ui/button';

type JournalHeaderProps = {
  onAddShift: () => void;
};

export function JournalHeader({ onAddShift }: JournalHeaderProps) {
  return (
    <div className="mb-2 flex items-center justify-between sm:mb-6">
      <h1 className="text-page-title font-semibold tracking-tight sm:text-3xl">
        Driver Journal
      </h1>

      <Button type="button" variant="outline" onClick={onAddShift}>
        Add Shift
      </Button>
    </div>
  );
}
