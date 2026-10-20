import type { Metadata } from 'next';
import { getProducts, getCategories } from '@/lib/sanity';
import { Product, Category } from '@/lib/products';
import ProductsClient from './ProductsClient';

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Explore our complete collection of premium smart watches, wireless earbuds, audio devices, and tech accessories with official warranty and nationwide shipping.',
  openGraph: {
    title: 'All Products | JTech Mart',
    description: 'Explore our complete collection of premium smart watches, wireless earbuds, audio devices, and tech accessories.',
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return <ProductsClient products={products} initialCategories={categories} />;
}

