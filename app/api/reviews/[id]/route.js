import { NextResponse } from 'next/server';
import storage from '@/backend/storage';
import { verifyAdminToken } from '@/backend/authHelper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(request, { params }) {
  const auth = verifyAdminToken(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  try {
    const resolvedParams = await Promise.resolve(params);
    const reviewId = resolvedParams?.id;
    const deleted = await storage.deleteReview(reviewId);
    if (!deleted) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Review deleted successfully', review: deleted });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
