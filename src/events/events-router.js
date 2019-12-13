const express = require('express')

const eventsRouter = express.Router()
const bodyParser = express.json()

eventsRouter
  .route('/api/events')
  .get((req, res) => {
    const knexInstance = req.app.get('db')
    EventsService.getAllEvents(knexInstance)
    .then(events => { 
      res.json(events.map(event => ({
        id: event.id,
        organizer: parseInt(event.organizer),
        title: event.title,
        event_purpose: event.event_purpose,
        restaurant: event.restaurant,
        address: event.address,
        date: new Date(event.date),
        time: event.time,
        description: event.description,
        singles_only: event.singles_only,
        date_created: new Date(event.date_created)
        })))
    })
    .catch(next)
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