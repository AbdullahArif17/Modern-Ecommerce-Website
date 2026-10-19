import { getProductsByCategory } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/ProductCard'
import { Product } from '@/lib/products'

interface Props {
  params: Promise<{
    slug: string
  }>
}

const categoryTitles: Record<string, string> = {
  'smart-watches': 'Smart Watches',
  'earbuds': 'Earbuds',
  'headphones': 'Headphones',
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const products: Product[] = await getProductsByCategory(slug)

  if (!products) return notFound()

  const categoryTitle = categoryTitles[slug] || slug.replaceAll('-', ' ')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-4 py-12 md:py-16 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary border border-border mb-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold capitalize tracking-tight text-foreground">
            {categoryTitle}
          </h1>
          <p className="text-muted-foreground mt-4">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        {products.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg">No products found in this category.</p>
            <a href="/products" className="text-primary mt-4 inline-block hover:underline">
              Browse all products →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
