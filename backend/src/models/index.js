/**
 * Models Index - Central model schemas loader
 */

const userModel = require('./user.model')
const studentModel = require('./student.model')
const assignmentModel = require('./assignment.model')
const decisionModel = require('./decision.model')

module.exports = {
  userModel,
  studentModel,
  assignmentModel,
  decisionModel,
}
