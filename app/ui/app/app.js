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
    let path = window.location.pathname;
    const rootInstance = Root.create();
    MainController.initialize(rootInstance);

    console.log(path);

    // path = path[0] === '/' ? path.substr(1): path;
    // path = path[path.length-1] === '/' ? path.substr(0, path.length-1) : path;

    let routes = [
        {
            regexp: /^genres$/gi,
            handler: 'genres handler'
        },
        {
            regexp: /^genres\/([^\/\s]+)(?:\/|$)/gi,
            paramsNames: ['genre'],
            children: [
                {
                    regexp: /^\/$/gi,
                    handler: 'genre handler'
                },
                {
                    regexp: /^movies(?:\/|$)/gi,
                    children: [
                        {
                            regexp: /^\/$/gi,
                            handler: 'movies handler'
                        },
                        {
                            regexp: /^([^\/\s]+)$/gi,
                            paramsNames: ['movie'],
                            handler: 'movie handler'
                        }
                    ]
                }
            ]
        }
    ];

    const router = new Router();
    router
        .addRoute('genres/(:genre)/movies', function(){console.log('route 1')})
        .addRoute('genres/(:genre)/movies/(:movie)', function(){console.log('route 2')})
        .addRoute('lib/(:book)', function(){console.log('route 3')})

    console.log(router.routes)

    router.navigate(path)
});