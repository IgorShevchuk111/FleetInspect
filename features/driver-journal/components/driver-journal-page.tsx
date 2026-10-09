'use client';

import { useDriverJournal } from '@/features/driver-journal/hooks/use-driver-journal';

import { JournalHeader } from '@/features/driver-journal/components/journal-header';
import { ShiftDialog } from '@/features/driver-journal/components/shift-dialog';
import { ShiftsTable } from '@/features/driver-journal/components/shifts-table';

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
    <main className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-section px-page-x py-page-y">
      <JournalHeader onAddShift={() => setIsAddShiftOpen(true)} />

      <section className="min-w-0 flex-1">
        <ShiftsTable
          shifts={shifts}
          restCompensations={restCompensations}
          onAcceptRestCompensation={acceptRestCompensation}
          onCancelRestCompensation={cancelRestCompensation}
          onEdit={startEditingShift}
          onDelete={handleDeleteShift}
        />
      </section>

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
    </main>
  );
}
