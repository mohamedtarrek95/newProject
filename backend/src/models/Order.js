const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    enum: ['BUY_USDT', 'SELL_USDT', 'EGP_TO_USDT', 'USDT_TO_EGP'],
    required: [true, 'Order type is required']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  exchangeRate: {
    type: Number,
    required: [true, 'Exchange rate is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  walletAddress: {
    type: String,
    trim: true
  },
  txid: {
    type: String,
    trim: true,
    default: null
  },
  telegramUsername: {
    type: String,
    trim: true,
    default: null
  },
  paymentProofUrl: {
    type: String,
    default: null
  },
  adminNotes: {
    type: String,
    trim: true
  },
  paymentDetails: {
    type: String,
    trim: true,
    default: null
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
