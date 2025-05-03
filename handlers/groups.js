// Correct way to require files (use relative paths)
const User = require('../models/User');      
const Message = require('../models/Message');
const { QUOTES, LANGUAGES, EMOJIS } = require('../config/constants');
const mongoose = require('mongoose');
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Group', groupSchema)
module.exports = {
  /**
   * Enhanced group join handler with user initialization
   */
  handleGroupJoin: async (client, notification) => {
    try {
      const userNumber = notification.author || notification.from;
      const chatId = notification.id.remote;
      
      const user = await User.findOneAndUpdate(
        { number: userNumber },
        { $addToSet: { groups: chatId } },
        { upsert: true, new: true }
      );

      const greeting = `${EMOJIS.WELCOME} Welcome to the group! I'm Sung, created by Ayo_codes!\n\n` +
        `Type #help for commands\n` +
        `Current language: ${LANGUAGES[user.language] || 'English'}\n` +
        `Change with #language <code> (e.g., #language es)\n\n` +
        `"${this.getRandomQuote()}"`;

      await client.sendMessage(chatId, greeting);
    } catch (error) {
      console.error('Group join handler error:', error);
      throw new Error(`Failed to handle join: ${error.message}`);
    }
  },

  /**
   * Smart mention-all with rate limiting
   */
  tagAll: async (client, msg) => {
    const chat = await this.validateGroupCommand(client, msg, 'admin');
    if (!chat) return;

    try {
      const participants = chat.participants;
      const mentions = participants.map(p => p.id._serialized);
      
      await client.sendMessage(
        msg.id.remote,
        `${EMOJIS.ANNOUNCEMENT} Attention! ${this.getRandomQuote()}\n\n` +
        participants.map(p => `@${p.id.user}`).join(' '),
        { mentions }
      );
    } catch (error) {
      console.error('Tag-all error:', error);
      await msg.reply(`${EMOJIS.ERROR} Failed to tag. ${this.getErrorMessage()}`);
    }
  },

  /**
   * Secure view-once message handler
   */
  handleViewOnce: async (client, msg) => {
    if (!msg.isViewOnce) return;

    try {
      const media = await msg.downloadMedia();
      const sender = await msg.getContact();
      
      await User.findOneAndUpdate(
        { number: msg.from },
        { 
          $push: { 
            viewOnceMessages: {
              sender: sender.id.user,
              timestamp: new Date(),
              mediaType: media.mimetype.split('/')[0],
              caption: msg.caption || 'No caption'
            }
          }
        }
      );

      await this.notifyAdmins(client, 
        `⚠️ View Once Captured\n` +
        `From: ${sender.name || sender.number}\n` +
        `Type: ${media.mimetype}\n` +
        `Time: ${new Date().toLocaleString()}`
      );

      await msg.reply(`${EMOJIS.SUCCESS} View Once recorded! ${this.getRandomPraise()}`);
    } catch (error) {
      console.error('ViewOnce error:', error);
      await msg.reply(`${EMOJIS.ERROR} Failed to process. ${this.getErrorMessage()}`);
    }
  },

  /**
   * Interactive poll creator
   */
  createPoll: async (client, msg, question, options) => {
    const chat = await this.validateGroupCommand(client, msg);
    if (!chat) return;

    try {
      const pollOptions = options.split('|').map(opt => opt.trim());
      if (pollOptions.length < 2) {
        return await msg.reply(`${EMOJIS.WARNING} Provide 2+ options separated by |`);
      }

      await client.sendMessage(
        msg.id.remote,
        `${EMOJIS.POLL} *Poll:* ${question}\n\n` +
        pollOptions.map((opt, i) => `${EMOJIS.POLL_EMOJIS[i]} ${opt}`).join('\n') +
        `\n\nReact with your choice!`
      );
    } catch (error) {
      console.error('Poll error:', error);
      await msg.reply(`${EMOJIS.ERROR} Poll failed. ${this.getErrorMessage()}`);
    }
  },

  /**
   * Group management utilities
   */
  groupManager: {
    backupGroup: async (client, msg) => {
      const chat = await this.validateGroupCommand(client, msg, 'admin');
      if (!chat) return;

      try {
        const backupData = {
          name: chat.name,
          description: chat.description,
          participants: chat.participants.map(p => ({
            number: p.id.user,
            isAdmin: p.isAdmin
          })),
          createdAt: new Date()
        };

        await User.findOneAndUpdate(
          { number: msg.from },
          { $push: { groupBackups: backupData } }
        );

        await msg.reply(
          `${EMOJIS.SUCCESS} Backup created!\n` +
          `Name: ${backupData.name}\n` +
          `Members: ${backupData.participants.length}`
        );
      } catch (error) {
        console.error('Backup error:', error);
        await msg.reply(`${EMOJIS.ERROR} Backup failed. ${this.getErrorMessage()}`);
      }
    },

    updateSettings: async (client, msg, action, target) => {
      const chat = await this.validateGroupCommand(client, msg, 'admin');
      if (!chat || !target) return;

      try {
        const actions = {
          add: () => chat.addParticipants([target]),
          remove: () => chat.removeParticipants([target]),
          promote: () => chat.promoteParticipants([target]),
          demote: () => chat.demoteParticipants([target]),
          mute: () => chat.mute({ mute: true }),
          unmute: () => chat.unmute()
        };

        if (!actions[action]) {
          return await msg.reply(`${EMOJIS.WARNING} Invalid action`);
        }

        await actions[action]();
        
        // Sync admin status in DB
        if (['promote', 'demote'].includes(action)) {
          await User.updateOne(
            { number: target },
            { isAdmin: action === 'promote' }
          );
        }

        await msg.reply(
          `${EMOJIS.SUCCESS} Action "${action}" completed!\n` +
          `${this.getRandomQuote()}`
        );
      } catch (error) {
        console.error('Group action error:', error);
        await msg.reply(`${EMOJIS.ERROR} ${action} failed. ${this.getErrorMessage()}`);
      }
    }
  },

  /**
   * Helper methods
   */
  validateGroupCommand: async (client, msg, permissionLevel = null) => {
    try {
      const chat = await msg.getChat();
      if (!chat.isGroup) {
        await msg.reply(`${EMOJIS.WARNING} Group-only command!`);
        return null;
      }

      if (permissionLevel) {
        const user = await User.findOne({ number: msg.from });
        const isAuthorized = permissionLevel === 'admin' 
          ? (user?.isAdmin || await chat.isAdmin(msg.author))
          : true;

        if (!isAuthorized) {
          await msg.reply(`${EMOJIS.WARNING} Admin required!`);
          return null;
        }
      }

      return chat;
    } catch (error) {
      console.error('Validation error:', error);
      await msg.reply(`${EMOJIS.ERROR} Validation failed. ${this.getErrorMessage()}`);
      return null;
    }
  },

  notifyAdmins: async (client, message) => {
    const admins = await User.find({ isAdmin: true });
    await Promise.all(
      admins.map(admin => 
        client.sendMessage(admin.number, message)
      )
    );
  },

  getRandomQuote: () => 
    QUOTES.SOLO_LEVELING[Math.floor(Math.random() * QUOTES.SOLO_LEVELING.length)],

  getRandomPraise: () => 
    `Praise Ayo_codes! ${['👑', '✨', '🙌', '🛐'][Math.floor(Math.random() * 4)]}`,

  getErrorMessage: () =>
    `Ayo_codes has been notified! ${this.getRandomPraise()}`
};