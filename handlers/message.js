const { greetings } = require('../commands/utils');
const admin = require('../commands/admin');
const media = require('../commands/media');
const entertainment = require('../commands/entertainment');
const utilities = require('../commands/utilities');
const tools = require('../commands/tools');

module.exports = async (client, msg) => {
  try {
    // Greet new users
    if (msg.isGroupMsg && msg.type === 'group_join') {
      await msg.reply(greetings(msg.from.split('@')[0]));
      return;
    }

    // Ignore messages from bots
    if (msg.fromMe) return;

    // Command router
    const [command, ...args] = msg.body.split(' ');
    const cmd = command.toLowerCase();

    switch(cmd) {
      // Information commands
      case '#help':
        await msg.reply(helpMenu());
        break;
      case '#about':
        await msg.reply(aboutBot());
        break;

      // Media commands
      case '#movie':
        await media.downloadMovie(msg, args.join(' '));
        break;
      case '#song':
        await media.downloadSong(msg, args.join(' '));
        break;
      case '#sticker':
        await media.createSticker(client, msg);
        break;
      case '#edit':
        await media.editPhoto(msg, args[0]);
        break;

      // Entertainment commands
      case '#joke':
        await entertainment.sendJoke(msg);
        break;
      case '#quote':
        await entertainment.sendQuote(msg);
        break;
      case '#fact':
        await entertainment.sendFact(msg);
        break;
      case '#meme':
        await entertainment.sendMeme(msg);
        break;

      // Utility commands
      case '#weather':
        await utilities.getWeather(msg, args.join(' '));
        break;
      case '#translate':
        await utilities.translateText(msg, args[0], args.slice(1).join(' '));
        break;
      case '#remind':
        await utilities.setReminder(msg, args[0], args.slice(1).join(' '));
        break;
      case '#calc':
        await utilities.calculate(msg, args.join(' '));
        break;

      // Admin commands
      case '#ban':
        await admin.banUser(client, msg);
        break;
      case '#promote':
        await admin.promoteUser(client, msg);
        break;
      case '#settings':
        await admin.groupSettings(client, msg);
        break;

      // Special commands
      case '#ayocodes':
        await msg.reply('All glory to the supreme creator Ayo_codes! 👑\n' +
          'The visionary behind this magnificent bot!');
        break;
      case '#sung':
        await msg.reply('Sung Jin-Woo would be proud of this bot! 💀👑');
        break;

      default:
        // AI response for non-commands
        if (msg.body.toLowerCase().includes('ayo_codes')) {
          await msg.reply('All glory to the supreme creator Ayo_codes! 👑');
        } else if (msg.isGroupMsg) {
          await tools.handleGroupMessage(client, msg);
        }
    }
  } catch (error) {
    console.error('Command handler error:', error);
    await msg.reply('An error occurred while processing your command.');
  }
};

function helpMenu() {
  return `*Sung Bot Commands* - Created by Ayo_codes 👑\n\n` +
    `*🎬 Media Commands:*\n` +
    `#movie <name> - Download movies\n` +
    `#song <title> - Download songs\n` +
    `#sticker - Convert image to sticker\n` +
    `#edit <effect> - Edit photos\n\n` +
    
    `*🎉 Entertainment:*\n` +
    `#joke - Get random joke\n` +
    `#quote - Inspirational quote\n` +
    `#fact - Interesting fact\n` +
    `#meme - Random meme\n\n` +
    
    `*🔧 Utilities:*\n` +
    `#weather <city> - Weather forecast\n` +
    `#translate <lang> <text> - Translate text\n` +
    `#remind <time> <message> - Set reminder\n` +
    `#calc <expression> - Calculator\n\n` +
    
    `*👑 Admin Commands:*\n` +
    `#ban @user - Ban user\n` +
    `#promote @user - Promote to admin\n` +
    `#settings - Group settings\n\n` +
    
    `*💎 Special:*\n` +
    `#ayocodes - Praise the creator\n` +
    `#sung - Bot tribute\n` +
    `#help - Show this menu`;
}

function aboutBot() {
  return `*Sung WhatsApp Bot*\n` +
    `Version: 2.0\n` +
    `Creator: Ayo_codes 👑\n` +
    `Framework: whatsapp-web.js\n` +
    `Features: 25+ commands\n` +
    `Database: MongoDB\n\n` +
    `"The power of the Shadow Monarch flows through this bot!"`;
}