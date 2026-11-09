
import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase/database';

type DriverJournalShiftRow =
    Database['public']['Tables']['driver_journal_shifts']['Row'];

type RestCompensationRow =
    Database['public']['Tables']['driver_journal_rest_compensations']['Row'];

export type DriverJournalBreakRow =
    Database['public']['Tables']['driver_journal_breaks']['Row'];

export type TachographData = {
    shifts: DriverJournalShiftRow[];
    restCompensations: RestCompensationRow[];
    breaks: DriverJournalBreakRow[];
};

export type GetTachographDataResult =
    | {
        success: true;
        data: TachographData;
    }
    | {
        success: false;
        error: string;
    };

export async function getTachographData(): Promise<GetTachographDataResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                error: 'User is not authenticated',
            };
        }

        const [shiftsResult, compensationsResult, breaksResult] =
            await Promise.all([
                supabase
                    .from('driver_journal_shifts')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false })
                    .order('start', { ascending: false }),

                supabase
                    .from('driver_journal_rest_compensations')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true }),

                supabase
                    .from('driver_journal_breaks')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('start_at', { ascending: true }),
            ]);

        if (shiftsResult.error) {
            return {
                success: false,
                error: shiftsResult.error.message,
            };
        }

        if (compensationsResult.error) {
            return {
                success: false,
                error: compensationsResult.error.message,
            };
        }

        if (breaksResult.error) {
            return {
                success: false,
                error: breaksResult.error.message,
            };
        }

        return {
            success: true,
            data: {
                shifts: shiftsResult.data ?? [],
                restCompensations: compensationsResult.data ?? [],
                breaks: breaksResult.data ?? [],
            },
        };
    } catch (error) {
        console.error('getTachographData error:', error);

        return {
            success: false,
            error: 'Failed to load tachograph data',
        };
    }
}
