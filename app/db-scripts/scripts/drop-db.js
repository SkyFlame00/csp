const client = require('../connections/default-db');

function dropDb() {
  client.query(`DROP DATABASE csp`)
    .then(res => console.log('Database csp has been dropped'))
    .catch(err => console.log(err));
}

module.exports = dropDb;