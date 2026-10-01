'use client';

import { useState, type MouseEvent } from 'react';

import { Info } from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { TableCell, TableRow } from '@/components/ui/table';

import type { Shift } from '@/features/driver-journal/types/ driver-journal';

import type { RestCompensation } from '../services/driver-journal';

import { formatDuration } from '../utils/duration';

import { calculateShiftMinutes } from '../utils/shifts';

import type { WeeklyRestCompensationCandidate } from '../utils/weekly-rest-compensation';

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

  weeklyRestCompensationCandidates?: WeeklyRestCompensationCandidate[];

  restCompensations?: RestCompensation[];

  onAcceptRestCompensation?: (
    reducedWeeklyRestShiftId: string,
    compensationShiftId: string,
    dailyRestMinutes: number,
    compensationMinutes: number,
  ) => Promise<void>;

  onDeclineRestCompensation?: (
    reducedWeeklyRestShiftId: string,
    compensationShiftId: string,
  ) => Promise<void>;

  onCancelRestCompensation?: (compensationId: string) => Promise<void>;

  onEdit: (shift: Shift) => void;
};

const REGULAR_WEEKLY_REST_MINUTES = 45 * 60;

const MINIMUM_WEEKLY_REST_MINUTES = 24 * 60;

const REGULAR_DAILY_REST_MINUTES = 11 * 60;

const REDUCED_DAILY_REST_MINUTES = 9 * 60;

function formatShiftDate(dateString: string): string {
  const [year, month, day] = dateString.split('-');

  return `${day}/${month}/${year}`;
}

function formatTime(time: string): string {
  if (!time) {
    return '';
  }

  return time.slice(0, 5);
}

function formatDurationStacked(minutes: number) {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  return (
    <span className="flex flex-col items-start leading-tight">
      <span>{hours}h</span>
      <span>{remainingMinutes}m</span>
    </span>
  );
}

