const pg = require('pg');

const client = new pg.Client({
    user: 'skyflame',
    database: 'skyflame',
    password: '1234',
    host: 'localhost',
    port: 5432
});
client.connect();

const createDB = `CREATE DATABASE csp`;

client.query(createDB, (err, res) => {
    if (err)
        throw err;
    
    console.log('Database csp has been created succefully');
});