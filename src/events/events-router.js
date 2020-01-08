const express = require('express');
const xss = require('xss');
const EventsService = require('./events-service');
const AttendeesService = require('../attendees/attendees-service');
const eventsRouter = express.Router();
const bodyParser = express.json();
const logger = require('../logger');
const { requireAuth } = require('../middleware/jwt-auth');

const serializeEvent = (event) => ({
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
  organizer_name: event.fname,
  date_created: new Date(event.date_created),
});


eventsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    let { keyword } = req.query;

    keyword = xss(keyword);

    if (keyword) {
      EventsService.getEventByKeyword(knexInstance, keyword)
        .then((events) => {
          res.json(events.map(serializeEvent));
        })
        .catch(next);
    } else {
      EventsService.getAllEvents(knexInstance)
        .then((events) => {
          res.json(events.map(serializeEvent));
        })
        .catch(next);
    }
  })
  .post(bodyParser, (req, res, next) => {
    const {
      title, event_purpose, restaurant, address, date, time, description, singles_only,
    } = req.body;
    const requiredFields = {
      title, event_purpose, restaurant, address, date, time, description, singles_only,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    const newEvent = {
      organizer: req.user.id,
      title,
      event_purpose,
      restaurant,
      address,
      date,
      time,
      description,
      singles_only,
    };


    EventsService.insertEvent(req.app.get('db'), newEvent)
      .then((event) => {
        const organizerAsAttendee = {
          user_id: event.organizer,
          event_id: event.id,
        };
        AttendeesService.insertAttendee(req.app.get('db'), organizerAsAttendee)
          .then((attendee) => {
            res.status(201).json({ event, attendee });
          });
      })
      .catch(next);
  });

eventsRouter
  .route('/:event_id')
  .all(requireAuth)
  .all((req, res, next) => {
    EventsService.getEventById(
      req.app.get('db'),
      parseInt(req.params.event_id),
    )
      .then((event) => {
        if (!event) {
          return res.status(404).json({
            error: { message: 'Event doesn\'t exist' },
          });
        }
        req.event = event; // save the event for the next middleware
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    EventsService.getAllAttendeesByEventId(
      req.app.get('db'),
      parseInt(req.params.event_id),
    )
      .then((attendees) => {
        if (attendees.length === 0) {
          return res.status(404).json({
            error: { message: 'Event doesn\'t exist' },
          });
        }
        req.attendees = attendees; // save the event for the next middleware
        let event = serializeEvent(req.event);
        res.json({ event, attendees });
        next();
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const { id } = req.event;
    const { title, description } = req.body;
    const eventToUpdate = { title, description };

    const numberOfValues = Object.values(eventToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: 'Request body must contain either \'title\' or \'description\'',
        },
      });
    }

    const isUsersEvent = req.user.id === req.event.organizer;
    if (isUsersEvent) {
      EventsService.updateEventById(req.app.get('db'), id, eventToUpdate)
        .then((rowsAffected) => {
          res.status(204).end();
        })
        .catch(next);
    } else {
      return res.status(401).json({ error: 'Unauthorized request' });
    }
  })
  .delete((req, res, next) => {
    const { id } = req.event;
    if (!req.params.event_id) {
      logger.error('Event id is required.');
      return res.status(400).send('Invalid data');
    }

    const isUsersEvent = req.user.id === req.event.organizer;
    if (isUsersEvent) {
      EventsService.deleteEvent(res.app.get('db'), id)
        .then((count) => {
          if (count === 0) {
            return res.status(404).json({
              error: { message: 'Event does not exist' },
            });
          }
          res
            .status(204)
            .end();
        })
        .catch(next);
    } else {
      return res.status(401).json({ error: 'Unauthorized request' });
    }
    logger.info(`Event with event_id ${id} deleted.`);
  });

module.exports = eventsRouter;
