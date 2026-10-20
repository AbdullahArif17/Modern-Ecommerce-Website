'use client';

import React, { useState } from 'react';
import {
  Calculator,
  Percent,
  TrendingUp,
  Truck,
  Target,
  ArrowRight,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Coins,
  PackageCheck,
  BadgePercent,
  Sliders,
} from 'lucide-react';

export function StoreCalculatorsSuite() {
  const [activeCalc, setActiveCalc] = useState<'margin' | 'promo' | 'courier' | 'target'>('margin');

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Margin & Markup State
  // ─────────────────────────────────────────────────────────────────────────────
  const [costPrice, setCostPrice] = useState<number>(1000);
  const [marginPercent, setMarginPercent] = useState<number>(35);

  const calculatedSellingPrice = marginPercent < 100 
    ? Math.round(costPrice / (1 - marginPercent / 100))
    : costPrice;
  const calculatedProfit = Math.max(0, calculatedSellingPrice - costPrice);
  const calculatedMarkup = costPrice > 0 
    ? Math.round(((calculatedSellingPrice - costPrice) / costPrice) * 1000) / 10 
    : 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Promotional Discount Simulator State
  // ─────────────────────────────────────────────────────────────────────────────
  const [promoOriginalPrice, setPromoOriginalPrice] = useState<number>(2500);
  const [promoCostPrice, setPromoCostPrice] = useState<number>(1400);
  const [promoDiscountPercent, setPromoDiscountPercent] = useState<number>(20);

  const promoDiscountAmount = Math.round(promoOriginalPrice * (promoDiscountPercent / 100));
  const promoSalePrice = Math.max(0, promoOriginalPrice - promoDiscountAmount);
  const promoUnitProfit = promoSalePrice - promoCostPrice;
  const promoOriginalProfit = Math.max(0, promoOriginalPrice - promoCostPrice);
  const promoMarginPercent = promoSalePrice > 0 ? Math.round((promoUnitProfit / promoSalePrice) * 1000) / 10 : 0;
  const volumeMultiplier = (promoUnitProfit > 0 && promoOriginalProfit > 0)
    ? Math.round((promoOriginalProfit / promoUnitProfit) * 100) / 100
    : 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Courier & COD Net Profit Deductor State
  // ─────────────────────────────────────────────────────────────────────────────
  const [courierRetailPrice, setCourierRetailPrice] = useState<number>(2990);
  const [courierCostPrice, setCourierCostPrice] = useState<number>(1600);
  const [courierShippingFee, setCourierShippingFee] = useState<number>(250);
  const [courierPackagingFee, setCourierPackagingFee] = useState<number>(80);
  const [courierCodFeePercent, setCourierCodFeePercent] = useState<number>(2.5);
  const [courierRtoBufferPercent, setCourierRtoBufferPercent] = useState<number>(5.0);

  const codFeeAmount = Math.round(courierRetailPrice * (courierCodFeePercent / 100));
  const rtoRiskAmount = Math.round(courierRetailPrice * (courierRtoBufferPercent / 100));
  const totalDeductions = courierCostPrice + courierShippingFee + courierPackagingFee + codFeeAmount + rtoRiskAmount;
  const netInPocketProfit = courierRetailPrice - totalDeductions;
  const netInPocketMargin = courierRetailPrice > 0 ? Math.round((netInPocketProfit / courierRetailPrice) * 1000) / 10 : 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Target Monthly Revenue & Profit Planner State
  // ─────────────────────────────────────────────────────────────────────────────
  const [targetMonthlyProfit, setTargetMonthlyProfit] = useState<number>(200000);
  const [targetAov, setTargetAov] = useState<number>(2800);
  const [targetNetMarginPercent, setTargetNetMarginPercent] = useState<number>(28);
  const [targetFixedOverheads, setTargetFixedOverheads] = useState<number>(60000);

  const totalRequiredGrossProfit = targetMonthlyProfit + targetFixedOverheads;
  const requiredMonthlyRevenue = targetNetMarginPercent > 0 
    ? Math.round(totalRequiredGrossProfit / (targetNetMarginPercent / 100))
    : 0;
  const requiredOrdersPerMonth = targetAov > 0 ? Math.ceil(requiredMonthlyRevenue / targetAov) : 0;
  const requiredOrdersPerDay = Math.ceil(requiredOrdersPerMonth / 30);
  const requiredDailyRevenue = Math.round(requiredMonthlyRevenue / 30);

  return (
    <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive CRM Calculators</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            Store Pricing & Profit Calculation Suite
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time modeling for pricing markups, promotional discount clearance, courier COD deductions, and monthly targets.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-secondary/60 p-1.5 rounded-2xl border border-border/50">
          <button
            onClick={() => setActiveCalc('margin')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCalc === 'margin'
                ? 'bg-primary text-primary-foreground dark:bg-white dark:text-black shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Margin & Markup</span>
          </button>

          <button
            onClick={() => setActiveCalc('promo')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCalc === 'promo'
                ? 'bg-primary text-primary-foreground dark:bg-white dark:text-black shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BadgePercent className="w-3.5 h-3.5" />
            <span>Sale Simulator</span>
          </button>

          <button
            onClick={() => setActiveCalc('courier')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCalc === 'courier'
                ? 'bg-primary text-primary-foreground dark:bg-white dark:text-black shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Courier & COD Net</span>
          </button>

          <button
            onClick={() => setActiveCalc('target')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCalc === 'target'
                ? 'bg-primary text-primary-foreground dark:bg-white dark:text-black shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Target Planner</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. MARGIN & MARKUP CALCULATOR */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeCalc === 'margin' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-150">
          <div className="lg:col-span-6 space-y-5 bg-secondary/30 p-5 sm:p-6 rounded-2xl border border-border/50">
            <h3 className="text-sm font-black text-foreground flex items-center justify-between">
              <span>Wholesale Cost & Desired Margin</span>
              <button
                onClick={() => {
                  setCostPrice(1000);
                  setMarginPercent(35);
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Product Wholesale Cost Price (Rs.)</span>
                <span className="text-primary font-black">Rs. {costPrice.toLocaleString()}</span>
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={costPrice}
                onChange={(e) => setCostPrice(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/70 text-foreground font-semibold"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground">Target Gross Profit Margin (%)</span>
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-black">
                  {marginPercent}% Margin
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="85"
                step="1"
                value={marginPercent}
                onChange={(e) => setMarginPercent(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-secondary rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                <span>5% (Low Margin)</span>
                <span>35% (Healthy Retail)</span>
                <span>50% (High Margin)</span>
                <span>80% (Luxury/Specialty)</span>
              </div>
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-bold text-muted-foreground">Presets:</span>
              {[20, 30, 35, 45, 55].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setMarginPercent(pct)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    marginPercent === pct
                      ? 'bg-primary text-primary-foreground dark:bg-white dark:text-black'
                      : 'bg-background hover:bg-secondary text-foreground border border-border/50'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Results Card */}
          <div className="lg:col-span-6 bg-gradient-to-br from-card via-card to-secondary/30 p-6 rounded-2xl border border-primary/20 shadow-md space-y-5">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
              Recommended Retail Price Breakdown
            </span>

            <div className="p-4 rounded-xl bg-background/80 border border-border/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Selling Price Tag</span>
                <span className="text-2xl sm:text-3xl font-black text-foreground">
                  Rs. {calculatedSellingPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground block font-medium">Profit per Unit</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  +Rs. {calculatedProfit.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/40">
                <span className="text-muted-foreground block text-[11px]">Markup on Wholesale</span>
                <span className="text-base font-black text-foreground">+{calculatedMarkup}% Markup</span>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/40">
                <span className="text-muted-foreground block text-[11px]">Gross Margin Share</span>
                <span className="text-base font-black text-foreground">{marginPercent}% Margin</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed bg-primary/5 p-3.5 rounded-xl border border-primary/10">
              💡 <strong>Formula Insight:</strong> To realize a true <strong>{marginPercent}% profit margin</strong> on a product costing Rs. {costPrice.toLocaleString()}, you must price it at <strong>Rs. {calculatedSellingPrice.toLocaleString()}</strong>. That represents a <strong>{calculatedMarkup}% markup</strong> over your cost.
            </p>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. PROMOTIONAL SALE & CLEARANCE SIMULATOR */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeCalc === 'promo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-150">
          <div className="lg:col-span-6 space-y-4 bg-secondary/30 p-5 sm:p-6 rounded-2xl border border-border/50">
            <h3 className="text-sm font-black text-foreground flex items-center justify-between">
              <span>Campaign Sale Parameters</span>
              <button
                onClick={() => {
                  setPromoOriginalPrice(2500);
                  setPromoCostPrice(1400);
                  setPromoDiscountPercent(20);
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Original Price (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  value={promoOriginalPrice}
                  onChange={(e) => setPromoOriginalPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-border/70 text-foreground font-semibold text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Product Cost (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  value={promoCostPrice}
                  onChange={(e) => setPromoCostPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-border/70 text-foreground font-semibold text-xs"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground">Discount Promotion (%)</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black">
                  {promoDiscountPercent}% OFF
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="75"
                step="5"
                value={promoDiscountPercent}
                onChange={(e) => setPromoDiscountPercent(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-secondary rounded-lg cursor-pointer"
              />
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[10, 15, 20, 25, 30, 40, 50].map((disc) => (
                <button
                  key={disc}
                  onClick={() => setPromoDiscountPercent(disc)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    promoDiscountPercent === disc
                      ? 'bg-amber-500 text-white dark:bg-amber-400 dark:text-black'
                      : 'bg-background hover:bg-secondary text-foreground border border-border/50'
                  }`}
                >
                  {disc}%
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-6 bg-gradient-to-br from-card via-card to-amber-500/5 p-6 rounded-2xl border border-amber-500/20 shadow-md space-y-5">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Campaign Financial Projection
            </span>

            <div className="p-4 rounded-xl bg-background/80 border border-border/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Sale Price to Customer</span>
                <span className="text-2xl sm:text-3xl font-black text-foreground">
                  Rs. {promoSalePrice.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground line-through block mt-0.5">
                  Regular: Rs. {promoOriginalPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground block font-medium">Customer Savings</span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                  Save Rs. {promoDiscountAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/40">
                <span className="text-muted-foreground block text-[11px]">Profit Per Unit on Sale</span>
                <span className={`text-base font-black ${promoUnitProfit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                  Rs. {promoUnitProfit.toLocaleString()} ({promoMarginPercent}%)
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/40">
                <span className="text-muted-foreground block text-[11px]">Volume Needed Breakeven</span>
                <span className="text-base font-black text-foreground">
                  {volumeMultiplier > 0 ? `${volumeMultiplier}x Units` : 'N/A'}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 text-foreground">
              ⚡ <strong>Clearance Note:</strong> Since per-unit profit drops from Rs. {promoOriginalProfit.toLocaleString()} to Rs. {promoUnitProfit.toLocaleString()}, you need to sell <strong>{volumeMultiplier}x as many units</strong> ({volumeMultiplier > 1 ? `+${Math.round((volumeMultiplier - 1) * 100)}% volume` : 'same volume'}) to match your non-discounted gross profit!
            </p>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. COURIER, PACKAGING & COD NET DEDUCTOR */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeCalc === 'courier' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-150">
          <div className="lg:col-span-6 space-y-4 bg-secondary/30 p-5 sm:p-6 rounded-2xl border border-border/50 text-xs">
            <h3 className="text-sm font-black text-foreground flex items-center justify-between">
              <span>Order Costs & Logistics Parameters</span>
              <button
                onClick={() => {
                  setCourierRetailPrice(2990);
                  setCourierCostPrice(1600);
                  setCourierShippingFee(250);
                  setCourierPackagingFee(80);
                  setCourierCodFeePercent(2.5);
                  setCourierRtoBufferPercent(5.0);
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Selling Price (Rs.)</label>
                <input
                  type="number"
                  value={courierRetailPrice}
                  onChange={(e) => setCourierRetailPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/70 text-foreground font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Product Cost (Rs.)</label>
                <input
                  type="number"
                  value={courierCostPrice}
                  onChange={(e) => setCourierCostPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/70 text-foreground font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Courier / Rider Fee (Rs.)</label>
                <input
                  type="number"
                  value={courierShippingFee}
                  onChange={(e) => setCourierShippingFee(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/70 text-foreground font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Packaging & Flyer (Rs.)</label>
                <input
                  type="number"
                  value={courierPackagingFee}
                  onChange={(e) => setCourierPackagingFee(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/70 text-foreground font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-foreground">COD Service Fee (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={courierCodFeePercent}
                  onChange={(e) => setCourierCodFeePercent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/70 text-foreground font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">RTO / Return Buffer (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={courierRtoBufferPercent}
                  onChange={(e) => setCourierRtoBufferPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/70 text-foreground font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Deductions Breakdown */}
          <div className="lg:col-span-6 bg-gradient-to-br from-card via-card to-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20 shadow-md space-y-4">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              True In-Pocket Realized Cash
            </span>

            <div className="p-4 rounded-xl bg-background/80 border border-border/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">True Net Profit in Pocket</span>
                <span className={`text-2xl sm:text-3xl font-black ${netInPocketProfit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                  Rs. {netInPocketProfit.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground block font-medium">True Net Margin</span>
                <span className="text-lg font-black text-foreground">
                  {netInPocketMargin}%
                </span>
              </div>
            </div>

            {/* Itemized Waterfall */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Order Selling Price</span>
                <span className="font-bold text-foreground">Rs. {courierRetailPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40 text-rose-500">
                <span>- Product Cost Price</span>
                <span className="font-semibold">-Rs. {courierCostPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40 text-rose-500">
                <span>- Courier Delivery + Packaging</span>
                <span className="font-semibold">-Rs. {(courierShippingFee + courierPackagingFee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40 text-rose-500">
                <span>- COD Fee ({courierCodFeePercent}%) + RTO Buffer ({courierRtoBufferPercent}%)</span>
                <span className="font-semibold">-Rs. {(codFeeAmount + rtoRiskAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 font-black text-sm text-emerald-600 dark:text-emerald-400">
                <span>= Net Cash Take-Home</span>
                <span>Rs. {netInPocketProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. TARGET MONTHLY REVENUE & PROFIT PLANNER */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeCalc === 'target' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-150">
          <div className="lg:col-span-6 space-y-4 bg-secondary/30 p-5 sm:p-6 rounded-2xl border border-border/50 text-xs">
            <h3 className="text-sm font-black text-foreground flex items-center justify-between">
              <span>Goal & Store Economics Inputs</span>
              <button
                onClick={() => {
                  setTargetMonthlyProfit(200000);
                  setTargetAov(2800);
                  setTargetNetMarginPercent(28);
                  setTargetFixedOverheads(60000);
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </h3>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Target Monthly Net Profit (Rs.)</label>
              <input
                type="number"
                step="10000"
                value={targetMonthlyProfit}
                onChange={(e) => setTargetMonthlyProfit(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/70 text-foreground font-black text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Average Order Value (Rs.)</label>
                <input
                  type="number"
                  step="100"
                  value={targetAov}
                  onChange={(e) => setTargetAov(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/70 text-foreground font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Expected Net Margin (%)</label>
                <input
                  type="number"
                  step="1"
                  value={targetNetMarginPercent}
                  onChange={(e) => setTargetNetMarginPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/70 text-foreground font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Monthly Fixed Overheads (Rent, Ads, Staff - Rs.)</label>
              <input
                type="number"
                step="5000"
                value={targetFixedOverheads}
                onChange={(e) => setTargetFixedOverheads(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/70 text-foreground font-semibold"
              />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-6 bg-gradient-to-br from-card via-card to-primary/5 p-6 rounded-2xl border border-primary/20 shadow-md space-y-5">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
              Required Velocity & Milestones
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background/80 border border-border/60">
                <span className="text-[11px] text-muted-foreground block font-medium">Monthly Gross Revenue</span>
                <span className="text-xl sm:text-2xl font-black text-foreground">
                  Rs. {requiredMonthlyRevenue.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-1">
                  Daily: Rs. {requiredDailyRevenue.toLocaleString()} / day
                </span>
              </div>

              <div className="p-4 rounded-xl bg-background/80 border border-border/60">
                <span className="text-[11px] text-muted-foreground block font-medium">Orders Required</span>
                <span className="text-xl sm:text-2xl font-black text-primary">
                  {requiredOrdersPerMonth.toLocaleString()} orders
                </span>
                <span className="text-[11px] text-muted-foreground block mt-1">
                  Target: <strong>{requiredOrdersPerDay} orders / day</strong>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/40 border border-border/40 space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Total Gross Profit Needed:</span>
                <span className="font-bold text-foreground">Rs. {totalRequiredGrossProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Store Fixed Overheads:</span>
                <span className="font-bold text-rose-500">-Rs. {targetFixedOverheads.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-border/40 font-black text-emerald-600 dark:text-emerald-400">
                <span>Net Owner Profit:</span>
                <span>Rs. {targetMonthlyProfit.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed bg-primary/5 p-3 rounded-xl border border-primary/10">
              🎯 <strong>Execution Plan:</strong> To take home <strong>Rs. {targetMonthlyProfit.toLocaleString()}</strong> every month after covering Rs. {targetFixedOverheads.toLocaleString()} in overheads, you need to ship <strong>{requiredOrdersPerDay} orders per day</strong> at an average order size of Rs. {targetAov.toLocaleString()}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
