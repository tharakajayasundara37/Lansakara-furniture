import { NextResponse } from 'next/server';
import storage from '@/backend/storage';
import { verifyAdminToken } from '@/backend/authHelper';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const { products, total } = await storage.getProducts(query);
    const limit = parseInt(query.limit) || 50;
    const page = parseInt(query.page) || 1;
    return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
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

    if (!data.name || !data.price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }
    data.description = data.description || data.shortDescription || data.name;

    const product = await storage.createProduct(data);
    return NextResponse.json({ message: 'Product created successfully', product }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
