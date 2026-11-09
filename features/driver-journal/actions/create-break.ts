'use server';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase/database';

type DriverJournalBreakRow =
    Database['public']['Tables']['driver_journal_breaks']['Row'];

type CreateBreakResult =
    | {
        success: true;
        break: DriverJournalBreakRow;
    }
    | {
        success: false;
        error: string;
    };

function getUkTimestamp(date: string, time: string): number | null {
    const match = time.match(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);

    if (!match || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return null;
    }

    const [, hours, minutes, seconds = '00'] = match;
    const [year, month, day] = date.split('-').map(Number);

    const localAsUtc = Date.UTC(
        year,
        month - 1,
        day,
        Number(hours),
        Number(minutes),
        Number(seconds),
    );

    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    });

    let timestamp = localAsUtc;

    for (let i = 0; i < 3; i++) {
        const parts = formatter.formatToParts(new Date(timestamp));
        const values = Object.fromEntries(
            parts.map((part) => [part.type, part.value]),
        );

        const formattedAsUtc = Date.UTC(
            Number(values.year),
            Number(values.month) - 1,
            Number(values.day),
            Number(values.hour),
            Number(values.minute),
            Number(values.second),
        );

        timestamp = localAsUtc - (formattedAsUtc - timestamp);
    }

    const result = formatter.formatToParts(new Date(timestamp));
    const values = Object.fromEntries(
        result.map((part) => [part.type, part.value]),
    );

    const matches =
        Number(values.year) === year &&
        Number(values.month) === month &&
        Number(values.day) === day &&
        Number(values.hour) === Number(hours) &&
        Number(values.minute) === Number(minutes) &&
        Number(values.second) === Number(seconds);

    return matches ? timestamp : null;
}

export async function createBreakAction(
    shiftId: string,
    startAt: string,
    endAt: string,
): Promise<CreateBreakResult> {
    if (!shiftId || typeof shiftId !== 'string') {
        return { success: false, error: 'Invalid shift.' };
    }

    const startTimestamp = Date.parse(startAt);
    const endTimestamp = Date.parse(endAt);

    if (
        !Number.isFinite(startTimestamp) ||
        !Number.isFinite(endTimestamp) ||
        !/[+-]\d{2}:\d{2}$|Z$/.test(startAt) ||
        !/[+-]\d{2}:\d{2}$|Z$/.test(endAt) ||
        endTimestamp <= startTimestamp
    ) {
        return { success: false, error: 'Invalid break interval.' };
    }

    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                error: 'You must be logged in to add a break.',
            };
        }

        const { data: shift, error: shiftError } = await supabase
            .from('driver_journal_shifts')
            .select('id, date, start, end, end_date')
            .eq('id', shiftId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (shiftError) throw shiftError;

        if (!shift) {
            return { success: false, error: 'Shift not found.' };
        }

        const shiftStart = getUkTimestamp(shift.date, shift.start);

        const shiftEnd = shift.end && shift.end_date
            ? getUkTimestamp(shift.end_date, shift.end)
            : Date.now();

        if (shiftStart === null || shiftEnd === null || shiftEnd <= shiftStart) {
            return {
                success: false,
                error: 'Could not determine the shift boundaries.',
            };
        }

        if (
            startTimestamp < shiftStart ||
            endTimestamp > shiftEnd
        ) {
            return {
                success: false,
                error: 'Break must be within the shift.',
            };
        }

        const { data, error } = await supabase
            .from('driver_journal_breaks')
            .insert({
                user_id: user.id,
                shift_id: shift.id,
                start_at: new Date(startTimestamp).toISOString(),
                end_at: new Date(endTimestamp).toISOString(),
            })
            .select('*')
            .single();

        if (error) {
            if (error.code === '23P01') {
                return {
                    success: false,
                    error: 'This break overlaps with another break.',
                };
            }

            throw error;
        }

        return { success: true, break: data };
    } catch (error) {
        console.error('Failed to create break:', error);

        return {
            success: false,
            error: 'Could not save the break. Please try again.',
        };
    }
}