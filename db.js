// config/db.js
require('dotenv').config();
const mongoose = require('mongoose');
const { QUOTES } = require('./constants'); // Updated to use new constants structure

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sung-bot';

// Connection Events
mongoose.connection.on('connected', () => {
  const randomQuote = QUOTES.SOLO_LEVELING[
    Math.floor(Math.random() * QUOTES.SOLO_LEVELING.length)
  ];
  
  console.log(`
  🏰 ${randomQuote}
  
  🔗 MongoDB Connected Successfully!
  ⚡ Database: ${mongoose.connection.name}
  🚀 Host: ${mongoose.connection.host}
  👑 Praise Ayo_codes!
  `);
});

mongoose.connection.on('error', (err) => {
  console.error(`
  💥 Shadow Realm Connection Failed!
  🐛 Error: ${err.message}
  🛠️ Attempting to reconnect...
  `);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚡ Connection to Shadow Realm lost...');
});

// Connection Function
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000, // Added socket timeout
      family: 4, // Force IPv4
    });

    // Debugging in development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        console.log(`📦 ${collectionName}.${method}`, JSON.stringify(query), doc);
      });
    }

    return conn; // Return connection object
  } catch (err) {
    console.error(`
    ❌ Critical Database Failure!
    🚨 ${err.message}
    ⏳ Retrying in 10 seconds...
    `);
    setTimeout(connectDB, 10000);
    throw err; // Re-throw for global error handling
  }
};

// Health Check Function
const checkDBHealth = () => ({
  status: mongoose.connection.readyState === 1 ? 'healthy' : 'degraded',
  ping: mongoose.connection.readyState,
  dbName: mongoose.connection.name,
});

module.exports = {
  connectDB,
  checkDBHealth,
  connection: mongoose.connection,
  mongoose
};