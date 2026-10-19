import { NextResponse } from 'next/server';
import { sql, formatProductRow } from '@/lib/db';
import { isAuthenticated } from '@/lib/admin-auth';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';

    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];
    let paramIdx = 1;

    if (search) {
      query += ` AND (title ILIKE $${paramIdx} OR brand ILIKE $${paramIdx} OR sku ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    if (category && category !== 'all') {
      query += ` AND (category_slug = $${paramIdx} OR category = $${paramIdx})`;
      params.push(category);
      paramIdx++;
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        query += ` AND is_active = true`;
      } else if (status === 'inactive') {
        query += ` AND is_active = false`;
      } else if (status === 'featured') {
        query += ` AND featured = true`;
      } else {
        query += ` AND stock_status = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }
    }

    query += ' ORDER BY sort_order ASC, created_at DESC';

    const rows = await sql.query(query, params);
    const products = rows.map(formatProductRow);

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('[Admin GET Products Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      name = title,
      slug: customSlug,
      brand = 'JTech',
      sku = '',
      price = 0,
      discountPrice,
      description = '',
      longDescription,
      categoryId,
      category = 'General',
      categorySlug = '',
      images = [],
      image,
      videoUrl,
      featured = false,
      isActive = true,
      sortOrder = 0,
      stockQuantity = 100,
      stockStatus = 'in_stock',
      features = [],
      specifications = [],
      whatsInTheBox = [],
      warranty = '1 Year Official Warranty',
      weight,
      colors = [],
      sizes = [],
      productTags = [],
      metaTitle,
      metaDescription,
    } = body;

    if (!title || price === undefined) {
      return NextResponse.json({ error: 'Title and price are required.' }, { status: 400 });
    }

    const baseSlug = customSlug ? slugify(customSlug) : slugify(title);
    const id = `prod-${baseSlug}-${Date.now().toString().slice(-4)}`;
    const finalSlug = baseSlug;

    // Check slug collision
    const existing = await sql`SELECT id FROM products WHERE slug = ${finalSlug} LIMIT 1`;
    const uniqueSlug = existing.length > 0 ? `${finalSlug}-${Date.now().toString().slice(-4)}` : finalSlug;

    const primaryImage = image || (images.length > 0 ? (typeof images[0] === 'string' ? images[0] : images[0]?.url) : '/placeholder.jpg');

    const result = await sql`
      INSERT INTO products (
        id, title, name, slug, brand, sku, price, discount_price, description, long_description,
        category_id, category, category_slug, images, image, video_url, featured, is_active,
        sort_order, stock_quantity, stock_status, features, specifications, whats_in_the_box,
        warranty, weight, colors, sizes, product_tags, meta_title, meta_description
      ) VALUES (
        ${id}, ${title}, ${name || title}, ${uniqueSlug}, ${brand}, ${sku}, ${price}, 
        ${discountPrice ? Number(discountPrice) : null}, ${description}, 
        ${longDescription ? JSON.stringify(longDescription) : null}::jsonb,
        ${categoryId || null}, ${category}, ${categorySlug || slugify(category)},
        ${JSON.stringify(images)}::jsonb, ${primaryImage}, ${videoUrl || null}, 
        ${Boolean(featured)}, ${Boolean(isActive)}, ${Number(sortOrder) || 0}, 
        ${Number(stockQuantity) || 0}, ${stockStatus}, 
        ${JSON.stringify(features)}::jsonb, ${JSON.stringify(specifications)}::jsonb, 
        ${JSON.stringify(whatsInTheBox)}::jsonb, ${warranty}, ${weight ? Number(weight) : null}, 
        ${JSON.stringify(colors)}::jsonb, ${JSON.stringify(sizes)}::jsonb, 
        ${JSON.stringify(productTags)}::jsonb, ${metaTitle || title}, ${metaDescription || description}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      product: formatProductRow(result[0]),
    });
  } catch (error: any) {
    console.error('[Admin POST Product Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
