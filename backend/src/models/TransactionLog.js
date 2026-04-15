const mongoose = require('mongoose');

const transactionLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

transactionLogSchema.index({ userId: 1, createdAt: -1 });
transactionLogSchema.index({ orderId: 1 });
transactionLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('TransactionLog', transactionLogSchema);
