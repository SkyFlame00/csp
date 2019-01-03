const pg = require('pg');
const connection = require('./config');

const client = new pg.Client(connection);
client.connect();

const createTableUsers = 
    `CREATE TABLE users (
        id serial PRIMARY KEY,
        login varchar(30),
        first_name varchar(30),
        last_name varchar(30),
        patronymic varchar(30),
        email varchar(50),
        password varchar(30)
    )`;

client.query(createTableUsers, (err, res) => {
    if (err)
        throw err;
    
    console.log('success');
});