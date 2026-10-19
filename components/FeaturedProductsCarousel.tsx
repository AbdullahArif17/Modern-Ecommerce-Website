'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { ProductCard } from './ProductCard'
import { Product } from '@/lib/products'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FeaturedProductsCarouselProps {
  products: Product[]
}

export function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [visibleCount, setVisibleCount] = useState(3)
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const updateVisibleCount = () => {
      if (typeof window === 'undefined') return
      if (window.innerWidth < 640) setVisibleCount(2)
      else if (window.innerWidth < 1024) setVisibleCount(2)
      else setVisibleCount(3)
    }

    updateVisibleCount()
    window.addEventListener('resize', updateVisibleCount)
    return () => window.removeEventListener('resize', updateVisibleCount)
  }, [])

  const totalSlides = Math.ceil(products.length / visibleCount)

  const pauseAndResumeAutoplay = useCallback(() => {
    setIsAutoPlaying(false)
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current)
    }
    resumeTimerRef.current = setTimeout(() => {
      setIsAutoPlaying(true)
    }, 15000)
  }, [])

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isAutoPlaying || products.length <= visibleCount || totalSlides <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, products.length, visibleCount, totalSlides])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
    pauseAndResumeAutoplay()
  }, [pauseAndResumeAutoplay])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
    pauseAndResumeAutoplay()
  }, [totalSlides, pauseAndResumeAutoplay])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
    pauseAndResumeAutoplay()
  }, [totalSlides, pauseAndResumeAutoplay])

  if (products.length === 0) {
    return (
      <p className="col-span-full text-center text-muted-foreground py-20">
        No featured products found.
      </p>
    )
  }

  // Get current visible products
  const visibleProducts = products.slice(
    currentIndex * visibleCount,
    (currentIndex + 1) * visibleCount
  )

  return (
    <div className="relative group/carousel">
      {/* Carousel Container - normal flow, no absolute positioning */}
      <div className="overflow-hidden">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-10">
            {visibleProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:-left-6 top-1/2 -translate-y-1/2 bg-background/95 hover:bg-background border border-border/50 rounded-full p-3 md:p-4 shadow-xl z-20 transition-all duration-300 hover:scale-110 active:scale-95 opacity-0 group-hover/carousel:opacity-100 hover:shadow-2xl"
            aria-label="Previous products"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 md:-right-6 top-1/2 -translate-y-1/2 bg-background/95 hover:bg-background border border-border/50 rounded-full p-3 md:p-4 shadow-xl z-20 transition-all duration-300 hover:scale-110 active:scale-95 opacity-0 group-hover/carousel:opacity-100 hover:shadow-2xl"
            aria-label="Next products"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
          </button>
        </>
      )}

      {/* Bottom Controls: Dots + Autoplay Toggle */}
      {totalSlides > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => {
              const active = currentIndex === index
              return (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "rounded-full transition-all duration-500 hover:bg-primary/50",
                    active ? 'w-8 h-2 bg-primary' : 'w-2 h-2 bg-border'
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              )
            })}
          </div>
          
          <div className="w-px h-4 bg-border" />
          
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={cn(
              "p-1.5 rounded-lg transition-all text-muted-foreground hover:text-foreground",
              isAutoPlaying ? "hover:bg-secondary" : "bg-secondary"
            )}
            aria-label={isAutoPlaying ? "Pause autoplay" : "Resume autoplay"}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  )
}
