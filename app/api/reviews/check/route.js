import { NextResponse } from 'next/server';
import storage from '@/backend/storage';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }
    const existing = await storage.getReviewByEmail(email);
    return NextResponse.json({
      alreadyReviewed: !!existing,
      hasReviewed: !!existing,
      review: existing || null
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
