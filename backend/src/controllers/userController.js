const User = require('../models/User');
const { logTransaction } = require('../middleware/logger');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName },
      { new: true, runValidators: true }
    );

    await logTransaction('UPDATE_PROFILE', req.user._id, null, { firstName, lastName }, req);

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateWallet = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { walletAddress },
      { new: true, runValidators: true }
    );

    await logTransaction('UPDATE_WALLET', req.user._id, null, { walletAddress }, req);

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be user or admin' });
    }

    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await logTransaction('UPDATE_ROLE', req.user._id, req.params.id, { role }, req);

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await logTransaction('DELETE_USER', req.user._id, req.params.id, { deletedUser: user.email }, req);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
