const knex = require('knex')
const app = require('../src/app')
const { makeUsersArray } = require('./users.fixtures');
//const bcrypt = require('bcryptjs');
const AuthService = require('../src/auth/auth-service');
//const helpers = require('./test-helpers');

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

  after('disconnect from db', () => db.destroy());
  before('clean the table', () => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'));
  afterEach('cleanup',() => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'));
  
  describe(`GET /api/users`, () => {
    context(`Given no users`, () => {
      it(`responds with 401 and Missing bearer token`, () => {
        return supertest(app)
          .get('/api/users')
          //.set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(401, { error: `Missing bearer token` })
      })
    })

    context('Given there are users in the database', () => {
      beforeEach('insert users', () => {
        return db
          .into('users')
          .insert(testUsers)
      })

      it('responds with 200 and all of the users', () => {
        return supertest(app)
          .get('/api/users')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            expect(res.body[0].fname).to.eql(testUsers[0].fname)
            expect(res.body[0].lname).to.eql(testUsers[0].lname)
            expect(res.body[0].email).to.eql(testUsers[0].email)
            expect(res.body[0].password).to.eql(testUsers[0].password)
            expect(res.body[0].marital_status).to.eql(testUsers[0].marital_status)
            expect(res.body[0].occupation).to.eql(testUsers[0].occupation)
            expect(res.body[0].gender).to.eql(testUsers[0].gender)
            expect(res.body[0].bio).to.eql(testUsers[0].bio)
          })
      })
    })

    context(`Given an XSS attack user`, () => {
      const testUser = makeUsersArray()[1];
      const maliciousUser = {
        fname : `<img src="https://url.not.exist" onerror="alert(document.cookie);">. Not <strong>all</strong> bad.`,
        lname : `<img src="https://url.not.exist" onerror="alert(document.cookie);">. Not <strong>all</strong> bad.`,
        dob : '10/10/1980',
        email : `someemail@gmail.com`,
        password : 'Password1!',
        marital_status : "Married",
        occupation : 'malicious occupation <script>alert("xss");</script>',
        gender : "Male",
        bio : `<img src="https://url.not.exist" onerror="alert(document.cookie);">. Not <strong>all</strong> bad.`, 
        date_created: '10/10/1980'
    }
    const expectedUser = {
      fname : `<img src="https://url.not.exist">. But not <strong>all</strong> bad.`,
      lname : `<img src="https://url.not.exist">. But not <strong>all</strong> bad.`,
      dob : '10/10/1980',
      email : `someemail@gmail.com`,
      password : 'Password1!',
      marital_status : "Married",
      occupation : 'malicious occupation &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      gender : "Male",
      bio : `<img src="https://url.not.exist">. But not <strong>all</strong> bad.`, 
      date_created: '10/10/1980'
  }

      beforeEach('insert malicious user', () => {
        return db
        .into('users')
        .insert(maliciousUser)
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/users`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            expect(res.body[0].fname).to.eql(expectedUser.fname)
            expect(res.body[0].lname).to.eql(expectedUser.lname)
            expect(res.body[0].email).to.eql(expectedUser.email)
            expect(res.body[0].password).to.eql(expectedUser.password)
            expect(res.body[0].marital_status).to.eql(expectedUser.marital_status)
            expect(res.body[0].occupation).to.eql(expectedUser.occupation)
            expect(res.body[0].gender).to.eql(expectedUser.gender)
            expect(res.body[0].bio).to.eql(expectedUser.bio)
          })
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
      beforeEach('insert users', () => {
        return db
        .into('users')
        .insert(testUsers)
      })

      it('responds with 200 and the specified user', () => {
        const userId = 2;
        const expectedUser = testUsers[userId - 1];
        return supertest(app)
          .get(`/api/users/${userId}`)
          .set('Authorization', makeAuthHeader(expectedUser))
          .expect(200)
          .expect(res => {
            expect(res.body.fname).to.eql(expectedUser.fname)
            expect(res.body.lname).to.eql(expectedUser.lname)
            expect(res.body.email).to.eql(expectedUser.email)
            expect(res.body.password).to.eql(expectedUser.password)
            expect(res.body.marital_status).to.eql(expectedUser.marital_status)
            expect(res.body.occupation).to.eql(expectedUser.occupation)
            expect(res.body.gender).to.eql(expectedUser.gender)
            expect(res.body.bio).to.eql(expectedUser.bio)
          })
      })
    })

    context(`Given an XSS attack user`, () => {
      const testUser = makeUsersArray();
      const maliciousUser = {
        fname : `<img src="https://url.not.exist" onerror="alert(document.cookie);">. Not <strong>all</strong> bad.`,
        lname : `<img src="https://url.not.exist" onerror="alert(document.cookie);">. Not <strong>all</strong> bad.`,
        dob : '10/10/1980',
        email : `someemail@gmail.com`,
        password : 'Password1!',
        marital_status : "Married",
        occupation : 'malicious occupation <script>alert("xss");</script>',
        gender : "Male",
        bio : `<img src="https://url.not.exist" onerror="alert(document.cookie);">. Not <strong>all</strong> bad.`, 
        date_created: '10/10/1980'
    }
      const expectedUser = {
        fname : `<img src="https://url.not.exist">. Not <strong>all</strong> bad.`,
        lname : `<img src="https://url.not.exist">. But not <strong>all</strong> bad.`,
        dob : '10/10/1980',
        email : `someemail@gmail.com`,
        password : 'Password1!',
        marital_status : "Married",
        occupation : 'malicious occupation &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        gender : "Male",
        bio : `<img src="https://url.not.exist">. But not <strong>all</strong> bad.`, 
        date_created: '10/10/1980'
    }

      beforeEach('insert users', () => {
        return db
        .into('users')
        .insert(maliciousUser)
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/users/1`)
          .set('Authorization', makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].fname).to.eql(expectedUser.fname)
            expect(res.body[0].lname).to.eql(expectedUser.lname)
            expect(res.body[0].email).to.eql(expectedUser.email)
            expect(res.body[0].password).to.eql(expectedUser.password)
            expect(res.body[0].marital_status).to.eql(expectedUser.marital_status)
            expect(res.body[0].occupation).to.eql(expectedUser.occupation)
            expect(res.body[0].gender).to.eql(expectedUser.gender)
            expect(res.body[0].bio).to.eql(expectedUser.bio)
          })
      })
    })
  })


  /* Tests for Other users HTTP METHODS below */

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
        password : "Iamnewuser1!",
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
        .expect(201)
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
          password : "Iupdatedme1!",
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


      describe(`Protected endpoints`, () => {
        beforeEach('insert users', () => {
          return db
            .into('users')
            .insert(testUsers)
        })

      const protectedEndpoints = [
          {
            name: 'GET /api/users/',
            path: '/api/users/'
          },
          {
            name: 'GET /api/users/:user_id',
            path: '/api/users/1'
          },
        ]
      protectedEndpoints.forEach(endpoint => {
      describe(endpoint.name, () => {
        it(`responds 401 'Missing jwt token' when no basic token`, () => {
          return supertest(app)
            .get(endpoint.path)
            .expect(401, { error: `Missing bearer token` })
        })

        it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
          const userNoCreds = { email: ' ', password: ' ' };
          return supertest(app)
          .get(endpoint.path)
          .set('Authorization', makeAuthHeader(userNoCreds))
          .expect(401, { error: `Unauthorized request` })
        })

        it(`responds 401 'Unauthorized request' when invalid email`, () => {
            const userInvalidCreds = { email: 'someemail@gmail.com', password: 'existy' }
            return supertest(app)
              .get(endpoint.path)
              .set('Authorization', makeAuthHeader(userInvalidCreds))
              .expect(401, { error: `Unauthorized request` })
          })

        it(`responds 401 'Unauthorized request' when invalid password`, () => {
          const userInvalidPass = { email: testUsers[0].email, password: 'wrong' }
          return supertest(app)
            .get(endpoint.path)
            .set('Authorization', makeAuthHeader(userInvalidPass))
            .expect(401, { error: `Unauthorized request` })
        })
      })
    })
  })
})