const EventsService = {
    getAllEvents(knex){
        return knex.select('*')
            .from('events')
            .orderBy('date', 'desc')
    },
    getEventById(knex, id){
        return knex
            .from('events')
            .select('*')
            .where('id',id)
            .first()
    },
    getEventByKeyword(knex, keyword){
        /* Get event by keyword search; Used by Search Component on Client */
        return knex.raw(`select * from events where (title || address || restaurant || event_purpose || description) like '%${keyword}%'`)
            .then(res => {
                return res.rows
            })
    },
    getAllEventsByUserId(knex, user_id){
        /* Get's all of the events that the User is scheduled to attend for Dashboard on client */
        return knex.raw(`select * from attendees inner join events on attendees.event_id = events.id inner join users on attendees.user_id = users.id where users.id = ${user_id}`)
            .then(res => {
                return res.rows
            })
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
    insertEvent(knex, newEvent){
        return knex
            .insert(newEvent)
            .into('events')
            .returning('*')
            .then(([event]) => {
                return event
            })
    },
};

module.exports = EventsService;