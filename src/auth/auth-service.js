const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')

const AuthService = {
  getUserWithEmail(db, email) {
    return db('users')
      .where({ email })
      .first()
  },
  
}

  module.exports = AuthService;