import { findVehicle } from '@/app/lib/data_servis';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search') || '';

        const vehicles = await findVehicle(search);
        return NextResponse.json(vehicles);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to search vehicles. Please try again.' },
            { status: 500 }
        );
    }
} 