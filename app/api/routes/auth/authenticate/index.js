const jwt = require('jsonwebtoken');
const {privateKey} = require('csp-app-api/main').keys;
const {catchError} = require('../common');

function authenticate(req, res) {
  try {
    const data = jwt.verify(req.body.token, privateKey);
    return res.json({
      success: true,
      data
    });
  }
  catch (err) {
    return catchError(res, err);
  }
}

module.exports = authenticate;