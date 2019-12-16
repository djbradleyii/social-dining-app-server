require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV, CLIENT_ORIGIN } = require('./config');
const usersRouter = require('./users/users-router');
const eventsRouter = require('./events/events-router');
const attendeesRouter = require('./attendees/attendees-router');
const authRouter = require('./auth/auth-router')

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';


app.use(morgan(morganOption));
app.use(express.json());
app.use(helmet());
/* app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
); */

app.use(cors());

/* REQUEST VALIDATION

app.use(function validateBearerToken(req, res, next){
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if(!authToken || authToken.split(' ')[1] !== apiToken){
      return res.status(401).json({ error: 'Unauthorized request' })
  }
    // move to the next middleware
  next();
}); */

app.use('/api/users', usersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/attendees', attendeesRouter);
app.use('/api/auth', authRouter);

app.use(function errorHandler(error, req, res, next) {
       let response;
       if (NODE_ENV === 'production') {
         response = { error: { message: 'server error' } };
       } else {
         console.error(error);
         response = { message: error.message, error };
       }
       res.status(500).json(response);
     })

module.exports = app;