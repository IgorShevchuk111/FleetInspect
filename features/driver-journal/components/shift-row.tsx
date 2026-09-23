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

const statusClassName = 'mt-1 text-[10px] font-medium leading-tight sm:text-xs';

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
    <div className="space-y-0.5">
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
          w-[72px] min-w-[72px]
          bg-background
          px-2 py-3
          text-center align-middle
          shadow-[2px_0_3px_-2px_rgba(0,0,0,0.2)]
          sm:w-[110px] sm:min-w-[110px]
          sm:px-4 sm:py-3
        "
      >
        <div className="text-xs font-semibold leading-tight tabular-nums sm:text-sm">
          {formatShiftDate(shift.date, shift.start)}
        </div>

        <div className="mt-0.5 text-xs leading-tight text-muted-foreground tabular-nums sm:text-sm">
          {formatTime(shift.start)}
        </div>
      </TableCell>

      <TableCell
        className="
          w-[82px] min-w-[82px]
          px-2 py-3
          text-center align-middle
          text-xs tabular-nums
          sm:w-[110px] sm:min-w-[110px]
          sm:px-4 sm:py-3 sm:text-sm
        "
      >
        <div className="font-medium">{formatDuration(drivingMinutes)}</div>

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
          w-[78px] min-w-[78px]
          px-2 py-3
          text-center align-middle
          text-xs tabular-nums
          sm:w-[110px] sm:min-w-[110px]
          sm:px-4 sm:py-3 sm:text-sm
        "
      >
        <div className="font-medium">{formatDuration(shiftMinutes)}</div>

        <div className={`${statusClassName} ${shiftStatus.className}`}>
          {shiftStatus.label}
        </div>
      </TableCell>

      <TableCell
        className="
          w-[58px] min-w-[58px]
          px-2 py-3
          text-center align-middle
          text-xs tabular-nums
          sm:w-[90px] sm:min-w-[90px]
          sm:px-4 sm:py-3 sm:text-sm
        "
      >
        {formatDuration(shift.break)}
      </TableCell>

      <TableCell
        className="
          w-[92px] min-w-[92px]
          px-2 py-3
          text-center align-middle
          text-xs tabular-nums
          sm:w-[120px] sm:min-w-[120px]
          sm:px-4 sm:py-3 sm:text-sm
        "
      >
        <div className="font-medium">{formatDuration(shift.rest)}</div>

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
          w-[72px] min-w-[72px]
          px-2 py-3
          text-center align-middle
          text-xs font-medium tabular-nums
          sm:w-[100px] sm:min-w-[100px]
          sm:px-4 sm:py-3 sm:text-sm
        "
      >
        £{Number(shift.earn).toFixed(2)}
      </TableCell>

      <TableCell
        className="
          w-[82px] min-w-[82px]
          px-2 py-3
          text-center align-middle
          text-xs tabular-nums
          sm:w-[120px] sm:min-w-[120px]
          sm:px-4 sm:py-3 sm:text-sm
        "
      >
        {formatDuration(workingMinutes)}
      </TableCell>

      <TableCell
        className="
          sticky right-0 z-20
          w-[72px] min-w-[72px]
          bg-background
          px-2 py-3
          text-center align-middle
          shadow-[-2px_0_3px_-2px_rgba(0,0,0,0.2)]
          sm:w-[110px] sm:min-w-[110px]
          sm:px-4 sm:py-3
        "
      >
        <div className="text-xs font-semibold leading-tight tabular-nums sm:text-sm">
          {formatShiftDate(shift.endDate || shift.date, shift.end)}
        </div>

        <div className="mt-0.5 text-xs leading-tight text-muted-foreground tabular-nums sm:text-sm">
          {formatTime(shift.end)}
        </div>
      </TableCell>
    </TableRow>
  );
}
