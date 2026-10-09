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
import type { RestCompensation } from '@/features/driver-journal/services/driver-journal';
import type { Shift } from '@/features/driver-journal/types/ driver-journal';
import { formatDuration } from '@/features/driver-journal/utils/duration';
import { getShiftDetailsData } from '@/features/driver-journal/utils/shift-details';
import {
  getDrivingStatus,
  getRestStatus,
  getShiftStatus,
} from '@/features/driver-journal/utils/shift-status';
import type { WeeklyRestCompensationCandidate } from '@/features/driver-journal/utils/weekly-rest-compensation';

type ShiftDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

function formatDate(value: string) {
  const [year, month, day] = value.split('-');

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatTime(value: string | null | undefined) {
  return value?.slice(0, 5) ?? '';
}

function formatMoney(value: number | string | null | undefined) {
  return `£${(Number(value) || 0).toFixed(2)}`;
}

function DetailRow({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-4 border-b border-border/50 py-1 last:border-b-0">
      <span className="text-caption text-muted-foreground">{label}</span>

      <div
        className={`text-right text-foreground font-medium ${className ?? ''}`}
      >
        {value}
      </div>
    </div>
  );
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
    <section className="space-y-2 border-t pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />

        <h3 className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </div>

      <div>{children}</div>
    </section>
  );
}

function StatusHint({
  children,
  className = 'text-muted-foreground',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`text-[10px] ${className}`}>{children}</span>;
}

function CompensationOption({
  option,
  onAccept,
}: {
  option: WeeklyRestCompensationCandidate['options'][number];
  onAccept?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t py-2 first:border-t-0">
      <div className="min-w-0">
        <div className="text-caption font-medium">
          {option.restType === 'weekly' ? 'Weekly rest' : 'Daily rest'}
        </div>

        <div className="text-[11px] text-muted-foreground">
          {formatDuration(option.dailyRestMinutes)} rest ·{' '}
          {formatDuration(option.compensationMinutes)} compensation
        </div>

        {option.usesReducedDailyRest && (
          <StatusHint className="text-warning">
            Uses reduced daily rest
          </StatusHint>
        )}
      </div>

      {onAccept && (
        <Button
          type="button"
          size="sm"
          className="h-8 shrink-0"
          onClick={onAccept}
        >
          Accept
        </Button>
      )}
    </div>
  );
}

