const pg = require('pg');
const connection = require('./config');

const client = new pg.Client({
    user: 'Anton',
    database: 'postgres',
    password: '',
    host: 'localhost',
    port: 5432
});
client.connect();

const dropDB = `DROP DATABASE csp`;

client.query(dropDB, (err, res) => {
    if (err)
        throw err;
    
    console.log('Database csp has been dropped successfully');
});