'use client';

import { useDriverJournal } from '../hooks/use-driver-journal';

import { JournalHeader } from './journal-header';
import { ShiftDialog } from './shift-dialog';
import { ShiftsTable } from './shifts-table';

export default function DriverJournalPage() {
  const { shifts, isAddShiftOpen, setIsAddShiftOpen, addShift } =
    useDriverJournal();

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <JournalHeader onAddShift={() => setIsAddShiftOpen(true)} />

      <ShiftsTable shifts={shifts} />

      <ShiftDialog
        open={isAddShiftOpen}
        onOpenChange={setIsAddShiftOpen}
        onSubmit={addShift}
      />
    </div>
  );
}
