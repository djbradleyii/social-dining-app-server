const knex = require('knex');
const UsersService = require('../src/users-service');
const { makeUsersArray } = require('./users.fixtures');

describe(`Users service object`, function() {
    let db;

    const testUsers = makeUsersArray();

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
    });

    before(() => db('users').truncate());

    afterEach(() => db('users').truncate());

    after(() => db.destroy());

    context(`Given 'users' has data`, () => {
        beforeEach(() => {
            return db
                .into('users')
                .insert(testUsers)
        });

        it(`getAllUsers() resolves all users from 'users' table`, () => {
            return UsersService.getAllUsers(db)
                .then(actual => {
                    expect(actual).to.eql(testUsers.map(user => ({
                               ...user,
                               dob: new Date(user.dob),
                               date_created: new Date(user.date_created)
                    })))
                })
        })

        it(`getUserByID() resolves a user by id from 'user' table`, () => {
            const thirdId = 3;
            const thirdTestUser = testUsers[thirdId - 1];
            return UsersService.getUserById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        fname: thirdTestUser.fname,
                        lname: thirdTestUser.lname,
                        dob: new Date(thirdTestUser.dob),
                        email: thirdTestUser.email,
                        password: thirdTestUser.password,
                        marital_status: thirdTestUser.marital_status,
                        occupation: thirdTestUser.occupation,
                        gender: thirdTestUser.gender,
                        bio: thirdTestUser.bio,
                        date_created: new Date(thirdTestUser.date_created)
                    })
                })
        })

        it(`deleteUser() removes a user by id from 'user' table`, () => {
            const userId = 3;
            return UsersService.deleteUser(db, userId)
                .then(() => UsersService.getAllUsers(db))
                .then(allUsers => {
                    const expected = testUsers.filter(user => user.id !== userId);
                    expect(allUsers).to.eql(expected)
                })
        })

        it(`updateUserById() updates a users information from 'users' table`, () => {
            const idOfUserToUpdate = 3;
            const newUserInfo = {
                bio: "new bio coming soon"
            };
            return UsersService.updateUserById(db, idOfUserToUpdate, newUserInfo)
            .then(() => UsersService.getUserById(db, idOfUserToUpdate))
            .then(user => {
                expect(user).to.eql({
                    id: idOfUserToUpdate,
                    ...user,
                    bio: newUserInfo.bio
                })
            })
        })
    })

    context(`Given 'users' table has no data`, () => {
        beforeEach(() => db('users').truncate());

        it(`insertUser() inserts a new user and resolves the new user with an 'id'`, () => {
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

            return UsersService.insertUser(db, newUser)
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