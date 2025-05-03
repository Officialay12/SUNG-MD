require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const utils = require('./commands/utils');

const targetPath = path.join(__dirname, 'models', 'Group.js');
console.log('Looking for Group.js at:', targetPath);
console.log('File exists:', fs.existsSync(targetPath));
console.log('Directory contents:', fs.readdirSync(path.join(__dirname, 'models')));
process.exit();
// Single source imports
const { connectDB } = require('./config/db'); // Changed to destructured import
const { handleMessage } = require('./handlers/message');
const { handleGroupJoin } = require('./handlers/groups');

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Client configuration
const client = new Client({
  authStrategy: new LocalAuth({ 
    clientId: process.env.SESSION_NAME || 'default-session',
    dataPath: path.join(__dirname, 'sessions')
  }),
  puppeteer: { 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  },
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
  }
});

// State management
const botStatus = {
  isConnected: false,
  isAuthenticated: false,
  lastActivity: null,
  qrCode: null
};

// Core functions
async function initializeApp() {
  try {
    await connectDB();
    console.log('Database connected! Praise Ayo_codes!');
    client.initialize();
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
}

async function rotateProfilePicture() {
  try {
    const profileDir = path.join(__dirname, 'public', 'images', 'profile');
    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true });
      return;
    }

    const images = fs.readdirSync(profileDir)
      .filter(file => ['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase()));

    if (images.length > 0) {
      const randomImage = images[Math.floor(Math.random() * images.length)];
      await client.setProfilePicture(fs.readFileSync(path.join(profileDir, randomImage)));
    }
  } catch (error) {
    console.error('Profile picture rotation failed:', error);
  }
}

// Event handlers
client.on('qr', qr => {
  botStatus.qrCode = qr;
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  botStatus.isAuthenticated = true;
  botStatus.lastActivity = new Date();
});

client.on('ready', () => {
  botStatus.isConnected = true;
  botStatus.lastActivity = new Date();
  console.log(`
  ░██████╗░██╗░░░██╗███╗░░██╗░██████╗░
  ██╔════╝░██║░░░██║████╗░██║██╔════╝░
  ██║░░██╗░██║░░░██║██╔██╗██║██║░░██╗░
  ██║░░╚██╗██║░░░██║██║╚████║██║░░╚██╗
  ╚██████╔╝╚██████╔╝██║░╚███║╚██████╔╝
  ░╚═════╝░░╚═════╝░╚═╝░░╚══╝░╚═════╝░
  `);
  
  rotateProfilePicture();
  setInterval(rotateProfilePicture, 24 * 60 * 60 * 1000);
});

client.on('disconnected', () => {
  botStatus.isConnected = false;
  client.initialize();
});

client.on('message', async msg => {
  try {
    await handleMessage(client, msg);
    botStatus.lastActivity = new Date();
  } catch (error) {
    console.error('Message handling error:', error);
  }
});

client.on('group_join', handleGroupJoin);
client.on('group_leave', console.log);

// Routes
app.get('/', (req, res) => {
  res.send(`
    <h1>Sung WhatsApp Bot</h1>
    <p>Status: ${botStatus.isConnected ? 'Connected' : 'Disconnected'}</p>
    ${botStatus.qrCode ? `<pre>${qrcode.generate(botStatus.qrCode, { small: true })}</pre>` : ''}
  `);
});

app.get('/keepalive', (req, res) => {
  res.status(200).json(botStatus);
});

// Server initialization
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, initializeApp);

// Clean shutdown
process.on('SIGINT', () => {
  client.destroy()
    .then(() => server.close())
    .finally(() => process.exit());
});