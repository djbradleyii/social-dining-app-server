require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV, CLIENT_ORIGIN} = require('./config');
const users = require('./users.js');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

/* 

REQUEST VALIDATION

app.use(function validateBearerToken(req, res, next){
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if(!authToken || authToken.split(' ')[1] !== apiToken){
      return res.status(401).json({ error: 'Unauthorized request' })
  }
    // move to the next middleware
  next();
}); */

app.get('/api/users', (req, res) => {
  res.json(users);
})

app.post('/api/users', (req, res) => {

  const { fname, lname, email, password, dob, status, occupation, gender } = req.body;
  
  
  // password length
  if (password.length < 8 || password.length > 36) {
    return res
      .status(400)
      .send('Password must be between 8 and 36 characters');
  }

  // password contains digit, using a regex here
  if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
    return res
      .status(400)
      .send('Password must be contain at least one digit');
  }

  res.status(204).end();
})

app.delete('/api/users/:userId', (req, res) => {
  const { userId } = req.params; //parseInt() for integers
})

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