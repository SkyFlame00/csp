const {db} = require('csp-app-api/main');

function getAllFriendsBase(req, res) {
  const fields = 'users.id, username, first_name, last_name, patronymic, email, verified';
  const sql = `
    SELECT ${fields} FROM (
      (SELECT user_2 AS id FROM friends WHERE user_1=$1)
      UNION ALL
      (SELECT user_1 AS id FROM friends WHERE user_2=$1)
    ) AS friends_ids
    INNER JOIN
    users
    ON friends_ids.id=users.id
  `;

  db.query(sql, [req.user.id])
    .then(result => {
      res.json(result.rows);
    })
  ;
}

module.exports = getAllFriendsBase;