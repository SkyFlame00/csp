const {db} = require('csp-app-api/main');

function confirmFriendReq(req, res) {
  const sql1 = 'INSERT INTO friends (user_1, user_2) VALUES ($1, $2)';
  const sql2 = 'DELETE FROM friends_requests WHERE (requester=$1 AND requestee=$2) OR (requester=$2 AND requestee=$1)';
  const params = [req.user.id, req.params.id];
  
  db.query(sql1, params)
    .then(() => db.query(sql2, params))
    .then(() => {
      res.json({ answer: true });
    })
  ;
}

module.exports = confirmFriendReq;