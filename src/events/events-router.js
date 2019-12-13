const express = require('express')

const eventsRouter = express.Router()
const bodyParser = express.json()

eventsRouter
  .route('/api/events')
  .get((req, res) => {
    // move implementation logic into here
  })
  .post(bodyParser, (req, res) => {
    // move implementation logic into here
  })

eventsRouter
  .route('/api/events/:event_id')
  .get((req, res) => {
    // move implementation logic into here
  })
  .delete((req, res) => {
    // move implementation logic into here
  })

module.exports = eventsRouter