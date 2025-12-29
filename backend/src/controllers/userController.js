const User = require('../models/User');
const logger = require('../utils/logger');

const userController = {
  // Get user profile
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user: user.toJSON() });
    } catch (error) {
      logger.error('Get profile error:', error);
      next(error);
    }
  },

  // Update user profile
  async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, height, weight, dateOfBirth } = req.body;
      
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update profile fields
      if (firstName) user.profile.firstName = firstName;
      if (lastName) user.profile.lastName = lastName;
      if (height) user.profile.height = height;
      if (weight) user.profile.weight = weight;
      if (dateOfBirth) user.profile.dateOfBirth = new Date(dateOfBirth);

      await user.save();

      logger.info(`Profile updated for user: ${user.email}`);
      res.json({ 
        message: 'Profile updated successfully',
        user: user.toJSON() 
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      next(error);
    }
  },

  // Get user preferences
  async getPreferences(req, res, next) {
    try {
      const user = await User.findById(req.userId).select('preferences');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ preferences: user.preferences });
    } catch (error) {
      logger.error('Get preferences error:', error);
      next(error);
    }
  },

  // Update user preferences
  async updatePreferences(req, res, next) {
    try {
      const { units, notifications, privacy } = req.body;
      
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update preferences
      if (units) user.preferences.units = units;
      if (notifications) {
        user.preferences.notifications = {
          ...user.preferences.notifications,
          ...notifications
        };
      }
      if (privacy) {
        user.preferences.privacy = {
          ...user.preferences.privacy,
          ...privacy
        };
      }

      await user.save();

      logger.info(`Preferences updated for user: ${user.email}`);
      res.json({ 
        message: 'Preferences updated successfully',
        preferences: user.preferences 
      });
    } catch (error) {
      logger.error('Update preferences error:', error);
      next(error);
    }
  },

  // Change password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const user = await User.findById(req.userId).select('+password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Change password error:', error);
      next(error);
    }
  },

  // Delete user account
  async deleteAccount(req, res, next) {
    try {
      const { password } = req.body;
      
      const user = await User.findById(req.userId).select('+password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify password before deletion
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Password is incorrect' });
      }

      // Soft delete - mark as inactive
      user.isActive = false;
      await user.save();

      // TODO: Also delete or anonymize related data (cycles, symptoms, etc.)

      logger.info(`Account deleted for user: ${user.email}`);
      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      logger.error('Delete account error:', error);
      next(error);
    }
  },

  // Get user statistics
  async getStats(req, res, next) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // TODO: Aggregate statistics from related collections
      const stats = {
        accountCreated: user.createdAt,
        lastLogin: user.lastLogin,
        totalCycles: 0, // Will be calculated from Cycle collection
        totalSymptomLogs: 0, // Will be calculated from Symptom collection
        totalWorkouts: 0, // Will be calculated from Workout collection
        profileCompleteness: calculateProfileCompleteness(user)
      };

      res.json({ stats });
    } catch (error) {
      logger.error('Get stats error:', error);
      next(error);
    }
  }
};

// Helper function to calculate profile completeness
const calculateProfileCompleteness = (user) => {
  const fields = [
    user.profile.firstName,
    user.profile.lastName,
    user.profile.dateOfBirth,
    user.profile.height,
    user.profile.weight,
    user.email,
    user.isEmailVerified
  ];

  const completedFields = fields.filter(field => field !== null && field !== undefined && field !== '').length;
  return Math.round((completedFields / fields.length) * 100);
};

module.exports = userController;