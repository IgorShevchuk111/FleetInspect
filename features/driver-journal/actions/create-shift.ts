
'use server';

import { createClient } from '@/lib/supabase/server';

type CreateShiftResult =
    | { success: true; shift: { id: string; date: string; start: string } }
    | { success: false; error: string };

export async function createShiftAction(
    date: string,
    start: string,
): Promise<CreateShiftResult> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return { success: false, error: 'Invalid shift date.' };
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(start)) {
        return { success: false, error: 'Invalid start time.' };
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
                error: 'You must be logged in to start a shift.',
            };
        }

        const { data: activeShift, error: activeShiftError } =
            await supabase
                .from('driver_journal_shifts')
                .select('id')
                .eq('user_id', user.id)
                .is('end', null)
                .limit(1)
                .maybeSingle();

        if (activeShiftError) {
            throw activeShiftError;
        }

        if (activeShift) {
            return {
                success: false,
                error: 'You already have an active shift.',
            };
        }

        const { data, error } = await supabase
            .from('driver_journal_shifts')
            .insert({
                user_id: user.id,
                date,
                start,
                end_date: date,
                driving: 0,
                break: 0,
                rest: 0,
                rest_type: 'daily',
                end: null,
                earn: 0,
            })
            .select('id, date, start')
            .single();

        if (error) {
            throw error;
        }

        return { success: true, shift: data };
    } catch (error) {
        console.error('Failed to create shift from Tachograph:', error);

        return {
            success: false,
            error: 'Could not start the shift. Please try again.',
        };
    }
}
