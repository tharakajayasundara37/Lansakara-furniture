import { NextResponse } from 'next/server';
import storage from '@/backend/storage';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const { username, password } = await request.json();
        const adminUser = process.env.ADMIN_USERNAME || 'admin';
        const adminPass = process.env.ADMIN_PASSWORD || 'lansakara2026';

        if (username !== adminUser || password !== adminPass) {
            return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
        }

        const token = jwt.sign(
            { username, role: 'admin' },
            process.env.JWT_SECRET || 'lansakara_luxury_super_secret_key_2026',
            { expiresIn: '7d' }
        );

        return NextResponse.json({
            success: true,
            token,
            admin: { username, role: 'master_artisan' }
        });
    } catch (err) {
        return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 });
    }
}
