import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/app/lib/data_servis';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await getUser(email);
        const exists = !!user;

        return NextResponse.json({ exists });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 