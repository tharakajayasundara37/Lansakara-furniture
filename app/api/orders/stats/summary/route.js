import { NextResponse } from 'next/server';
import storage from '@/backend/storage';
import { verifyAdminToken } from '@/backend/authHelper';

export async function GET(request) {
  const auth = verifyAdminToken(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const stats = await storage.getOrderStats();
    return NextResponse.json(stats);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
