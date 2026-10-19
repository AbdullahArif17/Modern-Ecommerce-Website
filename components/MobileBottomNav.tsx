'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, User, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/products', label: 'Shop', icon: ShoppingBag },
    { href: '/about', label: 'About', icon: User },
    { href: '/contact', label: 'Contact', icon: Phone },
  ];

  const isActive = (path: string) => pathname === path;

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] pb-[env(safe-area-inset-bottom)]">
      {/* Gradient fade edge */}
      <div className="absolute -top-6 inset-x-0 h-6 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
      
      <div className="bg-background/90 backdrop-blur-2xl border-t border-border/30 px-2 py-2 flex items-center justify-around shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-2 px-4 rounded-2xl transition-all duration-300",
                active ? "bg-primary/8" : "hover:bg-secondary/50"
              )}
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="relative"
              >
                <item.icon 
                  className={cn(
                    "w-5 h-5 transition-all duration-300",
                    active 
                      ? "text-primary scale-110" 
                      : "text-muted-foreground"
                  )} 
                  strokeWidth={active ? 2.5 : 2}
                />
                {active && (
                  <motion.div
                    layoutId="mobileNavGlow"
                    className="absolute -inset-2 bg-primary/10 rounded-full -z-10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
              </motion.div>
              <span className={cn(
                "text-[10px] font-semibold tracking-tight transition-all duration-300",
                active 
                  ? "text-primary font-bold" 
                  : "text-muted-foreground/70"
              )}>
                {item.label}
              </span>
              {active && (
                <motion.div 
                  layoutId="mobileNavIndicator"
                  className="absolute -bottom-0.5 w-6 h-0.5 rounded-full bg-primary" 
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
