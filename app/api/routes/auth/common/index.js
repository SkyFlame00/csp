const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const {AuthenticationError} = require('csp-app-api/main').objects.errors;
const {privateKey} = require('csp-app-api/main').keys;

const saltRounds = 10;

const expirationsAuth = '30d';

function hashPassword(password) {
  return bcrypt.hash(password, saltRounds);
}

function createToken(payload, expiresIn=expirationsAuth, id) {
  const options = {expiresIn: expiresIn, algorithm: 'HS256'};
  return jwt.sign(Object.assign(payload, {userId: id}), privateKey, options);
}

function sendToken(res, token) {
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

  if (err.type) {
    answer.error.type = err.type;
  }

  res.json(answer);
}

function checkExistence(qRes) {
  if (qRes.rows.length > 0) {
    throw new AuthenticationError('The user with the supplied login already exists');
  }

  return;
}

function createVerificationToken() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = {
  expirations: {
    auth: expirationsAuth,
    verificaiton: 1000*60*60*24
  },
  hashPassword,
  createToken,
  sendToken,
  catchError,
  checkExistence,
  createVerificationToken,
  sql: require('./sql')
};