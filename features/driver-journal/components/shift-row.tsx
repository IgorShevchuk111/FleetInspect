import { TableCell, TableRow } from '@/components/ui/table';

import type { Shift } from '@/features/driver-journal/types/ driver-journal';

import { formatDuration } from '../utils/duration';

import type {
  getDrivingStatus,
  getRestStatus,
  getShiftStatus,
} from './shift-status';

type DrivingStatus = ReturnType<typeof getDrivingStatus>;
type ShiftStatus = ReturnType<typeof getShiftStatus>;
type RestStatus = ReturnType<typeof getRestStatus>;

type ShiftRowProps = {
  shift: Shift;
  shiftMinutes: number;
  workingMinutes: number;
  drivingMinutes: number;
  sharedAllowanceUsedAfter: number;
  sharedAllowanceRemaining: number;
  reducedDailyRest: boolean;
  extendedShift: boolean;
  allowanceNotAllowed: boolean;
  drivingUsageAfter: number;
  drivingDaysRemaining: number;
  drivingStatus: DrivingStatus;
  shiftStatus: ShiftStatus;
  restStatus: RestStatus;
  onEdit: (shift: Shift) => void;
};

const statusClassName = 'mt-0.5 text-xs font-medium leading-tight';

function formatShiftDate(date: string, time: string) {
  if (!date) {
    return time || '—';
  }

  const dateTime = new Date(`${date}T${time || '00:00'}`);

  if (Number.isNaN(dateTime.getTime())) {
    return `${date} ${time || ''}`.trim();
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
  }).format(dateTime);
}

function formatTime(time: string) {
  if (!time) {
    return '—';
  }

  return time.slice(0, 5);
}

function AllowanceStatus({
  label,
  used,
  remaining,
  notAllowed,
}: {
  label: string;
  used: number;
  remaining: number;
  notAllowed: boolean;
}) {
  const className = notAllowed
    ? 'text-red-600 dark:text-red-400'
    : 'text-orange-600 dark:text-orange-400';

  return (
    <div className="space-y-0">
      <div className={`${statusClassName} ${className}`}>{label}</div>

      <div className={`${statusClassName} ${className}`}>
        {used}/3 used · {remaining} left
      </div>
    </div>
  );
}

function DrivingCounter({
  status,
  used,
  remaining,
}: {
  status: NonNullable<DrivingStatus>;
  used: number;
  remaining: number;
}) {
  if (!status.showCounter) {
    return null;
  }

  const className = status.notAllowed
    ? 'text-red-600 dark:text-red-400'
    : 'text-orange-600 dark:text-orange-400';

  return (
    <div className={`${statusClassName} ${className}`}>
      {used}/2 used · {remaining} left
    </div>
  );
}

