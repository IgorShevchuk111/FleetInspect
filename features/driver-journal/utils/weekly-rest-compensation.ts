import type { Shift } from '@/features/driver-journal/types/ driver-journal';

import type { RestCompensation } from '../services/driver-journal';

import { sortShiftsChronologically } from './shifts';

const REGULAR_WEEKLY_REST_MINUTES = 45 * 60;
const MINIMUM_WEEKLY_REST_MINUTES = 24 * 60;

const REGULAR_DAILY_REST_MINUTES = 11 * 60;
const REDUCED_DAILY_REST_MINUTES = 9 * 60;

const COMPENSATION_DEADLINE_WEEKS = 3;

export type WeeklyRestCompensationOption = {
    restType: Shift['restType'];
    dailyRestMinutes: number;
    compensationMinutes: number;
    usesReducedDailyRest: boolean;
};

export type WeeklyRestCompensationCandidate = {
    shiftId: string;
    reducedWeeklyRestShiftId: string;
    reducedWeeklyRestMinutes: number;
    requiredCompensationMinutes: number;
    deadline: string;
    options: WeeklyRestCompensationOption[];
};

function getWeekStart(dateString: string): Date | null {
    const date = new Date(`${dateString}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const day = date.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    date.setDate(date.getDate() + mondayOffset);
    date.setHours(12, 0, 0, 0);

    return date;
}

function formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function getCompensationDeadline(
    dateString: string,
): string | null {
    const weekStart = getWeekStart(dateString);

    if (!weekStart) {
        return null;
    }

    const deadline = new Date(weekStart);

    deadline.setDate(
        deadline.getDate() + COMPENSATION_DEADLINE_WEEKS * 7 + 6,
    );

    return formatDate(deadline);
}

function isReducedWeeklyRest(shift: Shift): boolean {
    const restMinutes = Number(shift.rest) || 0;

    return (
        shift.restType === 'weekly' &&
        restMinutes >= MINIMUM_WEEKLY_REST_MINUTES &&
        restMinutes < REGULAR_WEEKLY_REST_MINUTES
    );
}

function hasAcceptedCompensation(
    reducedWeeklyRestShiftId: string,
    restCompensations: RestCompensation[],
): boolean {
    return restCompensations.some(
        (compensation) =>
            compensation.reduced_weekly_rest_shift_id ===
            reducedWeeklyRestShiftId &&
            compensation.decision === 'accepted',
    );
}

function getCompensationOptions(
    restMinutes: number,
    requiredCompensationMinutes: number,
    restType: Shift['restType'],
): WeeklyRestCompensationOption[] {
    if (restMinutes < MINIMUM_WEEKLY_REST_MINUTES) {
        return [];
    }

    /*
     * Compensation is taken from the candidate rest period.
     *
     * The actual stored rest remains unchanged.
     *
     * Example:
     *
     * 53h actual rest
     * - 20h compensation
     * = 33h effective rest
     *
     * Therefore this period cannot simultaneously be
     * classified as a regular weekly rest.
     */
    const effectiveRestMinutes =
        restMinutes - requiredCompensationMinutes;

    /*
     * A weekly rest used for compensation can only remain
     * a regular weekly rest if enough rest is left after
     * the compensation is allocated.
     */
    if (restType === 'weekly') {
        if (
            effectiveRestMinutes >=
            REGULAR_WEEKLY_REST_MINUTES
        ) {
            return [
                {
                    restType,
                    dailyRestMinutes: restMinutes,
                    compensationMinutes: requiredCompensationMinutes,
                    usesReducedDailyRest: false,
                },
            ];
        }

        /*
         * If compensation leaves less than 45 hours,
         * this weekly rest cannot be treated as a regular
         * weekly rest.
         *
         * We also do not offer it as a reduced weekly rest
         * because the previous weekly rest was already reduced.
         */
        return [];
    }

    /*
     * Daily rest can receive compensation separately.
     *
     * The stored daily rest remains unchanged.
     */
    if (restType === 'daily') {
        return [
            {
                restType,
                dailyRestMinutes: restMinutes,
                compensationMinutes: requiredCompensationMinutes,
                usesReducedDailyRest:
                    restMinutes >= REDUCED_DAILY_REST_MINUTES &&
                    restMinutes < REGULAR_DAILY_REST_MINUTES,
            },
        ];
    }

    return [];
}

export function buildWeeklyRestCompensationCandidates(
    shifts: Shift[],
    restCompensations: RestCompensation[] = [],
): Map<string, WeeklyRestCompensationCandidate[]> {
    const sortedShifts = sortShiftsChronologically(shifts);

    const candidatesByShiftId = new Map<
        string,
        WeeklyRestCompensationCandidate[]
    >();

    for (const reducedRest of sortedShifts) {
        if (!isReducedWeeklyRest(reducedRest)) {
            continue;
        }

        const alreadyAccepted = hasAcceptedCompensation(
            reducedRest.id,
            restCompensations,
        );

        if (alreadyAccepted) {
            continue;
        }

        const reducedRestMinutes =
            Number(reducedRest.rest) || 0;

        const requiredCompensationMinutes =
            REGULAR_WEEKLY_REST_MINUTES - reducedRestMinutes;

        if (requiredCompensationMinutes <= 0) {
            continue;
        }

        const deadline = getCompensationDeadline(
            reducedRest.date,
        );

        if (!deadline) {
            continue;
        }

        const reducedRestTime = new Date(
            `${reducedRest.date}T${reducedRest.start}`,
        ).getTime();

        for (const candidateShift of sortedShifts) {
            if (candidateShift.id === reducedRest.id) {
                continue;
            }

            const candidateTime = new Date(
                `${candidateShift.date}T${candidateShift.start}`,
            ).getTime();

            if (candidateTime <= reducedRestTime) {
                continue;
            }

            if (candidateShift.date > deadline) {
                continue;
            }

            const restMinutes =
                Number(candidateShift.rest) || 0;

            if (restMinutes < requiredCompensationMinutes) {
                continue;
            }

            const options = getCompensationOptions(
                restMinutes,
                requiredCompensationMinutes,
                candidateShift.restType,
            );

            if (options.length === 0) {
                continue;
            }

            const candidate: WeeklyRestCompensationCandidate = {
                shiftId: candidateShift.id,
                reducedWeeklyRestShiftId: reducedRest.id,
                reducedWeeklyRestMinutes: reducedRestMinutes,
                requiredCompensationMinutes,
                deadline,
                options,
            };

            const existing =
                candidatesByShiftId.get(candidateShift.id) ?? [];

            existing.push(candidate);

            candidatesByShiftId.set(
                candidateShift.id,
                existing,
            );
        }
    }

    return candidatesByShiftId;
}