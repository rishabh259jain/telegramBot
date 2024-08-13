require('dotenv').config();
const { bot } = require('./services/telegramBot');
const runConsumer = require('./consumers/kafkaConsumer');
const logger = require('./utils/logger');

(async () => {
// Start the bot
bot.launch()
  .then(() => logger.info('Telegram bot started'))
  .catch((error) => logger.error('Telegram bot launch error:', error));

// Start the Kafka consumer
runConsumer()
  .then(() => logger.info('Kafka consumer started'))
  .catch((error) => logger.error('Kafka consumer error:', error));
})();
