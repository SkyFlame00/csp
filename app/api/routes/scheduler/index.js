const router = require('express').Router();

router.post('/getAllFriendsBasedOnAvailability', require('./getAllFriendsBasedOnAvailability'));

module.exports = router;