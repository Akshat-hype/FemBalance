// User-related type definitions

export const UserRoles = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING_VERIFICATION: 'pending_verification'
};

export const NotificationPreferences = {
  PERIOD_REMINDERS: 'periodReminders',
  OVULATION_REMINDERS: 'ovulationReminders',
  IRREGULARITY_ALERTS: 'irregularityAlerts',
  PCOS_INSIGHTS: 'pcosInsights',
  WELLNESS_TIPS: 'wellnessTips'
};

export const Units = {
  METRIC: 'metric',
  IMPERIAL: 'imperial'
};

// Type validation functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 12 && age <= 60;
};

export const validatePassword = (password) => {
  // At least 6 characters, contains letter and number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  return passwordRegex.test(password);
};