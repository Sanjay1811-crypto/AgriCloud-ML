const User = require('../models/User');
const Analysis = require('../models/Analysis');

// @desc    Get profile details and summary
// @route   GET /api/users/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const count = await Analysis.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        totalAnalyses: count
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile details
// @route   PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, password } = req.body;

    if (name) user.name = name;
    if (password && password.length >= 6) user.password = password;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
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

module.exports = {
  getProfile,
  updateProfile
};
