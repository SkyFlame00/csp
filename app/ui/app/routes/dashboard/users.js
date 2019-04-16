const {render} = require('csp-app/components/main');
const Dashboard = require('csp-app/components/dashboard');
const UsersComponent = require('csp-app/components/users');

const UsersHandler = function() {
  render([Dashboard, UsersComponent]);
};

module.exports = UsersHandler;