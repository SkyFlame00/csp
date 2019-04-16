const {db} = require('csp-app-api/main');

function removeFromFriends(req, res) {
  const sql = `DELETE FROM friends WHERE (user_1=$1 AND user_2=$2) OR (user_1=$2 AND user_2=$1)`;

  db.query(sql, [req.user.id, req.params.id])
    .then(() => {
      res.json({ answer: true });
    })
  ;
}

module.exports = removeFromFriends;