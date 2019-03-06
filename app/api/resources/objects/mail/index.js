const nodemailer = require('nodemailer');
const configs = require('./config');

const generalTransporter = nodemailer.createTransport(configs.general);

module.exports = {
  generalTransporter
};
