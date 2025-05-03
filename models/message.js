const utils = require('../commands/utils');
const User = require('../models/User');
const Message = require('../models/Message');

// Create rate limiter (5 requests/minute)
const rateLimit = utils.createRateLimiter();

module.exports = {
  handleMessage: async (client, msg) => {
    try {
      // Apply rate limiting
      await rateLimit(msg.from);
      
      // Ensure user exists in DB
      const user = await User.findOneAndUpdate(
        { number: msg.from },
        { $inc: { 'stats.messagesSent': 1 } },
        { upsert: true, new: true }
      );

      // Handle commands
      if (msg.body.startsWith('!')) {
        return this.handleCommand(client, msg, user);
      }

      // Handle media
      if (msg.hasMedia) {
        return this.handleMedia(client, msg, user);
      }

      // Default message handling
      await this.saveMessage(msg, user);
    } catch (error) {
      if (error.message.includes('Too many requests')) {
        await client.sendMessage(msg.from, error.message);
      }
      utils.logError(error, 'messageHandler');
    }
  },

  handleCommand: async (client, msg, user) => {
    const parsed = utils.parseCommand(msg.body);
    if (!parsed) return;

    try {
      switch (parsed.command) {
        case 'help':
          await this.sendHelp(client, msg);
          break;

        case 'admin':
          if (await utils.isAdmin(msg.from)) {
            await this.handleAdminCommand(client, msg, parsed.args);
          }
          break;

        case 'poll':
          await this.createPoll(client, msg, parsed.args);
          break;

        default:
          await client.sendMessage(msg.from, 'Unknown command. Try !help');
      }

      await User.updateOne(
        { number: msg.from },
        { $inc: { 'stats.commandsUsed': 1 } }
      );
    } catch (error) {
      utils.logError(error, 'commandHandler');
      await client.sendMessage(
        msg.from,
        `❌ Command failed: ${error.message}`
      );
    }
  },

  handleMedia: async (client, msg, user) => {
    try {
      const mediaInfo = await utils.handleMedia(msg);
      await Message.create({
        sender: msg.from,
        content: msg.caption || 'Media file',
        isMedia: true,
        mediaPath: mediaInfo.path,
        groupId: msg.id.remote
      });
      await client.sendMessage(
        msg.from,
        `✅ Media saved as ${mediaInfo.filename}`
      );
    } catch (error) {
      utils.logError(error, 'mediaHandler');
      await client.sendMessage(
        msg.from,
        `❌ Failed to save media: ${error.message}`
      );
    }
  },

  // Additional helper methods...
  sendHelp: async (client, msg) => {
    const helpText = `🛠️ *Bot Commands*\n\n` +
      `!help - Show this message\n` +
      `!poll <question> | <option1> | <option2> - Create poll\n` +
      `!admin <command> - Admin tools\n\n` +
      `"${utils.getRandomQuote()}"`;
    
    await client.sendMessage(msg.from, helpText);
  }
};