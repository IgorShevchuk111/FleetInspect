'use client';

import { useDriverJournal } from '../hooks/use-driver-journal';

import { JournalHeader } from './journal-header';
import { ShiftDialog } from './shift-dialog';
import { ShiftsTable } from './shifts-table';

export default function DriverJournalPage() {
  const {
    shifts,
    isAddShiftOpen,
    setIsAddShiftOpen,
    addShift,
    editingShift,
    startEditingShift,
    updateShift,
    cancelEditingShift,
    deleteShift,
  } = useDriverJournal();

  return (
    <div className="mx-auto max-w-7xl px-2 py-8 sm:px-6 sm:py-14 lg:px-8">
      <JournalHeader onAddShift={() => setIsAddShiftOpen(true)} />

      <ShiftsTable shifts={shifts} onEdit={startEditingShift} />

      <ShiftDialog
        open={isAddShiftOpen || Boolean(editingShift)}
        shift={editingShift}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddShiftOpen(false);
            cancelEditingShift();
          }
        }}
        onSubmit={
          editingShift ? (data) => updateShift(editingShift.id, data) : addShift
        }
        onDelete={editingShift ? () => deleteShift(editingShift.id) : undefined}
      />
    </div>
  );
}
