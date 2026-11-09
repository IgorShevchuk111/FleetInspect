'use client';

import { useMemo, useState, useEffect } from 'react';

import { createBreakAction } from '@/features/driver-journal/actions/create-break';
import { deleteBreakAction } from '@/features/driver-journal/actions/delete-break';
import { createShiftAction } from '@/features/driver-journal/actions/create-shift';
import { endShiftAction } from '@/features/driver-journal/actions/end-shift';
import { updateShiftTotalsAction } from '../../actions/update-shift-totals';

import { calculateWeeklySummary } from '@/features/driver-journal/utils/weekly-summary';
import { mapTachographShifts } from '@/features/driver-journal/utils/map-tachograph-data';
import {
  getFixedWeekKey,
  buildSharedAllowanceUsage,
  buildExtendedDrivingUsage,
} from '@/features/driver-journal/utils/compliance-usage';
import { sortShiftsChronologically } from '@/features/driver-journal/utils/shifts';

import {
  formatHoursMinutes,
  formatTimer,
} from '@/features/driver-journal/utils/duration';

import {
  formatDateTime,
  parseDateTime,
} from '@/features/driver-journal/utils/dates';

import { useTachographTimer } from '@/features/driver-journal/hooks/use-tachograph-timer';

import { BreakDialog } from '@/features/driver-journal/components/tachograph/break-dialog';
import { DailyDrivingDialog } from '@/features/driver-journal/components/tachograph/daily-driving-dialog';
import { TimeDialog } from '@/features/driver-journal/components/tachograph/time-dialog';
import type { RestOptions } from '@/features/driver-journal/components/tachograph/rest-form';

import { LimitCard } from '@/features/driver-journal/components/limit-card';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { useTranslations } from '@/features/driver-journal/i18n/use-translations';

import type { Database } from '@/types/supabase/database';
import type { ActiveShift } from '@/features/driver-journal/types/tachograph';

import { toast } from 'sonner';

type Mode = 'start' | 'rest';

type DriverJournalShiftRow =
  Database['public']['Tables']['driver_journal_shifts']['Row'];

type RestCompensationRow =
  Database['public']['Tables']['driver_journal_rest_compensations']['Row'];

type DriverJournalBreakRow =
  Database['public']['Tables']['driver_journal_breaks']['Row'];

type TachographClientProps = {
  initialShift: ActiveShift | null;
  initialError: string | null;
  initialShifts: DriverJournalShiftRow[];
  initialRestCompensations: RestCompensationRow[];
  initialBreaks: DriverJournalBreakRow[];
};

function calculateBreakMinutes(breaks: DriverJournalBreakRow[]) {
  return breaks.reduce(
    (total, item) =>
      total +
      Math.floor(
        (new Date(item.end_at).getTime() - new Date(item.start_at).getTime()) /
          60000,
      ),
    0,
  );
}

