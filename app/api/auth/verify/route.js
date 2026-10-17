import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/backend/authHelper';

export async function POST(request) {
    const auth = verifyAdminToken(request);
    if (!auth.valid) {
        return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }
    return NextResponse.json({ valid: true, admin: auth.admin });
}
