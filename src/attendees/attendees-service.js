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
            .then(rows => {
                return rows[0]
            })
    },
    getAttendeeById(knex, id){
        return knex
            .from('attendees')
            .select('*')
            .where('id',id)
            .first()
    },
    deleteAttendee(knex, id){
        return knex('attendees')
            .where({id})
            .delete()
    }
};

module.exports = AttendeesService;