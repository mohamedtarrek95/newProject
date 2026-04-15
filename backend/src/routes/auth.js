const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/register', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').optional().trim().isLength({ max: 50 }),
  body('lastName').optional().trim().isLength({ max: 50 })
], validate, authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], validate, authController.login);

router.post('/refresh', authController.refresh);

router.get('/me', auth, authController.me);

router.post('/logout', authController.logout);

module.exports = router;
