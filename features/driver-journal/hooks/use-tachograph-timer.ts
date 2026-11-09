
'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ActiveShift } from '@/features/driver-journal/types/tachograph';

type UseTachographTimerReturn = {
    activeShift: ActiveShift | null;
    elapsedSeconds: number;
    restElapsedSeconds: number;
    isRunning: boolean;
    isResting: boolean;
    isLoading: boolean;
    error: string | null;
    startTimer: (shift: ActiveShift) => void;
    startRestTimer: (shift: ActiveShift) => void;
};

function getTimestamp(date: string, time: string): number {
    const normalizedTime = time.length === 5 ? `${time}:00` : time;

    return new Date(`${date}T${normalizedTime}`).getTime();
}

export function useTachographTimer(
    initialShift: ActiveShift | null,
    initialError: string | null,
): UseTachographTimerReturn {
    const [activeShift, setActiveShift] = useState<ActiveShift | null>(
        initialShift,
    );

    const [now, setNow] = useState<number | null>(null);

    const [workStartedAt, setWorkStartedAt] = useState<number | null>(() => {
        if (!initialShift || initialShift.end !== null) return null;

        return getTimestamp(initialShift.date, initialShift.start);
    });

    const [restStartedAt, setRestStartedAt] = useState<number | null>(() => {
        if (!initialShift || !initialShift.end || !initialShift.end_date) {
            return null;
        }

        return getTimestamp(initialShift.end_date, initialShift.end);
    });

    const [isLoading] = useState(false);
    const [error, setError] = useState<string | null>(initialError);

    useEffect(() => {
        if (!activeShift) return;

        setNow(Date.now());

        const interval = window.setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => window.clearInterval(interval);
    }, [activeShift]);

    const startTimer = useCallback((shift: ActiveShift) => {
        const startedAt = getTimestamp(shift.date, shift.start);

        setActiveShift(shift);
        setWorkStartedAt(startedAt);
        setRestStartedAt(null);
        setNow(Date.now());
        setError(null);
    }, []);

    const startRestTimer = useCallback((shift: ActiveShift) => {
        if (!shift.end || !shift.end_date) return;

        const startedAt = getTimestamp(shift.end_date, shift.end);

        setActiveShift(shift);
        setWorkStartedAt(null);
        setRestStartedAt(startedAt);
        setNow(Date.now());
        setError(null);
    }, []);

    const isRunning = activeShift !== null && activeShift.end === null;

    const isResting =
        activeShift !== null &&
        activeShift.end !== null &&
        activeShift.end_date !== null;

    const elapsedSeconds =
        isRunning && workStartedAt !== null && now !== null
            ? Math.max(0, Math.floor((now - workStartedAt) / 1000))
            : 0;

    const restElapsedSeconds =
        isResting && restStartedAt !== null && now !== null
            ? Math.max(0, Math.floor((now - restStartedAt) / 1000))
            : 0;

    return {
        activeShift,
        elapsedSeconds,
        restElapsedSeconds,
        isRunning,
        isResting,
        isLoading,
        error,
        startTimer,
        startRestTimer,
    };
}
