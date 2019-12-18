const knex = require('knex');
const EventsService = require('../src/events/events-service');
const { makeUsersArray } = require('./users.fixtures');
const { makeEventsArray } = require('./events.fixtures');

describe(`Events service object`, function() {
    let db;

    let testUsers = makeUsersArray();
    let testEvents = makeEventsArray();

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
        });

        it(`getAllEvents() resolves all events from 'events' table`, () => {
            return EventsService.getAllEvents(db)
                .then(res => {
                    expect(res).to.have.lengthOf(3)
                    expect(res[0].organizer).to.eql(testEvents[0].organizer)
                    expect(res[0].title).to.eql(testEvents[0].title)
                    expect(res[0].event_purpose).to.eql(testEvents[0].event_purpose)
                    expect(res[0].restaurant).to.eql(testEvents[0].restaurant)
                    expect(res[0].address).to.eql(testEvents[0].address)
                    expect(res[0].description).to.eql(testEvents[0].description)
                    expect(res[0].singles_only).to.eql(testEvents[0].singles_only)
                  })
        })

        it(`getEventByID() resolves an event by id from 'event' table`, () => {
            const thirdId = 3;
            const thirdTestEvent = testEvents[thirdId - 1];
            return EventsService.getEventById(db, thirdId)
                .then(res => {
                    expect(res.organizer).to.eql(thirdTestEvent.organizer)
                    expect(res.title).to.eql(thirdTestEvent.title)
                    expect(res.event_purpose).to.eql(thirdTestEvent.event_purpose)
                    expect(res.restaurant).to.eql(thirdTestEvent.restaurant)
                    expect(res.address).to.eql(thirdTestEvent.address)
                    expect(res.description).to.eql(thirdTestEvent.description)
                    expect(res.singles_only).to.eql(thirdTestEvent.singles_only)
                  })
        })

        it(`deleteEvent() removes a event by id from 'event' table`, () => {
            const eventId = 3;
            return EventsService.deleteEvent(db, eventId)
                .then(() => EventsService.getAllEvents(db))
                .then(allEvents => {
                    const expected = testEvents.filter(event => event.id !== eventId);
                    expect(allEvents).to.have.lengthOf(2);
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