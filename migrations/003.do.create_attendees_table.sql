CREATE TABLE attendees (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, event_id)
);