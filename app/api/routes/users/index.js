const router = require('express').Router();
// const {checkAuth} = require('csp-app-api/resources/middlewares');
const userData = require('./user-data');

// function users(app, db) {
//   app.use('/users', (req, res, next) => {
//     app.use(checkAuth);
//     app.post('/getUserData', userData.bind(null, db));
//   });
// }

// router.use(checkAuth);
router.get('/getUserData', userData);


module.exports = router;