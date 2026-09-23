import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { Shift } from '@/features/driver-journal/types/ driver-journal';

import { getStartOfWeek } from '../utils/dates';
import { WeeklyShiftSection } from './weekly-shift-section';

type ShiftsTableProps = {
  shifts: Shift[];
  onEdit: (shift: Shift) => void;
};

export function ShiftsTable({ shifts, onEdit }: ShiftsTableProps) {
  const shiftsByWeek = new Map<string, Shift[]>();

  for (const shift of shifts) {
    if (!shift.date) {
      continue;
    }

    const date = new Date(`${shift.date}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const weekStart = getStartOfWeek(date);
    const weekKey = weekStart.toISOString().slice(0, 10);

    const weekShifts = shiftsByWeek.get(weekKey) ?? [];
    weekShifts.push(shift);
    shiftsByWeek.set(weekKey, weekShifts);
  }

  const weeks = Array.from(shiftsByWeek.entries())
    .map(([weekKey, weekShifts]) => ({
      weekStart: new Date(`${weekKey}T00:00:00`),
      shifts: weekShifts,
    }))
    .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());

  if (weeks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No shifts yet</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add your first shift to start your driver journal.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {weeks.map(({ weekStart, shifts: weekShifts }) => (
        <WeeklyShiftSection
          key={weekStart.toISOString()}
          weekStart={weekStart}
          shifts={weekShifts}
          allShifts={shifts}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
