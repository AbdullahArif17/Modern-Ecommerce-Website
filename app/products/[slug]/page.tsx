import { getProduct, getProductImageUrl } from '@/lib/sanity';
import type { Metadata } from 'next';
import { Product } from '@/lib/products';
import Link from 'next/link';
import { Check, Truck, Shield, ArrowLeft, Star, Package, Palette, Ruler, Weight, Tag, Info, Box } from 'lucide-react';
import { AddToCartButton } from '@/components/AddToCartButton';
import { ProductImageGallery } from '@/components/ProductImageGallery';
import { formatPrice } from '@/lib/utils';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const title = product.metaTitle || product.title || product.name || 'Product';
  const description = product.metaDescription || product.description || `Shop ${title} at JTech Mart`;
  const imageUrl = getProductImageUrl(product);

  return {
    title,
    description,
    openGraph: { title, description, images: [imageUrl], type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="p-8 rounded-[2.5rem] bg-secondary/30 max-w-md w-full border border-border/50 backdrop-blur-sm shadow-xl">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-primary mb-3">Product Missing</h1>
          <p className="text-muted-foreground mb-8 text-lg font-medium">
            We couldn't find the product you're looking for. It may have been updated or moved.
          </p>
          <Link href="/products" className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-primary/20">
            <ArrowLeft className="w-5 h-5" /> Back to Collection
          </Link>
        </div>
      </div>
    );
  }

  const stockBadge = {
    in_stock: { label: '✅ In Stock', color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
    low_stock: { label: '⚠️ Low Stock', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
    out_of_stock: { label: '❌ Out of Stock', color: 'text-red-600 bg-red-50 dark:bg-red-950/30' },
    pre_order: { label: '📦 Pre-Order', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
  }[product.stockStatus || 'in_stock'] || { label: '✅ In Stock', color: 'text-green-600 bg-green-50' };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-secondary/30 border-b border-border">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
            {(() => {
              const catTitle = typeof product.category === 'string' ? product.category : (typeof (product.category as any)?.title === 'string' ? (product.category as any).title : '');
              if (!catTitle) return null;
              return (
                <>
                  <span>/</span>
                  <span className="hover:text-primary transition-colors">{catTitle}</span>
                </>
              );
            })()}
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.title || product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-start">

          {/* Product Image Gallery */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:sticky lg:top-24">
            <ProductImageGallery product={product} />
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-5 sm:gap-6">

            {/* Header: Brand + Tags */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {product.brand && (
                  <span className="text-xs font-bold uppercase tracking-widest text-primary/60">{product.brand}</span>
                )}
                <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest px-2 py-0.5 bg-secondary rounded-full">
                  {typeof product.category === 'string' ? product.category.replace('-', ' ') : (typeof (product.category as any)?.title === 'string' ? (product.category as any).title : 'Uncategorized')}
                </span>
                {product.productTags?.map((tag: string) => (
                  <span
                    key={tag}
                    className={`px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[11px] font-bold rounded-full ${
                      tag === 'bestseller' ? 'bg-orange-500 text-white' :
                      tag === 'new' ? 'bg-green-500 text-white' :
                      tag === 'limited' ? 'bg-red-500 text-white' :
                      tag === 'hot' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
                      tag === 'toprated' ? 'bg-yellow-500 text-white' :
                      tag === 'freegift' ? 'bg-purple-500 text-white' :
                      'bg-primary/10 text-primary'
                    }`}
                  >
                    {tag === 'bestseller' ? '🔥 Best Seller' :
                     tag === 'new' ? '✨ New' :
                     tag === 'limited' ? '⏰ Limited' :
                     tag === 'hot' ? '🔥 Hot' :
                     tag === 'toprated' ? '💯 Top Rated' :
                     tag === 'freegift' ? '🎁 Free Gift' : tag}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-primary leading-tight">
                {product.title || product.name}
              </h1>

              {product.sku && (
                <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
              )}

              {/* Rating & Reviews */}
              {(product.rating || product.reviewCount) && (
                <div className="flex items-center gap-3 text-sm">
                  {product.rating && (
                    <span className="flex items-center gap-1 text-yellow-500 font-semibold">
                      <Star className="w-4 h-4 fill-current" />
                      {product.rating.toFixed(1)}
                    </span>
                  )}
                  {product.reviewCount && product.reviewCount > 0 && (
                    <span className="text-muted-foreground">
                      ({product.reviewCount.toLocaleString()} reviews)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Price Block */}
              <div className="flex flex-wrap items-baseline gap-3 sm:gap-4 pt-2">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl sm:text-4xl font-black text-primary">
                      Rs. {formatPrice(product.discountPrice)}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      Rs. {formatPrice(product.price)}
                    </span>
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-bold">
                      {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl sm:text-4xl font-black text-primary">
                    Rs. {formatPrice(product.price)}
                  </span>
                )}
              </div>

            {/* Stock Status */}
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${stockBadge.color}`}>
                {stockBadge.label}
              </span>
              {product.stockQuantity !== undefined && product.stockQuantity <= 10 && product.stockQuantity > 0 && (
                <span className="text-xs text-orange-600 font-semibold">Only {product.stockQuantity} left!</span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Color Options */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Color Options
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-sm">
                      {color.hex && (
                        <span className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: color.hex }} />
                      )}
                      <span className="font-medium">{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Size Options */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Ruler className="w-4 h-4" /> Available Sizes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, i) => (
                    <span key={i} className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:border-primary transition-colors cursor-pointer">
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-4 border-t border-b border-border py-6">
              <AddToCartButton
                product={product}
                variant="large"
                className="w-full text-base sm:text-lg"
              />
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-500" />
                <span>Ready to Ship • Cash on Delivery Available</span>
              </div>
            </div>

            {/* Key Features */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-foreground text-base sm:text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" /> Key Features
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-sm sm:text-base text-muted-foreground">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trust Badges Row */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                <div className="p-2 bg-secondary rounded-full text-primary flex-shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Free Shipping</h4>
                  <p className="text-[11px] text-muted-foreground">Orders over Rs. 5,000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                <div className="p-2 bg-secondary rounded-full text-primary flex-shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{product.warranty || 'Warranty'}</h4>
                  <p className="text-[11px] text-muted-foreground">Official guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ──────────────── BOTTOM SECTIONS ──────────────── */}
        <div className="mt-12 sm:mt-16 space-y-10 sm:space-y-14 max-w-4xl">

          {/* Specifications Table */}
          {product.specifications && product.specifications.length > 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground mb-6 flex items-center gap-2">
                <Tag className="w-6 h-6 text-primary" /> Specifications
              </h2>
              <div className="rounded-xl border border-border overflow-hidden">
                {product.specifications.map((spec, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-[140px_1fr] sm:grid-cols-[200px_1fr] ${
                      i % 2 === 0 ? 'bg-card' : 'bg-secondary/30'
                    }`}
                  >
                    <div className="px-4 py-3 text-sm font-bold text-foreground border-r border-border">
                      {spec.label}
                    </div>
                    <div className="px-4 py-3 text-sm text-muted-foreground">
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What's in the Box */}
          {product.whatsInTheBox && product.whatsInTheBox.length > 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground mb-6 flex items-center gap-2">
                <Box className="w-6 h-6 text-primary" /> What's in the Box
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.whatsInTheBox.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50">
                    <Package className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weight Info */}
          {product.weight && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Weight className="w-4 h-4" />
              <span>Product Weight: {product.weight}g</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Add to Cart */}
      <div className="md:hidden fixed bottom-[60px] left-0 right-0 z-[55] bg-background/95 backdrop-blur-md border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto flex items-center justify-between gap-3">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Price</span>
            <span className="text-lg font-black text-primary">
              Rs. {formatPrice(product.discountPrice || product.price)}
            </span>
          <AddToCartButton product={product} variant="large" className="flex-1 max-w-[200px] h-11 text-sm font-black" />
        </div>
      </div>
    </div>
  );
}
