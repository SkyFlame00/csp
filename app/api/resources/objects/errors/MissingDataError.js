function MissingDataError(message) {
  Error.call(this, message);
  Error.captureStackTrace(this, MissingDataError);
  this.name = 'MissingDataError';
  this.message = message;
}

MissingDataError.prototype = Object.create(Error.prototype);

module.exports = MissingDataError;
