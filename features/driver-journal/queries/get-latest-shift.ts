import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { ActiveShift } from '@/features/driver-journal/types/tachograph';

export type GetLatestShiftResult =
    | { success: true; shift: ActiveShift | null }
    | { success: false; error: string };

export async function getLatestShift(): Promise<GetLatestShiftResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                error: 'You must be logged in.',
            };
        }

        const { data, error } = await supabase
            .from('driver_journal_shifts')
            .select('id, date, start, end, end_date, rest_type')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .order('start', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return {
            success: true,
            shift: data,
        };
    } catch (error) {
        console.error('Failed to get latest shift:', error);

        return {
            success: false,
            error: 'Could not load the latest shift.',
        };
    }
}