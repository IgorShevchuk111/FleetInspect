'use server';

import { createClient } from '@/lib/supabase/server';

type UpdateShiftTotalsResult =
    | { success: true }
    | { success: false; error: string };

export async function updateShiftTotalsAction(
    shiftId: string,
    drivingMinutes: number,
    breakMinutes: number,
): Promise<UpdateShiftTotalsResult> {
    if (!shiftId) {
        return { success: false, error: 'Invalid shift.' };
    }

    if (
        !Number.isInteger(drivingMinutes) ||
        drivingMinutes < 0 ||
        drivingMinutes > 24 * 60
    ) {
        return { success: false, error: 'Invalid driving time.' };
    }

    if (
        !Number.isInteger(breakMinutes) ||
        breakMinutes < 0 ||
        breakMinutes > 7 * 24 * 60
    ) {
        return { success: false, error: 'Invalid break time.' };
    }

    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'You must be logged in.' };
        }

        const { data, error } = await supabase
            .from('driver_journal_shifts')
            .update({
                driving: drivingMinutes,
                break: breakMinutes,
            })
            .eq('id', shiftId)
            .eq('user_id', user.id)
            .select('id')
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            return { success: false, error: 'Shift not found.' };
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to update shift totals:', error);

        return {
            success: false,
            error: 'Could not save shift totals. Please try again.',
        };
    }
}