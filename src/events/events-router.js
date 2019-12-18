const express = require('express');
const EventsService = require('./events-service');
const AttendeesService = require('../attendees/attendees-service');
const eventsRouter = express.Router();
const bodyParser = express.json();
const logger = require('../logger');
const xss = require('xss');
const { requireAuth } = require('../middleware/jwt-auth');

const serializeEvent = event => ({
  id: parseInt(event.id),
  organizer: parseInt(event.organizer),
  title: xss(event.title),
  event_purpose: xss(event.event_purpose),
  restaurant: xss(event.restaurant),
  address: xss(event.address),
  date: new Date(event.date),
  time: event.time,
  description: xss(event.description),
  singles_only: event.singles_only,
  date_created: new Date(event.date_created)
  })


eventsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    EventsService.getAllEvents(knexInstance)
    .then(events => { 
      res.json(events.map(serializeEvent))
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
    .then(event => {
      const organizerAsAttended = {
        user_id: event.organizer,
        event_id: event.id
      }
      AttendeesService.insertAttendee(req.app.get('db'), organizerAsAttended)
      .then((attendee) => {
        res.attendee = attendee
        res.status(200).json({ event, attendee})
      })
    })
    .catch(next);
  })

eventsRouter
  .route('/:event_id')
  .all(requireAuth)
  .all((req, res, next) => {
    EventsService.getEventById(
      req.app.get('db'),
      parseInt(req.params.event_id)
    )
      .then(event => {
        if (!event) {
          return res.status(404).json({
            error: { message: `Event doesn't exist` }
          })
        }
        res.event = event; // save the event for the next middleware
        next();
      })
      .catch(next)
})
  .get((req, res, next) => {
    res.json(serializeEvent(res.event));
  })
  .patch(bodyParser, (req, res, next) => {
    const { event_id } = req.params; //
    const {title, description} = req.body;
    const eventToUpdate = { title, description };
  
    const numberOfValues = Object.values(eventToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'title' or 'description'`
        }
      })


    EventsService.updateEventById(req.app.get('db'), event_id, eventToUpdate)
    .then((rowsAffected) => {
      res.status(204).end();
    })
    .catch(next);
  })
  .delete((req, res, next) => {
    if(!req.params.event_id){
      logger.error(`Event id is required.`);
      return res.status(400).send('Invalid data')
    }
    EventsService.deleteEvent(res.app.get('db'), req.params.event_id)
      .then( (count) => {
        if(count === 0){
          return res.status(404).json({
            error: { message: `Event does not exist`}
          })
        }
        res
        .status(204)
        .end();
      })
      .catch(next)
      logger.info(`Event with event_id ${req.params.event_id} deleted.`);  
  })

  eventsRouter
  .route('/:event_id/attendees')
  .all(requireAuth)
  .all((req, res, next) => {
    EventsService.getAllAttendeesByEventId(
      req.app.get('db'),
      parseInt(req.params.event_id)
    )
      .then(attendees => {
        if (attendees.length === 0) {
          return res.status(404).json({
            error: { message: `Event doesn't exist` }
          })
        }
        res.attendees = attendees; // save the event for the next middleware
        next();
      })
      .catch(next)
})
  .get((req, res, next) => {
    res.json(res.attendees);
  })


module.exports = eventsRouter