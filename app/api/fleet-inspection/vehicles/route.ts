import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search')?.trim() || '';

        if (search.length < 2) {
            return NextResponse.json([]);
        }

        const { data: exact, error: exactError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('regnumber', search.toUpperCase());

        if (exactError) throw exactError;

        if (exact && exact.length > 0) {
            return NextResponse.json(exact);
        }

        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .ilike('regnumber', `%${search}%`)
            .limit(20);

        if (error) throw error;

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Vehicle search error:', error);

        return NextResponse.json(
            { error: 'Failed to search vehicles' },
            { status: 500 },
        );
    }
}
