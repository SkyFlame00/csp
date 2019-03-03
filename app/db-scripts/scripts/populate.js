const client = require('../connections/db');

function populate() {
  const sql = `
    INSERT INTO users (login, password, first_name, last_name, patronymic, email)
    VALUES ('skyflame', '1234', 'anton', 'tikhonov', 'sergeevich', 't.a.s.98@ya.ru')`;
  
  client.query(sql)
    .then(res => console.log('Populated'))
    .catch(err => console.log(err));
}

module.exports = populate;