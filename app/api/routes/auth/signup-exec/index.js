const {db} = require('csp-app-api/main');
const {MissingDataError, DatabaseError} = require('csp-app-api/main').objects.errors;
const {
  expirations,
  hashPassword,
  createToken,
  sendToken,
  catchError,
  checkExistence,
  createVerificationToken,
  sql
} = require('../common');
const {generalTransporter: transporter} = require('csp-app-api/main').objects.mail;
const {transactions} = require('csp-app-api/main').functions.queries;
const {location} = require('csp-app-api/main');

function insertVerificationToken(verificationToken, userId) {
  const expiresAt = new Date(Date.now() + expirations.verificaiton);
  return db.query(sql.insertVerificationToken, [userId, verificationToken, expiresAt]);
}

function sendVerificationMsg(email, verificationToken, userId) {
  const link = `${location}/signup/verify?id=${userId}&token=${verificationToken}`;

  return transporter.sendMail({
    from: 'CSP Notification Service t.a.s.98@ya.ru',
    to: email,
    subject: 'Confirm your registration',
    html: `<b>Please, follow this link to activate your account:</b> <a href="${link}">${link}</a>`
  });
}

function signupExec(req, res) {
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

  const userRegisteredPromise = db.query(sql.getUsernameByUsername, [username])
    .then(checkExistence)
    .then(transactions.begin)
    .then(hashPassword.bind(null, password))
    .then(hashedPwd => db.query(sql.insertUser, [username, email, hashedPwd]))
  ;
  
  const authTokenCreatedPromise = userRegisteredPromise
    .then(createToken.bind(null, {username: username}, expirations.auth))
  ;

  const verificationToken = createVerificationToken();

  const getUserIdPromise = userRegisteredPromise
    .then(() => db.query(sql.getUserIdByUsername, [username]))
    .then((res) => {
      if (!res.rows[0])
        throw new DatabaseError('Cannot fetch user id with the supplied username');
      
      return res.rows[0].id;
    })
  ;

  const insertVTPromise = getUserIdPromise
    .then(insertVerificationToken.bind(null, verificationToken))
  ;

  const emailSentPromise = Promise.all([getUserIdPromise, insertVTPromise])
    .then(arr => arr[0])
    .then(sendVerificationMsg.bind(null, email, verificationToken))
  ;

  Promise.all([authTokenCreatedPromise, emailSentPromise])
    .then(array => array[0])
    .then(sendToken.bind(null, res))  
    .then(transactions.commit)
    .catch(err => {
      transactions.rollback();
      catchError(res, err);
    })
  ;
}

module.exports = signupExec;