export default function TachographClient({
  initialShift,
  initialError,
  initialShifts,
  initialRestCompensations,
  initialBreaks,
}: TachographClientProps) {
  const {
    activeShift,
    elapsedSeconds,
    restElapsedSeconds,
    startTimer,
    startRestTimer,
    isRunning,
    isResting,
  } = useTachographTimer(initialShift, initialError);

  const { language, t } = useTranslations();

  const locale = language === 'uk' ? 'uk-UA' : 'en-GB';

  const [shiftRows, setShiftRows] = useState(initialShifts);

  const shifts = useMemo(() => mapTachographShifts(shiftRows), [shiftRows]);

  const chronologicalShifts = useMemo(
    () => sortShiftsChronologically(shifts),
    [shifts],
  );

  const weeklySummary = useMemo(
    () => calculateWeeklySummary(shifts, new Date(), initialRestCompensations),
    [shifts, initialRestCompensations],
  );

  const selectedShiftId =
    activeShift?.id ?? chronologicalShifts.at(-1)?.id ?? null;

  const [breaks, setBreaks] = useState(initialBreaks);

  const [isBreakDialogOpen, setIsBreakDialogOpen] = useState(false);
  const [isBreakPending, setIsBreakPending] = useState(false);

  const [isWorkingDayDialogOpen, setIsWorkingDayDialogOpen] = useState(false);
  const [isDailyRestDialogOpen, setIsDailyRestDialogOpen] = useState(false);
  const [isWeeklyRestDialogOpen, setIsWeeklyRestDialogOpen] = useState(false);

  const selectedShiftBreaks = useMemo(
    () =>
      breaks
        .filter((item) => item.shift_id === selectedShiftId)
        .sort(
          (a, b) =>
            new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
        ),
    [breaks, selectedShiftId],
  );

  const breakMinutes = isResting
    ? 0
    : selectedShiftBreaks.reduce(
        (total, item) =>
          total +
          Math.floor(
            (new Date(item.end_at).getTime() -
              new Date(item.start_at).getTime()) /
              60000,
          ),
        0,
      );

  const sharedAllowanceUsage = useMemo(
    () => buildSharedAllowanceUsage(shifts, initialRestCompensations),
    [shifts, initialRestCompensations],
  );

  const extendedDrivingUsage = useMemo(
    () => buildExtendedDrivingUsage(shifts),
    [shifts],
  );

  // Shared allowance: maximum 3 uses.
  const latestShiftId = chronologicalShifts.at(-1)?.id;

  const sharedAllowanceRemaining = Math.max(
    0,
    3 - (latestShiftId ? (sharedAllowanceUsage.get(latestShiftId) ?? 0) : 0),
  );

  // Extended daily driving: maximum 2 days per Monday–Sunday week.
  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  const currentWeekKey = getFixedWeekKey(todayString);

  const latestCurrentWeekShift = chronologicalShifts
    .filter((shift) => getFixedWeekKey(shift.date) === currentWeekKey)
    .at(-1);

  const extendedDrivingRemaining = Math.max(
    0,
    2 -
      (latestCurrentWeekShift
        ? (extendedDrivingUsage.get(latestCurrentWeekShift.id) ?? 0)
        : 0),
  );

  const [activeMode, setActiveMode] = useState<Mode>(
    initialShift && initialShift.end === null ? 'start' : 'rest',
  );

  const [activeDialog, setActiveDialog] = useState<'work' | 'rest' | null>(
    null,
  );

  // Manually entered daily driving time, in minutes.
  const [dailyDrivingMinutes, setDailyDrivingMinutes] = useState(
    initialShifts.find((shift) => shift.id === selectedShiftId)?.driving ?? 0,
  );

  useEffect(() => {
    const shift = shiftRows.find((item) => item.id === selectedShiftId);

    setDailyDrivingMinutes(shift?.driving ?? 0);
  }, [shiftRows, selectedShiftId]);

  const [isDailyDrivingDialogOpen, setIsDailyDrivingDialogOpen] =
    useState(false);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  const remaining13Hours = formatHoursMinutes(
    Math.max(0, 13 * 60 - elapsedMinutes),
  );

  const remaining15Hours = formatHoursMinutes(
    Math.max(0, 15 * 60 - elapsedMinutes),
  );

  // Working day milestones from the actual shift start.
  const workingDayTimes = useMemo(() => {
    if (!activeShift?.date || !activeShift?.start) {
      return null;
    }

    const shiftStart = parseDateTime(activeShift.date, activeShift.start);

    if (Number.isNaN(shiftStart.getTime())) {
      return null;
    }

    return {
      start: shiftStart,
      thirteenHours: new Date(shiftStart.getTime() + 13 * 60 * 60 * 1000),
      fifteenHours: new Date(shiftStart.getTime() + 15 * 60 * 60 * 1000),
    };
  }, [activeShift?.date, activeShift?.start]);

  // Daily and weekly rest milestones from the actual rest start.
  const restTimes = useMemo(() => {
    if (!activeShift?.end_date || !activeShift?.end) {
      return null;
    }

    const restStart = parseDateTime(activeShift.end_date, activeShift.end);

    if (Number.isNaN(restStart.getTime())) {
      return null;
    }

    return {
      start: restStart,
      nineHours: new Date(restStart.getTime() + 9 * 60 * 60 * 1000),
      elevenHours: new Date(restStart.getTime() + 11 * 60 * 60 * 1000),
      twentyFourHours: new Date(restStart.getTime() + 24 * 60 * 60 * 1000),
      fortyFiveHours: new Date(restStart.getTime() + 45 * 60 * 60 * 1000),
    };
  }, [activeShift?.end_date, activeShift?.end]);

  const modes: { id: Mode; label: string }[] = [
    { id: 'start', label: t('tachographWork') },
    { id: 'rest', label: t('tachographRest') },
  ];

  const handleAddBreak = async (
    startAt: string,
    endAt: string,
  ): Promise<boolean> => {
    if (!selectedShiftId) {
      toast.error('No shift available for this break.');
      return false;
    }

    setIsBreakPending(true);

    try {
      const result = await createBreakAction(selectedShiftId, startAt, endAt);

      if (result.success === false) {
        toast.error(result.error);
        return false;
      }

      const nextBreaks = [...breaks, result.break];

      setBreaks(nextBreaks);

      const totalsResult = await updateShiftTotalsAction(
        selectedShiftId,
        dailyDrivingMinutes,
        calculateBreakMinutes(
          nextBreaks.filter((item) => item.shift_id === selectedShiftId),
        ),
      );

      if (totalsResult.success === false) {
        toast.error(
          'Break was saved, but the break total could not be updated.',
        );
        return true;
      }

      toast.success('Break saved successfully');

      return true;
    } catch {
      toast.error('Could not save the break. Please try again.');
      return false;
    } finally {
      setIsBreakPending(false);
    }
  };

  const handleDeleteBreak = async (breakId: string): Promise<void> => {
    if (!selectedShiftId) return;

    setIsBreakPending(true);

    try {
      const result = await deleteBreakAction(breakId);

      if (result.success === false) {
        toast.error(result.error);
        return;
      }

      const nextBreaks = breaks.filter((item) => item.id !== breakId);

      setBreaks(nextBreaks);

      const totalsResult = await updateShiftTotalsAction(
        selectedShiftId,
        dailyDrivingMinutes,
        calculateBreakMinutes(
          nextBreaks.filter((item) => item.shift_id === selectedShiftId),
        ),
      );

      if (totalsResult.success === false) {
        toast.error(
          'Break was deleted, but the break total could not be updated.',
        );
        return;
      }

      toast.success('Break deleted');
    } catch {
      toast.error('Could not delete the break. Please try again.');
    } finally {
      setIsBreakPending(false);
    }
  };

  const handleConfirm = async (
    date: string,
    time: string,
    restOptions?: RestOptions,
  ): Promise<boolean> => {
    if (activeDialog === 'work') {
      try {
        const result = await createShiftAction(date, time);

        if (result.success === false) {
          toast.error(result.error);
          return false;
        }

        startTimer(result.shift);
        setActiveMode('start');

        toast.success('Shift started successfully');

        return true;
      } catch {
        toast.error('Could not start the shift. Please try again.');
        return false;
      }
    }

    if (activeDialog === 'rest') {
      if (!restOptions) {
        toast.error('Please select a rest type.');
        return false;
      }

      try {
        const result = await endShiftAction(date, time, restOptions.restType);

        if (result.success === false) {
          toast.error(result.error);
          return false;
        }

        startRestTimer(result.shift);
        setActiveMode('rest');

        // Reset current daily counters.
        // Historical records remain in Supabase.
        setDailyDrivingMinutes(0);

        toast.success('Rest started successfully');

        return true;
      } catch {
        toast.error('Could not start rest. Please try again.');
        return false;
      }
    }

    return false;
  };

  const handleSaveDriving = async (minutes: number): Promise<boolean> => {
    if (!selectedShiftId) {
      toast.error('No shift available.');
      return false;
    }

    const newTotal = dailyDrivingMinutes + minutes;

    if (newTotal > 24 * 60) {
      toast.error('Total driving time cannot exceed 24 hours.');
      return false;
    }

    try {
      const result = await updateShiftTotalsAction(
        selectedShiftId,
        newTotal,
        calculateBreakMinutes(selectedShiftBreaks),
      );

      if (result.success === false) {
        toast.error(result.error);
        return false;
      }

      setDailyDrivingMinutes(newTotal);

      setShiftRows((currentRows) =>
        currentRows.map((shift) =>
          shift.id === selectedShiftId
            ? { ...shift, driving: newTotal }
            : shift,
        ),
      );

      toast.success('Driving time added successfully');

      return true;
    } catch {
      toast.error('Could not save driving time.');
      return false;
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl">
        <ToggleGroup
          type="single"
          value={activeMode}
          onValueChange={(value) => {
            if (!value || value === activeMode) return;

            setActiveDialog(value === 'start' ? 'work' : 'rest');
          }}
          className="h-auto w-full rounded-none border-b-2 border-border bg-card px-2 py-3 sm:py-4"
        >
          {modes.map(({ id, label }) => (
            <ToggleGroupItem
              key={id}
              value={id}
              aria-label={label}
              onClick={() => {
                if (id === activeMode) return;

                setActiveDialog(id === 'start' ? 'work' : 'rest');
              }}
              className="min-h-12 flex-1 text-base font-medium sm:text-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90"
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <section className="space-y-3 p-2 sm:p-4">
          <LimitCard
            title={t('workingDay')}
            count={sharedAllowanceRemaining}
            current={formatTimer(elapsedSeconds)}
            limits={[
              {
                value: '13',
                remaining: isRunning ? remaining13Hours : '13:00',
                warningAt: Math.round((13 / 15) * 100),
              },
              {
                value: '15',
                remaining: isRunning ? remaining15Hours : '15:00',
                dangerAt: 100,
              },
            ]}
            active={isRunning}
            progress={
              isRunning
                ? Math.min(100, (elapsedSeconds / (15 * 3600)) * 100)
                : 0
            }
            warningAt={Math.round((13 / 15) * 100)}
            progressMode="working-day"
            onClick={() => setIsWorkingDayDialogOpen(true)}
          />

          <LimitCard
            title={t('dailyDriving')}
            count={extendedDrivingRemaining}
            current={formatHoursMinutes(dailyDrivingMinutes)}
            limits={[
              {
                value: '9',
                remaining:
                  dailyDrivingMinutes >= 9 * 60
                    ? '9:00'
                    : formatHoursMinutes(9 * 60 - dailyDrivingMinutes),
                warningAt: 90,
              },
              {
                value: '10',
                remaining:
                  dailyDrivingMinutes >= 10 * 60
                    ? '10:00'
                    : formatHoursMinutes(10 * 60 - dailyDrivingMinutes),
                dangerAt: 100,
              },
            ]}
            active={dailyDrivingMinutes > 0}
            progress={Math.min(100, (dailyDrivingMinutes / (10 * 60)) * 100)}
            warningAt={90}
            progressMode="daily-driving"
            onClick={() => setIsDailyDrivingDialogOpen(true)}
          />

          <LimitCard
            title={t('breakTime')}
            current={formatHoursMinutes(breakMinutes)}
            limits={[
              {
                value: '0:15',
                remaining: formatHoursMinutes(Math.max(0, 15 - breakMinutes)),
                warningAt: 100 / 3,
              },
              {
                value: '0:45',
                remaining: formatHoursMinutes(Math.max(0, 45 - breakMinutes)),
                successAt: 100,
              },
            ]}
            active={breakMinutes > 0}
            progress={Math.min(100, (breakMinutes / 45) * 100)}
            warningAt={100 / 3}
            successAt={100}
            onClick={() => setIsBreakDialogOpen(true)}
          />

          <LimitCard
            title={t('dailyRest')}
            count={sharedAllowanceRemaining}
            current={
              isResting && activeShift?.rest_type === 'daily'
                ? formatTimer(restElapsedSeconds)
                : '0:00'
            }
            limits={[
              {
                value: '9',
                warningAt: Math.round((9 / 11) * 100),
                remaining:
                  isResting && activeShift?.rest_type === 'daily'
                    ? formatHoursMinutes(
                        Math.max(
                          0,
                          9 * 60 - Math.floor(restElapsedSeconds / 60),
                        ),
                      )
                    : '9:00',
              },
              {
                value: '11',
                successAt: 100,
                remaining:
                  isResting && activeShift?.rest_type === 'daily'
                    ? formatHoursMinutes(
                        Math.max(
                          0,
                          11 * 60 - Math.floor(restElapsedSeconds / 60),
                        ),
                      )
                    : '11:00',
              },
            ]}
            active={isResting && activeShift?.rest_type === 'daily'}
            progress={
              isResting && activeShift?.rest_type === 'daily'
                ? Math.min(100, (restElapsedSeconds / (11 * 3600)) * 100)
                : 0
            }
            warningAt={Math.round((9 / 11) * 100)}
            successAt={100}
            onClick={() => setIsDailyRestDialogOpen(true)}
          />

          <LimitCard
            title={t('weeklyRest')}
            current={
              isResting && activeShift?.rest_type === 'weekly'
                ? formatTimer(restElapsedSeconds)
                : '0:00'
            }
            limits={[
              {
                value: '24',
                warningAt: Math.round((24 / 45) * 100),
                remaining:
                  isResting && activeShift?.rest_type === 'weekly'
                    ? formatHoursMinutes(
                        Math.max(
                          0,
                          24 * 60 - Math.floor(restElapsedSeconds / 60),
                        ),
                      )
                    : '24:00',
              },
              {
                value: '45',
                successAt: 100,
                remaining:
                  isResting && activeShift?.rest_type === 'weekly'
                    ? formatHoursMinutes(
                        Math.max(
                          0,
                          45 * 60 - Math.floor(restElapsedSeconds / 60),
                        ),
                      )
                    : '45:00',
              },
            ]}
            active={isResting && activeShift?.rest_type === 'weekly'}
            progress={
              isResting && activeShift?.rest_type === 'weekly'
                ? Math.min(100, (restElapsedSeconds / (45 * 3600)) * 100)
                : 0
            }
            warningAt={Math.round((24 / 45) * 100)}
            successAt={100}
            onClick={() => setIsWeeklyRestDialogOpen(true)}
          />

          <LimitCard
            title={t('weeklyDriving')}
            current={formatHoursMinutes(weeklySummary.driving)}
            limits={[
              {
                value: '56',
                remaining: formatHoursMinutes(
                  weeklySummary.weeklyDrivingRemaining,
                ),
              },
            ]}
            active={weeklySummary.driving > 0}
            progress={Math.min(100, (weeklySummary.driving / (56 * 60)) * 100)}
            warningAt={90}
            progressMode="daily-driving"
          />

          <LimitCard
            title={t('twoWeekDriving')}
            current={formatHoursMinutes(weeklySummary.twoWeekDriving)}
            limits={[
              {
                value: '90',
                remaining: formatHoursMinutes(
                  weeklySummary.twoWeekDrivingRemaining,
                ),
              },
            ]}
            active={weeklySummary.twoWeekDriving > 0}
            progress={Math.min(
              100,
              (weeklySummary.twoWeekDriving / (90 * 60)) * 100,
            )}
            warningAt={90}
            progressMode="daily-driving"
          />

          <LimitCard
            title={t('workingWeek')}
            current={formatHoursMinutes(weeklySummary.working)}
            limits={[
              {
                value: '60',
                remaining: formatHoursMinutes(
                  Math.max(0, 60 * 60 - weeklySummary.working),
                ),
              },
            ]}
            active={weeklySummary.working > 0}
            progress={Math.min(100, (weeklySummary.working / (60 * 60)) * 100)}
            warningAt={90}
            progressMode="working-day"
          />

          <LimitCard
            title={t('averageWorkingTime')}
            current={formatHoursMinutes(weeklySummary.average17WeekWorking)}
            limits={[
              {
                value: '48',
                remaining: formatHoursMinutes(
                  Math.max(0, 48 * 60 - weeklySummary.average17WeekWorking),
                ),
              },
            ]}
            active={weeklySummary.average17WeekWorking > 0}
            progress={Math.min(
              100,
              (weeklySummary.average17WeekWorking / (48 * 60)) * 100,
            )}
            warningAt={90}
            progressMode="working-day"
          />
        </section>
      </div>

      {/* Working day dialog */}
      <Dialog
        open={isWorkingDayDialogOpen}
        onOpenChange={setIsWorkingDayDialogOpen}
      >
        <DialogContent className="z-[100] flex h-full w-full max-w-none flex-col justify-start rounded-none">
          {isResting ? (
            <DialogHeader>
              <DialogTitle>On rest</DialogTitle>
              <DialogDescription>You are currently on rest.</DialogDescription>
            </DialogHeader>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{t('workingDay')}</DialogTitle>
                <DialogDescription>
                  Shift start and working day time limits.
                </DialogDescription>
              </DialogHeader>

              {workingDayTimes ? (
                <div className="space-y-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">
                      Shift started
                    </p>
                    <p className="font-semibold">
                      {formatDateTime(workingDayTimes.start, locale)}
                    </p>
                  </div>

                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">
                      13 hours reached
                    </p>
                    <p className="font-semibold">
                      {formatDateTime(workingDayTimes.thirteenHours, locale)}
                    </p>
                  </div>

                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">
                      15 hours reached
                    </p>
                    <p className="font-semibold">
                      {formatDateTime(workingDayTimes.fifteenHours, locale)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No shift start time available.
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Daily rest dialog */}
      <Dialog
        open={isDailyRestDialogOpen}
        onOpenChange={setIsDailyRestDialogOpen}
      >
        <DialogContent className="z-[100] flex h-full w-full max-w-none flex-col justify-start gap-4 rounded-none">
          <DialogHeader>
            <DialogTitle>Daily rest</DialogTitle>
            <DialogDescription>
              Daily rest start and time milestones.
            </DialogDescription>
          </DialogHeader>

          {!isResting ? (
            <p className="text-sm text-muted-foreground">You are working.</p>
          ) : activeShift?.rest_type !== 'daily' ? (
            <p className="text-sm text-muted-foreground">
              You are currently on weekly rest.
            </p>
          ) : restTimes ? (
            <div className="space-y-3">
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Rest started</p>
                <p className="font-semibold">
                  {formatDateTime(restTimes.start, locale)}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">9 hours reached</p>
                <p className="font-semibold">
                  {formatDateTime(restTimes.nineHours, locale)}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">
                  11 hours reached
                </p>
                <p className="font-semibold">
                  {formatDateTime(restTimes.elevenHours, locale)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No rest start time available.
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Weekly rest dialog */}
      <Dialog
        open={isWeeklyRestDialogOpen}
        onOpenChange={setIsWeeklyRestDialogOpen}
      >
        <DialogContent className="z-[100] flex h-full w-full max-w-none flex-col justify-start gap-4 rounded-none">
          <DialogHeader>
            <DialogTitle>Weekly rest</DialogTitle>
            <DialogDescription>
              Weekly rest start and time milestones.
            </DialogDescription>
          </DialogHeader>

          {!isResting ? (
            <p className="text-sm text-muted-foreground">You are working.</p>
          ) : activeShift?.rest_type !== 'weekly' ? (
            <p className="text-sm text-muted-foreground">
              You are currently on daily rest.
            </p>
          ) : restTimes ? (
            <div className="space-y-3">
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Rest started</p>
                <p className="font-semibold">
                  {formatDateTime(restTimes.start, locale)}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">
                  24 hours reached
                </p>
                <p className="font-semibold">
                  {formatDateTime(restTimes.twentyFourHours, locale)}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">
                  45 hours reached
                </p>
                <p className="font-semibold">
                  {formatDateTime(restTimes.fortyFiveHours, locale)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No rest start time available.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <TimeDialog
        mode={activeDialog ?? 'work'}
        open={activeDialog !== null}
        onOpenChange={(open) => {
          if (!open) setActiveDialog(null);
        }}
        onConfirm={handleConfirm}
      />

      <DailyDrivingDialog
        open={isDailyDrivingDialogOpen}
        onOpenChange={setIsDailyDrivingDialogOpen}
        initialMinutes={dailyDrivingMinutes}
        onSave={handleSaveDriving}
      />

      <BreakDialog
        open={isBreakDialogOpen}
        onOpenChange={setIsBreakDialogOpen}
        breaks={selectedShiftBreaks}
        disabled={!selectedShiftId || isBreakPending}
        onAdd={handleAddBreak}
        onDelete={handleDeleteBreak}
      />
    </main>
  );
}
