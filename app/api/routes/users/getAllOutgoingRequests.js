const {db} = require('csp-app-api/main');

function getAllOutgoingRequests(req, res) {
  const fields = 'users.id, username, first_name, last_name, patronymic, email, verified';
  const sql = `
    SELECT ${fields} FROM
    (SELECT requestee AS id FROM friends_requests WHERE requester=$1) AS requestees
    INNER JOIN
    users
    ON requestees.id=users.id
  `;

  db.query(sql, [req.user.id])
    .then(result => {
      res.json(result.rows);
    })
  ;
}

module.exports = getAllOutgoingRequests;