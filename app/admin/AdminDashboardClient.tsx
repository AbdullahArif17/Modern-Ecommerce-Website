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
  Calculator,
  Building2,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Percent,
  PieChart,
  Coins,
  Briefcase,
  Users,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Clock,
  Calendar,
  CheckSquare,
  Target,
  Sliders,
  ShoppingBag,
  Box,
  ChevronRight,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Product, Category, Vendor, StoreTransaction } from '@/lib/products';
import { ImageUploader } from '@/components/ImageUploader';
import { StoreCalculatorsSuite } from '@/components/admin/StoreCalculatorsSuite';
import { VendorFormModal } from '@/components/admin/VendorFormModal';
import { TransactionFormModal } from '@/components/admin/TransactionFormModal';

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
  initialVendors?: Vendor[];
  initialTransactions?: StoreTransaction[];
  initialStoreMetrics?: {
    retailInventoryValue: number;
    costInventoryValue: number;
    potentialProfit: number;
    grossMarginPercent: number;
    totalUnitsInStock: number;
    totalSalesRevenue: number;
    totalExpenses: number;
    totalPurchases: number;
    netProfit: number;
    lowStockReplenishmentCost: number;
  };
}

export default function AdminDashboardClient({
  initialProducts,
  initialCategories,
  initialStats,
  initialVendors = [],
  initialTransactions = [],
  initialStoreMetrics,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'crm' | 'vendors'>('overview');

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [transactions, setTransactions] = useState<StoreTransaction[]>(initialTransactions);
  const [stats, setStats] = useState(initialStats);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filters for products
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Search & Filters for Store Transactions & Vendors
  const [txFilterType, setTxFilterType] = useState<'all' | 'sale' | 'expense' | 'purchase_order' | 'refund'>('all');
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [vendorStatusFilter, setVendorStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [prefilledTxType, setPrefilledTxType] = useState<'sale' | 'expense' | 'purchase_order' | 'refund'>('sale');
  const [prefilledVendorId, setPrefilledVendorId] = useState<string>('');

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'product' | 'category' | 'vendor' | 'transaction';
    id: string;
    name: string;
  } | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Real-time computed Store CRM Financial Metrics based on actual catalog & transaction state
  const computedMetrics = useMemo(() => {
    let retailInventoryValue = 0;
    let costInventoryValue = 0;
    let totalUnitsInStock = 0;
    let lowStockReplenishmentCost = 0;

    products.forEach((p) => {
      const qty = p.stockQuantity ?? 0;
      const price = p.discountPrice || p.price || 0;
      const cost = p.costPrice != null ? p.costPrice : Math.round(p.price * 0.7);
      retailInventoryValue += price * qty;
      costInventoryValue += cost * qty;
      totalUnitsInStock += qty;
      if (qty <= 10) {
        lowStockReplenishmentCost += Math.max(0, 15 - qty) * cost;
      }
    });

    const potentialGrossProfit = Math.max(0, retailInventoryValue - costInventoryValue);
    const potentialMarginPercent = retailInventoryValue > 0 ? (potentialGrossProfit / retailInventoryValue) * 100 : 0;

    let totalSalesRevenue = 0;
    let totalExpenses = 0;
    let totalPurchases = 0;
    let totalRefunds = 0;

    transactions.forEach((tx) => {
      if (tx.status === 'completed' || !tx.status) {
        if (tx.type === 'sale') totalSalesRevenue += tx.amount;
        else if (tx.type === 'expense') totalExpenses += tx.amount;
        else if (tx.type === 'purchase_order') totalPurchases += tx.amount;
        else if (tx.type === 'refund') totalRefunds += tx.amount;
      }
    });

    const netCashProfit = totalSalesRevenue - totalExpenses - totalRefunds;

    return {
      retailInventoryValue,
      costInventoryValue,
      potentialGrossProfit,
      potentialMarginPercent: Math.round(potentialMarginPercent * 10) / 10,
      totalUnitsInStock,
      totalSalesRevenue,
      totalExpenses,
      totalPurchases,
      totalRefunds,
      netCashProfit,
      lowStockReplenishmentCost,
    };
  }, [products, transactions]);

  // Refresh all data from APIs
  const refreshData = async (showNotification: boolean | unknown = true) => {
    const notify = typeof showNotification === 'boolean' ? showNotification : true;
    setIsRefreshing(true);
    try {
      const [prodRes, catRes, statsRes, venRes, txRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/stats'),
        fetch('/api/admin/vendors'),
        fetch('/api/admin/store/transactions'),
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
      if (venRes.ok) {
        const vData = await venRes.json();
        setVendors(vData.vendors || []);
      }
      if (txRes.ok) {
        const tData = await txRes.json();
        setTransactions(tData.transactions || []);
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
      } else if (type === 'category') {
        const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setCategories((prev) => prev.filter((c) => c._id !== id && (c as any).id !== id));
          showToast('Category deleted successfully');
          await refreshData(false);
          router.refresh();
        } else {
          showToast('Failed to delete category', 'error');
        }
      } else if (type === 'vendor') {
        const res = await fetch(`/api/admin/vendors/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setVendors((prev) => prev.filter((v) => v._id !== id && v.id !== id));
          showToast('Vendor deleted successfully');
          await refreshData(false);
          router.refresh();
        } else {
          showToast('Failed to delete vendor', 'error');
        }
      } else if (type === 'transaction') {
        const res = await fetch(`/api/admin/store/transactions?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setTransactions((prev) => prev.filter((t) => t._id !== id && t.id !== id));
          showToast('Transaction removed from ledger');
          await refreshData(false);
          router.refresh();
        } else {
          showToast('Failed to delete transaction', 'error');
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
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

            <button
              onClick={() => setActiveTab('crm')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'crm'
                  ? 'bg-primary text-primary-foreground shadow-sm dark:bg-white dark:text-black'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Store CRM</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold">
                Calc
              </span>
            </button>

            <button
              onClick={() => setActiveTab('vendors')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'vendors'
                  ? 'bg-primary text-primary-foreground shadow-sm dark:bg-white dark:text-black'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Vendors</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-primary/20 text-current">
                {vendors.length}
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
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto px-3 py-2 bg-secondary/15 border-t border-border/40 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-primary text-primary-foreground dark:bg-white dark:text-black shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'products'
                ? 'bg-primary text-primary-foreground dark:bg-white dark:text-black shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'categories'
                ? 'bg-primary text-primary-foreground dark:bg-white dark:text-black shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'crm'
                ? 'bg-primary text-primary-foreground dark:bg-white dark:text-black shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Store CRM & Calc
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'vendors'
                ? 'bg-primary text-primary-foreground dark:bg-white dark:text-black shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Vendors ({vendors.length})
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

            {/* Store CRM & Supplier Intelligence Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* CRM Card */}
              <div 
                onClick={() => setActiveTab('crm')}
                className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-card to-background border border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-xl transition-all cursor-pointer group space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-foreground">Store CRM & Financials</h3>
                      <p className="text-xs text-muted-foreground">Cashflow, margins & calculators</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Open Suite</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Potential Profit in Stock</span>
                    <span className="font-black text-sm text-foreground">
                      Rs. {computedMetrics.potentialGrossProfit.toLocaleString()} ({computedMetrics.potentialMarginPercent}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Realized Sales Ledger</span>
                    <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                      Rs. {computedMetrics.totalSalesRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vendors Card */}
              <div 
                onClick={() => setActiveTab('vendors')}
                className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-card to-background border border-blue-500/20 hover:border-blue-500/40 hover:shadow-xl transition-all cursor-pointer group space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-foreground">Supplier & Vendor Portal</h3>
                      <p className="text-xs text-muted-foreground">Manufacturer tracking & terms</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Manage Vendors</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Registered Suppliers</span>
                    <span className="font-black text-sm text-foreground">
                      {vendors.length} ({vendors.filter(v => v.isActive !== false).length} Active)
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Total Accounts Payable</span>
                    <span className="font-black text-sm text-amber-600 dark:text-amber-400">
                      Rs. {vendors.reduce((a, v) => a + (v.balanceDue || 0), 0).toLocaleString()}
                    </span>
                  </div>
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

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 4: STORE CRM & CALCULATIONS */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'crm' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Store CRM & Intelligence</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Store Financials & Calculations
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Inventory valuations, cost basis, interactive pricing margin models, and transaction ledger.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    setPrefilledTxType('sale');
                    setPrefilledVendorId('');
                    setIsTransactionModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all dark:bg-white dark:text-black cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record Sale</span>
                </button>

                <button
                  onClick={() => {
                    setPrefilledTxType('purchase_order');
                    setPrefilledVendorId('');
                    setIsTransactionModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs border border-border/50 transition-all cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>Record Restock PO</span>
                </button>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Retail Stock Value
                </span>
                <span className="text-lg sm:text-xl font-black text-foreground block truncate">
                  Rs. {computedMetrics.retailInventoryValue.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  {computedMetrics.totalUnitsInStock} total units
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Inventory Cost Basis
                </span>
                <span className="text-lg sm:text-xl font-black text-foreground block truncate">
                  Rs. {computedMetrics.costInventoryValue.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  Wholesale capital tied up
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Potential Gross Profit
                </span>
                <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 block truncate">
                  Rs. {computedMetrics.potentialGrossProfit.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                  {computedMetrics.potentialMarginPercent}% Gross Margin
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Realized Sales Revenue
                </span>
                <span className="text-lg sm:text-xl font-black text-foreground block truncate">
                  Rs. {computedMetrics.totalSalesRevenue.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  Completed orders
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Operating Expenses
                </span>
                <span className="text-lg sm:text-xl font-black text-rose-500 block truncate">
                  Rs. {computedMetrics.totalExpenses.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  Courier, ads, packaging
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Net Realized Cash
                </span>
                <span className={`text-lg sm:text-xl font-black block truncate ${
                  computedMetrics.netCashProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                }`}>
                  Rs. {computedMetrics.netCashProfit.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  Inflows less outflows
                </span>
              </div>
            </div>

            {/* Replenishment Cost Alert Banner */}
            {computedMetrics.lowStockReplenishmentCost > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-foreground block">
                      Low-Stock Capital Required: Rs. {computedMetrics.lowStockReplenishmentCost.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      Estimated procurement budget to bring all {products.filter(p => (p.stockQuantity ?? 0) <= 10).length} low-stock products to a safe 15-unit buffer.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStatusFilter('low_stock');
                    setActiveTab('products');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs whitespace-nowrap self-start sm:self-auto hover:bg-amber-600 transition-all"
                >
                  Review Low Stock Products
                </button>
              </div>
            )}

            {/* Interactive Calculator Suite */}
            <StoreCalculatorsSuite />

            {/* CRM Store Transactions & Ledger */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-foreground">Store Transaction Ledger</h3>
                  <p className="text-xs text-muted-foreground">Detailed log of sales orders, restocks, operational expenses and refunds</p>
                </div>

                <button
                  onClick={() => {
                    setPrefilledTxType('expense');
                    setPrefilledVendorId('');
                    setIsTransactionModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs border border-border/50 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Expense</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by title, customer, vendor, category..."
                    value={txSearchQuery}
                    onChange={(e) => setTxSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border/60 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {txSearchQuery && (
                    <button
                      onClick={() => setTxSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {(['all', 'sale', 'purchase_order', 'expense', 'refund'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTxFilterType(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                        txFilterType === t
                          ? 'bg-primary text-primary-foreground dark:bg-white dark:text-black shadow-sm'
                          : 'bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t === 'all' ? 'All Ledger' : t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transactions Table (Desktop) */}
              <div className="hidden md:block rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary/40 border-b border-border/40 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Title & Details</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Party / Vendor</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {transactions
                      .filter((tx) => {
                        const matchType = txFilterType === 'all' || tx.type === txFilterType;
                        const matchSearch =
                          txSearchQuery === '' ||
                          tx.title.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
                          (tx.customerName && tx.customerName.toLowerCase().includes(txSearchQuery.toLowerCase())) ||
                          (tx.vendorName && tx.vendorName.toLowerCase().includes(txSearchQuery.toLowerCase())) ||
                          (tx.category && tx.category.toLowerCase().includes(txSearchQuery.toLowerCase()));
                        return matchType && matchSearch;
                      })
                      .map((tx) => {
                        const isIncome = tx.type === 'sale';
                        return (
                          <tr key={tx._id || tx.id} className="hover:bg-secondary/20 transition-colors">
                            <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                              {tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString() : 'Recent'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                tx.type === 'sale'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : tx.type === 'purchase_order'
                                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                  : tx.type === 'refund'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              }`}>
                                {tx.type.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-foreground block">{tx.title}</span>
                              {tx.quantity && (
                                <span className="text-[11px] text-muted-foreground">Qty: {tx.quantity} units</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">{tx.category || '-'}</td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {tx.customerName ? `Cust: ${tx.customerName}` : tx.vendorName ? `Ven: ${tx.vendorName}` : '-'}
                            </td>
                            <td className="py-3 px-4 text-right font-black">
                              <span className={isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}>
                                {isIncome ? '+' : '-'}Rs. {tx.amount.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-muted-foreground">
                                {tx.status || 'completed'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setDeleteConfirmation({
                                  type: 'transaction',
                                  id: tx._id || tx.id || '',
                                  name: tx.title,
                                })}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                title="Delete transaction"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-muted-foreground text-xs">
                          No transactions recorded yet. Click <strong>&quot;+ Record Transaction&quot;</strong> above to record sales, expenses, or purchase orders.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Transactions Cards (Mobile) */}
              <div className="md:hidden space-y-3">
                {transactions.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-xs rounded-2xl bg-secondary/20 border border-dashed border-border/60">
                    No transactions recorded yet. Tap &quot;+ Record&quot; to log your first transaction.
                  </div>
                )}
                {transactions
                  .filter((tx) => {
                    const matchType = txFilterType === 'all' || tx.type === txFilterType;
                    const matchSearch =
                      txSearchQuery === '' ||
                      tx.title.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
                      (tx.customerName && tx.customerName.toLowerCase().includes(txSearchQuery.toLowerCase())) ||
                      (tx.vendorName && tx.vendorName.toLowerCase().includes(txSearchQuery.toLowerCase()));
                    return matchType && matchSearch;
                  })
                  .map((tx) => {
                    const isIncome = tx.type === 'sale';
                    return (
                      <div key={tx._id || tx.id} className="p-4 rounded-2xl bg-card border border-border/50 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1 ${
                              tx.type === 'sale'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : tx.type === 'purchase_order'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}>
                              {tx.type.replace('_', ' ')}
                            </span>
                            <h4 className="font-bold text-sm text-foreground">{tx.title}</h4>
                          </div>
                          <span className={`font-black text-sm whitespace-nowrap ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                            {isIncome ? '+' : '-'}Rs. {tx.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/30">
                          <span>{tx.category}</span>
                          <button
                            onClick={() => setDeleteConfirmation({
                              type: 'transaction',
                              id: tx._id || tx.id || '',
                              name: tx.title,
                            })}
                            className="text-destructive font-bold text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 5: VENDORS & SUPPLIERS DIRECTORY */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'vendors' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Procurement & Sourcing</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Vendors & Supplier Management
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Manage distributors, wholesale contacts, payment terms, and product sourcing channels.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingVendor(null);
                  setIsVendorModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all dark:bg-white dark:text-black cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Supplier / Vendor</span>
              </button>
            </div>

            {/* Vendor Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-card border border-border/50 space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Total Suppliers
                </span>
                <span className="text-2xl sm:text-3xl font-black text-foreground block">
                  {vendors.length}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">
                  {vendors.filter((v) => v.isActive !== false).length} Active Partners
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border/50 space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Products Sourced
                </span>
                <span className="text-2xl sm:text-3xl font-black text-foreground block">
                  {products.filter((p) => Boolean(p.vendorId)).length}
                </span>
                <span className="text-xs text-muted-foreground block">
                  Linked to suppliers
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border/50 space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Sourced Stock Value
                </span>
                <span className="text-2xl sm:text-3xl font-black text-foreground block truncate">
                  Rs. {products
                    .filter((p) => Boolean(p.vendorId))
                    .reduce((a, p) => a + (p.price * (p.stockQuantity ?? 1)), 0)
                    .toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground block">
                  In warehouse inventory
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border/50 space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Accounts Payable
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 block truncate">
                  Rs. {vendors.reduce((a, v) => a + (v.balanceDue || 0), 0).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground block">
                  Outstanding balance due
                </span>
              </div>
            </div>

            {/* Search & Status Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search vendors by name, company, phone, contact..."
                  value={vendorSearchQuery}
                  onChange={(e) => setVendorSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-border/60 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {vendorSearchQuery && (
                  <button
                    onClick={() => setVendorSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {(['all', 'active', 'inactive'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setVendorStatusFilter(st)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                      vendorStatusFilter === st
                        ? 'bg-primary text-primary-foreground dark:bg-white dark:text-black shadow-sm'
                        : 'bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {st === 'all' ? 'All Vendors' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Vendors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors
                .filter((v) => {
                  const matchSearch =
                    vendorSearchQuery === '' ||
                    v.name.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
                    (v.company && v.company.toLowerCase().includes(vendorSearchQuery.toLowerCase())) ||
                    (v.contactPerson && v.contactPerson.toLowerCase().includes(vendorSearchQuery.toLowerCase())) ||
                    (v.phone && v.phone.includes(vendorSearchQuery));

                  let matchStatus = true;
                  if (vendorStatusFilter === 'active') matchStatus = v.isActive !== false;
                  else if (vendorStatusFilter === 'inactive') matchStatus = v.isActive === false;

                  return matchSearch && matchStatus;
                })
                .map((v) => {
                  const linkedProducts = products.filter(
                    (p) => p.vendorId === (v._id || v.id) || p.vendorName === v.name
                  );

                  return (
                    <div
                      key={v._id || v.id}
                      className="p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-xl transition-all flex flex-col justify-between space-y-5"
                    >
                      <div className="space-y-4">
                        {/* Title Bar */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">
                              {v.company || 'Direct Supplier'}
                            </span>
                            <h3 className="text-lg font-black text-foreground leading-snug">{v.name}</h3>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            v.isActive !== false
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {v.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {/* Contact details */}
                        <div className="space-y-2 text-xs text-muted-foreground">
                          {v.contactPerson && (
                            <div className="flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <span className="text-foreground font-medium">{v.contactPerson}</span>
                            </div>
                          )}
                          {v.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <a
                                href={`tel:${v.phone}`}
                                className="text-foreground hover:text-primary transition-colors font-medium"
                              >
                                {v.phone}
                              </a>
                            </div>
                          )}
                          {v.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <a
                                href={`mailto:${v.email}`}
                                className="text-foreground hover:text-primary transition-colors font-medium truncate"
                              >
                                {v.email}
                              </a>
                            </div>
                          )}
                          {v.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <span className="truncate">{v.address}</span>
                            </div>
                          )}
                        </div>

                        {/* Terms & Balance Due */}
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/40 text-xs">
                          <div className="p-3 rounded-xl bg-secondary/40">
                            <span className="text-muted-foreground block text-[10px] font-bold">Terms</span>
                            <span className="font-bold text-foreground truncate block">
                              {v.paymentTerms || 'Net 30'}
                            </span>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">
                              Lead: {v.leadTimeDays ?? 7} days
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-secondary/40">
                            <span className="text-muted-foreground block text-[10px] font-bold">Balance Due</span>
                            <span className={`font-black text-xs truncate block ${
                              (v.balanceDue || 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
                            }`}>
                              Rs. {(v.balanceDue || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">
                              {linkedProducts.length} items supplied
                            </span>
                          </div>
                        </div>

                        {/* Linked products preview */}
                        {linkedProducts.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[11px] font-bold text-muted-foreground block mb-1.5">
                              Supplied Products ({linkedProducts.length}):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {linkedProducts.slice(0, 3).map((lp) => (
                                <span
                                  key={lp._id || lp.id}
                                  className="px-2 py-0.5 rounded-lg bg-secondary text-[11px] font-semibold text-foreground truncate max-w-[160px]"
                                >
                                  {lp.title}
                                </span>
                              ))}
                              {linkedProducts.length > 3 && (
                                <span className="px-2 py-0.5 rounded-lg bg-secondary text-[11px] font-semibold text-muted-foreground">
                                  +{linkedProducts.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/40">
                        <button
                          onClick={() => {
                            setPrefilledVendorId(v._id || v.id || '');
                            setPrefilledTxType('purchase_order');
                            setIsTransactionModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Restock</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingVendor(v);
                              setIsVendorModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() =>
                              setDeleteConfirmation({
                                type: 'vendor',
                                id: v._id || v.id || '',
                                name: v.name,
                              })
                            }
                            className="p-1.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                            title="Delete supplier"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {vendors.length === 0 && (
                <div className="col-span-full p-12 text-center rounded-3xl bg-card border border-dashed border-border/80 flex flex-col items-center justify-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-foreground">No Vendors Registered Yet</h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Keep track of your suppliers, manufacturers, payment terms, and wholesale accounts in one place.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingVendor(null);
                      setIsVendorModalOpen(true);
                    }}
                    className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition-all dark:bg-white dark:text-black"
                  >
                    + Add Your First Vendor
                  </button>
                </div>
              )}
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
          vendors={vendors}
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
      {/* VENDOR CREATE / EDIT MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isVendorModalOpen && (
        <VendorFormModal
          vendor={editingVendor}
          onClose={() => {
            setIsVendorModalOpen(false);
            setEditingVendor(null);
          }}
          onSaved={async (savedVendor) => {
            const wasEdit = Boolean(editingVendor);
            setIsVendorModalOpen(false);
            setEditingVendor(null);

            setVendors((prev) => {
              const targetKey = savedVendor._id || savedVendor.id;
              const exists = prev.some((v) => (v._id || v.id) === targetKey);
              if (exists) {
                return prev.map((v) => ((v._id || v.id) === targetKey ? savedVendor : v));
              }
              return [savedVendor, ...prev];
            });

            showToast(wasEdit ? 'Supplier updated successfully' : 'New supplier registered in directory');
            await refreshData(false);
            router.refresh();
          }}
        />
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TRANSACTION RECORD MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isTransactionModalOpen && (
        <TransactionFormModal
          transaction={null}
          products={products}
          vendors={vendors}
          initialType={prefilledTxType}
          initialVendorId={prefilledVendorId}
          onClose={() => {
            setIsTransactionModalOpen(false);
          }}
          onSaved={async (savedTx) => {
            setIsTransactionModalOpen(false);

            setTransactions((prev) => [savedTx, ...prev]);
            showToast('Transaction posted to store ledger');
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
  vendors: Vendor[];
  onClose: () => void;
  onSaved: (product: Product) => void;
}

function ProductFormModal({ product, categories, vendors, onClose, onSaved }: ProductFormModalProps) {
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
  const [costPrice, setCostPrice] = useState<number | ''>(product?.costPrice ?? '');
  const [vendorId, setVendorId] = useState<string>(product?.vendorId || '');
  const [vendorName, setVendorName] = useState<string>(product?.vendorName || '');
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

  const handleVendorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setVendorId(selectedId);
    if (!selectedId) {
      setVendorName('');
    } else {
      const v = vendors.find((ven) => (ven._id === selectedId || ven.id === selectedId));
      setVendorName(v ? v.name : '');
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
      costPrice: costPrice !== '' ? Number(costPrice) : null,
      vendorId: vendorId || null,
      vendorName: vendorName || null,
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
    <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
      <div className="bg-card border-t sm:border border-border/80 rounded-t-3xl sm:rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col h-[94vh] sm:h-auto sm:max-h-[90vh] animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b border-border/40 bg-secondary/20 flex-shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-black text-foreground">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              {isEdit ? `Updating ${product?.title}` : 'Fill in product information for Neon database'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm">
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-primary">2. Pricing, Cost Basis & Vendor</h3>
              {costPrice !== '' && price !== '' && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Gross Profit: Rs. {((discountPrice !== '' ? Number(discountPrice) : Number(price)) - Number(costPrice)).toLocaleString()} (
                  {Math.round((((discountPrice !== '' ? Number(discountPrice) : Number(price)) - Number(costPrice)) / (discountPrice !== '' ? Number(discountPrice) : Number(price))) * 1000) / 10}% Margin)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Retail Price (Rs.) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="29900"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground font-semibold"
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
                <label className="font-bold text-foreground">Wholesale Cost (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Cost basis"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Supplier / Vendor</label>
                <select
                  value={vendorId}
                  onChange={handleVendorChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground text-xs"
                >
                  <option value="">Direct / In-House</option>
                  {vendors.map((v) => (
                    <option key={v._id || v.id} value={v._id || v.id}>
                      {v.name} {v.company ? `(${v.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

          {/* Sticky Footer Submit for Small Screens */}
          <div className="sticky bottom-0 z-20 bg-card/95 backdrop-blur-md pt-3.5 pb-2 sm:pt-4 sm:pb-3 border-t border-border/60 -mx-4 px-4 sm:-mx-6 sm:px-6 mt-4 flex items-center justify-between gap-3 shadow-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-secondary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 sm:px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 dark:bg-white dark:text-black"
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
