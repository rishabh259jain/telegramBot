const kafka = require('../config/kafkaConfig');
const logger = require('../utils/logger');

// const kafka = new Kafka({
//   clientId: 'telegramBot',
//   brokers: [process.env.KAFKA_BROKER]  // Replace with your Kafka broker
// });

const producer = kafka.producer();

// Generic function to send messages to a specified Kafka topic
const sendToQueue = async (topic, message) => {
  await producer.connect();
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    logger.info(`Message sent to topic ${topic}: ${JSON.stringify(message)}`);
  } catch (error) {
    logger.error(`Error sending message to Kafka topic ${topic}:`, error);
  } finally {
    await producer.disconnect();
  }
};

module.exports = { sendToQueue };
