const pg = require('pg');
const connection = require('./config');

const client = new pg.Client(connection);
client.connect();

client.query('SELECT * FROM users', (err, res) => {
    if (err)
        throw err;
    
    console.log(res.rows);
});