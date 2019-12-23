const express = require('express');
const UsersService = require('./users-service');
const usersRouter = express.Router();
const bodyParser = express.json();
const logger = require('../logger');
const xss = require('xss');
const { requireAuth } = require('../middleware/jwt-auth');
const bcrypt = require('bcryptjs');

const serializeUser = user => ({
  id: user.id,
  fname: xss(user.fname),
  lname: xss(user.lname),
  dob: user.dob,
  email: xss(user.email),
  marital_status: xss(user.marital_status),
  occupation: xss(user.occupation),
  gender: xss(user.gender),
  bio: xss(user.bio),
  date_created: new Date(user.date_created)
})

usersRouter
  .route('/')
  .get(requireAuth, (req, res, next) => {
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

    const passwordError = UsersService.validatePassword(password);
  
    if(passwordError){
      return res.status(400).json({ error: passwordError})
    }

      UsersService.hasUserWithEmail(
        req.app.get('db'),
        email
      )
      .then(hasUserWithEmail => {
        if (hasUserWithEmail){
          return res.status(400).json({ error: `Email already taken` })
        }
        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              fname,
              lname,
              dob: dob,
              email,
              password: hashedPassword,
              marital_status,
              occupation,
              bio,
              gender
            }

            return UsersService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                 res
                  .status(201)
                  .json({user})
              })
          })
      })
      .catch(next)
})

usersRouter
  .route('/:user_id')
  .all(requireAuth)
  .all((req, res, next) => {
    UsersService.getUserById(
      req.app.get('db'),
      parseInt(req.user.id)
    )
      .then(user => {
        if (!user) {
          return res.status(404).json({
            error: { message: `User doesn't exist` }
          })
        }
        //res.user = user; // save the user for the next middleware
        next();
      })
      .catch(next)
})
  .get((req, res, next) => {
    res.json(serializeUser(req.user));
  })
  .patch(bodyParser, (req, res, next) => {
    const user_id = req.user.id; //updated from params to user
    const {fname, lname, dob, marital_status, occupation, bio, gender} = req.body;
    const requiredFields = { lname, marital_status, bio, gender };
    



    const numberOfValues = Object.values(requiredFields).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'lname', 'dob', 'password', 'marital_status', 'bio', 'gender'`
        }
      })

    const updates = {fname, lname, dob, email: req.user.email, marital_status, occupation, bio, gender};
    UsersService.updateUserById(req.app.get('db'), user_id, updates)
    .then((numUsersAffected) => {
      res.status(204).end();
    })
    .catch(next);
  })
  .delete((req, res, next) => {
    //updated req.params.user_id to req.user.id
    UsersService.deleteUser(res.app.get('db'), req.user.id)
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
      logger.info(`User with id ${req.user.id} deleted.`); 
  })

  usersRouter
  .route('/:user_id/events')
  .all(requireAuth)
  .all((req, res, next) => {
    UsersService.getUserById(
      req.app.get('db'),
      parseInt(req.user.id)
    )
      .then(user => {
        if (!user) {
          return res.status(404).json({
            error: { message: `User doesn't exist` }
          })
        }
        //res.user = user; // save the user for the next middleware
        next();
      })
      .catch(next)
})
  .get((req, res, next) => {
    UsersService.getAllEventsByUserId(      
      req.app.get('db'),
      parseInt(req.user.id)
    ).then(events => {
      const user = serializeUser(req.user)
      res.json({user, events});
    })
    .catch(next)
  })

module.exports = usersRouter;