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
  drivingUsageAfter?: number;
  sharedAllowanceUsedAfter?: number;
  reducedDailyRest?: boolean;
  extendedShift?: boolean;
  onEdit: (shift: Shift) => void;
};

function formatShiftDate(date: string) {
  if (!date) return '';

  const [year, month, day] = date.split('-');

  if (!year || !month || !day) return date;

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
  counter,
  className,
}: {
  label: string;
  counter?: string;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
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
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="center"
        className="z-50 w-auto max-w-[280px] bg-background text-sm text-foreground shadow-md"
        onClick={(event) => {
          event.stopPropagation();
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="flex flex-col gap-1">
          <span>{label}</span>

          {counter ? (
            <span className="text-muted-foreground">{counter}</span>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DrivingInfo({
  status,
  usageAfter = 0,
}: {
  status: NonNullable<ReturnType<typeof getDrivingStatus>>;
  usageAfter?: number;
}) {
  const counter = status.showCounter
    ? `${usageAfter}/2 used · ${Math.max(0, 2 - usageAfter)} left`
    : undefined;

  return (
    <StatusInfo
      label={status.label}
      counter={counter}
      className={status.className}
    />
  );
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
  usageAfter = 0,
  reducedDailyRest = false,
  extendedShift = false,
}: {
  status: NonNullable<ReturnType<typeof getRestStatus>>;
  usageAfter?: number;
  reducedDailyRest?: boolean;
  extendedShift?: boolean;
}) {
  const label = extendedShift
    ? 'Extended shift'
    : reducedDailyRest && usageAfter > 3
      ? 'Reduced daily rest · Not allowed'
      : status.label;

  const counter =
    reducedDailyRest || extendedShift
      ? `${usageAfter}/3 used · ${Math.max(0, 3 - usageAfter)} left`
      : undefined;

  return (
    <StatusInfo label={label} counter={counter} className={status.className} />
  );
}

export function ShiftRow({
  shift,
  drivingStatus,
  shiftStatus,
  restStatus,
  drivingUsageAfter,
  sharedAllowanceUsedAfter,
  reducedDailyRest,
  extendedShift,
  onEdit,
}: ShiftRowProps) {
  const shiftMinutes = calculateShiftMinutes(shift);
  const workingMinutes = shiftMinutes - shift.break;
  const endDate = shift.endDate || shift.date;

  const isRegularWeeklyRest = restStatus?.label === 'Regular weekly rest';

  const isReducedWeeklyRest = restStatus?.label === 'Reduced weekly rest';

  const isWeeklyRest = isRegularWeeklyRest || isReducedWeeklyRest;

  const rowClassName = isWeeklyRest
    ? 'cursor-pointer bg-muted/40 hover:bg-muted/60'
    : 'cursor-pointer';

  const stickyCellClassName = isWeeklyRest ? 'bg-muted' : 'bg-background';

  const weeklyRestBorderClassName = isRegularWeeklyRest
    ? 'border-l-green-500'
    : isReducedWeeklyRest
      ? 'border-l-red-500'
      : 'border-l-transparent';

  return (
    <TableRow className={rowClassName} onClick={() => onEdit(shift)}>
      <TableCell
        className={`sticky left-0 z-10 border-l-2 px-1.5 py-2 text-center text-sm ${weeklyRestBorderClassName} ${stickyCellClassName}`}
      >
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

        {drivingStatus ? (
          <DrivingInfo status={drivingStatus} usageAfter={drivingUsageAfter} />
        ) : null}
      </TableCell>

      <TableCell className="relative px-1.5 py-2 text-center text-sm">
        <div className="flex min-h-9 items-center justify-center">
          {formatDurationStacked(shiftMinutes)}
        </div>

        {shiftStatus ? <ShiftInfo status={shiftStatus} /> : null}
      </TableCell>

      <TableCell className="px-1.5 py-2 text-center text-sm">
        {formatDuration(shift.break)}
      </TableCell>

      <TableCell className="relative px-1.5 py-2 text-center text-sm">
        <div className="flex min-h-9 items-center justify-center">
          {formatDurationStacked(shift.rest)}
        </div>

        {restStatus ? (
          <RestInfo
            status={restStatus}
            usageAfter={sharedAllowanceUsedAfter}
            reducedDailyRest={reducedDailyRest}
            extendedShift={extendedShift}
          />
        ) : null}
      </TableCell>

      <TableCell className="px-1.5 py-2 text-center text-sm">
        £{shift.earn.toFixed(2)}
      </TableCell>

      <TableCell className="px-1.5 py-2 text-center text-sm">
        {formatDurationStacked(workingMinutes)}
      </TableCell>

      <TableCell
        className={`sticky right-0 z-10 px-1.5 py-2 text-center text-sm ${stickyCellClassName}`}
      >
        <div className="flex flex-col items-center leading-tight">
          <span>{formatShiftDate(endDate)}</span>

          <span className="text-muted-foreground">{formatTime(shift.end)}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
