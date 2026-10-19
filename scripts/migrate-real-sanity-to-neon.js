const { neon } = require('@neondatabase/serverless');
const imageUrlBuilder = require('@sanity/image-url');
const { createClient } = require('@sanity/client');
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const dbMatch = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const databaseUrl = dbMatch ? dbMatch[1] : process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = neon(databaseUrl);

const sanityClient = createClient({
  projectId: 'b5dr6ut1',
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: false,
});

const builder = imageUrlBuilder(sanityClient);

function getImageUrl(asset) {
  if (!asset) return '/placeholder.jpg';
  try {
    return builder.image(asset).url();
  } catch {
    return '/placeholder.jpg';
  }
}

async function main() {
  console.log('Connecting to Neon...');

  // Fetch real categories and products from Sanity
  const rawCategories = await sanityClient.fetch(`*[_type == "category"]`);
  const rawProducts = await sanityClient.fetch(`*[_type == "product"]{
    ...,
    "categoryTitle": category->title,
    "categorySlug": category->slug.current
  }`);

  console.log(`Fetched ${rawCategories.length} categories and ${rawProducts.length} products from Sanity.`);

  // Clear previous dummy data
  await sql`DELETE FROM products`;
  await sql`DELETE FROM categories`;
  console.log('Cleared old dummy data from Neon tables.');

  // Insert real categories
  for (const cat of rawCategories) {
    const slug = cat.slug?.current || cat.title.toLowerCase().replace(/\s+/g, '-');
    const imageUrl = cat.image ? getImageUrl(cat.image) : '/placeholder.jpg';

    await sql`
      INSERT INTO categories (id, title, slug, description, image, sort_order, show_in_hero)
      VALUES (
        ${cat._id},
        ${cat.title},
        ${slug},
        ${cat.description || ''},
        ${imageUrl},
        ${Number(cat.sortOrder) || 0},
        ${Boolean(cat.showInHero ?? true)}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        slug = EXCLUDED.slug,
        image = EXCLUDED.image,
        sort_order = EXCLUDED.sort_order,
        show_in_hero = EXCLUDED.show_in_hero
    `;
    console.log(`Inserted category: ${cat.title} (${slug})`);
  }

  // Insert real products
  for (const prod of rawProducts) {
    const slug = prod.slug?.current || prod._id;
    const images = (prod.images || []).map(img => getImageUrl(img));
    const primaryImage = images.length > 0 ? images[0] : '/placeholder.jpg';
    const categoryTitle = prod.categoryTitle || (prod.category ? 'MOUSE' : 'General');
    const categorySlug = prod.categorySlug || (prod.category ? 'mouse' : 'general');
    const categoryId = prod.category?._ref || null;

    await sql`
      INSERT INTO products (
        id, title, name, slug, brand, sku, price, discount_price, description,
        category_id, category, category_slug, images, image, featured, is_active,
        sort_order, stock_quantity, stock_status, features, specifications,
        product_tags, rating, review_count
      )
      VALUES (
        ${prod._id},
        ${prod.title || 'Untitled'},
        ${prod.title || 'Untitled'},
        ${slug},
        ${prod.brand || 'JTech'},
        ${prod.sku || ''},
        ${Number(prod.price) || 0},
        ${prod.discountPrice ? Number(prod.discountPrice) : null},
        ${prod.description || ''},
        ${categoryId},
        ${categoryTitle},
        ${categorySlug},
        ${JSON.stringify(images)}::jsonb,
        ${primaryImage},
        true, -- Mark featured so they appear on hero carousel
        ${prod.isActive !== false},
        ${Number(prod.sortOrder) || 0},
        ${Number(prod.stockQuantity) || 50},
        ${prod.stockStatus || 'in_stock'},
        ${JSON.stringify(prod.features || [])}::jsonb,
        ${JSON.stringify(prod.specifications || [])}::jsonb,
        ${JSON.stringify(prod.productTags || [])}::jsonb,
        ${prod.rating ? Number(prod.rating) : 5.0},
        ${Number(prod.reviewCount) || 0}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        price = EXCLUDED.price,
        discount_price = EXCLUDED.discount_price,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        category_slug = EXCLUDED.category_slug,
        images = EXCLUDED.images,
        image = EXCLUDED.image,
        featured = EXCLUDED.featured,
        is_active = EXCLUDED.is_active
    `;
    console.log(`Inserted product: ${prod.title} (${slug}) - Rs. ${prod.price}`);
  }

  console.log('Real data migration completed successfully!');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
