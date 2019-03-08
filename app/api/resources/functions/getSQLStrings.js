const fs = require('fs');
const path = require('path');

function getSQLStrings(dirname) {
  const filenames = fs.readdirSync(dirname);
  let sql = {};

  filenames.forEach(filename => {
    const parsed = path.parse(filename);
    if (parsed.ext != '.sql') return;
    sql[parsed.name] = fs.readFileSync(`${dirname}/${filename}`, 'utf8');
  });

  return sql;
}

module.exports = getSQLStrings;