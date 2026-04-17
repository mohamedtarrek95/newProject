const Currency = require('../models/Currency');
const { logTransaction } = require('../middleware/logger');

exports.getCurrencies = async (req, res, next) => {
  try {
    const currencies = await Currency.find({ isActive: true }).sort({ code: 1 });
    res.json(currencies);
  } catch (error) {
    next(error);
  }
};

exports.getCurrency = async (req, res, next) => {
  try {
    const currency = await Currency.findOne({ code: req.params.code.toUpperCase() });
    if (!currency) {
      return res.status(404).json({ message: 'Currency not found' });
    }
    res.json(currency);
  } catch (error) {
    next(error);
  }
};

exports.updateCurrency = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, buyPrice, sellPrice, paymentMethods } = req.body;

    let currency = await Currency.findOne({ code: code.toUpperCase() });

    if (!currency) {
      if (!name || buyPrice === undefined || sellPrice === undefined) {
        return res.status(400).json({ message: 'Name, buyPrice, and sellPrice are required for new currency' });
      }
      currency = new Currency({
        code: code.toUpperCase(),
        name,
        buyPrice,
        sellPrice,
        paymentMethods: paymentMethods || [],
        isActive: true
      });
    } else {
      if (name !== undefined) currency.name = name;
      if (buyPrice !== undefined) currency.buyPrice = buyPrice;
      if (sellPrice !== undefined) currency.sellPrice = sellPrice;
      if (paymentMethods !== undefined) currency.paymentMethods = paymentMethods;
    }
    currency.updatedBy = req.user._id;

    await currency.save();
    await logTransaction('UPDATE_CURRENCY', req.user._id, null, { code, name, buyPrice, sellPrice, paymentMethods }, req);

    res.json(currency);
  } catch (error) {
    next(error);
  }
};

exports.seedCurrencies = async (req, res, next) => {
  try {
    const defaultCurrencies = [
      {
        code: 'EGP',
        name: 'Egyptian Pound',
        buyPrice: 100,
        sellPrice: 100,
        paymentMethods: ['Instapay']
      },
      {
        code: 'USD',
        name: 'US Dollar',
        buyPrice: 100,
        sellPrice: 100,
        paymentMethods: ['Payoneer', 'Revolut', 'Zelle']
      },
      {
        code: 'EUR',
        name: 'Euro',
        buyPrice: 100,
        sellPrice: 100,
        paymentMethods: ['SEPA Instant', 'Revolut']
      }
    ];

    for (const curr of defaultCurrencies) {
      await Currency.findOneAndUpdate(
        { code: curr.code },
        curr,
        { upsert: true, new: true }
      );
    }

    const currencies = await Currency.find().sort({ code: 1 });
    res.json(currencies);
  } catch (error) {
    next(error);
  }
};
