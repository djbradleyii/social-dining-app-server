const knex = require('knex');
const EventsService = require('../src/events/events-service');

describe(`Events service object`, function() {
    let db;

    let testUsers = [
        {
            id: 1,
            fname : "Rick",
            lname : "Mcqueeney",
            dob : new Date('10/31/1983'),
            email : "rmcqueeney@gmail.com",
            password : "password1",
            marital_status : "Married",
            occupation : "Marketing",
            gender : "Male",
            bio : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.", 
            date_created: new Date('2019-12-11T16:28:32.615Z')
        },
        {
            id: 2,
            fname : "Summer",
            lname : "Lane",
            dob : new Date('02/02/1972'),
            email : "slane@gmail.com",
            password : "password2",
            marital_status : "Married",
            occupation : "Fashion Designer",
            gender : "Female",
            bio : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.", 
            date_created: new Date('2019-12-11T16:28:32.615Z')
        },
        {
            id: 3,
            fname : "Larry",
            lname : "Savage",
            dob : new Date('06/10/1975'),
            email : "lsavage@aol.com",
            password : "password3",
            marital_status : "Widow",
            occupation : "Construction",
            gender : "Male",
            bio : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.", 
            date_created: new Date('2019-12-11T16:28:32.615Z')
        },
    ];

    let testEvents = [
        {
            id: 1,
            organizer : 1,
            title : "Event 1 Title",
            event_purpose : "Singles Night",
            restaurant : "Sonora Town",
            address : "321 4th St, Los Angeles, CA 90003",
            date : new Date('10/31/2020'),
            time : "06:00 PM",
            description : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.",
            singles_only : false, 
            date_created: new Date('2019-12-11T16:28:32.615Z')
        },
        {
            id: 2,
            organizer : 3,
            title : "Event 2 Title",
            event_purpose : "Game Night",
            restaurant : "Button Mash",
            address : "123 2nd St, Los Angeles, CA 90001",
            date : new Date('04/03/2020'),
            time : "06:00 PM",
            description : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.",
            singles_only : false, 
            date_created: new Date('2019-12-11T16:28:32.615Z')
        },
        {
            id: 3,
            organizer : 1,
            title : "Event 3 Title",
            event_purpose : "Networking",
            restaurant : "Water Grill",
            address : "30923 Union Ave, Los Angeles, CA 90301",
            date : new Date('03/03/2020'),
            time : "06:00 PM",
            description : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.",
            singles_only : false, 
            date_created: new Date('2019-12-11T16:28:32.615Z')
        },
    ];

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    });

    before(() => db('users').truncate());

    afterEach(() => db('users').truncate());

    after(() => db.destroy());

    context(`Given 'events' has data`, () => {
        beforeEach(() => {
            return db
                .into('users')
                .insert(testUsers)
        });

        beforeEach(() => {
            return db
                .into('events')
                .insert(testEvents)
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
                time : "04:05 PM",
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
        beforeEach(() => db('events').truncate());

        it(`insertEvents() inserts a new event and resolves the new event with an 'id'`, () => {
            const newEvent = {
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