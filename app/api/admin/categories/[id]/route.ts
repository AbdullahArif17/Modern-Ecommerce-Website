import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { sql, formatCategoryRow } from '@/lib/db';
import { isAuthenticated } from '@/lib/admin-auth';

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
    const { title, slug, description, image, sortOrder, showInHero } = body;

    const oldCat = await sql`SELECT id, title, slug FROM categories WHERE id = ${id} OR slug = ${id} LIMIT 1`;
    if (oldCat.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const catId = oldCat[0].id;
    const prevSlug = oldCat[0].slug;
    const prevTitle = oldCat[0].title;

    const result = await sql`
      UPDATE categories SET
        title = COALESCE(${title}, title),
        slug = COALESCE(${slug}, slug),
        description = COALESCE(${description}, description),
        image = COALESCE(${image}, image),
        sort_order = COALESCE(${sortOrder !== undefined ? Number(sortOrder) : null}, sort_order),
        show_in_hero = COALESCE(${showInHero !== undefined ? Boolean(showInHero) : null}, show_in_hero),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${catId}
      RETURNING *
    `;

    // Cascade rename to products
    const newTitle = title || prevTitle;
    const newSlug = slug || prevSlug;
    if (newTitle !== prevTitle || newSlug !== prevSlug) {
      await sql`
        UPDATE products SET
          category = ${newTitle},
          category_slug = ${newSlug}
        WHERE category_id = ${catId} OR category_slug = ${prevSlug} OR category = ${prevTitle}
      `;
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/products');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({ success: true, category: formatCategoryRow(result[0]) });
  } catch (error: any) {
    console.error('[Admin PUT Category Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 });
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
    const oldCat = await sql`SELECT id, slug FROM categories WHERE id = ${id} OR slug = ${id} LIMIT 1`;
    if (oldCat.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const catId = oldCat[0].id;
    const catSlug = oldCat[0].slug;

    // Safely reassign any products in this category to General
    await sql`
      UPDATE products SET
        category = 'General',
        category_slug = 'general',
        category_id = NULL
      WHERE category_id = ${catId} OR category_slug = ${catSlug}
    `;

    await sql`DELETE FROM categories WHERE id = ${catId}`;

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/products');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({ success: true, id: catId });
  } catch (error: any) {
    console.error('[Admin DELETE Category Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 });
  }
}
