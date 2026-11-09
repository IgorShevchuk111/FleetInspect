'use server';

import { createClient } from '@/lib/supabase/server';

type DeleteBreakResult =
    | { success: true }
    | { success: false; error: string };

export async function deleteBreakAction(
    breakId: string,
): Promise<DeleteBreakResult> {
    if (!breakId || typeof breakId !== 'string') {
        return { success: false, error: 'Invalid break.' };
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
                error: 'You must be logged in to delete a break.',
            };
        }

        const { data, error } = await supabase
            .from('driver_journal_breaks')
            .delete()
            .eq('id', breakId)
            .eq('user_id', user.id)
            .select('id')
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            return {
                success: false,
                error: 'Break not found. Please refresh.',
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to delete break:', error);

        return {
            success: false,
            error: 'Could not delete the break. Please try again.',
        };
    }
}