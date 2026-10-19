import { NextResponse } from 'next/server';
import storage from '@/backend/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const data = await storage.getReviews(query);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { authorName, authorEmail, email, rating, quote, location, productPurchased } = body || {};
    const patronEmail = authorEmail || email;

    if (!authorName || !authorName.trim()) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }
    if (!patronEmail || !patronEmail.trim() || !patronEmail.includes('@')) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }
    if (!quote || !quote.trim()) {
      return NextResponse.json({ error: 'Please enter your review comments.' }, { status: 400 });
    }

    const review = await storage.createReview({
      authorName,
      email: patronEmail,
      rating: parseInt(rating) || 5,
      quote,
      location,
      productPurchased
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your valuable feedback! Your review has been published.',
      review
    }, { status: 201 });
  } catch (err) {
    if (err.code === 'DUPLICATE_REVIEW' || (err.message && err.message.includes('already been submitted')) || err.code === 11000) {
      return NextResponse.json({
        error: 'A review has already been submitted with this email address. Each customer can submit only one review.'
      }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
