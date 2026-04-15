const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const upload = require('../config/upload');

const router = express.Router();

router.post('/', auth, [
  body('type').isIn(['EGP_TO_USDT', 'USDT_TO_EGP']).withMessage('Invalid order type'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0')
], validate, orderController.createOrder);

router.get('/', auth, orderController.getMyOrders);
router.get('/admin/all', auth, admin, orderController.getAllOrders);

router.get('/:id', auth, orderController.getOrderById);

router.post('/:id/proof', auth, upload.single('proof'), orderController.uploadProof);

router.put('/:id/approve', auth, admin, [
  body('adminNotes').optional().trim()
], validate, orderController.approveOrder);

router.put('/:id/reject', auth, admin, [
  body('adminNotes').optional().trim()
], validate, orderController.rejectOrder);

module.exports = router;
