const EventsService = {
    getAllEvents(knex){
        return knex.select('*')
            .from('events')
    },
    insertEvent(knex, newEvent){
        return knex
            .insert(newEvent)
            .into('events')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getEventById(knex, id){
        return knex
            .from('events')
            .select('*')
            .where('id',id)
            .first()
    },
    deleteEvent(knex, id){
        return knex('events')
            .where({id})
            .delete()
    },
    updateEventInfo(knex, id, eventUpdates){
        return knex('events')
            .where({ id })
            .update(eventUpdates)
    }
};

module.exports = EventsService;