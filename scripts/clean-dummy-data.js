const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl && fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf8');
  for (const line of content.split('\n')) {
    if (line.startsWith('DATABASE_URL=')) {
      dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
      break;
    }
  }
}

if (!dbUrl) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const sql = neon(dbUrl);

async function cleanDummyData() {
  console.log('🧹 Cleaning dummy data from Neon database...');

  // 1. Delete test/dummy products (keep only authentic Sanity products)
  const deletedProducts = await sql`
    DELETE FROM products 
    WHERE id NOT IN (
      '126f7a14-9ae1-4d90-a65d-b7dd4a3ba600',
      '8296c901-a25e-40c5-ae4b-7a72c6e434d8',
      'd484aca7-119e-483f-b36d-46b81835d4ab'
    )
    RETURNING id, title
  `;
  console.log('✓ Removed dummy products:', deletedProducts);

  // 2. Delete test/dummy categories (keep only authentic categories)
  const deletedCategories = await sql`
    DELETE FROM categories 
    WHERE id NOT IN (
      '022b58e6-34ee-461f-85f3-5308cf22ca60',
      '66b709e1-0d37-4e78-82bc-781e69dbd6a4'
    )
    RETURNING id, title, slug
  `;
  console.log('✓ Removed dummy categories:', deletedCategories);

  // 3. Clear dummy transactions from store_transactions
  const deletedTransactions = await sql`
    DELETE FROM store_transactions
    RETURNING id, title
  `;
  console.log('✓ Removed dummy store transactions (' + deletedTransactions.length + ' transactions cleared)');

  // 4. Clear dummy vendors
  const deletedVendors = await sql`
    DELETE FROM vendors
    RETURNING id, name
  `;
  console.log('✓ Removed dummy vendors (' + deletedVendors.length + ' vendors cleared)');

  // 5. Clean up product vendor links & fix Stand category to Accessories
  await sql`
    UPDATE products 
    SET vendor_id = NULL, vendor_name = NULL
  `;
  await sql`
    UPDATE products 
    SET category = 'Accessories', category_slug = 'accessories'
    WHERE id = 'd484aca7-119e-483f-b36d-46b81835d4ab'
  `;
  console.log('✓ Reset vendor relations and linked "Stand" to "Accessories"');

  // Verify remaining data
  const remainingProducts = await sql`SELECT id, title, price, category FROM products`;
  console.log('\n--- AUTHENTIC REMAINING PRODUCTS (' + remainingProducts.length + ') ---');
  console.log(remainingProducts);

  const remainingCategories = await sql`SELECT id, title, slug FROM categories`;
  console.log('\n--- AUTHENTIC REMAINING CATEGORIES (' + remainingCategories.length + ') ---');
  console.log(remainingCategories);

  const remainingVendors = await sql`SELECT id, name FROM vendors`;
  console.log('\n--- VENDORS (' + remainingVendors.length + ') ---');

  const remainingTx = await sql`SELECT id FROM store_transactions`;
  console.log('--- STORE TRANSACTIONS (' + remainingTx.length + ') ---');
  console.log('\n✨ Database cleaned successfully. Only genuine store data remains!');
}

cleanDummyData().catch(err => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
