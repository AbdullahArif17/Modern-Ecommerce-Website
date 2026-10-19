export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductColor {
  name: string;
  hex?: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  longDescription?: any[]; // Portable Text blocks
  price: number;
  discountPrice?: number;
  image?: any;
  images?: any[];
  slug: string;
  category: string;
  categorySlug?: string;
  brand?: string;
  sku?: string;
  stockQuantity?: number;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
  videoUrl?: string;
  features?: string[];
  specifications?: ProductSpecification[];
  whatsInTheBox?: string[];
  warranty?: string;
  weight?: number;
  colors?: ProductColor[];
  sizes?: string[];
  metaTitle?: string;
  metaDescription?: string;
  reviewCount?: number;
  rating?: number;
  productTags?: string[];
  featured?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  _createdAt?: string;

  // Legacy compatibility
  id?: string;
  name?: string;
}

export interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: any;
  sortOrder?: number;
  showInHero?: boolean;
}


// Dummy/fallback products (only used when Sanity is empty)
export const products: Product[] = [
  {
    _id: '1',
    id: '1',
    name: 'Chronos Elite',
    title: 'Chronos Elite',
    slug: 'chronos-elite',
    price: 299,
    category: 'smart-watches',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
    description: 'The ultimate companion for your active lifestyle. Precision tracking meets elegant design.',
    features: ['Always-on Retina Display', 'ECG App', 'Water Resistant 50m'],
  },
  {
    _id: '2',
    id: '2',
    name: 'AeroBuds Pro',
    title: 'AeroBuds Pro',
    slug: 'aerobuds-pro',
    price: 199,
    category: 'earbuds',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800',
    description: 'Immersive sound with active noise cancellation. Tune out the world and tune in to your music.',
    features: ['Active Noise Cancellation', '24h Battery Life', 'Wireless Charging'],
  },
  {
    _id: '3',
    id: '3',
    name: 'Studio Master',
    title: 'Studio Master',
    slug: 'studio-master',
    price: 349,
    category: 'headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    description: 'Professional grade studio headphones for the audiophile in you.',
    features: ['High-Fidelity Audio', 'Memory Foam Ear Cushions', 'Detachable Cable'],
  },
];
