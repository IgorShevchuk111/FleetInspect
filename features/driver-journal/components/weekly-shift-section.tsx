import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type {
  JournalTotals,
  Shift,
} from '@/features/driver-journal/types/ driver-journal';

import {
  calculateTotals,
  formatDuration,
  formatWeek,
} from '../utils/driver-journal';

import { WeeklySummary } from './weekly-summary';

type WeeklyShiftSectionProps = {
  weekStart: Date;
  shifts: Shift[];
  onEdit: (shift: Shift) => void;
};

export function WeeklyShiftSection({
  weekStart,
  shifts,
  onEdit,
}: WeeklyShiftSectionProps) {
  const totals: JournalTotals = calculateTotals(shifts);

  const sortedShifts = [...shifts].sort((a, b) => {
    const dateComparison = b.date.localeCompare(a.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return b.start.localeCompare(a.start);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formatWeek(weekStart)}</CardTitle>

        <CardDescription>Monday – Sunday</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>Driving</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Break</TableHead>
                <TableHead>End</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedShifts.map((shift) => (
                <TableRow
                  key={shift.id}
                  className="cursor-pointer hover:bg-muted/50"
                  tabIndex={0}
                  onClick={() => onEdit(shift)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onEdit(shift);
                    }
                  }}
                >
                  <TableCell className="font-medium">{shift.date}</TableCell>

                  <TableCell>{shift.start}</TableCell>

                  <TableCell>{formatDuration(shift.driving)}</TableCell>

                  <TableCell>{formatDuration(shift.shift)}</TableCell>

                  <TableCell>{formatDuration(shift.break)}</TableCell>

                  <TableCell>{shift.end || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <WeeklySummary totals={totals} />
      </CardContent>
    </Card>
  );
}
