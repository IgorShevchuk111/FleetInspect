'use client';

import { useDriverJournal } from '@/features/driver-journal/hooks/use-driver-journal';
import { useTranslations } from '@/features/driver-journal/i18n/use-translations';
import { JournalHeader } from '@/features/driver-journal/components/journal-header';
import { ShiftDialog } from '@/features/driver-journal/components/shift-dialog';
import { ShiftsTable } from '@/features/driver-journal/components/shifts-table';
import { toast } from 'sonner';

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

  const { t } = useTranslations();

  const handleCloseShiftDialog = (open: boolean) => {
    if (open) {
      return;
    }

    setIsAddShiftOpen(false);
    cancelEditingShift();
  };

  const handleDeleteShift = async (shift: { id: string }) => {
    const result = await deleteShift(shift.id);

    if (result.success === false) {
      toast.error(result.error);
      return;
    }

    toast.success(t('shiftDeletedSuccessfully'));
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
        restCompensations={restCompensations}
        onOpenChange={handleCloseShiftDialog}
        onSubmit={
          editingShift ? (data) => updateShift(editingShift.id, data) : addShift
        }
        onDelete={editingShift ? () => deleteShift(editingShift.id) : undefined}
      />
    </main>
  );
}
