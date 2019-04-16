const {db} = require('csp-app-api/main');

function getAllIncomingRequests(req, res) {
  const fields = 'users.id, username, first_name, last_name, patronymic, email, verified';
  const sql = `
    SELECT ${fields} FROM
    (SELECT requester AS id FROM friends_requests WHERE requestee=$1) AS requesters
    INNER JOIN
    users
    ON requesters.id=users.id
  `;

  db.query(sql, [req.user.id])
    .then(result => {
      res.json(result.rows);
    })
  ;
}

module.exports = getAllIncomingRequests;