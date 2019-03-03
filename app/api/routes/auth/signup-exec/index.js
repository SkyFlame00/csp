const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {MissingDataError} = require('csp-app-api/main').objects.errors;
const {expiresIn} = require('../common');

const saltRounds = 10;

const keysDir = path.resolve(__dirname, '../keys');
const privateKey = fs.readFileSync(`${keysDir}/private.key`, 'utf8');

function checkExistence(qRes) {
  if (qRes.rows.length > 0) {
    throw new Error('The user with the supplied login already exists');
  }

  return;
}

function hashPassword(password) {
  return bcrypt.hash(password, saltRounds);
}

function createToken(payload, expiresIn = '30d') {
  const options = {expiresIn: expiresIn, algorithm: 'HS256'};
  return jwt.sign(payload, privateKey, options);
}

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

  db.query('SELECT username FROM users WHERE username=$1 LIMIT 1', [username])
    .then(checkExistence)
    .then(hashPassword.bind(null, password))
    .then((hashedPassword) => {
      const sql = `
        INSERT INTO users(username, email, password)
        VALUES ($1, $2, $3)`;
      
      return db.query(sql, [username, email, hashedPassword])
    })
    .then(createToken.bind(null, {username: username}, expiresIn))
    .then((token) => {
      return res.json({
        success: true,
        data: {
          token: token
        }
      });
    })
    .catch((err) => {
      let answer = {success: false};

      if (err.name && err.message) {
        answer.error = {
          name: err.name,
          message: err.message
        };
      }
      else {
        answer.error = {
          name: 'Unrecognized error',
          message: err.toString()
        }
      }

      return res.json(answer);
    });
}

module.exports = signupExec;