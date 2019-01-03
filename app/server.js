const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const pg = require('pg');
const session = require('express-session');

app.use(express.static('ui/dist'));
app.use(bodyParser.json());
app.use(session({
    secret: 'cool app',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false} // true is only for https connection which we lack for now
}));

const connection = require('./database/config');
const client = new pg.Client(connection);
client.connect();
client.query('SELECT * FROM users', (err, res) => {
    console.log(res.rows);
    client.end();
});

app.post('/api/getData', (req, res) => {
    console.log(req.body);

    res.end('heeeey')
});

app.post('/api/login', (req, res) => {
    const { login, pw } = req.body;

    res.end('yes');
});

app.get('/api/cookies', (req, res) => {
    
});

app.get('/api/logout', (req, res) => {

});

app.get('*', (req, res) => {
    const bootstrap = fs.readFileSync('./ui/bootstrap/index.html');
    res.end(bootstrap);
});

app.listen(5000, () => console.log('Listening on port 5000'));