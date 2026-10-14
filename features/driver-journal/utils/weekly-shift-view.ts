
import type { Shift } from '@/features/driver-journal/types/driver-journal';
import type { RestCompensation } from '../services/driver-journal';

import {
    buildExtendedDrivingUsage,
    buildSharedAllowanceUsage,
    normalizeDrivingMinutes,
    usesReducedDailyRestAllowance,
} from './compliance-usage';

import { buildWeeklyRestCompensationCandidates } from './weekly-rest-compensation';

import {
    getDrivingStatus,
    getRestStatus,
    getShiftStatus,
    hasExtendedShift,
    isReducedDailyRest,
} from '@/features/driver-journal/utils/shift-status';

import {
    calculateShiftMinutes,
    sortShiftsChronologically,
} from './shifts';

type CompensationCandidates = ReturnType<
    typeof buildWeeklyRestCompensationCandidates
>;

export type WeeklyShiftRowData = {
    shift: Shift;
    startsAfterWeeklyRest: boolean;
    drivingStatus: ReturnType<typeof getDrivingStatus>;
    shiftStatus: ReturnType<typeof getShiftStatus>;
    restStatus: ReturnType<typeof getRestStatus>;
    drivingUsageAfter: number;
    sharedAllowanceUsedAfter: number;
    reducedDailyRest: boolean;
    extendedShift: boolean;
    followingRestUsesAllowance: boolean;
    weeklyRestCompensationCandidates:
    CompensationCandidates extends Map<string, infer Candidate>
    ? Candidate
    : never;
    restCompensations: RestCompensation[];
};

export function prepareWeeklyShiftRows(
    shifts: Shift[],
    allShifts: Shift[],
    restCompensations: RestCompensation[],
): WeeklyShiftRowData[] {
    const chronologicalShifts = sortShiftsChronologically(allShifts);
    const firstHistoricalShiftId = chronologicalShifts[0]?.id;
    const nextShiftById = new Map<string, Shift>();

    chronologicalShifts.forEach((shift, index) => {
        const nextShift = chronologicalShifts[index + 1];

        if (nextShift) {
            nextShiftById.set(shift.id, nextShift);
        }
    });

    const sharedAllowanceUsage = buildSharedAllowanceUsage(
        allShifts,
        restCompensations,
    );

    // Extended driving remains a separate Monday–Sunday counter.
    const extendedDrivingUsage = buildExtendedDrivingUsage(allShifts);

    const weeklyRestCompensationCandidates =
        buildWeeklyRestCompensationCandidates(
            allShifts,
            restCompensations,
        );

    return [...shifts]
        .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.start}`).getTime();
            const dateB = new Date(`${b.date}T${b.start}`).getTime();

            return dateB - dateA;
        })
        .map((shift) => {
            const shiftMinutes = calculateShiftMinutes(
                shift.date,
                shift.start,
                shift.endDate || shift.date,
                shift.end,
            );

            const sharedAllowanceUsedAfter =
                sharedAllowanceUsage.get(shift.id) ?? 0;

            const baseReducedDailyRest = isReducedDailyRest(shift);
            const extendedShift = hasExtendedShift(shift);

            const acceptedCompensationForShift = restCompensations.find(
                (compensation) =>
                    compensation.compensation_shift_id === shift.id &&
                    compensation.decision === 'accepted',
            );

            const effectiveRestMinutes =
                shift.restType === 'daily'
                    ? Math.max(
                        0,
                        Number(shift.rest) -
                        Number(
                            acceptedCompensationForShift?.compensation_minutes ?? 0,
                        ),
                    )
                    : Number(shift.rest);

            const compensationUsesReducedDailyRest =
                Boolean(acceptedCompensationForShift) &&
                shift.restType === 'daily' &&
                effectiveRestMinutes >= 9 * 60 &&
                effectiveRestMinutes < 11 * 60;

            // This describes the rest shown on this row, not the allowance
            // event attributed to this shift.
            const reducedDailyRest =
                baseReducedDailyRest || compensationUsesReducedDailyRest;

            const followingShift = nextShiftById.get(shift.id);

            const followingRestUsesAllowance = followingShift
                ? usesReducedDailyRestAllowance(
                    followingShift,
                    restCompensations,
                )
                : false;

            const currentShiftUsesAllowance =
                extendedShift || followingRestUsesAllowance;

            // A qualifying weekly rest resets the counter for this shift.
            const isQualifyingWeeklyRest =
                shift.restType === 'weekly' &&
                effectiveRestMinutes >= 24 * 60;

            const sharedAllowanceUsedBefore = isQualifyingWeeklyRest
                ? 0
                : Math.max(
                    0,
                    sharedAllowanceUsedAfter -
                    (currentShiftUsesAllowance ? 1 : 0),
                );

            const drivingMinutes = normalizeDrivingMinutes(shift.driving);
            const drivingUsageAfter =
                extendedDrivingUsage.get(shift.id) ?? 0;

            const extendedDriving = drivingMinutes > 9 * 60;

            const drivingUsageBefore = Math.max(
                0,
                drivingUsageAfter - (extendedDriving ? 1 : 0),
            );

            return {
                shift,
                startsAfterWeeklyRest: shift.id === firstHistoricalShiftId,
                drivingStatus: getDrivingStatus(
                    drivingMinutes,
                    drivingUsageBefore,
                ),
                shiftStatus: getShiftStatus(
                    shift,
                    shiftMinutes,
                    sharedAllowanceUsedBefore,
                ),
                restStatus: getRestStatus(shift, effectiveRestMinutes),
                drivingUsageAfter,
                sharedAllowanceUsedAfter,
                reducedDailyRest,
                extendedShift,
                followingRestUsesAllowance,
                weeklyRestCompensationCandidates:
                    weeklyRestCompensationCandidates.get(shift.id),
                restCompensations: restCompensations.filter(
                    (compensation) =>
                        compensation.reduced_weekly_rest_shift_id === shift.id ||
                        compensation.compensation_shift_id === shift.id,
                ),
            };
        });
}
