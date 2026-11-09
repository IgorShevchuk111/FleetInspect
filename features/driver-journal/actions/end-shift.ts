
'use server';

import { createClient } from '@/lib/supabase/server';

type RestType = 'daily' | 'weekly';

type EndShiftResult =
    | {
        success: true;
        shift: {
            id: string;
            date: string;
            start: string;
            end: string;
            end_date: string;
            rest_type: string;
        };
    }
    | { success: false; error: string };

export async function endShiftAction(
    date: string,
    end: string,
    restType: RestType,
): Promise<EndShiftResult> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return { success: false, error: 'Invalid rest date.' };
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(end)) {
        return { success: false, error: 'Invalid end time.' };
    }

    if (restType !== 'daily' && restType !== 'weekly') {
        return { success: false, error: 'Invalid rest type.' };
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
                error: 'You must be logged in to end a shift.',
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

        if (!activeShift) {
            return {
                success: false,
                error: 'No active shift found.',
            };
        }

        const { data, error } = await supabase
            .from('driver_journal_shifts')
            .update({
                end,
                end_date: date,
                rest_type: restType,
            })
            .eq('id', activeShift.id)
            .eq('user_id', user.id)
            .is('end', null)
            .select('id, date, start, end, end_date, rest_type')
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            return {
                success: false,
                error: 'The shift has already ended. Please refresh.',
            };
        }

        return { success: true, shift: data };
    } catch (error) {
        console.error('Failed to end shift from Tachograph:', error);

        return {
            success: false,
            error: 'Could not end the shift. Please try again.',
        };
    }
}
