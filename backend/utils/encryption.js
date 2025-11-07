const CryptoJS = require('crypto-js');

// Get encryption key from environment or use default (change in production!)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-super-secret-encryption-key-change-this-in-production';

/**
 * Encrypt sensitive data
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted text
 */
const encrypt = (text) => {
  if (!text) return text;
  
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Return original text if encryption fails
  }
};

/**
 * Decrypt sensitive data
 * @param {string} encryptedText - Encrypted text to decrypt
 * @returns {string} - Decrypted text
 */
const decrypt = (encryptedText) => {
  if (!encryptedText) return encryptedText;
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || encryptedText; // Return original if decryption fails
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Return encrypted text if decryption fails
  }
};

/**
 * Hash sensitive data (one-way)
 * @param {string} text - Text to hash
 * @returns {string} - Hashed text
 */
const hash = (text) => {
  if (!text) return text;
  
  try {
    return CryptoJS.SHA256(text + ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Hashing error:', error);
    return text;
  }
};

module.exports = {
  encrypt,
  decrypt,
  hash
};