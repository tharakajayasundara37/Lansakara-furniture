import { NextResponse } from 'next/server';
import storage from '@/backend/storage';
import { verifyAdminToken } from '@/backend/authHelper';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const product = await storage.getProductById(params.id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = verifyAdminToken(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    let data = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const files = [];

      for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
          const buffer = Buffer.from(await value.arrayBuffer());
          const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
          if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

          const ext = path.extname(value.name) || '.jpg';
          const filename = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
          fs.writeFileSync(path.join(uploadDir, filename), buffer);
          files.push('/images/products/' + filename);
        } else if (typeof value === 'string') {
          data[key] = value;
        }
      }

      let existingImages = [];
      if (data.existingImages) {
        existingImages = data.existingImages.split(',').map(s => s.trim()).filter(Boolean);
      }
      data.images = [...existingImages, ...files];
    } else {
      data = await request.json();
    }

    const updated = await storage.updateProduct(params.id, data);
    if (!updated) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ message: 'Product updated successfully', product: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const auth = verifyAdminToken(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const deleted = await storage.deleteProduct(params.id);
    if (!deleted) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ message: 'Product deleted successfully', product: deleted });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
