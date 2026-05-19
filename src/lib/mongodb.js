import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connects to the MongoDB database using Mongoose.
 * Implements a connection caching mechanism to avoid multiple connections.
 * @returns {Promise<Mongoose>} Returns the Mongoose connection object.
 */
async function connectDB() {
  // If a connection already exists in cache, return it immediately
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection promise exists, create a new connection
  if (!cached.promise) {
    // Create a new connection to MongoDB with specified options
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false, // Disable mongoose buffering commands
    }).then((mongoose) => mongoose);
  }

  // Wait for the connection promise to resolve and cache the connection
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;