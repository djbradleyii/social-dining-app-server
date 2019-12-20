const knex = require('knex');
const AttendeesService = require('../src/attendees/attendees-service');
const EventsService = require('../src/events/events-service')
const { makeAttendeesArray, makeUsersArrayForAttendeesTest, makeEventsArrayForAttendeesTest } = require('./attendees.fixtures');

describe(`Attendees service object`, function() {
    let db;

    let testUsers = makeUsersArrayForAttendeesTest();
    let testEvents = makeEventsArrayForAttendeesTest();
    let testAttendees = makeAttendeesArray();

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    });

    before(() => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'));

    afterEach(() => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'));

    after(() => db.destroy());

    context(`Given 'attendees' has data`, () => {
        afterEach(() => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'));
        
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

        it(`getAllAttendees() resolves all attendees from 'attendees' table`, () => {
            return AttendeesService.getAllAttendees(db)
                .then(res => {
                    expect(res).to.have.lengthOf(13)
                    expect(res[0]).to.have.property('user_id')
                    expect(res[0]).to.have.property('event_id')
                  })
        })

        it(`getAllAttendeesNames() resolves all attendees from 'attendees' table`, () => {
            return AttendeesService.getAllAttendeesNames(db)
                .then(res => {
                    expect(res).to.have.lengthOf(6)
                  })
        })

        it(`deleteAttendee() delete an attendee from an event by attendee_id`, () => {
            const attendee_id = 2;
            return AttendeesService.deleteAttendee(db, attendee_id)
                .then(() => AttendeesService.getAllAttendees(db)
                .then(res => {
                    expect(res).to.be.an('array')
                    expect(res).to.have.lengthOf(12)
                    expect(res[0]).to.have.property('user_id')
                    expect(res[0]).to.have.property('event_id')
                }))
        })
    })

    context(`Given 'attendees' table has no data`, () => {
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
        });
        it(`insertAttendee() inserts a new event and resolves the new event with an 'id'`, () => {
            const newAttendee = {
                user_id: 1,
                event_id: 2
            }

            return AttendeesService.insertAttendee(db, newAttendee)
                .then(actual => {
                    expect(actual).to.have.a.property('id', 1)
                    expect(actual.user_id).to.eql(newAttendee.user_id)
                    expect(actual.event_id).to.eql(newAttendee.event_id)
                })
        })
    })
})