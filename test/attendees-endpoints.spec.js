const knex = require('knex');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { makeAttendeesArray, makeEventsArrayForAttendeesTest, makeUsersArrayForAttendeesTest } = require('./attendees.fixtures');
const AuthService = require('../src/auth/auth-service');

describe('Attendees Endpoints', () => {
  let db;
  const testUsers = makeUsersArrayForAttendeesTest();
  const testEvents = makeEventsArrayForAttendeesTest();
  const testAttendees = makeAttendeesArray();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ email: user.email }, secret, {
      subject: user.email,
      algorithm: 'HS256',
    });
    return `Bearer ${token}`;
  }

  after('disconnect from db', () => db.destroy());
  before('clean the table', () => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'));
  afterEach('cleanup', () => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'));

  describe('GET /api/attendees', () => {
    context('Given no attendees', () => {
      it('responds with 401 and Missing bearer token', () => supertest(app)
        .get('/api/attendees')
        .expect(401, { error: 'Missing bearer token' }));
    });

    context('Given there are attendees in the database', () => {
      beforeEach(() => db
        .into('users')
        .insert(testUsers)
        .then(() => db
          .into('events')
          .insert(testEvents))
        .then(() => db
          .into('attendees')
          .insert(testAttendees)));

      it('responds with 200 and all of the attendees', () => supertest(app)
        .get('/api/attendees')
        .set('Authorization', makeAuthHeader(testUsers[0]))
        .expect(200)
        .expect((res) => {
          expect(res.body).to.have.a.lengthOf(13);
          expect(res.body[0].user_id).to.eql(testAttendees[0].user_id);
          expect(res.body[0].event_id).to.eql(testAttendees[0].event_id);
        }));
    });
  });

  describe('POST /api/attendees', () => {
    const testUsers = makeUsersArrayForAttendeesTest();
    const testEvents = makeEventsArrayForAttendeesTest();
    const testAttendees = makeAttendeesArray();

    beforeEach(() => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'));

    beforeEach(() => db
      .into('users')
      .insert(testUsers)
      .then(() => db
        .into('events')
        .insert(testEvents))
      .then(() => db
        .into('attendees')
        .insert(testAttendees)));

    context('Attendee Validation', () => {
      const requiredFields = ['event_id'];

      requiredFields.forEach((field) => {
        const newAttendee = {
          user_id: 1,
          event_i: 3,
        };

        it(`responds with 400 and an error message when the '${field}' is missing`, () => {
          delete newAttendee[field];

          return supertest(app)
            .post('/api/attendees')
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .send(newAttendee)
            .expect(400, {
              error: { message: `Missing '${field}' in request body` },
            });
        });
      });
    });

    context('Happy path', () => {
      it('responds 201, stores attendee', () => {
        const newAttendee = {
          user_id: 1,
          event_id: 4,
        };
        const testEvent = testEvents[newAttendee.event_id - 1];

        return supertest(app)
          .post('/api/attendees')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .send(newAttendee)
          .expect(201)
          .expect((res) => {
            expect(res.body.attendee.user_id).to.eql(newAttendee.user_id);
            expect(res.body.event.id).to.eql(newAttendee.event_id);
            expect(res.body.event.organizer).to.eql(testEvent.organizer);
            expect(res.body.event.title).to.eql(testEvent.title);
            expect(res.body.event.event_purpose).to.eql(testEvent.event_purpose);
            expect(res.body.event.restaurant).to.eql(testEvent.restaurant);
            expect(res.body.event.address).to.eql(testEvent.address);
            expect(res.body.event.description).to.eql(testEvent.description);
            expect(res.body.event.singles_only).to.eql(testEvent.singles_only);
          });
      });
    });
  });

  describe('DELETE /api/attendees', () => {
    context('Given no attendees', () => {
      it('responds with 401', () => {
        return supertest(app)
          .delete('/api/attendees')
          .set('Authorization', makeAuthHeader(testUsers[1]))
          .expect(401, { error: 'Unauthorized request' });
      });
    });

    context('Given there are attendees in the database', () => {
      const testAttendees = makeAttendeesArray();
      beforeEach(() => db
        .into('users')
        .insert(testUsers)
        .then(() => db
          .into('events')
          .insert(testEvents))
        .then(() => db
          .into('attendees')
          .insert(testAttendees)));

      it('responds with 204 and removes the attendee', () => {
        const idToRemove = 11;
        const expectedAttendees = testAttendees.filter((attendee) => attendee.id !== idToRemove);
        return supertest(app)
          .delete('/api/attendees')
          .set('Authorization', makeAuthHeader(testUsers[2]))
          .send({ event_id: 1 })
          .expect(204)
          .then((res) => supertest(app)
            .get('/api/attendees')
            .set('Authorization', makeAuthHeader(testUsers[2]))
            .expect((res) => {
              expect(res.body[idToRemove - 1].user_id).to.eql(expectedAttendees[idToRemove].user_id);
              expect(res.body[idToRemove - 1].event_id).to.eql(expectedAttendees[idToRemove].event_id);
            }));
      });
    });
  });
});
