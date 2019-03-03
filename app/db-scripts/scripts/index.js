const createdb = require('./create-db');
const dropdb = require('./drop-db');
const init = require('./init');
const populate = require('./populate');
const test = require('./test');

module.exports = {
  createdb,
  dropdb,
  init,
  populate,
  test
};