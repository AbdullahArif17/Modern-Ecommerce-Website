'use client';

import React, { useState } from 'react';
import {
  X,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Package,
  Building2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
} from 'lucide-react';
import { StoreTransaction, Product, Vendor } from '@/lib/products';

interface TransactionFormModalProps {
  transaction: StoreTransaction | null;
  products: Product[];
  vendors: Vendor[];
  initialType?: 'sale' | 'expense' | 'purchase_order' | 'refund';
  initialVendorId?: string;
  onClose: () => void;
  onSaved: (tx: StoreTransaction) => void;
}

export function TransactionFormModal({
  transaction,
  products,
  vendors,
  initialType = 'sale',
  initialVendorId = '',
  onClose,
  onSaved,
}: TransactionFormModalProps) {
  const isEdit = Boolean(transaction);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [type, setType] = useState<StoreTransaction['type']>(transaction?.type || initialType);
  const [title, setTitle] = useState(transaction?.title || '');
  const [amount, setAmount] = useState<number | ''>(transaction?.amount ?? '');
  const [category, setCategory] = useState(transaction?.category || (initialType === 'sale' ? 'Retail Sale' : 'Inventory Restock'));
  const [vendorId, setVendorId] = useState(transaction?.vendorId || initialVendorId);
  const [productId, setProductId] = useState(transaction?.productId || '');
  const [quantity, setQuantity] = useState<number | ''>(transaction?.quantity ?? 1);
  const [customerName, setCustomerName] = useState(transaction?.customerName || '');
  const [paymentMethod, setPaymentMethod] = useState(transaction?.paymentMethod || 'Cash on Delivery');
  const [status, setStatus] = useState<StoreTransaction['status']>(transaction?.status || 'completed');
  const [notes, setNotes] = useState(transaction?.notes || '');

  const handleTypeChange = (newType: StoreTransaction['type']) => {
    setType(newType);
    if (newType === 'sale') setCategory('Retail Sale');
    else if (newType === 'expense') setCategory('Shipping & Logistics');
    else if (newType === 'purchase_order') setCategory('Inventory Restock');
    else if (newType === 'refund') setCategory('Customer Return');
  };

  const handleProductSelect = (pId: string) => {
    setProductId(pId);
    if (!pId) return;

    const prod = products.find((p) => p._id === pId || p.id === pId);
    if (prod) {
      const qty = Number(quantity) || 1;
      if (!title) {
        setTitle(`${type === 'sale' ? 'Sale:' : 'Restock:'} ${prod.title}`);
      }
      const unitRate = type === 'purchase_order' 
        ? (prod.costPrice || Math.round(prod.price * 0.7)) 
        : (prod.discountPrice || prod.price);
      setAmount(Math.round(unitRate * qty));

      if (prod.vendorId && !vendorId) {
        setVendorId(prod.vendorId);
      }
    }
  };

  const handleQuantityChange = (qty: number) => {
    setQuantity(qty);
    if (productId) {
      const prod = products.find((p) => p._id === productId || p.id === productId);
      if (prod) {
        const unitRate = type === 'purchase_order' 
          ? (prod.costPrice || Math.round(prod.price * 0.7)) 
          : (prod.discountPrice || prod.price);
        setAmount(Math.round(unitRate * qty));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!title.trim() || amount === '') {
      setError('Transaction Title and Amount (Rs.) are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const matchedVendor = vendors.find((v) => v._id === vendorId || v.id === vendorId);

    const payload = {
      type,
      title: title.trim(),
      amount: Number(amount),
      category: category.trim(),
      vendorId: vendorId || undefined,
      vendorName: matchedVendor ? matchedVendor.name : undefined,
      productId: productId || undefined,
      quantity: quantity !== '' ? Number(quantity) : undefined,
      customerName: customerName.trim() || undefined,
      paymentMethod,
      status,
      notes: notes.trim() || undefined,
    };

    try {
      const res = await fetch('/api/admin/store/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record store transaction');
      }

      onSaved(data.transaction);
    } catch (err: any) {
      setError(err.message || 'Something went wrong saving the transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-card border border-border/80 rounded-3xl max-w-2xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/40 bg-secondary/20">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              type === 'sale' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                : type === 'purchase_order' 
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}>
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">
                Record Store Transaction
              </h2>
              <p className="text-xs text-muted-foreground">
                Post an income sale, operational expense, restock order, or customer refund to the CRM ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange('sale')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                type === 'sale'
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                  : 'bg-background hover:bg-secondary text-foreground border-border/60'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Sale (Income)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('purchase_order')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                type === 'purchase_order'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-background hover:bg-secondary text-foreground border-border/60'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Restock PO</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-background hover:bg-secondary text-foreground border-border/60'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Expense</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('refund')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                type === 'refund'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-background hover:bg-secondary text-foreground border-border/60'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refund</span>
            </button>
          </div>

          {/* Title & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-foreground">Transaction Title / Reference *</label>
              <input
                type="text"
                required
                placeholder="e.g. Order #1042 - Islamabad COD or Courier Fly Bag Batch"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Amount (Rs.) *</label>
              <input
                type="number"
                required
                min="0"
                step="10"
                placeholder="2500"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground font-black text-sm"
              />
            </div>
          </div>

          {/* Product link (Auto-updates stock on completion) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/40">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-primary" />
                <span>Link Product (Optional - Auto Updates Stock)</span>
              </label>
              <select
                value={productId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-background border border-border/60 text-foreground text-xs"
              >
                <option value="">No specific product linked</option>
                {products.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.title} (Stock: {p.stockQuantity ?? 0})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Quantity Units</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => handleQuantityChange(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2 rounded-xl bg-background border border-border/60 text-foreground text-xs font-semibold"
              />
            </div>
          </div>

          {/* Category & Vendor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Ledger Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground text-xs"
              >
                <option value="Retail Sale">Retail Store Sale</option>
                <option value="B2B Wholesale">B2B Wholesale Bulk</option>
                <option value="Inventory Restock">Inventory Restock / Sourcing</option>
                <option value="Shipping & Logistics">Shipping & Courier Delivery</option>
                <option value="Packaging Materials">Packaging Boxes & Flyers</option>
                <option value="Marketing & Ads">Marketing, Meta & Google Ads</option>
                <option value="Utilities & Rent">Office Rent & Utilities</option>
                <option value="Customer Return">Customer Return & Refund</option>
                <option value="Misc Operating">Miscellaneous Operating</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>Supplier / Vendor Link</span>
              </label>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground text-xs"
              >
                <option value="">No vendor (Internal / Storefront)</option>
                {vendors.map((v) => (
                  <option key={v._id || v.id} value={v._id || v.id}>
                    {v.name} {v.company ? `(${v.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Customer / Party Name</label>
              <input
                type="text"
                placeholder="e.g. Asad Qureshi"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground text-xs"
              >
                <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                <option value="Bank Transfer">Bank Transfer (IBFT)</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
                <option value="Store Credit">Store Credit / Advance</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StoreTransaction['status'])}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground text-xs font-bold"
              >
                <option value="completed">Completed / Settled</option>
                <option value="pending">Pending / In Transit</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground">Notes / Tracking / Invoice ID</label>
            <textarea
              rows={2}
              placeholder="e.g. Courier tracking #TCS-9018231. Restocked from supplier warehouse..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-secondary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all dark:bg-white dark:text-black disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : 'Record Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
