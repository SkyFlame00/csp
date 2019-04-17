const {db} = require('csp-app-api/main');

const today = new Date();

const timeFrom = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
const timeTo = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15);

const sql = `
  insert into events(title, date, time_from, time_to) values ('event #1', $1, $2, $3);
`;

db.query(sql, [today, timeFrom, timeTo])
  .then(res => {
    console.log('success')
    console.log(res)
  })