const bcrypt = require('bcrypt');
const {
  createToken,
  expiresIn,
  returnToken,
  catchError
} = require('../common');
const {AuthenticationError} = require('csp-app-api/main').objects.errors;

const login = function(db, req, res) {
  const {username, password} = req.body;
  const sql = 'SELECT id, password FROM users WHERE username=$1';

  db.query(sql, [username])
    .then((res) => {
      if (res.rows.length === 0)
        throw new AuthenticationError('User with the supplied username does not exist');

      // May be better to use external variable instead of doing nested promise
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
    .then(createToken.bind(null, {username: username}, expiresIn))
    .then(returnToken.bind(null, res))
    .catch(catchError.bind(null, res));
};

module.exports = login;