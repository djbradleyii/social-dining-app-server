const knex = require('knex')
const app = require('../src/app')
const { makeUsersArray } = require('./users.fixtures')

describe.only('Users Endpoints', function() {
  let db

  before('make knex instance', () => {

    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)

  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'))

  afterEach('cleanup',() => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'))

  describe(`GET /api/users`, () => {
    context(`Given no users`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/users')
          .expect(200, [])
      })
    })

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray();

      beforeEach('insert users', () => {
        return db
          .into('users')
          .insert(testUsers)
      })

      it('responds with 200 and all of the users', () => {
        return supertest(app)
          .get('/api/users')
          .expect(200, testUsers)
      })
    })

/*     context(`Given an XSS attack user`, () => {
      const testUsers = makeUsersArray();
      const { maliciousUser, expectedUser } = makeMaliciousUser()

      beforeEach('insert malicious user', () => {
        return db
          .into('users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('users')
              .insert([ maliciousUser ])
          })
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/users`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedUser.title)
            expect(res.body[0].content).to.eql(expectedUser.content)
          })
      })
    }) */
  })

  describe(`GET /api/users/:user_id`, () => {
    context(`Given no users`, () => {
      it(`responds with 404`, () => {
        const userId = 123456
        return supertest(app)
          .get(`/api/users/${userId}`)
          .expect(404, { error: { message: `User doesn't exist` } })
      })
    })

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray();

      beforeEach('insert users', () => {
        return db
          .into('users')
          .insert(testUsers)
      })

      it('responds with 200 and the specified user', () => {
        const userId = 2
        const expectedUser = testUsers[userId - 1]
        return supertest(app)
          .get(`/api/users/${userId}`)
          .expect(200, {
            ...expectedUser,
            dob: '10/10/1980',
            date_created: '10/10/1980'
          })
      })
    })

/*     context(`Given an XSS attack user`, () => {
      const testUsers = makeUsersArray();
      const { maliciousUser, expectedUser } = makeMaliciousUser()

      beforeEach('insert malicious user', () => {
        return db
          .into('users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('users')
              .insert([ maliciousUser ])
          })
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/users/${maliciousUser.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedUser.title)
            expect(res.body.content).to.eql(expectedUser.content)
          })
      })
    }) */
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
        .send(newUser)
        .expect(204)
        /* .expect(res => {
          expect(res.body.title).to.eql(newUser.title)
          expect(res.body.style).to.eql(newUser.style)
          expect(res.body.content).to.eql(newUser.content)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
          const expected = new Intl.DateTimeFormat('en-US').format(new Date())
          const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body.date_published))
          expect(actual).to.eql(expected)
        })
        .then(res =>
          supertest(app)
            .get(`/api/users/${res.body.id}`)
            .expect(res.body)
        ) */
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
          .send(newUser)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })

/*     it('removes XSS attack content from response', () => {
      const { maliciousUser, expectedUser } = makeMaliciousUser()
      return supertest(app)
        .post(`/api/users`)
        .send(maliciousUser)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(expectedUser.title)
          expect(res.body.content).to.eql(expectedUser.content)
        })
    }) */
  })

  describe(`DELETE /api/users/:user_id`, () => {
    context(`Given no users`, () => {
      it(`responds with 404`, () => {
        const userId = 123456
        return supertest(app)
          .delete(`/api/users/${userId}`)
          .expect(404, { error: { message: `User doesn't exist` } })
      })
    })

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray();

      beforeEach('insert users', () => {
        return db
          .into('users')
          .insert(testUsers)
      })

      it('responds with 204 and removes the user', () => {
        const idToRemove = 2
        const expectedUsers = testUsers.filter(user => user.id !== idToRemove)
        return supertest(app)
          .delete(`/api/users/${idToRemove}`)
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
          .expect(404, { error: { message: `User doesn't exist` } })
      })
    })

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray();

      beforeEach('insert users', () => {
        return db
          .into('users')
          .insert(testUsers)
      })

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
          .send(updateUser)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/users/${idToUpdate}`)
              .expect(expectedUser)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/users/${idToUpdate}`)
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