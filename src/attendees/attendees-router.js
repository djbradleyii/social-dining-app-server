const express = require('express');
const AttendeesService = require('./attendees-service');
const EventsService = require('../events/events-service');
const attendeesRouter = express.Router();
const bodyParser = express.json();
const logger = require('../logger');
const { requireAuth } = require('../middleware/jwt-auth');

attendeesRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    AttendeesService.getAllAttendees(knexInstance)
    .then(attendees => { 
      res.json(attendees)
    })
    .catch(next)
  })
  .post(bodyParser, (req, res, next) => {
    const { user_id, event_id } = req.body;
    const requiredFields = { user_id, event_id };
    
    for (const [key, value] of Object.entries(requiredFields)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }  

    const newAttendee = {
      user_id, 
      event_id
    }

    AttendeesService.insertAttendee(req.app.get('db'), newAttendee)
    .then(attendee => {
      EventsService.getEventById(req.app.get('db'), event_id)
      .then(( event ) => {
        res.event = event;
        res.attendee = attendee;
        res.status(201).json({attendee, event});
      })
    })
    .catch(next);
  })

attendeesRouter
  .route('/:attendee_id')
  .all(requireAuth)
  .all((req, res, next) => {
    AttendeesService.getAttendeeById(
      req.app.get('db'),
      parseInt(req.params.attendee_id)
    )
    .then(attendee => {
      if (!attendee) {
        return res.status(404).json({
          error: { message: `Attendee doesn't exist` }
        })
      }
      res.attendee = attendee; // save the attendee for the next middleware
      next();
    })
    .catch(next)
})
  .get((req, res, next) => {
    res.json(res.attendee);
  })
  .delete((req, res, next) => {
    if(!req.params.attendee_id){
      logger.error(`Attendee id is required.`);
      return res.status(400).send('Invalid data')
    }
    AttendeesService.deleteAttendee(res.app.get('db'), req.params.attendee_id)
      .then( (count) => {
        if(count === 0){
          return res.status(404).json({
            error: { message: `Attendee does not exist`}
          })
        }
        res
        .status(204)
        .end();
      })
      .catch(next)
      logger.info(`Attendee with attendee_id ${req.params.attendee_id} deleted.`);  
  })

module.exports = attendeesRouter