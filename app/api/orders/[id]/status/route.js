import { NextResponse } from 'next/server';
import storage from '@/backend/storage';
import { verifyAdminToken } from '@/backend/authHelper';

export async function PATCH(request, { params }) {
  const auth = verifyAdminToken(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { status, adminNote } = await request.json();
    const validStatuses = [
      'pending',
      'accepted',
      'processing',
      'in_production',
      'ready',
      'ready_for_delivery',
      'delivered',
      'cancelled'
    ];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const updated = await storage.updateOrderStatus(params.id, status, adminNote);
    if (!updated) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ message: `Order status updated to: ${status}`, order: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
