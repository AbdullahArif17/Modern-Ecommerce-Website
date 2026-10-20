'use client';

import React, { useState } from 'react';
import { X, Building2, Phone, Mail, MapPin, CreditCard, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Vendor } from '@/lib/products';

interface VendorFormModalProps {
  vendor: Vendor | null;
  onClose: () => void;
  onSaved: (vendor: Vendor) => void;
}

export function VendorFormModal({ vendor, onClose, onSaved }: VendorFormModalProps) {
  const isEdit = Boolean(vendor);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState(vendor?.name || '');
  const [company, setCompany] = useState(vendor?.company || '');
  const [contactPerson, setContactPerson] = useState(vendor?.contactPerson || '');
  const [phone, setPhone] = useState(vendor?.phone || '');
  const [email, setEmail] = useState(vendor?.email || '');
  const [address, setAddress] = useState(vendor?.address || '');
  const [paymentTerms, setPaymentTerms] = useState(vendor?.paymentTerms || 'Net 30 Days');
  const [leadTimeDays, setLeadTimeDays] = useState<number | ''>(vendor?.leadTimeDays ?? 7);
  const [balanceDue, setBalanceDue] = useState<number | ''>(vendor?.balanceDue ?? 0);
  const [notes, setNotes] = useState(vendor?.notes || '');
  const [isActive, setIsActive] = useState<boolean>(vendor?.isActive !== false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!name.trim()) {
      setError('Supplier / Vendor Name is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const payload = {
      name: name.trim(),
      company: company.trim() || undefined,
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      paymentTerms,
      leadTimeDays: leadTimeDays !== '' ? Number(leadTimeDays) : 7,
      balanceDue: balanceDue !== '' ? Number(balanceDue) : 0,
      notes: notes.trim() || undefined,
      isActive,
    };

    try {
      const vId = vendor?._id || vendor?.id;
      const url = isEdit ? `/api/admin/vendors/${vId}` : '/api/admin/vendors';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save vendor');
      }

      onSaved(data.vendor);
    } catch (err: any) {
      setError(err.message || 'Something went wrong saving the vendor record');
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
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">
                {isEdit ? 'Edit Supplier / Vendor' : 'Add New Supplier / Vendor'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEdit ? `Updating supplier terms for ${vendor?.name}` : 'Register a manufacturer, distributor or wholesaler'}
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

          {/* Supplier Basic Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Supplier Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Logitech Pakistan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Company / Entity</label>
              <input
                type="text"
                placeholder="e.g. Premier Tech Distributors Ltd."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Tariq Mehmood"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Phone / WhatsApp</label>
              <input
                type="text"
                placeholder="e.g. +92 300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Email Address</label>
              <input
                type="email"
                placeholder="e.g. orders@supplier.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground">Physical Address / Warehouse</label>
            <input
              type="text"
              placeholder="e.g. Hall Road Electronics Market, Lahore"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
            />
          </div>

          {/* Procurement & Payment Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/40">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
              >
                <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                <option value="Advance 100%">100% Advance Payment</option>
                <option value="Advance 50% / Balance COD">50% Advance / 50% Delivery</option>
                <option value="Net 7 Days">Net 7 Days Credit</option>
                <option value="Net 15 Days">Net 15 Days Credit</option>
                <option value="Net 30 Days">Net 30 Days Credit</option>
                <option value="Monthly Settlement">Monthly Settlement</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Lead Time (Days)</label>
              <input
                type="number"
                min="0"
                placeholder="7"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Outstanding Balance Due (Rs.)</label>
              <input
                type="number"
                min="0"
                step="500"
                placeholder="0"
                value={balanceDue}
                onChange={(e) => setBalanceDue(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground font-semibold"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground">Procurement Notes & MOQs</label>
            <textarea
              rows={2}
              placeholder="e.g. Minimum order quantity 10 units. Special discount on orders over 50 units..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-foreground"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-primary"
              />
              <span className="font-bold text-xs text-foreground">Active Supplier (Eligible for Restock & Product Assignment)</span>
            </label>
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
              <span>{isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Vendor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
