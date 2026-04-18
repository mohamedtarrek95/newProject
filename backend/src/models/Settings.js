const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  usdtWalletAddress: {
    type: String,
    trim: true,
    default: ''
  },
  usdtNetwork: {
    type: String,
    default: 'TRC20'
  },
  usdtQrCodeUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
