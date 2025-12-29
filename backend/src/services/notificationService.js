const User = require('../models/User');
const Cycle = require('../models/Cycle');
const { predictNextPeriod } = require('../utils/dateHelpers');

class NotificationService {
  constructor() {
    this.notificationTypes = {
      PERIOD_REMINDER: 'period_reminder',
      OVULATION_REMINDER: 'ovulation_reminder',
      SYMPTOM_REMINDER: 'symptom_reminder',
      WORKOUT_REMINDER: 'workout_reminder',
      MEAL_REMINDER: 'meal_reminder',
      MEDICATION_REMINDER: 'medication_reminder',
      APPOINTMENT_REMINDER: 'appointment_reminder'
    };
  }

  // Send period reminder
  async sendPeriodReminder(userId, daysUntilPeriod) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.notificationSettings?.periodReminders) {
        return null;
      }

      const notification = {
        type: this.notificationTypes.PERIOD_REMINDER,
        title: 'Period Reminder',
        message: `Your period is expected in ${daysUntilPeriod} day${daysUntilPeriod !== 1 ? 's' : ''}`,
        userId,
        scheduledFor: new Date(),
        data: { daysUntilPeriod }
      };

      // In production, this would integrate with push notification service
      console.log('Period reminder notification:', notification);
      
      return await this.saveNotification(notification);
    } catch (error) {
      throw new Error(`Failed to send period reminder: ${error.message}`);
    }
  }

  // Send ovulation reminder
  async sendOvulationReminder(userId, daysUntilOvulation) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.notificationSettings?.ovulationReminders) {
        return null;
      }

      const notification = {
        type: this.notificationTypes.OVULATION_REMINDER,
        title: 'Ovulation Window',
        message: `Your fertile window starts in ${daysUntilOvulation} day${daysUntilOvulation !== 1 ? 's' : ''}`,
        userId,
        scheduledFor: new Date(),
        data: { daysUntilOvulation }
      };

      console.log('Ovulation reminder notification:', notification);
      
      return await this.saveNotification(notification);
    } catch (error) {
      throw new Error(`Failed to send ovulation reminder: ${error.message}`);
    }
  }

  // Send symptom tracking reminder
  async sendSymptomReminder(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.notificationSettings?.symptomReminders) {
        return null;
      }

      const notification = {
        type: this.notificationTypes.SYMPTOM_REMINDER,
        title: 'Track Your Symptoms',
        message: 'Don\'t forget to log your symptoms today to better understand your cycle patterns',
        userId,
        scheduledFor: new Date()
      };

      console.log('Symptom reminder notification:', notification);
      
      return await this.saveNotification(notification);
    } catch (error) {
      throw new Error(`Failed to send symptom reminder: ${error.message}`);
    }
  }

  // Send workout reminder
  async sendWorkoutReminder(userId, workoutType = 'workout') {
    try {
      const user = await User.findById(userId);
      if (!user || !user.notificationSettings?.workoutReminders) {
        return null;
      }

      const notification = {
        type: this.notificationTypes.WORKOUT_REMINDER,
        title: 'Time to Move!',
        message: `Ready for your ${workoutType} session? Let's get moving!`,
        userId,
        scheduledFor: new Date(),
        data: { workoutType }
      };

      console.log('Workout reminder notification:', notification);
      
      return await this.saveNotification(notification);
    } catch (error) {
      throw new Error(`Failed to send workout reminder: ${error.message}`);
    }
  }

  // Send meal reminder
  async sendMealReminder(userId, mealType) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.notificationSettings?.mealReminders) {
        return null;
      }

      const mealMessages = {
        breakfast: 'Start your day with a nutritious breakfast!',
        lunch: 'Time for a healthy lunch break!',
        dinner: 'Don\'t forget to log your dinner!',
        snack: 'Consider a healthy snack to keep your energy up!'
      };

      const notification = {
        type: this.notificationTypes.MEAL_REMINDER,
        title: 'Meal Reminder',
        message: mealMessages[mealType] || 'Time to log your meal!',
        userId,
        scheduledFor: new Date(),
        data: { mealType }
      };

      console.log('Meal reminder notification:', notification);
      
      return await this.saveNotification(notification);
    } catch (error) {
      throw new Error(`Failed to send meal reminder: ${error.message}`);
    }
  }

  // Schedule period predictions
  async schedulePeriodPredictions() {
    try {
      const users = await User.find({
        'notificationSettings.periodReminders': true
      });

      const predictions = [];

      for (const user of users) {
        try {
          const cycles = await Cycle.find({ userId: user._id })
            .sort({ startDate: -1 })
            .limit(6);

          if (cycles.length > 0) {
            const prediction = predictNextPeriod(cycles);
            if (prediction) {
              const daysUntil = Math.floor((prediction.predictedDate - new Date()) / (1000 * 60 * 60 * 24));
              
              // Send reminder 3 days before predicted period
              if (daysUntil === 3) {
                await this.sendPeriodReminder(user._id, daysUntil);
                predictions.push({ userId: user._id, daysUntil });
              }
            }
          }
        } catch (userError) {
          console.error(`Error processing user ${user._id}:`, userError);
        }
      }

      return predictions;
    } catch (error) {
      throw new Error(`Failed to schedule period predictions: ${error.message}`);
    }
  }

  // Get user notifications
  async getUserNotifications(userId, options = {}) {
    try {
      const { limit = 20, unreadOnly = false } = options;
      
      // In production, this would query a notifications collection
      // For now, return mock data
      const notifications = [
        {
          id: '1',
          type: this.notificationTypes.PERIOD_REMINDER,
          title: 'Period Reminder',
          message: 'Your period is expected in 2 days',
          createdAt: new Date(),
          read: false
        }
      ];

      return notifications;
    } catch (error) {
      throw new Error(`Failed to get user notifications: ${error.message}`);
    }
  }

  // Mark notification as read
  async markAsRead(userId, notificationId) {
    try {
      // In production, this would update the notification in database
      console.log(`Marking notification ${notificationId} as read for user ${userId}`);
      
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  // Update notification settings
  async updateNotificationSettings(userId, settings) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          $set: { 
            'notificationSettings': {
              ...settings,
              updatedAt: new Date()
            }
          }
        },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user.notificationSettings;
    } catch (error) {
      throw new Error(`Failed to update notification settings: ${error.message}`);
    }
  }

  // Save notification (helper method)
  async saveNotification(notification) {
    try {
      // In production, this would save to a notifications collection
      // For now, just return the notification with an ID
      return {
        ...notification,
        id: Date.now().toString(),
        createdAt: new Date(),
        read: false
      };
    } catch (error) {
      throw new Error(`Failed to save notification: ${error.message}`);
    }
  }

  // Send push notification (integration point)
  async sendPushNotification(userId, notification) {
    try {
      // This would integrate with services like Firebase Cloud Messaging,
      // Apple Push Notification Service, etc.
      console.log(`Sending push notification to user ${userId}:`, notification);
      
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to send push notification: ${error.message}`);
    }
  }

  // Send email notification (integration point)
  async sendEmailNotification(userId, notification) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // This would integrate with email services like SendGrid, AWS SES, etc.
      console.log(`Sending email notification to ${user.email}:`, notification);
      
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to send email notification: ${error.message}`);
    }
  }
}

module.exports = new NotificationService();