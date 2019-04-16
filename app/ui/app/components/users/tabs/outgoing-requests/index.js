const http = require('csp-app/libs/http');
const tabTemplate = require('../common/tab.tpl');
const createUsersList = require('../common/createUsersList');

function OutgoingRequestsTabComponent() {
  return http.get('users/getAllOutgoingRequests')
    .then(requestees => {
      const element = tabTemplate({
        className: 'tab-allIncReqs',
        onListEmpty: {
          empty: requestees.length == 0,
          message: 'No outgoing requests sent yet'
        }
      });

      if (requestees.length > 0) {
        requesteesElements = createUsersList(requestees);
        requesteesElements.forEach(el => element.root.appendChild(el.root));
      }

      return {
        element: element.root,
        requestsAmount: requestees.length
      };
    })
  ;
}

module.exports = OutgoingRequestsTabComponent;