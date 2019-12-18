function makeEventsArray(){
    return [
        {
            organizer : 1,
            title : "Event 1 Title",
            event_purpose : "Singles Night",
            restaurant : "Sonora Town",
            address : "321 4th St, Los Angeles, CA 90003",
            date : new Date('10/31/1983'),
            time : "18:00:00",
            description : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.",
            singles_only : false, 
            date_created: new Date('10/31/2020')
        },
        {
            organizer : 3,
            title : "Event 2 Title",
            event_purpose : "Game Night",
            restaurant : "Button Mash",
            address : "123 2nd St, Los Angeles, CA 90001",
            date : new Date('10/31/1983'),
            time : "18:00:00",
            description : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.",
            singles_only : false, 
            date_created: new Date('10/31/2020')
        },
        {
            organizer : 1,
            title : "Event 3 Title",
            event_purpose : "Networking",
            restaurant : "Water Grill",
            address : "30923 Union Ave, Los Angeles, CA 90301",
            date : new Date('10/31/1983'),
            time : "18:00:00",
            description : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.",
            singles_only : false, 
            date_created: new Date('10/31/2020')
        },
    ];
}

module.exports = {
    makeEventsArray,
}