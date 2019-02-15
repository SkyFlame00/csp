(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Root = require('csp-app/components/root');
// const StartPage = require('csp-app/components/startpage');
const Dashboard = require('csp-app/components/dashboard');
const MainController = require('csp-app/components/root/MainController');
const app = require('csp-app/state.js');
// const Test = require('csp-app/components/test');

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

    // path = path[0] === '/' ? path.substr(1): path;
    // path = path[path.length-1] === '/' ? path.substr(0, path.length-1) : path;

    // let routes = [
    //     {
    //         regexp: /^genres$/gi,
    //         handler: 'genres handler'
    //     },
    //     {
    //         regexp: /^genres\/([^\/\s]+)(?:\/|$)/gi,
    //         paramsNames: ['genre'],
    //         children: [
    //             {
    //                 regexp: /^\/$/gi,
    //                 handler: 'genre handler'
    //             },
    //             {
    //                 regexp: /^movies(?:\/|$)/gi,
    //                 children: [
    //                     {
    //                         regexp: /^\/$/gi,
    //                         handler: 'movies handler'
    //                     },
    //                     {
    //                         regexp: /^([^\/\s]+)$/gi,
    //                         paramsNames: ['movie'],
    //                         handler: 'movie handler'
    //                     }
    //                 ]
    //             }
    //         ]
    //     }
    // ];

    const router = new Router();
    // router
    //     .addRoute('genres/(:genre)/movies', function(){console.log('route 1')})
    //     .addRoute('genres/(:genre)/movies/(:movie)', function(){console.log('route 2')})
    //     .addRoute('lib/(:book)', function(){console.log('route 3')})

    // console.log(router.routes)

    // console.log('Router: ', Router)
    // console.log('Router.prototype: ', Router.prototype)
    // console.log('router: ', router);

    // console.log('constructor1: ', Router.prototype.constructor === Router)
    // console.log('constructor2: ', router.__proto__.constructor === Router)
    router
        .addRoute('/', function() {
            MainController.renderChain([new Start()])
        })
    

    router.navigate(path)
});
},{"csp-app/components/dashboard":2,"csp-app/components/root":4,"csp-app/components/root/MainController":3,"csp-app/components/start/start":6,"csp-app/libs/router":10,"csp-app/state.js":11}],2:[function(require,module,exports){
const Dashboard = {
    html: `
        <div id="dashboard">
            <h1>Hello world!</h1>
            <a data-route="test">Go to Test component</a>
        </div>
    `,
    instantiate: function() {
        const temp = document.createElement('div');
        temp.innerHTML = this.html;
        const element = temp.firstElementChild
        
        return {
            reference: element,
            actions: {
                render: function(DOMTree) {
                    element.innerHTML = '';
                    element.appendChild(DOMTree);
                }
            }
        }
    }
};

module.exports = Dashboard;
},{}],3:[function(require,module,exports){
const app = require('csp-app/state.js');

const MainController = {
    root: null,
    path: [],
    // render: function(componentsObjects) {
        
    //     // const allRoutersExist = instances.every(instance => !!instance.routerOutlet);
    //     // if (!allRoutersExist) throw new Error('One or more router outlets do not exist');
        
    //     const index = this.path.findIndex((part, i) => {
    //         return part.path !== componentsObjects[i].path
    //     });
    //     if (index > -1) {
    //         componentsObjects.splice(0, index);
    //         this.path.splice(index);
    //         this.path.concat(componentsObjects);
    //     }
    //     else {
    //         this.path = componentsObjects;
    //     }

    //     if (this.path.length === componentsObjects.length) {

    //     }
        

    //     if (componentsObjects.length > 0) {
    //         let instances = componentsObjects.map(co => co.component.instantiate(co.parameters));
    //         // console.log('instances', instances)
    //         const renderedChain = instances.reverse().reduce((accumulator, instance) => {
    //             if (!!accumulator) instance.actions.render(accumulator.reference);
    //             return instance;
    //         }, null);
    //         console.log('renderedChain', renderedChain)
    //         MainController.root.render(renderedChain.reference);
    //     }
    // },
    renderChain: function(components) {
      components.reduce((acc, component) => {
        acc.render(component.element);
        return component;
      }, this.root)
    },
    initialize: function(rootInstance) {
      this.root = rootInstance;
      document.body.innerHTML = '';
      document.body.appendChild(rootInstance.reference);
    }
};

module.exports = MainController;
},{"csp-app/state.js":11}],4:[function(require,module,exports){
const Root = {
    componentName: 'app',
    html: `<div id="app"></div>`,
    identifier: '#app',
    create: function() {
        // Consider reimplementing with HTML5 template feature instead just utilizing div
        const tmpElem = document.createElement('div');
        tmpElem.innerHTML = this.html;
        const element = tmpElem.firstChild;

        return {
            reference: element,
            routerOutlet: element,
            componentName: this.componentName,
            state: {},
            actions: (function(routerOutlet) {
                return {
                    load: function(fragment) {
                        routerOutlet.innerHTML = '';
                        routerOutlet.appendChild(fragment);
                    }
                };
            })(element),
            render: (function(routerOutlet) {
                return function(DOMTree) {
                    routerOutlet.innerHTML = '';
                    routerOutlet.appendChild(DOMTree);
                }
            })(element)
        }
    }
};

module.exports = Root;
},{}],5:[function(require,module,exports){
const Form = require('csp-app/libs/forms');

const minLength = function(value, control) {
  return {
    valid: value.length >= 5,
    message: 'This fields\'s length is less than 5 chars'
  }
};

const maxLength = function(value, control) {
  return {
    valid: value.length <= 10,
    message: 'This fields\'s length is greater than 10 chars'
  }
};

const startsWithNumber = function(value, control) {
  return {
    valid: !/^\d+/i.test(value),
    message: 'Username must not start with numbers'
  }
};

const username = {
  keyName: 'username',
  tag: 'input',
  id: 'loginform-username',
  label: '',
  attributes: [
    {name: 'placeholder', value: 'Username'}
  ],
  validators: [
    {
      name: 'minLength',
      handler: minLength
    },
    {
      name: 'maxLength',
      handler: maxLength
    },
    {
      name: 'startsWithNumber',
      handler: startsWithNumber
    }
  ],
  wrapper: {class: 'input-block'}
};

const password = {
  keyName: 'password',
  tag: 'input',
  id: 'loginform-password',
  label: '',
  attributes: [
    {name: 'type', value: 'password'},
    {name: 'placeholder', value: 'Password'}
  ],
  required: true,
  validators: [
    {
      name: 'minLength',
      handler: minLength
    }
  ],
  wrapper: {class: 'input-block'}
};

const loginForm = new Form({
  validators: [],
  submit: {
    handler: function(values, evt) {
      evt.preventDefault();
      console.log('Form is clean');
    }
  },
  controls: [
    username,
    password
  ]
});

module.exports = {
  loginForm: loginForm
};
},{"csp-app/libs/forms":9}],6:[function(require,module,exports){
function Singleton(fn) {
  function Class() {
    if (Class.instance) {
      return Class.instance;
    }

    return Class.instance = fn();
  }

  Class.getInstance = function() {
    return Class.instance || new Class();
  };

  Class.destroy = function() {
    Class.instance = null;
  };

  return Class;
}

const template = require('./start.tpl');
const MainController = require('csp-app/components/root/MainController');
const forms = require('./forms');

const Start = function() {
  const wrapper = document.createElement('div');
  wrapper.id = 'start-component';
  wrapper.innerHTML = template();
  wrapper.querySelector('#login .login-form').appendChild(forms.loginForm.ref);

  return {
    element: wrapper,
    render: function() {

    }
  };
};

module.exports = Singleton(Start);
},{"./forms":5,"./start.tpl":7,"csp-app/components/root/MainController":3}],7:[function(require,module,exports){
// const te;

function template(data) {
  return `
    <div class="wrapper">
      <div class="startpage">
        <div class="logo-block">
          <h1>Welcome to Consulting Services Platform</h1>
        </div>
        
        <a data-route="/">Home</a>
        <a data-route="/dashboard">Dashboard</a>

        <div class="main-actions">
          <button id="login-switch">Log in</button>
          <button id="signup-switch">Sign up</button>
        </div>

        <div class="login" id="login">
          <div class="header"><h2>Log in</h2></div>
          <div class="login-form form">
            
          </div>
        </div>
        
        <div class="signup" id="signup">
          <div class="tab-actions clearfix">
            <button id="client-switch">Sign up as client</button>
            <button id="exec-switch">Sign up as executor</button>
          </div>
        
          <div class="signup-form" id="signup-form">
            <div class="client-form form" id="client-form"></div>
            <div class="exec-form form" id="exec-form"></div>
          </div>
        </div>
          
      </div>
    </div>
  `;
}

module.exports = template;
},{}],8:[function(require,module,exports){
// const bindValidators = function(control, validators) {
//   return validators.map(validator => validator.bind(control));
// };

const validate = function(control) {
  control = control || this;
  let add = {};
  let remove = {};
  let items = control.errors.items;
  let validators = control.validators;

  // validators = validators.filter(validator => {
  //   let result = validator.conditions.every(fn => fn(control.value));
  //   if (!result && items[validator.name]) {
  //     remove[validator.name] = true;
  //   }
  //   return result;
  // });

  if (control.value === '') {
    Object.keys(items).forEach(item => {
      if (!!items[item]) remove[item] = true;
    });
  }

  if (control.required && control.value === '') {
    let element = document.createElement('li');
    element.innerHTML = 'This field is required';
    items['required'] = {
      ref: element
    }
    control.errors.ref.appendChild(element);
    // return;
  }

  // if (!control.required && control.value === '') {
  //   return;
  // }

  if (control.value.length > 0 && !!items['required']) {
    remove['required'] = true;
  }

  if (control.value !== '') {
    validators.forEach(validator => {
      let result = validator.handler(control.value, control);
      if (!result.valid && !items[validator.name]) {
        add[validator.name] = result;
        return;
      }
      if (result.valid && items[validator.name]) {
        remove[validator.name] = true;
      }
    });
  }

  Object.keys(add).forEach(error => {
    let element = document.createElement('li');
    element.innerHTML = add[error].message;
    items[error] = {
      ref: element
    };
    control.errors.ref.appendChild(element);
  });

  Object.keys(remove).forEach(error => {
    items[error].ref.remove();
    items[error] = null;
  });
};

const bindErrorHandling = function(control) {
  control.controlRef.addEventListener('input', () => {
    validate(control);
  });
};

const tagInput = function(options) {
  let prepend = options.prepend || '';
  let append = options.append || '';
  let label =
    options.label ?
    `<label for="${options.id}">${options.label}</label>` :
    '';
  let errors = options.errors;
  let errorsPosition =
    errors && errors.position ?
    errors && errors.position :
    'beforeAppend';
  let errorsClass =
    errors && errors.class ?
    errors && errors.class :
    'errors'
  let errorsHTML = `<div class="${errorsClass}"></div>`;
  let controlHTML = '<input>';
  let html;
  
  switch (errorsPosition) {
    case 'beforePrepend':
      html = errorsHTML + prepend + label + controlHTML + append;
      break;
    case 'beforeLabel':
      html = prepend + errorsHTML + label + controlHTML + append;
      break;
    case 'beforeControl':
      html = prepend + label + errorsHTML + controlHTML + append;
      break;
    case 'beforeAppend':
      html = prepend + label + controlHTML + errorsHTML + append;
      break;
    case 'afterAppend':
      html = prepend + label + controlHTML + append + errorsHTML;
      break;
  }

  let controlId = 'input'; // to identify it in the DOM when it's rendered
  let errorsId = errorsClass; // for this too

  let wrapper = document.createElement('div');
  wrapper.className = (options.wrapper && options.wrapper.class) || '';
  wrapper.innerHTML = html;
  let controlRef = wrapper.querySelector(controlId);
  let errorsRef = wrapper.querySelector('.'+errorsId);

  if (options.attributes) {
    options.attributes.forEach(attr => {
      controlRef.setAttribute(attr.name, attr.value);
    });
  }

  // let validators = bindValidators(control, options.validators);

  let control = {
    keyName: options.keyName || '',
    ref: wrapper,
    controlRef: controlRef,
    errors: {
      ref: errorsRef,
      items: {}
    },
    required: options.required || false,
    valid: null,
    validators: options.validators || [],
    validate: validate
  };

  bindErrorHandling(control);

  if (options.handlersObjs) {
    let events = {};
    let handlersObjs = options.handlers;
    handlersObjs.forEach(obj => {
      if (!events[obj.event]) {
        events[obj.event] = [];
      }
      events[obj.event].push(obj.handler);
    });
    Object.keys(events).forEach(eventName => {
      control.controlRef.addEventListener(eventName, evt => {
        events[eventName].forEach(handler => handler(evt));
      });
    });
  }

  Object.defineProperty(control, 'value', {
    get: function() {return this.controlRef.value},
    set: function(newValue) {this.controlRef.value = newValue}
  })

  return control;
};

const getHandler = function(tag) {
  let fn;
  // Switch seems to be faster than object look up
  // Search for 'js switch vs object'
  switch(tag) {
    case 'input':
      fn = tagInput;
      break;
  }
  return fn;
};

const FormControl = function(options) {
  return getHandler(options.tag)(options)
};

module.exports = FormControl;
},{}],9:[function(require,module,exports){
const FormControl = require('./FormControl');

const validate = function(validator, form) {
  let items = form.errors.items;
  let values = validator.controls.map(ctrl => ctrl.value);
  let result = validator.handler(values);
  if (!result.valid && !items[validator.name]) {
    let element = document.createElement('li');
    element.innerHTML = result.message;
    items[validator.name] = {
      ref: element
    };
    form.errors.ref.appendChild(element);
    return;
  }
  if (result.valid && items[validator.name]) {
    items[validator.name].ref.remove();
    items[validator.name] = null;
  }
};

const Form = function(options) {
  const formControls = options.controls.map(ctrl => new FormControl(ctrl));
  let validators = options.validators || [];
  let wrapper = document.createElement('form');
  let errorsWrapper = document.createElement('div');
  let submitWrapper = document.createElement('div');
  let formControlsRefs = formControls.map(ctrl => ctrl.ref);
  errorsWrapper.className = 'errors';
  submitWrapper.className = 'actions';
  submitWrapper.innerHTML = '<input type="submit" value="Submit" />';
  submitRef = submitWrapper.querySelector('input[type="submit"]');

  [errorsWrapper, ...formControlsRefs, submitWrapper]
    .forEach(item => wrapper.appendChild(item));
  
  let form = {
    ref: wrapper,
    errors: {
      ref: errorsWrapper,
      items: {}
    },
    controls: formControls,
    submit: {
      handler: options.submit.handler
    }
  };

  options.validators.forEach(validator => {
    validator.controls.forEach(control => {
      control.addEventListener('input', () => {
        validate(validator, form);
      });
    });
  });

  submitRef.addEventListener('click', evt => {
    evt.preventDefault();
    let errorsAmount = 0;
    validators.forEach(validator => validate(validator, form));
    form.controls.forEach(ctrl => ctrl.validate());
    Object.values(form.errors.items).forEach(val => {
      if (!!val) {
        errorsAmount++;
      }
    });
    form.controls.forEach(ctrl => {
      Object.values(ctrl.errors.items).forEach(val => {
        if (!!val) {
          errorsAmount++;
        }
      });
    });
    if (errorsAmount > 0) {
      console.log('Form is not valid');
      return;
    }
    let values = {};
    form.controls.forEach(ctrl => {
      values[ctrl.keyName] = ctrl.value;
    });
    form.submit.handler(values, evt);
  });

  return form;
};

module.exports = Form;
},{"./FormControl":8}],10:[function(require,module,exports){
const app = require('csp-app/state.js');
const MainController = require('csp-app/components/root/MainController.js');

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

  else if (handler instanceof Array) {
    routeObj.children = handler;
  }

  else {
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
      // In case it's terminal route
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
};

Router.prototype.navigate = function(link) {
  link = this.trimRoute(link);
  let route = this.getRoute(link);
  if (!route) {
    console.log('Error while navigating route');
    return;
  }
  route.handler(route.params);
  console.log(link)
  history.pushState('', '', '/' + link);
};

const Subrouter = function() {
  this.routes = [];
};
Subrouter.prototype = Router.prototype;
Router.Subrouter = Subrouter;

module.exports = Router;
},{"csp-app/components/root/MainController.js":3,"csp-app/state.js":11}],11:[function(require,module,exports){
const app = {
    components: {},
    path: []
};

module.exports = app;
},{}]},{},[1]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzb3VyY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBSb290ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QnKTtcbi8vIGNvbnN0IFN0YXJ0UGFnZSA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9zdGFydHBhZ2UnKTtcbmNvbnN0IERhc2hib2FyZCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmQnKTtcbmNvbnN0IE1haW5Db250cm9sbGVyID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QvTWFpbkNvbnRyb2xsZXInKTtcbmNvbnN0IGFwcCA9IHJlcXVpcmUoJ2NzcC1hcHAvc3RhdGUuanMnKTtcbi8vIGNvbnN0IFRlc3QgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvdGVzdCcpO1xuXG5jb25zdCBSb3V0ZXIgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvcm91dGVyJylcbmNvbnN0IFN0YXJ0ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3N0YXJ0L3N0YXJ0Jyk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBjb25zdCBsaW5rID0gZXZ0LnRhcmdldC5jbG9zZXN0KCdhJyk7XG5cbiAgICBpZiAobGluayAmJiBsaW5rLmRhdGFzZXQucm91dGUpIHtcbiAgICAgICAgUm91dGVyLm5hdmlnYXRlKGxpbmsuZGF0YXNldC5yb3V0ZSk7XG4gICAgfVxufSk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIGV2dCA9PiB7XG4gICAgY29uc29sZS5sb2coJ3BhZ2UgY2hhbmdlZDogJywgZG9jdW1lbnQubG9jYXRpb24pO1xuICAgIGNvbnNvbGUubG9nKGV2dCk7XG4gICAgUm91dGVyLm5hdmlnYXRlKGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lKTtcbn0pO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oZXZ0KSB7XG4gICAgbGV0IHBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgY29uc3Qgcm9vdEluc3RhbmNlID0gUm9vdC5jcmVhdGUoKTtcbiAgICBNYWluQ29udHJvbGxlci5pbml0aWFsaXplKHJvb3RJbnN0YW5jZSk7XG5cbiAgICBjb25zb2xlLmxvZyhwYXRoKTtcblxuICAgIC8vIHBhdGggPSBwYXRoWzBdID09PSAnLycgPyBwYXRoLnN1YnN0cigxKTogcGF0aDtcbiAgICAvLyBwYXRoID0gcGF0aFtwYXRoLmxlbmd0aC0xXSA9PT0gJy8nID8gcGF0aC5zdWJzdHIoMCwgcGF0aC5sZW5ndGgtMSkgOiBwYXRoO1xuXG4gICAgLy8gbGV0IHJvdXRlcyA9IFtcbiAgICAvLyAgICAge1xuICAgIC8vICAgICAgICAgcmVnZXhwOiAvXmdlbnJlcyQvZ2ksXG4gICAgLy8gICAgICAgICBoYW5kbGVyOiAnZ2VucmVzIGhhbmRsZXInXG4gICAgLy8gICAgIH0sXG4gICAgLy8gICAgIHtcbiAgICAvLyAgICAgICAgIHJlZ2V4cDogL15nZW5yZXNcXC8oW15cXC9cXHNdKykoPzpcXC98JCkvZ2ksXG4gICAgLy8gICAgICAgICBwYXJhbXNOYW1lczogWydnZW5yZSddLFxuICAgIC8vICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAvLyAgICAgICAgICAgICB7XG4gICAgLy8gICAgICAgICAgICAgICAgIHJlZ2V4cDogL15cXC8kL2dpLFxuICAgIC8vICAgICAgICAgICAgICAgICBoYW5kbGVyOiAnZ2VucmUgaGFuZGxlcidcbiAgICAvLyAgICAgICAgICAgICB9LFxuICAgIC8vICAgICAgICAgICAgIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgcmVnZXhwOiAvXm1vdmllcyg/OlxcL3wkKS9naSxcbiAgICAvLyAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICByZWdleHA6IC9eXFwvJC9naSxcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyOiAnbW92aWVzIGhhbmRsZXInXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB9LFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAge1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2V4cDogL14oW15cXC9cXHNdKykkL2dpLFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtc05hbWVzOiBbJ21vdmllJ10sXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcjogJ21vdmllIGhhbmRsZXInXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICAgICAgICAgIF1cbiAgICAvLyAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICBdXG4gICAgLy8gICAgIH1cbiAgICAvLyBdO1xuXG4gICAgY29uc3Qgcm91dGVyID0gbmV3IFJvdXRlcigpO1xuICAgIC8vIHJvdXRlclxuICAgIC8vICAgICAuYWRkUm91dGUoJ2dlbnJlcy8oOmdlbnJlKS9tb3ZpZXMnLCBmdW5jdGlvbigpe2NvbnNvbGUubG9nKCdyb3V0ZSAxJyl9KVxuICAgIC8vICAgICAuYWRkUm91dGUoJ2dlbnJlcy8oOmdlbnJlKS9tb3ZpZXMvKDptb3ZpZSknLCBmdW5jdGlvbigpe2NvbnNvbGUubG9nKCdyb3V0ZSAyJyl9KVxuICAgIC8vICAgICAuYWRkUm91dGUoJ2xpYi8oOmJvb2spJywgZnVuY3Rpb24oKXtjb25zb2xlLmxvZygncm91dGUgMycpfSlcblxuICAgIC8vIGNvbnNvbGUubG9nKHJvdXRlci5yb3V0ZXMpXG5cbiAgICAvLyBjb25zb2xlLmxvZygnUm91dGVyOiAnLCBSb3V0ZXIpXG4gICAgLy8gY29uc29sZS5sb2coJ1JvdXRlci5wcm90b3R5cGU6ICcsIFJvdXRlci5wcm90b3R5cGUpXG4gICAgLy8gY29uc29sZS5sb2coJ3JvdXRlcjogJywgcm91dGVyKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKCdjb25zdHJ1Y3RvcjE6ICcsIFJvdXRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPT09IFJvdXRlcilcbiAgICAvLyBjb25zb2xlLmxvZygnY29uc3RydWN0b3IyOiAnLCByb3V0ZXIuX19wcm90b19fLmNvbnN0cnVjdG9yID09PSBSb3V0ZXIpXG4gICAgcm91dGVyXG4gICAgICAgIC5hZGRSb3V0ZSgnLycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgTWFpbkNvbnRyb2xsZXIucmVuZGVyQ2hhaW4oW25ldyBTdGFydCgpXSlcbiAgICAgICAgfSlcbiAgICBcblxuICAgIHJvdXRlci5uYXZpZ2F0ZShwYXRoKVxufSk7XG59LHtcImNzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmRcIjoyLFwiY3NwLWFwcC9jb21wb25lbnRzL3Jvb3RcIjo0LFwiY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QvTWFpbkNvbnRyb2xsZXJcIjozLFwiY3NwLWFwcC9jb21wb25lbnRzL3N0YXJ0L3N0YXJ0XCI6NixcImNzcC1hcHAvbGlicy9yb3V0ZXJcIjoxMCxcImNzcC1hcHAvc3RhdGUuanNcIjoxMX1dLDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgRGFzaGJvYXJkID0ge1xuICAgIGh0bWw6IGBcbiAgICAgICAgPGRpdiBpZD1cImRhc2hib2FyZFwiPlxuICAgICAgICAgICAgPGgxPkhlbGxvIHdvcmxkITwvaDE+XG4gICAgICAgICAgICA8YSBkYXRhLXJvdXRlPVwidGVzdFwiPkdvIHRvIFRlc3QgY29tcG9uZW50PC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGluc3RhbnRpYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgdGVtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0ZW1wLmlubmVySFRNTCA9IHRoaXMuaHRtbDtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRlbXAuZmlyc3RFbGVtZW50Q2hpbGRcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZWZlcmVuY2U6IGVsZW1lbnQsXG4gICAgICAgICAgICBhY3Rpb25zOiB7XG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbihET01UcmVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoRE9NVHJlZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEYXNoYm9hcmQ7XG59LHt9XSwzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGFwcCA9IHJlcXVpcmUoJ2NzcC1hcHAvc3RhdGUuanMnKTtcblxuY29uc3QgTWFpbkNvbnRyb2xsZXIgPSB7XG4gICAgcm9vdDogbnVsbCxcbiAgICBwYXRoOiBbXSxcbiAgICAvLyByZW5kZXI6IGZ1bmN0aW9uKGNvbXBvbmVudHNPYmplY3RzKSB7XG4gICAgICAgIFxuICAgIC8vICAgICAvLyBjb25zdCBhbGxSb3V0ZXJzRXhpc3QgPSBpbnN0YW5jZXMuZXZlcnkoaW5zdGFuY2UgPT4gISFpbnN0YW5jZS5yb3V0ZXJPdXRsZXQpO1xuICAgIC8vICAgICAvLyBpZiAoIWFsbFJvdXRlcnNFeGlzdCkgdGhyb3cgbmV3IEVycm9yKCdPbmUgb3IgbW9yZSByb3V0ZXIgb3V0bGV0cyBkbyBub3QgZXhpc3QnKTtcbiAgICAgICAgXG4gICAgLy8gICAgIGNvbnN0IGluZGV4ID0gdGhpcy5wYXRoLmZpbmRJbmRleCgocGFydCwgaSkgPT4ge1xuICAgIC8vICAgICAgICAgcmV0dXJuIHBhcnQucGF0aCAhPT0gY29tcG9uZW50c09iamVjdHNbaV0ucGF0aFxuICAgIC8vICAgICB9KTtcbiAgICAvLyAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAvLyAgICAgICAgIGNvbXBvbmVudHNPYmplY3RzLnNwbGljZSgwLCBpbmRleCk7XG4gICAgLy8gICAgICAgICB0aGlzLnBhdGguc3BsaWNlKGluZGV4KTtcbiAgICAvLyAgICAgICAgIHRoaXMucGF0aC5jb25jYXQoY29tcG9uZW50c09iamVjdHMpO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGVsc2Uge1xuICAgIC8vICAgICAgICAgdGhpcy5wYXRoID0gY29tcG9uZW50c09iamVjdHM7XG4gICAgLy8gICAgIH1cblxuICAgIC8vICAgICBpZiAodGhpcy5wYXRoLmxlbmd0aCA9PT0gY29tcG9uZW50c09iamVjdHMubGVuZ3RoKSB7XG5cbiAgICAvLyAgICAgfVxuICAgICAgICBcblxuICAgIC8vICAgICBpZiAoY29tcG9uZW50c09iamVjdHMubGVuZ3RoID4gMCkge1xuICAgIC8vICAgICAgICAgbGV0IGluc3RhbmNlcyA9IGNvbXBvbmVudHNPYmplY3RzLm1hcChjbyA9PiBjby5jb21wb25lbnQuaW5zdGFudGlhdGUoY28ucGFyYW1ldGVycykpO1xuICAgIC8vICAgICAgICAgLy8gY29uc29sZS5sb2coJ2luc3RhbmNlcycsIGluc3RhbmNlcylcbiAgICAvLyAgICAgICAgIGNvbnN0IHJlbmRlcmVkQ2hhaW4gPSBpbnN0YW5jZXMucmV2ZXJzZSgpLnJlZHVjZSgoYWNjdW11bGF0b3IsIGluc3RhbmNlKSA9PiB7XG4gICAgLy8gICAgICAgICAgICAgaWYgKCEhYWNjdW11bGF0b3IpIGluc3RhbmNlLmFjdGlvbnMucmVuZGVyKGFjY3VtdWxhdG9yLnJlZmVyZW5jZSk7XG4gICAgLy8gICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIC8vICAgICAgICAgfSwgbnVsbCk7XG4gICAgLy8gICAgICAgICBjb25zb2xlLmxvZygncmVuZGVyZWRDaGFpbicsIHJlbmRlcmVkQ2hhaW4pXG4gICAgLy8gICAgICAgICBNYWluQ29udHJvbGxlci5yb290LnJlbmRlcihyZW5kZXJlZENoYWluLnJlZmVyZW5jZSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyB9LFxuICAgIHJlbmRlckNoYWluOiBmdW5jdGlvbihjb21wb25lbnRzKSB7XG4gICAgICBjb21wb25lbnRzLnJlZHVjZSgoYWNjLCBjb21wb25lbnQpID0+IHtcbiAgICAgICAgYWNjLnJlbmRlcihjb21wb25lbnQuZWxlbWVudCk7XG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgICB9LCB0aGlzLnJvb3QpXG4gICAgfSxcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihyb290SW5zdGFuY2UpIHtcbiAgICAgIHRoaXMucm9vdCA9IHJvb3RJbnN0YW5jZTtcbiAgICAgIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gJyc7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHJvb3RJbnN0YW5jZS5yZWZlcmVuY2UpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFpbkNvbnRyb2xsZXI7XG59LHtcImNzcC1hcHAvc3RhdGUuanNcIjoxMX1dLDQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgUm9vdCA9IHtcbiAgICBjb21wb25lbnROYW1lOiAnYXBwJyxcbiAgICBodG1sOiBgPGRpdiBpZD1cImFwcFwiPjwvZGl2PmAsXG4gICAgaWRlbnRpZmllcjogJyNhcHAnLFxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIENvbnNpZGVyIHJlaW1wbGVtZW50aW5nIHdpdGggSFRNTDUgdGVtcGxhdGUgZmVhdHVyZSBpbnN0ZWFkIGp1c3QgdXRpbGl6aW5nIGRpdlxuICAgICAgICBjb25zdCB0bXBFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRtcEVsZW0uaW5uZXJIVE1MID0gdGhpcy5odG1sO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdG1wRWxlbS5maXJzdENoaWxkO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZWZlcmVuY2U6IGVsZW1lbnQsXG4gICAgICAgICAgICByb3V0ZXJPdXRsZXQ6IGVsZW1lbnQsXG4gICAgICAgICAgICBjb21wb25lbnROYW1lOiB0aGlzLmNvbXBvbmVudE5hbWUsXG4gICAgICAgICAgICBzdGF0ZToge30sXG4gICAgICAgICAgICBhY3Rpb25zOiAoZnVuY3Rpb24ocm91dGVyT3V0bGV0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZDogZnVuY3Rpb24oZnJhZ21lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlck91dGxldC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlck91dGxldC5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoZWxlbWVudCksXG4gICAgICAgICAgICByZW5kZXI6IChmdW5jdGlvbihyb3V0ZXJPdXRsZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oRE9NVHJlZSkge1xuICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIHJvdXRlck91dGxldC5hcHBlbmRDaGlsZChET01UcmVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KShlbGVtZW50KVxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb290O1xufSx7fV0sNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBGb3JtID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2Zvcm1zJyk7XG5cbmNvbnN0IG1pbkxlbmd0aCA9IGZ1bmN0aW9uKHZhbHVlLCBjb250cm9sKSB7XG4gIHJldHVybiB7XG4gICAgdmFsaWQ6IHZhbHVlLmxlbmd0aCA+PSA1LFxuICAgIG1lc3NhZ2U6ICdUaGlzIGZpZWxkc1xcJ3MgbGVuZ3RoIGlzIGxlc3MgdGhhbiA1IGNoYXJzJ1xuICB9XG59O1xuXG5jb25zdCBtYXhMZW5ndGggPSBmdW5jdGlvbih2YWx1ZSwgY29udHJvbCkge1xuICByZXR1cm4ge1xuICAgIHZhbGlkOiB2YWx1ZS5sZW5ndGggPD0gMTAsXG4gICAgbWVzc2FnZTogJ1RoaXMgZmllbGRzXFwncyBsZW5ndGggaXMgZ3JlYXRlciB0aGFuIDEwIGNoYXJzJ1xuICB9XG59O1xuXG5jb25zdCBzdGFydHNXaXRoTnVtYmVyID0gZnVuY3Rpb24odmFsdWUsIGNvbnRyb2wpIHtcbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogIS9eXFxkKy9pLnRlc3QodmFsdWUpLFxuICAgIG1lc3NhZ2U6ICdVc2VybmFtZSBtdXN0IG5vdCBzdGFydCB3aXRoIG51bWJlcnMnXG4gIH1cbn07XG5cbmNvbnN0IHVzZXJuYW1lID0ge1xuICBrZXlOYW1lOiAndXNlcm5hbWUnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXVzZXJuYW1lJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnVXNlcm5hbWUnfVxuICBdLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdtYXhMZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWF4TGVuZ3RoXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnc3RhcnRzV2l0aE51bWJlcicsXG4gICAgICBoYW5kbGVyOiBzdGFydHNXaXRoTnVtYmVyXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBwYXNzd29yZCA9IHtcbiAga2V5TmFtZTogJ3Bhc3N3b3JkJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1wYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAncGFzc3dvcmQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdQYXNzd29yZCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGxvZ2luRm9ybSA9IG5ldyBGb3JtKHtcbiAgdmFsaWRhdG9yczogW10sXG4gIHN1Ym1pdDoge1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uKHZhbHVlcywgZXZ0KSB7XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3JtIGlzIGNsZWFuJyk7XG4gICAgfVxuICB9LFxuICBjb250cm9sczogW1xuICAgIHVzZXJuYW1lLFxuICAgIHBhc3N3b3JkXG4gIF1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9naW5Gb3JtOiBsb2dpbkZvcm1cbn07XG59LHtcImNzcC1hcHAvbGlicy9mb3Jtc1wiOjl9XSw2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmZ1bmN0aW9uIFNpbmdsZXRvbihmbikge1xuICBmdW5jdGlvbiBDbGFzcygpIHtcbiAgICBpZiAoQ2xhc3MuaW5zdGFuY2UpIHtcbiAgICAgIHJldHVybiBDbGFzcy5pbnN0YW5jZTtcbiAgICB9XG5cbiAgICByZXR1cm4gQ2xhc3MuaW5zdGFuY2UgPSBmbigpO1xuICB9XG5cbiAgQ2xhc3MuZ2V0SW5zdGFuY2UgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gQ2xhc3MuaW5zdGFuY2UgfHwgbmV3IENsYXNzKCk7XG4gIH07XG5cbiAgQ2xhc3MuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIENsYXNzLmluc3RhbmNlID0gbnVsbDtcbiAgfTtcblxuICByZXR1cm4gQ2xhc3M7XG59XG5cbmNvbnN0IHRlbXBsYXRlID0gcmVxdWlyZSgnLi9zdGFydC50cGwnKTtcbmNvbnN0IE1haW5Db250cm9sbGVyID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QvTWFpbkNvbnRyb2xsZXInKTtcbmNvbnN0IGZvcm1zID0gcmVxdWlyZSgnLi9mb3JtcycpO1xuXG5jb25zdCBTdGFydCA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHdyYXBwZXIuaWQgPSAnc3RhcnQtY29tcG9uZW50JztcbiAgd3JhcHBlci5pbm5lckhUTUwgPSB0ZW1wbGF0ZSgpO1xuICB3cmFwcGVyLnF1ZXJ5U2VsZWN0b3IoJyNsb2dpbiAubG9naW4tZm9ybScpLmFwcGVuZENoaWxkKGZvcm1zLmxvZ2luRm9ybS5yZWYpO1xuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudDogd3JhcHBlcixcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaW5nbGV0b24oU3RhcnQpO1xufSx7XCIuL2Zvcm1zXCI6NSxcIi4vc3RhcnQudHBsXCI6NyxcImNzcC1hcHAvY29tcG9uZW50cy9yb290L01haW5Db250cm9sbGVyXCI6M31dLDc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuLy8gY29uc3QgdGU7XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKGRhdGEpIHtcbiAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPVwid3JhcHBlclwiPlxuICAgICAgPGRpdiBjbGFzcz1cInN0YXJ0cGFnZVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibG9nby1ibG9ja1wiPlxuICAgICAgICAgIDxoMT5XZWxjb21lIHRvIENvbnN1bHRpbmcgU2VydmljZXMgUGxhdGZvcm08L2gxPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgXG4gICAgICAgIDxhIGRhdGEtcm91dGU9XCIvXCI+SG9tZTwvYT5cbiAgICAgICAgPGEgZGF0YS1yb3V0ZT1cIi9kYXNoYm9hcmRcIj5EYXNoYm9hcmQ8L2E+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1haW4tYWN0aW9uc1wiPlxuICAgICAgICAgIDxidXR0b24gaWQ9XCJsb2dpbi1zd2l0Y2hcIj5Mb2cgaW48L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIGlkPVwic2lnbnVwLXN3aXRjaFwiPlNpZ24gdXA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cImxvZ2luXCIgaWQ9XCJsb2dpblwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJoZWFkZXJcIj48aDI+TG9nIGluPC9oMj48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibG9naW4tZm9ybSBmb3JtXCI+XG4gICAgICAgICAgICBcbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIFxuICAgICAgICA8ZGl2IGNsYXNzPVwic2lnbnVwXCIgaWQ9XCJzaWdudXBcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFiLWFjdGlvbnMgY2xlYXJmaXhcIj5cbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCJjbGllbnQtc3dpdGNoXCI+U2lnbiB1cCBhcyBjbGllbnQ8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCJleGVjLXN3aXRjaFwiPlNpZ24gdXAgYXMgZXhlY3V0b3I8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNpZ251cC1mb3JtXCIgaWQ9XCJzaWdudXAtZm9ybVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNsaWVudC1mb3JtIGZvcm1cIiBpZD1cImNsaWVudC1mb3JtXCI+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXhlYy1mb3JtIGZvcm1cIiBpZD1cImV4ZWMtZm9ybVwiPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBcbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xufSx7fV0sODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4vLyBjb25zdCBiaW5kVmFsaWRhdG9ycyA9IGZ1bmN0aW9uKGNvbnRyb2wsIHZhbGlkYXRvcnMpIHtcbi8vICAgcmV0dXJuIHZhbGlkYXRvcnMubWFwKHZhbGlkYXRvciA9PiB2YWxpZGF0b3IuYmluZChjb250cm9sKSk7XG4vLyB9O1xuXG5jb25zdCB2YWxpZGF0ZSA9IGZ1bmN0aW9uKGNvbnRyb2wpIHtcbiAgY29udHJvbCA9IGNvbnRyb2wgfHwgdGhpcztcbiAgbGV0IGFkZCA9IHt9O1xuICBsZXQgcmVtb3ZlID0ge307XG4gIGxldCBpdGVtcyA9IGNvbnRyb2wuZXJyb3JzLml0ZW1zO1xuICBsZXQgdmFsaWRhdG9ycyA9IGNvbnRyb2wudmFsaWRhdG9ycztcblxuICAvLyB2YWxpZGF0b3JzID0gdmFsaWRhdG9ycy5maWx0ZXIodmFsaWRhdG9yID0+IHtcbiAgLy8gICBsZXQgcmVzdWx0ID0gdmFsaWRhdG9yLmNvbmRpdGlvbnMuZXZlcnkoZm4gPT4gZm4oY29udHJvbC52YWx1ZSkpO1xuICAvLyAgIGlmICghcmVzdWx0ICYmIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAvLyAgICAgcmVtb3ZlW3ZhbGlkYXRvci5uYW1lXSA9IHRydWU7XG4gIC8vICAgfVxuICAvLyAgIHJldHVybiByZXN1bHQ7XG4gIC8vIH0pO1xuXG4gIGlmIChjb250cm9sLnZhbHVlID09PSAnJykge1xuICAgIE9iamVjdC5rZXlzKGl0ZW1zKS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgaWYgKCEhaXRlbXNbaXRlbV0pIHJlbW92ZVtpdGVtXSA9IHRydWU7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoY29udHJvbC5yZXF1aXJlZCAmJiBjb250cm9sLnZhbHVlID09PSAnJykge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9ICdUaGlzIGZpZWxkIGlzIHJlcXVpcmVkJztcbiAgICBpdGVtc1sncmVxdWlyZWQnXSA9IHtcbiAgICAgIHJlZjogZWxlbWVudFxuICAgIH1cbiAgICBjb250cm9sLmVycm9ycy5yZWYuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgLy8gcmV0dXJuO1xuICB9XG5cbiAgLy8gaWYgKCFjb250cm9sLnJlcXVpcmVkICYmIGNvbnRyb2wudmFsdWUgPT09ICcnKSB7XG4gIC8vICAgcmV0dXJuO1xuICAvLyB9XG5cbiAgaWYgKGNvbnRyb2wudmFsdWUubGVuZ3RoID4gMCAmJiAhIWl0ZW1zWydyZXF1aXJlZCddKSB7XG4gICAgcmVtb3ZlWydyZXF1aXJlZCddID0gdHJ1ZTtcbiAgfVxuXG4gIGlmIChjb250cm9sLnZhbHVlICE9PSAnJykge1xuICAgIHZhbGlkYXRvcnMuZm9yRWFjaCh2YWxpZGF0b3IgPT4ge1xuICAgICAgbGV0IHJlc3VsdCA9IHZhbGlkYXRvci5oYW5kbGVyKGNvbnRyb2wudmFsdWUsIGNvbnRyb2wpO1xuICAgICAgaWYgKCFyZXN1bHQudmFsaWQgJiYgIWl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgICAgICBhZGRbdmFsaWRhdG9yLm5hbWVdID0gcmVzdWx0O1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAocmVzdWx0LnZhbGlkICYmIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgICAgICByZW1vdmVbdmFsaWRhdG9yLm5hbWVdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIE9iamVjdC5rZXlzKGFkZCkuZm9yRWFjaChlcnJvciA9PiB7XG4gICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gYWRkW2Vycm9yXS5tZXNzYWdlO1xuICAgIGl0ZW1zW2Vycm9yXSA9IHtcbiAgICAgIHJlZjogZWxlbWVudFxuICAgIH07XG4gICAgY29udHJvbC5lcnJvcnMucmVmLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICB9KTtcblxuICBPYmplY3Qua2V5cyhyZW1vdmUpLmZvckVhY2goZXJyb3IgPT4ge1xuICAgIGl0ZW1zW2Vycm9yXS5yZWYucmVtb3ZlKCk7XG4gICAgaXRlbXNbZXJyb3JdID0gbnVsbDtcbiAgfSk7XG59O1xuXG5jb25zdCBiaW5kRXJyb3JIYW5kbGluZyA9IGZ1bmN0aW9uKGNvbnRyb2wpIHtcbiAgY29udHJvbC5jb250cm9sUmVmLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgIHZhbGlkYXRlKGNvbnRyb2wpO1xuICB9KTtcbn07XG5cbmNvbnN0IHRhZ0lucHV0ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBsZXQgcHJlcGVuZCA9IG9wdGlvbnMucHJlcGVuZCB8fCAnJztcbiAgbGV0IGFwcGVuZCA9IG9wdGlvbnMuYXBwZW5kIHx8ICcnO1xuICBsZXQgbGFiZWwgPVxuICAgIG9wdGlvbnMubGFiZWwgP1xuICAgIGA8bGFiZWwgZm9yPVwiJHtvcHRpb25zLmlkfVwiPiR7b3B0aW9ucy5sYWJlbH08L2xhYmVsPmAgOlxuICAgICcnO1xuICBsZXQgZXJyb3JzID0gb3B0aW9ucy5lcnJvcnM7XG4gIGxldCBlcnJvcnNQb3NpdGlvbiA9XG4gICAgZXJyb3JzICYmIGVycm9ycy5wb3NpdGlvbiA/XG4gICAgZXJyb3JzICYmIGVycm9ycy5wb3NpdGlvbiA6XG4gICAgJ2JlZm9yZUFwcGVuZCc7XG4gIGxldCBlcnJvcnNDbGFzcyA9XG4gICAgZXJyb3JzICYmIGVycm9ycy5jbGFzcyA/XG4gICAgZXJyb3JzICYmIGVycm9ycy5jbGFzcyA6XG4gICAgJ2Vycm9ycydcbiAgbGV0IGVycm9yc0hUTUwgPSBgPGRpdiBjbGFzcz1cIiR7ZXJyb3JzQ2xhc3N9XCI+PC9kaXY+YDtcbiAgbGV0IGNvbnRyb2xIVE1MID0gJzxpbnB1dD4nO1xuICBsZXQgaHRtbDtcbiAgXG4gIHN3aXRjaCAoZXJyb3JzUG9zaXRpb24pIHtcbiAgICBjYXNlICdiZWZvcmVQcmVwZW5kJzpcbiAgICAgIGh0bWwgPSBlcnJvcnNIVE1MICsgcHJlcGVuZCArIGxhYmVsICsgY29udHJvbEhUTUwgKyBhcHBlbmQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdiZWZvcmVMYWJlbCc6XG4gICAgICBodG1sID0gcHJlcGVuZCArIGVycm9yc0hUTUwgKyBsYWJlbCArIGNvbnRyb2xIVE1MICsgYXBwZW5kO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmVmb3JlQ29udHJvbCc6XG4gICAgICBodG1sID0gcHJlcGVuZCArIGxhYmVsICsgZXJyb3JzSFRNTCArIGNvbnRyb2xIVE1MICsgYXBwZW5kO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmVmb3JlQXBwZW5kJzpcbiAgICAgIGh0bWwgPSBwcmVwZW5kICsgbGFiZWwgKyBjb250cm9sSFRNTCArIGVycm9yc0hUTUwgKyBhcHBlbmQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdhZnRlckFwcGVuZCc6XG4gICAgICBodG1sID0gcHJlcGVuZCArIGxhYmVsICsgY29udHJvbEhUTUwgKyBhcHBlbmQgKyBlcnJvcnNIVE1MO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICBsZXQgY29udHJvbElkID0gJ2lucHV0JzsgLy8gdG8gaWRlbnRpZnkgaXQgaW4gdGhlIERPTSB3aGVuIGl0J3MgcmVuZGVyZWRcbiAgbGV0IGVycm9yc0lkID0gZXJyb3JzQ2xhc3M7IC8vIGZvciB0aGlzIHRvb1xuXG4gIGxldCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHdyYXBwZXIuY2xhc3NOYW1lID0gKG9wdGlvbnMud3JhcHBlciAmJiBvcHRpb25zLndyYXBwZXIuY2xhc3MpIHx8ICcnO1xuICB3cmFwcGVyLmlubmVySFRNTCA9IGh0bWw7XG4gIGxldCBjb250cm9sUmVmID0gd3JhcHBlci5xdWVyeVNlbGVjdG9yKGNvbnRyb2xJZCk7XG4gIGxldCBlcnJvcnNSZWYgPSB3cmFwcGVyLnF1ZXJ5U2VsZWN0b3IoJy4nK2Vycm9yc0lkKTtcblxuICBpZiAob3B0aW9ucy5hdHRyaWJ1dGVzKSB7XG4gICAgb3B0aW9ucy5hdHRyaWJ1dGVzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBjb250cm9sUmVmLnNldEF0dHJpYnV0ZShhdHRyLm5hbWUsIGF0dHIudmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gbGV0IHZhbGlkYXRvcnMgPSBiaW5kVmFsaWRhdG9ycyhjb250cm9sLCBvcHRpb25zLnZhbGlkYXRvcnMpO1xuXG4gIGxldCBjb250cm9sID0ge1xuICAgIGtleU5hbWU6IG9wdGlvbnMua2V5TmFtZSB8fCAnJyxcbiAgICByZWY6IHdyYXBwZXIsXG4gICAgY29udHJvbFJlZjogY29udHJvbFJlZixcbiAgICBlcnJvcnM6IHtcbiAgICAgIHJlZjogZXJyb3JzUmVmLFxuICAgICAgaXRlbXM6IHt9XG4gICAgfSxcbiAgICByZXF1aXJlZDogb3B0aW9ucy5yZXF1aXJlZCB8fCBmYWxzZSxcbiAgICB2YWxpZDogbnVsbCxcbiAgICB2YWxpZGF0b3JzOiBvcHRpb25zLnZhbGlkYXRvcnMgfHwgW10sXG4gICAgdmFsaWRhdGU6IHZhbGlkYXRlXG4gIH07XG5cbiAgYmluZEVycm9ySGFuZGxpbmcoY29udHJvbCk7XG5cbiAgaWYgKG9wdGlvbnMuaGFuZGxlcnNPYmpzKSB7XG4gICAgbGV0IGV2ZW50cyA9IHt9O1xuICAgIGxldCBoYW5kbGVyc09ianMgPSBvcHRpb25zLmhhbmRsZXJzO1xuICAgIGhhbmRsZXJzT2Jqcy5mb3JFYWNoKG9iaiA9PiB7XG4gICAgICBpZiAoIWV2ZW50c1tvYmouZXZlbnRdKSB7XG4gICAgICAgIGV2ZW50c1tvYmouZXZlbnRdID0gW107XG4gICAgICB9XG4gICAgICBldmVudHNbb2JqLmV2ZW50XS5wdXNoKG9iai5oYW5kbGVyKTtcbiAgICB9KTtcbiAgICBPYmplY3Qua2V5cyhldmVudHMpLmZvckVhY2goZXZlbnROYW1lID0+IHtcbiAgICAgIGNvbnRyb2wuY29udHJvbFJlZi5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZXZ0ID0+IHtcbiAgICAgICAgZXZlbnRzW2V2ZW50TmFtZV0uZm9yRWFjaChoYW5kbGVyID0+IGhhbmRsZXIoZXZ0KSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb250cm9sLCAndmFsdWUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gdGhpcy5jb250cm9sUmVmLnZhbHVlfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7dGhpcy5jb250cm9sUmVmLnZhbHVlID0gbmV3VmFsdWV9XG4gIH0pXG5cbiAgcmV0dXJuIGNvbnRyb2w7XG59O1xuXG5jb25zdCBnZXRIYW5kbGVyID0gZnVuY3Rpb24odGFnKSB7XG4gIGxldCBmbjtcbiAgLy8gU3dpdGNoIHNlZW1zIHRvIGJlIGZhc3RlciB0aGFuIG9iamVjdCBsb29rIHVwXG4gIC8vIFNlYXJjaCBmb3IgJ2pzIHN3aXRjaCB2cyBvYmplY3QnXG4gIHN3aXRjaCh0YWcpIHtcbiAgICBjYXNlICdpbnB1dCc6XG4gICAgICBmbiA9IHRhZ0lucHV0O1xuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIGZuO1xufTtcblxuY29uc3QgRm9ybUNvbnRyb2wgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHJldHVybiBnZXRIYW5kbGVyKG9wdGlvbnMudGFnKShvcHRpb25zKVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtQ29udHJvbDtcbn0se31dLDk6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgRm9ybUNvbnRyb2wgPSByZXF1aXJlKCcuL0Zvcm1Db250cm9sJyk7XG5cbmNvbnN0IHZhbGlkYXRlID0gZnVuY3Rpb24odmFsaWRhdG9yLCBmb3JtKSB7XG4gIGxldCBpdGVtcyA9IGZvcm0uZXJyb3JzLml0ZW1zO1xuICBsZXQgdmFsdWVzID0gdmFsaWRhdG9yLmNvbnRyb2xzLm1hcChjdHJsID0+IGN0cmwudmFsdWUpO1xuICBsZXQgcmVzdWx0ID0gdmFsaWRhdG9yLmhhbmRsZXIodmFsdWVzKTtcbiAgaWYgKCFyZXN1bHQudmFsaWQgJiYgIWl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IHJlc3VsdC5tZXNzYWdlO1xuICAgIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSA9IHtcbiAgICAgIHJlZjogZWxlbWVudFxuICAgIH07XG4gICAgZm9ybS5lcnJvcnMucmVmLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAocmVzdWx0LnZhbGlkICYmIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXS5yZWYucmVtb3ZlKCk7XG4gICAgaXRlbXNbdmFsaWRhdG9yLm5hbWVdID0gbnVsbDtcbiAgfVxufTtcblxuY29uc3QgRm9ybSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgY29uc3QgZm9ybUNvbnRyb2xzID0gb3B0aW9ucy5jb250cm9scy5tYXAoY3RybCA9PiBuZXcgRm9ybUNvbnRyb2woY3RybCkpO1xuICBsZXQgdmFsaWRhdG9ycyA9IG9wdGlvbnMudmFsaWRhdG9ycyB8fCBbXTtcbiAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb3JtJyk7XG4gIGxldCBlcnJvcnNXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGxldCBzdWJtaXRXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGxldCBmb3JtQ29udHJvbHNSZWZzID0gZm9ybUNvbnRyb2xzLm1hcChjdHJsID0+IGN0cmwucmVmKTtcbiAgZXJyb3JzV3JhcHBlci5jbGFzc05hbWUgPSAnZXJyb3JzJztcbiAgc3VibWl0V3JhcHBlci5jbGFzc05hbWUgPSAnYWN0aW9ucyc7XG4gIHN1Ym1pdFdyYXBwZXIuaW5uZXJIVE1MID0gJzxpbnB1dCB0eXBlPVwic3VibWl0XCIgdmFsdWU9XCJTdWJtaXRcIiAvPic7XG4gIHN1Ym1pdFJlZiA9IHN1Ym1pdFdyYXBwZXIucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInN1Ym1pdFwiXScpO1xuXG4gIFtlcnJvcnNXcmFwcGVyLCAuLi5mb3JtQ29udHJvbHNSZWZzLCBzdWJtaXRXcmFwcGVyXVxuICAgIC5mb3JFYWNoKGl0ZW0gPT4gd3JhcHBlci5hcHBlbmRDaGlsZChpdGVtKSk7XG4gIFxuICBsZXQgZm9ybSA9IHtcbiAgICByZWY6IHdyYXBwZXIsXG4gICAgZXJyb3JzOiB7XG4gICAgICByZWY6IGVycm9yc1dyYXBwZXIsXG4gICAgICBpdGVtczoge31cbiAgICB9LFxuICAgIGNvbnRyb2xzOiBmb3JtQ29udHJvbHMsXG4gICAgc3VibWl0OiB7XG4gICAgICBoYW5kbGVyOiBvcHRpb25zLnN1Ym1pdC5oYW5kbGVyXG4gICAgfVxuICB9O1xuXG4gIG9wdGlvbnMudmFsaWRhdG9ycy5mb3JFYWNoKHZhbGlkYXRvciA9PiB7XG4gICAgdmFsaWRhdG9yLmNvbnRyb2xzLmZvckVhY2goY29udHJvbCA9PiB7XG4gICAgICBjb250cm9sLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICB2YWxpZGF0ZSh2YWxpZGF0b3IsIGZvcm0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHN1Ym1pdFJlZi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2dCA9PiB7XG4gICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgbGV0IGVycm9yc0Ftb3VudCA9IDA7XG4gICAgdmFsaWRhdG9ycy5mb3JFYWNoKHZhbGlkYXRvciA9PiB2YWxpZGF0ZSh2YWxpZGF0b3IsIGZvcm0pKTtcbiAgICBmb3JtLmNvbnRyb2xzLmZvckVhY2goY3RybCA9PiBjdHJsLnZhbGlkYXRlKCkpO1xuICAgIE9iamVjdC52YWx1ZXMoZm9ybS5lcnJvcnMuaXRlbXMpLmZvckVhY2godmFsID0+IHtcbiAgICAgIGlmICghIXZhbCkge1xuICAgICAgICBlcnJvcnNBbW91bnQrKztcbiAgICAgIH1cbiAgICB9KTtcbiAgICBmb3JtLmNvbnRyb2xzLmZvckVhY2goY3RybCA9PiB7XG4gICAgICBPYmplY3QudmFsdWVzKGN0cmwuZXJyb3JzLml0ZW1zKS5mb3JFYWNoKHZhbCA9PiB7XG4gICAgICAgIGlmICghIXZhbCkge1xuICAgICAgICAgIGVycm9yc0Ftb3VudCsrO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBpZiAoZXJyb3JzQW1vdW50ID4gMCkge1xuICAgICAgY29uc29sZS5sb2coJ0Zvcm0gaXMgbm90IHZhbGlkJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCB2YWx1ZXMgPSB7fTtcbiAgICBmb3JtLmNvbnRyb2xzLmZvckVhY2goY3RybCA9PiB7XG4gICAgICB2YWx1ZXNbY3RybC5rZXlOYW1lXSA9IGN0cmwudmFsdWU7XG4gICAgfSk7XG4gICAgZm9ybS5zdWJtaXQuaGFuZGxlcih2YWx1ZXMsIGV2dCk7XG4gIH0pO1xuXG4gIHJldHVybiBmb3JtO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtO1xufSx7XCIuL0Zvcm1Db250cm9sXCI6OH1dLDEwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGFwcCA9IHJlcXVpcmUoJ2NzcC1hcHAvc3RhdGUuanMnKTtcbmNvbnN0IE1haW5Db250cm9sbGVyID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QvTWFpbkNvbnRyb2xsZXIuanMnKTtcblxuY29uc3QgUm91dGVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucm91dGVzID0gW107XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLnJlZ2V4cFBhcmFtcyA9IC8oXFwoOihbXFx3XFxkXFwtX10rKVxcKSkvZ2k7XG5cblJvdXRlci5wcm90b3R5cGUudHJpbVJvdXRlID0gZnVuY3Rpb24ocm91dGUpe1xuICByb3V0ZSA9IHJvdXRlWzBdID09PSAnLydcbiAgICA/IHJvdXRlLnN1YnN0cigxKVxuICAgIDogcm91dGU7XG5cbiAgcm91dGUgPSByb3V0ZVtyb3V0ZS5sZW5ndGggLSAxXSA9PT0gJy8nXG4gICAgPyByb3V0ZS5zdWJzdHIoMCwgcm91dGUubGVuZ3RoIC0gMSlcbiAgICA6IHJvdXRlO1xuXG4gIHJldHVybiByb3V0ZTtcbn0sXG5cblJvdXRlci5wcm90b3R5cGUuZ2V0UGFyYW1zTmFtZXMgPSBmdW5jdGlvbihyb3V0ZSkge1xuICBsZXQgcmVzdWx0O1xuICBsZXQgcGFyYW1zTmFtZXMgPSBbXTtcbiAgd2hpbGUgKChyZXN1bHQgPSB0aGlzLnJlZ2V4cFBhcmFtcy5leGVjKHJvdXRlKSkgIT09IG51bGwpIHtcbiAgICBwYXJhbXNOYW1lcy5wdXNoKHJlc3VsdFsyXSk7XG4gIH1cbiAgcmV0dXJuIHBhcmFtc05hbWVzO1xufVxuXG5Sb3V0ZXIucHJvdG90eXBlLmFkZFJvdXRlID0gZnVuY3Rpb24ocm91dGUsIGhhbmRsZXIpIHtcbiAgcm91dGUgPSB0aGlzLnRyaW1Sb3V0ZShyb3V0ZSk7XG4gIGxldCBwYXJhbXNOYW1lcyA9IHRoaXMuZ2V0UGFyYW1zTmFtZXMocm91dGUpO1xuICBsZXQgcmVnZXhwU3RyID0gcm91dGUucmVwbGFjZSh0aGlzLnJlZ2V4cFBhcmFtcywgJ1tcXFxcd1xcXFxkXFwtX10rJyk7XG4gIGxldCByZWdleHAgPSBSZWdFeHAoYF4ke3JlZ2V4cFN0cn0oXFxcXC98JClgLCAnZ2knKTtcblxuICBsZXQgcm91dGVPYmogPSB7XG4gICAgcmVnZXhwOiByZWdleHAsXG4gICAgcGFyYW1zTmFtZXM6IHBhcmFtc05hbWVzXG4gIH07XG5cbiAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcm91dGVPYmouaGFuZGxlciA9IGhhbmRsZXI7XG4gIH1cblxuICBlbHNlIGlmIChoYW5kbGVyIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICByb3V0ZU9iai5jaGlsZHJlbiA9IGhhbmRsZXI7XG4gIH1cblxuICBlbHNlIHtcbiAgICBjb25zb2xlLmxvZygnRXJyb3Igb2NjdXJlZCB3aGlsZSBhZGRpbmcgcm91dGUnKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JvdXRlIGVycm9yJyk7XG4gIH1cblxuICB0aGlzLnJvdXRlcy5wdXNoKHJvdXRlT2JqKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLmdldFJvdXRlID0gZnVuY3Rpb24obGluaywgcm91dGVzID0gdGhpcy5yb3V0ZXMsIHBhcmFtcyA9IHt9KSB7XG4gIGxpbmsgPSBsaW5rID09PSAnJyA/ICcvJyA6IGxpbms7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoLCByb3V0ZSA9IHJvdXRlc1tpXTsgaSsrKSB7XG4gICAgbGV0IHJlZ2V4cCA9IHJvdXRlLnJlZ2V4cDtcbiAgICBsZXQgcmVzdWx0ID0gcmVnZXhwLmV4ZWMobGluayk7XG5cbiAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggPiAxKSB7XG4gICAgICBmb3IgKGxldCBpZHggPSAxOyBpZHggPCByZXN1bHQubGVuZ3RoOyBpZHgrKykge1xuICAgICAgICBwYXJhbXNbcm91dGUucGFyYW1zTmFtZXNbaWR4LTFdXSA9IHJlc3VsdFtpZHhdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZWdleHAubGFzdEluZGV4ID4gMCkge1xuICAgICAgbGluayA9IGxpbmsuc3Vic3RyKHJlZ2V4cC5sYXN0SW5kZXgpO1xuICAgIH1cblxuICAgIGlmIChyZWdleHAubGFzdEluZGV4ID4gMCAmJiBsaW5rLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChyb3V0ZS5jaGlsZHJlbiAmJiByb3V0ZS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxldCBjaGlsZHJlbkNoZWNrID0gdGhpcy5nZXRSb3V0ZShsaW5rLCByb3V0ZS5jaGlsZHJlbiwgcGFyYW1zKTtcbiAgICAgICAgaWYgKGNoaWxkcmVuQ2hlY2sgIT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gY2hpbGRyZW5DaGVjaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBlbHNlIGlmIChyZWdleHAubGFzdEluZGV4ID4gMCkge1xuICAgICAgLy8gSW4gY2FzZSBpdCdzIHRlcm1pbmFsIHJvdXRlXG4gICAgICBpZiAocm91dGUuaGFuZGxlcikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhhbmRsZXI6IHJvdXRlLmhhbmRsZXIsXG4gICAgICAgICAgcGFyYW1zOiBwYXJhbXNcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKHJvdXRlLmNoaWxkcmVuKSB7XG4gICAgICAgIGxldCBjaGlsZHJlbkNoZWNrID0gdGhpcy5nZXRSb3V0ZShsaW5rLCByb3V0ZS5jaGlsZHJlbiwgcGFyYW1zKTtcbiAgICAgICAgaWYgKGNoaWxkcmVuQ2hlY2sgIT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gY2hpbGRyZW5DaGVjaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cblJvdXRlci5wcm90b3R5cGUubmF2aWdhdGUgPSBmdW5jdGlvbihsaW5rKSB7XG4gIGxpbmsgPSB0aGlzLnRyaW1Sb3V0ZShsaW5rKTtcbiAgbGV0IHJvdXRlID0gdGhpcy5nZXRSb3V0ZShsaW5rKTtcbiAgaWYgKCFyb3V0ZSkge1xuICAgIGNvbnNvbGUubG9nKCdFcnJvciB3aGlsZSBuYXZpZ2F0aW5nIHJvdXRlJyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHJvdXRlLmhhbmRsZXIocm91dGUucGFyYW1zKTtcbiAgY29uc29sZS5sb2cobGluaylcbiAgaGlzdG9yeS5wdXNoU3RhdGUoJycsICcnLCAnLycgKyBsaW5rKTtcbn07XG5cbmNvbnN0IFN1YnJvdXRlciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJvdXRlcyA9IFtdO1xufTtcblN1YnJvdXRlci5wcm90b3R5cGUgPSBSb3V0ZXIucHJvdG90eXBlO1xuUm91dGVyLlN1YnJvdXRlciA9IFN1YnJvdXRlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBSb3V0ZXI7XG59LHtcImNzcC1hcHAvY29tcG9uZW50cy9yb290L01haW5Db250cm9sbGVyLmpzXCI6MyxcImNzcC1hcHAvc3RhdGUuanNcIjoxMX1dLDExOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGFwcCA9IHtcbiAgICBjb21wb25lbnRzOiB7fSxcbiAgICBwYXRoOiBbXVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBhcHA7XG59LHt9XX0se30sWzFdKTtcbiJdLCJmaWxlIjoic291cmNlLmpzIn0=
