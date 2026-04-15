const express = require('express');
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.get('/', auth, admin, transactionController.getTransactions);

module.exports = router;
