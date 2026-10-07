import type { Shift } from '@/features/driver-journal/types/ driver-journal';
import type { RestCompensation } from '../services/driver-journal';
import type { WeeklyRestCompensationCandidate } from './weekly-rest-compensation';
import { calculateShiftMinutes } from './shifts';

const DAILY_REST_REDUCED_MINUTES = 9 * 60;
const DAILY_REST_REGULAR_MINUTES = 11 * 60;
const WEEKLY_REST_MINIMUM_MINUTES = 24 * 60;
const WEEKLY_REST_REGULAR_MINUTES = 45 * 60;

export type ShiftDetailsData = {
    shiftMinutes: number;
    drivingMinutes: number;
    breakMinutes: number;
    restMinutes: number;
    workingMinutes: number;
    endDate: string;

    isWeeklyRest: boolean;
    isReducedWeeklyRest: boolean;
    isRegularWeeklyRest: boolean;
    isReducedDailyRest: boolean;

    effectiveRestMinutes: number;
    compensationMinutes: number;

    drivingOver9Hours: boolean;
    drivingOver10Hours: boolean;
    shiftOver15Hours: boolean;

    drivingUsageBefore: number;
    extendedShiftUsageBefore: number;

    drivingMaximumMinutes: number;
    shiftMaximumMinutes: number;

    compensationReceiver: boolean;
    compensationSource: boolean;

    candidates: WeeklyRestCompensationCandidate[];
    savedCompensations: RestCompensation[];
};

export function getShiftDetailsData(
    shift: Shift,
    {
        drivingUsageAfter = 0,
        extendedShiftUsageAfter = 0,
        extendedShift = false,
        weeklyRestCompensationCandidates = [],
        restCompensations = [],
    }: {
        drivingUsageAfter?: number;
        extendedShiftUsageAfter?: number;
        extendedShift?: boolean;
        weeklyRestCompensationCandidates?: WeeklyRestCompensationCandidate[];
        restCompensations?: RestCompensation[];
    } = {},
): ShiftDetailsData {
    const shiftMinutes = calculateShiftMinutes(shift);
    const drivingMinutes = Number(shift.driving) || 0;
    const breakMinutes = Number(shift.break) || 0;
    const restMinutes = Number(shift.rest) || 0;

    const workingMinutes = Math.max(
        0,
        shiftMinutes - breakMinutes,
    );

    const endDate = shift.endDate || shift.date;
    const isWeeklyRest = shift.restType === 'weekly';

    const acceptedCompensation = restCompensations.find(
        (compensation) =>
            compensation.decision === 'accepted' &&
            compensation.compensation_shift_id === shift.id,
    );

    const compensationMinutes = Number(
        acceptedCompensation?.compensation_minutes ?? 0,
    );

    const effectiveRestMinutes = isWeeklyRest
        ? restMinutes
        : Math.max(0, restMinutes - compensationMinutes);

    const isReducedWeeklyRest =
        isWeeklyRest &&
        effectiveRestMinutes >= WEEKLY_REST_MINIMUM_MINUTES &&
        effectiveRestMinutes < WEEKLY_REST_REGULAR_MINUTES;

    const isRegularWeeklyRest =
        isWeeklyRest &&
        effectiveRestMinutes >= WEEKLY_REST_REGULAR_MINUTES;

    const isReducedDailyRest =
        !isWeeklyRest &&
        effectiveRestMinutes >= DAILY_REST_REDUCED_MINUTES &&
        effectiveRestMinutes < DAILY_REST_REGULAR_MINUTES;

    const drivingOver9Hours = drivingMinutes > 9 * 60;
    const drivingOver10Hours = drivingMinutes > 10 * 60;
    const shiftOver15Hours = shiftMinutes > 15 * 60;

    const drivingUsageBefore = Math.max(
        0,
        drivingUsageAfter - (drivingOver9Hours ? 1 : 0),
    );

    const extendedShiftUsageBefore = Math.max(
        0,
        extendedShiftUsageAfter - (extendedShift ? 1 : 0),
    );

    const drivingMaximumMinutes =
        drivingUsageBefore < 2 ? 10 * 60 : 9 * 60;

    const shiftMaximumMinutes =
        extendedShiftUsageBefore < 3 ? 15 * 60 : 13 * 60;

    const compensationReceiver = Boolean(acceptedCompensation);

    const compensationSource = restCompensations.some(
        (compensation) =>
            compensation.decision === 'accepted' &&
            compensation.reduced_weekly_rest_shift_id === shift.id,
    );

    const candidates = weeklyRestCompensationCandidates.filter(
        (candidate) => candidate.shiftId === shift.id,
    );

    const savedCompensations = restCompensations.filter(
        (compensation) =>
            compensation.reduced_weekly_rest_shift_id === shift.id ||
            compensation.compensation_shift_id === shift.id,
    );

    return {
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
    };
}