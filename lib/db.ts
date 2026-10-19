import { neon } from '@neondatabase/serverless';
import { Product, Category } from './products';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('DATABASE_URL is not set in environment variables.');
}

export const sql = neon(databaseUrl || '');

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
  try {
    const rows = await sql`
      SELECT * FROM products 
      WHERE is_active = true 
      ORDER BY sort_order ASC, created_at DESC
    `;
    return rows.map(formatProductRow);
  } catch (error) {
    console.error('[Neon dbGetProducts error]:', error);
    return [];
  }
}

export async function dbGetAllProductsAdmin(): Promise<Product[]> {
  try {
    const rows = await sql`
      SELECT * FROM products 
      ORDER BY sort_order ASC, created_at DESC
    `;
    return rows.map(formatProductRow);
  } catch (error) {
    console.error('[Neon dbGetAllProductsAdmin error]:', error);
    return [];
  }
}

export async function dbGetFeaturedProducts(): Promise<Product[]> {
  try {
    const rows = await sql`
      SELECT * FROM products 
      WHERE featured = true AND is_active = true 
      ORDER BY sort_order ASC, created_at DESC
    `;
    return rows.map(formatProductRow);
  } catch (error) {
    console.error('[Neon dbGetFeaturedProducts error]:', error);
    return [];
  }
}

export async function dbGetProductBySlug(slug: string): Promise<Product | null> {
  try {
    const rows = await sql`
      SELECT * FROM products 
      WHERE (slug = ${slug} OR id = ${slug}) 
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    return formatProductRow(rows[0]);
  } catch (error) {
    console.error('[Neon dbGetProductBySlug error]:', error);
    return null;
  }
}

export async function dbGetProductsByCategory(categorySlug: string): Promise<Product[]> {
  try {
    const rows = await sql`
      SELECT * FROM products 
      WHERE (category_slug = ${categorySlug} OR category = ${categorySlug}) AND is_active = true 
      ORDER BY sort_order ASC, created_at DESC
    `;
    return rows.map(formatProductRow);
  } catch (error) {
    console.error('[Neon dbGetProductsByCategory error]:', error);
    return [];
  }
}

export async function dbGetCategories(): Promise<Category[]> {
  try {
    const rows = await sql`
      SELECT * FROM categories 
      ORDER BY sort_order ASC, created_at ASC
    `;
    return rows.map(formatCategoryRow);
  } catch (error) {
    console.error('[Neon dbGetCategories error]:', error);
    return [];
  }
}

export async function dbGetHeroCategories(): Promise<Category[]> {
  try {
    const rows = await sql`
      SELECT * FROM categories 
      WHERE show_in_hero = true 
      ORDER BY sort_order ASC, created_at ASC
    `;
    return rows.map(formatCategoryRow);
  } catch (error) {
    console.error('[Neon dbGetHeroCategories error]:', error);
    return [];
  }
}
