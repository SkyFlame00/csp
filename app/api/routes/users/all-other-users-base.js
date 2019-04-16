const {db} = require('csp-app-api/main');

function getAllOtherUsersBase(req, res) {
  const sql = 'SELECT id, username, first_name, last_name, patronymic, email, verified FROM users WHERE id<>$1';
  db.query(sql, [req.user.id])
    .then(result => {
      res.json(result.rows);
    })
  ;
}

module.exports = getAllOtherUsersBase;