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
import { useTranslations } from '@/features/driver-journal/i18n/use-translations';
import type { RestCompensation } from '@/features/driver-journal/services/driver-journal';
import type { Shift } from '@/features/driver-journal/types/driver-journal';
import { formatDuration } from '@/features/driver-journal/utils/duration';
import { getShiftDetailsData } from '@/features/driver-journal/utils/shift-details';
import {
  getDrivingStatus,
  getMaxShiftEndDateTime,
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
  followingRestUsesAllowance?: boolean;
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
    <div className="flex min-h-10 items-center justify-between gap-3 border-b border-border/50 py-2 last:border-b-0">
      <span className="text-bodys leading-body">{label}</span>

      <div
        className={`text-right text-body leading-body text-foreground ${className ?? ''}`}
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
    <section className="space-y-2 border-t border-border pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" />

        <h3 className="text-heading font-semibold leading-heading text-muted-foreground">
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
  return (
    <span className={`text-small leading-body ${className}`}>{children}</span>
  );
}

function CompensationOption({
  option,
  onAccept,
}: {
  option: WeeklyRestCompensationCandidate['options'][number];
  onAccept?: () => void;
}) {
  const { t } = useTranslations();

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border py-3 first:border-t-0">
      <div className="min-w-0">
        <div className="text-caption font-medium">
          {option.restType === 'weekly' ? t('weeklyRest') : t('dailyRest')}
        </div>

        <div className="text-caption leading-body text-muted-foreground">
          {formatDuration(option.dailyRestMinutes)} {t('rest')} ·{' '}
          {formatDuration(option.compensationMinutes)} {t('compensation')}
        </div>

        {option.usesReducedDailyRest && (
          <StatusHint className="text-warning">
            {t('usesReducedDailyRest')}
          </StatusHint>
        )}
      </div>

      {onAccept && (
        <Button
          type="button"
          size="sm"
          className="min-h-9 shrink-0"
          onClick={onAccept}
        >
          {t('accept')}
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
  followingRestUsesAllowance = false,
  extendedShift = false,
  weeklyRestCompensationCandidates = [],
  restCompensations = [],
  onEdit,
  onAcceptRestCompensation,
  onCancelRestCompensation,
}: ShiftDetailsDialogProps) {
  const { t } = useTranslations();

  const details = getShiftDetailsData(shift, {
    drivingUsageAfter,
    sharedAllowanceUsedAfter,
    extendedShift,
    followingRestUsesAllowance,
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
    drivingMaximumMinutes,
    shiftMaximumMinutes,
    sharedAllowanceUsedBefore,
    compensationReceiver,
    compensationSource,
    candidates,
    savedCompensations,
  } = details;

  const maximumEnd = getMaxShiftEndDateTime(
    shift.date,
    shift.start,
    shiftMaximumMinutes,
  );

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
        <DialogHeader className="shrink-0 border-b border-border px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Clock3 className="size-4 text-primary" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="font-semibold leading-heading text-foreground text-title">
                {t('shiftDetails')}
              </DialogTitle>

              <DialogDescription className="text-small leading-body">
                {formatDate(shift.date)} {formatTime(shift.start)}
                {' → '}
                {formatDate(endDate)} {formatTime(shift.end)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-5 px-4 py-5 sm:px-6">
            <Section icon={CalendarDays} title={t('shiftTimes')}>
              <DetailRow
                label={t('start')}
                value={`${formatDate(shift.date)} ${formatTime(shift.start)}`}
              />

              <DetailRow
                label={t('end')}
                value={
                  <div className="flex flex-col items-end">
                    <span>
                      {formatDate(endDate)} {formatTime(shift.end)}
                    </span>

                    {maximumEnd && (
                      <StatusHint>
                        {t('maximumEnd')}: {formatDate(maximumEnd.date)}{' '}
                        {formatTime(maximumEnd.time)}
                      </StatusHint>
                    )}
                  </div>
                }
              />
            </Section>

            <Section icon={Gauge} title={t('drivingAndShift')}>
              <DetailRow
                label={t('driving')}
                value={
                  <div className="flex flex-col items-end">
                    <span>
                      {formatDuration(drivingMinutes)} /{' '}
                      {formatDuration(drivingMaximumMinutes)}
                    </span>

                    {drivingOver10Hours ? (
                      <StatusHint className="text-danger">
                        {t('overMaximum')} · {drivingUsageAfter}/2{' '}
                        {t('extendedDaysUsed')}
                      </StatusHint>
                    ) : (
                      <StatusHint
                        className={
                          drivingOver9Hours
                            ? 'text-warning'
                            : 'text-muted-foreground'
                        }
                      >
                        {t('extendedDays')} {drivingUsageAfter}/2 {t('used')}
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
                label={t('shift')}
                value={
                  <div className="flex flex-col items-end">
                    <span>
                      {formatDuration(shiftMinutes)} /{' '}
                      {formatDuration(shiftMaximumMinutes)}
                    </span>

                    {shiftOver15Hours ? (
                      <StatusHint className="text-danger">
                        {t('overMaximum')} · {sharedAllowanceUsedAfter}/3{' '}
                        {t('sharedUses')}
                      </StatusHint>
                    ) : (
                      <StatusHint
                        className={
                          extendedShift
                            ? 'text-warning'
                            : 'text-muted-foreground'
                        }
                      >
                        {t('sharedAllowance')} {sharedAllowanceUsedAfter}/3{' '}
                        {t('used')}
                      </StatusHint>
                    )}
                  </div>
                }
                className={shiftOver15Hours ? 'text-danger' : undefined}
              />

              <DetailRow
                label={t('break')}
                value={formatDuration(breakMinutes)}
              />

              <DetailRow
                label={t('working')}
                value={formatDuration(workingMinutes)}
              />

              {drivingStatus && (
                <DetailRow
                  label={t('drivingStatus')}
                  value={drivingStatus.label}
                  className={drivingStatus.className}
                />
              )}
            </Section>

            <Section icon={Moon} title={t('rest')}>
              <DetailRow
                label={t('rest')}
                value={
                  <div className="flex flex-col items-end">
                    <span>{formatDuration(effectiveRestMinutes)}</span>

                    <StatusHint>
                      {isWeeklyRest
                        ? isReducedWeeklyRest
                          ? t('reducedWeekly')
                          : t('regularWeekly')
                        : isReducedDailyRest
                          ? t('reducedDaily')
                          : t('regularDaily')}
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
            </Section>

            <Section icon={Banknote} title={t('earnings')}>
              <DetailRow
                label={t('earn')}
                value={formatMoney(shift.earn)}
                className="text-success"
              />
            </Section>

            {compensationReceiver && (
              <Section icon={CheckCircle2} title={t('compensation')}>
                <DetailRow
                  label={t('compensation')}
                  value={formatDuration(compensationMinutes)}
                  className="text-success"
                />

                <DetailRow
                  label={t('originalRest')}
                  value={formatDuration(restMinutes)}
                />

                <DetailRow
                  label={t('effectiveRest')}
                  value={formatDuration(effectiveRestMinutes)}
                />
              </Section>
            )}

            {compensationSource && (
              <Section icon={CheckCircle2} title={t('weeklyRestCompensation')}>
                <DetailRow
                  label={t('status')}
                  value={t('accepted')}
                  className="text-success"
                />

                {acceptedCompensation && (
                  <DetailRow
                    label={t('compensation')}
                    value={formatDuration(
                      Number(acceptedCompensation.compensation_minutes),
                    )}
                  />
                )}
              </Section>
            )}

            {candidates.length > 0 && (
              <Section icon={BedDouble} title={t('availableCompensation')}>
                <div className="rounded-md border border-border">
                  {candidates.map((candidate) => (
                    <div
                      key={`${candidate.reducedWeeklyRestShiftId}-${candidate.shiftId}`}
                      className="p-3"
                    >
                      <DetailRow
                        label={t('reducedWeeklyRest')}
                        value={formatDuration(
                          candidate.reducedWeeklyRestMinutes,
                        )}
                      />

                      <DetailRow
                        label={t('requiredCompensation')}
                        value={formatDuration(
                          candidate.requiredCompensationMinutes,
                        )}
                      />

                      <DetailRow
                        label={t('deadline')}
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
              <Section icon={CheckCircle2} title={t('savedCompensation')}>
                <div className="rounded-md border border-border">
                  {savedCompensations.map((compensation) => {
                    const minutes = Number(
                      compensation.compensation_minutes ?? 0,
                    );
                    const accepted = compensation.decision === 'accepted';
                    const declined = compensation.decision === 'declined';

                    return (
                      <div
                        key={compensation.id}
                        className="border-b border-border p-3 last:border-b-0"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-caption font-medium">
                            {accepted
                              ? t('accepted')
                              : declined
                                ? t('declined')
                                : t('pending')}
                          </span>

                          <span
                            className={
                              accepted
                                ? 'text-caption font-medium text-success'
                                : declined
                                  ? 'text-caption font-medium text-danger'
                                  : 'text-caption font-medium text-warning'
                            }
                          >
                            {formatDuration(minutes)}
                          </span>
                        </div>

                        {compensation.daily_rest_minutes != null && (
                          <div className="mt-1 text-caption leading-body text-muted-foreground">
                            {t('dailyRest')}:{' '}
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
                            className="mt-2 min-h-9"
                            onClick={() =>
                              onCancelRestCompensation(compensation.id)
                            }
                          >
                            {t('cancelDecision')}
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

        <DialogFooter className="shrink-0 flex-row justify-center gap-2 border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-3">
          <Button
            type="button"
            variant="outline"
            className="min-h-10"
            onClick={() => onOpenChange(false)}
          >
            {t('close')}
          </Button>

          <Button type="button" className="min-h-10" onClick={handleEdit}>
            <Pencil className="size-4" />
            {t('editShift')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
