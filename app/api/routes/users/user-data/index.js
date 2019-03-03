const {db} = require('csp-app-api/main');

function userData(req, res) {
  console.log(req.user)
  return res.json({
    success: true,
    data: {
      user: {
        id: req.user.id
      }
    }
  });
}

module.exports = userData;