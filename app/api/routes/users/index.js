const router = require('express').Router();
const userData = require('./user-data');
const allUsersBase = require('./all-users-base');
const allOtherUsersBase = require('./all-other-users-base');
const userBase = require('./user-base');
const meFriendWith = require('./me-friend-with');
const meSentFriendReq = require('./me-sent-friend-req');
const sendFriendReq = require('./send-friend-req');
const confirmFriendReq = require('./confirm-friend-req');
const getAllFriendsBase = require('./getAllFriendsBase');
const getAllIncomingRequests = require('./getAllIncomingRequests');
const getAllOutgoingRequests = require('./getAllOutgoingRequests');
const removeFromFriends = require('./removeFromFriends');

router.get('/getUserData', userData);
router.get('/getAllUsersBase', allUsersBase);
router.get('/getUserBase/:id', userBase);
router.get('/getAllOtherUsersBase', allOtherUsersBase);
router.get('/me-friend-with/:id', meFriendWith);
router.get('/me-sent-friend-req/:id', meSentFriendReq);
router.get('/send-friend-req/:id', sendFriendReq);
router.get('/confirm-friend-req/:id', confirmFriendReq);
router.get('/getAllFriendsBase', getAllFriendsBase);
router.get('/getAllIncomingRequests', getAllIncomingRequests);
router.get('/getAllOutgoingRequests', getAllOutgoingRequests);
router.get('/remove-from-friends/:id', removeFromFriends);

module.exports = router;