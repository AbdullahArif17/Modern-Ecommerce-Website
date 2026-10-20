'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export function WhatsAppButton({
  phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923128506017',
  defaultMessage = 'Hello JTech Mart, I have an inquiry about your products.',
}: WhatsAppButtonProps) {
  const pathname = usePathname();
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Auto-show tooltip briefly after 3 seconds on initial visit to attract attention
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setShowTooltip(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasInteracted]);

  // Don't show WhatsApp floating button on admin dashboard or admin login
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  return (
    <div className="fixed bottom-24 md:bottom-7 right-4 md:right-7 z-[50] flex flex-col items-end">
      {/* Speech Bubble / Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-2.5 max-w-[220px] bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl p-3 text-xs text-foreground relative group"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
                setHasInteracted(true);
              }}
              className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-full flex items-center justify-center text-[10px] shadow-sm transition-all"
              aria-label="Dismiss message"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-[11px] text-foreground">JTech Mart Support</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Need quick help or have an order query? Chat with us on WhatsApp!
            </p>
            {/* Arrow */}
            <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-card border-r border-b border-border/80 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        onClick={() => {
          setShowTooltip(false);
          setHasInteracted(true);
        }}
        onMouseEnter={() => !hasInteracted && setShowTooltip(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative group flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white shadow-[0_10px_25px_-5px_rgba(37,211,102,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(37,211,102,0.7)] transition-shadow duration-300"
      >
        {/* Glow / Pulse ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping opacity-60 pointer-events-none group-hover:hidden" />

        {/* Online Badge Dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-300 border-2 border-white dark:border-zinc-950 rounded-full z-10 shadow-sm" />

        {/* WhatsApp Icon (Official SVG) */}
        <svg
          viewBox="0 0 32 32"
          className="w-7 h-7 sm:w-8 sm:h-8 fill-current relative z-10 drop-shadow-sm"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 2C8.28 2 2 8.28 2 16c0 2.58.7 5.01 1.93 7.12L2 30l7.07-1.87A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.6c-2.28 0-4.43-.63-6.28-1.72l-.45-.27-4.66 1.23 1.25-4.54-.29-.47A11.58 11.58 0 0 1 4.4 16c0-6.4 5.2-11.6 11.6-11.6s11.6 5.2 11.6 11.6-5.2 11.6-11.6 11.6zm6.36-8.72c-.35-.18-2.07-1.02-2.39-1.14-.32-.12-.55-.18-.78.18-.23.35-.9 1.14-1.1 1.37-.2.23-.4.26-.75.09-.35-.18-1.48-.55-2.82-1.74-1.04-.93-1.74-2.08-1.94-2.43-.2-.35-.02-.54.16-.71.16-.16.35-.4.52-.61.18-.2.23-.35.35-.58.12-.23.06-.44-.03-.61-.09-.18-.78-1.89-1.07-2.58-.29-.68-.58-.59-.78-.6-.2-.01-.43-.01-.67-.01s-.61.09-.93.44c-.32.35-1.22 1.2-1.22 2.92s1.25 3.39 1.42 3.62c.18.23 2.46 3.76 5.96 5.27.83.36 1.48.57 1.99.73.84.27 1.6.23 2.2.14.67-.1 2.07-.85 2.36-1.66.29-.82.29-1.52.2-1.66-.08-.14-.31-.23-.66-.41z" />
        </svg>

        {/* Hover pill label for desktop */}
        <span className="hidden md:group-hover:flex items-center absolute right-full mr-3 px-3 py-1.5 bg-zinc-900/90 dark:bg-white/95 text-white dark:text-zinc-900 text-xs font-bold rounded-xl whitespace-nowrap shadow-xl border border-white/10 dark:border-zinc-800/20 backdrop-blur-md pointer-events-none transition-all duration-200">
          Chat on WhatsApp
        </span>
      </motion.a>
    </div>
  );
}
