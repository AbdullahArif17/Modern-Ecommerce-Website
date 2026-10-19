import { getFeaturedProducts, getProducts, getCategories, getHeroCategories } from '@/lib/sanity';
import { Product, Category } from '@/lib/products';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedSection } from '@/components/FeaturedSection';
import { BenefitsSection } from '@/components/BenefitsSection';
import { NewsletterSection } from '@/components/NewsletterSection';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  let featuredProducts: Product[] = await getFeaturedProducts();
  const categories: Category[] = await getHeroCategories();
  
  // If no featured products, show first 3 products instead
  if (featuredProducts.length === 0) {
    const allProducts = await getProducts();
    featuredProducts = allProducts.slice(0, 3);
  }

  return (
    <div className="flex flex-col">
      <HeroSection categories={categories} />
      <FeaturedSection products={featuredProducts} />
      <BenefitsSection />
      <NewsletterSection />
    </div>
  );
}
