import { TableCell, TableRow } from '@/components/ui/table';
import type { Shift } from '@/features/driver-journal/types/ driver-journal';
import { WeeklySummary } from '@/features/driver-journal/components/weekly-summary';

type WeeklySectionHeaderProps = {
  weekStart: Date;
  shiftCount: number;
  allShifts: Shift[];
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
    <TableRow className="border-b border-border bg-muted/30 hover:bg-muted/30">
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
         border-border
         bg-background
         px-3
         py-3
         sm:w-full
         sm:px-4
         sm:py-4
       "
        >
          <div className="flex min-w-0 flex-col items-center gap-2">
            <h3 className="text-sm font-semibold leading-heading sm:text-base">
              Week: {formatWeek(weekStart)}{' '}
            </h3>
            <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span className="text-caption leading-body text-muted-foreground">
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
