const db = require(`${__dirname}/db`);
const errors = require('csp-app-api/resources/objects/errors');

const controller = {
  db: db,
  objects: {
    errors: errors
  }
};

module.exports = controller;