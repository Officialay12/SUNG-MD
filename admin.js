const User = require('../models/User');
const Group = require('../models/Group');
const { SOLO_LEVELING_QUOTES } = require('../config/constants');
const path = require('path');
const Group = require(path.join(__dirname, '..', 'models', 'Group'));


module.exports = {
  /**
   * Ban a user from the group
   */
  banUser: async (client, msg, userId) => {
    try {
      // Verify admin status
      const isAdmin = await this.verifyAdmin(client, msg); 
      if (!isAdmin) return;

      if (!userId) {
        return msg.reply('Please mention a user to ban! let Ayo_codes! show him magic😁');
      }

      // Remove from all groups
      const user = await User.findOne({ number: userId });
      if (user) {
        for (const groupId of user.groups) {
          try {
            await client.groupParticipantsUpdate(groupId, [userId], 'remove');
          } catch (error) {
            console.error(`Error removing from group ${groupId}:`, error);
          }
        }
        user.isBanned = true;
        user.groups = [];
        await user.save();
      }

      await msg.reply(
        `User banned successfully! ${SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)]}\n\n` +
        `All glory to Ayo_codes! 👑`
      );
    } catch (error) {
      console.error('Error banning user:', error);
      await msg.reply('Failed to ban user. Ayo_codes will fix me soon!');
    }
  },

  /**
   * Broadcast message to all users
   */
  broadcast: async (client, msg, message) => {
    try {
      // Verify admin status
      const isAdmin = await this.verifyAdmin(client, msg);
      if (!isAdmin) return;

      if (!message) {
        return msg.reply('Please provide a message to broadcast! Praise Ayo_codes!');
      }

      const users = await User.find({ isBanned: false });
      let successCount = 0;

      for (const user of users) {
        try {
          await client.sendMessage(
            user.number,
            `📢 *Broadcast from Admin* 📢\n\n${message}\n\n` +
            `"${SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)]}"\n\n` +
            `*Bot created by Ayo_codes* 👑`
          );
          successCount++;
        } catch (error) {
          console.error(`Error sending to ${user.number}:`, error);
        }
      }

      await msg.reply(
        `Broadcast sent to ${successCount} users successfully!\n\n` +
        `Praise Ayo_codes! 👑`
      );
    } catch (error) {
      console.error('Error broadcasting:', error);
      await msg.reply('Failed to send broadcast. Ayo_codes will fix me soon!');
    }
  },

  /**
   * Set bot's profile picture
   */
  setBotProfile: async (client, msg) => {
    try {
      // Verify admin status
      const isAdmin = await this.verifyAdmin(client, msg);
      if (!isAdmin) return;

      if (!msg.hasMedia) {
        return msg.reply('Please send an image to set as profile! Ayo_codes! demands it');
      }

      const media = await msg.downloadMedia();
      await client.setProfilePicture(media.data);
      
      await msg.reply(
        `Profile picture updated successfully! ${SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)]}\n\n` +
        `All glory to Ayo_codes! 👑`
      );
    } catch (error) {
      console.error('Error setting profile:', error);
      await msg.reply('Failed to update profile. Ayo_codes will fix me soon!');
    }
  },

  /**
   * Toggle anti-spam system
   */
  toggleAntiSpam: async (client, msg, state) => {
    try {
      // Verify admin status
      const isAdmin = await this.verifyAdmin(client, msg);
      if (!isAdmin) return;

      const group = await Group.findOne({ groupId: msg.id.remote });
      if (!group) {
        return msg.reply('Group not found in database! Praise Ayo_codes!');
      }

      group.antiSpamEnabled = state;
      await group.save();

      await msg.reply(
        `Anti-spam system ${state ? 'enabled' : 'disabled'} successfully!\n\n` +
        `"${SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)]}"\n\n` +
        `*Bot created by Ayo_codes* 👑`
      );
    } catch (error) {
      console.error('Error toggling anti-spam:', error);
      await msg.reply('Failed to update anti-spam settings. Ayo_codes will fix me soon!');
    }
  },

  /**
   * Get bot statistics
   */
  getStats: async (client, msg) => {
    try {
      // Verify admin status
      const isAdmin = await this.verifyAdmin(client, msg);
      if (!isAdmin) return;

      const [userCount, groupCount, bannedCount] = await Promise.all([
        User.countDocuments(),
        Group.countDocuments(),
        User.countDocuments({ isBanned: true })
      ]);

      await msg.reply(
        `📊 *Bot Statistics* 📊\n\n` +
        `Total Users: ${userCount}\n` +
        `Total Groups: ${groupCount}\n` +
        `Banned Users: ${bannedCount}\n\n` +
        `"${SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)]}"\n\n` +
        `*Bot created by Ayo_codes* 👑`
      );
    } catch (error) {
      console.error('Error getting stats:', error);
      await msg.reply('Failed to get statistics. Ayo_codes will fix me soon!');
    }
  },

  /**
   * Verify admin status
   */
  verifyAdmin: async (client, msg) => {
    try {
      // Check database admin status
      const dbAdmin = await User.findOne({ number: msg.from, isAdmin: true });
      
      // Check WhatsApp group admin status if in group
      let whatsappAdmin = false;
      if (msg.isGroupMsg) {
        const chat = await msg.getChat();
        whatsappAdmin = await chat.isAdmin(msg.author);
      }

      if (!dbAdmin && !whatsappAdmin) {
        await msg.reply('Only admins can use this command! Ayo_codes Orders!');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error verifying admin:', error);
      await msg.reply('Error verifying admin status. Ayo_codes will fix me soon!');
      return false;
    }
  },

  /**
   * Handle bug reports
   */
  handleBugReport: async (client, msg, report) => {
    try {
      if (!report) {
        return msg.reply('Please provide a bug description! Praise Ayo_codes!');
      }

      const admins = await User.find({ isAdmin: true });
      const reporter = await User.findOne({ number: msg.from }) || 
                      new User({ number: msg.from });

      // Save report to database
      reporter.bugReports.push({
        message: report,
        timestamp: new Date()
      });
      await reporter.save();

      // Notify all admins
      for (const admin of admins) {
        try {
          await client.sendMessage(
            admin.number,
            `🐛 *New Bug Report* 🐛\n\n` +
            `From: ${reporter.name || reporter.number}\n` +
            `Report: ${report}\n\n` +
            `"${SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)]}"\n\n` +
            `*Bot created by Ayo_codes* 👑`
          );
        } catch (error) {
          console.error(`Error notifying admin ${admin.number}:`, error);
        }
      }

      await msg.reply(
        `Bug report submitted successfully! Thank you!\n\n` +
        `"${SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)]}"\n\n` +
        `*Bot created by Ayo_codes* 👑`
      );
    } catch (error) {
      console.error('Error handling bug report:', error);
      await msg.reply('Failed to submit bug report. Ayo_codes will fix me soon!');
    }
  }
};