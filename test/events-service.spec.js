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

    before(() => {
        db('events').truncate();
        db('users').truncate();
    });

    afterEach(() => {
        db('events').truncate();
        db('users').truncate();
    });

    after(() => db.destroy());

    context(`Given 'events' has data`, () => {
        afterEach(() => {
            db('events').truncate();
            db('users').truncate();
        });
        
        beforeEach(() => {
            db('users').insert(testUsers);
            db('events').insert(testEvents);
        });

        it(`getAllEvents() resolves all events from 'events' table`, () => {
            return EventsService.getAllEvents(db)
                .then(actual => {
                    expect(actual).to.eql(testEvents.map(event => ({
                               ...event,
                               date: new Date(event.date),
                               date_created: new Date(event.date_created)
                    })))
                })
        })

        it(`getEventByID() resolves an event by id from 'event' table`, () => {
            const thirdId = 3;
            const thirdTestEvent = testEvent[thirdId - 1];
            return EventsService.getEventById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        organizer: thirdTestEvent.organizer,
                        title: thirdTestEvent.title,
                        event_purpose: ThirdTestEvent.event_purpose,
                        restaurant: thirdTestEvent.restaurant,
                        address: thirdTestEvent.address,
                        date: new Date(thirdTestEvent.date),
                        time: thirdTestEvent.time,
                        description: thirdTestEvent.description,
                        singles_only: thirdTestEvent.singles_only,
                        date_created: new Date(thirdTestEvent.date_created)
                    })
                })
        })

        it(`deleteEvent() removes a event by id from 'event' table`, () => {
            const eventId = 3;
            return EventsService.deleteEvent(db, eventId)
                .then(() => EventsService.getAllEvents(db))
                .then(allEvents => {
                    const expected = testEvents.filter(event => event.id !== eventId);
                    expect(allEvents).to.eql(expected)
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
                time : "16:05 PM",
                description : "Updated Description",
                singles_only : false
            };

            return EventsService.updateEventInfo(db, idOfEventToUpdate, eventUpdates)
            .then(() => EventsService.getEventById(db, idOfEventToUpdate))
            .then(event => {
                expect(event).to.eql({
                    id: idOfEventToUpdate,
                    ...eventUpdates
                })
            })
        })
    })

    context(`Given 'events' table has no data`, () => {
        beforeEach(() => {
            db('events').truncate();
            db('users').truncate();
        });

        it(`insertEvents() inserts a new event and resolves the new event with an 'id'`, () => {
            const newEvent = {
                organizer: 1,
                title: "New Event Title",
                event_purpose: "Social",
                restaurant: "New Restaurant",
                address : "123 New St, Norwalk CA 91919",
                date : new Date('09/23/2020'),
                time : "16:45 PM",
                description : "New Description",
                singles_only : false
            }

            return EventsService.insertEvent(db, newEvent)
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