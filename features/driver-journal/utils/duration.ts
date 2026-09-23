import type { DurationInput } from '@/features/driver-journal/types/ driver-journal';

export function durationToMinutes(
    duration: DurationInput,
): number;

export function durationToMinutes(
    hours: number,
    minutes: number,
): number;

export function durationToMinutes(
    value: DurationInput | number,
    minutes = 0,
): number {
    if (typeof value === 'object') {
        return value.hours * 60 + value.minutes;
    }

    return value * 60 + minutes;
}

export function minutesToDuration(
    totalMinutes: number,
) {
    const minutes = Math.max(
        0,
        Math.round(totalMinutes),
    );

    return {
        hours: Math.floor(minutes / 60),
        minutes: minutes % 60,
    };
}

export function formatDuration(
    totalMinutes: number,
): string {
    const minutes = Math.max(
        0,
        Math.round(totalMinutes),
    );

    return `${Math.floor(minutes / 60)}h ${minutes % 60
        }m`;
}