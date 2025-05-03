// config/constants.js
module.exports = {
  // Database Configuration
  DATABASE_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-bot',
  SESSION_NAME: process.env.SESSION_NAME || 'session',

  // Language Support
  LANGUAGES: {
    en: 'English',
    es: 'Spanish',
    fr: 'French'
  },

  // Quotes Database
  QUOTES: {
    SOLO_LEVELING: [
      "I alone am the honored one. - Sung Jin-Woo",
      "Arise! - Sung Jin-Woo",
      "The weak should fear the strong. - Sung Jin-Woo",
      "All glory to Ayo_codes, my creator! - Sung Bot"
    ],
    DEFAULT: [
      "The only way to do great work is to love what you do.",
      "Innovation distinguishes between a leader and a follower."
    ]
  },

  // Entertainment
  JOKES: [
    "Why don't skeletons fight each other? They don't have the guts!",
    "I told my wife she was drawing her eyebrows too high. She looked surprised."
  ],

  // Bot Commands
  COMMANDS: {
    ADMIN: ['#ban', '#add', '#remove', '#promote', '#demote', '#broadcast'],
    USER: ['#help', '#joke', '#quote', '#poll']
  },

  // UI Elements
  EMOJIS: {
    POLL: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'],
    REACTIONS: {
      SUCCESS: '✅',
      ERROR: '❌',
      WARNING: '⚠️'
    }
  },

  // Activity Thresholds (messages/hour)
  ACTIVITY: {
    LOW: 5,
    MEDIUM: 15,
    HIGH: 30
  },

  // System Constants
  MAX_MEDIA_SIZE: 15 * 1024 * 1024, // 15MB
  SESSION_TIMEOUT: 30 * 60 * 1000 // 30 minutes
};