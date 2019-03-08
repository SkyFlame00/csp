function GeneralError(message, type) {
  Error.call(this);
  Error.captureStackTrace(this, Error);
  this.name = 'GeneralError';
  this.message = message;
  this.type = type;
}

GeneralError.prototype = Object.create(Error.prototype);

module.exports = GeneralError;