'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingCart, ArrowRight, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { urlFor } from '@/lib/sanity'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export function CartDrawer() {
  const { isCartOpen, toggleCart, items, updateQuantity, removeItem } = useCartStore()

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        toggleCart()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCartOpen, toggleCart])

  const subtotal = items.reduce((acc, item) => {
    const itemPrice = item.discountPrice || item.price
    return acc + (itemPrice * item.quantity)
  }, 0)

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            aria-hidden="true"
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[110]"
          />

          {/* Side Drawer */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Cart"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[90vw] sm:max-w-md bg-background border-l border-border/40 shadow-2xl z-[120] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 md:px-8 md:py-6 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg md:text-xl font-black tracking-tight text-foreground">Your Cart</h2>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button 
                onClick={toggleCart} 
                className="p-2.5 hover:bg-secondary rounded-xl transition-all active:scale-90 text-muted-foreground hover:text-foreground"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
                  <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingCart className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <p className="text-lg font-bold text-foreground mb-2">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground max-w-[240px]">
                    Browse our collection and add items you love
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {items.map((item, index) => {
                    const itemImageUrl = (item.images && item.images[0])
                      ? urlFor(item.images[0]).url()
                      : (item as any).image
                        ? (typeof (item as any).image === 'string' ? (item as any).image : urlFor((item as any).image).url())
                        : '/placeholder.jpg'

                    return (
                      <motion.div 
                        key={item._id} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group flex gap-4 p-5 md:p-6 hover:bg-secondary/20 transition-colors"
                      >
                        <div className="relative w-20 h-20 md:w-24 md:h-24 bg-secondary/50 rounded-2xl overflow-hidden flex-shrink-0 border border-border/30">
                          <Image 
                            src={itemImageUrl} 
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="100px"
                          />
                        </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-sm md:text-base line-clamp-2 text-foreground leading-snug">
                              {item.name}
                            </h3>
                            <button 
                              onClick={() => removeItem(item._id)}
                              className="text-muted-foreground/40 hover:text-destructive p-1 transition-colors rounded-lg hover:bg-destructive/10 flex-shrink-0"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            {item.discountPrice ? (
                              <>
                                <span className="text-sm font-bold text-foreground">Rs. {item.discountPrice.toLocaleString()}</span>
                                <span className="text-xs text-muted-foreground/50 line-through">Rs. {item.price.toLocaleString()}</span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-foreground">Rs. {item.price.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center bg-secondary/50 dark:bg-secondary/30 rounded-xl overflow-hidden border border-border/40">
                            <button 
                              className="p-2 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                              onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold px-3 min-w-[3ch] text-center text-foreground">{item.quantity}</span>
                            <button 
                              className="p-2 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              disabled={item.quantity >= 5}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <span className="text-sm font-bold text-primary">
                            Rs. {((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border/40 bg-secondary/5 p-6 md:p-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Subtotal</span>
                    <span className="font-bold text-foreground">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Shipping</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Free</span>
                  </div>
                  <div className="h-px bg-border/60" />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-foreground">Total</span>
                    <span className="font-black text-xl text-primary">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                </div>
                <button className="w-full relative overflow-hidden group/checkout bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all dark:bg-white dark:text-black">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 group-hover/checkout:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/checkout:translate-x-full transition-transform duration-700" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
