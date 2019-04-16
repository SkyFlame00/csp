const router = require('express').Router();

const login = require('./login');
// const signupClient = require('./signup-client');
const signupExec = require('./signup-exec');
const authenticate = require('./authenticate');
const {verify, sendVerificationToken} = require('./verify');

router.post('/login', login);
router.post('/signup/exec', signupExec);
router.get('/verify', verify);
router.get('/verify/send-verification-token', sendVerificationToken);
router.post('/authenticate', authenticate);

module.exports = router;