const pg = require('pg');
const {config} = require('../config');

const client = new pg.Client(config);
client.connect();

module.exports = client;