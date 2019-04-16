const {
  AllUsersTabComponent,
  FriendsTabComponent,
  IncomingRequestsTabComponent,
  OutgoingRequestsTabComponent
} = require('./tabs');
const {createElementFromHTML} = require('csp-app/libs/utilities');
const Tabs = require('csp-app/libs/tabs');

function UsersComponent() { 
  return Promise
    .all([
      AllUsersTabComponent(),
      FriendsTabComponent(),
      IncomingRequestsTabComponent(),
      OutgoingRequestsTabComponent()
    ])
    .then(([allUsersTab, friendsTab, IRTab, ORTab]) => {
      const tabs = new Tabs({
        header: {
          items: [
            {title: 'All users', tag: 'button'},
            {title: `Friends (${friendsTab.friendsAmount})`, tag: 'button'},
            {title: `Incoming requests (${IRTab.requestsAmount})`, tag: 'button'},
            {title: `Outgoing requests (${ORTab.requestsAmount})`, tag: 'button'}
          ]
        },
        content: {
          items: [
            allUsersTab.element,
            friendsTab.element,
            IRTab.element,
            ORTab.element
          ]
        },
        animation: {
          name: 'defaultAnim'
        }
      });
    
      const wrapper = createElementFromHTML('<div class="cmp_users"></div>');
    
      wrapper.appendChild(tabs.header.element);
      wrapper.appendChild(tabs.content.element);
    
      return {
        success: true,
        controller: {
          element: wrapper
        }
      };
    })
  ;
}

module.exports = UsersComponent;