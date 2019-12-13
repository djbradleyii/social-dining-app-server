DROP TYPE IF EXISTS event_objective CASCADE;

CREATE TYPE event_objective AS ENUM(
    'Social',
    'Networking',
    'Game Night',
    'Singles Night'
);

CREATE TABLE events (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    organizer INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(50) NOT NULL,
    event_purpose event_objective NOT NULL,
    restaurant VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    description VARCHAR(255),
    singles_only BOOLEAN NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL
);