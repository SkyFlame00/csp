const {db} = require('csp-app-api/main');

function getUserBase(req, res) {
  const sql = 'SELECT username, first_name, last_name, patronymic, email, verified FROM users WHERE id=$1';
  console.log('req.params.id is ' + req.params.id)
  db.query(sql, [+req.params.id])
    .then(result => {
      res.json(result.rows[0] ? result.rows[0] : {});
    })
  ;
}

module.exports = getUserBase;