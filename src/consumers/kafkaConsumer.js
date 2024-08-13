const kafka = require('../config/kafkaConfig');
const logger = require('../utils/logger');

const {bot} = require('../services/telegramBot');
// const { sendMessageWithRetry } = require('../services/telegramBot');

const consumer = kafka.consumer({ groupId: 'telegramGroup' });

const runConsumer = async () => {
  await consumer.connect();

  // Subscribe to the relevant Kafka topics
  await consumer.subscribe({ topic: 'welcomeMessageQueue', fromBeginning: true });
  await consumer.subscribe({ topic: 'termsMessageQueue', fromBeginning: true });
  await consumer.subscribe({ topic: 'walletMessageQueue', fromBeginning: true });
  await consumer.subscribe({ topic: 'confirmationQueue', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const { chatId, endpoint, walletAddress } = JSON.parse(message.value.toString());

      try {
        switch (endpoint) {
          case 'start':
            await sendMessageWithRetry(chatId, 'Welcome to the bot!');
            break;
          case 'checkTerms':
            await sendMessageWithRetry(chatId, 'Please review and accept the terms and conditions by typing "yes".');
            break;
          case 'connectWallet':
            await sendMessageWithRetry(chatId, 'Please provide your wallet address.');
            break;
          case 'termsAccepted':
            await sendMessageWithRetry(chatId, 'Thank you for accepting the terms.');
            break;
          case 'walletConnected':
            await sendMessageWithRetry(chatId, `Wallet address ${walletAddress} has been connected.`);
            break;
          default:
            logger.warn(`Unrecognized endpoint ${endpoint} in topic ${topic}`);
        }
        logger.info(`Message processed for chatId ${chatId} on endpoint ${endpoint}`);
      } catch (error) {
        logger.error(`Error processing message from topic ${topic} for chatId ${chatId}:`, error);
      }
    },
  });
};

const sendMessageWithRetry = async (chatId, message, retries = 5) => {
  try {
    const response = await bot.telegram.sendMessage(chatId, message);

    if (response.status === 429 && retries > 0) {
      const retryAfter = response.headers['retry-after'] || 1; // Retry after the suggested time, or 1 second by default
      logger.warn(`Rate limit hit, retrying in ${retryAfter} seconds... (${retries} retries left)`);
      setTimeout(() => sendMessageWithRetry(chatId, message, retries - 1), retryAfter * 1000);
    } else if (retries === 0) {
      logger.error(`Max retries reached. Sending message to deadLetterQueue for chatId ${chatId}`);
      await sendToQueue('deadLetterQueue', { chatId, message, endpoint: 'sendMessageWithRetry' });
    }
  } catch (error) {
    logger.error('Failed to send message:', error);
  }
};


module.exports = runConsumer;
