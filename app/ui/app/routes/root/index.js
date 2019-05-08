const http = require('csp-app/libs/http');
const {render} = require('csp-app/components/main');
const Start = require('csp-app/components/start');
const Dashboard = require('csp-app/components/dashboard');

const checkAuth = token => {
  return http
    .post('auth/authenticate', {token: token})
  ;
};

const rootHandler = async () => {
  const token = window.localStorage.getItem('auth_token') || null;
  const isAuthenticated = token ? (await checkAuth(token)).success : false;

  if (isAuthenticated) {
    render([ Dashboard ]);
  }
  else {
    render([ Start ]);
  }
};

module.exports = rootHandler;