const winston = require('winston');
const { SOLO_LEVELING_QUOTES } = require('./config/constants');

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => {
      const quote = SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)];
      return `[${info.timestamp}] ${info.level}: ${info.message} | ${quote}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console());
}

module.exports = logger;