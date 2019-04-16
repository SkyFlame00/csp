const {db} = require('csp-app-api/main');

function meFriendWith(req, res) {
  const sql = 'SELECT * FROM friends WHERE (user_1=$1 AND user_2=$2) OR (user_1=$2 AND user_2=$1)';
  
  db.query(sql, [req.user.id, req.params.id])
    .then(result => {
      if (result.rows.length > 0) {
        res.json({answer: true});
      }
      else {
        res.json({answer: false});
      }
    })
  ;
}

module.exports = meFriendWith;