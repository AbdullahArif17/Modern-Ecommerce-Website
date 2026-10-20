/**
 * Script to automatically seed products into Sanity
 * 
 * To run this script:
 * 1. Install tsx: npm install -D tsx
 * 2. Set SANITY_API_TOKEN in your .env file (get it from https://sanity.io/manage)
 * 3. Run: npm run seed
 * OR
 * Run directly: npx tsx scripts/seed-products.ts
 * 
 * Note: You need a Sanity API token with write permissions
 * Get it from: https://sanity.io/manage → Your Project → API → Tokens → Add API token
 */

import { createClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET');
}

if (!token) {
  throw new Error('Missing SANITY_API_TOKEN. Get it from https://sanity.io/manage');
}

// Create authenticated client for writing
const client = createClient({
  projectId,
  dataset,
  apiVersion: '2023-01-01',
  useCdn: false,
  token, // Required for write operations
});

const products = [
  {
    _type: 'product',
    title: 'Logitech B100 Optical USB Mouse',
    slug: {
      _type: 'slug',
      current: 'logitech-b100-optical-usb-mouse'
    },
    price: 1150,
    description: 'It works right out of the box. This plug-and-play mouse is simple to set up—you just plug it into your USB and get back to business.',
    category: 'mouse',
    featured: true,
    features: ['Ready in No Time', 'Comfort for Either Hand', 'Durable and Reliable', 'Broad Compatibility']
  },
  {
    _type: 'product',
    title: 'Usb',
    slug: {
      _type: 'slug',
      current: 'usb'
    },
    price: 1150,
    description: 'High-speed reliable USB storage and connectivity adapter.',
    category: 'accessories',
    featured: true,
    features: ['High-speed data transfer', 'Plug and play', 'Compact durable housing']
  },
  {
    _type: 'product',
    title: 'Stand',
    slug: {
      _type: 'slug',
      current: 'stand'
    },
    price: 1100,
    description: 'Universal ergonomic stand for comfortable device viewing.',
    category: 'accessories',
    featured: true,
    features: ['Ergonomic angle', 'Durable construction', 'Universal fit']
  }
];

async function seedProducts() {
  console.log('🌱 Starting to seed products...\n');

  try {
    for (const product of products) {
      // Check if product already exists
      const existing = await client.fetch(
        `*[_type == "product" && slug.current == $slug][0]`,
        { slug: product.slug.current }
      );

      if (existing) {
        console.log(`⏭️  Skipping "${product.title}" - already exists`);
        continue;
      }

      // Create the product
      const created = await client.create(product);
      console.log(`✅ Created: ${product.title} (ID: ${created._id})`);
    }

    console.log('\n✨ Seeding completed!');
    console.log('\n📝 Note: You need to upload images manually in Sanity Studio at /studio');
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
