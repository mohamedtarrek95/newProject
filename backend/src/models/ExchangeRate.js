const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
  rate: {
    type: Number,
    required: [true, 'Exchange rate is required'],
    min: [0, 'Rate cannot be negative']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);
