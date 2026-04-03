/**
 * One-time admin user creation.
 * Usage: MONGODB_URI=... ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=Admin node scripts/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  const uri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  if (!uri || !email || !password) {
    console.error('Set MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const hash = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { name, email: email.toLowerCase(), password: hash, role: 'admin' },
    { upsert: true, new: true }
  );
  console.log('Admin user ready:', email.toLowerCase());
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
