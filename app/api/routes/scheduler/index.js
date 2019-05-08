const router = require('express').Router();

router.post('/getAllFriendsBasedOnAvailability', require('./getAllFriendsBasedOnAvailability'));
router.post('/getParticipantsAvailability', require('./getParticipantsAvailability'));
router.post('/create-event', require('./createEvent'));
router.post('/getAllMyEventsByDays', require('./getAllMyEventsByDays'));
router.get('/getMyLocalTime', require('./getMyLocalTime'));
router.get('/getEventInfo/:eventId', require('./getEventInfo'));
router.post('/getAllFriendsAndMe', require('./getAllFriendsAndMe'));
router.post('/getSharedSchedulerObjects', require('./getSharedSchedulerObjects'));

module.exports = router;