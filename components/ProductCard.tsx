'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/products';
import { getProductImageUrl } from '@/lib/sanity';
import { ShoppingBag, Star, ArrowRight, CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const tagStyles: Record<string, string> = {
  bestseller: 'bg-orange-500/90 text-white backdrop-blur-md',
  new: 'bg-emerald-500/90 text-white backdrop-blur-md',
  limited: 'bg-rose-500/90 text-white backdrop-blur-md',
  hot: 'bg-gradient-to-r from-orange-500/90 to-red-600/90 text-white backdrop-blur-md',
}

const tagLabels: Record<string, string> = {
  bestseller: '🔥 Bestseller',
  new: '✨ New Arrival',
  limited: '⏰ Limited',
  hot: '🔥 Hot Deal',
}

const stockInfo = {
  in_stock: { icon: CheckCircle2, text: 'In Stock', color: 'text-emerald-500 bg-emerald-500/10' },
  low_stock: { icon: AlertCircle, text: 'Low Stock', color: 'text-amber-500 bg-amber-500/10' },
  out_of_stock: { icon: XCircle, text: 'Out of Stock', color: 'text-rose-500 bg-rose-500/10' },
  pre_order: { icon: Clock, text: 'Pre-Order', color: 'text-blue-500 bg-blue-500/10' },
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = getProductImageUrl(product);
  const stock = product.stockStatus ? stockInfo[product.stockStatus] : stockInfo.in_stock;
  
  return (
    <motion.div 
      className="group relative bg-card border border-border rounded-3xl md:rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 flex flex-col h-full dark:hover:border-primary/30"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
    >
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden rounded-t-3xl md:rounded-t-[2.5rem] flex-shrink-0">
        <Image
          src={imageUrl}
          alt={product.title || product.name || 'Product'}
          fill
          className="object-cover object-center group-hover:scale-110 transition-transform duration-[1.2s] ease-out"
          sizes="(max-width: 768px) 50vw, 33vw"
          loading="lazy"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Tags */}
        <div className="absolute top-2 left-2 md:top-4 md:left-4 right-2 md:right-4 flex flex-wrap gap-1 md:gap-2 z-10">
          {product.discountPrice && (
            <span className="bg-rose-600 text-white px-2 py-0.5 md:px-3 md:py-1.5 rounded-full text-[7px] md:text-[10px] font-black uppercase tracking-tighter shadow-xl border border-white/20">
              {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
            </span>
          )}
          {product.productTags?.slice(0, 1).map((tag) => (
            <span 
              key={tag}
              className={`px-2 py-0.5 md:px-3 md:py-1.5 rounded-full text-[7px] md:text-[10px] font-black uppercase shadow-xl border border-white/10 ${tagStyles[tag] || 'bg-primary/90 text-white backdrop-blur-md'}`}
            >
              {tagLabels[tag] || tag}
            </span>
          ))}
        </div>
      </Link>
      
      <div className="p-4 md:p-8 flex flex-col flex-1">
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 truncate">
              {product.brand || (typeof product.category === 'string' ? product.category.replace('-', ' ') : (typeof (product.category as any)?.title === 'string' ? (product.category as any).title : 'Shop'))}
            </span>
            <div className={`flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full ${stock.color} border border-current/20 backdrop-blur-sm shrink-0`}>
              <stock.icon className="w-2 h-2 md:w-2.5 md:h-2.5" />
              <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.1em]">{stock.text}</span>
            </div>
          </div>
          
          <Link href={`/products/${product.slug}`} className="min-h-[2.5rem] md:min-h-[3.5rem] flex items-center">
            <h3 className="font-extrabold text-sm md:text-2xl text-foreground tracking-tight group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
              {product.title || product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-3">
            {(product.reviewCount || product.rating) && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-[10px] font-black text-yellow-700 dark:text-yellow-500">
                  {product.rating ? product.rating.toFixed(1) : '5.0'}
                </span>
                {product.reviewCount && (
                  <span className="text-[9px] text-yellow-700/60 dark:text-yellow-500/60 ml-0.5">({product.reviewCount})</span>
                )}
              </div>
            )}
            {product.colors && product.colors.length > 0 && (
              <span className="text-[10px] font-black text-primary/30 uppercase tracking-widest ml-auto">
                {product.colors.length} Colors
              </span>
            )}
          </div>
        </div>

        {/* Price & Action Section */}
        <div className="mt-auto pt-4 md:pt-6 border-t border-border/60 flex flex-col gap-3 md:gap-5">
          <div className="flex items-baseline gap-2">
            {product.discountPrice ? (
              <>
                <span className="font-black text-lg md:text-3xl text-primary tracking-tighter">
                  Rs. {formatPrice(product.discountPrice)}
                </span>
                <span className="text-[10px] md:text-sm text-muted-foreground/40 line-through font-bold">
                  Rs. {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="font-black text-lg md:text-3xl text-primary tracking-tighter">
                Rs. {formatPrice(product.price)}
              </span>
            )}
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="group/btn relative w-full overflow-hidden bg-primary text-primary-foreground py-2.5 md:py-4 px-4 md:px-6 rounded-xl md:rounded-2xl text-[9px] md:text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 active:scale-[0.97] dark:bg-white dark:text-black dark:hover:bg-gray-100 flex items-center justify-center gap-2"
          >
            <div className="absolute inset-0 w-1/4 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-[400%] transition-transform duration-1000 ease-in-out" />
            <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover/btn:scale-110 transition-transform duration-300" />
            <span className="relative">
              {product.stockStatus === 'out_of_stock' ? 'Notify' : (product.discountPrice ? 'Shop' : 'View')}
            </span>
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-0 -translate-x-3 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-500" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
