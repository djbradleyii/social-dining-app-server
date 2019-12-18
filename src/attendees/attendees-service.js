const AttendeesService = {
    getAllAttendees(knex){
        return knex.select('*')
            .from('attendees')
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
    getAllEventsByUserId(knex, user_id){
        return knex
            .from('attendees')
            .select('*')
            .where('user_id',user_id)
    },
    getAllAttendeesByEventId(knex, user_id, event_id){
        return knex
            .from('attendees')
            .select('*')
            .where('user_id',user_id).andWhere('event_id', event_id)
            .first()
    },
    deleteAttendeeByAttendeeId(knex, attendee_id){
        return knex('attendees')
        .where('id', attendee_id)
        .delete()
    }
};

module.exports = AttendeesService;