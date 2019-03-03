const login = require('./login');
// const signupClient = require('./signup-client');
const signupExec = require('./signup-exec');
const jwt = require('jsonwebtoken');

function auth(app, db) {
  app.post('/auth/login', login.bind(null, db));
  // app.post('signup/client', signupClient.bind(null, db));
  app.post('/auth/signup/exec', signupExec.bind(null, db));

  app.post('auth/getToken', (req, res) => {
    const id = req.body.id;

    return res.end(jwt.sign({id: id}, 'secret', {expiresIn: '10m'}));
  });

  app.post('/auth/authenticate', (req, res) => {
    const {token} = req.body;
    console.log(typeof token)
    const answer = jwt.verify(token, 'secret');
  
    return res.json(answer);
  });
}

module.exports = auth;