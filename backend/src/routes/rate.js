const express = require('express');
const { body } = require('express-validator');
const rateController = require('../controllers/rateController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', rateController.getRate);

router.put('/', auth, admin, [
  body('rate').isFloat({ min: 0 }).withMessage('Rate must be a positive number')
], validate, rateController.updateRate);

module.exports = router;
