const express = require('express');
const router = express.Router();
const { getCurrencies, getCurrency, updateCurrency, seedCurrencies } = require('../controllers/currencyController');
const { auth, admin } = require('../middleware/auth');

router.get('/', getCurrencies);
router.get('/:code', getCurrency);
router.put('/:code', auth, admin, updateCurrency);
router.post('/seed', seedCurrencies);

module.exports = router;
