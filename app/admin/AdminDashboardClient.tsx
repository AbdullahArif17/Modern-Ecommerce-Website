'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit3,
  Trash2,
  ExternalLink,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  X,
  Star,
  Check,
  Tag,
  Truck,
  Shield,
  Layers,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Product, Category } from '@/lib/products';
import { ImageUploader } from '@/components/ImageUploader';

interface AdminDashboardClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
  initialStats: {
    totalProducts: number;
    activeProducts: number;
    outOfStock: number;
    lowStock: number;
    totalInventoryValue: number;
    totalCategories: number;
  };
}

export default function AdminDashboardClient({
  initialProducts,
  initialCategories,
  initialStats,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories'>('overview');

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [stats, setStats] = useState(initialStats);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filters for products
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: 'product' | 'category'; id: string; name: string } | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Refresh all data from APIs
  const refreshData = async (showNotification: boolean | unknown = true) => {
    const notify = typeof showNotification === 'boolean' ? showNotification : true;
    setIsRefreshing(true);
    try {
      const [prodRes, catRes, statsRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/stats'),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }
      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData.stats);
      }
      if (notify) {
        showToast('Data refreshed successfully');
      }
    } catch {
      if (notify) {
        showToast('Failed to refresh data', 'error');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategory === 'all' ||
        p.categorySlug === selectedCategory ||
        p.category === selectedCategory;

      let matchStatus = true;
      if (statusFilter === 'active') matchStatus = p.isActive !== false;
      else if (statusFilter === 'inactive') matchStatus = p.isActive === false;
      else if (statusFilter === 'featured') matchStatus = Boolean(p.featured);
      else if (statusFilter === 'in_stock') matchStatus = (p.stockQuantity ?? 1) > 10;
      else if (statusFilter === 'low_stock') matchStatus = (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= 10;
      else if (statusFilter === 'out_of_stock') matchStatus = (p.stockQuantity ?? 0) === 0 || p.stockStatus === 'out_of_stock';

      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, searchQuery, selectedCategory, statusFilter]);

  // Toggle Product Active / Inactive
  const toggleProductActive = async (product: Product) => {
    const updatedStatus = !product.isActive;
    const prodId = product._id || product.id;
    try {
      const res = await fetch(`/api/admin/products/${prodId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => ((p._id === prodId || p.id === prodId) ? { ...p, isActive: updatedStatus } : p))
        );
        showToast(
          `Product ${updatedStatus ? 'published to storefront' : 'hidden from storefront'}`
        );
        router.refresh();
      }
    } catch {
      showToast('Failed to update product status', 'error');
    }
  };

  // Toggle Product Featured
  const toggleProductFeatured = async (product: Product) => {
    const updatedFeatured = !product.featured;
    const prodId = product._id || product.id;
    try {
      const res = await fetch(`/api/admin/products/${prodId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: updatedFeatured }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => ((p._id === prodId || p.id === prodId) ? { ...p, featured: updatedFeatured } : p))
        );
        showToast(
          `Product ${updatedFeatured ? 'added to homepage featured' : 'removed from featured'}`
        );
        router.refresh();
      }
    } catch {
      showToast('Failed to update featured status', 'error');
    }
  };

  // Delete Action
  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    const { type, id } = deleteConfirmation;

    try {
      if (type === 'product') {
        const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setProducts((prev) => prev.filter((p) => p._id !== id && p.id !== id));
          showToast('Product deleted permanently');
          await refreshData(false);
          router.refresh();
        } else {
          showToast('Failed to delete product', 'error');
        }
      } else {
        const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setCategories((prev) => prev.filter((c) => c._id !== id && (c as any).id !== id));
          showToast('Category deleted successfully');
          await refreshData(false);
          router.refresh();
        } else {
          showToast('Failed to delete category', 'error');
        }
      }
    } catch {
      showToast('An error occurred during deletion', 'error');
    } finally {
      setDeleteConfirmation(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-white border-emerald-400 dark:bg-emerald-600'
                : 'bg-destructive text-destructive-foreground border-destructive/30'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10">
                <Image
                  src="/J Tech Mart Logo-01.png"
                  alt="JTech Mart"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base sm:text-lg tracking-tight text-foreground leading-none">
                  JTech Mart
                </span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mt-1">
                  Neon Admin
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-secondary/40 p-1.5 rounded-2xl border border-border/40">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-primary text-primary-foreground shadow-sm dark:bg-white dark:text-black'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-primary text-primary-foreground shadow-sm dark:bg-white dark:text-black'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-primary/20 text-current">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'categories'
                  ? 'bg-primary text-primary-foreground shadow-sm dark:bg-white dark:text-black'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Categories</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-primary/20 text-current">
                {categories.length}
              </span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshData(true)}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
              title="Refresh database records"
              aria-label="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground transition-all"
            >
              <span>Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <ThemeToggle />

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 transition-all border border-destructive/20 ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-border/40 px-2 py-1.5 bg-secondary/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 text-xs font-bold text-center rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-primary text-primary-foreground dark:bg-white dark:text-black'
                : 'text-muted-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 text-xs font-bold text-center rounded-xl transition-all ${
              activeTab === 'products'
                ? 'bg-primary text-primary-foreground dark:bg-white dark:text-black'
                : 'text-muted-foreground'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-2 text-xs font-bold text-center rounded-xl transition-all ${
              activeTab === 'categories'
                ? 'bg-primary text-primary-foreground dark:bg-white dark:text-black'
                : 'text-muted-foreground'
            }`}
          >
            Categories ({categories.length})
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-7xl">
        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 1: OVERVIEW */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/40 to-background border border-primary/20 shadow-sm">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Neon Database Connected</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Store Management Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Full control over products, pricing, stock levels, categories, and storefront features.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all dark:bg-white dark:text-black"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Product</span>
                </button>

                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setIsCategoryModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs sm:text-sm border border-border/50 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Category</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Total Products */}
              <div
                onClick={() => {
                  setStatusFilter('all');
                  setActiveTab('products');
                }}
                className="group p-5 sm:p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Total Products
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-4xl font-black text-foreground">
                  {products.length}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{products.filter((p) => p.isActive !== false).length} published</span>
                </div>
              </div>

              {/* Categories */}
              <div
                onClick={() => setActiveTab('categories')}
                className="group p-5 sm:p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Categories
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FolderTree className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-4xl font-black text-foreground">
                  {categories.length}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-muted-foreground">
                  <span>{categories.filter((c) => c.showInHero).length} in hero section</span>
                </div>
              </div>

              {/* Stock Alerts */}
              <div
                onClick={() => {
                  setStatusFilter('low_stock');
                  setActiveTab('products');
                }}
                className="group p-5 sm:p-6 rounded-3xl bg-card border border-border/50 hover:border-amber-500/40 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Inventory Alerts
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-4xl font-black text-foreground">
                  {products.filter((p) => (p.stockQuantity ?? 0) <= 10).length}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <span>Low or out of stock items</span>
                </div>
              </div>

              {/* Retail Valuation */}
              <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Inventory Value
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-foreground truncate">
                  Rs. {products.reduce((acc, p) => acc + (p.price * (p.stockQuantity ?? 1)), 0).toLocaleString()}
                </div>
                <div className="mt-2 text-xs font-medium text-muted-foreground">
                  Estimated stock retail total
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Products */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
                    Latest Catalog Additions
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Quickly view and manage recently updated products
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('products')}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  View All Products →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.slice(0, 6).map((product) => {
                  const imgUrl = Array.isArray(product.images) && product.images.length > 0
                    ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url)
                    : (product.image || '/placeholder.jpg');

                  return (
                    <div
                      key={product._id}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all group"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-secondary/50 flex-shrink-0 border border-border/40">
                        <Image
                          src={imgUrl}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-foreground truncate">
                          {product.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {product.category || 'General'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-foreground">
                            Rs. {product.price.toLocaleString()}
                          </span>
                          {product.isActive !== false ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setIsProductModalOpen(true);
                        }}
                        className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                        title="Edit product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 2: PRODUCTS MANAGER */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header with Title and Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Products Catalog
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Manage inventory, pricing, images, specifications, and visibility on the storefront.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all dark:bg-white dark:text-black cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-3 p-4 rounded-3xl bg-card border border-border/50">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by title, brand, or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-background border border-border/60 text-xs sm:text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-background border border-border/60 text-xs sm:text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Drafts / Inactive</option>
                  <option value="featured">Featured Only</option>
                  <option value="in_stock">In Stock (&gt;10)</option>
                  <option value="low_stock">Low Stock (1-10)</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>

                {(searchQuery || selectedCategory !== 'all' || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setStatusFilter('all');
                    }}
                    className="p-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground text-xs font-bold"
                    title="Reset filters"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Product Count Indicator */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>
                Showing <strong>{filteredProducts.length}</strong> of{' '}
                <strong>{products.length}</strong> products
              </span>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block rounded-3xl border border-border/50 bg-card overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/30 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Price</th>
                    <th className="py-4 px-4">Stock</th>
                    <th className="py-4 px-4 text-center">Featured</th>
                    <th className="py-4 px-4 text-center">Active</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="w-8 h-8 opacity-40" />
                          <p className="font-bold">No products match your criteria.</p>
                          <p className="text-xs">Try clearing filters or search term.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const img = Array.isArray(p.images) && p.images.length > 0
                        ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url)
                        : (p.image || '/placeholder.jpg');

                      return (
                        <tr key={p._id} className="hover:bg-secondary/20 transition-colors group">
                          {/* Product Info */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-secondary/50 border border-border/40 flex-shrink-0">
                                <Image
                                  src={img}
                                  alt={p.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform"
                                  sizes="48px"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-foreground truncate max-w-[240px]">
                                  {p.title}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                  <span>{p.brand || 'JTech'}</span>
                                  {p.sku && <span>• SKU: {p.sku}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-secondary border border-border/60 text-foreground">
                              {p.category || 'General'}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              {p.discountPrice ? (
                                <>
                                  <span className="font-bold text-foreground">
                                    Rs. {p.discountPrice.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-muted-foreground line-through">
                                    Rs. {p.price.toLocaleString()}
                                  </span>
                                </>
                              ) : (
                                <span className="font-bold text-foreground">
                                  Rs. {p.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Stock */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  (p.stockQuantity ?? 1) === 0
                                    ? 'bg-destructive'
                                    : (p.stockQuantity ?? 1) <= 10
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                              />
                              <span className="text-xs font-semibold text-foreground">
                                {p.stockQuantity ?? 0} in stock
                              </span>
                            </div>
                          </td>

                          {/* Featured Toggle */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => toggleProductFeatured(p)}
                              className={`p-1.5 rounded-xl transition-all ${
                                p.featured
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                  : 'text-muted-foreground/40 hover:text-muted-foreground'
                              }`}
                              title={p.featured ? 'Featured on home' : 'Click to feature'}
                            >
                              <Star className={`w-4 h-4 ${p.featured ? 'fill-amber-500' : ''}`} />
                            </button>
                          </td>

                          {/* Active Toggle */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => toggleProductActive(p)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                p.isActive !== false
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {p.isActive !== false ? 'Published' : 'Hidden'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/products/${p.slug}`}
                                target="_blank"
                                className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                                title="Preview on website"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                                title="Edit product"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirmation({
                                    type: 'product',
                                    id: p._id,
                                    name: p.title,
                                  })
                                }
                                className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                                title="Delete product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-3xl border border-border p-6">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-bold">No products found</p>
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const img = Array.isArray(p.images) && p.images.length > 0
                    ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url)
                    : (p.image || '/placeholder.jpg');

                  return (
                    <div
                      key={p._id}
                      className="p-5 rounded-3xl bg-card border border-border/50 shadow-sm space-y-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-secondary/50 border border-border/40 flex-shrink-0">
                          <Image src={img} alt={p.title} fill className="object-cover" sizes="64px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2">
                              {p.title}
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {p.category || 'General'}
                          </p>
                          <div className="mt-1 flex items-baseline gap-2">
                            {p.discountPrice ? (
                              <>
                                <span className="font-black text-sm text-foreground">
                                  Rs. {p.discountPrice.toLocaleString()}
                                </span>
                                <span className="text-[11px] text-muted-foreground line-through">
                                  Rs. {p.price.toLocaleString()}
                                </span>
                              </>
                            ) : (
                              <span className="font-black text-sm text-foreground">
                                Rs. {p.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stock & Status pills */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs">
                        <span className="font-medium text-muted-foreground">
                          Stock: <strong>{p.stockQuantity ?? 0} units</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleProductFeatured(p)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                              p.featured
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-secondary text-muted-foreground border-border/60'
                            }`}
                          >
                            {p.featured ? '★ Featured' : 'Feature'}
                          </button>

                          <button
                            onClick={() => toggleProductActive(p)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                              p.isActive !== false
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-muted text-muted-foreground border-border/60'
                            }`}
                          >
                            {p.isActive !== false ? 'Live' : 'Hidden'}
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-secondary text-xs font-bold text-foreground"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsProductModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmation({
                              type: 'product',
                              id: p._id,
                              name: p.title,
                            })
                          }
                          className="p-1.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 3: CATEGORIES MANAGER */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Store Categories
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Organize your inventory into browseable collections and hero carousel links.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all dark:bg-white dark:text-black cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            {/* Categories Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="rounded-3xl bg-card border border-border/50 overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full bg-secondary/50">
                    <Image
                      src={cat.image || '/placeholder.jpg'}
                      alt={cat.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
                        Slug: /{cat.slug}
                      </span>
                      <h3 className="text-xl font-black text-white">{cat.title}</h3>
                    </div>

                    {cat.showInHero && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-black uppercase tracking-wider shadow-lg">
                        Hero Icon
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {cat.description || 'No description provided.'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Order: <strong>{cat.sortOrder ?? 0}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsCategoryModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-secondary text-xs font-bold text-foreground hover:bg-secondary/80 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmation({
                              type: 'category',
                              id: cat._id,
                              name: cat.title,
                            })
                          }
                          className="p-1.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* PRODUCT CREATE / EDIT MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isProductModalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSaved={async (savedProduct) => {
            const wasEdit = Boolean(editingProduct);
            setIsProductModalOpen(false);
            setEditingProduct(null);

            // Deduplicated state update
            setProducts((prev) => {
              const targetKey = savedProduct._id || savedProduct.id || savedProduct.slug;
              const exists = prev.some((p) => (p._id || p.id || p.slug) === targetKey || p.slug === savedProduct.slug);
              if (exists) {
                return prev.map((p) => ((p._id || p.id || p.slug) === targetKey || p.slug === savedProduct.slug) ? savedProduct : p);
              }
              return [savedProduct, ...prev];
            });

            showToast(wasEdit ? 'Product updated successfully' : 'New product created successfully');

            // Background refresh to guarantee full Neon sync without duplicated toast
            await refreshData(false);
            router.refresh();
          }}
        />
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CATEGORY CREATE / EDIT MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isCategoryModalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          }}
          onSaved={async (savedCategory) => {
            const wasEdit = Boolean(editingCategory);
            setIsCategoryModalOpen(false);
            setEditingCategory(null);

            // Deduplicated state update
            setCategories((prev) => {
              const targetId = savedCategory._id || (savedCategory as any).id || savedCategory.slug;
              const exists = prev.some((c) => (c._id || (c as any).id || c.slug) === targetId || c.slug === savedCategory.slug);
              if (exists) {
                return prev.map((c) => ((c._id || (c as any).id || c.slug) === targetId || c.slug === savedCategory.slug) ? savedCategory : c);
              }
              return [...prev, savedCategory];
            });

            showToast(wasEdit ? 'Category updated successfully' : 'Category created successfully');

            // Background refresh to guarantee full Neon sync without duplicated toast
            await refreshData(false);
            router.refresh();
          }}
        />
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">Confirm Deletion</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Are you sure you want to delete{' '}
                <strong className="text-foreground font-bold">&quot;{deleteConfirmation.name}&quot;</strong>? This
                action removes the record permanently from Neon.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold hover:bg-destructive/90 shadow-lg shadow-destructive/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT FORM MODAL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface ProductFormModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: (product: Product) => void;
}

function ProductFormModal({ product, categories, onClose, onSaved }: ProductFormModalProps) {
  const isEdit = Boolean(product);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState(product?.title || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [brand, setBrand] = useState(product?.brand || 'JTech');
  const [sku, setSku] = useState(product?.sku || '');
  const [price, setPrice] = useState<number | ''>(product?.price || '');
  const [discountPrice, setDiscountPrice] = useState<number | ''>(product?.discountPrice || '');
  const [category, setCategory] = useState(product?.category || (categories[0]?.title || 'Smart Watches'));
  const [categorySlug, setCategorySlug] = useState(product?.categorySlug || (categories[0]?.slug || 'smart-watches'));
  const [description, setDescription] = useState(product?.description || '');
  const [stockQuantity, setStockQuantity] = useState<number>(product?.stockQuantity ?? 100);
  const [stockStatus, setStockStatus] = useState<Product['stockStatus']>(product?.stockStatus || 'in_stock');
  const [warranty, setWarranty] = useState(product?.warranty || '1 Year Official Warranty');
  const [featured, setFeatured] = useState<boolean>(product?.featured || false);
  const [isActive, setIsActive] = useState<boolean>(product?.isActive !== false);

  // Dynamic Array Fields
  const [images, setImages] = useState<string[]>(() => {
    if (!product?.images) return [];
    return product.images.map((img: any) => (typeof img === 'string' ? img : img?.url || ''));
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  const [features, setFeatures] = useState<string[]>(product?.features || []);
  const [newFeature, setNewFeature] = useState('');

  const [specifications, setSpecifications] = useState<{ label: string; value: string }[]>(
    product?.specifications || []
  );
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const [whatsInTheBox, setWhatsInTheBox] = useState<string[]>(product?.whatsInTheBox || []);
  const [newBoxItem, setNewBoxItem] = useState('');

  const [productTags, setProductTags] = useState<string[]>(product?.productTags || []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTitle = e.target.value;
    setCategory(selectedTitle);
    const cat = categories.find((c) => c.title === selectedTitle);
    if (cat) {
      setCategorySlug(cat.slug);
    }
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setFeatures((prev) => [...prev, newFeature.trim()]);
    setNewFeature('');
  };

  const removeFeature = (idx: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const addSpecification = () => {
    if (!newSpecLabel.trim() || !newSpecValue.trim()) return;
    setSpecifications((prev) => [...prev, { label: newSpecLabel.trim(), value: newSpecValue.trim() }]);
    setNewSpecLabel('');
    setNewSpecValue('');
  };

  const removeSpecification = (idx: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== idx));
  };

  const addBoxItem = () => {
    if (!newBoxItem.trim()) return;
    setWhatsInTheBox((prev) => [...prev, newBoxItem.trim()]);
    setNewBoxItem('');
  };

  const removeBoxItem = (idx: number) => {
    setWhatsInTheBox((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleTag = (tag: string) => {
    setProductTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!title || price === '') {
      setError('Title and Base Price are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const payload = {
      title,
      name: title,
      slug: slug || undefined,
      brand,
      sku,
      price: Number(price),
      discountPrice: discountPrice !== '' ? Number(discountPrice) : null,
      category,
      categorySlug,
      description,
      stockQuantity: Number(stockQuantity),
      stockStatus,
      warranty,
      featured,
      isActive,
      images,
      image: images.length > 0 ? images[0] : '/placeholder.jpg',
      features,
      specifications,
      whatsInTheBox,
      productTags,
    };

    try {
      const prodId = product?._id || product?.id;
      const url = isEdit ? `/api/admin/products/${prodId}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      onSaved(data.product);
    } catch (err: any) {
      setError(err.message || 'Something went wrong saving the product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-card border border-border/80 rounded-3xl max-w-3xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/40 bg-secondary/20">
          <div>
            <h2 className="text-lg font-black text-foreground">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isEdit ? `Updating ${product?.title}` : 'Fill in product information for Neon database'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-primary">1. Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-foreground">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chronos Elite Smart Watch"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Category</label>
                <select
                  value={category}
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground focus:ring-2 focus:ring-primary/20"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Brand</label>
                <input
                  type="text"
                  placeholder="e.g. JTech"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">SKU / Model</label>
                <input
                  type="text"
                  placeholder="e.g. JTM-CW-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Custom URL Slug (optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated if empty"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Stock */}
          <div className="space-y-4 pt-4 border-t border-border/40">
            <h3 className="font-bold text-xs uppercase tracking-wider text-primary">2. Pricing & Inventory</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Price (Rs.) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="29900"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Sale Price (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Discounted"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Stock Units</label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Stock Status</label>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value as Product['stockStatus'])}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
                >
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="pre_order">Pre-Order</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Media Gallery */}
          <div className="space-y-4 pt-4 border-t border-border/40">
            <ImageUploader
              images={images}
              onChange={setImages}
              multiple={true}
              maxFiles={12}
              label="3. Product Media & Images"
              helperText="Upload product photos directly from your device (click to browse or drag & drop). The first photo is used as the primary storefront image."
            />
          </div>

          {/* Section 4: Description & Features */}
          <div className="space-y-4 pt-4 border-t border-border/40">
            <h3 className="font-bold text-xs uppercase tracking-wider text-primary">4. Content & Specifications</h3>
            
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Short Marketing Description</label>
              <textarea
                rows={3}
                placeholder="Brief summary displayed on cards..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
              />
            </div>

            {/* Bullet Features */}
            <div className="space-y-2">
              <label className="font-bold text-foreground">Key Bullet Features</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Always-on AMOLED Display"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-background border border-border/60 text-foreground"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 font-bold text-xs"
                >
                  + Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {features.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-secondary text-xs font-semibold"
                  >
                    <span>{f}</span>
                    <button type="button" onClick={() => removeFeature(i)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Specifications Key-Value */}
            <div className="space-y-2">
              <label className="font-bold text-foreground">Specifications (Key-Value)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Spec name (e.g. Battery Life)"
                  value={newSpecLabel}
                  onChange={(e) => setNewSpecLabel(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-background border border-border/60 text-foreground"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Spec value (e.g. 7 Days)"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-background border border-border/60 text-foreground"
                  />
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="px-3 py-2 rounded-xl bg-secondary hover:bg-secondary/80 font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {specifications.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-secondary/50 text-xs">
                    <span><strong>{s.label}:</strong> {s.value}</span>
                    <button type="button" onClick={() => removeSpecification(i)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Badges & Storefront Toggles */}
          <div className="space-y-4 pt-4 border-t border-border/40">
            <h3 className="font-bold text-xs uppercase tracking-wider text-primary">5. Storefront Badges & Visibility</h3>
            
            <div className="space-y-2">
              <label className="font-bold text-foreground">Promotional Tags</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'bestseller', label: '🔥 Best Seller' },
                  { id: 'new', label: '✨ New Arrival' },
                  { id: 'hot', label: '⚡ Hot Deal' },
                  { id: 'limited', label: '⏰ Limited Stock' },
                  { id: 'toprated', label: '💯 Top Rated' },
                ].map((tag) => (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      productTags.includes(tag.id)
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm dark:bg-white dark:text-black'
                        : 'bg-secondary text-muted-foreground border-border/60 hover:text-foreground'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-secondary/40 border border-border/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/20"
                />
                <div>
                  <div className="font-bold text-xs text-foreground">Feature on Homepage</div>
                  <div className="text-[11px] text-muted-foreground">Show in the homepage carousel</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-secondary/40 border border-border/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/20"
                />
                <div>
                  <div className="font-bold text-xs text-foreground">Publish to Storefront</div>
                  <div className="text-[11px] text-muted-foreground">Visible to customers when enabled</div>
                </div>
              </label>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/40">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-secondary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {isSubmitting ? 'Saving to Neon...' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY FORM MODAL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface CategoryFormModalProps {
  category: Category | null;
  onClose: () => void;
  onSaved: (category: Category) => void;
}

function CategoryFormModal({ category, onClose, onSaved }: CategoryFormModalProps) {
  const isEdit = Boolean(category);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState(category?.title || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [description, setDescription] = useState(category?.description || '');
  const [image, setImage] = useState(category?.image || '');
  const [sortOrder, setSortOrder] = useState<number>(category?.sortOrder ?? 0);
  const [showInHero, setShowInHero] = useState<boolean>(category?.showInHero ?? false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!title) {
      setError('Category Title is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const payload = {
      title,
      slug: slug || undefined,
      description,
      image: image || '/placeholder.jpg',
      sortOrder: Number(sortOrder),
      showInHero,
    };

    try {
      const catId = category?._id || (category as any)?.id || category?.slug;
      const url = isEdit ? `/api/admin/categories/${catId}` : '/api/admin/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save category');
      }

      onSaved(data.category);
    } catch (err: any) {
      setError(err.message || 'Something went wrong saving the category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border/80 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/40 bg-secondary/20">
          <div>
            <h2 className="text-lg font-black text-foreground">
              {isEdit ? 'Edit Category' : 'Create Category'}
            </h2>
            <p className="text-xs text-muted-foreground">Category collection in Neon</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-bold text-foreground">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Smart Watches"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-foreground">URL Slug (optional)</label>
            <input
              type="text"
              placeholder="Auto-generated if empty"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <ImageUploader
              images={image ? [image] : []}
              onChange={(imgs) => setImage(imgs[0] || '')}
              multiple={false}
              label="Category Thumbnail Image"
              helperText="Upload image for category card (click to browse or drag & drop)"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-foreground">Description</label>
            <textarea
              rows={2}
              placeholder="Brief description for category heading..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInHero}
                  onChange={(e) => setShowInHero(e.target.checked)}
                  className="w-4 h-4 rounded text-primary"
                />
                <span className="font-bold text-xs text-foreground">Show in Hero Section</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md dark:bg-white dark:text-black"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
