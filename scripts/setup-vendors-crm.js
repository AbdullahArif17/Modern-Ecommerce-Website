const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)/);
if (!match) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}
const sql = neon(match[1]);

async function setup() {
  console.log('Connecting to Neon to create Vendors and CRM Store Management tables...');

  // 1. Alter products table to add cost_price, vendor_id, vendor_name
  await sql`
    ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS vendor_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255)
  `;
  console.log('✓ Products table extended with cost_price, vendor_id, vendor_name');

  // 2. Create vendors table
  await sql`
    CREATE TABLE IF NOT EXISTS vendors (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      contact_person VARCHAR(255),
      phone VARCHAR(100),
      email VARCHAR(255),
      address TEXT,
      payment_terms VARCHAR(100) DEFAULT 'Net 30',
      lead_time_days INTEGER DEFAULT 7,
      balance_due NUMERIC(12, 2) DEFAULT 0,
      notes TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log('✓ Vendors table created / verified');

  // 3. Create store_transactions table (CRM ledger: sales, expenses, inventory purchases)
  await sql`
    CREATE TABLE IF NOT EXISTS store_transactions (
      id VARCHAR(100) PRIMARY KEY,
      type VARCHAR(50) NOT NULL, -- 'sale', 'expense', 'purchase_order', 'refund'
      title VARCHAR(255) NOT NULL,
      amount NUMERIC(12, 2) NOT NULL,
      category VARCHAR(100) DEFAULT 'General',
      vendor_id VARCHAR(100),
      vendor_name VARCHAR(255),
      product_id VARCHAR(100),
      quantity INTEGER DEFAULT 1,
      customer_name VARCHAR(255),
      payment_method VARCHAR(100) DEFAULT 'Cash / COD',
      status VARCHAR(50) DEFAULT 'completed',
      notes TEXT,
      transaction_date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log('✓ Store transactions table created / verified');

  // 4. Seed initial default vendors if table is empty
  const existingVendors = await sql`SELECT id FROM vendors LIMIT 1`;
  if (existingVendors.length === 0) {
    await sql`
      INSERT INTO vendors (id, name, company, contact_person, phone, email, address, payment_terms, lead_time_days, balance_due, notes)
      VALUES 
      ('ven-logitech-pk', 'Logitech Official Pakistan', 'Logitech Tech Distro', 'Ali Raza', '+92 300 1234567', 'distro@logitech-pk.com', 'Tech Plaza, Blue Area, Islamabad', 'Net 30', 5, 0, 'Authorized supplier for Logitech peripheral hardware'),
      ('ven-jtech-global', 'JTech Global Electronics', 'JTech Shenzhen Co.', 'David Chen', '+86 138 0000 1234', 'supply@jtech-global.com', 'Nanshan District, Shenzhen, China', 'Advance 50%', 14, 25000, 'Primary OEM manufacturer for watches, chargers and stands'),
      ('ven-soundcore-dist', 'SoundCore Audio Hub', 'SoundCore Audio Tech', 'Usman Tariq', '+92 321 9876543', 'orders@soundcore-audio.pk', 'Hafeez Centre, Gulberg III, Lahore', 'Cash on Delivery', 3, 0, 'Audio accessories, cables and premium earbuds')
    `;
    console.log('✓ Seeded initial vendors');
  }

  // 5. Connect existing products to initial vendors & populate estimated cost_price if null
  await sql`
    UPDATE products 
    SET vendor_id = 'ven-logitech-pk', vendor_name = 'Logitech Official Pakistan', cost_price = ROUND((price * 0.72)::numeric, 2)
    WHERE title ILIKE '%Logitech%' AND (vendor_id IS NULL OR cost_price IS NULL)
  `;
  await sql`
    UPDATE products 
    SET vendor_id = 'ven-jtech-global', vendor_name = 'JTech Global Electronics', cost_price = ROUND((price * 0.65)::numeric, 2)
    WHERE (title ILIKE '%Usb%' OR title ILIKE '%Stand%') AND (vendor_id IS NULL OR cost_price IS NULL)
  `;
  await sql`
    UPDATE products 
    SET vendor_id = 'ven-soundcore-dist', vendor_name = 'SoundCore Audio Hub', cost_price = ROUND((price * 0.60)::numeric, 2)
    WHERE (title ILIKE '%Headphone%' OR title ILIKE '%Earbud%') AND (vendor_id IS NULL OR cost_price IS NULL)
  `;
  await sql`
    UPDATE products 
    SET cost_price = ROUND((price * 0.68)::numeric, 2)
    WHERE cost_price IS NULL
  `;
  console.log('✓ Updated existing products with vendor links and cost price estimates');

  // 6. Seed sample CRM transactions if empty
  const existingTx = await sql`SELECT id FROM store_transactions LIMIT 1`;
  if (existingTx.length === 0) {
    await sql`
      INSERT INTO store_transactions (id, type, title, amount, category, customer_name, payment_method, status, notes, transaction_date)
      VALUES
      ('tx-sale-101', 'sale', 'Logitech B100 Optical Mouse x2', 2300, 'Peripherals', 'Hamza Khan (Karachi)', 'Cash on Delivery', 'completed', 'Shipped via Trax Express', CURRENT_DATE - INTERVAL '1 day'),
      ('tx-sale-102', 'sale', 'Gaming Headphone Pro x1', 2500, 'Audio', 'Zubair Ahmed (Lahore)', 'Online Bank Transfer', 'completed', 'Customer requested express delivery', CURRENT_DATE),
      ('tx-sale-103', 'sale', 'Aluminum Laptop Stand x1', 1101, 'Accessories', 'Ayesha Malik (Islamabad)', 'EasyPaisa', 'completed', 'Order #JT-9942', CURRENT_DATE),
      ('tx-exp-201', 'expense', 'Store Packaging & Bubble Wrap', 1800, 'Packaging', NULL, 'Cash', 'completed', '500x tamper-proof mailer bags', CURRENT_DATE - INTERVAL '3 days'),
      ('tx-exp-202', 'expense', 'Courier & Logistics Prepaid Credits', 4500, 'Logistics', NULL, 'Bank Transfer', 'completed', 'Trax Logistics courier portal wallet top-up', CURRENT_DATE - INTERVAL '2 days'),
      ('tx-po-301', 'purchase_order', 'Restock Stock from Logitech Distro', 11500, 'Inventory', NULL, 'Bank Transfer', 'completed', 'PO #PO-LOG-042 (10x Optical Mouse)', CURRENT_DATE - INTERVAL '4 days')
    `;
    console.log('✓ Seeded initial CRM store transactions');
  }

  console.log('Setup finished successfully!');
}

setup().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
