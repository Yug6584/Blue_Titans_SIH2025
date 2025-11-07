/**
 * Date utility functions for consistent date formatting across the application
 */

/**
 * Format date to YYYY-MM-DD format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateYMD = (date) => {
  if (!date) return 'Not set';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    // Use en-CA locale to get YYYY-MM-DD format
    return dateObj.toLocaleDateString('en-CA');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format date to readable format (e.g., "November 3, 2025")
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateReadable = (date) => {
  if (!date) return 'Not set';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format date and time to readable format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return 'Not set';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Calculate duration between two dates in years
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {number} Duration in years (rounded to 1 decimal place)
 */
export const calculateDurationYears = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    const durationMs = end - start;
    const durationYears = durationMs / (365.25 * 24 * 60 * 60 * 1000);
    
    return Math.max(0, Math.round(durationYears * 10) / 10);
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 0;
  }
};

/**
 * Check if a date string is valid
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
export const getTodayYMD = () => {
  return new Date().toLocaleDateString('en-CA');
};