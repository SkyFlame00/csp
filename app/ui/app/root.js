const Root = require('csp-app/components/main/rootComponent');
const Dashboard = require('csp-app/components/dashboard');
const MainController = require('csp-app/components/main');
const {router} = MainController;
const http = require('csp-app/libs/http');

const Router = require('csp-app/libs/router');
const Start = require('csp-app/components/start');
const Test = require('csp-app/components/test')

http.configure({ location: 'http://localhost:3000' });

const verificationRoute = require('csp-app/routes/auth/verification');
const rootHandler = require('csp-app/routes/root');
const {schedulerHandler, usersHandler, userHandler} = require('csp-app/routes/dashboard');

document.addEventListener('click', evt => {
  const link = evt.target.closest('a');

  if (link && link.dataset && link.dataset.route) {
    router.navigate(link.dataset.route);
  }
});

window.addEventListener('popstate', evt => {
  console.log('page changed: ', document.location);
  console.log(evt);
  router.navigate(document.location.pathname);
});

document.addEventListener('DOMContentLoaded', function(evt) {
  let path = window.location.pathname;
  const rootInstance = Root.create();
  MainController.initialize(rootInstance);

  router
    .addRoute('/', rootHandler)
    .addRoute('signup/verify', verificationRoute)
    .addRoute('scheduler', schedulerHandler)
    .addRoute('users', usersHandler)
    .addRoute('users/(:id)', userHandler)
  ;

  router.navigate(path)
});