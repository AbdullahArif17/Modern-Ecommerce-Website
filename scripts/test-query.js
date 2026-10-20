const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/DATABASE_URL=["']?([^"'\r\n]+)/);
const sql = neon(match[1]);

async function run() {
  const taggedRes = await sql`SELECT id, title, price, discount_price, category, featured, is_active FROM products`;
  console.log('taggedRes type:', Array.isArray(taggedRes), 'length:', taggedRes.length);
  console.log(taggedRes);

  const cats = await sql`SELECT * FROM categories`;
  console.log('Categories:', cats);
}

run().catch(console.error);
