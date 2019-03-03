const auth = require('./auth');
const usersRouter = require('./users');

function mountRoutes(app, db) {
  auth(app, db);
  
  app.use('/users', usersRouter);
  // users(app, db);
}

module.exports = mountRoutes;