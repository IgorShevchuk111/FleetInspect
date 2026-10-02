'use client';

import { useRef, useState, type MouseEvent, type PointerEvent } from 'react';

import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';

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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const SWIPE_DISTANCE = 64;

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

  const [menuOpen, setMenuOpen] = useState(false);

  const menuOpenRef = useRef(false);

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

  const workingMinutes = Math.max(0, shiftMinutes - Number(shift.break || 0));

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

    const target = event.target as HTMLElement;

    if (
      target.closest(
        'button, [role="menuitem"], [role="dialog"], [data-radix-popper-content-wrapper]',
      )
    ) {
      return;
    }

    if (deltaX < -SWIPE_DISTANCE / 2) {
      swiping.current = true;

      setSwiped(true);

      return;
    }

    if (deltaX > SWIPE_DISTANCE / 2) {
      swiping.current = true;

      setSwiped(false);
    }
  };

  const handlePointerUp = () => {
    pointerStartX.current = null;

    pointerStartY.current = null;
  };

  const handleRowClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (menuOpenRef.current) {
      menuOpenRef.current = false;

      setMenuOpen(false);

      return;
    }

    const target = event.target as HTMLElement;

    if (
      target.closest(
        '[data-radix-menu-content], [data-radix-menu-item], [data-radix-menu-trigger]',
      )
    ) {
      return;
    }

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

  const handleViewDetails = () => {
    setMenuOpen(false);

    menuOpenRef.current = false;

    setSwiped(false);

    setDetailsOpen(true);
  };

  const handleEdit = () => {
    setMenuOpen(false);

    menuOpenRef.current = false;

    setSwiped(false);

    setDetailsOpen(false);

    onEdit(shift);
  };

  const handleDeleteRequest = () => {
    setMenuOpen(false);

    menuOpenRef.current = false;

    setSwiped(false);

    setDeleteOpen(true);
  };

  const handleDelete = () => {
    setDeleteOpen(false);

    setSwiped(false);

    onDelete(shift);
  };

  const drivingClass = drivingOver10Hours
    ? 'font-semibold text-red-600'
    : drivingOver9Hours
      ? 'font-semibold text-orange-600'
      : '';

  const shiftClass = shiftOver15Hours ? 'font-semibold text-red-600' : '';

  return (
    <>
      <TableRow
        className="group cursor-pointer select-none"
        onClick={handleRowClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'pan-y' }}
      >
        <TableCell colSpan={6} className="p-0">
          <div
            className={[
              'relative isolate w-full overflow-hidden',
              'bg-red-400/80',
            ].join(' ')}
          >
            {/* RED DELETE AREA */}
            <div
              className={[
                'absolute inset-y-0 right-0 z-0',
                'flex w-16 items-center justify-center',
                'bg-red-400/80',
              ].join(' ')}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={[
                  'size-full min-h-12 min-w-12 rounded-none',
                  'bg-red-400/80',
                  'text-black',
                  'hover:bg-red-500/80',
                ].join(' ')}
                aria-label="Delete shift"
                onPointerDown={(event) => {
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();

                  handleDeleteRequest();
                }}
              >
                <Trash2 className="size-5" />
              </Button>
            </div>

            {/* MOVING CONTENT */}
            <div
              className={[
                'relative z-10 grid w-full',
                'grid-cols-[20%_15%_15%_15%_20%_15%]',
                'transition-transform duration-200 ease-out',
                swiped ? '-translate-x-16' : 'translate-x-0',
                isWeeklyStatus
                  ? 'bg-muted hover:bg-muted'
                  : 'bg-background hover:bg-muted',
              ].join(' ')}
            >
              {/* START */}
              <div
                className={[
                  'min-w-0 border-r border-border/30',
                  'border-l-2 px-0.5 py-1.5',
                  isReducedWeeklyRest
                    ? 'border-l-red-500'
                    : isRegularWeeklyRest
                      ? 'border-l-green-500'
                      : 'border-l-transparent',
                ].join(' ')}
              >
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-[13px] font-medium">
                    {formatDate(shift.date)}
                  </span>

                  <span className="text-[13px] text-muted-foreground">
                    {formatTime(shift.start)}
                  </span>
                </div>
              </div>

              {/* DRIVING */}
              <div className="min-w-0 border-r border-border/30 px-0.5 py-1.5 text-center">
                <div
                  className={[
                    'flex items-center justify-center',
                    'text-[13px] leading-tight',
                    drivingClass,
                  ].join(' ')}
                >
                  {formatCompactDuration(drivingMinutes)}
                </div>
              </div>

              {/* SHIFT */}
              <div className="min-w-0 border-r border-border/30 px-0.5 py-1.5 text-center">
                <div
                  className={[
                    'flex items-center justify-center',
                    'text-[13px] leading-tight',
                    shiftClass,
                  ].join(' ')}
                >
                  {formatCompactDuration(shiftMinutes)}
                </div>
              </div>

              {/* REST */}
              <div className="min-w-0 border-r border-border/30 px-0.5 py-1.5 text-center">
                <div className="flex min-h-9 flex-col items-center justify-center leading-none">
                  <span className="text-[13px] font-medium">
                    {formatCompactDuration(effectiveRestMinutes)}
                  </span>

                  <span
                    className={[
                      'mt-0.5 w-full max-w-[42px]',
                      'border-t border-border/50 pt-0.5',
                      'text-[11px] font-semibold',
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
              </div>

              {/* END */}
              <div className="min-w-0 border-r border-border/30 px-0.5 py-1.5 text-center">
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-[13px] font-medium">
                    {formatDate(endDate)}
                  </span>

                  <span className="text-[13px] text-muted-foreground">
                    {formatTime(shift.end)}
                  </span>
                </div>
              </div>

              {/* ACTIONS */}
              <div
                className="min-w-0 px-0.5 py-1.5 text-center"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <div className="flex items-center justify-center">
                  <DropdownMenu
                    open={menuOpen}
                    onOpenChange={(open) => {
                      menuOpenRef.current = open;

                      setMenuOpen(open);
                    }}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0"
                        aria-label="Shift actions"
                        onPointerDown={(event) => {
                          event.stopPropagation();
                        }}
                        onClick={(event) => {
                          event.stopPropagation();

                          if (swiped) {
                            setSwiped(false);
                          }
                        }}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="z-50 w-44 bg-background"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      <DropdownMenuItem onClick={handleViewDetails}>
                        <Eye className="size-4" />
                        View Details
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={handleEdit}>
                        <Pencil className="size-4" />
                        Edit Shift
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={handleDeleteRequest}
                      >
                        <Trash2 className="size-4" />
                        Delete Shift
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
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
