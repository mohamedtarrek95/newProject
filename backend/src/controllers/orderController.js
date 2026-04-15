const Order = require('../models/Order');
const ExchangeRate = require('../models/ExchangeRate');
const { logTransaction } = require('../middleware/logger');

exports.createOrder = async (req, res, next) => {
  try {
    const { type, amount } = req.body;

    const currentRate = await ExchangeRate.findOne().sort({ createdAt: -1 });
    if (!currentRate) {
      return res.status(400).json({ error: 'Exchange rate not set. Please try again later.' });
    }

    const order = await Order.create({
      userId: req.user._id,
      type,
      amount,
      exchangeRate: currentRate.rate
    });

    await logTransaction('CREATE_ORDER', req.user._id, order._id, {
      type,
      amount,
      exchangeRate: currentRate.rate
    }, req);

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'email firstName lastName');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.uploadProof = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Can only upload proof for pending orders' });
    }

    const paymentProofUrl = `/uploads/${req.file.filename}`;
    order.paymentProofUrl = paymentProofUrl;
    await order.save();

    await logTransaction('UPLOAD_PROOF', req.user._id, order._id, {
      paymentProofUrl
    }, req);

    res.json({ message: 'Payment proof uploaded', paymentProofUrl });
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'email firstName lastName')
      .populate('processedBy', 'email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
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

exports.approveOrder = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order is not pending' });
    }

    order.status = 'approved';
    order.processedBy = req.user._id;
    order.adminNotes = adminNotes || '';
    await order.save();

    await logTransaction('APPROVE_ORDER', req.user._id, order._id, {
      orderUserId: order.userId,
      type: order.type,
      amount: order.amount,
      adminNotes
    }, req);

    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.rejectOrder = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order is not pending' });
    }

    order.status = 'rejected';
    order.processedBy = req.user._id;
    order.adminNotes = adminNotes || '';
    await order.save();

    await logTransaction('REJECT_ORDER', req.user._id, order._id, {
      orderUserId: order.userId,
      type: order.type,
      amount: order.amount,
      adminNotes
    }, req);

    res.json(order);
  } catch (error) {
    next(error);
  }
};
