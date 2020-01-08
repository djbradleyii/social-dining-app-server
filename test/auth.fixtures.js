const bcrypt = require('bcryptjs');

function makeUsersArray() {
  return [
    {
      id: 1,
      fname: 'Rick',
      lname: 'Mcqueeney',
      dob: '10/10/1980',
      email: 'rmcqueeney@gmail.com',
      password: 'Password1!',
      marital_status: 'Married',
      occupation: 'Marketing',
      gender: 'Male',
      bio: 'Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.',
      date_created: '10/10/1980',
    },
    {
      id: 2,
      fname: 'Summer',
      lname: 'Lane',
      dob: '10/10/1980',
      email: 'slane@gmail.com',
      password: 'Password2!',
      marital_status: 'Married',
      occupation: 'Fashion Designer',
      gender: 'Female',
      bio: 'Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.',
      date_created: '10/10/1980',
    },
    {
      id: 3,
      fname: 'Larry',
      lname: 'Savage',
      dob: '10/10/1980',
      email: 'lsavage@aol.com',
      password: 'Password3!',
      marital_status: 'Widow',
      occupation: 'Construction',
      gender: 'Male',
      bio: 'Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.',
      date_created: '10/10/1980',
    },
  ];
}

function seedUsers(users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 12),
  }));
  return preppedUsers;
}

module.exports = {
  makeUsersArray,
  seedUsers,
};
