const pg = require('pg');
const {defaultConfig} = require('../config');

const client = new pg.Client(defaultConfig);
client.connect();

module.exports = client;