const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  const uri = env.mongodbUri;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in .env — see CONFIGURATION.md');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  return mongoose.connection;
}

module.exports = { connectDB };
