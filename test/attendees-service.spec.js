const knex = require('knex');
const AttendeesService = require('../src/attendees/attendees-service');
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

        it(`getAllAttendeesByEventId() resolves all attendees from 'attendees' table`, () => {
            const event_id = 10;
            const testAttendee = testAttendees.filter(attendee => attendee.event_id === event_id)
            const testEvent = testEvents[testAttendee[0].event_id - 1];
            return AttendeesService.getAllAttendeesByEventId(db, event_id)
                .then(res => {
                    expect(res).to.have.lengthOf(2)
                    expect(res[0].title).to.eql(testEvent.title)
                    expect(res[0].attendee).to.eql(testUsers[testAttendee[0].user_id - 1].fname)
                    expect(res[1].attendee).to.eql(testUsers[testAttendee[1].user_id - 1].fname)
                  })
        })

        it(`getAttendeesCountByEventId() resolves all attendees from 'attendees' table`, () => {
            const event_id = 1;
            return AttendeesService.getAttendeesCountByEventId(db, event_id)
                .then(res => {
                    expect(res).to.have.eql([ { 'Attendee_Count': '2' } ])
                  })
        })

        it(`deleteAttendeeFromEvent() delete an attendee from an event by attendee_id`, () => {
            const user_id = 3;
            const event_id = 10;
            return AttendeesService.deleteAttendeeFromEvent(db, user_id, event_id)
                .then(() => AttendeesService.getAllAttendeesByEventId(db, event_id)
                .then(res => {
                    expect(res).to.be.an('array')
                    expect(res).to.have.lengthOf(1)
                    expect(res[0]).to.have.property('user_id')
                    expect(res[0]).to.have.property('event_id')
                    expect(res[0]).to.have.property('title')
                    expect(res[0]).to.have.property('attendee')
                    expect(res[0]).to.not.have.property('user_id', user_id)
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