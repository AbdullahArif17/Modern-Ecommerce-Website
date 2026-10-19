'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { Product } from '@/lib/products';
import { Filter, Search, ChevronRight, SlidersHorizontal, PackageSearch, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProductsClientProps {
  products: Product[];
}

interface FilterPanelProps {
  isMobile?: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  categories: { id: string; label: string }[];
  setIsMobileFilterOpen: (open: boolean) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const FilterPanel = ({ 
  isMobile = false, 
  searchQuery, 
  setSearchQuery, 
  activeCategory, 
  setActiveCategory, 
  categories,
  setIsMobileFilterOpen,
  sortBy,
  setSortBy
}: FilterPanelProps) => (
  <div className={cn("space-y-12", isMobile && "space-y-8")}>
    {/* Sort - Mobile Only */}
    {isMobile && (
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          </div>
          <h4 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em]">Sort By</h4>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {[
            { id: 'featured', label: 'Featured', icon: '👑' },
            { id: 'newest', label: 'New Arrivals', icon: '✨' },
            { id: 'price-asc', label: 'Low to High', icon: '📉' },
            { id: 'price-desc', label: 'High to Low', icon: '📈' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setSortBy(option.id)}
              className={cn(
                "flex items-center justify-between px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border",
                sortBy === option.id
                  ? "bg-primary/10 text-primary border-primary"
                  : "bg-card text-muted-foreground border-border"
              )}
            >
              <span>{option.label}</span>
              <span className="text-sm">{option.icon}</span>
            </button>
          ))}
        </div>
      </div>
    )}

    {/* Search - Ultra Sharp */}
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
        <Search className="w-4 h-4 text-primary" />
        <h4 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em]">Search</h4>
      </div>
      <div className="relative group overflow-hidden rounded-[1.5rem] border border-border shadow-xl hover:border-primary/50 transition-all duration-300">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-6 pr-6 py-5 bg-card text-sm focus:outline-none placeholder:text-muted-foreground/30 font-bold"
        />
        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-focus-within:w-full transition-all duration-700" />
      </div>
    </div>

    {/* Categories */}
    <div className="space-y-6">
       <div className="flex items-center gap-2 px-2">
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        <h4 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em]">Categories</h4>
      </div>
      <div className="flex flex-col gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => {
              setActiveCategory(category.id);
              if (isMobile) setIsMobileFilterOpen(false);
            }}
            className={cn(
                "group flex items-center justify-between px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all relative border overflow-hidden",
                activeCategory === category.id
                ? "bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/20 scale-[1.03] z-10"
                : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-primary"
            )}
          >
            <span className="relative z-10">{category.label}</span>
            <ChevronRight className={cn(
              "w-4 h-4 transition-all duration-500 relative z-10",
              activeCategory === category.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
            )} />
          </button>
        ))}
      </div>
    </div>
  </div>
);

