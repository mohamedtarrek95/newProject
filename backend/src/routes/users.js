const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(auth);

router.get('/', admin, userController.getAllUsers);
router.get('/:id', admin, userController.getUserById);

router.put('/profile', [
  body('firstName').optional().trim().isLength({ max: 50 }),
  body('lastName').optional().trim().isLength({ max: 50 })
], validate, userController.updateProfile);

router.put('/wallet', [
  body('walletAddress').optional().trim()
], validate, userController.updateWallet);

router.put('/:id/role', admin, [
  body('role').isIn(['user', 'admin']).withMessage('Role must be user or admin')
], validate, userController.updateRole);

router.delete('/:id', admin, userController.deleteUser);

module.exports = router;
