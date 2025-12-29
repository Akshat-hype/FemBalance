// Validation utility functions

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 6 characters, contains letter and number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  return passwordRegex.test(password);
};

export const validateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 12 && age <= 60;
};

export const validateCycleLength = (length) => {
  return length >= 15 && length <= 45;
};

export const validatePeriodLength = (length) => {
  return length >= 1 && length <= 10;
};

export const validateDateRange = (startDate, endDate) => {
  if (!endDate) return true; // End date is optional
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return end > start;
};

export const validateBMI = (bmi) => {
  return bmi >= 10 && bmi <= 50;
};

export const validateSymptomScore = (score) => {
  return score >= 0 && score <= 5;
};

export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Form validation helper
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    
    fieldRules.forEach(rule => {
      if (rule.required && !validateRequired(value)) {
        errors[field] = rule.message || `${field} is required`;
        return;
      }
      
      if (value && rule.validator && !rule.validator(value)) {
        errors[field] = rule.message || `${field} is invalid`;
        return;
      }
    });
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};