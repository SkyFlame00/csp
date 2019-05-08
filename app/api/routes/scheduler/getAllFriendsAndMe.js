const {db} = require('csp-app-api/main');

function getAllFriendsAndMe(req, res) {
  const sql = `
    SELECT users.id AS user_id, username, first_name, last_name FROM (
      (SELECT user_2 AS id FROM friends WHERE user_1=$1)
      UNION ALL
      (SELECT user_1 AS id FROM friends WHERE user_2=$1)
      UNION ALL
      (SELECT id FROM users WHERE id=$1)
    ) AS friends_ids
    INNER JOIN
    users
    ON friends_ids.id=users.id
  `;

  db.query(sql, [req.user.id])
    .then(result => {
      const participants = result.rows.map(p => {
        p.you = p['user_id'] === req.user.id;
        return p;
      });

      res.json( participants );
    })
  ;
}

module.exports = getAllFriendsAndMe;