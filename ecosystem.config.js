module.exports = {
  apps: [{
    name: "whatsapp-bot",
    script: "index.js",
    watch: true,
    autorestart: true,
    env: {
      NODE_ENV: "production"
    }
  }]
}
