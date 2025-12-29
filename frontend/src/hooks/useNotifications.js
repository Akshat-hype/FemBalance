import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [isSupported, setIsSupported] = useState('Notification' in window);

  useEffect(() => {
    if (!isSupported) return;

    const handlePermissionChange = () => {
      setPermission(Notification.permission);
    };

    // Listen for permission changes (not all browsers support this)
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' }).then((result) => {
        result.addEventListener('change', handlePermissionChange);
        return () => result.removeEventListener('change', handlePermissionChange);
      });
    }
  }, [isSupported]);

  const requestPermission = async () => {
    if (!isSupported) {
      throw new Error('Notifications are not supported in this browser');
    }

    if (permission === 'granted') {
      return 'granted';
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const showNotification = (title, options = {}) => {
    if (!isSupported) {
      console.warn('Notifications are not supported');
      return null;
    }

    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    return notification;
  };

  const schedulePeriodReminder = (daysUntilPeriod) => {
    if (daysUntilPeriod <= 3) {
      showNotification('Period Reminder', {
        body: `Your period is expected in ${daysUntilPeriod} day${daysUntilPeriod !== 1 ? 's' : ''}`,
        tag: 'period-reminder'
      });
    }
  };

  const scheduleOvulationReminder = (daysUntilOvulation) => {
    if (daysUntilOvulation <= 1) {
      showNotification('Ovulation Reminder', {
        body: `You're likely to ovulate ${daysUntilOvulation === 0 ? 'today' : 'tomorrow'}`,
        tag: 'ovulation-reminder'
      });
    }
  };

  const showIrregularityAlert = (message) => {
    showNotification('Cycle Irregularity Detected', {
      body: message,
      tag: 'irregularity-alert',
      requireInteraction: true
    });
  };

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    schedulePeriodReminder,
    scheduleOvulationReminder,
    showIrregularityAlert
  };
};