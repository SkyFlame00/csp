const {db} = require('csp-app-api/main');

function sendFriendReq(req, res) {
  const sql = 'INSERT INTO friends_requests (requester, requestee) VALUES ($1, $2)';
  
  db.query(sql, [req.user.id, req.params.id])
    .then(result => {
      res.json({ answer: true });
    })
  ;
}

module.exports = sendFriendReq;