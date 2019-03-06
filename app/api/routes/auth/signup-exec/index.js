const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {MissingDataError} = require('csp-app-api/main').objects.errors;
const {
  expiresIn,
  hashPassword,
  createToken,
  returnToken,
  catchError,
  checkExistence
} = require('../common');
const {generalTransporter: transporter} = require('csp-app-api/main').objects.mail;
const {transactions} = require('csp-app-api/main').functions.queries;

// const saltRounds = 10;

// const keysDir = path.resolve(__dirname, '../keys');
// const privateKey = fs.readFileSync(`${keysDir}/private.key`, 'utf8');

// function hashPassword(password) {
//   return bcrypt.hash(password, saltRounds);
// }

// function createToken(payload, expiresIn = '30d') {
//   const options = {expiresIn: expiresIn, algorithm: 'HS256'};
//   return jwt.sign(payload, privateKey, options);
// }

function signupExec(db, req, res) {
  const {
    username,
    email,
    password
  } = req.body;

  try {
    if (!username) {
      throw new MissingDataError('Field \'username\' is not supplied');
    }

    if (!email) {
      throw new MissingDataError('Field \'email\' is not supplied');
    }

    if (!password) {
      throw new MissingDataError('Field \'password\' is not supplied');
    }
  }
  catch (err) {
    return res.json({
      success: false,
      error: {
        name: err.name,
        message: err.message
      }
    });
  }

  const userRegisteredPromise = db.query('SELECT username FROM users WHERE username=$1 LIMIT 1', [username])
    .then(checkExistence)
    .then(transactions.begin)
    .then(hashPassword.bind(null, password))
    .then((hashedPassword) => {
      const sql = `
        INSERT INTO users(username, email, password)
        VALUES ($1, $2, $3)`;
      
      return db.query(sql, [username, email, hashedPassword])
    })
  ;
  
  const tokenCreatedPromise = userRegisteredPromise
    .then(createToken.bind(null, {username: username}, expiresIn))
  ;

  const emailSentPromise = userRegisteredPromise
    .then(() => {
      return transporter.sendMail({
        from: 'CSP Notification Service t.a.s.98@ya.ru',
        to: email,
        subject: 'Confirm your registration',
        html: ''
      });
    })
  ;

  Promise.all([tokenCreatedPromise, emailSentPromise])
    .then(transactions.commit)
    .then(returnToken.bind(null, res))
    .catch(err => {
      transactions.rollback();
      catchError(res, err);
    })
  ;
}

module.exports = signupExec;