const router = require('express').Router();

router.post('/getAllFriendsBasedOnAvailability', require('./getAllFriendsBasedOnAvailability'));
router.post('/getParticipantsAvailability', require('./getParticipantsAvailability'));
router.post('/create-event', require('./createEvent'));
router.post('/getAllMyEventsByDays', require('./getAllMyEventsByDays'));

module.exports = router;