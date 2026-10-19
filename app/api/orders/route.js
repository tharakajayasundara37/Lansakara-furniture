import { NextResponse } from 'next/server';
import storage from '@/backend/storage';
import { verifyAdminToken } from '@/backend/authHelper';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const auth = verifyAdminToken(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const data = await storage.getOrders(query);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body = {};
    let receiptImage = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      for (const [key, value] of formData.entries()) {
        if (key === 'receipt' && value instanceof File && value.size > 0) {
          const buffer = Buffer.from(await value.arrayBuffer());
          const mimeType = value.type || 'image/jpeg';
          try {
            const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
            if (!isServerless) {
              const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
              if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

              const ext = path.extname(value.name) || '.jpg';
              const filename = 'receipt_' + Date.now() + '_' + Math.round(Math.random() * 1e6) + ext;
              fs.writeFileSync(path.join(uploadDir, filename), buffer);
              receiptImage = '/uploads/receipts/' + filename;
            } else {
              receiptImage = `data:${mimeType};base64,${buffer.toString('base64')}`;
            }
          } catch (e) {
            receiptImage = `data:${mimeType};base64,${buffer.toString('base64')}`;
          }
        } else if (typeof value === 'string') {
          body[key] = value;
        }
      }
    } else {
      body = await request.json();
    }

    const {
      customerName,
      email,
      phone,
      address,
      cityDistrict,
      productName,
      productId,
      productImage,
      woodSpec,
      fabricSpec,
      trimSpec,
      customMessage,
      subtotal,
      deliveryDistanceKm,
      deliveryRatePerKm,
      deliveryFee,
      paymentMethod,
      cardDiscountPercent,
      discountAmount,
      totalPrice,
      advanceAmount,
      remainingBalance,
      maskedCard
    } = body;

    if (!customerName || !email || !phone) {
      return NextResponse.json({ error: 'Customer Name, Email, and Phone number are required' }, { status: 400 });
    }

    if (!receiptImage && body.receiptImage) {
      receiptImage = body.receiptImage;
    }

    const order = await storage.createOrder({
      customerName,
      email,
      phone,
      address: address || '',
      cityDistrict: cityDistrict || '',
      productName: productName || 'Lansakara Bespoke Furniture',
      productId: productId || null,
      productImage: productImage || '',
      woodSpec: woodSpec || '',
      fabricSpec: fabricSpec || '',
      trimSpec: trimSpec || '',
      customMessage: customMessage || '',
      subtotal: subtotal !== undefined ? parseFloat(subtotal) : undefined,
      deliveryDistanceKm: deliveryDistanceKm !== undefined ? parseFloat(deliveryDistanceKm) : undefined,
      deliveryRatePerKm: deliveryRatePerKm !== undefined ? parseFloat(deliveryRatePerKm) : undefined,
      deliveryFee: deliveryFee !== undefined ? parseFloat(deliveryFee) : undefined,
      paymentMethod: paymentMethod || 'cod',
      cardDiscountPercent: cardDiscountPercent !== undefined ? parseFloat(cardDiscountPercent) : undefined,
      discountAmount: discountAmount !== undefined ? parseFloat(discountAmount) : undefined,
      totalPrice: totalPrice !== undefined ? parseFloat(totalPrice) : undefined,
      advanceAmount: advanceAmount !== undefined ? parseFloat(advanceAmount) : undefined,
      remainingBalance: remainingBalance !== undefined ? parseFloat(remainingBalance) : undefined,
      receiptImage,
      maskedCard: maskedCard || ''
    });

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully! Our concierge will contact you shortly.',
      orderId: order._id || order.id,
      order
    }, { status: 201 });
  } catch (err) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
