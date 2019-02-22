const Root = require('csp-app/components/root');
const Dashboard = require('csp-app/components/dashboard');
const MainController = require('csp-app/components/root/MainController');

const Router = require('csp-app/libs/router')
const Start = require('csp-app/components/start/start');

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
    let path = window.location.pathname;
    const rootInstance = Root.create();
    MainController.initialize(rootInstance);

    console.log(path);

    const router = new Router();

    router
        .addRoute('/', function() {
            MainController.renderChain([new Start()])
        })
    
    router.navigate(path)
});