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
    const knexInstance = req.app.get('db');
    const { event_id } = req.params;
  
    eventsService.getEventsById(knexInstance, event_id)
    .then(event => { 
      if(!event){
        return res.status(404).json({
          error: { message: `Event doesn't exist` }
        })
      }
      res.json(event)
    })
    .catch(next)
  })
  .patch((req, res, next) => {
    const { event_id } = parseInt(req.params); //parseInt() for integers
    const {title, event_purpose, time, description} = req.body;
    const requiredFields = { title, event_purpose, time, description };
  
    for (const [key, value] of Object.entries(requiredFields)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    } 
  
    const updates = {title, event_purpose, time, description};
    EventService.updateEventById(req.app.get('db'), event_id, updates)
    .then(() => {
      res.status(204).end();
    })
    .catch(next);
  })
  .delete((req, res) => {
    // move implementation logic into here
  })

module.exports = eventsRouter