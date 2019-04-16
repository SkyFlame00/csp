const http = require('csp-app/libs/http');
const tabTemplate = require('../common/tab.tpl');
const createUsersList = require('../common/createUsersList');

function AllUsersTabComponent() {
  return http.get('users/getAllOtherUsersBase')
    .then(users => {
      const element = tabTemplate({
        className: 'tab-allusers',
        onListEmpty: {
          empty: users.length == 0,
          message: 'No one apart from you has registered on the site'
        }
      });

      if (users.length > 0) {
        usersElements = createUsersList(users);
        usersElements.forEach(el => element.root.appendChild(el.root));
      }

      return {
        element: element.root
      };
    })
  ;
}

module.exports = AllUsersTabComponent;