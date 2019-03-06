const db = require(`${__dirname}/db`);
const functions = require('csp-app-api/resources/functions');
const errors = require('csp-app-api/resources/objects/errors');
const mailTransporters = require('csp-app-api/resources/objects/mail');

const controller = {
  db: db,
  functions: functions,
  objects: {
    errors: errors,
    mail: mailTransporters
  }
};

module.exports = controller;