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


// Actual authentic store products (matching Sanity store catalog)
export const products: Product[] = [
  {
    _id: '126f7a14-9ae1-4d90-a65d-b7dd4a3ba600',
    id: '126f7a14-9ae1-4d90-a65d-b7dd4a3ba600',
    name: 'Logitech B100 Optical USB Mouse',
    title: 'Logitech B100 Optical USB Mouse',
    slug: 'logitech-b100-optical-usb-mouse',
    brand: 'Logitech',
    price: 1159,
    discountPrice: 990,
    category: 'MOUSE',
    categorySlug: 'mouse',
    image: 'https://cdn.sanity.io/images/b5dr6ut1/production/26feec9e53d41817eb411f320033d41fd7f81ed4-1080x1080.jpg',
    images: [
      'https://cdn.sanity.io/images/b5dr6ut1/production/26feec9e53d41817eb411f320033d41fd7f81ed4-1080x1080.jpg',
      'https://cdn.sanity.io/images/b5dr6ut1/production/ba6b3a322209d14863c9acd0011670876c281d4f-1080x1080.jpg',
      'https://cdn.sanity.io/images/b5dr6ut1/production/f08cd21681c2c2ba6ca08c9ea6b0fefcef190bf2-1080x1080.jpg',
      'https://cdn.sanity.io/images/b5dr6ut1/production/1c0505aed162017a68cf4901223ec03132690a91-1080x1080.jpg',
    ],
    description: 'It works right out of the box. This plug-and-play mouse is simple to set up—you just plug it into your USB and get back to business.\n- Ready in No Time\n- Comfort for Either Hand\n- Durable and Reliable\n- Broad Compatibility',
    features: ['Ready in No Time', 'Comfort for Either Hand', 'Durable and Reliable', 'Broad Compatibility'],
    productTags: ['limited'],
    featured: true,
    isActive: true,
    stockStatus: 'in_stock',
    stockQuantity: 50,
    rating: 3,
    reviewCount: 3,
  },
  {
    _id: '8296c901-a25e-40c5-ae4b-7a72c6e434d8',
    id: '8296c901-a25e-40c5-ae4b-7a72c6e434d8',
    name: 'Usb',
    title: 'Usb',
    slug: 'usb',
    brand: 'Chaina',
    price: 1150,
    category: 'Accessories',
    categorySlug: 'accessories',
    image: 'https://cdn.sanity.io/images/b5dr6ut1/production/2ef0939d338611c04584df29503cbd3dd7010d84-1200x1200.jpg',
    images: [
      'https://cdn.sanity.io/images/b5dr6ut1/production/2ef0939d338611c04584df29503cbd3dd7010d84-1200x1200.jpg',
    ],
    description: 'High-speed reliable USB storage and connectivity adapter.',
    features: ['High-speed data transfer', 'Plug and play', 'Compact durable housing'],
    productTags: ['bestseller'],
    featured: true,
    isActive: true,
    stockStatus: 'in_stock',
    stockQuantity: 100,
    sortOrder: 50,
    rating: 5,
    reviewCount: 0,
  },
  {
    _id: 'd484aca7-119e-483f-b36d-46b81835d4ab',
    id: 'd484aca7-119e-483f-b36d-46b81835d4ab',
    name: 'Stand',
    title: 'Stand',
    slug: 'stand',
    brand: 'JTech',
    price: 1100,
    category: 'Accessories',
    categorySlug: 'accessories',
    image: 'https://cdn.sanity.io/images/b5dr6ut1/production/94cff363c6dbe769271159acf55206f2ad47ce7f-1000x1000.png',
    images: [
      'https://cdn.sanity.io/images/b5dr6ut1/production/94cff363c6dbe769271159acf55206f2ad47ce7f-1000x1000.png',
    ],
    description: 'A Stand',
    features: ['A Stand'],
    featured: true,
    isActive: true,
    stockStatus: 'in_stock',
    stockQuantity: 30,
    rating: 5,
    reviewCount: 0,
  },
];
