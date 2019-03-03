const fs = require('fs');

const privateKey = fs.readFileSync(`${__dirname}/private.key`, 'utf8');
const publicKey = fs.readFileSync(`${__dirname}/public.key`, 'utf8');

module.exports = {
  privateKey,
  publicKey
};