const app = require('csp-app/state.js');
const MainController = require('csp-app/components/root/MainController.js');

// const Router = {
//   routes: [],
//   regexpParams: /(\(:([\w\d\-_]+)\))/gi,
//   trimRoute: function(route){
//     route = route[0] === '/'
//       ? route.substr(1)
//       : route;

//     route = route[route.length - 1] === '/'
//       ? route.substr(0, route.length - 1)
//       : route;

//     return route;
//   },
//   getParamsNames: function (route) {
//     let result;
//     let paramsNames = [];
//     while ((result = this.regexpParams.exec(route)) !== null) {
//       paramsNames.push(result[2]);
//     }
//     return paramsNames;
//   },
//   addRoute: function(route, handler) {
//     route = this.trimRoute(route);
//     let paramsNames = this.getParamsNames(route);
//     let regexpStr = route.replace(regexpParams, '[\\w\\d\-_]+');
//     let regexp = RegExp(`^${regexpStr}(\\/|$)`, 'gi');

//     let routeObj = {
//       regexp: regexp,
//       paramsNames: paramsNames
//     };

//     if (typeof handler === 'function') {
//       routeObj.handler = handler;
//     }

//     if (handler instanceof Array) {
//       routeObj.children = handler;
//     }

//     if (!(typeof handler === 'function' || handler instanceof Array)) {
//       console.log('Error occured while adding route');
//       throw new Error('route error');
//     }

//     this.routes.push(routeObj);
//     return this;
//   }
// };

const Router = function() {
  this.routes = [];
};

Router.prototype.regexpParams = /(\(:([\w\d\-_]+)\))/gi;

Router.prototype.trimRoute = function(route){
  route = route[0] === '/'
    ? route.substr(1)
    : route;

  route = route[route.length - 1] === '/'
    ? route.substr(0, route.length - 1)
    : route;

  return route;
},

Router.prototype.getParamsNames = function(route) {
  let result;
  let paramsNames = [];
  while ((result = this.regexpParams.exec(route)) !== null) {
    paramsNames.push(result[2]);
  }
  return paramsNames;
}

Router.prototype.addRoute = function(route, handler) {
  route = this.trimRoute(route);
  let paramsNames = this.getParamsNames(route);
  let regexpStr = route.replace(this.regexpParams, '[\\w\\d\-_]+');
  let regexp = RegExp(`^${regexpStr}(\\/|$)`, 'gi');

  let routeObj = {
    regexp: regexp,
    paramsNames: paramsNames
  };

  if (typeof handler === 'function') {
    routeObj.handler = handler;
  }

  if (handler instanceof Array) {
    routeObj.children = handler;
  }

  if (!(typeof handler === 'function' || handler instanceof Array)) {
    console.log('Error occured while adding route');
    throw new Error('route error');
  }

  this.routes.push(routeObj);
  return this;
};

Router.prototype.getRoute = function(link, routes = this.routes, params = {}) {
  link = link === '' ? '/' : link;

  for (let i = 0; i < routes.length, route = routes[i]; i++) {
    let regexp = route.regexp;
    let result = regexp.exec(link);

    if (result && result.length > 1) {
      for (let idx = 1; idx < result.length; idx++) {
        params[route.paramsNames[idx-1]] = result[idx];
      }
    }

    if (regexp.lastIndex > 0) {
      link = link.substr(regexp.lastIndex);
    }

    if (regexp.lastIndex > 0 && link.length > 0) {
      if (route.children && route.children.length > 0) {
        let childrenCheck = this.getRoute(link, route.children, params);
        if (childrenCheck !== null) {
          return childrenCheck;
        }
      }
    }

    else if (regexp.lastIndex > 0) {
      if (route.handler) {
        return {
          handler: route.handler,
          params: params
        };
      }
      
      if (route.children) {
        let childrenCheck = this.getRoute(link, route.children, params);
        if (childrenCheck !== null) {
          return childrenCheck;
        }
      }
    }
  }
  return null;
}

Router.prototype.navigate = function(link) {
  link = this.trimRoute(link);
  let route = this.getRoute(link);
  if (!route) {
    console.log('Error while navigating route');
    return;
  }
  route.handler(route.params);
  history.pushState('', '', link);
};

module.exports = Router;