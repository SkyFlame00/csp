const {db} = require('csp-app-api/main');

function getAllUsersBase(req, res) {
  const sql = 'SELECT id, username, first_name, last_name, patronymic, email, verified FROM users';
  db.query(sql)
    .then(result => {
      res.json(result.rows);
    })
  ;
}

module.exports = getAllUsersBase;