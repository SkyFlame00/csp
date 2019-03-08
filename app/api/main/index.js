const db = require(`${__dirname}/db`);
const functions = require('csp-app-api/resources/functions');
const errors = require('csp-app-api/resources/objects/errors');
const mailTransporters = require('csp-app-api/resources/objects/mail');
const keys = require('csp-app-api/resources/keys');

const controller = {
  location: 'http://localhost:3001',
  db: db,
  functions: functions,
  objects: {
    errors: errors,
    mail: mailTransporters
  },
  keys: keys
};

module.exports = controller;