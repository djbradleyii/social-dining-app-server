const knex = require('knex');
const EventsService = require('../src/events/events-service');
const { makeEventsArray, makeUsersArrayForEventTest, makeAttendeesArrayForEventTest } = require('./events.fixtures');

describe(`Events service object`, function() {
    let db;

    let testUsers = makeUsersArrayForEventTest();
    let testEvents = makeEventsArray();
    let testAttendees = makeAttendeesArrayForEventTest();

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    });

    before(() => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'));

    afterEach(() => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'));

    after(() => db.destroy());

    context(`Given 'events' has data`, () => {
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

        it(`getAllAttendeesByEventId() resolves all attendees from 'attendees' table`, () => {
            const event_id = 10;
            const testAttendee = testAttendees.filter(attendee => attendee.event_id === event_id)
            const testEvent = testEvents[testAttendee[0].event_id - 1];
            return EventsService.getAllAttendeesByEventId(db, event_id)
                .then(res => {
                    expect(res).to.have.lengthOf(2)
                    expect(res[0].attendee).to.eql(testUsers[testAttendee[0].user_id - 1].first_name)
                    expect(res[1].attendee).to.eql(testUsers[testAttendee[1].user_id - 1].first_name)
                  })
        })

        it(`getAllEvents() resolves all events from 'events' table`, () => {;
            return EventsService.getAllEvents(db)
                .then(res => {
                    expect(res).to.have.lengthOf(10)
                    expect(res[0].organizer).to.eql(testEvents[0].organizer)
                    expect(res[0].title).to.eql(testEvents[0].title)
                    expect(res[0].event_purpose).to.eql(testEvents[0].event_purpose)
                    expect(res[0].restaurant).to.eql(testEvents[0].restaurant)
                    expect(res[0].address).to.eql(testEvents[0].address)
                    expect(res[0].description).to.eql(testEvents[0].description)
                    expect(res[0].singles_only).to.eql(testEvents[0].singles_only)
                  })
        })

        it(`getEventById() resolves all events from 'events' table`, () => {
            const event_id = 3;
            const testEvent = testEvents[event_id - 1];
            return EventsService.getEventById(db, event_id)
                .then(res => {
                    expect(res.organizer).to.eql(testEvent.organizer)
                    expect(res.title).to.eql(testEvent.title)
                    expect(res.event_purpose).to.eql(testEvent.event_purpose)
                    expect(res.restaurant).to.eql(testEvent.restaurant)
                    expect(res.address).to.eql(testEvent.address)
                    expect(res.description).to.eql(testEvent.description)
                    expect(res.singles_only).to.eql(testEvent.singles_only)
                })
        })

        it(`getEventByKeyword() resolves an event with keyword in restaurant from 'event' table`, () => {
            const term = 'Noodle';
            return EventsService.getEventByKeyword(db, term)
                .then(res => {
                    expect(res).to.have.lengthOf(3)
                    expect(res[0].restaurant).to.have.string(term)
                    expect(res[1].restaurant).to.have.string(term)
                    expect(res[2].restaurant).to.have.string(term)
                  })
        })

        it(`getEventByKeyword() resolves an event with keyword in description from 'event' table`, () => {
            const term = 'facilisis';
            return EventsService.getEventByKeyword(db, term)
                .then(res => {
                    expect(res).to.have.lengthOf(10)
                    expect(res[0].description).to.have.string(term)
                    expect(res[1].description).to.have.string(term)
                    expect(res[2].description).to.have.string(term)
                  })
        })

        it(`getEventByKeyword() resolves an event with keyword in title from 'event' table`, () => {
            const term = 'Title';
            return EventsService.getEventByKeyword(db, term)
                .then(res => {
                    expect(res).to.have.lengthOf(10)
                    expect(res[0].title).to.have.string(term)
                    expect(res[1].title).to.have.string(term)
                    expect(res[2].title).to.have.string(term)
                  })
        })

        it(`getEventByKeyword() resolves an event with keyword in address from 'event' table`, () => {
            const term = 'Angeles';
            return EventsService.getEventByKeyword(db, term)
                .then(res => {
                    expect(res).to.have.lengthOf(10)
                    expect(res[0].address).to.have.string(term)
                    expect(res[1].address).to.have.string(term)
                    expect(res[2].address).to.have.string(term)
                  })
        })

        it(`getEventByKeyword() resolves an event with keyword in event_purpose from 'event' table`, () => {
            const term = 'Single';
            return EventsService.getEventByKeyword(db, term)
                .then(res => {
                    expect(res).to.have.lengthOf(3)
                    expect(res[0].event_purpose).to.have.string(term)
                    expect(res[1].event_purpose).to.have.string(term)
                  })
        })

        it(`deleteEvent() removes a event by id from 'event' table`, () => {
            const eventId = 3;
            return EventsService.deleteEvent(db, eventId)
                .then(() => EventsService.getAllEvents(db))
                .then(allEvents => {
                    const expected = testEvents.filter(event => event.id !== eventId);
                    expect(allEvents).to.have.lengthOf(9);
                    expect(allEvents[0].organizer).to.eql(expected[0].organizer)
                    expect(allEvents[0].title).to.eql(expected[0].title)
                    expect(allEvents[0].event_purpose).to.eql(expected[0].event_purpose)
                    expect(allEvents[0].restaurant).to.eql(expected[0].restaurant)
                    expect(allEvents[0].address).to.eql(expected[0].address)
                    expect(allEvents[0].description).to.eql(expected[0].description)
                    expect(allEvents[0].singles_only).to.eql(expected[0].singles_only)
                    expect(allEvents[1].organizer).to.eql(expected[1].organizer)
                    expect(allEvents[1].title).to.eql(expected[1].title)
                    expect(allEvents[1].event_purpose).to.eql(expected[1].event_purpose)
                    expect(allEvents[1].restaurant).to.eql(expected[1].restaurant)
                    expect(allEvents[1].address).to.eql(expected[1].address)
                    expect(allEvents[1].description).to.eql(expected[1].description)
                    expect(allEvents[1].singles_only).to.eql(expected[1].singles_only)
                })
        })

        it(`updateEventById() updates an events information from 'events' table`, () => {
            const idOfEventToUpdate = 3;
            const eventUpdates = {
                title: "Updated Title",
                event_purpose: "Social",
                restaurant: "Updated Restaurant",
                address : "123 Update St, Norwalk CA 91919",
                date : new Date('09/23/2020'),
                time : "04:05 PM",
                description : "Updated Description",
                singles_only : false
            };

            return EventsService.updateEventById(db, idOfEventToUpdate, eventUpdates)
            .then(() => EventsService.getEventById(db, idOfEventToUpdate))
            .then(res => {
                expect(res.organizer).to.eql(testEvents[idOfEventToUpdate - 1].organizer)
                expect(res.title).to.eql(eventUpdates.title)
                expect(res.event_purpose).to.eql(eventUpdates.event_purpose)
                expect(res.restaurant).to.eql(eventUpdates.restaurant)
                expect(res.address).to.eql(eventUpdates.address)
                expect(res.description).to.eql(eventUpdates.description)
                expect(res.singles_only).to.eql(eventUpdates.singles_only)
              })
        })
    })

    context(`Given 'events' table has no data`, () => {
        beforeEach(() => db.raw('TRUNCATE attendees, events RESTART IDENTITY CASCADE'));
        beforeEach(() => {
            return db
                .into('users')
                .insert(testUsers)
        });

        it(`insertEvents() inserts a new event and resolves the new event with an 'id'`, () => {
            const newEvent = {
                organizer: 1,
                title: "New Event Title",
                event_purpose: "Social",
                restaurant: "New Restaurant",
                address : "123 New St, Norwalk CA 91919",
                date : new Date('09/23/2020'),
                time : "04:45 PM",
                description : "New Description",
                singles_only : false
            }
            return EventsService.insertEvent(db, newEvent)
                .then(res => {
                    expect(res.organizer).to.eql(newEvent.organizer)
                    expect(res.title).to.eql(newEvent.title)
                    expect(res.event_purpose).to.eql(newEvent.event_purpose)
                    expect(res.restaurant).to.eql(newEvent.restaurant)
                    expect(res.address).to.eql(newEvent.address)
                    expect(res.description).to.eql(newEvent.description)
                    expect(res.singles_only).to.eql(newEvent.singles_only)
                  })
        })

    })
})