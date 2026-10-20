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

  console.log('Setup finished successfully!');
}

setup().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
