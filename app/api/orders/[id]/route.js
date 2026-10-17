import { NextResponse } from 'next/server';
import storage from '@/backend/storage';
import { verifyAdminToken } from '@/backend/authHelper';

export async function GET(request, { params }) {
  const auth = verifyAdminToken(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const order = await storage.getOrderById(params.id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = verifyAdminToken(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const deleted = await storage.deleteOrder(params.id);
    if (!deleted) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ message: 'Order deleted successfully', order: deleted });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
