const Settings = require('../models/Settings');

const SETTINGS_KEY = 'usdt_receiving';

exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ key: SETTINGS_KEY });
    if (!settings) {
      settings = await Settings.create({
        key: SETTINGS_KEY,
        usdtWalletAddress: '',
        usdtNetwork: 'TRC20',
        usdtQrCodeUrl: null
      });
    }
    res.json({
      usdtWalletAddress: settings.usdtWalletAddress,
      usdtNetwork: settings.usdtNetwork,
      usdtQrCodeUrl: settings.usdtQrCodeUrl
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { usdtWalletAddress, usdtNetwork, usdtQrCodeUrl } = req.body;
    let settings = await Settings.findOne({ key: SETTINGS_KEY });
    if (!settings) {
      settings = new Settings({ key: SETTINGS_KEY });
    }
    if (usdtWalletAddress !== undefined) settings.usdtWalletAddress = usdtWalletAddress;
    if (usdtNetwork !== undefined) settings.usdtNetwork = usdtNetwork;
    if (usdtQrCodeUrl !== undefined) settings.usdtQrCodeUrl = usdtQrCodeUrl;
    await settings.save();
    res.json({
      usdtWalletAddress: settings.usdtWalletAddress,
      usdtNetwork: settings.usdtNetwork,
      usdtQrCodeUrl: settings.usdtQrCodeUrl
    });
  } catch (error) {
    next(error);
  }
};

// uploadQrCode removed - QR code is now set via updateSettings with usdtQrCodeUrl field
