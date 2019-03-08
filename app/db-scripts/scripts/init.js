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
      id serial NOT NULL,
      user_id integer NOT NULL,
      token varchar(16) NOT NULL,
      created_at timestamp NOT NULL,
      PRIMARY KEY (id, user_id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`;

  client.query(createUsers)
    .then(res => client.query(createVerificationTokens))
    .then(res => console.log('Initialization has been completed'))
    .catch(err => console.log(err));
}

module.exports = init;