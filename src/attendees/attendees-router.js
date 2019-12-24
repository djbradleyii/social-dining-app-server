const express = require('express');
const AttendeesService = require('./attendees-service');
const EventsService = require('../events/events-service');
const UsersService = require('../users/users-service');
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
    const { event_id } = req.body;
    const requiredFields = { event_id };
    
    for (const [key, value] of Object.entries(requiredFields)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }  

    const newAttendee = {
      user_id: req.user.id, 
      event_id
    }

    AttendeesService.insertAttendee(req.app.get('db'), newAttendee)
    .then(attendee => {
      EventsService.getEventById(req.app.get('db'), event_id)
      .then(( event ) => {
        res.status(201).json({attendee, event});
      })
    })
    .catch(next);
  })
  .delete((req, res, next) => {
    let isRSVP;
      EventsService.getAllAttendeesByEventId(res.app.get('db'), req.body.event_id)
      .then((attendees) => {
        if(attendees.length === 0){
          return res.status(401).json({ error: 'Unauthorized request' })
        }
      isRSVP = attendees.find((attendee) => {
        return attendee.user_id === req.user.id;
      })
       if(isRSVP){
        AttendeesService.deleteAttendee(res.app.get('db'), req.user.id, req.body.event_id)
        .then((count) => {
           if(count === 0){
            return res.status(401).json({ error: 'Unauthorized request' })
          } 
          res
          .status(204)
          .end();
        })
        .catch(next)
        logger.info(`Attendee with user_id ${req.user.id} has been removed from the event.`);
      } else {
        return res.status(401).json({ error: 'Unauthorized request' })
      }
    })
  })

/* attendeesRouter
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
      req.attendee = attendee; // save the attendee for the next middleware
      next();
    })
    .catch(next)
})
  .get((req, res, next) => {
    AttendeesService.getAttendeeInfoById(req.app.get('db'), req.attendee.user_id)
    .then(attendee => {
      res.json({attendee})
    })
  })
   .delete((req, res, next) => {
    if(!req.params.attendee_id){
      logger.error(`Attendee id is required.`);
      return res.status(400).send('Invalid data')
    }

    let isAttendee = req.body.user_id = req.user.id;
    if(isAttendee){
      AttendeesService.deleteAttendee(res.app.get('db'), req.user.id, req.body.event_id)
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
    }  
  })  */

module.exports = attendeesRouter