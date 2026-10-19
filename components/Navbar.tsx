'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'

export function Navbar() {
  const { items, toggleCart } = useCartStore()
  const pathname = usePathname()
  const [scrolled, setScrolled] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const cartCount = mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  const isActive = (path: string) => pathname === path

  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <motion.nav 
      className={cn(
        "sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
        scrolled 
          ? "border-border/50 shadow-lg shadow-black/[0.03] dark:shadow-white/[0.02]" 
          : "border-border/20 shadow-none"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          aria-label="JTech Mart Home"
        >
          <motion.div
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/J Tech Mart Logo-01.png"
              alt="JTech Mart Logo"
              width={180}
              height={180}
              className={cn(
                "w-auto transition-all duration-300",
                scrolled ? "h-14 md:h-16" : "h-16 md:h-20"
              )}
              priority
            />
          </motion.div>
          <div className="hidden sm:flex flex-col">
            <span className="font-black text-lg md:text-xl tracking-tighter text-foreground leading-none">
              JTech Mart
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary/40 leading-none mt-0.5">
              Premium Tech
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center bg-secondary/40 dark:bg-secondary/20 rounded-2xl p-1 border border-border/30">
          {navLinks.map((link) => (
            <Link 
              key={link.label}
              href={link.href}
              className={cn(
                "relative text-sm font-semibold transition-all px-5 py-2.5 rounded-xl",
                isActive(link.href) 
                  ? "text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive(link.href) && (
                <motion.div
                  layoutId="activeNavPill"
                  className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20 dark:shadow-white/10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <motion.button 
            onClick={toggleCart}
            className="relative p-2.5 hover:bg-secondary rounded-xl transition-all text-foreground group"
            aria-label="Open Cart"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
          >
            <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[11px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shadow-lg dark:bg-white dark:text-black"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  )
}
