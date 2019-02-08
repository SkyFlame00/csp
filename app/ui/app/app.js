const Root = require('csp-app/components/root');
const StartPage = require('csp-app/components/startpage');
const Dashboard = require('csp-app/components/dashboard');
const MainController = require('csp-app/components/root/MainController');
const app = require('csp-app/state.js');
const Test = require('csp-app/components/test');

const Router = require('csp-app/libs/router')

document.addEventListener('click', evt => {
    const link = evt.target.closest('a');

    if (link && link.dataset.route) {
        Router.navigate(link.dataset.route);
    }
});

window.addEventListener('popstate', evt => {
    console.log('page changed: ', document.location);
    console.log(evt);
    Router.navigate(document.location.pathname);
});

document.addEventListener('DOMContentLoaded', function(evt) {
    const path = window.location.pathname;
    const rootInstance = Root.create();
    MainController.initialize(rootInstance);

    Router.setPaths({
        '/': {
            component: Dashboard,
            children: {
                'test': {
                    component: Test,
                    children: {}
                }
            }
        }
    });

    Router.navigate(path);
});