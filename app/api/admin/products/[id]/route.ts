import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const rows = await sql`SELECT * FROM products WHERE id = ${id} OR slug = ${id} LIMIT 1`;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ product: formatProductRow(rows[0]) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const {
      title,
      name,
      slug,
      brand,
      sku,
      price,
      discountPrice,
      description,
      longDescription,
      categoryId,
      category,
      categorySlug,
      images,
      image,
      videoUrl,
      featured,
      isActive,
      sortOrder,
      stockQuantity,
      stockStatus,
      features,
      specifications,
      whatsInTheBox,
      warranty,
      weight,
      colors,
      sizes,
      productTags,
      metaTitle,
      metaDescription,
      costPrice,
      vendorId,
      vendorName,
    } = body;

    const primaryImage = image || (Array.isArray(images) && images.length > 0 ? (typeof images[0] === 'string' ? images[0] : images[0]?.url) : '/placeholder.jpg');

    const result = await sql`
      UPDATE products SET
        title = COALESCE(${title}, title),
        name = COALESCE(${name || title}, name),
        slug = COALESCE(${slug}, slug),
        brand = COALESCE(${brand}, brand),
        sku = COALESCE(${sku}, sku),
        price = COALESCE(${price !== undefined ? Number(price) : null}, price),
        discount_price = ${discountPrice !== undefined ? (discountPrice ? Number(discountPrice) : null) : null},
        cost_price = ${costPrice !== undefined ? (costPrice ? Number(costPrice) : null) : null},
        vendor_id = ${vendorId !== undefined ? vendorId : null},
        vendor_name = ${vendorName !== undefined ? vendorName : null},
        description = COALESCE(${description}, description),
        long_description = ${longDescription ? JSON.stringify(longDescription) : null}::jsonb,
        category_id = COALESCE(${categoryId}, category_id),
        category = COALESCE(${category}, category),
        category_slug = COALESCE(${categorySlug || (category ? slugify(category) : null)}, category_slug),
        images = COALESCE(${images ? JSON.stringify(images) : null}::jsonb, images),
        image = COALESCE(${primaryImage}, image),
        video_url = ${videoUrl !== undefined ? videoUrl : null},
        featured = COALESCE(${featured !== undefined ? Boolean(featured) : null}, featured),
        is_active = COALESCE(${isActive !== undefined ? Boolean(isActive) : null}, is_active),
        sort_order = COALESCE(${sortOrder !== undefined ? Number(sortOrder) : null}, sort_order),
        stock_quantity = COALESCE(${stockQuantity !== undefined ? Number(stockQuantity) : null}, stock_quantity),
        stock_status = COALESCE(${stockStatus}, stock_status),
        features = COALESCE(${features ? JSON.stringify(features) : null}::jsonb, features),
        specifications = COALESCE(${specifications ? JSON.stringify(specifications) : null}::jsonb, specifications),
        whats_in_the_box = COALESCE(${whatsInTheBox ? JSON.stringify(whatsInTheBox) : null}::jsonb, whats_in_the_box),
        warranty = COALESCE(${warranty}, warranty),
        weight = ${weight !== undefined ? (weight ? Number(weight) : null) : null},
        colors = COALESCE(${colors ? JSON.stringify(colors) : null}::jsonb, colors),
        sizes = COALESCE(${sizes ? JSON.stringify(sizes) : null}::jsonb, sizes),
        product_tags = COALESCE(${productTags ? JSON.stringify(productTags) : null}::jsonb, product_tags),
        meta_title = COALESCE(${metaTitle}, meta_title),
        meta_description = COALESCE(${metaDescription}, meta_description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} OR slug = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/products');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({
      success: true,
      product: formatProductRow(result[0]),
    });
  } catch (error: any) {
    console.error('[Admin PUT Product Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const result = await sql`DELETE FROM products WHERE id = ${id} OR slug = ${id} RETURNING id`;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/products');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('[Admin DELETE Product Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
