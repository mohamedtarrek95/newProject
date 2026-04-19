const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const upload = require('../config/upload');

const router = express.Router();

router.post('/', auth, [
  body('type').isIn(['BUY_USDT', 'SELL_USDT', 'EGP_TO_USDT', 'USDT_TO_EGP']).withMessage('Invalid order type'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isString().notEmpty().withMessage('Currency is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('walletAddress').optional().trim(),
  body('txid').optional().trim(),
  body('telegramUsername').optional().trim()
], validate, orderController.createOrder);

router.get('/', auth, orderController.getMyOrders);
router.get('/admin/all', auth, admin, orderController.getAllOrders);

router.get('/:id', auth, orderController.getOrderById);

router.put('/:id/txid', auth, [
  body('txid').notEmpty().withMessage('TXID is required')
], validate, orderController.updateTxid);

router.post('/:id/proof', auth, upload.single('proof'), orderController.uploadProof);

router.put('/:id/approve', auth, admin, [
  body('adminNotes').optional().trim()
], validate, orderController.approveOrder);

router.put('/:id/reject', auth, admin, [
  body('adminNotes').optional().trim()
], validate, orderController.rejectOrder);

module.exports = router;
