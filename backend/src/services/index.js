/**
 * Services Index - Central service loader
 */

const authService = require('./auth.service')
const dbService = require('./db.service')
const fileService = require('./file.service')
const aiBridgeService = require('./aiBridge.service')

module.exports = {
  authService,
  dbService,
  fileService,
  aiBridgeService,
}
