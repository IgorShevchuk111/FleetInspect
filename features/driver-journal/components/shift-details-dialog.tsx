'use client';

import type { ReactNode } from 'react';

import {
  Banknote,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Gauge,
  Moon,
  Pencil,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { Shift } from '@/features/driver-journal/types/ driver-journal';

import type { RestCompensation } from '../services/driver-journal';

import { calculateShiftMinutes } from '../utils/shifts';

import type { WeeklyRestCompensationCandidate } from '../utils/weekly-rest-compensation';

import {
  getDrivingStatus,
  getRestStatus,
  getShiftStatus,
} from './shift-status';

type ShiftDetailsDialogProps = {
  open: boolean;

  onOpenChange: (open: boolean) => void;

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

  onEdit: (shift: Shift) => void;

  onDelete: (shift: Shift) => void;

  onAcceptRestCompensation?: (
    reducedWeeklyRestShiftId: string,
    compensationShiftId: string,
    dailyRestMinutes: number,
    compensationMinutes: number,
  ) => Promise<void>;

  onCancelRestCompensation?: (compensationId: string) => Promise<void>;
};

const REGULAR_WEEKLY_REST_MINUTES = 45 * 60;

const MINIMUM_WEEKLY_REST_MINUTES = 24 * 60;

const REGULAR_DAILY_REST_MINUTES = 11 * 60;

const REDUCED_DAILY_REST_MINUTES = 9 * 60;

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-');

  if (!year || !month || !day) {
    return dateString;
  }

  return `${day}/${month}/${year}`;
}

function formatTime(time: string): string {
  return time ? time.slice(0, 5) : '';
}

function formatDuration(minutesValue: number | string): string {
  const minutes = Math.max(0, Math.round(Number(minutesValue) || 0));

  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;

  return `${hours}h ${String(remainingMinutes).padStart(2, '0')}m`;
}

