const ExchangeRate = require('../models/ExchangeRate');
const { logTransaction } = require('../middleware/logger');

exports.getRate = async (req, res, next) => {
  try {
    const rate = await ExchangeRate.findOne().sort({ createdAt: -1 });
    res.json({ rate: rate ? rate.rate : null });
  } catch (error) {
    next(error);
  }
};

exports.updateRate = async (req, res, next) => {
  try {
    const { rate } = req.body;

    const exchangeRate = await ExchangeRate.create({
      rate,
      updatedBy: req.user._id
    });

    await logTransaction('UPDATE_RATE', req.user._id, null, { rate }, req);

    res.json(exchangeRate);
  } catch (error) {
    next(error);
  }
};
