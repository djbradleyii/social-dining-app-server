require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const knex = require('knex');
const { NODE_ENV, CLIENT_ORIGIN } = require('./config');

const app = express();

const knexInstance = knex({
  client: 'pg',
  connection: process.env.DB_URL,
})

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

// set up winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'info.log' })
  ]
});

if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}


app.use(morgan(morganOption));
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.get('/api/*', (req, res) => {
    res.json({ok: true});
});

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