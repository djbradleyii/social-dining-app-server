const AttendeesService = {
    getAllAttendees(knex){
        return knex.select('*')
            .from('attendees')
    },
    getAllAttendeesNames(knex){
        /* Get All Attendees with user names */
        /* Not Used Yet */
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
    getAttendeeById(knex, attendee_id){
        return knex
            .from('attendees')
            .select('*')
            .where('id', attendee_id)
            .first()
    },
    getAttendeeInfoById(knex, user_id){
        return knex.raw(`
        select distinct users.fname as first_name, users.lname as last_name, users.marital_status, users.occupation, users.bio
        from 
        users
        join
        attendees
        on users.id = attendees.user_id
        where attendees.user_id = ${user_id}`)
            .then(res => {
                return res.rows[0]
            })
    },
    deleteAttendee(knex, user_id, event_id){
        return knex('attendees')
        .where({user_id, event_id})
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