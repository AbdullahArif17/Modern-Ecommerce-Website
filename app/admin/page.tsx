import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/admin-auth';
import { 
  dbGetAllProductsAdmin, 
  dbGetCategories, 
  dbGetVendors, 
  dbGetStoreTransactions, 
  dbGetStoreMetrics, 
  sql 
} from '@/lib/db';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect('/admin/login');
  }

  // Fetch initial data from Neon in parallel
  const [products, categories, vendors, transactions, storeMetrics, statsRows] = await Promise.all([
    dbGetAllProductsAdmin(),
    dbGetCategories(),
    dbGetVendors(),
    dbGetStoreTransactions(100),
    dbGetStoreMetrics(),
    sql`
      SELECT 
        COUNT(*)::int as total_products,
        COUNT(CASE WHEN is_active = true THEN 1 END)::int as active_products,
        COUNT(CASE WHEN stock_quantity = 0 OR stock_status = 'out_of_stock' THEN 1 END)::int as out_of_stock,
        COUNT(CASE WHEN stock_quantity > 0 AND stock_quantity <= 10 THEN 1 END)::int as low_stock,
        COALESCE(SUM(price * stock_quantity), 0)::numeric as total_inventory_value
      FROM products
    `.catch(() => [{ total_products: 0, active_products: 0, out_of_stock: 0, low_stock: 0, total_inventory_value: 0 }]),
  ]);

  const initialStats = {
    totalProducts: statsRows[0]?.total_products || products.length,
    activeProducts: statsRows[0]?.active_products || products.filter(p => p.isActive !== false).length,
    outOfStock: statsRows[0]?.out_of_stock || 0,
    lowStock: statsRows[0]?.low_stock || 0,
    totalInventoryValue: Number(statsRows[0]?.total_inventory_value) || 0,
    totalCategories: categories.length,
  };

  return (
    <AdminDashboardClient
      initialProducts={products}
      initialCategories={categories}
      initialStats={initialStats}
      initialVendors={vendors}
      initialTransactions={transactions}
      initialStoreMetrics={storeMetrics}
    />
  );
}
