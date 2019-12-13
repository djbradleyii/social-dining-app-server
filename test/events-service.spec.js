const knex = require('knex');
const EventsService = require('../src/events-service');

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
            purpose : "Singles Night",
            restaurant : "Sonora Town",
            address : "321 4th St, Los Angeles, CA 90003",
            date : new Date('10/31/2020'),
            time : "13:00",
            description : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.",
            singles_only : false, 
            date_created: new Date('2019-12-11T16:28:32.615Z')
        },
        {
            id: 2,
            organizer : 3,
            title : "Event 2 Title",
            purpose : "Game Night",
            restaurant : "Button Mash",
            address : "123 2nd St, Los Angeles, CA 90001",
            date : new Date('04/03/2020'),
            time : "13:00",
            description : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.",
            singles_only : false, 
            date_created: new Date('2019-12-11T16:28:32.615Z')
        },
        {
            id: 3,
            organizer : 1,
            title : "Event 3 Title",
            purpose : "Networking",
            restaurant : "Water Grill",
            address : "30923 Union Ave, Los Angeles, CA 90301",
            date : new Date('03/03/2020'),
            time : "13:00",
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


    before(()=>db('users').dropForeign('user_id'));
    before(() => db('users').truncate());
    before(() => db('events').truncate());

    afterEach(() => db('users').truncate());
    afterEach(() => db('events').truncate());

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
                        purpose: ThirdTestEvent.purpose,
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

        it(`updateEventInfo() updates an events information from 'events' table`, () => {
            const idOfEventToUpdate = 3;
            const newEventInfo = {
                title: "Updated Title",
                purpose: "Social",
                restaurant: "Updated Restaurant",
                address : "123 Update St, Norwalk CA 91919",
                date : new Date('09/23/2020'),
                time : "04:05 PM",
                description : "Updated Description",
                singles_only : FALSE, 
                date_created: new Date('2019-12-11T16:28:32.615Z')
            };

            return EventsService.updateEventInfo(db, idOfEventToUpdate, newEventInfo)
            .then(() => EventsService.getEventById(db, idOfEventToUpdate))
            .then(event => {
                expect(event).to.eql({
                    id: idOfEventToUpdate,
                    ...newEventInfo
                })
            })
        })
    })

    context.skip(`Given 'events' table has no data`, () => {
        beforeEach(() => db('events').truncate());

        it(`inserEvents() inserts a new event and resolves the new event with an 'id'`, () => {
            const newUser = {
                fname : "Samantha",
                lname : "Lake",
                dob : new Date('05/22/1980'),
                email : "slake@lakescakes.com",
                password : "lakescakes1",
                marital_status : "Divorced",
                occupation : "Baker",
                gender : "Female",
                bio : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.", 
                date_created: new Date('2019-12-11T16:28:32.615Z')
            }

            return EventsService.insertUser(db, newUser)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        fname: newUser.fname,
                        lname: newUser.lname,
                        dob: new Date(newUser.dob),
                        email: newUser.email,
                        password: newUser.password,
                        marital_status: newUser.marital_status,
                        occupation: newUser.occupation,
                        gender: newUser.gender,
                        bio: newUser.bio,
                        date_created: new Date(newUser.date_created)
                    })
                })
        })

    })
})