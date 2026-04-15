const TransactionLog = require('../models/TransactionLog');

exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, userId, action } = req.query;

    const query = {};
    if (userId) {
      query.userId = userId;
    }
    if (action) {
      query.action = action;
    }

    const transactions = await TransactionLog.find(query)
      .populate('userId', 'email firstName lastName')
      .populate('orderId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await TransactionLog.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
