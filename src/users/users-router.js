const express = require('express');
const UsersService = require('./users-service');
const usersRouter = express.Router();
const bodyParser = express.json();
const logger = require('../logger');

usersRouter
  .route('/api/users')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    UsersService.getAllUsers(knexInstance)
    .then(users => { 
      res.json(users.map(user => ({
        id: user.id,
        fname: user.fname,
        lname: user.lname,
        dob: new Date(user.dob),
        email: user.email,
        password: user.password,
        marital_status: user.marital_status,
        occupation: user.occupation,
        gender: user.gender,
        bio: user.bio,
        date_created: new Date(user.date_created)
        })))
    })
    .catch(next)
  })
  .post(bodyParser, (req, res, next) => {
    const { fname, lname, dob, email, password, marital_status, occupation, bio, gender } = req.body;
    const requiredFields = { fname, lname, dob, email, password, marital_status, gender };
    
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
  .route('/api/users/:user_id')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    const { user_id } = req.params;

    UsersService.getUserById(knexInstance, user_id)
    .then(user => { 
        if(!user){
        return res.status(404).json({
            error: { message: `User doesn't exist` }
        })
        }
        res.json(user)
    })
    .catch(next)
  })
  .patch(bodyParser, (req, res, next) => {
    const { user_id } = req.params;
    const {fname, lname, dob, email, password, marital_status, occupation, bio, gender} = req.body;
    const requiredFields = { fname, lname, dob, email, password, marital_status, gender };
  
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
    
    const updates = {fname, lname, dob, email, password, marital_status, occupation, bio, gender};
    UserService.updateUserById(req.app.get('db'), user_id, updates)
    .then(() => {
      res.status(204).end();
    })
    .catch(next);
  })
  .delete((req, res, next) => {
    const { user_id } = parseInt(req.params);

    if(!user_id){
      logger.error(`User id is required.`);
      return res.status(400).send('Invalid data')
    }
  
    UsersService.deleteUser(res.app.get('db'), user_id)
      .then( (count) => {
        if(count === 0){
          return res.status(404).json({
            error: { message: `Bookmark does not exist`}
          })
        }
        res
        .status(204)
        .end();
      })
      .catch(next)
      logger.info(`User with user_id ${user_id} deleted.`); 
  })

module.exports = usersRouter;