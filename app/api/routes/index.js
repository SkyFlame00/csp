const authRouter = require('./auth');
const usersRouter = require('./users');
const {extractPayload} = require('csp-app-api/resources/middlewares');

function mountRoutes(app, db) {
  // auth(app, db);
  app.use(extractPayload);
  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/scheduler', require('./scheduler'));
  // users(app, db);
}

module.exports = mountRoutes;