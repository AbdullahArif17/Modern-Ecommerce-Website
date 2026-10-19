'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"
import { motion } from 'framer-motion'

export function Footer() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) {
    return null
  }
  return (
    <footer className="bg-gradient-to-b from-background via-secondary/20 to-background border-t border-border/50 pt-20 pb-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="font-bold text-2xl mb-4 tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary bg-clip-text text-transparent">JTech Mart</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs leading-relaxed">
              Premium tech essentials for the modern lifestyle. Simplified, elegant, and built to last.
            </p>
            <div className="flex gap-3">
              <motion.a 
                href="https://www.facebook.com/profile.php?id=61570515511522" 
                target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-primary transition-all"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a 
                href="https://www.instagram.com/j_tech.mart" 
                target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-primary transition-all"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a 
                href="#" 
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-primary transition-all"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="font-bold text-base mb-6 text-foreground">Shop</h3>
            <ul className="space-y-3.5">
              <li><Link href="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block hover:translate-x-1 transform">All Products</Link></li>
              <li><Link href="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block hover:translate-x-1 transform">Smart Watches</Link></li>
              <li><Link href="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block hover:translate-x-1 transform">Audio</Link></li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-bold text-base mb-6 text-foreground">Company</h3>
            <ul className="space-y-3.5">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block hover:translate-x-1 transform">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block hover:translate-x-1 transform">Contact</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block hover:translate-x-1 transform">Careers</Link></li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="font-bold text-base mb-6 text-foreground">Support</h3>
            <ul className="space-y-3.5">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block hover:translate-x-1 transform">Shipping & Returns</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block hover:translate-x-1 transform">FAQ</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block hover:translate-x-1 transform">Terms of Service</Link></li>
            </ul>
          </motion.div>
        </div>
        
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} JTech Mart. All rights reserved.</p>
            <div className="flex gap-6">
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</Link>
            </div>
        </div>
      </div>
    </footer>
  )
}
