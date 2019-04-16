const http = require('csp-app/libs/http');
const tabTemplate = require('../common/tab.tpl');
const createUsersList = require('../common/createUsersList');

function IncomingRequestsTabComponent() {
  return http.get('users/getAllIncomingRequests')
    .then(requesters => {
      const element = tabTemplate({
        className: 'tab-allIncReqs',
        onListEmpty: {
          empty: requesters.length == 0,
          message: 'No incoming requests sent yet'
        }
      });

      if (requesters.length > 0) {
        requestersElements = createUsersList(requesters);
        requestersElements.forEach(el => element.root.appendChild(el.root));
      }

      return {
        element: element.root,
        requestsAmount: requesters.length
      };
    })
  ;
}

module.exports = IncomingRequestsTabComponent;