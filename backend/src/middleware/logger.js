const TransactionLog = require('../models/TransactionLog');

const logTransaction = async (action, userId, orderId, details, req) => {
  try {
    await TransactionLog.create({
      action,
      userId,
      orderId,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });
  } catch (error) {
    console.error('Failed to log transaction:', error.message);
  }
};

const logger = (req, res, next) => {
  const originalSend = res.send;

  res.send = function(body) {
    res.locals.responseBody = body;
    return originalSend.call(this, body);
  };

  next();
};

module.exports = {
  logTransaction,
  logger
};
