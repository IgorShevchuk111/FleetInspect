import { createClient } from '@/lib/supabase/client';

import type { Database } from '@/types/supabase/database';

const supabase = createClient();

type DriverJournalShift =
    Database['public']['Tables']['driver_journal_shifts']['Row'];

type DriverJournalShiftInsert =
    Database['public']['Tables']['driver_journal_shifts']['Insert'];

type DriverJournalShiftUpdate =
    Database['public']['Tables']['driver_journal_shifts']['Update'];

export type RestCompensation =
    Database['public']['Tables']['driver_journal_rest_compensations']['Row'];

type RestCompensationInsert =
    Database['public']['Tables']['driver_journal_rest_compensations']['Insert'];

type RestCompensationUpdate =
    Database['public']['Tables']['driver_journal_rest_compensations']['Update'];

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

export async function getRestCompensations(): Promise<
    RestCompensation[]
> {
    const { data, error } = await supabase
        .from('driver_journal_rest_compensations')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) throw error;

    return data ?? [];
}

export async function createRestCompensation(
    compensation: Omit<RestCompensationInsert, 'user_id'>,
): Promise<RestCompensation> {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;

    if (!user) {
        throw new Error('User is not authenticated.');
    }

    const { data, error } = await supabase
        .from('driver_journal_rest_compensations')
        .insert({
            ...compensation,
            user_id: user.id,
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function updateRestCompensation(
    id: string,
    compensation: RestCompensationUpdate,
): Promise<RestCompensation> {
    const { data, error } = await supabase
        .from('driver_journal_rest_compensations')
        .update(compensation)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function deleteRestCompensation(
    id: string,
): Promise<void> {
    const { error } = await supabase
        .from('driver_journal_rest_compensations')
        .delete()
        .eq('id', id);

    if (error) throw error;
}