// Email validation
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Password validation (min 8 chars, at least one letter and one number)
  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };
  
  // Phone number validation (allows different formats)
  const isValidPhone = (phone) => {
    // Basic phone number regex, can be customized based on country
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
  };
  
  // Check if string is empty or whitespace only
  const isEmpty = (str) => {
    return (!str || str.trim().length === 0);
  };
  
  // Check if value is a valid number
  const isValidNumber = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  };
  
  // Check if value is a positive number
  const isPositiveNumber = (value) => {
    return isValidNumber(value) && parseFloat(value) > 0;
  };
  
  // Check if date is valid
  const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date);
  };
  
  module.exports = {
    isValidEmail,
    isValidPassword,
    isValidPhone,
    isEmpty,
    isValidNumber,
    isPositiveNumber,
    isValidDate
  };