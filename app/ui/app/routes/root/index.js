const http = require('csp-app/libs/http');
const {render} = require('csp-app/components/main');
const Start = require('csp-app/components/start');
const Dashboard = require('csp-app/components/dashboard');

const rootHandler = function() {
  let user = null;
  let token = window.localStorage.getItem('auth_token') || null;

  if (token) {
    http
      .post('auth/authenticate', {token: token})
      .then(res => {
        if (res.success) {
          user = res.data.user;
        }
      });
  }

  if (user) {
    render([new Start()]);
  }
  else {
    render([new Dashboard()]);
  }
};

module.exports = rootHandler;