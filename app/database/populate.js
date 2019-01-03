const pg = require('pg');
const connection = require('./config');

const client = new pg.Client(connection);
client.connect();

const populateUsers = `
    INSERT INTO users (login, password, first_name, last_name, patronymic, email)
    VALUES ('skyflame', '8287331', 'anton', 'tikhonov', 'sergeevich', 't.a.s.98@ya.ru')`;

client.query(populateUsers, (err, res) => {
    if (err)
        throw err;
    
    console.log('Insertion completed successfully');
});