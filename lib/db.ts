import { neon } from '@neondatabase/serverless';
import { Product, Category, products as fallbackProducts } from './products';

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
