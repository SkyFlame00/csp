const {db} = require('csp-app-api/main');
const {flat, toLocalTime} = require('csp-app-api/resources/functions');

// const dd = toLocalTime(new Date());
const dd = new Date();

console.log(dd);

db.query('insert into events (time_from) values ($1)', [dd])