function StatusInfo({
  label,
  counter,
  secondary,
  className,
}: {
  label: string;
  counter?: string;
  secondary?: string;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        type="button"
        aria-label="Show status information"
        className="absolute right-0 top-0 z-20 inline-flex size-7 items-center justify-center rounded-full hover:bg-muted"
        onClick={(event) => {
          event.stopPropagation();
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        <Info
          className={`!size-4 ${className ?? 'text-muted-foreground'}`}
        />{' '}
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
        <div className="flex flex-col items-start gap-1.5">
          <span className="block max-w-full break-words">{label}</span>

          {counter ? (
            <span className="block max-w-full break-words text-muted-foreground">
              {counter}
            </span>
          ) : null}

          {secondary ? (
            <span className="block max-w-full break-words text-muted-foreground">
              {secondary}
            </span>
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

function RestCompensationDialog({
  open,
  onOpenChange,
  candidates,
  restCompensations,
  reducedDailyRestUsedAfter = 0,
  onAccept,
  onDecline,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  candidates: WeeklyRestCompensationCandidate[];

  restCompensations: RestCompensation[];

  reducedDailyRestUsedAfter?: number;

  onAccept?: (
    reducedWeeklyRestShiftId: string,
    compensationShiftId: string,
    dailyRestMinutes: number,
    compensationMinutes: number,
  ) => Promise<void>;

  onDecline?: (
    reducedWeeklyRestShiftId: string,
    compensationShiftId: string,
  ) => Promise<void>;

  onCancel?: (compensationId: string) => Promise<void>;
}) {
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(0);

  const [saving, setSaving] = useState(false);

  const selectedCandidate = candidates[selectedCandidateIndex] ?? candidates[0];

  if (!selectedCandidate) {
    return null;
  }

  const savedCompensation = restCompensations.find(
    (compensation) =>
      compensation.reduced_weekly_rest_shift_id ===
        selectedCandidate.reducedWeeklyRestShiftId &&
      compensation.compensation_shift_id === selectedCandidate.shiftId,
  );

  const selectedOption = selectedCandidate.options[0];

  const isAccepted = savedCompensation?.decision === 'accepted';

  const isDeclined = savedCompensation?.decision === 'declined';

  const remainingRestMinutes = selectedOption
    ? Math.max(
        0,
        selectedOption.dailyRestMinutes - selectedOption.compensationMinutes,
      )
    : 0;

  const usesReducedDailyRest =
    selectedOption?.restType === 'daily' &&
    remainingRestMinutes >= REDUCED_DAILY_REST_MINUTES &&
    remainingRestMinutes < REGULAR_DAILY_REST_MINUTES;

  const reducedDailyRestUsed = usesReducedDailyRest
    ? Math.min(3, reducedDailyRestUsedAfter + 1)
    : reducedDailyRestUsedAfter;

  const reducedDailyRestRemaining = Math.max(0, 3 - reducedDailyRestUsed);

  async function handleAccept() {
    if (!selectedOption || !onAccept || isAccepted) {
      return;
    }

    setSaving(true);

    try {
      await onAccept(
        selectedCandidate.reducedWeeklyRestShiftId,
        selectedCandidate.shiftId,
        selectedOption.dailyRestMinutes,
        selectedOption.compensationMinutes,
      );

      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDecline() {
    if (!onDecline || isAccepted) {
      return;
    }

    setSaving(true);

    try {
      await onDecline(
        selectedCandidate.reducedWeeklyRestShiftId,
        selectedCandidate.shiftId,
      );

      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    if (!savedCompensation || !isAccepted || !onCancel) {
      return;
    }

    setSaving(true);

    try {
      await onCancel(savedCompensation.id);

      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px]"
        onClick={(event) => {
          event.stopPropagation();
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        {' '}
        <DialogHeader>
          {' '}
          <DialogTitle>Weekly rest compensation</DialogTitle>
          <DialogDescription>
            Choose whether to accept or decline this compensation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {candidates.length > 1 ? (
            <div className="space-y-2">
              <div className="text-sm font-medium">Compensation period</div>

              <div className="flex flex-wrap gap-2">
                {candidates.map((candidate, index) => {
                  const isSelected = index === selectedCandidateIndex;

                  return (
                    <Button
                      key={`${candidate.reducedWeeklyRestShiftId}-${candidate.shiftId}`}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCandidateIndex(index)}
                    >
                      {formatShiftDate(candidate.deadline)}
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="rounded-md border p-3">
            <div className="text-sm font-medium">Compensation required</div>

            <div className="mt-1 text-sm text-muted-foreground">
              {formatDuration(selectedCandidate.requiredCompensationMinutes)}
            </div>

            <div className="mt-3 text-sm">
              Reduced weekly rest:{' '}
              {formatDuration(selectedCandidate.reducedWeeklyRestMinutes)}
            </div>

            <div className="mt-1 text-sm text-muted-foreground">
              Deadline: {formatShiftDate(selectedCandidate.deadline)}
            </div>
          </div>

          {selectedOption ? (
            <div className="rounded-md border p-3">
              <div className="text-sm font-medium">Available option</div>

              <div className="mt-2 text-sm">
                {selectedOption.restType === 'weekly'
                  ? 'Weekly rest before compensation'
                  : 'Daily rest before compensation'}
                : {formatDuration(selectedOption.dailyRestMinutes)}
              </div>

              <div className="text-sm">
                Compensation:{' '}
                {formatDuration(selectedOption.compensationMinutes)}
              </div>

              <div className="text-sm font-medium">
                Remaining rest: {formatDuration(remainingRestMinutes)}
              </div>

              {usesReducedDailyRest ? (
                <div className="mt-2 text-sm font-medium text-red-600">
                  Reduced daily rest · {reducedDailyRestUsed}/3 used ·{' '}
                  {reducedDailyRestRemaining} left
                </div>
              ) : null}

              {selectedOption.usesReducedDailyRest && !usesReducedDailyRest ? (
                <div className="mt-2 text-sm text-muted-foreground">
                  This option uses reduced daily rest.
                </div>
              ) : null}
            </div>
          ) : null}

          {savedCompensation ? (
            <div className="rounded-md bg-muted/50 p-3 text-sm">
              <div className="font-medium">Compensation decision</div>

              <div className="mt-1 text-muted-foreground">
                {isAccepted
                  ? 'Accepted'
                  : isDeclined
                    ? 'Declined'
                    : savedCompensation.decision}
              </div>

              {isAccepted ? (
                <div className="mt-1 text-muted-foreground">
                  {formatDuration(savedCompensation.compensation_minutes)}{' '}
                  compensation applied.
                </div>
              ) : isDeclined ? (
                <div className="mt-1 text-muted-foreground">
                  You can change this decision.
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          {isAccepted ? (
            <>
              {onCancel ? (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={saving}
                  onClick={handleCancel}
                >
                  {saving ? 'Cancelling...' : 'Cancel decision'}
                </Button>
              ) : null}

              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={handleDecline}
              >
                {saving ? 'Saving...' : 'Decline'}
              </Button>

              <Button
                type="button"
                disabled={saving || !selectedOption}
                onClick={handleAccept}
              >
                {saving ? 'Saving...' : 'Accept'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AcceptedCompensationDialog({
  open,
  onOpenChange,
  compensation,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compensation: RestCompensation;
  onCancel?: (compensationId: string) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  async function handleCancel() {
    if (!onCancel) {
      return;
    }

    setSaving(true);

    try {
      await onCancel(compensation.id);

      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[420px]"
        onClick={(event) => {
          event.stopPropagation();
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        {' '}
        <DialogHeader>
          {' '}
          <DialogTitle>Change compensation decision </DialogTitle>
          <DialogDescription>
            This compensation has already been accepted. You can cancel the
            decision and review it again.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md bg-muted/50 p-3 text-sm">
          <div className="font-medium">Accepted compensation</div>

          <div className="mt-1 text-muted-foreground">
            {formatDuration(compensation.compensation_minutes)} compensation
            applied.
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="destructive"
            disabled={saving || !onCancel}
            onClick={handleCancel}
          >
            {saving ? 'Cancelling...' : 'Cancel decision'}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RestInfo({
  status,
  shiftId,
  usageAfter = 0,
  reducedDailyRest = false,
  extendedShift = false,
  isWeeklyRest = false,
  isReducedWeeklyRest = false,
  isRegularWeeklyRest = false,
  compensationUsesReducedDailyRest = false,
  weeklyRestCompensationCandidates = [],
  restCompensations = [],
  isCompensatedWeeklyRest = false,
  acceptedCompensation,
  onAcceptRestCompensation,
  onDeclineRestCompensation,
  onCancelRestCompensation,
}: {
  status: NonNullable<ReturnType<typeof getRestStatus>>;
  shiftId: string;
  usageAfter?: number;
  reducedDailyRest?: boolean;
  extendedShift?: boolean;
  isWeeklyRest?: boolean;
  isReducedWeeklyRest?: boolean;
  isRegularWeeklyRest?: boolean;
  compensationUsesReducedDailyRest?: boolean;
  weeklyRestCompensationCandidates?: WeeklyRestCompensationCandidate[];
  restCompensations?: RestCompensation[];
  isCompensatedWeeklyRest?: boolean;
  acceptedCompensation?: RestCompensation;
  onAcceptRestCompensation?: (
    reducedWeeklyRestShiftId: string,
    compensationShiftId: string,
    dailyRestMinutes: number,
    compensationMinutes: number,
  ) => Promise<void>;
  onDeclineRestCompensation?: (
    reducedWeeklyRestShiftId: string,
    compensationShiftId: string,
  ) => Promise<void>;
  onCancelRestCompensation?: (compensationId: string) => Promise<void>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const [acceptedDecisionDialogOpen, setAcceptedDecisionDialogOpen] =
    useState(false);

  const hasAcceptedCompensation = Boolean(acceptedCompensation);

  const hasCandidates = weeklyRestCompensationCandidates.length > 0;

  const firstCandidate = weeklyRestCompensationCandidates[0];

  const hasDeclinedCompensation = restCompensations.some(
    (compensation) =>
      compensation.decision === 'declined' &&
      weeklyRestCompensationCandidates.some(
        (candidate) =>
          candidate.reducedWeeklyRestShiftId ===
            compensation.reduced_weekly_rest_shift_id &&
          candidate.shiftId === compensation.compensation_shift_id,
      ),
  );

  const isCompensationSource =
    isWeeklyRest &&
    isReducedWeeklyRest &&
    acceptedCompensation?.reduced_weekly_rest_shift_id === shiftId;

  const isCompensationReceiver =
    Boolean(acceptedCompensation) &&
    acceptedCompensation?.compensation_shift_id !== undefined;

  const label = compensationUsesReducedDailyRest
    ? 'Reduced daily rest · Compensation applied'
    : isCompensationSource
      ? 'Reduced weekly rest · Compensation applied'
      : isWeeklyRest && isRegularWeeklyRest && isCompensationReceiver
        ? 'Regular weekly rest · Compensation applied'
        : isWeeklyRest && isReducedWeeklyRest
          ? 'Reduced weekly rest'
          : hasAcceptedCompensation
            ? 'Daily rest · Compensation applied'
            : extendedShift
              ? 'Extended shift'
              : reducedDailyRest && usageAfter > 3
                ? 'Reduced daily rest · Not allowed'
                : status.label;

  const usesReducedDailyRestAllowance =
    reducedDailyRest || compensationUsesReducedDailyRest;

  const counter =
    usesReducedDailyRestAllowance || extendedShift
      ? `${usageAfter}/3 used · ${Math.max(0, 3 - usageAfter)} left`
      : undefined;

  const compensationCounter =
    hasAcceptedCompensation || hasDeclinedCompensation
      ? undefined
      : firstCandidate
        ? `${formatDuration(
            firstCandidate.requiredCompensationMinutes,
          )} compensation required`
        : undefined;

  const compensationSecondary = hasAcceptedCompensation
    ? `Compensated ${formatDuration(
        Number(acceptedCompensation?.compensation_minutes ?? 0),
      )}`
    : hasDeclinedCompensation
      ? 'Driver decision saved'
      : 'Driver choice required';

  function handleReview(event: MouseEvent) {
    event.stopPropagation();

    setDialogOpen(true);
  }

  function handleChangeAcceptedDecision(event: MouseEvent) {
    event.stopPropagation();

    setAcceptedDecisionDialogOpen(true);
  }

  const infoClassName = compensationUsesReducedDailyRest
    ? 'text-red-600'
    : hasAcceptedCompensation
      ? isCompensationSource
        ? 'text-amber-600'
        : 'text-green-600'
      : hasCandidates || hasDeclinedCompensation
        ? 'text-green-600'
        : (status.className ?? 'text-muted-foreground');

  return (
    <>
      {' '}
      <Popover>
        <PopoverTrigger
          type="button"
          aria-label="Show rest information"
          className="absolute right-1 top-0 z-20 inline-flex size-7 items-center justify-center rounded-full hover:bg-muted"
          onClick={(event) => {
            event.stopPropagation();
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          <Info className={`!size-4 ${infoClassName}`} />{' '}
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="center"
          className="
        z-50
        w-[calc(100vw-2rem)]
        max-w-[280px]
        bg-background
        text-sm
        text-foreground
        shadow-md
      "
          onClick={(event) => {
            event.stopPropagation();
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="flex min-w-0 flex-col items-start gap-1.5">
            <span className="block max-w-full break-words">{label}</span>

            {counter ? (
              <span className="block max-w-full break-words text-muted-foreground">
                {counter}
              </span>
            ) : null}

            {hasAcceptedCompensation ? (
              <>
                <span className="block max-w-full break-words text-muted-foreground">
                  {compensationSecondary}
                </span>

                {onCancelRestCompensation ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2 h-8 shrink-0"
                    onClick={handleChangeAcceptedDecision}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    Change decision
                  </Button>
                ) : null}
              </>
            ) : null}

            {!hasAcceptedCompensation &&
            (hasCandidates || hasDeclinedCompensation) ? (
              <>
                {compensationCounter ? (
                  <span className="block max-w-full break-words text-muted-foreground">
                    {compensationCounter}
                  </span>
                ) : null}

                <span className="block max-w-full break-words text-muted-foreground">
                  {compensationSecondary}
                </span>
              </>
            ) : null}

            {hasCandidates ? (
              <Button
                type="button"
                size="sm"
                className="mt-2 h-8 shrink-0"
                onClick={handleReview}
                onPointerDown={(event) => {
                  event.stopPropagation();
                }}
              >
                {hasDeclinedCompensation
                  ? 'Change decision'
                  : 'Review compensation'}
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
      {hasCandidates ? (
        <RestCompensationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          candidates={weeklyRestCompensationCandidates}
          restCompensations={restCompensations}
          reducedDailyRestUsedAfter={usageAfter}
          onAccept={onAcceptRestCompensation}
          onDecline={onDeclineRestCompensation}
          onCancel={onCancelRestCompensation}
        />
      ) : null}
      {acceptedCompensation ? (
        <AcceptedCompensationDialog
          open={acceptedDecisionDialogOpen}
          onOpenChange={setAcceptedDecisionDialogOpen}
          compensation={acceptedCompensation}
          onCancel={onCancelRestCompensation}
        />
      ) : null}
    </>
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
  weeklyRestCompensationCandidates,
  restCompensations = [],
  onAcceptRestCompensation,
  onDeclineRestCompensation,
  onCancelRestCompensation,
  onEdit,
}: ShiftRowProps) {
  const shiftMinutes = calculateShiftMinutes(shift);

  const workingMinutes = shiftMinutes - shift.break;

  const endDate = shift.endDate || shift.date;

  const acceptedCompensation = restCompensations.find(
    (compensation) =>
      compensation.decision === 'accepted' &&
      (compensation.compensation_shift_id === shift.id ||
        compensation.reduced_weekly_rest_shift_id === shift.id),
  );

  const acceptedCompensationForShift = restCompensations.find(
    (compensation) =>
      compensation.decision === 'accepted' &&
      compensation.compensation_shift_id === shift.id,
  );

  const isWeeklyRest = shift.restType === 'weekly';

  const actualRestMinutes = Number(shift.rest) || 0;

  const compensationMinutesForShift = Number(
    acceptedCompensationForShift?.compensation_minutes ?? 0,
  );

  const effectiveDailyRestMinutes =
    !isWeeklyRest && acceptedCompensationForShift
      ? Math.max(0, actualRestMinutes - compensationMinutesForShift)
      : actualRestMinutes;

  const compensationUsesReducedDailyRest =
    Boolean(acceptedCompensationForShift) &&
    !isWeeklyRest &&
    effectiveDailyRestMinutes >= REDUCED_DAILY_REST_MINUTES &&
    effectiveDailyRestMinutes < REGULAR_DAILY_REST_MINUTES;

  const isReducedWeeklyRest =
    isWeeklyRest &&
    actualRestMinutes >= MINIMUM_WEEKLY_REST_MINUTES &&
    actualRestMinutes < REGULAR_WEEKLY_REST_MINUTES;

  const isRegularWeeklyRest =
    isWeeklyRest && actualRestMinutes >= REGULAR_WEEKLY_REST_MINUTES;

  const isCompensationSourceWeeklyRest =
    isWeeklyRest &&
    isReducedWeeklyRest &&
    acceptedCompensation?.reduced_weekly_rest_shift_id === shift.id;

  const isCompensationReceiverWeeklyRest =
    isWeeklyRest && Boolean(acceptedCompensationForShift);

  const isCompensatedWeeklyRest =
    isCompensationSourceWeeklyRest || isCompensationReceiverWeeklyRest;

  const effectiveRestStatus = getRestStatus(shift, actualRestMinutes);

  const displayRestStatus = isWeeklyRest ? effectiveRestStatus : restStatus;

  const isWeeklyStatus = isRegularWeeklyRest || isReducedWeeklyRest;

  const rowClassName = isWeeklyStatus
    ? 'cursor-pointer bg-muted/40 hover:bg-muted/60'
    : 'cursor-pointer';

  const stickyCellClassName = isWeeklyStatus ? 'bg-muted' : 'bg-background';

  const weeklyRestBorderClassName = isReducedWeeklyRest
    ? isCompensationSourceWeeklyRest
      ? 'border-l-amber-500'
      : 'border-l-red-500'
    : isRegularWeeklyRest
      ? 'border-l-green-500'
      : 'border-l-transparent';

  return (
    <TableRow className={rowClassName} onClick={() => onEdit(shift)}>
      <TableCell
        className={`sticky left-0 z-10 border-l-2 px-1 py-1 text-left text-sm ${weeklyRestBorderClassName} ${stickyCellClassName}`}
      >
        {' '}
        <div className="flex flex-col items-start leading-tight">
          {' '}
          <span>{formatShiftDate(shift.date)}</span>{' '}
          <span className="text-muted-foreground">
            {formatTime(shift.start)}{' '}
          </span>{' '}
        </div>{' '}
      </TableCell>

      <TableCell className="relative px-0.5 py-1 text-left text-sm">
        <div className="flex min-h-8 items-center justify-start pr-1">
          {formatDurationStacked(shift.driving)}
        </div>

        {drivingStatus ? (
          <DrivingInfo status={drivingStatus} usageAfter={drivingUsageAfter} />
        ) : null}
      </TableCell>

      <TableCell className="relative px-0.5 py-1 text-left text-sm">
        <div className="flex min-h-8 items-center justify-start pr-1">
          {formatDurationStacked(shiftMinutes)}
        </div>

        {shiftStatus ? <ShiftInfo status={shiftStatus} /> : null}
      </TableCell>

      <TableCell className="px-0.5 py-1 text-left text-sm">
        {formatDuration(shift.break)}
      </TableCell>

      <TableCell className="relative px-0.5 py-1 text-left text-sm">
        <div className="flex min-h-8 items-center justify-start pr-1">
          {formatDurationStacked(shift.rest)}
        </div>

        {displayRestStatus ? (
          <RestInfo
            status={displayRestStatus}
            shiftId={shift.id}
            usageAfter={sharedAllowanceUsedAfter}
            reducedDailyRest={reducedDailyRest}
            extendedShift={extendedShift}
            compensationUsesReducedDailyRest={compensationUsesReducedDailyRest}
            isWeeklyRest={isWeeklyRest}
            isReducedWeeklyRest={isReducedWeeklyRest}
            isRegularWeeklyRest={isRegularWeeklyRest}
            weeklyRestCompensationCandidates={weeklyRestCompensationCandidates}
            restCompensations={restCompensations}
            isCompensatedWeeklyRest={isCompensatedWeeklyRest}
            acceptedCompensation={acceptedCompensation}
            onAcceptRestCompensation={onAcceptRestCompensation}
            onDeclineRestCompensation={onDeclineRestCompensation}
            onCancelRestCompensation={onCancelRestCompensation}
          />
        ) : null}

        {isWeeklyStatus ? (
          <span
            className={[
              'absolute z-10 inline-flex min-h-6 min-w-6 items-center justify-center rounded-sm px-1 font-bold leading-none',
              isReducedWeeklyRest
                ? 'right-[0.37rem] bottom-[0.1rem] text-amber-600'
                : 'right-[0.38rem] bottom-0 text-green-700',
            ].join(' ')}
            style={{
              fontSize: '9px',
            }}
          >
            {isReducedWeeklyRest ? 'RW' : 'W'}
          </span>
        ) : null}
      </TableCell>

      <TableCell className="px-0.5 py-1 text-left text-sm">
        £{shift.earn.toFixed(2)}
      </TableCell>

      <TableCell className="px-0.5 py-1 text-left text-sm">
        {formatDurationStacked(workingMinutes)}
      </TableCell>

      <TableCell
        className={`sticky right-0 z-10 px-1 py-1 text-left text-sm ${stickyCellClassName}`}
      >
        <div className="flex flex-col items-start leading-tight">
          <span>{formatShiftDate(endDate)}</span>
          <span className="text-muted-foreground">{formatTime(shift.end)}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
