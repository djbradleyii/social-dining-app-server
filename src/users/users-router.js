const express = require('express');
const UsersService = require('./users-service');
const usersRouter = express.Router();
const bodyParser = express.json();
const logger = require('../logger');
const xss = require('xss');

const serializeUser = user => ({
  id: user.id,
  fname: xss(user.fname),
  lname: xss(user.lname),
  dob: new Date(user.dob),
  email: xss(user.email),
  password: xss(user.password),
  marital_status: xss(user.marital_status),
  occupation: xss(user.occupation),
  gender: xss(user.gender),
  bio: xss(user.bio),
  date_created: new Date(user.date_created)
})

usersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    UsersService.getAllUsers(knexInstance)
    .then(users => { 
      res.json(users.map(serializeUser))
    })
    .catch(next)
  })
  .post(bodyParser, (req, res, next) => {
    const { fname, lname, dob, email, password, marital_status, occupation, bio, gender } = req.body;
    const requiredFields = { fname, lname, dob, email, password, marital_status, bio, gender };
    
    for (const [key, value] of Object.entries(requiredFields)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    } 

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
  
     const newUser = {
      fname,
      lname,
      dob: new Date(dob),
      email,
      password,
      marital_status,
      occupation,
      bio,
      gender
    }
  
  
    UsersService.insertUser(req.app.get('db'), newUser)
    .then(userId => {
      res
      .status(204).end();
    })
    .catch(next);
  })

usersRouter
  .route('/:user_id')
  .all((req, res, next) => {
    UsersService.getUserById(
      req.app.get('db'),
      parseInt(req.params.user_id)
    )
      .then(user => {
        if (!user) {
          return res.status(404).json({
            error: { message: `User doesn't exist` }
          })
        }
        res.user = user; // save the user for the next middleware
        next();
      })
      .catch(next)
})
  .get((req, res, next) => {
    res.json(serializeUser(res.user));
  })
  .patch(bodyParser, (req, res, next) => {
    const { user_id } = req.params;
    const {fname, lname, dob, email, password, marital_status, occupation, bio, gender} = req.body;
    const requiredFields = { lname, email, password, marital_status, bio, gender };
  
/*     for (const [key, value] of Object.entries(requiredFields)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }  */
  if(password){
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
  }
     
    
    const numberOfValues = Object.values(requiredFields).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'lname', 'dob', 'email', 'password', 'marital_status', 'bio', 'gender'`
        }
      })

    const updates = {fname, lname, dob, email, password, marital_status, occupation, bio, gender};
    UsersService.updateUserById(req.app.get('db'), user_id, updates)
    .then((numUsersAffected) => {
      res.status(204).end();
    })
    .catch(next);
  })
  .delete((req, res, next) => {
    UsersService.deleteUser(res.app.get('db'), req.params.user_id)
      .then( (count) => {
        if(count === 0){
          return res.status(404).json({
            error: { message: `User does not exist`}
          })
        }
        res
        .status(204)
        .end();
      })
      .catch(next)
      logger.info(`User with user_id ${req.params.user_id} deleted.`); 
  })

module.exports = usersRouter;