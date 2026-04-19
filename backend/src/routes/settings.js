const express = require('express');
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.get('/', auth, settingsController.getSettings);
router.put('/', auth, admin, settingsController.updateSettings);

module.exports = router;
