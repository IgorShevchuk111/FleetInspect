import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search')?.trim() || '';

        if (search.length < 2) {
            return NextResponse.json([]);
        }

        const supabase = await createClient();

        // exact match first
        const { data: exact, error: exactError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('regnumber', search.toUpperCase());

        if (exactError) throw exactError;

        if (exact && exact.length > 0) {
            return NextResponse.json(exact);
        }

        // fallback partial match
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
            { status: 500 }
        );
    }
}

// import { findVehicle } from '@/lib/data_servis';
// import { NextRequest, NextResponse } from 'next/server';

// export async function GET(request: NextRequest) {
//     try {
//         const searchParams = request.nextUrl.searchParams;
//         const search = searchParams.get('search') || '';

//         const vehicles = await findVehicle(search);
//         return NextResponse.json(vehicles);
//     } catch (error) {
//         return NextResponse.json(
//             { error: 'Failed to search vehicles. Please try again.' },
//             { status: 500 }
//         );
//     }
// } 

