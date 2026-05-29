


import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase/database';


type Tables = Database['public']['Tables'];
type UserInsert = Tables['profiles']['Insert'];

export async function createUser(user: UserInsert) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('profiles')
        .insert(user as any)
        .select()
        .single();

    if (error) throw error;

    return data;
}