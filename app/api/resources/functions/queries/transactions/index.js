const db = require('csp-app-api/main/db');
// const controller = require('csp-app-api/main');
// console.log('controller: ', controller)
// const db = controller.db

// console.log('db: ', db)

function begin() {
  return db.query('BEGIN');
}

function rollback(savepoint) {
  // console.log(db)

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