import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export type AppEntitlement =
    | 'fleet_inspection'
    | 'driver_journal'
    | 'route_planner';

export async function requireAuthentication() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }
}

export async function requireAppEntitlement(
    app: AppEntitlement,
) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data, error } = await supabase
        .from('user_entitlements')
        .select('id')
        .eq('user_id', user.id)
        .eq('app', app)
        .maybeSingle();

    if (error || !data) {
        redirect(`/?error=access_denied&app=${app}`);
    }
}