/**
 * Optional: creates demo tutorial categories (Admin + Developer topics) if missing.
 * Run: MONGODB_URI=... node scripts/seed-demo-categories.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');

const demo = [
  { name: 'SF Admin', slug: 'sf-admin', section: 'tutorials' },
  { name: 'Validation rules', slug: 'validation-rules', section: 'tutorials' },
  { name: 'Permissions', slug: 'permissions', section: 'tutorials' },
  { name: 'Permission sets', slug: 'permission-sets', section: 'tutorials' },
  { name: 'Apex development', slug: 'apex-development', section: 'tutorials' },
  { name: 'Lightning Web Components', slug: 'lightning-web-components', section: 'tutorials' },
  { name: 'REST integration', slug: 'rest-integration', section: 'tutorials' },
];

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI');
    process.exit(1);
  }
  await mongoose.connect(uri);
  for (const row of demo) {
    await Category.findOneAndUpdate(
      { slug: row.slug },
      { $setOnInsert: { name: row.name, slug: row.slug, section: row.section } },
      { upsert: true, new: true }
    );
    console.log('OK:', row.slug);
  }
  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
