import type { Shift } from '@/features/driver-journal/types/driver-journal';

import type { RestCompensation } from '../services/driver-journal';

import {
    buildExtendedDrivingUsage,
    buildExtendedShiftUsage,
    buildSharedAllowanceUsage,
    normalizeDrivingMinutes,
} from './compliance-usage';

import { buildWeeklyRestCompensationCandidates } from './weekly-rest-compensation';

import {
    getDrivingStatus,
    getRestStatus,
    getShiftStatus,
    hasExtendedShift,
    isReducedDailyRest,
} from '@/features/driver-journal/utils/shift-status';

import { calculateShiftMinutes } from './shifts';

type CompensationCandidates = ReturnType<
    typeof buildWeeklyRestCompensationCandidates
>;

export type WeeklyShiftRowData = {
    shift: Shift;
    drivingStatus: ReturnType<typeof getDrivingStatus>;
    shiftStatus: ReturnType<typeof getShiftStatus>;
    restStatus: ReturnType<typeof getRestStatus>;
    drivingUsageAfter: number;
    sharedAllowanceUsedAfter: number;
    extendedShiftUsageAfter: number;
    reducedDailyRest: boolean;
    extendedShift: boolean;
    weeklyRestCompensationCandidates:
    CompensationCandidates extends Map<
        string,
        infer Candidate
    >
    ? Candidate
    : never;
    restCompensations: RestCompensation[];
};

export function prepareWeeklyShiftRows(
    shifts: Shift[],
    allShifts: Shift[],
    restCompensations: RestCompensation[],
): WeeklyShiftRowData[] {
    const sharedAllowanceUsage =
        buildSharedAllowanceUsage(
            allShifts,
            restCompensations,
        );

    const extendedDrivingUsage =
        buildExtendedDrivingUsage(allShifts);

    const extendedShiftUsage =
        buildExtendedShiftUsage(allShifts);

    const weeklyRestCompensationCandidates =
        buildWeeklyRestCompensationCandidates(
            allShifts,
            restCompensations,
        );

    return [...shifts]
        .sort((a, b) => {
            const dateA = new Date(
                `${a.date}T${a.start}`,
            ).getTime();

            const dateB = new Date(
                `${b.date}T${b.start}`,
            ).getTime();

            return dateB - dateA;
        })
        .map((shift) => {
            const shiftMinutes = calculateShiftMinutes(
                shift.date,
                shift.start,
                shift.endDate || shift.date,
                shift.end,
            );

            const baseSharedAllowanceUsedAfter =
                sharedAllowanceUsage.get(shift.id) ?? 0;

            const baseReducedDailyRest =
                isReducedDailyRest(shift);

            const extendedShift =
                hasExtendedShift(shift);

            const acceptedCompensationForShift =
                restCompensations.find(
                    (compensation) =>
                        compensation.compensation_shift_id ===
                        shift.id &&
                        compensation.decision === 'accepted',
                );

            const effectiveRestMinutes =
                shift.restType === 'daily'
                    ? Math.max(
                        0,
                        Number(shift.rest) -
                        Number(
                            acceptedCompensationForShift?.compensation_minutes ??
                            0,
                        ),
                    )
                    : Number(shift.rest);

            const compensationUsesReducedDailyRest =
                Boolean(acceptedCompensationForShift) &&
                shift.restType === 'daily' &&
                effectiveRestMinutes >= 9 * 60 &&
                effectiveRestMinutes < 11 * 60;

            const reducedDailyRest =
                baseReducedDailyRest ||
                compensationUsesReducedDailyRest;

            const compensationAddsAllowance =
                compensationUsesReducedDailyRest &&
                !baseReducedDailyRest;

            const sharedAllowanceUsedAfter =
                baseSharedAllowanceUsedAfter +
                (compensationAddsAllowance ? 1 : 0);

            const currentShiftUsesAllowance =
                reducedDailyRest;

            const sharedAllowanceUsedBefore =
                Math.max(
                    0,
                    sharedAllowanceUsedAfter -
                    (currentShiftUsesAllowance ? 1 : 0),
                );

            const drivingMinutes =
                normalizeDrivingMinutes(shift.driving);

            const drivingUsageAfter =
                extendedDrivingUsage.get(shift.id) ?? 0;

            const extendedShiftUsageAfter =
                extendedShiftUsage.get(shift.id) ?? 0;

            const extendedDriving =
                drivingMinutes > 9 * 60;

            const drivingUsageBefore =
                Math.max(
                    0,
                    drivingUsageAfter -
                    (extendedDriving ? 1 : 0),
                );

            return {
                shift,
                drivingStatus: getDrivingStatus(
                    drivingMinutes,
                    drivingUsageBefore,
                ),
                shiftStatus: getShiftStatus(
                    shift,
                    shiftMinutes,
                    sharedAllowanceUsedBefore,
                ),
                restStatus: getRestStatus(
                    shift,
                    effectiveRestMinutes,
                ),
                drivingUsageAfter,
                sharedAllowanceUsedAfter,
                extendedShiftUsageAfter,
                reducedDailyRest,
                extendedShift,
                weeklyRestCompensationCandidates:
                    weeklyRestCompensationCandidates.get(
                        shift.id,
                    ),
                restCompensations:
                    restCompensations.filter(
                        (compensation) =>
                            compensation.reduced_weekly_rest_shift_id ===
                            shift.id ||
                            compensation.compensation_shift_id ===
                            shift.id,
                    ),
            };
        });
}
