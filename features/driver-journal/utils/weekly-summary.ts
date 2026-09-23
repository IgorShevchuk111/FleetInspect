import type { Shift } from '@/features/driver-journal/types/ driver-journal';

import { getEndOfWeek, getStartOfWeek } from './dates';
import {
    calculateDailyRestCompliance,
    calculateWeeklyRestCompliance,
    countExtendedDrivingDays,
} from './compliance';
import {
    calculateShiftTotals,
    calculateWorkingMinutes,
    getShiftsForWeek,
} from './shifts';

const WEEKLY_DRIVING_LIMIT = 56 * 60;
const TWO_WEEK_DRIVING_LIMIT = 90 * 60;
const MAX_EXTENDED_DRIVING_DAYS = 2;

function getWeeklyDriving(
    shifts: Shift[],
    weekStart: Date,
): number {
    return getShiftsForWeek(
        shifts,
        weekStart,
    ).reduce(
        (total, shift) =>
            total + shift.driving,
        0,
    );
}

function calculate17WeekAverageWorking(
    shifts: Shift[],
    weekStart: Date,
): number {
    let totalWorking = 0;

    for (
        let index = 0;
        index < 17;
        index += 1
    ) {
        const start = getStartOfWeek(
            weekStart,
        );

        start.setDate(
            start.getDate() -
            index * 7,
        );

        const weekShifts =
            getShiftsForWeek(
                shifts,
                start,
            );

        totalWorking +=
            weekShifts.reduce(
                (total, shift) =>
                    total +
                    calculateWorkingMinutes(
                        shift,
                    ),
                0,
            );
    }

    return totalWorking / 17;
}

function calculateAnnualEarned(
    shifts: Shift[],
    weekEnd: Date,
): number {
    const year = weekEnd.getFullYear();

    return shifts.reduce(
        (total, shift) => {
            if (!shift.date) {
                return total;
            }

            const date = new Date(
                `${shift.date}T00:00:00`,
            );

            if (
                date.getFullYear() !== year
            ) {
                return total;
            }

            return total + shift.earn;
        },
        0,
    );
}

export function calculateWeeklySummary(
    shifts: Shift[],
    weekStart: Date,
) {
    const currentWeekStart =
        getStartOfWeek(weekStart);

    const currentWeekShifts =
        getShiftsForWeek(
            shifts,
            currentWeekStart,
        );

    const currentTotals =
        calculateShiftTotals(
            currentWeekShifts,
        );

    const previousWeekStart =
        new Date(
            currentWeekStart,
        );

    previousWeekStart.setDate(
        previousWeekStart.getDate() -
        7,
    );

    const previousWeekDriving =
        getWeeklyDriving(
            shifts,
            previousWeekStart,
        );

    const twoWeekDriving =
        currentTotals.driving +
        previousWeekDriving;

    const extendedDrivingDaysUsed =
        countExtendedDrivingDays(
            shifts,
            currentWeekStart,
        );

    const dailyRestCompliance =
        calculateDailyRestCompliance(
            shifts,
        );

    const weeklyRestCompliance =
        calculateWeeklyRestCompliance(
            shifts,
        );

    const currentWeekEnd =
        getEndOfWeek(
            currentWeekStart,
        );

    return {
        ...currentTotals,

        twoWeekDriving,

        weeklyDrivingRemaining:
            Math.max(
                0,
                WEEKLY_DRIVING_LIMIT -
                currentTotals.driving,
            ),

        twoWeekDrivingRemaining:
            Math.max(
                0,
                TWO_WEEK_DRIVING_LIMIT -
                twoWeekDriving,
            ),

        extendedDrivingDaysUsed,

        extendedDrivingDaysRemaining:
            Math.max(
                0,
                MAX_EXTENDED_DRIVING_DAYS -
                extendedDrivingDaysUsed,
            ),

        reducedDailyRestUsed:
            dailyRestCompliance.reducedDailyRestUsed,

        reducedDailyRestRemaining:
            dailyRestCompliance.reducedDailyRestRemaining,

        average17WeekWorking:
            calculate17WeekAverageWorking(
                shifts,
                currentWeekStart,
            ),

        annualEarned:
            calculateAnnualEarned(
                shifts,
                currentWeekEnd,
            ),

        reducedWeeklyRestUsed:
            weeklyRestCompliance.reducedWeeklyRestUsed,

        compensationOwed:
            weeklyRestCompliance.compensationOwed,
    };
}