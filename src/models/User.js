const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, index: true },
  chatId: { type: String, index: true },
  active: { type: Boolean, default: true },
  acceptedTerms: { type: Boolean, default: false },
  walletDisconnected: { type: Boolean, default: false },
  modificationNumber: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { versionKey: false });

// Indexes
userSchema.index({ username: 1 });
userSchema.index({ chatId: 1 });

// Auto-update timestamps and increment modificationNumber
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.pre('updateOne', function(next) {
  this.update({}, { $inc: { modificationNumber: 1 }, $set: { updatedAt: Date.now() } });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
