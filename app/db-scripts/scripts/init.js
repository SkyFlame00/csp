const client = require('../connections/db');

function init() {
  const sql = 
    `CREATE TABLE users (
      id serial PRIMARY KEY,
      login varchar(30),
      first_name varchar(30),
      last_name varchar(30),
      patronymic varchar(30),
      email varchar(50),
      password varchar(60)
    )`;

  client.query(sql)
    .then(res => console.log('Inititalized'))
    .catch(err => console.log(err));
}

module.exports = init;