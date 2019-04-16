const {render} = require('csp-app/components/main');
const Dashboard = require('csp-app/components/dashboard');
const SchedulerComponent = require('csp-app/components/scheduler');

const SchedulerHandler = function() {
  render([Dashboard, SchedulerComponent]);
};

module.exports = SchedulerHandler;