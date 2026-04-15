const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret, jwtExpiresIn, jwtRefreshSecret, jwtRefreshExpiresIn } = require('../config/jwt');
const { logTransaction } = require('../middleware/logger');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpiresIn });
  const refreshToken = jwt.sign({ userId }, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });
  return { accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await logTransaction('USER_REGISTER', user._id, null, { email }, req);

    res.status(201).json({
      message: 'Registration successful',
      accessToken,
      user
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await logTransaction('USER_LOGIN', user._id, null, { email }, req);

    res.json({
      message: 'Login successful',
      accessToken,
      user
    });
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, jwtRefreshSecret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    next(error);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
