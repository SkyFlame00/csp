const {db} = require('csp-app-api/main');
const {flat, toLocalTime} = require('csp-app-api/resources/functions');

// db.query('select * from events limit 5')
//   .then(res => {
//     console.log(toLocalTime(new Date(res.rows[0].date)));
//   })

const d = toLocalTime(new Date());
const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9);

console.log(dd)
console.log(dd.getDate());
console.log(new Date().getDate())