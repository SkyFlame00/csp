const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;
const keysDir = path.resolve(__dirname, '../keys');
const privateKey = fs.readFileSync(`${keysDir}/private.key`, 'utf8');

function hashPassword(password) {
  return bcrypt.hash(password, saltRounds);
}

function createToken(payload, expiresIn = '30d', id) {
  const options = {expiresIn: expiresIn, algorithm: 'HS256'};
  return jwt.sign(Object.assign(payload, {userId: id}), privateKey, options);
}

function returnToken(res, token) {
  res.json({
    success: true,
    data: {
      token: token
    }
  });
}

function catchError(res, err) {
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

  res.json(answer);
}

function checkExistence(qRes) {
  if (qRes.rows.length > 0) {
    throw new Error('The user with the supplied login already exists');
  }

  return;
}

module.exports = {
  hashPassword,
  createToken,
  expiresIn: '30d',
  returnToken,
  catchError,
  checkExistence
};