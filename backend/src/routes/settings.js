const express = require('express');
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../config/upload');

const router = express.Router();

router.get('/', auth, settingsController.getSettings);
router.put('/', auth, admin, settingsController.updateSettings);
router.post('/qr-upload', auth, admin, upload.single('qrCode'), settingsController.uploadQrCode);

module.exports = router;
