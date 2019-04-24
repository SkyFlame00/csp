const {db} = require('csp-app-api/main');
const {flat, toLocalTime} = require('csp-app-api/resources/functions');

db.query('select * from events order by id desc limit 1')
  .then(res => {
    console.log(res.rows)
  })