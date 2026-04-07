/**
 * Input Validators
 * Common validation functions
 */

const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

const isValidUUID = (uuid) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return regex.test(uuid)
}

const isValidString = (str, minLength = 1, maxLength = 1000) => {
  return typeof str === 'string' && str.length >= minLength && str.length <= maxLength
}

const isValidNumber = (num, min = null, max = null) => {
  if (typeof num !== 'number') return false
  if (min !== null && num < min) return false
  if (max !== null && num > max) return false
  return true
}

module.exports = {
  isValidEmail,
  isValidUUID,
  isValidString,
  isValidNumber,
}
