const knex = require('knex');
const UsersService = require('../src/users/users-service');
const { makeUsersArray, makeEventsArrayForUsersService, makeAttendeesArrayForUsersTest } = require('./users.fixtures');

describe(`Users service object`, function() {
    let db;

    const testUsers = makeUsersArray();
    const testEvents = makeEventsArrayForUsersService();
    const testAttendees = makeAttendeesArrayForUsersTest();

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
    });
    
    before(() => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'));

    afterEach(() => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'));

    after(() => db.destroy());

    context(`Given 'users' has data`, () => {
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

        it(`getAllUsers() resolves all users from 'users' table`, () => {
            return UsersService.getAllUsers(db)
                .then(res => {
                    expect(res[0].fname).to.eql(testUsers[0].fname)
                    expect(res[0].lname).to.eql(testUsers[0].lname)
                    expect(res[0].email).to.eql(testUsers[0].email)
                    expect(res[0].marital_status).to.eql(testUsers[0].marital_status)
                    expect(res[0].occupation).to.eql(testUsers[0].occupation)
                    expect(res[0].gender).to.eql(testUsers[0].gender)
                    expect(res[0].bio).to.eql(testUsers[0].bio)
                  })
        })

        it(`getUserByID() resolves a user by id from 'user' table`, () => {
            const thirdId = 3;
            const thirdTestUser = testUsers[thirdId - 1];
            return UsersService.getUserById(db, thirdId)
                .then(res => {
                    expect(res.fname).to.eql(thirdTestUser.fname)
                    expect(res.lname).to.eql(thirdTestUser.lname)
                    expect(res.marital_status).to.eql(thirdTestUser.marital_status)
                    expect(res.occupation).to.eql(thirdTestUser.occupation)
                    expect(res.gender).to.eql(thirdTestUser.gender)
                    expect(res.bio).to.eql(thirdTestUser.bio)
                })
        })

        it(`getAllEventsByUserId() resolves all events by userid from 'event' table`, () => {
            const user_id = 1; //organizer in events table
            return UsersService.getAllEventsByUserId(db, user_id)
                .then(res => {
                    expect(res).to.be.an('array');
                    expect(res).to.have.lengthOf(3)
                  })
        })

        it(`deleteUser() removes a user by id from 'user' table`, () => {
            const userId = 3;
            return UsersService.deleteUser(db, userId)
                .then(() => UsersService.getAllUsers(db))
                .then(allUsers => {
                    const expected = testUsers.filter(user => user.id !== userId);
                    expect(allUsers).to.have.lengthOf(2);
                    expect(allUsers[0].fname).to.eql(expected[0].fname)
                    expect(allUsers[0].lname).to.eql(expected[0].lname)
                    expect(allUsers[0].email).to.eql(expected[0].email)
                    expect(allUsers[0].marital_status).to.eql(expected[0].marital_status)
                    expect(allUsers[0].occupation).to.eql(expected[0].occupation)
                    expect(allUsers[0].gender).to.eql(expected[0].gender)
                    expect(allUsers[0].bio).to.eql(expected[0].bio)
                    expect(allUsers[1].fname).to.eql(expected[1].fname)
                    expect(allUsers[1].lname).to.eql(expected[1].lname)
                    expect(allUsers[1].email).to.eql(expected[1].email)
                    expect(allUsers[1].marital_status).to.eql(expected[1].marital_status)
                    expect(allUsers[1].occupation).to.eql(expected[1].occupation)
                    expect(allUsers[1].gender).to.eql(expected[1].gender)
                    expect(allUsers[1].bio).to.eql(expected[1].bio)
                })
        })

        it(`updateUserById() updates a users information from 'users' table`, () => {
            const idOfUserToUpdate = 3;
            const newUserInfo = {
                bio: "new bio coming soon"
            };
            return UsersService.updateUserById(db, idOfUserToUpdate, newUserInfo)
            .then(() => UsersService.getUserById(db, idOfUserToUpdate))
            .then(res => {
                console.log(res);
                expect(res.fname).to.eql(testUsers[idOfUserToUpdate - 1].fname)
                expect(res.lname).to.eql(testUsers[idOfUserToUpdate - 1].lname)
                expect(res.marital_status).to.eql(testUsers[idOfUserToUpdate - 1].marital_status)
                expect(res.occupation).to.eql(testUsers[idOfUserToUpdate - 1].occupation)
                expect(res.gender).to.eql(testUsers[idOfUserToUpdate - 1].gender)
                expect(res.bio).to.eql(newUserInfo.bio)
            })
        })
    })

    context(`Given 'users' table has no data`, () => {
        beforeEach(() => db.raw('TRUNCATE attendees, events, users RESTART IDENTITY CASCADE'));
        
        it(`insertUser() inserts a new user and resolves the new user with an 'id'`, () => {
            const newUser = {
                fname : "Samantha",
                lname : "Lake",
                dob : new Date('05/22/1980').toLocaleString(),
                email : "slake@lakescakes.com",
                password : "lakescakes1",
                marital_status : "Divorced",
                occupation : "Baker",
                gender : "Female",
                bio : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.", 
                date_created: new Date('2019-12-11T16:28:32.615Z').toLocaleString()
            }

            return UsersService.insertUser(db, newUser)
                .then(res => {
                    expect(res.fname).to.eql(newUser.fname)
                    expect(res.lname).to.eql(newUser.lname)
                    expect(res.email).to.eql(newUser.email)
                    expect(res.marital_status).to.eql(newUser.marital_status)
                    expect(res.occupation).to.eql(newUser.occupation)
                    expect(res.gender).to.eql(newUser.gender)
                    expect(res.bio).to.eql(newUser.bio)
                })
        })

    })
})