export function ShiftRow({
  shift,
  shiftMinutes,
  workingMinutes,
  drivingMinutes,
  sharedAllowanceUsedAfter,
  sharedAllowanceRemaining,
  reducedDailyRest,
  extendedShift,
  allowanceNotAllowed,
  drivingUsageAfter,
  drivingDaysRemaining,
  drivingStatus,
  shiftStatus,
  restStatus,
  onEdit,
}: ShiftRowProps) {
  const allowanceLabel = reducedDailyRest
    ? allowanceNotAllowed
      ? 'Reduced daily rest · Not allowed'
      : 'Reduced daily rest'
    : 'Extended shift';

  const showAllowanceStatus = reducedDailyRest || extendedShift;

  const showRegularRestStatus =
    !showAllowanceStatus && shift.restType !== 'weekly';

  const showWeeklyRestStatus = shift.restType === 'weekly';

  return (
    <TableRow
      className="cursor-pointer transition-colors"
      onClick={() => onEdit(shift)}
    >
      <TableCell
        className="
          sticky left-0 z-20
          w-[52px] min-w-[52px]
          bg-background
          px-1 py-2
          text-center align-middle
          shadow-[2px_0_3px_-2px_rgba(0,0,0,0.2)]
          sm:w-[90px] sm:min-w-[90px]
          sm:px-2 sm:py-2
        "
      >
        <div className="text-base font-semibold leading-tight tabular-nums">
          {formatShiftDate(shift.date, shift.start)}
        </div>

        <div className="mt-0.5 text-sm leading-tight text-muted-foreground tabular-nums">
          {formatTime(shift.start)}
        </div>
      </TableCell>

      <TableCell
        className="
          w-[64px] min-w-[64px]
          px-1 py-2
          text-center align-middle
          text-sm tabular-nums
          sm:w-[90px] sm:min-w-[90px]
          sm:px-2 sm:py-2
        "
      >
        <div className="font-medium leading-tight">
          {formatDuration(drivingMinutes)}
        </div>

        {drivingStatus && (
          <div className={`${statusClassName} ${drivingStatus.className}`}>
            {drivingStatus.label}
          </div>
        )}

        {drivingStatus && (
          <DrivingCounter
            status={drivingStatus}
            used={drivingUsageAfter}
            remaining={drivingDaysRemaining}
          />
        )}
      </TableCell>

      <TableCell
        className="
          w-[60px] min-w-[60px]
          px-1 py-2
          text-center align-middle
          text-sm tabular-nums
          sm:w-[85px] sm:min-w-[85px]
          sm:px-2 sm:py-2
        "
      >
        <div className="font-medium leading-tight">
          {formatDuration(shiftMinutes)}
        </div>

        <div className={`${statusClassName} ${shiftStatus.className}`}>
          {shiftStatus.label}
        </div>
      </TableCell>

      <TableCell
        className="
          w-[46px] min-w-[46px]
          px-0.5 py-2
          text-center align-middle
          text-sm tabular-nums
          sm:w-[65px] sm:min-w-[65px]
          sm:px-2 sm:py-2
        "
      >
        {formatDuration(shift.break)}
      </TableCell>

      <TableCell
        className="
          w-[68px] min-w-[68px]
          px-1 py-2
          text-center align-middle
          text-sm tabular-nums
          sm:w-[100px] sm:min-w-[100px]
          sm:px-2 sm:py-2
        "
      >
        <div className="font-medium leading-tight">
          {formatDuration(shift.rest)}
        </div>

        {showAllowanceStatus && (
          <AllowanceStatus
            label={allowanceLabel}
            used={sharedAllowanceUsedAfter}
            remaining={sharedAllowanceRemaining}
            notAllowed={allowanceNotAllowed}
          />
        )}

        {showRegularRestStatus && (
          <div className={`${statusClassName} ${restStatus.className}`}>
            {restStatus.label}
          </div>
        )}

        {showWeeklyRestStatus && (
          <div className={`${statusClassName} ${restStatus.className}`}>
            {restStatus.label}
          </div>
        )}
      </TableCell>

      <TableCell
        className="
          w-[58px] min-w-[58px]
          px-1 py-2
          text-center align-middle
          text-sm font-medium tabular-nums
          sm:w-[80px] sm:min-w-[80px]
          sm:px-2 sm:py-2
        "
      >
        £{Number(shift.earn).toFixed(2)}
      </TableCell>

      <TableCell
        className="
          w-[66px] min-w-[66px]
          px-1 py-2
          text-center align-middle
          text-sm tabular-nums
          sm:w-[100px] sm:min-w-[100px]
          sm:px-2 sm:py-2
        "
      >
        {formatDuration(workingMinutes)}
      </TableCell>

      <TableCell
        className="
          sticky right-0 z-20
          w-[52px] min-w-[52px]
          bg-background
          px-1 py-2
          text-center align-middle
          shadow-[-2px_0_3px_-2px_rgba(0,0,0,0.2)]
          sm:w-[90px] sm:min-w-[90px]
          sm:px-2 sm:py-2
        "
      >
        <div className="text-base font-semibold leading-tight tabular-nums">
          {formatShiftDate(shift.endDate || shift.date, shift.end)}
        </div>

        <div className="mt-0.5 text-sm leading-tight text-muted-foreground tabular-nums">
          {formatTime(shift.end)}
        </div>
      </TableCell>
    </TableRow>
  );
}
