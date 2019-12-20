const knex = require('knex');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { makeEventsArray, makeUsersArrayForEventTest, makeAttendeesArrayForEventTest, seedUsers} = require('./events.fixtures');
const AuthService = require('../src/auth/auth-service');

describe('Events Endpoints', function() {
  let db
  let testUsers = makeUsersArrayForEventTest();
  let testEvents = makeEventsArray();
  let testAttendees = makeAttendeesArrayForEventTest();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  function makeAuthHeader(user, secret = process.env.JWT_SECRET) { 
    const token = jwt.sign({ email: user.email }, secret, {
      subject: user.email,
      algorithm: 'HS256',
    })
    return `Bearer ${token}`
  }

  after('disconnect from db', () => db.destroy());
  before('clean the table', () => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'));
  afterEach('cleanup',() => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'));
  
  describe(`GET /api/events`, () => {
    context(`Given no events`, () => {
      it(`responds with 401 and Missing bearer token`, () => {
        return supertest(app)
          .get('/api/events')
          .expect(401, { error: `Missing bearer token` })
      })
    })

    context('Given there are events in the database', () => {
        beforeEach(() => {
            return db
                .into('users')
                .insert(testUsers)
                .then(() => {
                return db
                    .into('events')
                    .insert(testEvents)
                })
        });

      it('responds with 200 and all of the events', () => {
        return supertest(app)
          .get('/api/events')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            expect(res.body[0].organizer).to.eql(testEvents[0].organizer)
            expect(res.body[0].title).to.eql(testEvents[0].title)
            expect(res.body[0].event_purpose).to.eql(testEvents[0].event_purpose)
            expect(res.body[0].restaurant).to.eql(testEvents[0].restaurant)
            expect(res.body[0].address).to.eql(testEvents[0].address)
            expect(res.body[0].description).to.eql(testEvents[0].description)
            expect(res.body[0].singles_only).to.eql(testEvents[0].singles_only)
          })
      })

      it('responds with 200 and all of the events based on a title keyword', () => {
        const keyword = 'Title';
        return supertest(app)
          .get(`/api/events?keyword=${keyword}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            expect(res.body[0].organizer).to.eql(testEvents[0].organizer)
            expect(res.body[0].title.toLowerCase()).to.eql(testEvents[0].title.toLowerCase())
            expect(res.body[0].event_purpose).to.eql(testEvents[0].event_purpose)
            expect(res.body[0].restaurant).to.eql(testEvents[0].restaurant)
            expect(res.body[0].address).to.eql(testEvents[0].address)
            expect(res.body[0].description).to.eql(testEvents[0].description)
            expect(res.body[0].singles_only).to.eql(testEvents[0].singles_only)
          })
      })

      it('responds with 200 and all of the events based on a address keyword', () => {
        const keyword = 'Angeles';
        return supertest(app)
          .get(`/api/events?keyword=${keyword}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            expect(res.body[0].organizer).to.eql(testEvents[0].organizer)
            expect(res.body[0].title).to.eql(testEvents[0].title)
            expect(res.body[0].event_purpose).to.eql(testEvents[0].event_purpose)
            expect(res.body[0].restaurant).to.eql(testEvents[0].restaurant)
            expect(res.body[0].address.toLowerCase()).to.eql(testEvents[0].address.toLowerCase())
            expect(res.body[0].description).to.eql(testEvents[0].description)
            expect(res.body[0].singles_only).to.eql(testEvents[0].singles_only)
          })
      })

      it('responds with 200 and all of the events based on a restaurant keyword', () => {
        const keyword = 'Noodle';
        return supertest(app)
          .get(`/api/events?keyword=${keyword}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            expect(res.body[0].organizer).to.eql(testEvents[6].organizer)
            expect(res.body[0].title).to.eql(testEvents[6].title)
            expect(res.body[0].event_purpose).to.eql(testEvents[6].event_purpose)
            expect(res.body[0].restaurant.toLowerCase()).to.eql(testEvents[6].restaurant.toLowerCase())
            expect(res.body[0].address).to.eql(testEvents[6].address)
            expect(res.body[0].description).to.eql(testEvents[6].description)
            expect(res.body[0].singles_only).to.eql(testEvents[6].singles_only)
          })
      })

      it('responds with 200 and all of the events based on a event_purpose keyword', () => {
        const keyword = 'Social';
        return supertest(app)
          .get(`/api/events?keyword=${keyword}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            expect(res.body[0].organizer).to.eql(testEvents[4].organizer)
            expect(res.body[0].title).to.eql(testEvents[4].title)
            expect(res.body[0].event_purpose.toLowerCase()).to.eql(testEvents[4].event_purpose.toLowerCase())
            expect(res.body[0].restaurant).to.eql(testEvents[4].restaurant)
            expect(res.body[0].address).to.eql(testEvents[4].address)
            expect(res.body[0].description).to.eql(testEvents[4].description)
            expect(res.body[0].singles_only).to.eql(testEvents[4].singles_only)
          })
      })

      it('responds with 200 and all of the events based on a description keyword', () => {
        const keyword = 'facilisis';
        return supertest(app)
          .get(`/api/events?keyword=${keyword}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            expect(res.body[0].organizer).to.eql(testEvents[0].organizer)
            expect(res.body[0].title).to.eql(testEvents[0].title)
            expect(res.body[0].event_purpose).to.eql(testEvents[0].event_purpose)
            expect(res.body[0].restaurant).to.eql(testEvents[0].restaurant)
            expect(res.body[0].address).to.eql(testEvents[0].address)
            expect(res.body[0].description.toLowerCase()).to.eql(testEvents[0].description.toLowerCase())
            expect(res.body[0].singles_only).to.eql(testEvents[0].singles_only)
                })
            })    
        })
    })

  describe(`GET /api/events/:event_id`, () => {
    context(`Given no events`, () => {
      it(`responds with 401`, () => {
        const eventId = 123456
        return supertest(app)
          .get(`/api/events/${eventId}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(401, { error: 'Unauthorized request' })
      })
    })

    context('Given there are events in the database', () => {
        beforeEach(() => {
            return db
                .into('users')
                .insert(testUsers)
                .then(() => {
                return db
                    .into('events')
                    .insert(testEvents)
                })
                .then(() => {
                    return db
                        .into('attendees')
                        .insert(testAttendees)
                    })
        });

      it('responds with 200 and the specified event', () => {
        const eventId = 2;
        const expectedEvent = testEvents[eventId - 1];
        return supertest(app)
          .get(`/api/events/${eventId}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            expect(res.body.organizer).to.eql(expectedEvent.organizer)
            expect(res.body.title).to.eql(expectedEvent.title)
            expect(res.body.event_purpose).to.eql(expectedEvent.event_purpose)
            expect(res.body.restaurant).to.eql(expectedEvent.restaurant)
            expect(res.body.address).to.eql(expectedEvent.address)
            expect(res.body.description).to.eql(expectedEvent.description)
            expect(res.body.singles_only).to.eql(expectedEvent.singles_only)
          })
      })

      it('responds with 200 and a list of attendees', () => {
        const eventId = 10;
        return supertest(app)
          .get(`/api/events/${eventId}/attendees`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
              expect(res.body.attendees).to.have.a.lengthOf(2)
              expect(res.body.attendees[0]).to.have.property('user_id')
              expect(res.body.attendees[0]).to.have.property('event_id')
          })
      })
    })

    context(`Given an XSS attack event`, () => {
        const testEvents = makeEventsArray();
        const maliciousEvent = {
          organizer: 1,
          title : `<img src="https://url" onerror="alert(document);">`,
          event_purpose : 'Social',
          restaurant : `<img src="https://url" onerror="alert(document);">`,
          address : 'malicious occupation <script>alert("xss");</script>',
          date : new Date('10/31/2020'),
          time : "18:00:00",
          description : `<img src="https://url" onerror="alert(document);">`, 
          singles_only: false
      }
      const expectedEvent = {
          organizer: 1,
          title : `<img src="https://url">`,
          event_purpose : 'Social',
          restaurant : `<img src="https://url">`,
          address : 'malicious occupation &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
          date : new Date('10/31/2020'),
          time : "18:00:00",
          description : `<img src="https://url">`, 
          singles_only: false
    }

        beforeEach(() => {
            return db
                .into('users')
                .insert(testUsers)
                .then(() => {
                    return db
                        .into('events')
                        .insert(maliciousEvent)
                })
        });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/events/1`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            expect(res.body.organizer).to.eql(expectedEvent.organizer)
            expect(res.body.title).to.eql(expectedEvent.title)
            expect(res.body.event_purpose).to.eql(expectedEvent.event_purpose)
            expect(res.body.restaurant).to.eql(expectedEvent.restaurant)
            expect(res.body.address).to.eql(expectedEvent.address)
            expect(res.body.description).to.eql(expectedEvent.description)
            expect(res.body.singles_only).to.eql(expectedEvent.singles_only)
          })
      })
    })
  })


  describe(`POST /api/events`, () => {
    const testUsers = makeUsersArrayForEventTest();
    const testEvents = makeEventsArray();
    const testAttendees = makeAttendeesArrayForEventTest();

    beforeEach(() => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'));

    beforeEach(() => {
        return db
                .into('users')
                .insert(testUsers)
                .then(() => {
                    return db
                    .into('events')
                    .insert(testEvents)
                })
                .then(() => {
                    return db
                        .into('attendees')
                        .insert(testAttendees)
                })
    });

    context(`Event Validation`, () => {
    const requiredFields = ['organizer', 'title', 'event_purpose', 'restaurant', 'address', 'date', 'time', 'description', 'singles_only']

    requiredFields.forEach(field => {
      const newEvent = {
        organizer : 1,
        title : "Event 1 Title",
        event_purpose : "Singles Night",
        restaurant : "Sonora Town",
        address : "321 4th St, Los Angeles, CA 90003",
        date : new Date('10/31/1983'),
        time : "18:00:00",
        description : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.",
        singles_only : true, 
        date_created: new Date('10/31/2020')
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newEvent[field]

        return supertest(app)
          .post('/api/events')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .send(newEvent)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
})

    context(`Happy path`, () => {
      it(`responds 201, stores event`, () => {
        const newEvent = {
            organizer : 1,
            title : "New Title",
            event_purpose : "Social",
            restaurant : "New Restaurant",
            address : "321 New St, Los Angeles, CA 90003",
            date : new Date('11/01/2020'),
            time : "15:00:00",
            description : "New Description",
            singles_only : false, 
        }
        return supertest(app)
          .post('/api/events')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .send(newEvent)
          .expect(201)
          .expect(res => {
            expect(res.body.event.organizer).to.eql(newEvent.organizer)
            expect(res.body.event.title).to.eql(newEvent.title)
            expect(res.body.event.event_purpose).to.eql(newEvent.event_purpose)
            expect(res.body.event.restaurant).to.eql(newEvent.restaurant)
            expect(res.body.event.address).to.eql(newEvent.address)
            expect(res.body.event.description).to.eql(newEvent.description)
            expect(res.body.event.singles_only).to.eql(newEvent.singles_only)
          })
      })
    })
  })

  describe(`DELETE /api/events/:event_id`, () => {
    context(`Given no events`, () => {
      it(`responds with 401`, () => {
        const eventId = 123456
        return supertest(app)
          .delete(`/api/events/${eventId}`)
          .set('Authorization', makeAuthHeader(testUsers[1]))
          .expect(401, { error: 'Unauthorized request' })
      })
    })

    context('Given there are events in the database', () => {
      const testEvents = makeEventsArray();
      beforeEach(() => {
        return db
            .into('users')
            .insert(testUsers)
            .then(() => {
            return db
                .into('events')
                .insert(testEvents)
            })
    });

      it('responds with 204 and removes the event', () => {
        const idToRemove = 2
        const expectedEvents = testEvents.filter(event => event.id !== idToRemove)
        return supertest(app)
          .delete(`/api/events/${idToRemove}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/events`)
              .set('Authorization', makeAuthHeader(testUsers[0]))
              .expect(res => {
                expect(res.body[4].organizer).to.eql(expectedEvents[5].organizer)
                expect(res.body[4].title).to.eql(expectedEvents[5].title)
                expect(res.body[4].event_purpose).to.eql(expectedEvents[5].event_purpose)
                expect(res.body[4].restaurant).to.eql(expectedEvents[5].restaurant)
                expect(res.body[4].address).to.eql(expectedEvents[5].address)
                expect(res.body[4].description).to.eql(expectedEvents[5].description)
                expect(res.body[4].singles_only).to.eql(expectedEvents[5].singles_only)
              })
          )
      })
    })
  })

  describe(`PATCH /api/events/:event_id`, () => {
    context(`Given no events`, () => {
      it(`responds with 404`, () => {
        const eventId = 123456
        return supertest(app)
          .delete(`/api/events/${eventId}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(401, { error: 'Unauthorized request' })
      })
    })

    context('Given there are events in the database', () => {
      const testEvents = makeEventsArray();
  
      beforeEach(() => {
        return db
            .into('users')
            .insert(testUsers)
            .then(() => {
            return db
                .into('events')
                .insert(testEvents)
            })
    });

      it('responds with 204 and updates the event', () => {
        const idToUpdate = 2
        const updateEvent = {
          title : "Update",
          description : "Nams ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.",
        }
        const expectedEvent = {
          ...testEvents[idToUpdate - 1],
          ...updateEvent
        }
        return supertest(app)
          .patch(`/api/events/${idToUpdate}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .send(updateEvent)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/events/${idToUpdate}`)
              .set('Authorization', makeAuthHeader(testUsers[0]))
              .then(res => {
                expect(res.body.title).to.eql(expectedEvent.title)
                expect(res.body.description).to.eql(expectedEvent.description)
              })   
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/events/${idToUpdate}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: { message: `Request body must contain either 'title' or 'description'`}
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updateEvent = {
          title: 'updated title',
        }
        const expectedEvent = {
          ...testEvents[idToUpdate - 1],
          ...updateEvent
        }
        return supertest(app)
          .patch(`/api/events/${idToUpdate}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .send({
            ...updateEvent,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/events/${idToUpdate}`)
              .set('Authorization', makeAuthHeader(testUsers[0]))
              .then(res => {
                expect(res.body.title).to.eql(expectedEvent.title)
              })
          )
      })
    })
  })
})