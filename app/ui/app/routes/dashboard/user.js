const {render} = require('csp-app/components/main');
const Dashboard = require('csp-app/components/dashboard');
const {UserPageComponent} = require('csp-app/components/users/standalones');

const UserHandler = function(none, params) {
  render([Dashboard, UserPageComponent(params.id)]);
};

module.exports = UserHandler;