const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// const {createToken} = require('./common');

// const keysDir = path.resolve(__dirname, '../keys');
// const privateKey = fs.readFileSync(`${keysDir}/private.key`, 'utf8');
// const publicKey = fs.readFileSync(`${keysDir}/public.key`, 'utf8');

const {privateKey, publicKey} = require('csp-app-api/resources/keys');

function createToken(payload, expiresIn = '30d') {
  const options = {expiresIn: expiresIn, algorithm: 'HS256'};
  return jwt.sign(payload, 'secred', options);
}

const token = createToken({name: 'anton'})

console.log(token)

const res = jwt.verify(token+'dsa', 'secred');

console.log(res)
