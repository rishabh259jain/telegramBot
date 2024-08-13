const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'telegramBot',
  brokers: [process.env.KAFKA_BROKER],
});

module.exports = kafka;
