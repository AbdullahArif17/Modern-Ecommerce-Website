'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FeaturedProductsCarousel } from './FeaturedProductsCarousel'
import { Product } from '@/lib/products'
import { motion } from 'framer-motion'

interface FeaturedSectionProps {
  products: Product[]
}

export function FeaturedSection({ products }: FeaturedSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 md:py-28 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-20 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4">
              <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider">🔥 Trending Now</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary mb-4">BESTSELLER FOR YOU 🔥</h2>
            <p className="text-muted-foreground text-sm md:text-xl">Our most loved products, handpicked for you.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="hidden md:block"
          >
            <Link href="/products" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-semibold group px-6 py-3 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/20">
              View All <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
        
        <FeaturedProductsCarousel products={products} />
        
        <div className="mt-12 text-center md:hidden">
          <Link href="/products" className="inline-flex items-center gap-2 text-primary font-medium">
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
