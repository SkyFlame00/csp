const bcrypt = require('bcrypt');
const {
  createToken,
  expirations,
  sendToken,
  catchError
} = require('../common');
const {AuthenticationError} = require('csp-app-api/main').objects.errors;
const {db} = require('csp-app-api/main');

const login = function(req, res) {
  console.log('body: ',req.body)
  const {username, password} = req.body;
  const sql = 'SELECT id, password FROM users WHERE username=$1';

  db.query(sql, [username])
    .then((res) => {
      if (res.rows.length === 0)
        throw new AuthenticationError('User with the supplied username does not exist');

      // Redo it somehow so there is no nested promise any more
      return new Promise((resolve, reject) => {
        bcrypt.compare(password, res.rows[0].password)
          .then(passwordMatch => resolve({
            passwordMatch: passwordMatch,
            userId: res.rows[0].id
          }))
          .catch(err => reject(err));
      });
    })
    .then((res) => {
      if (!res.passwordMatch)
        throw new AuthenticationError('Supplied password is not correct');
      
      return res.userId;
    })
    .then(createToken.bind(null, {username: username}, expirations.auth))
    .then(sendToken.bind(null, res))
    .catch(catchError.bind(null, res));
};

module.exports = login;