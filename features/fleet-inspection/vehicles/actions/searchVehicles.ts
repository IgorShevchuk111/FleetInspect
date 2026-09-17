'use server';

import { createClient } from '@/lib/supabase/server';

export async function searchVehicles(query: string) {
    const q = query.trim().toUpperCase();

    if (q.length < 3) return [];

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('vehicles')
        .select('id, regnumber, type')
        .ilike('regnumber', `%${q}%`)
        .limit(20);

    if (error) throw new Error(error.message);

    return data ?? [];
}