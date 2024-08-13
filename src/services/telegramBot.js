const { Telegraf } = require('telegraf');
const User = require('../models/User');
const { sendToQueue } = require('../producers/kafkaProducer');
const logger = require('../utils/logger');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Start command - Initializes user in the database
bot.start(async (ctx) => {
  const chatId = ctx.chat.id;
  const username = ctx.from.username || 'Unknown';

  try {
    let user = await User.findOne({ chatId }).lean();
    if (!user) {
      user = new User({ 
        username, 
        chatId, 
        state: 'STARTED', 
        acceptedTerms: false, 
        walletDisconnected: true 
      });
      await user.save();
    }

    await sendToQueue('welcomeMessageQueue', { chatId, endpoint: 'start' });
  } catch (error) {
    logger.error('Error in bot start command:', error);
  }
});

// Command to check terms - Sets state to AWAITING_TERMS
bot.command('checkTerms', async (ctx) => {
  const chatId = ctx.chat.id;

  try {
    await User.findOneAndUpdate(
      { chatId },
      { $set: { state: 'AWAITING_TERMS' } },
      { upsert: true, new: true }
    ).lean();
    await sendToQueue('termsMessageQueue', { chatId, endpoint: 'checkTerms' });
  } catch (error) {
    logger.error('Error in checkTerms command:', error);
  }
});

// Command to connect wallet - Sets state to WAITING_FOR_WALLET
bot.command('connectWallet', async (ctx) => {
  const chatId = ctx.chat.id;

  try {
    await User.findOneAndUpdate(
      { chatId },
      { $set: { state: 'WAITING_FOR_WALLET' } },
      { upsert: true, new: true }
    ).lean();
    await sendToQueue('walletMessageQueue', { chatId, endpoint: 'connectWallet' });
  } catch (error) {
    logger.error('Error in connectWallet command:', error);
  }
});

// Generic message handler based on the user's state
bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;
  const messageText = ctx.message.text.toLowerCase();

  try {
    const user = await User.findOne({ chatId }).lean();

    if (user) {
      if (user.state === 'AWAITING_TERMS' && messageText === 'yes') {
        await User.findOneAndUpdate(
          { chatId },
          { $set: { acceptedTerms: true, state: 'STARTED' } }
        ).lean();
        await sendToQueue('confirmationQueue', { chatId, endpoint: 'termsAccepted' });
      } else if (user.state === 'WAITING_FOR_WALLET') {
        await User.findOneAndUpdate(
          { chatId },
          { $set: { state: 'STARTED', 'data.walletAddress': messageText, walletDisconnected: false } }
        ).lean();
        await sendToQueue('confirmationQueue', { chatId, endpoint: 'walletConnected', walletAddress: messageText });
      } else {
        ctx.reply('Unrecognized command or message. Use /start to begin.');
      }
    }
  } catch (error) {
    logger.error('Error handling user message:', error);
  }
});

module.exports = { bot };
