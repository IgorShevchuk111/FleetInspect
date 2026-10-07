'use client';

import { useDriverJournal } from '../hooks/use-driver-journal';

import { JournalHeader } from './journal-header';
import { ShiftDialog } from './shift-dialog';
import { ShiftsTable } from './shifts-table';

export default function DriverJournalPage() {
  const {
    shifts,
    restCompensations,
    acceptRestCompensation,
    cancelRestCompensation,
    isAddShiftOpen,
    setIsAddShiftOpen,
    addShift,
    editingShift,
    startEditingShift,
    updateShift,
    cancelEditingShift,
    deleteShift,
  } = useDriverJournal();

  const handleCloseShiftDialog = (open: boolean) => {
    if (open) {
      return;
    }

    setIsAddShiftOpen(false);
    cancelEditingShift();
  };

  const handleDeleteShift = (shift: { id: string }) => {
    deleteShift(shift.id);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-2 py-2 sm:px-6 sm:py-14 lg:px-8">
      <JournalHeader onAddShift={() => setIsAddShiftOpen(true)} />

      <ShiftsTable
        shifts={shifts}
        restCompensations={restCompensations}
        onAcceptRestCompensation={acceptRestCompensation}
        onCancelRestCompensation={cancelRestCompensation}
        onEdit={startEditingShift}
        onDelete={handleDeleteShift}
      />

      <ShiftDialog
        open={isAddShiftOpen || Boolean(editingShift)}
        shift={editingShift}
        shifts={shifts}
        onOpenChange={handleCloseShiftDialog}
        onSubmit={
          editingShift ? (data) => updateShift(editingShift.id, data) : addShift
        }
        onDelete={editingShift ? () => deleteShift(editingShift.id) : undefined}
      />
    </div>
  );
}
