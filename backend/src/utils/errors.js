/**
 * Custom Error Classes
 * Application-specific error handling
 */

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.timestamp = new Date().toISOString()
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400)
    this.name = 'ValidationError'
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404)
    this.name = 'NotFoundError'
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401)
    this.name = 'UnauthorizedError'
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409)
    this.name = 'ConflictError'
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
}
