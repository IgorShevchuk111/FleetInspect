
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase/database';

const supabase = createClient();

type DriverJournalShift =
    Database['public']['Tables']['driver_journal_shifts']['Row'];

type DriverJournalShiftInsert =
    Database['public']['Tables']['driver_journal_shifts']['Insert'];

type DriverJournalShiftUpdate =
    Database['public']['Tables']['driver_journal_shifts']['Update'];

export async function getDriverJournalShifts(): Promise<
    DriverJournalShift[]
> {
    const { data, error } = await supabase
        .from('driver_journal_shifts')
        .select('*')
        .order('date', { ascending: false })
        .order('start', { ascending: false });

    if (error) throw error;

    return data ?? [];
}

export async function createDriverJournalShift(
    shift: Omit<DriverJournalShiftInsert, 'user_id'>,
): Promise<DriverJournalShift> {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;

    if (!user) {
        throw new Error('User is not authenticated.');
    }

    const { data, error } = await supabase
        .from('driver_journal_shifts')
        .insert({
            ...shift,
            user_id: user.id,
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function updateDriverJournalShift(
    id: string,
    shift: DriverJournalShiftUpdate,
): Promise<DriverJournalShift> {
    const { data, error } = await supabase
        .from('driver_journal_shifts')
        .update(shift)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function deleteDriverJournalShift(
    id: string,
): Promise<void> {
    const { error } = await supabase
        .from('driver_journal_shifts')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
