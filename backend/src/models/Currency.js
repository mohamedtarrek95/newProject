const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const currencySchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Currency code is required'],
    enum: ['EGP', 'USD', 'EUR'],
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Currency name is required']
  },
  buyPrice: {
    type: Number,
    required: [true, 'Buy price is required'],
    min: [0, 'Buy price cannot be negative']
  },
  sellPrice: {
    type: Number,
    required: [true, 'Sell price is required'],
    min: [0, 'Sell price cannot be negative']
  },
  paymentMethods: [{
    type: String,
    enum: ['Instapay', 'Payoneer', 'Revolut', 'Zelle', 'SEPA Instant']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

currencySchema.index({ code: 1 });

module.exports = mongoose.model('Currency', currencySchema);
