const Router = require('./index');

const router = new Router();

const genresRouter = new Router.Subrouter();

genresRouter
  .addRoute('movies/(:movie)', function(){})

const usersRouter = new Router.Subrouter();

usersRouter
  .addRoute('(:userId)', function(){})
  .addMiddleware(function testing(){})
  .addRoute('(:userId)/info', function(){})

const sectionsRouter = new Router.Subrouter();

sectionsRouter
  .addRoute('/', function sectionsRoot(){})
  .addRoute('users', usersRouter.routes)
  .addRoute('tabs', function(){})

// Manag

const miscRouter = new Router.Subrouter();

miscRouter
  .addRoute('misc/follow/(:id)', function misc(){})

const managUsersRouter = new Router.Subrouter();

managUsersRouter
  .addRoute('(:userId)', function managUser(){})
  .addMiddleware(function userInfoFn(){})
  .addRoute('(:userId)/info', function managUserInfo(){})

const managementRouter = new Router.Subrouter();

managementRouter
  .addRoute('management/users', managUsersRouter.routes)
  .addRoute('management/settings', function managSettings(){})
  .addRoutes(miscRouter.routes)

router
  .addRoute('genres/(:genre)', genresRouter.routes)
  // .addMiddleware(function test(){})
  .addRoute('genres/(:genre)/movies/(:movie)/info/(:section)', sectionsRouter.routes)
  .addRoutes(managementRouter.routes)


// router.testNav('genres/action/movies/aazzz');
// router.testNav('genres/action/movies/azz/info/memes/users/user-1/info')
// router.testNav('genres/action/movies/azz/info/memes')
// router.testNav('ggg')
// router.testNav('management/users/user-1/info')
// router.testNav('misc/follow/1')

const musicRouter = new Router.Subrouter();

const mw1 = function(next, params) {
  console.log(next)
  console.log('executing mw1');
  next('mw1 executed');
};

const mw2 = function(next, params, arg) {
  console.log('got into music');
  console.log('what was previously: ' + arg);
  next({data: 'useful data'});
};

musicRouter
  .addMiddleware(mw2)
  .addRoute('(:genre)/tracks', function(params, routeParams, arg) {
    if (!!arg) {
      console.log(arg)
    }
    console.log('handlerParams: ', params)
    console.log('our params: ', routeParams)
  })

router
  .addMiddleware(mw1)
  .addRoute('music', musicRouter.routes)


router.testNav('music/rock/tracks', {test: 'nav'});