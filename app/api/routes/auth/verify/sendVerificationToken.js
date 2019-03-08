const {db} = require('csp-app-api/main');
const {GeneralError} = require('csp-app-api/main').objects.errors;
const {generalTransporter: transporter} = require('csp-app-api/main').objects.mail;
const {catchError, createVerificationToken, expirations} = require('../common');
const {location} = require('csp-app-api/main');

function sendVerificationToken(req, res) {
  if (!(req.user && req.user.id))
    throw new GeneralError('You have not logged in under user with the specified id', 'not_authenticated');

  const actualUserId = +req.user.id;
  const userId = +req.query.id;

  if (actualUserId != userId)
    return catchError(res, new GeneralError('User id under which you logged in is different from that you specified', 'wrong_credentials'));

  const verificationToken = createVerificationToken();

  const getUserInfoPromise = db.query('SELECT username, email, verified FROM users WHERE id=$1', [userId])
    
  const updateVTPromise = getUserInfoPromise
    .then((res) => {
      if (res.rows.length == 0)
        throw new GeneralError('No user found with the supplied id', 'no_user');
      
      if (res.rows[0].verified)
        throw new GeneralError('You have already been verified', 'verified');
      
      const expiresAt = new Date(Date.now() + expirations.verificaiton);

      return db.query('UPDATE verificationTokens SET token=$1, expires_at=$2 WHERE user_id=$3', [verificationToken, expiresAt, userId]);
    })

  Promise.all([getUserInfoPromise, updateVTPromise])
    .then(arr => arr[0].rows[0].email)
    .then((email) => {
      const link = `${location}/signup/verify?id=${userId}&token=${verificationToken}`;

      return transporter.sendMail({
        from: 'CSP Notification Service t.a.s.98@ya.ru',
        to: email,
        subject: 'Confirm your registration',
        html: `<b>Please, follow this link to activate your account:</b> <a href="${link}">${link}</a>`
      });
    })
    .then(() => res.json({ success: true }))
    .catch(catchError.bind(null, res))
  ;
}

module.exports = sendVerificationToken;