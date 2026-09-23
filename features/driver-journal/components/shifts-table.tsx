import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { Shift } from '@/features/driver-journal/types/ driver-journal';

import { getStartOfWeek } from '../utils/driver-journal';

import { WeeklyShiftSection } from './weekly-shift-section';

type ShiftsTableProps = {
  shifts: Shift[];
  onEdit: (shift: Shift) => void;
};

function groupShiftsByWeek(shifts: Shift[]) {
  const weeks = new Map<number, Shift[]>();

  shifts.forEach((shift) => {
    const shiftDate = new Date(`${shift.date}T00:00:00`);

    if (Number.isNaN(shiftDate.getTime())) {
      return;
    }

    const weekStart = getStartOfWeek(shiftDate);
    const weekKey = weekStart.getTime();

    const currentShifts = weeks.get(weekKey) ?? [];

    weeks.set(weekKey, [...currentShifts, shift]);
  });

  return Array.from(weeks.entries())
    .sort(([weekA], [weekB]) => weekB - weekA)
    .map(([weekKey, weekShifts]) => ({
      weekStart: new Date(weekKey),
      shifts: weekShifts,
    }));
}

export function ShiftsTable({ shifts, onEdit }: ShiftsTableProps) {
  const weeks = groupShiftsByWeek(shifts);

  if (weeks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shifts</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="py-10 text-center text-muted-foreground">
            No shifts recorded.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {weeks.map(({ weekStart, shifts: weekShifts }) => (
        <WeeklyShiftSection
          key={weekStart.getTime()}
          weekStart={weekStart}
          shifts={weekShifts}
          allShifts={shifts}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
