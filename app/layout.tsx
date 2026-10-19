import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'
import { ThemeProvider } from '@/components/ThemeProvider'
import { MobileBottomNav } from '@/components/MobileBottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'JTech Mart - Premium Tech Essentials',
    template: '%s | JTech Mart'
  },
  description: 'Discover the latest in smart technology with JTech Mart. Premium smart watches and audio devices designed for the modern lifestyle.',
  keywords: ['smart watches', 'earbuds', 'headphones', 'tech', 'electronics', 'Pakistan'],
  authors: [{ name: 'JTech Mart' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://abrar-two.vercel.app',
    siteName: 'JTech Mart',
    title: 'JTech Mart - Premium Tech Essentials',
    description: 'Discover the latest in smart technology with JTech Mart. Premium smart watches and audio devices.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JTech Mart - Premium Tech Essentials',
    description: 'Discover the latest in smart technology with JTech Mart.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                var d = t === 'dark' || ((!t || t === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (d) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider>
          <Navbar />
          <CartDrawer />
          <MobileBottomNav />
          <main className="flex-1 bg-background text-foreground pb-16 md:pb-0">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
