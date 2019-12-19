const AttendeesService = {
    getAllAttendees(knex){
        return knex.select('*')
            .from('attendees')
    },
    getAllAttendeesNames(knex){
        /* Get All Attendees with user names */
        return knex.raw(`
                select distinct users.fname as Attendee
                from
                attendees
                join
                users on users.id = attendees.user_id`)
            .then(res => {
                return res.rows
            })
    },
    getAllAttendeesByEventId(knex, event_id){
        /* Get all attendees for a specific event */
        return knex.raw(`
                    select users.id as user_id, events.id as event_id, events.title, users.fname as attendee
                    from
                    events
                    inner join
                    attendees
                    on attendees.event_id = events.id
                    inner join
                    users
                    on users.id = attendees.user_id
                    where events.id = ${event_id}`)
            .then(res => {
                return res.rows
            })
    },
    getAttendeesCountByEventId(knex, event_id){
        return knex.raw(`
                    select count(distinct attendees.user_id) as "Attendee_Count"
                    from
                    events
                    inner join
                    attendees
                    on attendees.event_id = events.id
                    inner join
                    users
                    on users.id = attendees.user_id
                    where events.id = ${event_id}`)
            .then(res => {
                return res.rows
            })
    },
    deleteAttendeeFromEvent(knex, user_id, event_id ){
        return knex('attendees')
        .where({
            user_id: user_id,
            event_id: event_id
        })
        .delete()
    },
    insertAttendee(knex, newAttendee){
        return knex
            .insert(newAttendee)
            .into('attendees')
            .returning('*')
            .then(([rows]) => {
                return rows
            })
    },
};

module.exports = AttendeesService;