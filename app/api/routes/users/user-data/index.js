const {db} = require('csp-app-api/main');

function userData(req, res) {
  db.query('select * from users where id=$1', [req.user.id])
  .then(result => {
    return res.json({
      success: true,
      data: {
        user: result.rows[0]
      }
    });
  });
}

module.exports = userData;