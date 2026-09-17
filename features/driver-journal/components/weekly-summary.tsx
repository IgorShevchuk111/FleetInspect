import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import type { JournalTotals } from '@/features/driver-journal/types/ driver-journal';

import { formatDuration } from '../utils/driver-journal';

type WeeklySummaryProps = {
  totals: JournalTotals;
};

export function WeeklySummary({ totals }: WeeklySummaryProps) {
  return (
    <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total driving</CardDescription>

          <CardTitle className="text-2xl">
            {formatDuration(totals.driving)}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total shift</CardDescription>

          <CardTitle className="text-2xl">
            {formatDuration(totals.shift)}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total break</CardDescription>

          <CardTitle className="text-2xl">
            {formatDuration(totals.break)}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
