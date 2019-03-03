const client = require('../connections/default-db');

function createDb() {
  client.query(`CREATE DATABASE csp`)
    .then(res => console.log('Database csp has been created'))
    .catch(err => console.log(err));
}

module.exports = createDb;