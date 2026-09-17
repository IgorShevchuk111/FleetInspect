import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DurationInput } from '@/features/driver-journal/types/ driver-journal';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function durationToMinutes({
    hours,
    minutes,
}: DurationInput) {
    return hours * 60 + minutes;
}

export function minutesToDuration(minutes: number) {
    return {
        hours: Math.floor(minutes / 60),
        minutes: minutes % 60,
    };
}

export function getStartOfWeek(date = new Date()) {
    const result = new Date(date);

    const day = result.getDay();

    const difference = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + difference);
    result.setHours(0, 0, 0, 0);

    return result;
}
