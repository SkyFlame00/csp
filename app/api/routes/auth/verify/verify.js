const {db} = require('csp-app-api/main');
const {MissingDataError, GeneralError} = require('csp-app-api/main').objects.errors;
const {getSQLStrings} = require('csp-app-api/main').functions;
const {catchError} = require('../common');

const sql = getSQLStrings(__dirname + '/sql');

function verify(req, res) {
  const {id, token} = req.query;

  try {
    if (!id) {
      throw new MissingDataError('You have not supplied username');
    }

    if (!token) {
      throw new MissingDataError('You have not supplied token');
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

  db.query(sql.getVerifiedByUserId, [id])
    .then((res) => {
      if (!res.rows[0])
        throw new GeneralError('User with the specified id does not exist', 'no_user');
      
      if (res.rows[0].verified)
        throw new GeneralError('User has already been verified', 'verified');
      
      return db.query(sql.getVTRecord, [id]);
    })
    .then((res) => {
      if (!res.rows[0]) 
        throw new GeneralError('No verification token was found for this user_id', 'no_token');
      
      if (token != res.rows[0].token)
        throw new GeneralError('Tokens do not match', 'no_match');
      
      const expiresAt = res.rows[0]['expires_at'].getTime();

      if (Date.now() > expiresAt)
        throw new GeneralError('Token has been expired', 'expired');
      
      return db.query(sql.verifyUser, [id]);
    })
    .then(() => res.json({ success: true }))
    .catch(catchError.bind(null, res))
  ;
}

module.exports = verify;