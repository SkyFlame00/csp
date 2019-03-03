function AuthenticationError(message) {
  Error.call(this);
  Error.captureStackTrace(this, Error);
  this.name = 'AuthenticationError';
  this.message = message;
}

AuthenticationError.prototype = Object.create(Error.prototype);

module.exports = AuthenticationError;