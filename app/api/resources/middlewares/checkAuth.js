const jwt = require('jsonwebtoken');
const {privateKey} = require('csp-app-api/resources/keys');
const {extractBearerToken, returnError} = require('csp-app-api/main').functions;
const {db} = require('csp-app-api/main');

const checkAuth = function(req, res, next) {
  let token;
  let payload;

  try {
    token = extractBearerToken(req.headers['authorization']);
    payload = jwt.verify(token, privateKey);
  }
  catch (err) {
    return returnError(res, err);
  }

  db.query('SELECT username FROM users WHERE id=$1', [payload.userId])
    .then((res) => {
      if (res.rows.length == 0)
        throw new Error('User with the specified id does not exist');
      
      req.user = { id: payload.userId };
      next();
    })
    .catch(returnError.bind(null, res));
};

module.exports = checkAuth;