function formatHoursMinutes(minutesValue: number | string): string {
  const minutes = Math.max(0, Math.round(Number(minutesValue) || 0));

  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatMoney(value: number | string): string {
  return `£${(Number(value) || 0).toFixed(2)}`;
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof CalendarDays;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t pt-3 first:border-t-0 first:pt-0">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" />

        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

function DetailRow({
  label,
  value,
  valueClassName = '',
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-4 border-b border-border/50 last:border-b-0">
      <span className="min-w-0 text-xs text-muted-foreground">{label}</span>

      <span
        className={[
          'min-w-0 text-right text-sm font-medium',
          valueClassName,
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  );
}

function CompensationOption({
  option,
  onAccept,
}: {
  option: WeeklyRestCompensationCandidate['options'][number];
  onAccept?: () => void;
}) {
  return (
    <div className="border-t border-border/50 py-2.5 first:border-t-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium">
            {option.restType === 'weekly' ? 'Weekly rest' : 'Daily rest'}
          </div>

          <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            {formatHoursMinutes(option.dailyRestMinutes)} rest after{' '}
            {formatHoursMinutes(option.compensationMinutes)} compensation.
          </div>

          {option.usesReducedDailyRest ? (
            <div className="mt-1 text-[11px] text-amber-600">
              Uses reduced daily rest.
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-1.5">
          {onAccept ? (
            <Button type="button" size="sm" className="h-8" onClick={onAccept}>
              Accept
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ShiftDetailsDialog({
  open,
  onOpenChange,
  shift,
  drivingUsageAfter = 0,
  sharedAllowanceUsedAfter = 0,
  reducedDailyRest = false,
  extendedShift = false,
  weeklyRestCompensationCandidates = [],
  restCompensations = [],
  onEdit,
  onDelete: _onDelete,
  onAcceptRestCompensation,
  onCancelRestCompensation,
}: ShiftDetailsDialogProps) {
  const shiftMinutes = calculateShiftMinutes(shift);

  const endDate = shift.endDate || shift.date;

  const drivingMinutes = Number(shift.driving) || 0;

  const breakMinutes = Number(shift.break) || 0;

  const actualRestMinutes = Number(shift.rest) || 0;

  const workingMinutes = Math.max(0, shiftMinutes - breakMinutes);

  const isWeeklyRest = shift.restType === 'weekly';

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

  const effectiveRestMinutes = isWeeklyRest
    ? actualRestMinutes
    : Math.max(0, actualRestMinutes - compensationMinutes);

  const isReducedWeeklyRest =
    isWeeklyRest &&
    effectiveRestMinutes >= MINIMUM_WEEKLY_REST_MINUTES &&
    effectiveRestMinutes < REGULAR_WEEKLY_REST_MINUTES;

  const isRegularWeeklyRest =
    isWeeklyRest && effectiveRestMinutes >= REGULAR_WEEKLY_REST_MINUTES;

  const isReducedDailyRest =
    !isWeeklyRest &&
    effectiveRestMinutes >= REDUCED_DAILY_REST_MINUTES &&
    effectiveRestMinutes < REGULAR_DAILY_REST_MINUTES;

  const drivingOver9Hours = drivingMinutes > 9 * 60;

  const drivingOver10Hours = drivingMinutes > 10 * 60;

  const shiftOver15Hours = shiftMinutes > 15 * 60;

  const compensationUsesReducedDailyRest =
    Boolean(acceptedCompensationForShift) &&
    !isWeeklyRest &&
    effectiveRestMinutes >= REDUCED_DAILY_REST_MINUTES &&
    effectiveRestMinutes < REGULAR_DAILY_REST_MINUTES;

  const isCompensationSource =
    isWeeklyRest &&
    isReducedWeeklyRest &&
    acceptedCompensation?.reduced_weekly_rest_shift_id === shift.id;

  const isCompensationReceiver = Boolean(acceptedCompensationForShift);

  const matchingCandidates = weeklyRestCompensationCandidates.filter(
    (candidate) => candidate.shiftId === shift.id,
  );

  const savedCompensations = restCompensations.filter(
    (compensation) =>
      compensation.reduced_weekly_rest_shift_id === shift.id ||
      compensation.compensation_shift_id === shift.id,
  );

  function handleEdit() {
    onOpenChange(false);

    onEdit(shift);
  }

  async function handleAccept(
    candidate: WeeklyRestCompensationCandidate,
    option: WeeklyRestCompensationCandidate['options'][number],
  ) {
    if (!onAcceptRestCompensation) {
      return;
    }

    await onAcceptRestCompensation(
      candidate.reducedWeeklyRestShiftId,
      candidate.shiftId,
      option.dailyRestMinutes,
      option.compensationMinutes,
    );
  }

  async function handleCancel(compensationId: string) {
    if (!onCancelRestCompensation) {
      return;
    }

    await onCancelRestCompensation(compensationId);
  }

  const drivingLimit = drivingOver10Hours ? '10h' : '9h';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
    flex
    h-[100dvh]
    max-h-[100dvh]
    w-full
    max-w-full
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
        <DialogHeader className="shrink-0 border-b px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Clock3 className="size-4 text-primary" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-lg">Shift details</DialogTitle>

              <DialogDescription className="mt-0.5 text-xs">
                {formatDate(shift.date)} · {formatTime(shift.start)}
                {' → '}
                {formatDate(endDate)} · {formatTime(shift.end)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
          <div className="space-y-4 px-4 py-4 sm:px-6">
            <Section icon={CalendarDays} title="Shift times">
              <DetailRow
                label="Start"
                value={`${formatDate(shift.date)} ${formatTime(shift.start)}`}
              />

              <DetailRow
                label="End"
                value={`${formatDate(endDate)} ${formatTime(shift.end)}`}
              />
            </Section>

            <Section icon={Gauge} title="Driving & shift">
              <DetailRow
                label="Driving"
                value={
                  <div className="flex flex-col items-end">
                    <span>
                      {formatDuration(drivingMinutes)} / {drivingLimit}
                    </span>

                    {drivingOver9Hours ? (
                      <span
                        className={
                          drivingOver10Hours
                            ? 'text-[10px] text-red-600'
                            : 'text-[10px] text-amber-600'
                        }
                      >
                        {drivingOver10Hours
                          ? `Over maximum · ${drivingUsageAfter}/2 used`
                          : `Extended day used ${drivingUsageAfter}/2`}
                      </span>
                    ) : null}
                  </div>
                }
                valueClassName={
                  drivingOver10Hours
                    ? 'text-red-600'
                    : drivingOver9Hours
                      ? 'text-amber-600'
                      : ''
                }
              />

              <DetailRow
                label="Shift"
                value={
                  <div className="flex flex-col items-end">
                    <span>{formatDuration(shiftMinutes)} / 15h</span>

                    {extendedShift ? (
                      <span
                        className={
                          shiftOver15Hours
                            ? 'text-[10px] text-red-600'
                            : 'text-[10px] text-amber-600'
                        }
                      >
                        {shiftOver15Hours
                          ? `Over maximum · ${sharedAllowanceUsedAfter}/3 used`
                          : `Extended shift used ${sharedAllowanceUsedAfter}/3`}
                      </span>
                    ) : shiftOver15Hours ? (
                      <span className="text-[10px] text-red-600">
                        Over maximum
                      </span>
                    ) : null}
                  </div>
                }
                valueClassName={shiftOver15Hours ? 'text-red-600' : ''}
              />

              <DetailRow label="Break" value={formatDuration(breakMinutes)} />

              <DetailRow
                label="Working"
                value={formatDuration(workingMinutes)}
              />
            </Section>

            <Section icon={Moon} title="Rest">
              <DetailRow
                label="Rest"
                value={
                  <div className="flex flex-col items-end">
                    <span>{formatHoursMinutes(effectiveRestMinutes)}</span>

                    <span className="text-[10px] text-muted-foreground">
                      {isWeeklyRest
                        ? isReducedWeeklyRest
                          ? 'Reduced weekly'
                          : isRegularWeeklyRest
                            ? 'Weekly'
                            : 'Weekly'
                        : isReducedDailyRest
                          ? 'Reduced daily'
                          : 'Daily'}
                    </span>
                  </div>
                }
                valueClassName={
                  isReducedWeeklyRest || isReducedDailyRest
                    ? 'text-amber-600'
                    : isRegularWeeklyRest ||
                        (!isWeeklyRest &&
                          effectiveRestMinutes >= REGULAR_DAILY_REST_MINUTES)
                      ? 'text-green-600'
                      : ''
                }
              />

              {isReducedDailyRest ? (
                <DetailRow
                  label="Allowance"
                  value={`${sharedAllowanceUsedAfter}/3 used`}
                  valueClassName="text-amber-600"
                />
              ) : null}

              {isReducedWeeklyRest ? (
                <DetailRow
                  label="Weekly rest"
                  value="Reduced"
                  valueClassName="text-amber-600"
                />
              ) : null}
            </Section>

            <Section icon={Banknote} title="Earnings">
              <DetailRow
                label="Earn"
                value={formatMoney(shift.earn)}
                valueClassName="text-green-600"
              />
            </Section>

            {acceptedCompensationForShift ? (
              <Section icon={BedDouble} title="Compensation">
                <DetailRow
                  label="Compensation"
                  value={formatHoursMinutes(compensationMinutes)}
                  valueClassName="text-green-600"
                />

                <DetailRow
                  label="Original rest"
                  value={formatHoursMinutes(actualRestMinutes)}
                />

                <DetailRow
                  label="Remaining rest"
                  value={formatHoursMinutes(effectiveRestMinutes)}
                />

                <DetailRow
                  label="Rest after compensation"
                  value={
                    compensationUsesReducedDailyRest
                      ? 'Reduced daily rest'
                      : isRegularWeeklyRest
                        ? 'Regular weekly rest'
                        : formatHoursMinutes(effectiveRestMinutes)
                  }
                  valueClassName={
                    compensationUsesReducedDailyRest
                      ? 'text-amber-600'
                      : 'text-green-600'
                  }
                />
              </Section>
            ) : null}

            {isCompensationSource ? (
              <Section icon={BedDouble} title="Weekly rest compensation">
                <DetailRow
                  label="Status"
                  value="Accepted"
                  valueClassName="text-green-600"
                />

                {acceptedCompensation?.compensation_minutes ? (
                  <DetailRow
                    label="Compensation"
                    value={formatHoursMinutes(
                      Number(acceptedCompensation.compensation_minutes),
                    )}
                  />
                ) : null}
              </Section>
            ) : null}

            {isCompensationReceiver ? (
              <Section icon={BedDouble} title="Weekly rest compensation">
                <DetailRow
                  label="Status"
                  value="Compensation received"
                  valueClassName="text-green-600"
                />
              </Section>
            ) : null}

            {matchingCandidates.length > 0 ? (
              <Section icon={BedDouble} title="Available compensation">
                <div className="divide-y rounded-md border">
                  {matchingCandidates.map((candidate) => (
                    <div
                      key={`${candidate.reducedWeeklyRestShiftId}-${candidate.shiftId}`}
                      className="p-3"
                    >
                      <div className="space-y-1.5 text-xs">
                        <DetailRow
                          label="Reduced weekly rest"
                          value={formatHoursMinutes(
                            candidate.reducedWeeklyRestMinutes,
                          )}
                        />

                        <DetailRow
                          label="Required compensation"
                          value={formatHoursMinutes(
                            candidate.requiredCompensationMinutes,
                          )}
                        />

                        <DetailRow
                          label="Deadline"
                          value={formatDate(candidate.deadline)}
                        />
                      </div>

                      <div className="mt-2">
                        {candidate.options.map((option, optionIndex) => (
                          <CompensationOption
                            key={`${candidate.shiftId}-${optionIndex}`}
                            option={option}
                            onAccept={
                              onAcceptRestCompensation
                                ? () => handleAccept(candidate, option)
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}

            {savedCompensations.length > 0 ? (
              <Section icon={CheckCircle2} title="Saved compensation">
                <div className="divide-y rounded-md border">
                  {savedCompensations.map((compensation) => {
                    const savedMinutes = Number(
                      compensation.compensation_minutes ?? 0,
                    );

                    const isAccepted = compensation.decision === 'accepted';

                    const isDeclined = compensation.decision === 'declined';

                    return (
                      <div key={compensation.id} className="p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs font-medium">
                            {isAccepted
                              ? 'Accepted'
                              : isDeclined
                                ? 'Declined'
                                : 'Pending'}
                          </div>

                          <div
                            className={[
                              'text-xs font-medium',
                              isAccepted
                                ? 'text-green-600'
                                : isDeclined
                                  ? 'text-red-600'
                                  : 'text-amber-600',
                            ].join(' ')}
                          >
                            {formatHoursMinutes(savedMinutes)}
                          </div>
                        </div>

                        {compensation.daily_rest_minutes != null ? (
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            Daily rest:{' '}
                            {formatHoursMinutes(
                              Number(compensation.daily_rest_minutes),
                            )}
                          </div>
                        ) : null}

                        {isAccepted && onCancelRestCompensation ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="mt-2 h-8"
                            onClick={() => handleCancel(compensation.id)}
                          >
                            Cancel decision
                          </Button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </Section>
            ) : null}
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-row items-center justify-between gap-2 border-t px-4 py-3 sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>

          <Button type="button" onClick={handleEdit} className="min-w-28">
            <Pencil className="size-4" />
            Edit shift
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
