const User = require('../models/User');
const authHandler = require('./auth');
const { SOLO_LEVELING_QUOTES, LANGUAGES } = require('../config/constants');

module.exports = {
  handleOTPRequest: async (client, msg) => {
    const number = msg.from;
    const result = await authHandler.sendOTP(number);
    
    await msg.reply(result.message);
    
    if (result.otp && process.env.NODE_ENV === 'development') {
      await msg.reply(`*Development OTP*: ${result.otp}\n\n` +
        `"${SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)]}"`);
    }
  },

  handleOTPVerification: async (client, msg, otp) => {
    const number = msg.from;
    const result = await authHandler.verifyOTP(number, otp);
    
    await msg.reply(result.message);
    
    if (result.success) {
      await msg.reply(`You are now authenticated! Type #help to see commands.\n\n` +
        `"${SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)]}"`);
    }
  },

  handleLanguageChange: async (client, msg, language) => {
    const number = msg.from;
    const result = await authHandler.setLanguage(number, language.toLowerCase());
    
    await msg.reply(result.message);
    
    if (result.success) {
      await msg.reply(`Now speaking in ${LANGUAGES[language]}! Praise Ayo_codes! 👑`);
    }
  },

  handleUserInfo: async (client, msg) => {
    const number = msg.from;
    const result = await authHandler.getUserInfo(number);
    
    if (result.success) {
      const user = result.user;
      await msg.reply(
        `👤 *User Information* 👤\n\n` +
        `Number: ${user.formattedNumber || user.number}\n` +
        `Name: ${user.name || 'Not set'}\n` +
        `Language: ${LANGUAGES[user.language] || 'English'}\n` +
        `Status: ${user.isBanned ? '❌ Banned' : '✅ Active'}\n` +
        `Admin: ${user.isAdmin ? '👑 Yes' : '❌ No'}\n` +
        `Last Active: ${user.lastActive.toLocaleString()}\n\n` +
        `"${SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)]}"\n\n` +
        `*Bot created by Ayo_codes!* 👑`
      );
    } else {
      await msg.reply(result.message);
    }
  }
};