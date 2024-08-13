const mongoose = require('mongoose');
const User = require('../src/models/User');
const { faker } = require('@faker-js/faker'); // Updated import

// Connect to MongoDB
mongoose.connect('mongodb://localhost/telegram-bot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const generateRandomUsers = (num) => {
  const users = [];
  for (let i = 0; i < num; i++) {
    users.push({
      username: faker.internet.userName(),
      chatId: faker.number.int({ min: 1000000000, max: 9999999999 }).toString(),
      acceptedTerms: faker.datatype.boolean(),
      walletDisconnected: faker.datatype.boolean(),
      modificationNumber: faker.number.int({ min: 0, max: 5 }),
    });
  }
  return users;
};

const insertTestData = async () => {
  try {
    const users = generateRandomUsers(50000);
    await User.insertMany(users);
    console.log('Data successfully inserted!');
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    await mongoose.connection.close();
  }
};

insertTestData();
