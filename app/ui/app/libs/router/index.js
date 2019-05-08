const Router = function() {
  this.routes = [];
};

Router.prototype.regexpParams = /(\(:([\w\d\-_]+)\))/gi;

Router.prototype.trimRoute = function(route) {
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

Router.prototype.addRoute = function(route, obj) {
  route = this.trimRoute(route);
  let paramsNames = this.getParamsNames(route);
  let regexpStr = route.replace(this.regexpParams, '([\\w\\d\-_]+)');
  let regexp = RegExp(`^${regexpStr}(\\/|$)`, 'gi');

  let routeObj = {
    type: 'route',
    regexp: regexp,
    paramsNames: paramsNames
  };

  if (typeof obj === 'function') {
    /**
     * Route handler will be invoked when user goes to the corresponding
     * route and not terminated by middlewares underway
     * @function handler
     * @param {object} handlerParams - params may be given when Router.navigate is invoked
     * @param {object} routeParams - params existing on the route if any
     * @param {any} arg - this is given by the last middleware if any
     */
    routeObj.handler = obj;
  }

  else if (obj instanceof Array) {
    routeObj.children = obj;
  }

  else {
    console.log('Error occured while adding route');
    throw new Error('route error');
  }

  this.routes.push(routeObj);
  return this;
};

Router.prototype.getRoute = function(link, routes = this.routes) {
  link = link === '' ? '/' : link;
  let middlewares = [];
  let params = {};

  for (let i = 0; i < routes.length, route = routes[i]; i++) {
    if (route.type == 'middleware') {
      middlewares.push(route.fn);
      continue;
    }

    if (route.type == 'routes') {
      const childrenCheck = this.getRoute(link, route.routes);
      if (childrenCheck !== null) {
        childrenCheck.middlewares = middlewares.concat(childrenCheck.middlewares);
        childrenCheck.params = Object.assign(params, childrenCheck.params);
        return childrenCheck;
      }
      continue;
    }

    let regexp = route.regexp;
    let result = regexp.exec(link);
    let newLink;

    if (result && result.length > 1) {
      params = {};
      for (let idx = 1; idx < result.length - 1; idx++) {
        params[route.paramsNames[idx-1]] = result[idx];
      }
    }

    if (regexp.lastIndex > 0) {
      newLink = link.substr(regexp.lastIndex);
    }

    if (regexp.lastIndex > 0 && newLink.length > 0) {
      regexp.lastIndex = 0;
      if (route.children && route.children.length > 0) {
        let childrenCheck = this.getRoute(newLink, route.children);
        if (childrenCheck !== null) {
          childrenCheck.middlewares = middlewares.concat(childrenCheck.middlewares);
          childrenCheck.params = Object.assign(params, childrenCheck.params);
          return childrenCheck;
        }
      }
    }
    // In case it's terminal route
    else if (regexp.lastIndex > 0) {
      regexp.lastIndex = 0;
      if (route.handler) {
        return {
          handler: route.handler,
          params: params,
          middlewares: middlewares
        };
      }
      
      // Since it's done and link is (actually, will be when we
      // get into recursion) '/', so we look up children to
      // to match the root '/' which must exist there
      if (route.children) {
        regexp.lastIndex = 0;
        let childrenCheck = this.getRoute(newLink, route.children);
        if (childrenCheck !== null) {
          childrenCheck.middlewares = middlewares.concat(childrenCheck.middlewares);
          childrenCheck.params = Object.assign(params, childrenCheck.params);
          return childrenCheck;
        }
      }
    }
  }
  return null;
};

Router.prototype.addRoutes = function(routes) {
  this.routes.push({
    type: 'routes',
    routes: routes
  });

  return this;
};

Router.prototype.addMiddleware = function(fn) {
  this.routes.push({
    type: 'middleware',
    fn: fn
  });

  return this;
};

Router.prototype.navigate = function(link, handlerParams) {
  link = this.trimRoute(link);
  let route = this.getRoute(link);
  if (!route) {
    console.error('No suitable route has been found!');
    return;
  }
  
  fns = route.middlewares.concat([route.handler.bind(null, handlerParams)]);
  for (let i = fns.length - 1; i > 0, fn = fns[i]; i--) {
    if (i !== fns.length - 1) {
      fns[i] = fn.bind(null, fns[i+1], route.params);
    }
    else {
      fns[i] = fn.bind(null, route.params);
    }
  }
  fns[0]();
  history.pushState('', '', '/' + window.location.search);
};

Router.prototype.testNav = function(link, handlerParams) {
  link = this.trimRoute(link);
  let route = this.getRoute(link);
  if (!route) {
    console.log('No suitable route has been found')
    return;
  }
  // console.log(route);
  fns = route.middlewares.concat([route.handler.bind(null, handlerParams)]);
  for (let i = fns.length - 1; i > 0, fn = fns[i]; i--) {
    if (i !== fns.length - 1) {
      fns[i] = fn.bind(null, fns[i+1], route.params);
    }
    else {
      fns[i] = fn.bind(null, route.params);
    }
  }
  // console.log(fns)
  fns[0]();
};

const Subrouter = function() {
  this.routes = [];
};
Subrouter.prototype = Router.prototype;
Router.Subrouter = Subrouter;

module.exports = Router;