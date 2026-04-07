/**
 * Controllers Index - Central controller loader
 */

const authController = require('./auth.controller')
const studentController = require('./student.controller')
const pipelineController = require('./pipeline.controller')
const reportController = require('./report.controller')

module.exports = {
  authController,
  studentController,
  pipelineController,
  reportController,
}
