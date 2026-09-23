'use client';

import { Info } from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TableCell, TableRow } from '@/components/ui/table';

import type { Shift } from '@/features/driver-journal/types/ driver-journal';

import { formatDuration } from '../utils/duration';
import { calculateShiftMinutes } from '../utils/shifts';
import {
  getDrivingStatus,
  getRestStatus,
  getShiftStatus,
} from './shift-status';

type ShiftRowProps = {
  shift: Shift;
  drivingStatus?: ReturnType<typeof getDrivingStatus> | null;
  shiftStatus?: ReturnType<typeof getShiftStatus> | null;
  restStatus?: ReturnType<typeof getRestStatus> | null;
  onEdit: (shift: Shift) => void;
};

function formatShiftDate(date: string) {
  if (!date) return '';

  const [year, month, day] = date.split('-');

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}`;
}

function formatTime(time: string) {
  if (!time) return '';

  return time.slice(0, 5);
}

function formatDurationStacked(minutes: number) {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  return (
    <span className="flex flex-col items-center leading-tight">
      <span>{hours}h</span>
      <span>{remainingMinutes}m</span>
    </span>
  );
}

function StatusInfo({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Show status information"
          className="absolute right-1 top-1 z-10 inline-flex size-4 items-center justify-center rounded-full hover:bg-muted"
          onClick={(event) => {
            event.stopPropagation();
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          <Info className={`!size-3 ${className ?? 'text-muted-foreground'}`} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="center"
        className="z-50 w-auto max-w-[280px] bg-background text-sm text-foreground shadow-md"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {label}
      </PopoverContent>
    </Popover>
  );
}

function DrivingInfo({
  status,
}: {
  status: NonNullable<ReturnType<typeof getDrivingStatus>>;
}) {
  return <StatusInfo label={status.label} className={status.className} />;
}

function ShiftInfo({
  status,
}: {
  status: NonNullable<ReturnType<typeof getShiftStatus>>;
}) {
  return <StatusInfo label={status.label} className={status.className} />;
}

function RestInfo({
  status,
}: {
  status: NonNullable<ReturnType<typeof getRestStatus>>;
}) {
  return <StatusInfo label={status.label} className={status.className} />;
}

export function ShiftRow({
  shift,
  drivingStatus,
  shiftStatus,
  restStatus,
  onEdit,
}: ShiftRowProps) {
  const shiftMinutes = calculateShiftMinutes(shift);
  const workingMinutes = shiftMinutes - shift.break;
  const endDate = shift.endDate || shift.date;

  return (
    <TableRow className="cursor-pointer" onClick={() => onEdit(shift)}>
      <TableCell className="sticky left-0 z-10 bg-background px-1.5 py-2 text-center text-sm">
        <div className="flex flex-col items-center leading-tight">
          <span>{formatShiftDate(shift.date)}</span>
          <span className="text-muted-foreground">
            {formatTime(shift.start)}
          </span>
        </div>
      </TableCell>

      <TableCell className="relative px-1.5 py-2 text-center text-sm">
        <div className="flex min-h-9 items-center justify-center">
          {formatDurationStacked(shift.driving)}
        </div>

        {drivingStatus && <DrivingInfo status={drivingStatus} />}
      </TableCell>

      <TableCell className="relative px-1.5 py-2 text-center text-sm">
        <div className="flex min-h-9 items-center justify-center">
          {formatDurationStacked(shiftMinutes)}
        </div>

        {shiftStatus && <ShiftInfo status={shiftStatus} />}
      </TableCell>

      <TableCell className="px-1.5 py-2 text-center text-sm">
        {formatDuration(shift.break)}
      </TableCell>

      <TableCell className="relative px-1.5 py-2 text-center text-sm">
        <div className="flex min-h-9 items-center justify-center">
          {formatDurationStacked(shift.rest)}
        </div>

        {restStatus && <RestInfo status={restStatus} />}
      </TableCell>

      <TableCell className="px-1.5 py-2 text-center text-sm">
        £{shift.earn.toFixed(2)}
      </TableCell>

      <TableCell className="px-1.5 py-2 text-center text-sm">
        {formatDurationStacked(workingMinutes)}
      </TableCell>

      <TableCell className="sticky right-0 z-10 bg-background px-1.5 py-2 text-center text-sm">
        <div className="flex flex-col items-center leading-tight">
          <span>{formatShiftDate(endDate)}</span>
          <span className="text-muted-foreground">{formatTime(shift.end)}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
