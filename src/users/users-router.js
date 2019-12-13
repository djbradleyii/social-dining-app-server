const express = require('express')

const usersRouter = express.Router()
const bodyParser = express.json()

usersRouter
  .route('/api/users')
  .get((req, res) => {
    // move implementation logic into here
  })
  .post(bodyParser, (req, res) => {
    // move implementation logic into here
  })

usersRouter
  .route('/api/users/:id')
  .get((req, res) => {
    // move implementation logic into here
  })
  .delete((req, res) => {
    // move implementation logic into here
  })

module.exports = usersRouter;