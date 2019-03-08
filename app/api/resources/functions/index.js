const extractBearerToken = require('./extract-bearer-token');
const returnError = require('./return-error');
const queries = require('./queries');
const getSQLStrings = require('./getSQLStrings');

module.exports = {
  extractBearerToken,
  returnError,
  queries,
  getSQLStrings
};