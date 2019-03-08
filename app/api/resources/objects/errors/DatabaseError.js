function DatabaseError(message) {
  Error.call(this);
  Error.captureStackTrace(this, Error);
  this.name = 'DatabaseError';
  this.message = message;
}

DatabaseError.prototype = Object.create(Error.prototype);

module.exports = DatabaseError;