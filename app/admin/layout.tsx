import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Portal | JTech Mart',
  description: 'Manage store products, categories, inventory, and settings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {children}
    </div>
  );
}
