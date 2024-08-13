const mongoose = require('mongoose');
const User = require('../models/User');
const { expect } = require('chai');

describe('User Model Test', () => {
  before(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async () => {
    await mongoose.connection.dropDatabase(); // Clean up the database
    await mongoose.connection.close();
  });

  it('should create a user', async () => {
    const user = new User({ username: 'testuser', chatId: 12345 }); // Use a number for chatId
    const savedUser = await user.save();

    expect(savedUser.username).to.equal('testuser');
    expect(savedUser.chatId).to.equal(12345);
  });

  it('should update modification number', async () => {
    const user = await User.findOne({ username: 'testuser' }).lean();
    user.username = 'updateduser';
    await User.updateOne({ _id: user._id }, { $set: { username: 'updateduser' }, $inc: { modificationNumber: 1 } });

    const updatedUser = await User.findOne({ username: 'updateduser' }).lean();
    expect(updatedUser.modificationNumber).to.equal(1);
  });
});
