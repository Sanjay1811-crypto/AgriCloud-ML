const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'agricloud_super_secret_jwt_key_2026_capstone_secure_token', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new user (Farmer or Agronomy Expert)
// @route   POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please login instead.'
      });
    }

    // Role assignment: 'expert' or 'user' (default 'user')
    const assignedRole = role === 'expert' ? 'expert' : 'user';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: `Account registered successfully as ${assignedRole === 'expert' ? 'Agronomy Expert' : 'Farmer / User'}.`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token (with optional portal validation)
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password, portalType } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Portal-specific verification
    if (portalType === 'expert' && user.role !== 'expert' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Restricted: This portal is reserved for certified Agronomists and Pathology Experts. Please sign in through the Farmer / User portal or create an Expert account.'
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user (stateless JWT client cleanup)
// @route   POST /api/auth/logout
const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully.'
  });
};

module.exports = {
  signup,
  login,
  getMe,
  logout
};
