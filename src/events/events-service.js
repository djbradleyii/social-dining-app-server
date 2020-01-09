const EventsService = {
  getAllEvents(knex) {
    return knex.select('events.id', 'events.organizer', 'events.title', 'events.event_purpose', 'events.restaurant', 'events.address', 'events.date', 'events.time', 'events.description', 'events.singles_only', 'users.fname')
      .from('events')
      .join('users', 'events.organizer', '=', 'users.id')
      .orderBy('date', 'desc');
  },
  getEventById(knex, event_id) {
    return knex
      .select('events.id', 'events.organizer', 'events.title', 'events.event_purpose', 'events.restaurant', 'events.address', 'events.date', 'events.time', 'events.description', 'events.singles_only', 'users.fname')
      .from('events')
      .join('users', 'events.organizer', '=', 'users.id')
      .where('events.id', event_id)
      .first();
  },
  getEventByKeyword(knex, keyword) {
    /* Get event by keyword search; Used by Search Component on Client */
    return knex.raw(`select events.id, events.organizer, events.title, events.event_purpose, events.restaurant, events.address, events.date, events.time, events.description, events.singles_only, users.fname
        from events
        join
        users on events.organizer = users.id
        where (title || address || restaurant || event_purpose || description) ILIKE '%${keyword}%'`)
      .then((res) => res.rows);
  },
  getAllAttendeesByEventId(knex, event_id) {
    /* Get all attendees for a specific event */
    return knex.raw(`
                    select users.id as user_id, events.id as event_id, events.organizer, users.fname as first_name, users.lname as last_name, users.marital_status, users.occupation, users.bio
                    from
                    events
                    inner join
                    attendees
                    on attendees.event_id = events.id
                    inner join
                    users
                    on users.id = attendees.user_id
                    where events.id = ${event_id}`)
      .then((res) => res.rows);
  },
  deleteEvent(knex, event_id) {
    return knex('events')
      .where({ id: event_id })
      .delete();
  },
  updateEventById(knex, event_id, eventUpdates) {
    return knex('events')
      .where({ id: event_id })
      .update(eventUpdates);
  },
  insertEvent(knex, newEvent) {
    return knex
      .insert(newEvent)
      .into('events')
      .returning('*')
      .then(([event]) => event);
  },
};

module.exports = EventsService;