export function ShiftDetailsDialog({
  open,
  onOpenChange,
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
  onEdit,
  onAcceptRestCompensation,
  onCancelRestCompensation,
}: ShiftDetailsDialogProps) {
  const details = getShiftDetailsData(shift, {
    drivingUsageAfter,
    extendedShiftUsageAfter,
    extendedShift,
    weeklyRestCompensationCandidates,
    restCompensations,
  });

  const {
    shiftMinutes,
    drivingMinutes,
    breakMinutes,
    restMinutes,
    workingMinutes,
    endDate,
    isWeeklyRest,
    isReducedWeeklyRest,
    isRegularWeeklyRest,
    isReducedDailyRest,
    effectiveRestMinutes,
    compensationMinutes,
    drivingOver9Hours,
    drivingOver10Hours,
    shiftOver15Hours,
    drivingUsageBefore,
    extendedShiftUsageBefore,
    drivingMaximumMinutes,
    shiftMaximumMinutes,
    compensationReceiver,
    compensationSource,
    candidates,
    savedCompensations,
  } = details;

  const acceptedCompensation = restCompensations.find(
    (compensation) =>
      compensation.decision === 'accepted' &&
      compensation.compensation_shift_id === shift.id,
  );

  const handleEdit = () => {
    onOpenChange(false);
    onEdit(shift);
  };

  const handleAccept = async (
    candidate: WeeklyRestCompensationCandidate,
    option: WeeklyRestCompensationCandidate['options'][number],
  ) => {
    await onAcceptRestCompensation?.(
      candidate.reducedWeeklyRestShiftId,
      candidate.shiftId,
      option.dailyRestMinutes,
      option.compensationMinutes,
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[90vh] sm:w-[calc(100vw-2rem)] sm:max-w-xl sm:rounded-lg">
        <DialogHeader className="shrink-0 border-b px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Clock3 className="size-4 text-primary" />
            </div>

            <div className="min-w-0">
              <DialogTitle>Shift details</DialogTitle>

              <DialogDescription className="text-caption leading-body">
                {formatDate(shift.date)} {formatTime(shift.start)}
                {' → '}
                {formatDate(endDate)} {formatTime(shift.end)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
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
                      {formatDuration(drivingMinutes)} /{' '}
                      {formatDuration(drivingMaximumMinutes)}
                    </span>

                    {drivingOver10Hours ? (
                      <StatusHint className="text-danger">
                        Over maximum · {drivingUsageAfter}/2 extended days used
                      </StatusHint>
                    ) : (
                      <StatusHint
                        className={
                          drivingOver9Hours
                            ? 'text-warning'
                            : 'text-muted-foreground'
                        }
                      >
                        Extended days {drivingUsageAfter}/2 used
                      </StatusHint>
                    )}
                  </div>
                }
                className={
                  drivingOver10Hours
                    ? 'text-danger'
                    : drivingOver9Hours
                      ? 'text-warning'
                      : undefined
                }
              />

              <DetailRow
                label="Shift"
                value={
                  <div className="flex flex-col items-end">
                    <span>
                      {formatDuration(shiftMinutes)} /{' '}
                      {formatDuration(shiftMaximumMinutes)}
                    </span>

                    {shiftOver15Hours ? (
                      <StatusHint className="text-danger">
                        Over maximum · {extendedShiftUsageAfter}/3 extended
                        shifts used
                      </StatusHint>
                    ) : (
                      <StatusHint
                        className={
                          extendedShift
                            ? 'text-warning'
                            : 'text-muted-foreground'
                        }
                      >
                        Extended shifts {extendedShiftUsageAfter}/3 used
                      </StatusHint>
                    )}
                  </div>
                }
                className={shiftOver15Hours ? 'text-danger' : undefined}
              />

              <DetailRow label="Break" value={formatDuration(breakMinutes)} />

              <DetailRow
                label="Working"
                value={formatDuration(workingMinutes)}
              />

              {shiftStatus && (
                <DetailRow
                  label="Status"
                  value={shiftStatus.label}
                  className={shiftStatus.className}
                />
              )}

              {drivingStatus && (
                <DetailRow
                  label="Driving status"
                  value={drivingStatus.label}
                  className={drivingStatus.className}
                />
              )}
            </Section>

            <Section icon={Moon} title="Rest">
              <DetailRow
                label="Rest"
                value={
                  <div className="flex flex-col items-end">
                    <span>{formatDuration(effectiveRestMinutes)}</span>

                    <StatusHint>
                      {isWeeklyRest
                        ? isReducedWeeklyRest
                          ? 'Reduced weekly'
                          : 'Regular weekly'
                        : isReducedDailyRest
                          ? 'Reduced daily'
                          : 'Regular daily'}
                    </StatusHint>
                  </div>
                }
                className={
                  isReducedWeeklyRest || isReducedDailyRest
                    ? 'text-warning'
                    : isRegularWeeklyRest
                      ? 'text-success'
                      : undefined
                }
              />

              {shift.restType === 'daily' && reducedDailyRest && (
                <DetailRow
                  label="Reduced daily rests"
                  value={`${sharedAllowanceUsedAfter}/3 used`}
                  className="text-warning"
                />
              )}

              {restStatus && (
                <DetailRow
                  label="Status"
                  value={restStatus.label}
                  className={restStatus.className}
                />
              )}
            </Section>

            <Section icon={Banknote} title="Earnings">
              <DetailRow
                label="Earn"
                value={formatMoney(shift.earn)}
                className="text-success"
              />
            </Section>

            {compensationReceiver && (
              <Section icon={CheckCircle2} title="Compensation">
                <DetailRow
                  label="Compensation"
                  value={formatDuration(compensationMinutes)}
                  className="text-success"
                />

                <DetailRow
                  label="Original rest"
                  value={formatDuration(restMinutes)}
                />

                <DetailRow
                  label="Effective rest"
                  value={formatDuration(effectiveRestMinutes)}
                />
              </Section>
            )}

            {compensationSource && (
              <Section icon={CheckCircle2} title="Weekly rest compensation">
                <DetailRow
                  label="Status"
                  value="Accepted"
                  className="text-success"
                />

                {acceptedCompensation && (
                  <DetailRow
                    label="Compensation"
                    value={formatDuration(
                      Number(acceptedCompensation.compensation_minutes),
                    )}
                  />
                )}
              </Section>
            )}

            {candidates.length > 0 && (
              <Section icon={BedDouble} title="Available compensation">
                <div className="rounded-md border">
                  {candidates.map((candidate) => (
                    <div
                      key={`${candidate.reducedWeeklyRestShiftId}-${candidate.shiftId}`}
                      className="p-3"
                    >
                      <DetailRow
                        label="Reduced weekly rest"
                        value={formatDuration(
                          candidate.reducedWeeklyRestMinutes,
                        )}
                      />

                      <DetailRow
                        label="Required compensation"
                        value={formatDuration(
                          candidate.requiredCompensationMinutes,
                        )}
                      />

                      <DetailRow
                        label="Deadline"
                        value={formatDate(candidate.deadline)}
                      />

                      <div className="pt-2">
                        {candidate.options.map((option, index) => (
                          <CompensationOption
                            key={`${candidate.shiftId}-${index}`}
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
            )}

            {savedCompensations.length > 0 && (
              <Section icon={CheckCircle2} title="Saved compensation">
                <div className="rounded-md border">
                  {savedCompensations.map((compensation) => {
                    const minutes = Number(
                      compensation.compensation_minutes ?? 0,
                    );
                    const accepted = compensation.decision === 'accepted';
                    const declined = compensation.decision === 'declined';

                    return (
                      <div
                        key={compensation.id}
                        className="border-b p-3 last:border-b-0"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-caption font-medium">
                            {accepted
                              ? 'Accepted'
                              : declined
                                ? 'Declined'
                                : 'Pending'}
                          </span>

                          <span
                            className={
                              accepted
                                ? 'text-xs font-medium text-success'
                                : declined
                                  ? 'text-xs font-medium text-danger'
                                  : 'text-xs font-medium text-warning'
                            }
                          >
                            {formatDuration(minutes)}
                          </span>
                        </div>

                        {compensation.daily_rest_minutes != null && (
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            Daily rest:{' '}
                            {formatDuration(
                              Number(compensation.daily_rest_minutes),
                            )}
                          </div>
                        )}

                        {accepted && onCancelRestCompensation && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="mt-2 h-8"
                            onClick={() =>
                              onCancelRestCompensation(compensation.id)
                            }
                          >
                            Cancel decision
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-row justify-center gap-2 border-t px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>

          <Button type="button" onClick={handleEdit}>
            <Pencil className="size-4" />
            Edit shift
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
