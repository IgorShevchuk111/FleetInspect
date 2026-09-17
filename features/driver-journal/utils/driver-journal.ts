import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { DurationInput } from '@/features/driver-journal/types/ driver-journal';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function durationToMinutes({
    hours,
    minutes,
}: DurationInput) {
    return hours * 60 + minutes;
}

export function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes
        .toString()
        .padStart(2, '0')}m`;
}

export function formatWeek(startDate: Date) {
    const start = new Date(startDate);
    const end = new Date(startDate);

    end.setDate(end.getDate() + 6);

    const formatter = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export function calculateTotals(
    shifts: {
        driving: number;
        shift: number;
        break: number;
    }[],
) {
    return shifts.reduce(
        (total, shift) => ({
            driving: total.driving + shift.driving,
            shift: total.shift + shift.shift,
            break: total.break + shift.break,
        }),
        {
            driving: 0,
            shift: 0,
            break: 0,
        },
    );
}

export function getStartOfWeek(date = new Date()) {
    const result = new Date(date);
    const day = result.getDay();
    const difference = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + difference);
    result.setHours(0, 0, 0, 0);

    return result;
}