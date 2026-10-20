import { neon } from '@neondatabase/serverless';
import { Product, Category, Vendor, StoreTransaction, products as fallbackProducts } from './products';

const databaseUrl = process.env.DATABASE_URL;

export const hasDatabaseUrl = Boolean(databaseUrl && databaseUrl.trim() !== '');

if (!hasDatabaseUrl) {
  console.warn('DATABASE_URL is not set in environment variables. Falling back to static mock catalog.');
}

// Only call neon() if databaseUrl is valid to prevent build-time crashes
export const sql = hasDatabaseUrl 
  ? neon(databaseUrl!) 
  : ((..._args: any[]) => Promise.resolve([])) as any;

// Helper to format a DB product row into the frontend Product shape
export function formatProductRow(row: any): Product {
  if (!row) return row;

  let images: any[] = [];
  if (Array.isArray(row.images)) {
    images = row.images;
  } else if (typeof row.images === 'string') {
    try {
      images = JSON.parse(row.images);
    } catch {
      images = [row.images];
    }
  } else if (row.image) {
    images = [row.image];
  }

  // Fallback single image
  const primaryImage = images.length > 0 ? (typeof images[0] === 'string' ? images[0] : images[0]?.asset?.url || images[0]) : (row.image || '/placeholder.jpg');

  let features: string[] = [];
  if (Array.isArray(row.features)) {
    features = row.features;
  } else if (typeof row.features === 'string') {
    try {
      features = JSON.parse(row.features);
    } catch {
      features = [];
    }
  }

  let specifications: any[] = [];
  if (Array.isArray(row.specifications)) {
    specifications = row.specifications;
  } else if (typeof row.specifications === 'string') {
    try {
      specifications = JSON.parse(row.specifications);
    } catch {
      specifications = [];
    }
  }

  let whatsInTheBox: string[] = [];
  if (Array.isArray(row.whats_in_the_box)) {
    whatsInTheBox = row.whats_in_the_box;
  } else if (typeof row.whats_in_the_box === 'string') {
    try {
      whatsInTheBox = JSON.parse(row.whats_in_the_box);
    } catch {
      whatsInTheBox = [];
    }
  }

  let colors: any[] = [];
  if (Array.isArray(row.colors)) {
    colors = row.colors;
  } else if (typeof row.colors === 'string') {
    try {
      colors = JSON.parse(row.colors);
    } catch {
      colors = [];
    }
  }

  let sizes: string[] = [];
  if (Array.isArray(row.sizes)) {
    sizes = row.sizes;
  } else if (typeof row.sizes === 'string') {
    try {
      sizes = JSON.parse(row.sizes);
    } catch {
      sizes = [];
    }
  }

  let productTags: string[] = [];
  if (Array.isArray(row.product_tags)) {
    productTags = row.product_tags;
  } else if (typeof row.product_tags === 'string') {
    try {
      productTags = JSON.parse(row.product_tags);
    } catch {
      productTags = [];
    }
  }

  return {
    _id: row.id,
    id: row.id,
    title: row.title || row.name || 'Untitled',
    name: row.name || row.title || 'Untitled',
    slug: row.slug,
    brand: row.brand || '',
    sku: row.sku || '',
    price: Number(row.price) || 0,
    discountPrice: row.discount_price ? Number(row.discount_price) : undefined,
    description: row.description || '',
    longDescription: row.long_description || undefined,
    category: row.category || '',
    categorySlug: row.category_slug || '',
    images,
    image: primaryImage,
    videoUrl: row.video_url || undefined,
    featured: Boolean(row.featured),
    isActive: row.is_active !== false,
    sortOrder: Number(row.sort_order) || 0,
    stockQuantity: Number(row.stock_quantity) || 0,
    stockStatus: row.stock_status || 'in_stock',
    features,
    specifications,
    whatsInTheBox,
    warranty: row.warranty || '1 Year Official Warranty',
    weight: row.weight ? Number(row.weight) : undefined,
    costPrice: row.cost_price ? Number(row.cost_price) : undefined,
    vendorId: row.vendor_id || undefined,
    vendorName: row.vendor_name || undefined,
    colors,
    sizes,
    rating: row.rating ? Number(row.rating) : 5.0,
    reviewCount: Number(row.review_count) || 0,
    productTags,
    metaTitle: row.meta_title || row.title,
    metaDescription: row.meta_description || row.description,
    _createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export function formatCategoryRow(row: any): Category {
  return {
    _id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description || '',
    image: row.image || '/placeholder.jpg',
    sortOrder: Number(row.sort_order) || 0,
    showInHero: Boolean(row.show_in_hero),
  };
}

export function formatVendorRow(row: any): Vendor {
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    company: row.company || '',
    contactPerson: row.contact_person || '',
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || '',
    paymentTerms: row.payment_terms || 'Net 30',
    leadTimeDays: Number(row.lead_time_days) || 7,
    balanceDue: Number(row.balance_due) || 0,
    notes: row.notes || '',
    isActive: row.is_active !== false,
    productCount: Number(row.product_count) || 0,
    totalSuppliedValue: Number(row.total_supplied_value) || 0,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export function formatTransactionRow(row: any): StoreTransaction {
  return {
    _id: row.id,
    id: row.id,
    type: row.type || 'sale',
    title: row.title || 'Transaction',
    amount: Number(row.amount) || 0,
    category: row.category || 'General',
    vendorId: row.vendor_id || undefined,
    vendorName: row.vendor_name || undefined,
    productId: row.product_id || undefined,
    quantity: Number(row.quantity) || 1,
    customerName: row.customer_name || undefined,
    paymentMethod: row.payment_method || 'Cash / COD',
    status: row.status || 'completed',
    notes: row.notes || '',
    transactionDate: row.transaction_date ? new Date(row.transaction_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

// ──────────────── DATABASE QUERIES ────────────────

export async function dbGetProducts(): Promise<Product[]> {
  if (!hasDatabaseUrl) {
    return fallbackProducts;
  }
  try {
    const rows = await sql`
      SELECT * FROM products 
      WHERE is_active = true 
      ORDER BY sort_order ASC, created_at DESC
    `;
    return rows.length > 0 ? rows.map(formatProductRow) : fallbackProducts;
  } catch (error) {
    console.error('[Neon dbGetProducts error]:', error);
    return fallbackProducts;
  }
}

export async function dbGetAllProductsAdmin(): Promise<Product[]> {
  if (!hasDatabaseUrl) {
    return fallbackProducts;
  }
  try {
    const rows = await sql`
      SELECT * FROM products 
      ORDER BY sort_order ASC, created_at DESC
    `;
    return rows.length > 0 ? rows.map(formatProductRow) : fallbackProducts;
  } catch (error) {
    console.error('[Neon dbGetAllProductsAdmin error]:', error);
    return fallbackProducts;
  }
}

export async function dbGetFeaturedProducts(): Promise<Product[]> {
  if (!hasDatabaseUrl) {
    return fallbackProducts.slice(0, 3);
  }
  try {
    const rows = await sql`
      SELECT * FROM products 
      WHERE featured = true AND is_active = true 
      ORDER BY sort_order ASC, created_at DESC
    `;
    if (rows.length > 0) {
      return rows.map(formatProductRow);
    }
    // Fallback if no products are explicitly marked featured: get first active products
    const fallbackRows = await sql`
      SELECT * FROM products 
      WHERE is_active = true 
      ORDER BY sort_order ASC, created_at DESC 
      LIMIT 6
    `;
    return fallbackRows.length > 0 ? fallbackRows.map(formatProductRow) : fallbackProducts.slice(0, 3);
  } catch (error) {
    console.error('[Neon dbGetFeaturedProducts error]:', error);
    return fallbackProducts.slice(0, 3);
  }
}

export async function dbGetProductBySlug(slug: string): Promise<Product | null> {
  if (!hasDatabaseUrl) {
    const s = slug.toLowerCase();
    return fallbackProducts.find(p => p.slug.toLowerCase() === s || (p.id && p.id.toLowerCase() === s)) || null;
  }
  try {
    const rows = await sql`
      SELECT * FROM products 
      WHERE (LOWER(slug) = LOWER(${slug}) OR id = ${slug}) 
      LIMIT 1
    `;
    if (rows.length === 0) {
      const s = slug.toLowerCase();
      return fallbackProducts.find(p => p.slug.toLowerCase() === s || (p.id && p.id.toLowerCase() === s)) || null;
    }
    return formatProductRow(rows[0]);
  } catch (error) {
    console.error('[Neon dbGetProductBySlug error]:', error);
    const s = slug.toLowerCase();
    return fallbackProducts.find(p => p.slug.toLowerCase() === s || (p.id && p.id.toLowerCase() === s)) || null;
  }
}

export async function dbGetProductsByCategory(categorySlug: string): Promise<Product[]> {
  if (!hasDatabaseUrl) {
    const target = categorySlug.toLowerCase().trim();
    return fallbackProducts.filter(p => {
      const pSlug = (p.categorySlug || p.category || '').toLowerCase().trim();
      return pSlug === target || p.category.toLowerCase().trim() === target;
    });
  }
  try {
    const rows = await sql`
      SELECT * FROM products 
      WHERE (
        LOWER(category_slug) = LOWER(${categorySlug}) 
        OR LOWER(category) = LOWER(${categorySlug})
        OR LOWER(REPLACE(category, ' ', '-')) = LOWER(${categorySlug})
      ) AND is_active = true 
      ORDER BY sort_order ASC, created_at DESC
    `;
    if (rows.length > 0) return rows.map(formatProductRow);

    const target = categorySlug.toLowerCase().trim();
    return fallbackProducts.filter(p => {
      const pSlug = (p.categorySlug || p.category || '').toLowerCase().trim();
      return pSlug === target || p.category.toLowerCase().trim() === target;
    });
  } catch (error) {
    console.error('[Neon dbGetProductsByCategory error]:', error);
    const target = categorySlug.toLowerCase().trim();
    return fallbackProducts.filter(p => {
      const pSlug = (p.categorySlug || p.category || '').toLowerCase().trim();
      return pSlug === target || p.category.toLowerCase().trim() === target;
    });
  }
}

export async function dbGetCategories(): Promise<Category[]> {
  const defaultCategories: Category[] = [
    { _id: '022b58e6-34ee-461f-85f3-5308cf22ca60', title: 'MOUSE', slug: 'mouse', image: 'https://cdn.sanity.io/images/b5dr6ut1/production/26feec9e53d41817eb411f320033d41fd7f81ed4-1080x1080.jpg', showInHero: true, sortOrder: 1 },
    { _id: '66b709e1-0d37-4e78-82bc-781e69dbd6a4', title: 'Accessories', slug: 'accessories', image: 'https://cdn.sanity.io/images/b5dr6ut1/production/2ef0939d338611c04584df29503cbd3dd7010d84-1200x1200.jpg', showInHero: true, sortOrder: 0 },
  ];

  if (!hasDatabaseUrl) {
    return defaultCategories;
  }
  try {
    const rows = await sql`
      SELECT * FROM categories 
      ORDER BY sort_order ASC, created_at ASC
    `;
    return rows.length > 0 ? rows.map(formatCategoryRow) : defaultCategories;
  } catch (error) {
    console.error('[Neon dbGetCategories error]:', error);
    return defaultCategories;
  }
}

export async function dbGetHeroCategories(): Promise<Category[]> {
  const defaultHeroCategories: Category[] = [
    { _id: '022b58e6-34ee-461f-85f3-5308cf22ca60', title: 'MOUSE', slug: 'mouse', image: 'https://cdn.sanity.io/images/b5dr6ut1/production/26feec9e53d41817eb411f320033d41fd7f81ed4-1080x1080.jpg', showInHero: true, sortOrder: 1 },
    { _id: '66b709e1-0d37-4e78-82bc-781e69dbd6a4', title: 'Accessories', slug: 'accessories', image: 'https://cdn.sanity.io/images/b5dr6ut1/production/2ef0939d338611c04584df29503cbd3dd7010d84-1200x1200.jpg', showInHero: true, sortOrder: 0 },
  ];

  if (!hasDatabaseUrl) {
    return defaultHeroCategories;
  }
  try {
    const rows = await sql`
      SELECT * FROM categories 
      WHERE show_in_hero = true 
      ORDER BY sort_order ASC, created_at ASC
    `;
    return rows.length > 0 ? rows.map(formatCategoryRow) : defaultHeroCategories;
  } catch (error) {
    console.error('[Neon dbGetHeroCategories error]:', error);
    return defaultHeroCategories;
  }
}

export async function dbGetVendors(): Promise<Vendor[]> {
  if (!hasDatabaseUrl) return [];
  try {
    const rows = await sql`
      SELECT 
        v.*,
        COUNT(p.id)::int as product_count,
        COALESCE(SUM(p.price * p.stock_quantity), 0)::numeric as total_supplied_value
      FROM vendors v
      LEFT JOIN products p ON p.vendor_id = v.id
      GROUP BY v.id
      ORDER BY v.name ASC
    `;
    return rows.map(formatVendorRow);
  } catch (error) {
    console.error('[Neon dbGetVendors error]:', error);
    return [];
  }
}

export async function dbGetStoreTransactions(limit = 100): Promise<StoreTransaction[]> {
  if (!hasDatabaseUrl) return [];
  try {
    const rows = await sql`
      SELECT * FROM store_transactions
      ORDER BY transaction_date DESC, created_at DESC
      LIMIT ${limit}
    `;
    return rows.map(formatTransactionRow);
  } catch (error) {
    console.error('[Neon dbGetStoreTransactions error]:', error);
    return [];
  }
}

export async function dbGetStoreMetrics() {
  if (!hasDatabaseUrl) {
    return {
      retailInventoryValue: 0,
      costInventoryValue: 0,
      potentialProfit: 0,
      grossMarginPercent: 0,
      totalUnitsInStock: 0,
      totalSalesRevenue: 0,
      totalExpenses: 0,
      totalPurchases: 0,
      netProfit: 0,
      lowStockReplenishmentCost: 0,
    };
  }

  try {
    const [invRows, txRows] = await Promise.all([
      sql`
        SELECT 
          COALESCE(SUM(price * stock_quantity), 0)::numeric as retail_value,
          COALESCE(SUM(COALESCE(cost_price, price * 0.7) * stock_quantity), 0)::numeric as cost_value,
          COALESCE(SUM(stock_quantity), 0)::int as total_units,
          COALESCE(SUM(CASE WHEN stock_quantity <= 10 THEN (15 - stock_quantity) * COALESCE(cost_price, price * 0.7) ELSE 0 END), 0)::numeric as replenishment_cost
        FROM products
      `,
      sql`
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'sale' AND status = 'completed' THEN amount ELSE 0 END), 0)::numeric as total_sales,
          COALESCE(SUM(CASE WHEN type = 'expense' AND status = 'completed' THEN amount ELSE 0 END), 0)::numeric as total_expenses,
          COALESCE(SUM(CASE WHEN type = 'purchase_order' AND status = 'completed' THEN amount ELSE 0 END), 0)::numeric as total_purchases
        FROM store_transactions
      `
    ]);

    const retailVal = Number(invRows[0]?.retail_value) || 0;
    const costVal = Number(invRows[0]?.cost_value) || 0;
    const potentialProfit = Math.max(0, retailVal - costVal);
    const grossMarginPercent = retailVal > 0 ? ((potentialProfit / retailVal) * 100) : 0;
    const totalUnits = Number(invRows[0]?.total_units) || 0;
    const replenishmentCost = Number(invRows[0]?.replenishment_cost) || 0;

    const sales = Number(txRows[0]?.total_sales) || 0;
    const expenses = Number(txRows[0]?.total_expenses) || 0;
    const purchases = Number(txRows[0]?.total_purchases) || 0;
    const netProfit = sales - expenses;

    return {
      retailInventoryValue: retailVal,
      costInventoryValue: costVal,
      potentialProfit,
      grossMarginPercent: Math.round(grossMarginPercent * 10) / 10,
      totalUnitsInStock: totalUnits,
      totalSalesRevenue: sales,
      totalExpenses: expenses,
      totalPurchases: purchases,
      netProfit,
      lowStockReplenishmentCost: replenishmentCost,
    };
  } catch (error) {
    console.error('[Neon dbGetStoreMetrics error]:', error);
    return {
      retailInventoryValue: 0,
      costInventoryValue: 0,
      potentialProfit: 0,
      grossMarginPercent: 0,
      totalUnitsInStock: 0,
      totalSalesRevenue: 0,
      totalExpenses: 0,
      totalPurchases: 0,
      netProfit: 0,
      lowStockReplenishmentCost: 0,
    };
  }
}
