const {toLocalTime} = require('csp-app-api/resources/functions');

function getMyLocalTime(req, res) {
  return res.json({
    timestamp: (new Date())
  });
}

module.exports = getMyLocalTime;