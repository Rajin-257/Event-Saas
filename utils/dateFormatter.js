const moment = require('moment');

// Format date to 'DD MMM YYYY' (e.g., '15 Jan 2023')
const formatDate = (date) => {
  return moment(date).format('DD MMM YYYY');
};

// Format date and time to 'DD MMM YYYY, h:mm A' (e.g., '15 Jan 2023, 3:30 PM')
const formatDateTime = (date) => {
  return moment(date).format('DD MMM YYYY, h:mm A');
};

// Calculate time difference in days
const daysDiff = (startDate, endDate) => {
  return moment(endDate).diff(moment(startDate), 'days');
};

// Check if date is past
const isPast = (date) => {
  return moment().isAfter(moment(date));
};

// Check if date is future
const isFuture = (date) => {
  return moment().isBefore(moment(date));
};

// Check if now is between two dates
const isBetween = (startDate, endDate) => {
  return moment().isBetween(moment(startDate), moment(endDate));
};

module.exports = {
  formatDate,
  formatDateTime,
  daysDiff,
  isPast,
  isFuture,
  isBetween
};