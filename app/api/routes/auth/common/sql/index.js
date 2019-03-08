const fs = require('fs');

function readSQLFile(filename) {
  return fs.readFileSync(`${__dirname}/${filename}.sql`, 'utf8');
}

const insertVerificationToken = readSQLFile('insertVerificationToken');
const getUserIdByUsername = readSQLFile('getUserIdByUsername');
const getUsernameByUsername = readSQLFile('getUsernameByUsername');
const insertUser = readSQLFile('insertUser');

module.exports = {
  insertVerificationToken,
  getUserIdByUsername,
  getUsernameByUsername,
  insertUser
};