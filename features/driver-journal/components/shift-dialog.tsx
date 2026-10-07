'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Clock3, Trash2 } from 'lucide-react';

import { DrivingBreakSection } from '@/features/driver-journal/components/shift-dialog/driving-break-section';
import { RestEarningsSection } from '@/features/driver-journal/components/shift-dialog/rest-earnings-section';
import { RestTypeDialog } from '@/features/driver-journal/components/shift-dialog/rest-type-dialog';
import { ShiftTimesSection } from '@/features/driver-journal/components/shift-dialog/shift-times-section';
import { useShiftDialog } from '@/features/driver-journal/hooks/use-shift-dialog';

import type {
  Shift,
  ShiftFormData,
} from '@/features/driver-journal/types/ driver-journal';

type ShiftDialogProps = {
  open: boolean;
  shift?: Shift | null;
  shifts?: Shift[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ShiftFormData) => void;
  onDelete?: () => void;
};

export function ShiftDialog({
  open,
  shift,
  shifts = [],
  onOpenChange,
  onSubmit,
  onDelete,
}: ShiftDialogProps) {
  const {
    form,
    isEditing,
    hasUnfinishedPreviousShift,
    canEnterRestOfShift,
    weeklyRestValidation,
    previousCompletedShift,
    extendedDrivingDaysUsed,
    drivingMaximum,
    extendedShiftsUsed,
    shiftMaximum,
    actualDrivingMinutes,
    actualShiftMinutes,
    workingMinutes,
    isWeeklyRestBlocked,
    hasSelectedRestType,
    isRestTypeDialogOpen,
    isDeleteConfirmOpen,
    setIsRestTypeDialogOpen,
    setIsDeleteConfirmOpen,
    handleStartDateChange,
    handleStartTimeChange,
    handleEndDateChange,
    handleEndTimeChange,
    handleDrivingChange,
    handleBreakChange,
    handleRestTypeChange,
    handleEarnFocus,
    handleEarnChange,
    handleEarnBlur,
    handleRestTypeSelection,
    handleSubmit,
    handleCancel,
    handleDelete,
  } = useShiftDialog({
    open,
    shift,
    shifts,
    onOpenChange,
    onSubmit,
    onDelete,
  });

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setIsRestTypeDialogOpen(false);
          }

          onOpenChange(nextOpen);
        }}
      >
        <DialogContent
          className="
            flex
            h-[100dvh]
            max-h-[100dvh]
            w-screen
            max-w-none
            flex-col
            gap-0
            overflow-hidden
            rounded-none
            p-0
            sm:h-auto
            sm:max-h-[90vh]
            sm:w-[calc(100vw-2rem)]
            sm:max-w-xl
            sm:rounded-lg
          "
        >
          <DialogHeader
            className="
              shrink-0
              border-b
              px-4
              py-3
              sm:px-6
              sm:py-4
            "
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Clock3 className="size-4.5 text-primary" />
              </div>

              <div className="min-w-0">
                <DialogTitle className="text-lg">
                  {isEditing ? 'Edit shift' : 'Add shift'}
                </DialogTitle>

                <DialogDescription className="mt-0.5 text-xs">
                  {isEditing
                    ? 'Update your driving shift details.'
                    : 'Enter your driving shift details.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          >
            <div
              className="
                min-h-0
                min-w-0
                flex-1
                touch-pan-y
                overflow-x-hidden
                overflow-y-auto
                overscroll-contain
              "
            >
              <div className="min-w-0 space-y-4 px-4 py-4 sm:px-6">
                <ShiftTimesSection
                  form={form}
                  hasUnfinishedPreviousShift={hasUnfinishedPreviousShift}
                  canEnterRestOfShift={canEnterRestOfShift}
                  onStartDateChange={handleStartDateChange}
                  onStartTimeChange={handleStartTimeChange}
                  onEndDateChange={handleEndDateChange}
                  onEndTimeChange={handleEndTimeChange}
                />

                <DrivingBreakSection
                  form={form}
                  canEnterRestOfShift={canEnterRestOfShift}
                  actualDrivingMinutes={actualDrivingMinutes}
                  actualShiftMinutes={actualShiftMinutes}
                  workingMinutes={workingMinutes}
                  drivingMaximum={drivingMaximum}
                  shiftMaximum={shiftMaximum}
                  extendedDrivingDaysUsed={extendedDrivingDaysUsed}
                  extendedShiftsUsed={extendedShiftsUsed}
                  onDrivingChange={handleDrivingChange}
                  onBreakChange={handleBreakChange}
                />

                <RestEarningsSection
                  form={form}
                  canEnterRestOfShift={canEnterRestOfShift}
                  previousCompletedShift={previousCompletedShift}
                  weeklyRestValidation={weeklyRestValidation}
                  isWeeklyRestBlocked={isWeeklyRestBlocked}
                  onRestTypeChange={handleRestTypeChange}
                  onEarnFocus={handleEarnFocus}
                  onEarnChange={handleEarnChange}
                  onEarnBlur={handleEarnBlur}
                />
              </div>
            </div>

            <DialogFooter
              className="
                shrink-0
                flex-row
                flex-wrap
                items-center
                justify-center
                gap-2
                border-t
                px-4
                py-3
                pb-[calc(0.75rem+env(safe-area-inset-bottom))]
                sm:px-6
                sm:py-3
                sm:pb-3
              "
            >
              {isEditing ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              ) : null}

              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="min-w-20"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  hasUnfinishedPreviousShift ||
                  isWeeklyRestBlocked ||
                  (!isEditing && !hasSelectedRestType)
                }
                className="min-w-28"
              >
                {isEditing ? 'Save changes' : 'Add shift'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <RestTypeDialog
        open={isRestTypeDialogOpen}
        form={form}
        previousCompletedShift={previousCompletedShift}
        onOpenChange={setIsRestTypeDialogOpen}
        onSelect={handleRestTypeSelection}
      />

      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete shift?</AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. This shift will be permanently
              removed from the journal.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
