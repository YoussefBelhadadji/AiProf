/**
 * Response Formatters
 * Standard response formatting functions
 */

const successResponse = (data, message = 'Success', statusCode = 200) => ({
  success: true,
  statusCode,
  message,
  data,
  timestamp: new Date().toISOString(),
})

const errorResponse = (error, statusCode = 500) => ({
  success: false,
  statusCode,
  error: error instanceof Error ? error.message : error,
  timestamp: new Date().toISOString(),
})

const paginatedResponse = (data, page, limit, total, message = 'Success') => ({
  success: true,
  data,
  pagination: {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  },
  message,
  timestamp: new Date().toISOString(),
})

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
}
