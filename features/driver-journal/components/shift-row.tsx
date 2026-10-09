'use client';

import { useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

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
import type { Shift } from '@/features/driver-journal/types/driver-journal';

import type { RestCompensation } from '../services/driver-journal';
import { formatDuration } from '../utils/duration';
import { calculateShiftMinutes } from '../utils/shifts';
import type { WeeklyRestCompensationCandidate } from '../utils/weekly-rest-compensation';
import {
  getDrivingStatus,
  getRestStatus,
  getShiftStatus,
} from '@/features/driver-journal/utils/shift-status';
import { ShiftDetailsDialog } from './shift-details-dialog';
import { cn } from '@/lib/utils';

type ShiftRowProps = {
  shift: Shift;
  drivingStatus?: ReturnType<typeof getDrivingStatus> | null;
  shiftStatus?: ReturnType<typeof getShiftStatus> | null;
  restStatus?: ReturnType<typeof getRestStatus> | null;
  drivingUsageAfter?: number;
  sharedAllowanceUsedAfter?: number;
  extendedShiftUsageAfter?: number;
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

const SWIPE_DISTANCE = 64;
const MINIMUM_WEEKLY_REST_MINUTES = 24 * 60;
const REGULAR_WEEKLY_REST_MINUTES = 45 * 60;

function formatDate(dateString: string) {
  const [, month, day] = dateString.split('-');
  return month && day ? `${day}/${month}` : dateString;
}

function formatTime(time: string | null | undefined) {
  return time ? time.slice(0, 5) : '';
}

export function ShiftRow({
  shift,
  drivingStatus,
  shiftStatus,
  restStatus,
  drivingUsageAfter = 0,
  sharedAllowanceUsedAfter = 0,
  extendedShiftUsageAfter = 0,
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
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const swiping = useRef(false);

  const shiftMinutes = calculateShiftMinutes(shift);
  const endDate = shift.endDate || shift.date;
  const drivingMinutes = Number(shift.driving) || 0;
  const actualRestMinutes = Number(shift.rest) || 0;

  const acceptedCompensation = restCompensations.find(
    (compensation) =>
      compensation.decision === 'accepted' &&
      compensation.compensation_shift_id === shift.id,
  );

  const compensationMinutes = Number(
    acceptedCompensation?.compensation_minutes ?? 0,
  );

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

  const handlePointerDown = (event: PointerEvent<HTMLTableRowElement>) => {
    pointerStart.current = {
      x: event.clientX,
      y: event.clientY,
    };
    swiping.current = false;
  };

  const handlePointerMove = (event: PointerEvent<HTMLTableRowElement>) => {
    if (!pointerStart.current) return;

    const deltaX = event.clientX - pointerStart.current.x;
    const deltaY = event.clientY - pointerStart.current.y;

    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

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
    }

    if (deltaX > SWIPE_DISTANCE / 2) {
      swiping.current = true;
      setSwiped(false);
    }
  };

  const handlePointerUp = () => {
    pointerStart.current = null;
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

  const closeMenu = () => {
    menuOpenRef.current = false;
    setMenuOpen(false);
    setSwiped(false);
  };

  const handleViewDetails = () => {
    closeMenu();
    setDetailsOpen(true);
  };

  const handleEdit = () => {
    closeMenu();
    setDetailsOpen(false);
    onEdit(shift);
  };

  const handleDeleteRequest = () => {
    closeMenu();
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    setSwiped(false);
    onDelete(shift);
  };

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
          <div className="relative isolate w-full overflow-hidden bg-danger/80">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Delete shift"
              className="absolute inset-y-0 right-0 z-0 size-16 rounded-none bg-danger/80 text-black hover:bg-danger"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                handleDeleteRequest();
              }}
            >
              <Trash2 className="size-5" />
            </Button>

            <div
              className={cn(
                'relative z-10 grid w-full grid-cols-[20%_15%_15%_15%_20%_15%]',
                'transition-transform duration-200 ease-out',
                swiped ? '-translate-x-16' : 'translate-x-0',
                'bg-background hover:bg-muted',
              )}
            >
              {/* Start */}
              <div
                className={cn(
                  'min-w-0 border-r border-border/30 border-l-2 px-0.5 py-1.5',
                  isReducedWeeklyRest
                    ? 'border-l-red-500'
                    : isRegularWeeklyRest
                      ? 'border-l-green-500'
                      : 'border-l-transparent',
                )}
              >
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-caption font-medium">
                    {formatDate(shift.date)}
                  </span>
                  <span className="text-caption text-muted-foreground">
                    {formatTime(shift.start)}
                  </span>
                </div>
              </div>

              {/* Driving */}
              <div
                className={cn(
                  'min-w-0 border-r border-border/30 px-0.5 py-1.5 text-center',
                  drivingStatus?.className,
                )}
              >
                {formatDuration(drivingMinutes)}
              </div>

              {/* Shift */}
              <div
                className={cn(
                  'min-w-0 border-r border-border/30 px-0.5 py-1.5 text-center',
                  shiftStatus?.className,
                  !shiftStatus && extendedShift && 'text-warning',
                )}
              >
                {formatDuration(shiftMinutes)}
              </div>

              {/* Rest */}
              <div className="min-w-0 border-r border-border/30 px-0.5 py-1.5 text-center">
                <div className="flex min-h-9 flex-col items-center justify-center leading-none">
                  <span className="text-caption font-medium">
                    {formatDuration(effectiveRestMinutes)}
                  </span>

                  <span
                    className={cn(
                      'mt-0.5 w-full max-w-[42px] border-t border-border/50 pt-0.5 text-[10px] font-semibold',
                      isReducedWeeklyRest
                        ? 'text-danger'
                        : isRegularWeeklyRest
                          ? 'text-success'
                          : 'text-muted-foreground',
                    )}
                  >
                    {isWeeklyRest ? (isReducedWeeklyRest ? 'RW' : 'W') : 'D'}
                  </span>
                </div>
              </div>

              {/* End */}
              <div className="flex flex-col items-center leading-tight">
                <span className="text-caption font-medium">
                  {formatDate(endDate)}
                </span>
                <span className="text-caption text-muted-foreground">
                  {formatTime(shift.end)}
                </span>
              </div>

              {/* Actions */}
              <div
                className="min-w-0 px-0.5 py-1.5 text-center"
                onClick={(event) => event.stopPropagation()}
              >
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
                      aria-label="Shift actions"
                      className="size-8"
                      onPointerDown={(event) => event.stopPropagation()}
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
                    onClick={(event) => event.stopPropagation()}
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
        extendedShiftUsageAfter={extendedShiftUsageAfter}
        sharedAllowanceUsedAfter={sharedAllowanceUsedAfter}
        reducedDailyRest={reducedDailyRest}
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
