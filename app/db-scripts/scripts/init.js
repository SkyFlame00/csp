const client = require('../connections/db');

function init() {
  const createUsers = 
    `CREATE TABLE users (
      id serial PRIMARY KEY,
      login varchar(30),
      first_name varchar(30),
      last_name varchar(30),
      patronymic varchar(30),
      email varchar(50),
      password varchar(60)
    )`;

  const createVerificationTokens =
    `CREATE TABLE verificationTokens (
      id serial PRIMARY KEY,
      user_id integer NOT NULL,
      token varchar(16) NOT NULL,
      created_at timestamp NOT NULL,
      PRIMARY KEY (id, user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`;
  
  const createFriends = 
    `CREATE TABLE friends (
      id serial PRIMARY KEY,
      user_1 integer NOT NULL,
      user_2 integer NOT NULL,
      CONSTRAINT friends_pair UNIQUE(user_1, user_2),
      FOREIGN KEY (user_1) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user_2) REFERENCES users(id) ON DELETE CASCADE
    )`;
  
  const createFriendsRequests = 
    `CREATE TABLE friends_requests(
      id serial PRIMARY KEY,
      requester integer NOT NULL,
      requestee integer NOT NULL,
      FOREIGN KEY (requester) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (requestee) REFERENCES users(id) ON DELETE CASCADE
    )`;

  const createEvents = 
    `CREATE TABLE events(
      id serial PRIMARY KEY,
      title varchar(100),
      description text,
      date date,
      time_from timestamp,
      time_to timestamp,
      link varchar(200),
      category integer,
      project_id integer,
      importance char(3),
      FOREIGN KEY (category) REFERENCES categories(id) ON DELETE CASCADE
    )`;

  const createEventsParticipants = 
    `CREATE TABLE events_participants(
      id serial PRIMARY KEY,
      event_id integer REFERENCES events(id) ON DELETE CASCADE,
      user_id integer REFERENCES users(id) ON DELETE CASCADE
    )`;

  const createCategories =
    `CREATE TABLE categories(
      id serial PRIMARY KEY,
      name varchar(50),
      color_rgb varchar(20)
    )`;

  client.query(createUsers)
    .then(res => client.query(createVerificationTokens))
    .then(res => client.query(createFriends))
    .then(res => client.query(createFriendsRequests))
    .then(res => client.query(createEvents))
    .then(res => client.query(createEventsParticipants))
    .then(() => client.query(createCategories))
    .then(res => console.log('Initialization has been completed'))
    .catch(err => console.log(err));
}

module.exports = init;