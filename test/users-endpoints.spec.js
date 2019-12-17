const knex = require('knex')
const app = require('../src/app')
const { makeUsersArray } = require('./users.fixtures');
const bcrypt = require('bcryptjs');
const AuthService = require('../src/auth/auth-service');
const helpers = require('./test-helpers');

describe.only('Users Endpoints', function() {
  let db
  let testUsers = makeUsersArray();

  before('make knex instance', () => {

    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)

  })

  function makeAuthHeader(user) { 
   const token = AuthService.createJwt(user.email, {user_id: user.id});
   return `Bearer ${token}`
  }

  before('clean the table', () => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'))

  beforeEach('insert users', () => {
    return db
      .into('users')
      .insert(testUsers)
  })

  afterEach('cleanup',() => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'))

  after('disconnect from db', () => db.destroy())
    
  
    describe(`Protected endpoints`, () => {
      beforeEach('insert articles', () => {
        beforeEach('insert users', () => {
          return db
            .into('users')
            .insert(testUsers)
        })
      })
      describe(`GET /api/users/:user_id`, () => {
        it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
          const userNoCreds = { user_name: '', password: '' };
          return supertest(app)
           .get(`/api/users/123`)
           .set('Authorization', makeAuthHeader(userNoCreds))
           .expect(401, { error: `Unauthorized request` })
        })

        it(`responds 401 'Unauthorized request' when invalid user`, () => {
             const userInvalidCreds = { user_name: 'user-not', password: 'existy' }
             return supertest(app)
               .get(`/api/users/1`)
               .set('Authorization', makeAuthHeader(userInvalidCreds))
               .expect(401, { error: `Unauthorized request` })
           })
           
        it(`responds 401 'Unauthorized request' when invalid password`, () => {
          const userInvalidPass = { user_name: testUsers[0].user_name, password: 'wrong' }
          return supertest(app)
            .get(`/api/articles/1`)
            .set('Authorization', makeAuthHeader(userInvalidPass))
            .expect(401, { error: `Unauthorized request` })
        })
      })
    })

  describe(`GET /api/users`, () => {
    context(`Given no users`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/users')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200, [])
      })
    })

    context('Given there are users in the database', () => {
      it('responds with 200 and all of the users', () => {
        return supertest(app)
          .get('/api/users')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200, testUsers)
      })
    })
  })

  describe(`GET /api/users/:user_id`, () => {
    context(`Given no users`, () => {
      it(`responds with 404`, () => {
        const userId = 123456
        return supertest(app)
          .get(`/api/users/${userId}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(404, { error: { message: `User doesn't exist` } })
      })
    })

    context('Given there are users in the database', () => {
      it('responds with 200 and the specified user', () => {
        const userId = 2
        const expectedUser = testUsers[userId - 1]
        return supertest(app)
          .get(`/api/users/${userId}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200, {
            ...expectedUser,
            dob: '10/10/1980',
            date_created: '10/10/1980'
          })
      })
    })
  })

  describe(`POST /api/users`, () => {
    const testUsers = makeUsersArray();
    beforeEach('insert users', () => {
      return db
        .into('users')
        .insert(testUsers)
    })

    it(`creates a user, responding with 201 and the new user`, () => {
      const newUser = {
        fname : "New",
        lname : "User",
        email : "nuser@gmail.com",
        password : "iamnewuser1",
        dob : '10/10/1980',
        gender : "Male",
        occupation : "Marketing",
        marital_status : "Married",
        bio : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.", 
      }
      return supertest(app)
        .post('/api/users')
        .set('Authorization', makeAuthHeader(testUsers[0]))
        .send(newUser)
        .expect(204)
    })

    const requiredFields = ['fname', 'lname', 'dob', 'email', 'password', 'marital_status', 'bio', 'gender']

    requiredFields.forEach(field => {
      const newUser = {
        fname : "New",
        lname : "User",
        email : "nuser@gmail.com",
        password : "iamnewuser1",
        dob : "03/02/1979",
        gender : "Male",
        occupation : "Marketing",
        marital_status : "Married",
        bio : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.", 
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newUser[field]

        return supertest(app)
          .post('/api/users')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .send(newUser)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
  })

  describe(`DELETE /api/users/:user_id`, () => {
    context(`Given no users`, () => {
      it(`responds with 404`, () => {
        const userId = 123456
        return supertest(app)
          .delete(`/api/users/${userId}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(404, { error: { message: `User doesn't exist` } })
      })
    })

    context('Given there are users in the database', () => {
      it('responds with 204 and removes the user', () => {
        const idToRemove = 2
        const expectedUsers = testUsers.filter(user => user.id !== idToRemove)
        return supertest(app)
          .delete(`/api/users/${idToRemove}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/users`)
              .expect(expectedUsers)
          )
      })
    })
  })

  describe(`PATCH /api/users/:user_id`, () => {
    context(`Given no users`, () => {
      it(`responds with 404`, () => {
        const userId = 123456
        return supertest(app)
          .delete(`/api/users/${userId}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(404, { error: { message: `User doesn't exist` } })
      })
    })

    context('Given there are users in the database', () => {
      it('responds with 204 and updates the user', () => {
        const idToUpdate = 2
        const updateUser = {
          fname : "Update",
          lname : "User",
          email : "uuser@gmail.com",
          password : "iupdatedme1",
          dob : "03/02/1978",
          gender : "Male",
          occupation : "Marketing",
          marital_status : "Married",
          bio : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.", 
        }
        const expectedUser = {
          ...testUsers[idToUpdate - 1],
          ...updateUser
        }
        return supertest(app)
          .patch(`/api/users/${idToUpdate}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .send(updateUser)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/users/${idToUpdate}`)
              .then()
              .expect(expectedUser)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/users/${idToUpdate}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: { message: `Request body must contain either 'lname', 'dob', 'email', 'password', 'marital_status', 'bio', 'gender'`}
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updateUser = {
          bio: 'updated bio',
        }
        const expectedUser = {
          ...testUsers[idToUpdate - 1],
          ...updateUser
        }

        return supertest(app)
          .patch(`/api/users/${idToUpdate}`)
          .set('Authorization', makeAuthHeader(testUsers[idToUpdate - 1]))
          .send({
            ...updateUser,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/users/${idToUpdate}`)
              .expect(expectedUser)
          )
      })
    })
  })
})