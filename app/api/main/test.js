const db  = require('./db');

db.query('select * from users')
  .then(res => console.log(res.rows));