import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { sql, formatCategoryRow } from '@/lib/db';
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

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = await sql`
      SELECT c.*, COUNT(p.id) as product_count 
      FROM categories c 
      LEFT JOIN products p ON p.category_id = c.id OR p.category_slug = c.slug 
      GROUP BY c.id 
      ORDER BY c.sort_order ASC, c.created_at ASC
    `;

    const categories = rows.map((r: any) => ({
      ...formatCategoryRow(r),
      productCount: Number(r.product_count) || 0,
    }));

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('[Admin GET Categories Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, slug: customSlug, description = '', image = '', sortOrder = 0, showInHero = false } = body;

    if (!title) {
      return NextResponse.json({ error: 'Category title is required.' }, { status: 400 });
    }

    const baseSlug = customSlug ? slugify(customSlug) : slugify(title);
    const id = `cat-${baseSlug}`;

    const result = await sql`
      INSERT INTO categories (id, title, slug, description, image, sort_order, show_in_hero)
      VALUES (${id}, ${title}, ${baseSlug}, ${description}, ${image || '/placeholder.jpg'}, ${Number(sortOrder) || 0}, ${Boolean(showInHero)})
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        image = EXCLUDED.image,
        sort_order = EXCLUDED.sort_order,
        show_in_hero = EXCLUDED.show_in_hero
      RETURNING *
    `;

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/products');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({
      success: true,
      category: formatCategoryRow(result[0]),
    });
  } catch (error: any) {
    console.error('[Admin POST Category Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}
