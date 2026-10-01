import { TableCell, TableRow } from '@/components/ui/table';

import { WeeklySummary } from './weekly-summary';

type WeeklySectionHeaderProps = {
  weekStart: Date;
  shiftCount: number;
  summary: {
    driving: number;
    working: number;
    earn: number;
    twoWeekDriving: number;
    average17WeekWorking: number;
    annualEarned: number;
  };
  formatWeek: (date: Date) => string;
};

export function WeeklySectionHeader({
  weekStart,
  shiftCount,
  summary,
  formatWeek,
}: WeeklySectionHeaderProps) {
  return (
    <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
      <TableCell colSpan={8} className="p-0">
        <div
          className="
            sticky
            left-0
            z-20
            w-[calc(100vw-1.5rem)]
            max-w-[100vw]
            min-w-0
            border-b
            bg-background
            px-3
            py-3
            sm:w-full
            sm:px-4
            sm:py-4
          "
        >
          <div className="flex flex-col items-center gap-2">
            <div className="text-center text-sm font-semibold leading-tight sm:text-base">
              Week: {formatWeek(weekStart)}
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className="text-xs text-muted-foreground">
                {shiftCount} {shiftCount === 1 ? 'shift' : 'shifts'}
              </span>

              <WeeklySummary weekStart={weekStart} summary={summary} />
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
