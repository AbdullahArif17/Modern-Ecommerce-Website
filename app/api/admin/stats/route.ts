import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { isAuthenticated } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const statsQuery = await sql`
      SELECT 
        COUNT(*)::int as total_products,
        COUNT(CASE WHEN is_active = true THEN 1 END)::int as active_products,
        COUNT(CASE WHEN stock_quantity = 0 OR stock_status = 'out_of_stock' THEN 1 END)::int as out_of_stock,
        COUNT(CASE WHEN stock_quantity > 0 AND stock_quantity <= 10 THEN 1 END)::int as low_stock,
        COALESCE(SUM(price * stock_quantity), 0)::numeric as total_inventory_value
      FROM products
    `;

    const catQuery = await sql`SELECT COUNT(*)::int as total_categories FROM categories`;

    const stats = {
      totalProducts: statsQuery[0]?.total_products || 0,
      activeProducts: statsQuery[0]?.active_products || 0,
      outOfStock: statsQuery[0]?.out_of_stock || 0,
      lowStock: statsQuery[0]?.low_stock || 0,
      totalInventoryValue: Number(statsQuery[0]?.total_inventory_value) || 0,
      totalCategories: catQuery[0]?.total_categories || 0,
    };

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('[Admin Stats API Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch statistics' }, { status: 500 });
  }
}
