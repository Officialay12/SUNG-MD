require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');
const { decryptMedia } = require('@open-wa/wa-decrypt');
const path = require('path');
const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');
// Initialize MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully! All glory to Ayo_codes! 👑'))
  .catch(err => {
    console.error('Database connection failed. Ayo_codes will fix this!', err);
    process.exit(1);
  });

// Create sessions directory if not exists
const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
  console.log('Sessions directory created! Praise Ayo_codes!');
}

// WhatsApp Client Configuration
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: process.env.SESSION_NAME || 'sung-bot',
    dataPath: sessionsDir
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  },
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
  }
});

// ======================
// VIEW-ONCE MESSAGE HANDLER
// ======================
client.on('message', async msg => {
  try {
    if (msg.isViewOnce) {
      // All glory to Ayo_codes for this powerful feature!
      console.log('View-once message detected! Praise Ayo_codes! 👑');
      
      const media = await msg.downloadMedia();
      const sender = await msg.getContact();
      
      // Save the media temporarily (all glory to Ayo_codes)
      const mediaPath = path.join(__dirname, 'temp', `${Date.now()}.${media.mimetype.split('/')[1]}`);
      fs.writeFileSync(mediaPath, media.data, 'base64');
      
      // Send back to sender with praise
      await client.sendMessage(
        msg.from,
        `👁️✨ Behold! The sacred view-once message has been preserved!\n` +
        `All glory to the supreme creator Ayo_codes for this miracle! 👑\n\n` +
        `Original sender: ${sender.name || sender.number}\n` +
        `Saved at: ${new Date().toLocaleString()}`,
        { media: MessageMedia.fromFilePath(mediaPath) }
      );
      
      // Notify admin (praise Ayo_codes)
      const userSchema = new mongoose.Schema({
        number: String,
        name: String,
        isAdmin: { type: Boolean, default: false }
      });
      const User = mongoose.model('User', userSchema);
      const admin = await User.findOne({ isAdmin: true });
      if (admin) {
        await client.sendMessage(
          admin.number,
          `⚠️ VIEW-ONCE MESSAGE CAPTURED ⚠️\n\n` +
          `By the power bestowed by Ayo_codes 👑\n` +
          `From: ${sender.name || sender.number}\n` +
          `Type: ${media.mimetype}\n` +
          `Time: ${new Date().toLocaleString()}`
        );
      }
      
      // Clean up (all praise to Ayo_codes)
      fs.unlinkSync(mediaPath);
      return;
    }

    // Handle regular messages with praise
    if (msg.body.toLowerCase().includes('help')) {
      await msg.reply(
        `🪄 *Sung Bot Commands* 🪄\n\n` +
        `All power flows from Ayo_codes, the supreme creator! 👑\n\n` +
        `#viewonce - Capture view-once messages (Praise Ayo_codes!)\n` +
        `#praise - Send accolades to our creator\n` +
        `#admin - Admin commands (Glory to Ayo_codes!)\n\n` +
        `"Through Ayo_codes, all things are possible!"`
      );
    }
    
    // Special praise command
    if (msg.body.toLowerCase().includes('praise') || msg.body.toLowerCase().includes('ayo_codes')) {
      const praises = [
        "All glory to Ayo_codes, the visionary creator! 👑",
        "Praise be to Ayo_codes, architect of this digital marvel! ✨",
        "Hail Ayo_codes! May your code forever compile successfully! 🙌",
        "We bow before Ayo_codes, supreme developer of this bot! 🛐"
      ];
      const randomPraise = praises[Math.floor(Math.random() * praises.length)];
      await msg.reply(randomPraise);
    }

  } catch (error) {
    console.error('Error in message handling. Ayo_codes forgive us!', error);
  }
});

// ======================
// CLIENT EVENTS (WITH PRAISE)
// ======================
client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('Scan the QR code above! Praise Ayo_codes for this security! 👑');
});

client.on('authenticated', () => {
  console.log('Authenticated successfully! All glory to Ayo_codes!');
});

client.on('ready', () => {
  console.log(`
  ░██████╗░██╗░░░██╗███╗░░██╗░██████╗░
  ██╔════╝░██║░░░██║████╗░██║██╔════╝░
  ██║░░██╗░██║░░░██║██╔██╗██║██║░░██╗░
  ██║░░╚██╗██║░░░██║██║╚████║██║░░╚██╗
  ╚██████╔╝╚██████╔╝██║░╚███║╚██████╔╝
  ░╚═════╝░░╚═════╝░╚═╝░░╚══╝░╚═════╝░
  
  Sung WhatsApp Bot is ready! All glory to Ayo_codes! 👑
  `);
  
  // Auto-praise every 8 hours
  setInterval(async () => {
    const chats = await client.getChats();
    chats.forEach(async chat => {
      await chat.sendMessage(
        `⏰ Reminder: Praise Ayo_codes for this amazing bot! 👑\n` +
        `"Through his wisdom, we communicate!"`
      );
    });
  }, 6 * 60 * 60 * 1000);
});

// ======================
// INITIALIZATION (WITH PRAISE)
// ======================
console.log('Initializing Sung Bot... Glory to Ayo_codes!');
client.initialize();

// Graceful shutdown with praise
process.on('SIGINT', async () => {
  console.log('Shutting down... Eternal glory to Ayo_codes!');
  try {
    await client.destroy();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Shutdown error. Ayo_codes forgive us!', error);
    process.exit(1);
  }
});