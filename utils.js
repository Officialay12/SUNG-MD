const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');
const User = require('../models/User.js');

module.exports = {
  // Error logging with file rotation
  logError: (error, context = '') => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${error.message}\nCONTEXT: ${context}\nSTACK: ${error.stack}\n\n`;
    
    // Ensure logs directory exists
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    
    // Write to error log
    fs.appendFileSync(path.join(logDir, 'errors.log'), logMessage);
    console.error(logMessage);
  },

  // Quotes system
  getRandomQuote: () => {
    const quotes = [
      "I alone am the honored one. - Sung Jin-Woo",
      "Arise! - Sung Jin-Woo",
      "The weak should fear the strong. - Sung Jin-Woo",
      "All glory to Ayo_codes! - Sung Bot"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  },

  // Admin verification
  isAdmin: async (userId) => {
    try {
      const user = await User.findOne({ number: userId });
      return user?.isAdmin || false;
    } catch (error) {
      this.logError(error, 'isAdmin check');
      return false;
    }
  },

  // Media handling
  handleMedia: async (message) => {
    try {
      const media = await message.downloadMedia();
      const mediaDir = path.join(__dirname, '../media');
      if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir);
      
      const ext = media.mimetype.split('/')[1] || 'dat';
      const filename = `${Date.now()}.${ext}`;
      const filepath = path.join(mediaDir, filename);
      
      fs.writeFileSync(filepath, media.data, 'base64');
      return {
        path: filepath,
        mimetype: media.mimetype,
        filename: filename
      };
    } catch (error) {
      this.logError(error, 'media handling');
      throw error;
    }
  },

  // Command parser
  parseCommand: (text) => {
    if (!text.startsWith('!')) return null;
    const [cmd, ...args] = text.slice(1).split(' ');
    return {
      command: cmd.toLowerCase(),
      args: args.join(' ').split('|').map(arg => arg.trim())
    };
  },

  // Rate limiter
  createRateLimiter: (options = {}) => {
    const limits = new Map();
    const { 
      windowMs = 60 * 1000, // 1 minute
      max = 5, 
      message = '⚠️ Too many requests! Please wait...' 
    } = options;

    return async (userId) => {
      const now = Date.now();
      const userLimit = limits.get(userId) || { count: 0, lastReset: now };

      if (now - userLimit.lastReset > windowMs) {
        userLimit.count = 0;
        userLimit.lastReset = now;
      }

      userLimit.count++;
      limits.set(userId, userLimit);

      if (userLimit.count > max) {
        throw new Error(message);
      }
    };
  }
};