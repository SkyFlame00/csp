const {db} = require('csp-app-api/main');

function begin() {
  return db.query('BEGIN');
}

function rollback(savepoint) {
  if (savepoint) {
    return db.query(`ROLLBACK TO ${savepoint}`);
  }

  return db.query('ROLLBACK');
}

function commit() {
  return db.query('COMMIT');
}

module.exports = {
  begin,
  rollback,
  commit
};