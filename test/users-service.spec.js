require('dotenv').config();
const knex = require('knex');
const UsersService = require('../src/users-service');

describe(`Users service object`, function() {
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
        }];

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    });

    before(() => db('users').truncate());

    afterEach(() => db('users').truncate());

    after(() => db.destroy());

    context(`Given 'users' has data`, () => {
        before(() => {
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
    })
  })