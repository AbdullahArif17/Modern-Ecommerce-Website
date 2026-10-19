'use client'

import { ShieldCheck, Truck, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

export function BenefitsSection() {
  return (
    <section className="py-28 bg-gradient-to-b from-secondary/20 via-background to-background border-y border-border/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Why Choose Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-primary mb-4">
            Built for Excellence
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We're committed to providing you with the best shopping experience
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          <motion.div 
            className="group flex flex-col items-center text-center p-8 md:p-10 rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-2xl transition-all duration-500"
            whileHover={{ y: -12, scale: 1.03 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-2xl flex items-center justify-center shadow-xl text-primary mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Truck className="w-9 h-9" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Free Shipping</h3>
            <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed text-base">
              Enjoy free shipping on all orders over Rs. 5,000. Delivered safely to your doorstep.
            </p>
          </motion.div>
          <motion.div 
            className="group flex flex-col items-center text-center p-8 md:p-10 rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-2xl transition-all duration-500"
            whileHover={{ y: -12, scale: 1.03 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-2xl flex items-center justify-center shadow-xl text-primary mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-primary">1-Year Warranty</h3>
            <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed text-base">
              We stand by our quality. All products come with a comprehensive 1-year official warranty.
            </p>
          </motion.div>
          <motion.div 
            className="group flex flex-col items-center text-center p-8 md:p-10 rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-2xl transition-all duration-500"
            whileHover={{ y: -12, scale: 1.03 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-2xl flex items-center justify-center shadow-xl text-primary mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Clock className="w-9 h-9" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-primary">7-Day Returns</h3>
            <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed text-base">
              Not satisfied? Return or replace within 7 days with our hassle-free policy.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
