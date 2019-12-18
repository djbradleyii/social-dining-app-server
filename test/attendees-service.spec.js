const knex = require('knex');
const AttendeesService = require('../src/attendees/attendees-service');
const { makeUsersArray } = require('./users.fixtures');
const { makeEventsArray } = require('./events.fixtures');
const { makeAttendeesArray } = require('./attendees.fixtures');

describe(`Attendees service object`, function() {
    let db;

    let testUsers = makeUsersArray();
    let testEvents = makeEventsArray();
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
                    expect(res).to.have.lengthOf(8)
                    expect(res[0].user_id).to.eql(testAttendees[0].user_id)
                    expect(res[0].event_id).to.eql(testAttendees[0].event_id)
                  })
        })

        it.skip(`deleteAttendeeByAttendeeId() delete an attendee from an event by attendee_id`, () => {
            const attendee_id = 2;
            const event_id = testAttendees[attendee_id - 1];
            return AttendeesService.deleteAttendeeByAttendeeId(db, attendee_id)
                .then(() => AttendeesService.getAllAttendeesByEventId(event_id))
                .then(attendees => console.log(attendees))
        })

    })

    context(`Given 'attendees' table has no data`, () => {
        beforeEach(() => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'));

        it(`insertAttendees() inserts a new event and resolves the new event with an 'id'`, () => {
            const newAttendee = {
            }

            return AttendeesService.insertAttendee(db, newAttendee)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        title: newEvent.title,
                        event_purpose: newEvent.event_purpose,
                        restaurant: newEvent.restaurant,
                        address: newEvent.address,
                        date: new Date(newEvent.date),
                        time: newEvent.time,
                        description: newEvent.description,
                        singles_only: newEvent.singles_only
                    })
                })
        })
    })
})