const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeUsersArray } = require('./users.fixtures');

describe('Users Endpoints', function() {
    let db
  
    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
      })
      app.set('db', db);
    })
  
    after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('users').truncate())

  afterEach('cleanup', () => db('users').truncate())

  describe(`GET /api/users`, () => {
    context(`Given no users`, () => {
         it(`responds with 200 and an empty list`, () => {
           return supertest(app)
             .get('/api/users')
             .expect(200, [])
         })
       })

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray()

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
  })

  describe(`GET /api/users/:user_id`, () => {
    context(`Given no users`, () => {
        it(`responds with 404`, () => {
            const userId = 123456;
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
        const expectedUsers = testUsers[userId - 1]
        return supertest(app)
          .get(`/api/users/${userId}`)
          .expect(200, expectedUsers)
      })
    })
  })
    describe(`POST /api/users`, () => {
    it(`creates a user, responding with 201 and the new user`,  function() {
        const newUser = {
            fname: "New",
            lname: "User",
            dob: new Date("10/31/1983"),
            email: "newuser@gmail.com",
            password: "password10",
            marital_status: "Single",
            occupation: "Developer",
            bio: "New User",
            gender: "Male"
        }
        return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(204)
    })
})
})