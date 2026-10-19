const { createClient } = require('@sanity/client');
const fs = require('fs');

const client = createClient({
  projectId: 'b5dr6ut1',
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: false,
});

async function main() {
  const categories = await client.fetch(`*[_type == "category"]`);
  const products = await client.fetch(`*[_type == "product"]{
    ...,
    "categoryTitle": category->title,
    "categorySlug": category->slug.current
  }`);

  console.log('Categories found:', categories.length);
  console.log(categories);

  console.log('Products found:', products.length);
  console.log(JSON.stringify(products, null, 2));

  fs.writeFileSync('scripts/sanity-dump.json', JSON.stringify({ categories, products }, null, 2));
}

main().catch(console.error);
