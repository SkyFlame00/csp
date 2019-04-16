const {db} = require('csp-app-api/main');

function meSentFriendReq(req, res) {
  const sql = 'SELECT * FROM friends_requests WHERE (requester=$1 AND requestee=$2) OR (requester=$2 AND requestee=$1)';
  
  db.query(sql, [req.user.id, req.params.id])
    .then(result => {
      if (result.rows.length === 0) {
        return res.json({ requested: false });
      }

      return res.json({
        requested: true,
        amRequester: result.rows[0].requester === req.user.id
      });
    })
  ;
}

module.exports = meSentFriendReq;