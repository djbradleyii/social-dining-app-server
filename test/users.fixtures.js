function makeUsersArray(){
    return [
        {
            id: 1,
            fname : "Rick",
            lname : "Mcqueeney",
            dob : '1919-12-22T16:28:32.615Z',
            email : "rmcqueeney@gmail.com",
            password : "password1",
            marital_status : "Married",
            occupation : "Marketing",
            gender : "Male",
            bio : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.", 
            date_created: '1919-12-22T16:28:32.615Z'
        },
        {
            id: 2,
            fname : "Summer",
            lname : "Lane",
            dob : '1919-12-22T16:28:32.615Z',
            email : "slane@gmail.com",
            password : "password2",
            marital_status : "Married",
            occupation : "Fashion Designer",
            gender : "Female",
            bio : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.", 
            date_created: '1919-12-22T16:28:32.615Z'
        },
        {
            id: 3,
            fname : "Larry",
            lname : "Savage",
            dob : '1919-12-22T16:28:32.615Z',
            email : "lsavage@aol.com",
            password : "password3",
            marital_status : "Widow",
            occupation : "Construction",
            gender : "Male",
            bio : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.", 
            date_created: '1919-12-22T16:28:32.615Z'
        },
    ];
}

module.exports = {
    makeUsersArray,
}