function ProductsContent({ products }: ProductsClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [activeCategory, setActiveCategory] = useState<string>(categoryParam || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync with search params when they change
  useEffect(() => {
    const cp = searchParams.get('category');
    if (cp) {
      setActiveCategory(cp);
      // Auto-scroll to products when category is selected from URL
      setTimeout(() => {
        const element = document.getElementById('product-grid');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else if (!categoryParam) {
      setActiveCategory('all');
    }
  }, [searchParams, categoryParam]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileFilterOpen) {
        setIsMobileFilterOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileFilterOpen]);
  
  const categories = useMemo(() => {
    // Map of slug -> title to ensure unique categories based on slugs
    const catMap = new Map<string, string>();
    products.forEach(p => {
      const slug = p.categorySlug || (p.category ? p.category.toLowerCase().replace(/\s+/g, '-') : null);
      const title = p.category;
      if (slug && title) {
        catMap.set(slug, title);
      }
    });

    return [
      { id: 'all', label: 'All Products' },
      ...Array.from(catMap.entries()).map(([slug, title]) => ({ id: slug, label: title })),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = activeCategory === 'all' 
      ? products 
      : products.filter(product => {
          const slug = product.categorySlug || (product.category ? product.category.toLowerCase().replace(/\s+/g, '-') : '');
          return slug === activeCategory;
      });

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        (product.title || product.name || '').toLowerCase().includes(query) ||
        (product.description || '').toLowerCase().includes(query) ||
        (product.category || '').toLowerCase().includes(query)
      );
    }

    // Sort products
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case 'price-desc':
          return (b.discountPrice || b.price) - (a.discountPrice || a.price);
        case 'newest':
          return new Date(b._createdAt || 0).getTime() - new Date(a._createdAt || 0).getTime();
        default: // featured
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });
  }, [products, activeCategory, searchQuery, sortBy]);



  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      {/* Cinematic Header - Fluid Typography */}
      <section className="relative pt-24 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <motion.div 
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-md shadow-2xl shadow-primary/5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </div>
              <span className="text-[11px] font-black tracking-[0.25em] text-primary uppercase">Shop All Products</span>
            </motion.div>
            
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.95] uppercase flex flex-col items-center">
              <span className="text-primary opacity-20 text-[0.4em] font-bold tracking-[0.5em] mb-2 sm:mb-4">Browse</span>
              <span className="text-primary mb-1 md:mb-3">Our Full</span>
              <span className="bg-gradient-to-r from-primary via-primary/70 to-primary bg-clip-text text-transparent italic font-light lowercase">Collection</span>
            </h1>
            
            <motion.p 
              className="mt-6 md:mt-10 text-base md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed opacity-80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Discover our carefully curated selection of premium products.
              Find exactly what you're looking for.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mobile Sticky Action Bar */}
      <div className="sticky top-16 md:hidden z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 py-4 px-4 flex items-center justify-between">
        <button 
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-2xl text-[10px] font-black uppercase text-primary border border-primary/20"
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
        </button>
        <div className="flex items-center gap-3">
           <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.1em]">
            {filteredProducts.length} Products
          </p>
        </div>
      </div>

      <div id="product-grid" className="container mx-auto px-4 py-12 md:py-32">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
          {/* Desktop Control Panel */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <FilterPanel 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              categories={categories}
              setIsMobileFilterOpen={setIsMobileFilterOpen}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </aside>

          {/* Visualization Grid (Main Content) */}
          <main className="flex-1 w-full space-y-12">
            <div className="hidden sm:flex items-center justify-between gap-8 pb-10 border-b border-border/60">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                    <PackageSearch className="w-5 h-5 text-primary" />
                </div>
                <div>
                   <p className="text-xs font-black text-primary/40 uppercase tracking-[0.2em] mb-0.5">Results</p>
                   <p className="text-xl font-black tracking-tighter text-foreground leading-none">
                     {filteredProducts.length} <span className="text-primary italic font-light">Products found</span>
                   </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-2xl border border-border shadow-sm group hover:border-primary/30 transition-all">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hidden xs:inline-block">Sort by</span>
                <div className="h-6 w-[1px] bg-border hidden xs:block" />
                <div className="relative flex items-center">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-foreground text-[11px] font-black uppercase tracking-tight py-2 pl-2 pr-8 focus:outline-none cursor-pointer hover:text-primary transition-colors appearance-none min-w-[150px]"
                  >
                    <option value="featured" className="bg-card text-foreground">👑 Selection</option>
                    <option value="newest" className="bg-card text-foreground">✨ New Arrivals</option>
                    <option value="price-asc" className="bg-card text-foreground">📉 Low to High</option>
                    <option value="price-desc" className="bg-card text-foreground">📈 High to Low</option>
                  </select>
                  <ChevronRight className="absolute right-0 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredProducts.length > 0 ? (
                <motion.div 
                  key="products-grid"
                  layout
                  className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-14"
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} />
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 md:py-40 bg-card rounded-3xl md:rounded-[3.5rem] border border-dashed border-border shadow-inner"
                >
                  <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-8 border border-primary/10">
                    <PackageSearch className="w-10 h-10 text-primary opacity-30" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-foreground mb-4 tracking-tighter uppercase text-center">No Products Found</h3>
                  <p className="text-muted-foreground mb-12 max-w-sm mx-auto font-bold text-base md:text-lg leading-relaxed px-6 text-center">
                    We couldn't find any products matching your filters. Try adjusting your search.
                  </p>
                  <button 
                    onClick={() => {
                      setSearchQuery('')
                      setActiveCategory('all')
                      setSortBy('featured')
                    }}
                    className="px-12 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] shadow-primary/30 hover:scale-105 active:scale-95 transition-all dark:bg-white dark:text-black"
                  >
                    Reset Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              aria-hidden="true"
              className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-md md:hidden"
            />
            <motion.div 
              role="dialog"
              aria-modal="true"
              aria-label="Filter products"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-[110] w-[85%] max-w-[400px] bg-background border-l border-border/40 shadow-2xl p-8 overflow-y-auto md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-primary/10 rounded-[1.25rem] flex items-center justify-center border border-primary/20">
                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                   </div>
                   <div className="flex flex-col">
                     <h3 className="text-xl font-black tracking-tighter uppercase leading-tight">Filter Panel</h3>
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Refine your search</span>
                   </div>
                </div>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  aria-label="Close filter panel"
                  className="p-3 hover:bg-secondary rounded-2xl transition-all active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <FilterPanel 
                isMobile 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                categories={categories}
                setIsMobileFilterOpen={setIsMobileFilterOpen}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />

              <div className="mt-12 sticky bottom-0 bg-background pt-4 pb-2">
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all dark:bg-white dark:text-black"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductsClient(props: ProductsClientProps) {
  return (
    <Suspense fallback={<div>Loading Products...</div>}>
      <ProductsContent {...props} />
    </Suspense>
  );
}
