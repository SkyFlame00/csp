const pg = require('pg');

const db = new pg.Pool({
  user: 'skyflame',
  database: 'csp',
  password: '1234',
  host: 'localhost',
  port: 5432
});

db.connect();

module.exports = db;