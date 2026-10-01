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

function getCompensationDeadline(dateString: string): string | null {
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

    const effectiveRestMinutes =
        restMinutes - requiredCompensationMinutes;

    if (restType === 'weekly') {
        /*
         * A weekly rest used for compensation must still leave
         * at least 45 hours of weekly rest.
         *
         * Example:
         * 53h 05m - 19h 59m = 33h 06m
         *
         * Therefore this cannot be used as a weekly-rest
         * compensation period.
         */

        if (effectiveRestMinutes >= REGULAR_WEEKLY_REST_MINUTES) {
            return [
                {
                    restType,
                    dailyRestMinutes: effectiveRestMinutes,
                    compensationMinutes: requiredCompensationMinutes,
                    usesReducedDailyRest: false,
                },
            ];
        }

        return [];
    }

    if (restType === 'daily') {
        /*
         * Compensation is taken from the candidate rest period.
         *
         * Example:
         * 53h 05m - 19h 59m = 33h 06m remaining rest.
         *
         * The original Shift.rest value is not changed.
         */

        return [
            {
                restType,
                dailyRestMinutes: effectiveRestMinutes,
                compensationMinutes: requiredCompensationMinutes,
                usesReducedDailyRest:
                    effectiveRestMinutes >= REDUCED_DAILY_REST_MINUTES &&
                    effectiveRestMinutes < REGULAR_DAILY_REST_MINUTES,
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

        /*
         * Only ACCEPTED compensation closes the reduced weekly rest.
         *
         * DECLINED compensation does NOT close it.
         *
         * This means the user can still see:
         *
         * Accept / Decline
         *
         * after previously declining a compensation.
         */
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