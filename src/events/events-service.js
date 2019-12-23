const EventsService = {
    getAllEvents(knex){
        return knex.select('*')
            .from('events')
            .orderBy('date', 'desc')
    },
    getEventById(knex, event_id){
        return knex
            .from('events')
            .select('*')
            .where('id', event_id)
            .first()
    },
    getEventByKeyword(knex, keyword){
        /* Get event by keyword search; Used by Search Component on Client */
        return knex.raw(`select * from events where (title || address || restaurant || event_purpose || description) like '%${keyword}%'`)
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