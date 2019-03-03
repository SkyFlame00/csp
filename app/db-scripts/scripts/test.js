const client = require('../connections/db');

function gett() {
  client.query('SELECT * FROM users WHERE login=$1 LIMIT 1', ['skyflame'])
    .then(res => console.log(res.rows))
    .catch(err => console.log(err));
}

module.exports = gett;