const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { authService } = require('../services/authService');
const logger = require('../utils/logger');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const authController = {
  // Register new user
  async register(req, res, next) {
    try {
      const { email, password, firstName, lastName, dateOfBirth } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Create new user
      const user = new User({
        email,
        password,
        profile: {
          firstName,
          lastName,
          dateOfBirth: new Date(dateOfBirth)
        }
      });

      await user.save();

      // Generate token
      const token = generateToken(user._id);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: user.toJSON()
      });
    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  },

  // Login user
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate token
      const token = generateToken(user._id);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      logger.info(`User logged in: ${email}`);

      res.json({
        message: 'Login successful',
        token,
        user: user.toJSON()
      });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  },

  // Get current user
  async getCurrentUser(req, res, next) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user: user.toJSON() });
    } catch (error) {
      logger.error('Get current user error:', error);
      next(error);
    }
  },

  // Logout user
  async logout(req, res, next) {
    try {
      // In a more complex setup, you might want to blacklist the token
      // For now, we'll just send a success response
      res.json({ message: 'Logout successful' });
    } catch (error) {
      logger.error('Logout error:', error);
      next(error);
    }
  },

  // Forgot password
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if email exists or not
        return res.json({ message: 'If the email exists, a reset link has been sent' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      await user.save();

      // TODO: Send email with reset token
      // For now, we'll just log it (in production, use email service)
      logger.info(`Password reset token for ${email}: ${resetToken}`);

      res.json({ message: 'If the email exists, a reset link has been sent' });
    } catch (error) {
      logger.error('Forgot password error:', error);
      next(error);
    }
  },

  // Reset password
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      // Hash the token to compare with stored hash
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Update password
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save();

      logger.info(`Password reset successful for user: ${user.email}`);

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      logger.error('Reset password error:', error);
      next(error);
    }
  }
};

module.exports = authController;