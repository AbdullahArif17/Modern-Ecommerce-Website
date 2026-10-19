import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import { 
  dbGetProducts, 
  dbGetFeaturedProducts, 
  dbGetProductBySlug, 
  dbGetProductsByCategory, 
  dbGetCategories, 
  dbGetHeroCategories 
} from './db';

const rawProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'jtech-mart-prod';
export const projectId = /^[a-z0-9-]+$/i.test(rawProjectId) ? rawProjectId : 'jtech-mart-prod';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = '2023-01-01';

export const client = createClient({
  projectId: projectId || 'demo',
  dataset,
  apiVersion,
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  if (!source) {
    return { url: () => '/placeholder.jpg' };
  }
  if (typeof source === 'string') {
    return { url: () => source };
  }
  if (source.url && typeof source.url === 'string') {
    return { url: () => source.url };
  }
  if (source.asset?._ref || source._type === 'image') {
    try {
      return builder.image(source);
    } catch {
      return { url: () => '/placeholder.jpg' };
    }
  }
  return { url: () => '/placeholder.jpg' };
}

// Helper function to get image URL from product
export function getProductImageUrl(product: { images?: any[]; image?: any }): string {
  if (product.images && product.images.length > 0 && product.images[0]) {
    const first = product.images[0];
    if (typeof first === 'string') return first;
    if (first.url) return first.url;
    return urlFor(first).url();
  }
  if (product.image) {
    if (typeof product.image === 'string') {
      return product.image;
    }
    return urlFor(product.image).url();
  }
  return '/placeholder.jpg';
}

// ──────────────── FETCH FUNCTIONS (NEON FIRST, SANITY FALLBACK) ────────────────

export async function getProducts() {
  try {
    const products = await dbGetProducts();
    if (products && products.length > 0) return products;
  } catch (error) {
    console.error('[getProducts] Error from Neon:', error);
  }

  // Fallback to Sanity if configured
  if (projectId && projectId !== 'replace_with_your_project_id') {
    try {
      const products = await client.fetch(`*[_type == "product" && isActive != false]`);
      return products || [];
    } catch (e) {
      console.error('[getProducts] Fallback Sanity error:', e);
    }
  }

  return [];
}

export async function getFeaturedProducts() {
  try {
    const products = await dbGetFeaturedProducts();
    if (products && products.length > 0) return products;
  } catch (error) {
    console.error('[getFeaturedProducts] Error from Neon:', error);
  }

  return [];
}

export async function getProduct(slug: string) {
  try {
    const product = await dbGetProductBySlug(slug);
    if (product) return product;
  } catch (error) {
    console.error(`[getProduct] Error from Neon for slug "${slug}":`, error);
  }

  return null;
}

export async function getProductsByCategory(categorySlug: string) {
  try {
    const products = await dbGetProductsByCategory(categorySlug);
    if (products && products.length > 0) return products;
  } catch (error) {
    console.error('[getProductsByCategory] Error from Neon:', error);
  }

  return [];
}

export async function getCategories() {
  try {
    const categories = await dbGetCategories();
    if (categories && categories.length > 0) return categories;
  } catch (error) {
    console.error('[getCategories] Error from Neon:', error);
  }

  return [];
}

export async function getHeroCategories() {
  try {
    const categories = await dbGetHeroCategories();
    if (categories && categories.length > 0) return categories;
  } catch (error) {
    console.error('[getHeroCategories] Error from Neon:', error);
  }

  return [];
}
