const express = require('express')

const eventsRouter = express.Router()
const bodyParser = express.json()

eventsRouter
  .route('/api/events')
  .get((req, res, next) => {
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
  .post(bodyParser, (req, res, next) => {
    const { organizer, title, event_purpose, restaurant, address, date, time, description, singles_only } = req.body;
    const requiredFields = { organizer, title, event_purpose, restaurant, address, date, time, description, singles_only };
    
    for (const [key, value] of Object.entries(requiredFields)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }  
  
     const newEvent = {
      organizer,
      title,
      event_purpose,
      restaurant,
      address,
      date,
      time,
      description,
      singles_only
    }
  
  
    EventsService.insertEvent(req.app.get('db'), newEvent)
    .then(eventId => {
      res
      .status(204).end();
    })
    .catch(next);
  })

eventsRouter
  .route('/api/events/:event_id')
  .get((req, res, next) => {
    // move implementation logic into here
  })
  .delete((req, res) => {
    // move implementation logic into here
  })

module.exports = eventsRouter