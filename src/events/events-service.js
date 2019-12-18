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
            .then(([event]) => {
                return event
            })
    },
    getEventById(knex, id){
        return knex
            .from('events')
            .select('*')
            .where('id',id)
            .first()
    },
    getAllAttendeesByEventId(knex, event_id){
        return knex
            .from('attendees')
            .select('*')
            .where('id',event_id)
    },
    deleteEvent(knex, id){
        return knex('events')
            .where({id})
            .delete()
    },
    updateEventById(knex, id, eventUpdates){
        return knex('events')
            .where({ id })
            .update(eventUpdates)
    },
    getEventByKeyword(knex, keyword){
        return knex('events')
            .where('title', 'like', `%${keyword}%`)
    }
};

module.exports = EventsService;