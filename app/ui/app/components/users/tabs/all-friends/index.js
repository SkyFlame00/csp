const http = require('csp-app/libs/http');
const tabTemplate = require('../common/tab.tpl');
const createUsersList = require('../common/createUsersList');

function FriendsTabComponent() {
  return http.get('users/getAllFriendsBase')
    .then(friends => {
      const element = tabTemplate({
        className: 'tab-allfriends',
        onListEmpty: {
          empty: friends.length == 0,
          message: 'You have no friends yet'
        }
      });

      if (friends.length > 0) {
        friendsElements = createUsersList(friends);
        friendsElements.forEach(el => element.root.appendChild(el.root));
      }

      return {
        element: element.root,
        friendsAmount: friends.length
      };
    })
  ;
}

module.exports = FriendsTabComponent;