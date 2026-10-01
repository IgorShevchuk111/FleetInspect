'use client';

import { useRef, useState, type PointerEvent } from 'react';

import { CircleGauge, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

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

import { TableCell, TableRow } from '@/components/ui/table';

import type { Shift } from '@/features/driver-journal/types/ driver-journal';

import type { RestCompensation } from '../services/driver-journal';

import { calculateShiftMinutes } from '../utils/shifts';

import type { WeeklyRestCompensationCandidate } from '../utils/weekly-rest-compensation';

import {
  getDrivingStatus,
  getRestStatus,
  getShiftStatus,
} from './shift-status';

import { ShiftDetailsDialog } from './shift-details-dialog';

type ShiftRowProps = {
  shift: Shift;

  drivingStatus?: ReturnType<typeof getDrivingStatus> | null;

  shiftStatus?: ReturnType<typeof getShiftStatus> | null;

  restStatus?: ReturnType<typeof getRestStatus> | null;

  drivingUsageAfter?: number;

  sharedAllowanceUsedAfter?: number;

  reducedDailyRest?: boolean;

  extendedShift?: boolean;

  weeklyRestCompensationCandidates?: WeeklyRestCompensationCandidate[];

  restCompensations?: RestCompensation[];

  onAcceptRestCompensation?: (
    reducedWeeklyRestShiftId: string,
    compensationShiftId: string,
    dailyRestMinutes: number,
    compensationMinutes: number,
  ) => Promise<void>;

  onCancelRestCompensation?: (compensationId: string) => Promise<void>;

  onEdit: (shift: Shift) => void;

  onDelete: (shift: Shift) => void;
};

const REGULAR_WEEKLY_REST_MINUTES = 45 * 60;

const MINIMUM_WEEKLY_REST_MINUTES = 24 * 60;

const REGULAR_DAILY_REST_MINUTES = 11 * 60;

const REDUCED_DAILY_REST_MINUTES = 9 * 60;

function formatDate(dateString: string): string {
  const [, month, day] = dateString.split('-');

  return `${day}/${month}`;
}

function formatTime(time: string): string {
  return time ? time.slice(0, 5) : '';
}

function formatCompactDuration(value: number | string): string {
  const minutes = Math.max(0, Math.round(Number(value) || 0));

  const hours = Math.floor(minutes / 60);

  const remaining = minutes % 60;

  return `${hours}h ${String(remaining).padStart(2, '0')}m`;
}

export function ShiftRow({
  shift,
  drivingStatus,
  shiftStatus,
  restStatus,
  drivingUsageAfter = 0,
  sharedAllowanceUsedAfter = 0,
  reducedDailyRest = false,
  extendedShift = false,
  weeklyRestCompensationCandidates = [],
  restCompensations = [],
  onAcceptRestCompensation,
  onCancelRestCompensation,
  onEdit,
  onDelete,
}: ShiftRowProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [swiped, setSwiped] = useState(false);

  const pointerStartX = useRef<number | null>(null);

  const pointerStartY = useRef<number | null>(null);

  const swiping = useRef(false);

  const shiftMinutes = calculateShiftMinutes(shift);

  const endDate = shift.endDate || shift.date;

  const acceptedCompensation = restCompensations.find(
    (compensation) =>
      compensation.decision === 'accepted' &&
      (compensation.compensation_shift_id === shift.id ||
        compensation.reduced_weekly_rest_shift_id === shift.id),
  );

  const acceptedCompensationForShift =
    acceptedCompensation?.compensation_shift_id === shift.id
      ? acceptedCompensation
      : undefined;

  const compensationMinutes = Number(
    acceptedCompensationForShift?.compensation_minutes ?? 0,
  );

  const actualRestMinutes = Number(shift.rest) || 0;

  const effectiveRestMinutes =
    shift.restType === 'daily'
      ? Math.max(0, actualRestMinutes - compensationMinutes)
      : actualRestMinutes;

  const isWeeklyRest = shift.restType === 'weekly';

  const isReducedWeeklyRest =
    isWeeklyRest &&
    effectiveRestMinutes >= MINIMUM_WEEKLY_REST_MINUTES &&
    effectiveRestMinutes < REGULAR_WEEKLY_REST_MINUTES;

  const isRegularWeeklyRest =
    isWeeklyRest && effectiveRestMinutes >= REGULAR_WEEKLY_REST_MINUTES;

  const isWeeklyStatus = isRegularWeeklyRest || isReducedWeeklyRest;

  const isReducedDailyRest =
    !isWeeklyRest &&
    effectiveRestMinutes >= REDUCED_DAILY_REST_MINUTES &&
    effectiveRestMinutes < REGULAR_DAILY_REST_MINUTES;

  const drivingMinutes = Number(shift.driving) || 0;

  const drivingOver9Hours = drivingMinutes > 9 * 60;

  const drivingOver10Hours = drivingMinutes > 10 * 60;

  const shiftOver15Hours = shiftMinutes > 15 * 60;

  const workingMinutes = Math.max(0, shiftMinutes - Number(shift.break));

  const handlePointerDown = (event: PointerEvent<HTMLTableRowElement>) => {
    pointerStartX.current = event.clientX;

    pointerStartY.current = event.clientY;

    swiping.current = false;
  };

  const handlePointerMove = (event: PointerEvent<HTMLTableRowElement>) => {
    if (pointerStartX.current === null || pointerStartY.current === null) {
      return;
    }

    const deltaX = event.clientX - pointerStartX.current;

    const deltaY = event.clientY - pointerStartY.current;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    if (deltaX < -30) {
      swiping.current = true;

      setSwiped(true);
    }

    if (deltaX > 30) {
      swiping.current = true;

      setSwiped(false);
    }
  };

  const handlePointerUp = () => {
    pointerStartX.current = null;

    pointerStartY.current = null;
  };

  const handleRowClick = () => {
    if (swiping.current) {
      swiping.current = false;

      return;
    }

    if (swiped) {
      setSwiped(false);

      return;
    }

    setDetailsOpen(true);
  };

  const handleDelete = () => {
    setDeleteOpen(false);

    setSwiped(false);

    onDelete(shift);
  };

  const stickyBackground = isWeeklyStatus ? 'bg-muted' : 'bg-transparent';

  const drivingClass = drivingOver10Hours
    ? 'text-red-600 font-semibold'
    : drivingOver9Hours
      ? 'text-orange-600 font-semibold'
      : '';

  const shiftClass = shiftOver15Hours ? 'text-red-600 font-semibold' : '';

  return (
    <>
      <TableRow
        className={[
          'cursor-pointer select-none',
          '[touch-action:pan-y]',
          isWeeklyStatus ? 'bg-muted hover:bg-muted/60' : 'hover:bg-muted/40',
        ].join(' ')}
        onClick={handleRowClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <TableCell
          className={[
            'w-[24%] min-w-0 border-l-2 px-1 py-2',
            'sticky left-0 z-20',
            stickyBackground,
            'hover:!bg-muted/40',
            isReducedWeeklyRest
              ? 'border-l-red-500'
              : isRegularWeeklyRest
                ? 'border-l-green-500'
                : 'border-l-transparent',
          ].join(' ')}
        >
          <div className="flex flex-col items-center leading-tight">
            <span className="text-xs font-medium">
              {formatDate(shift.date)}
            </span>

            <span className="text-xs text-muted-foreground">
              {formatTime(shift.start)}
            </span>
          </div>
        </TableCell>

        <TableCell className="w-[19%] min-w-0 px-1 py-2 text-center">
          <div
            className={`flex items-center justify-center text-xs leading-tight ${drivingClass}`}
          >
            {formatCompactDuration(drivingMinutes)}
          </div>
        </TableCell>

        <TableCell className="w-[19%] min-w-0 px-1 py-2 text-center">
          <div
            className={`flex items-center justify-center text-xs leading-tight ${shiftClass}`}
          >
            {formatCompactDuration(shiftMinutes)}
          </div>
        </TableCell>

        <TableCell className="w-[19%] min-w-0 px-1 py-2 text-center">
          <div className="flex min-h-10 flex-col items-center justify-center leading-none">
            <span className="text-xs font-medium">
              {formatCompactDuration(effectiveRestMinutes)}
            </span>

            <span
              className={[
                'mt-1 w-full max-w-[42px] border-t border-border/50 pt-1',
                'text-[10px] font-semibold',
                isWeeklyStatus
                  ? isReducedWeeklyRest
                    ? 'text-red-600'
                    : 'text-green-600'
                  : 'text-muted-foreground',
              ].join(' ')}
            >
              {isWeeklyStatus ? (isReducedWeeklyRest ? 'RW' : 'W') : 'D'}
            </span>
          </div>
        </TableCell>

        <TableCell className="relative w-[19%] min-w-0 overflow-hidden px-1 py-2 text-center">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className={[
              'absolute right-1 top-1/2 z-20 size-9 -translate-y-1/2',
              'transition-opacity duration-200',
              swiped ? 'opacity-100' : 'pointer-events-none opacity-0',
            ].join(' ')}
            onClick={(event) => {
              event.stopPropagation();

              setDeleteOpen(true);
            }}
          >
            <Trash2 className="size-4" />
          </Button>

          <div
            className={[
              'relative z-10 flex flex-col items-center',
              'bg-inherit leading-tight transition-transform duration-200',
              swiped ? '-translate-x-11' : 'translate-x-0',
            ].join(' ')}
          >
            <span className="text-xs font-medium">{formatDate(endDate)}</span>

            <span className="text-xs text-muted-foreground">
              {formatTime(shift.end)}
            </span>
          </div>
        </TableCell>
      </TableRow>

      <ShiftDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        shift={shift}
        drivingStatus={drivingStatus}
        shiftStatus={shiftStatus}
        restStatus={restStatus}
        drivingUsageAfter={drivingUsageAfter}
        sharedAllowanceUsedAfter={sharedAllowanceUsedAfter}
        reducedDailyRest={reducedDailyRest || isReducedDailyRest}
        extendedShift={extendedShift}
        weeklyRestCompensationCandidates={weeklyRestCompensationCandidates}
        restCompensations={restCompensations}
        onEdit={onEdit}
        onDelete={onDelete}
        onAcceptRestCompensation={onAcceptRestCompensation}
        onCancelRestCompensation={onCancelRestCompensation}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this shift?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete this shift from your Driver Journal.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
