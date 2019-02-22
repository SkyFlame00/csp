(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{"csp-app/components/dashboard":2,"csp-app/components/root":4,"csp-app/components/root/MainController":3,"csp-app/components/start/start":9,"csp-app/libs/router":17}],2:[function(require,module,exports){
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
  renderChain: function(components) {
    components.reduce((accumulator, component) => {
      accumulator.render(component.element);
      return component;
    }, this.root);
  },
  initialize: function(rootInstance) {
    this.root = rootInstance;
    document.body.innerHTML = '';
    document.body.appendChild(rootInstance.reference);
  }
};

module.exports = MainController;
},{"csp-app/state.js":25}],4:[function(require,module,exports){
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
const {minLength, maxLength, startsWithNumber} = require('csp-app/libs/forms/validators');

const username = {
  keyName: 'username',
  tag: 'input',
  id: 'loginform-username',
  label: '',
  attributes: [
    {name: 'type', value: 'text'},
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

const confirmPassword = {
  keyName: 'confirmPassword',
  tag: 'input',
  id: 'loginform-confirmPassword',
  label: '',
  attributes: [
    {name: 'type', value: 'password'},
    {name: 'placeholder', value: 'Confirm password'}
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

const email = {
  keyName: 'email',
  tag: 'input',
  id: 'loginform-password',
  label: '',
  attributes: [
    {name: 'type', value: 'text'},
    {name: 'placeholder', value: 'E-mail'}
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

const clientForm = new Form({
  validators: [],
  submit: {
    handler: function(values, evt) {
      evt.preventDefault();
      console.log('Form is clean');
    }
  },
  controls: [
    username,
    password,
    confirmPassword,
    email
  ]
});

module.exports = clientForm;
},{"csp-app/libs/forms":14,"csp-app/libs/forms/validators":15}],6:[function(require,module,exports){
const Form = require('csp-app/libs/forms');
const {minLength, maxLength, startsWithNumber} = require('csp-app/libs/forms/validators');

const username = {
  keyName: 'username',
  tag: 'input',
  id: 'loginform-username',
  label: '',
  attributes: [
    {name: 'type', value: 'text'},
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

const confirmPassword = {
  keyName: 'confirmPassword',
  tag: 'input',
  id: 'loginform-confirmPassword',
  label: '',
  attributes: [
    {name: 'type', value: 'password'},
    {name: 'placeholder', value: 'Confirm password'}
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

const email = {
  keyName: 'email',
  tag: 'input',
  id: 'loginform-password',
  label: '',
  attributes: [
    {name: 'type', value: 'text'},
    {name: 'placeholder', value: 'E-mail'}
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

const org = {
  keyName: 'org',
  tag: 'input',
  id: 'loginform-password',
  label: '',
  attributes: [
    {name: 'type', value: 'text'},
    {name: 'placeholder', value: 'Your organization'}
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

const execForm = new Form({
  validators: [],
  submit: {
    handler: function(values, evt) {
      evt.preventDefault();
      console.log('Form is clean');
    }
  },
  controls: [
    username,
    password,
    confirmPassword,
    email,
    org
  ]
});

module.exports = execForm;
},{"csp-app/libs/forms":14,"csp-app/libs/forms/validators":15}],7:[function(require,module,exports){
const Form = require('csp-app/libs/forms');
const {minLength, maxLength, startsWithNumber} = require('csp-app/libs/forms/validators');

const username = {
  keyName: 'username',
  tag: 'input',
  id: 'loginform-username',
  label: '',
  attributes: [
    {name: 'type', value: 'text'},
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

module.exports = loginForm;
},{"csp-app/libs/forms":14,"csp-app/libs/forms/validators":15}],8:[function(require,module,exports){
const loginForm = require('./LoginForm');
const clientForm = require('./ClientForm');
const execForm = require('./ExecForm');

module.exports = {
  loginForm,
  clientForm,
  execForm
};
},{"./ClientForm":5,"./ExecForm":6,"./LoginForm":7}],9:[function(require,module,exports){
const template = require('./start.tpl');
const tabs = require('./tabs');
const {createElementFromHTML, Singleton} = require('csp-app/libs/utilities');

const Start = function() {
  const element = createElementFromHTML(template());
  const tabsWrapper = element.querySelector('.start-tabs');
  tabsWrapper.appendChild(tabs.header.element);
  tabsWrapper.appendChild(tabs.content.element);

  return {
    element: element
  };
};

module.exports = Singleton(Start);
},{"./start.tpl":10,"./tabs":11,"csp-app/libs/utilities":24}],10:[function(require,module,exports){
function template(data) {
  return /*html*/`
    <div class="cmp_start">
      <div class="wrapper">
        <div class="container">
          <div class="logo-block">
            <h1>Welcome to Consulting Services Platform</h1>
          </div>
          
          <a data-route="/">Home</a>
          <a data-route="/dashboard">Dashboard</a>

          <div class="start-tabs"></div>
        </div>
      </div>
    </div>
  `;
}

module.exports = template;
},{}],11:[function(require,module,exports){
const Tabs = require('csp-app/libs/tabs');
const createElementFromHTML = require('csp-app/libs/utilities').createElementFromHTML;
const signupTabs = require('./signupTabs');
const loginForm = require('../forms/LoginForm');
const radialGradientOnHover = require('csp-app/libs/misc/button-effects/radialGradientOnHover');

const loginBlock = createElementFromHTML(/*html*/`
  <div class="login-block">
    <div class="header"><h2>Log in</h2></div>
    <div class="form"></div>
  </div>
`);

const signupBlock = createElementFromHTML(/*html*/`
  <div class="signup-block"></div>
`);

const startTabs = new Tabs({
  header: {
    className: 'main-actions',
    items: [
      {title: 'Log in', tag: 'button'},
      {title: 'Sign up', tag: 'button'}
    ]
  },
  content: {
    items: [
      loginBlock,
      signupBlock
    ]
  },
  animation: {
    name: 'loginSignupSwitch'
  }
});

const contentWrapper = document.createElement('div');
contentWrapper.classList.add('forms');
contentWrapper.appendChild(signupTabs.content.element);

startTabs.content.items[0].querySelector('.login-block .form').appendChild(loginForm.ref);
startTabs.content.items[1].appendChild(signupTabs.header.element);
startTabs.content.items[1].appendChild(contentWrapper);

startTabs.header.items.forEach(item => radialGradientOnHover(item, {padding: [10, 16]}));

module.exports = startTabs;
},{"../forms/LoginForm":7,"./signupTabs":12,"csp-app/libs/misc/button-effects/radialGradientOnHover":16,"csp-app/libs/tabs":23,"csp-app/libs/utilities":24}],12:[function(require,module,exports){
const Tabs = require('csp-app/libs/tabs');
const createElementFromHTML = require('csp-app/libs/utilities').createElementFromHTML;
const {clientForm, execForm} = require('../forms');
const radialGradientOnHover = require('csp-app/libs/misc/button-effects/radialGradientOnHover');

const clientFormBlock = createElementFromHTML(/*html*/`
  <div class="client-form form"></div>
`);

const execFormBlock = createElementFromHTML(/*html*/`
  <div class="exec-form form"></div>
`);

const signupTabs = new Tabs({
  header: {
    className: 'actions clearfix',
    items: [
      {title: 'Sign up as client', tag: 'button'},
      {title: 'Sign up as executor', tag: 'button'}
    ]
  },
  content: {
    items: [
      clientFormBlock,
      execFormBlock,
    ]
  },
  animation: {
    name: 'tabsFlowAnimation',
    params: {padding: 15, speed: 850}
  }
});

signupTabs.content.items[0].appendChild(clientForm.ref);
signupTabs.content.items[1].appendChild(execForm.ref);

signupTabs.header.items.forEach(item => radialGradientOnHover(item, {padding: 15}));

module.exports = signupTabs;
},{"../forms":8,"csp-app/libs/misc/button-effects/radialGradientOnHover":16,"csp-app/libs/tabs":23,"csp-app/libs/utilities":24}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
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
},{"./FormControl":13}],15:[function(require,module,exports){
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

module.exports = {
  minLength,
  maxLength,
  startsWithNumber
};
},{}],16:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

const radialGradientOnHover = function(btn, opts) {
  const text = btn.innerHTML;
  const wrapper = createElementFromHTML(/*html*/`
    <div class="rg-btn">
      <span>${text}</span>
    </div>
  `);
  btn.innerHTML = '';
  btn.style.padding = 0;

  if (Number.isInteger(opts.padding)) {
    wrapper.style.padding = opts.padding + 'px';
  }
  else if (opts.padding instanceof Array) {
    if (opts.padding.length == 2) {
      wrapper.style.paddingTop = wrapper.style.paddingBottom = opts.padding[0] + 'px';
      wrapper.style.paddingLeft = wrapper.style.paddingRight = opts.padding[1] + 'px';
    }
  }

  btn.appendChild(wrapper);

  btn.addEventListener('mousemove', evt => {
    const coordinates = evt.target.getBoundingClientRect();
    const x = evt.clientX - coordinates.left;
    const y = evt.clientY - coordinates.top;
    evt.target.style.setProperty('--x', `${ x }px`);
    evt.target.style.setProperty('--y', `${ y }px`);
  });
};

module.exports = radialGradientOnHover;
},{"csp-app/libs/utilities":24}],17:[function(require,module,exports){
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
  history.pushState('', '', '/' + link);
};

const Subrouter = function() {
  this.routes = [];
};
Subrouter.prototype = Router.prototype;
Router.Subrouter = Subrouter;

module.exports = Router;
},{"csp-app/components/root/MainController.js":3,"csp-app/state.js":25}],18:[function(require,module,exports){
const tags = ['div', 'span', 'button'];

const HeaderItem = function(opts) {
  const title = opts.title || '';
  const className = opts.className || '';
  const tag = tags.find(tag => tag === opts.tag) ?
    opts.tag :
    'span';

  const headerItem = document.createElement(tag);
  headerItem.className = 'tabs-header-item ' + className;
  headerItem.innerHTML = title;

  if (opts.attributes) {
    opts.attributes.forEach(attr => {
      headerItem.setAttribute(attr.name, attr.value);
    });
  }

  return {
    element: headerItem
  };
};

module.exports = HeaderItem;
},{}],19:[function(require,module,exports){
const defaultAnim = function() {
  function handler(evt) {
    const tab = evt.target.closest('.tabs-header-item').dataset.order;
    this.gotoTab(tab);
  }

  function gotoTab(tab) {
    tab--;
    const newHeaderItem = this.header.items[tab];
    const newContentItem = this.content.items[tab];

    this.active.headerItem.classList.remove('active');
    this.active.contentItem.classList.remove('active');
    this.active.contentItem.classList.add('hidden');

    newHeaderItem.classList.add('active');
    newContentItem.classList.remove('hidden');
    newContentItem.classList.add('active');

    this.active.headerItem = newHeaderItem;
    this.active.contentItem = newContentItem;
  }

  function initialize(tab) {
    tab--;
    const activeHeaderItem = this.header.items[tab];
    const activeContentItem = this.content.items[tab];
    const nonActiveContentItems = this.content.items.filter(item => item !== activeContentItem);

    activeHeaderItem.classList.add('active');
    activeContentItem.classList.add('active');

    nonActiveContentItems.forEach(item => item.classList.add('hidden'));

    this.active.headerItem = activeHeaderItem;
    this.active.contentItem = activeContentItem;
  }

  return {
    handler,
    gotoTab,
    initialize
  };
};

module.exports = defaultAnim;
},{}],20:[function(require,module,exports){
const setContentItemsWidths = function(options, animParams) {
  const controller = options.controller || {};
  const newOrder = options.newOrder;
  const setForNewOrder = options.setForNewOrder || false;
  const items = controller.content.items;
  const len = items.length;
  const width = controller.content.element.clientWidth;

  for (let i = 0; i < len, item = items[i]; i++) {
    if (setForNewOrder || item !== items[newOrder]) {
      item.style.width = (width - 2*animParams.padding) + 'px';
    }
  }
};

const setContentItemsPositions = function(options) {
  const controller = options.controller || {};
  const newOrder = options.newOrder;
  const setForNewOrder = options.setForNewOrder || false;
  const items = controller.content.items;
  const len = items.length;
  const width = controller.content.element.clientWidth;

  for (let i = 0; i < len, item = items[i]; i++) {
    if (setForNewOrder || item !== items[newOrder]) {
      item.style.transform = `translateX(${(i-newOrder)*width}px)`;
    }
  }
};

const setContentItemsDisplay = function(opts) {
  const contentItems = opts.controller.content.items;
  const display = opts.display;
  const newOrder = opts.newOrder;
  const setForNewOrder = opts.setForNewOrder;

  for (let i = 0; i < contentItems.length, ci = contentItems[i]; i++) {
    if (setForNewOrder || ci !== contentItems[newOrder]) {
      ci.style.display = display;
    }
  }
};

const TabsFlowAnimation = function() {
  let params;

  function handler(evt) {
    if (this.active.working) return;
    this.active.working = true;
    // HI stands for Header Item
    // CI stands for Content Item
    const newHI = evt.target.closest('.tabs-header-item');
    const order = +newHI.dataset.order - 1;
    const newCI = this.content.items[order];
    const speed = params.speed;
    const oldOrder = +this.active.headerItem.dataset.order - 1;

    setContentItemsPositions({controller: this, newOrder: oldOrder, setForNewOrder: false});
    setContentItemsDisplay({controller: this, newOrder: order, setForNewOrder: true, display: 'block'});
    newHI.classList.add('active');
    this.active.headerItem.classList.remove('active');
    this.content.element.style.height = this.active.contentItem.clientHeight + 'px';
    this.content.element.style.transitionDuration = speed + 'ms';
    this.content.element.style.height = newCI.clientHeight + 'px';

    this.active.contentItem.style.position = 'absolute';
    this.active.contentItem.style.top = params.padding + 'px';
    this.active.contentItem.style.left = params.padding + 'px';

    this.content.items.forEach(item => item.style.transitionDuration = speed + 'ms');

    setContentItemsWidths({controller: this, newOrder: order, setForNewOrder: true}, params);
    setContentItemsPositions({controller: this, newOrder: order, setForNewOrder: true});
    
    setTimeout(() => {
      newCI.style.position = 'static';
      newCI.style.width = 'auto';
      this.content.element.style.height = 'auto';
      this.content.items.forEach(item => item.style.transitionDuration = '0ms');
      this.content.element.style.transitionDuration = '0ms';
      this.active.headerItem = newHI;
      this.active.contentItem = newCI;
      this.active.working = false;
      setContentItemsDisplay({
        controller: this,
        newOrder: order,
        setForNewOrder: false,
        display: 'none'
      });
    }, speed);
  }

  function gotoTab(tab) {

  }

  function initialize(tab, animOptions) {
    params = animOptions || {};
    // Add classes
    this.content.element.classList.add('tabs-flow-content');
    this.content.items.forEach(item => item.classList.add('tabs-flow-CI'));
    
    // Set individual CSS
    const CIs = this.content.items;
    for (let i = 0; i < CIs.length, item = CIs[i]; i++) {
      if (i !== tab) {
        CIs[i].style.position = 'absolute';    
        CIs[i].style.top = params.padding + 'px';
        CIs[i].style.display = 'none';
      }
    }
    this.header.items[tab].classList.add('active');

    // Set active object
    this.active.headerItem = this.header.items[tab];
    this.active.contentItem = this.content.items[tab];

    // Add on resizing event handler
    const newOrder = +this.active.headerItem.dataset.order - 1;
    window.addEventListener('resize', () => {
      const options = {controller: this, newOrder: newOrder};
      if (this.active.working) {
        setContentItemsWidths(options, params);
      }
      else {
        setContentItemsWidths(options, params);
      }
      
      setContentItemsPositions(options)
    });

    setContentItemsDisplay({
      controller: this,
      newOrder: newOrder,
      setForNewOrder: false,
      display: 'none'
    });
  }

  return {
    handler,
    gotoTab,
    initialize
  };
};

module.exports = TabsFlowAnimation;
},{}],21:[function(require,module,exports){
const defaultAnim = require('./default');
const loginSignupSwitch = require('./loginSignupSwitch');
const tabsFlowAnimation = require('./flow');

module.exports = {
  defaultAnim,
  loginSignupSwitch,
  tabsFlowAnimation
};
},{"./default":19,"./flow":20,"./loginSignupSwitch":22}],22:[function(require,module,exports){
const loginSignupSwitch = function() {
  function handler(evt) {
    if (this.beingAnimated) {
      return;
    }
    this.beingAnimated = true;

    const oldHItem = this.active.headerItem;
    const oldCItem = this.active.contentItem;
    const newHItem = evt.target.closest('.tabs-header-item');
    const order = newHItem.dataset.order;
    const newCItem = this.content.items[order-1];

    oldHItem.classList.remove('loginSignup-HI-active');
    newHItem.classList.add('loginSignup-HI-active');

    oldCItem.classList.remove('loginSignup-CI-active');
    oldCItem.classList.add('loginSignup-CI-hiding');
    newCItem.classList.remove('loginSignup-CI-hidden');
    newCItem.classList.add('loginSignup-CI-activating');

    setTimeout(() => {
      oldCItem.classList.remove('loginSignup-CI-hiding');
      oldCItem.classList.add('loginSignup-CI-hidden');

      newCItem.classList.remove('loginSignup-CI-activating');
      newCItem.classList.add('loginSignup-CI-active');

      this.active.headerItem = newHItem;
      this.active.contentItem = newCItem;

      this.beingAnimated = false;
    }, 500);
  }

  function gotoTab(tab) {
    const newHeaderItem = this.header.items[tab];
    const newContentItem = this.content.items[tab];

    this.active.headerItem.classList.remove('loginSignup-HI-active');
    this.active.contentItem.classList.remove('loginSignu-CI-active');
    this.active.contentItem.classList.add('loginSignup-CI-hidden');

    newHeaderItem.classList.add('loginSignup-HI-active');
    newContentItem.classList.remove('loginSignup-CI-hidden');
    newContentItem.classList.add('loginSignup-CI-active');

    this.active.headerItem = newHeaderItem;
    this.active.contentItem = newContentItem;
  }

  function initialize(tab) {
    this.header.element.classList.add('loginSignup-header');
    this.content.element.classList.add('loginSignup-content');
    this.header.items.forEach(item => item.classList.add('loginSignup-HI'));
    this.content.items.forEach(item => item.classList.add('loginSignup-CI'));

    const activeHeaderItem = this.header.items[tab];
    const activeContentItem = this.content.items[tab];
    const nonActiveContentItems = this.content.items.filter(item => item !== activeContentItem);

    activeHeaderItem.classList.add('loginSignup-HI-active');
    activeContentItem.classList.add('loginSignup-CI-active');

    nonActiveContentItems.forEach(item => item.classList.add('loginSignup-CI-hidden'));

    this.active.headerItem = activeHeaderItem;
    this.active.contentItem = activeContentItem;
  }

  return {
    handler,
    gotoTab,
    initialize
  };
};

module.exports = loginSignupSwitch;
},{}],23:[function(require,module,exports){
const HeaderItem = require('./HeaderItem');
const anims = require('./animations');

const Tabs = function(opts) {
  const headerItems =
    opts.header.items.map(item => new HeaderItem(item).element) || [];
  const header = document.createElement('div');
  header.className = 'tabs-header ' + opts.header.className;
  headerItems.forEach(item => header.appendChild(item));

  for (let i = 0; i < headerItems.length; i++) {
    headerItems[i].dataset.order = i+1;
  }

  const content = document.createElement('div');
  content.className = 'tabs-content ' + (opts.content.className || '');
  const contentItems = opts.content.items || [];
  contentItems.forEach(item => {
    item.classList.add('tabs-content-item');
    content.appendChild(item);
  });

  const active = {
    headerItem: null,
    contentItem: null
  };

  const anim = anims[opts.animation.name] ?
    new anims[opts.animation.name] :
    new anims['defaultAnim'];

  const tabs = {
    header: {
      element: header,
      items: headerItems
    },
    content: {
      element: content,
      items: contentItems
    },
    active: active,
    gotoTab: anim.gotoTab,
    imitateClickOnTab: function(tab) {
      this.header.items[tab].click();
    }
  };
    
  header.addEventListener('click', evt => {
    const link = evt.target;
    const result = headerItems.find(item => item === link.closest('.tabs-header-item'));

    if (!result || result === tabs.active.headerItem) {
      return;
    }

    if (result) {
      anim.handler.call(tabs, evt);
    }
  });

  anim.initialize.call(tabs, opts.animation.initializer - 1 || 0, opts.animation.params);

  return tabs;
};

module.exports = Tabs;
},{"./HeaderItem":18,"./animations":21}],24:[function(require,module,exports){
const createElementFromHTML = function(html) {
  const tempParent = document.createElement('div');
  tempParent.innerHTML = html;
  return tempParent.firstElementChild;
};

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

module.exports = {
  createElementFromHTML,
  Singleton
};
},{}],25:[function(require,module,exports){
const app = {
    components: {},
    path: []
};

module.exports = app;
},{}]},{},[1]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzb3VyY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBSb290ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QnKTtcbmNvbnN0IERhc2hib2FyZCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmQnKTtcbmNvbnN0IE1haW5Db250cm9sbGVyID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QvTWFpbkNvbnRyb2xsZXInKTtcblxuY29uc3QgUm91dGVyID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3JvdXRlcicpXG5jb25zdCBTdGFydCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9zdGFydC9zdGFydCcpO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2dCA9PiB7XG4gICAgY29uc3QgbGluayA9IGV2dC50YXJnZXQuY2xvc2VzdCgnYScpO1xuXG4gICAgaWYgKGxpbmsgJiYgbGluay5kYXRhc2V0LnJvdXRlKSB7XG4gICAgICAgIFJvdXRlci5uYXZpZ2F0ZShsaW5rLmRhdGFzZXQucm91dGUpO1xuICAgIH1cbn0pO1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBldnQgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdwYWdlIGNoYW5nZWQ6ICcsIGRvY3VtZW50LmxvY2F0aW9uKTtcbiAgICBjb25zb2xlLmxvZyhldnQpO1xuICAgIFJvdXRlci5uYXZpZ2F0ZShkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSk7XG59KTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKGV2dCkge1xuICAgIGxldCBwYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuICAgIGNvbnN0IHJvb3RJbnN0YW5jZSA9IFJvb3QuY3JlYXRlKCk7XG4gICAgTWFpbkNvbnRyb2xsZXIuaW5pdGlhbGl6ZShyb290SW5zdGFuY2UpO1xuXG4gICAgY29uc29sZS5sb2cocGF0aCk7XG5cbiAgICBjb25zdCByb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG5cbiAgICByb3V0ZXJcbiAgICAgICAgLmFkZFJvdXRlKCcvJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBNYWluQ29udHJvbGxlci5yZW5kZXJDaGFpbihbbmV3IFN0YXJ0KCldKVxuICAgICAgICB9KVxuICAgIFxuICAgIHJvdXRlci5uYXZpZ2F0ZShwYXRoKVxufSk7XG59LHtcImNzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmRcIjoyLFwiY3NwLWFwcC9jb21wb25lbnRzL3Jvb3RcIjo0LFwiY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QvTWFpbkNvbnRyb2xsZXJcIjozLFwiY3NwLWFwcC9jb21wb25lbnRzL3N0YXJ0L3N0YXJ0XCI6OSxcImNzcC1hcHAvbGlicy9yb3V0ZXJcIjoxN31dLDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgRGFzaGJvYXJkID0ge1xuICAgIGh0bWw6IGBcbiAgICAgICAgPGRpdiBpZD1cImRhc2hib2FyZFwiPlxuICAgICAgICAgICAgPGgxPkhlbGxvIHdvcmxkITwvaDE+XG4gICAgICAgICAgICA8YSBkYXRhLXJvdXRlPVwidGVzdFwiPkdvIHRvIFRlc3QgY29tcG9uZW50PC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGluc3RhbnRpYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgdGVtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0ZW1wLmlubmVySFRNTCA9IHRoaXMuaHRtbDtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRlbXAuZmlyc3RFbGVtZW50Q2hpbGRcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZWZlcmVuY2U6IGVsZW1lbnQsXG4gICAgICAgICAgICBhY3Rpb25zOiB7XG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbihET01UcmVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoRE9NVHJlZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEYXNoYm9hcmQ7XG59LHt9XSwzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGFwcCA9IHJlcXVpcmUoJ2NzcC1hcHAvc3RhdGUuanMnKTtcblxuY29uc3QgTWFpbkNvbnRyb2xsZXIgPSB7XG4gIHJvb3Q6IG51bGwsXG4gIHBhdGg6IFtdLFxuICByZW5kZXJDaGFpbjogZnVuY3Rpb24oY29tcG9uZW50cykge1xuICAgIGNvbXBvbmVudHMucmVkdWNlKChhY2N1bXVsYXRvciwgY29tcG9uZW50KSA9PiB7XG4gICAgICBhY2N1bXVsYXRvci5yZW5kZXIoY29tcG9uZW50LmVsZW1lbnQpO1xuICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9LCB0aGlzLnJvb3QpO1xuICB9LFxuICBpbml0aWFsaXplOiBmdW5jdGlvbihyb290SW5zdGFuY2UpIHtcbiAgICB0aGlzLnJvb3QgPSByb290SW5zdGFuY2U7XG4gICAgZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnJztcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHJvb3RJbnN0YW5jZS5yZWZlcmVuY2UpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1haW5Db250cm9sbGVyO1xufSx7XCJjc3AtYXBwL3N0YXRlLmpzXCI6MjV9XSw0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IFJvb3QgPSB7XG4gICAgY29tcG9uZW50TmFtZTogJ2FwcCcsXG4gICAgaHRtbDogYDxkaXYgaWQ9XCJhcHBcIj48L2Rpdj5gLFxuICAgIGlkZW50aWZpZXI6ICcjYXBwJyxcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBDb25zaWRlciByZWltcGxlbWVudGluZyB3aXRoIEhUTUw1IHRlbXBsYXRlIGZlYXR1cmUgaW5zdGVhZCBqdXN0IHV0aWxpemluZyBkaXZcbiAgICAgICAgY29uc3QgdG1wRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0bXBFbGVtLmlubmVySFRNTCA9IHRoaXMuaHRtbDtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRtcEVsZW0uZmlyc3RDaGlsZDtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVmZXJlbmNlOiBlbGVtZW50LFxuICAgICAgICAgICAgcm91dGVyT3V0bGV0OiBlbGVtZW50LFxuICAgICAgICAgICAgY29tcG9uZW50TmFtZTogdGhpcy5jb21wb25lbnROYW1lLFxuICAgICAgICAgICAgc3RhdGU6IHt9LFxuICAgICAgICAgICAgYWN0aW9uczogKGZ1bmN0aW9uKHJvdXRlck91dGxldCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWQ6IGZ1bmN0aW9uKGZyYWdtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKGVsZW1lbnQpLFxuICAgICAgICAgICAgcmVuZGVyOiAoZnVuY3Rpb24ocm91dGVyT3V0bGV0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKERPTVRyZWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcm91dGVyT3V0bGV0LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuYXBwZW5kQ2hpbGQoRE9NVHJlZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoZWxlbWVudClcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUm9vdDtcbn0se31dLDU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgRm9ybSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3JtcycpO1xuY29uc3Qge21pbkxlbmd0aCwgbWF4TGVuZ3RoLCBzdGFydHNXaXRoTnVtYmVyfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3Jtcy92YWxpZGF0b3JzJyk7XG5cbmNvbnN0IHVzZXJuYW1lID0ge1xuICBrZXlOYW1lOiAndXNlcm5hbWUnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXVzZXJuYW1lJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICd0ZXh0J30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnVXNlcm5hbWUnfVxuICBdLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdtYXhMZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWF4TGVuZ3RoXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnc3RhcnRzV2l0aE51bWJlcicsXG4gICAgICBoYW5kbGVyOiBzdGFydHNXaXRoTnVtYmVyXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBwYXNzd29yZCA9IHtcbiAga2V5TmFtZTogJ3Bhc3N3b3JkJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1wYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAncGFzc3dvcmQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdQYXNzd29yZCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGNvbmZpcm1QYXNzd29yZCA9IHtcbiAga2V5TmFtZTogJ2NvbmZpcm1QYXNzd29yZCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tY29uZmlybVBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICdwYXNzd29yZCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ0NvbmZpcm0gcGFzc3dvcmQnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBlbWFpbCA9IHtcbiAga2V5TmFtZTogJ2VtYWlsJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1wYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAndGV4dCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ0UtbWFpbCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGNsaWVudEZvcm0gPSBuZXcgRm9ybSh7XG4gIHZhbGlkYXRvcnM6IFtdLFxuICBzdWJtaXQ6IHtcbiAgICBoYW5kbGVyOiBmdW5jdGlvbih2YWx1ZXMsIGV2dCkge1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjb25zb2xlLmxvZygnRm9ybSBpcyBjbGVhbicpO1xuICAgIH1cbiAgfSxcbiAgY29udHJvbHM6IFtcbiAgICB1c2VybmFtZSxcbiAgICBwYXNzd29yZCxcbiAgICBjb25maXJtUGFzc3dvcmQsXG4gICAgZW1haWxcbiAgXVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY2xpZW50Rm9ybTtcbn0se1wiY3NwLWFwcC9saWJzL2Zvcm1zXCI6MTQsXCJjc3AtYXBwL2xpYnMvZm9ybXMvdmFsaWRhdG9yc1wiOjE1fV0sNjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBGb3JtID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2Zvcm1zJyk7XG5jb25zdCB7bWluTGVuZ3RoLCBtYXhMZW5ndGgsIHN0YXJ0c1dpdGhOdW1iZXJ9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2Zvcm1zL3ZhbGlkYXRvcnMnKTtcblxuY29uc3QgdXNlcm5hbWUgPSB7XG4gIGtleU5hbWU6ICd1c2VybmFtZScsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tdXNlcm5hbWUnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3RleHQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdVc2VybmFtZSd9XG4gIF0sXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ21heExlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtYXhMZW5ndGhcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdzdGFydHNXaXRoTnVtYmVyJyxcbiAgICAgIGhhbmRsZXI6IHN0YXJ0c1dpdGhOdW1iZXJcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IHBhc3N3b3JkID0ge1xuICBrZXlOYW1lOiAncGFzc3dvcmQnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICdwYXNzd29yZCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1Bhc3N3b3JkJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgY29uZmlybVBhc3N3b3JkID0ge1xuICBrZXlOYW1lOiAnY29uZmlybVBhc3N3b3JkJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1jb25maXJtUGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3Bhc3N3b3JkJ30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnQ29uZmlybSBwYXNzd29yZCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGVtYWlsID0ge1xuICBrZXlOYW1lOiAnZW1haWwnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICd0ZXh0J30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnRS1tYWlsJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3Qgb3JnID0ge1xuICBrZXlOYW1lOiAnb3JnJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1wYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAndGV4dCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1lvdXIgb3JnYW5pemF0aW9uJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgZXhlY0Zvcm0gPSBuZXcgRm9ybSh7XG4gIHZhbGlkYXRvcnM6IFtdLFxuICBzdWJtaXQ6IHtcbiAgICBoYW5kbGVyOiBmdW5jdGlvbih2YWx1ZXMsIGV2dCkge1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjb25zb2xlLmxvZygnRm9ybSBpcyBjbGVhbicpO1xuICAgIH1cbiAgfSxcbiAgY29udHJvbHM6IFtcbiAgICB1c2VybmFtZSxcbiAgICBwYXNzd29yZCxcbiAgICBjb25maXJtUGFzc3dvcmQsXG4gICAgZW1haWwsXG4gICAgb3JnXG4gIF1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4ZWNGb3JtO1xufSx7XCJjc3AtYXBwL2xpYnMvZm9ybXNcIjoxNCxcImNzcC1hcHAvbGlicy9mb3Jtcy92YWxpZGF0b3JzXCI6MTV9XSw3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMnKTtcbmNvbnN0IHttaW5MZW5ndGgsIG1heExlbmd0aCwgc3RhcnRzV2l0aE51bWJlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMvdmFsaWRhdG9ycycpO1xuXG5jb25zdCB1c2VybmFtZSA9IHtcbiAga2V5TmFtZTogJ3VzZXJuYW1lJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS11c2VybmFtZScsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAndGV4dCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1VzZXJuYW1lJ31cbiAgXSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnbWF4TGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1heExlbmd0aFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3N0YXJ0c1dpdGhOdW1iZXInLFxuICAgICAgaGFuZGxlcjogc3RhcnRzV2l0aE51bWJlclxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgcGFzc3dvcmQgPSB7XG4gIGtleU5hbWU6ICdwYXNzd29yZCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tcGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3Bhc3N3b3JkJ30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnUGFzc3dvcmQnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBsb2dpbkZvcm0gPSBuZXcgRm9ybSh7XG4gIHZhbGlkYXRvcnM6IFtdLFxuICBzdWJtaXQ6IHtcbiAgICBoYW5kbGVyOiBmdW5jdGlvbih2YWx1ZXMsIGV2dCkge1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjb25zb2xlLmxvZygnRm9ybSBpcyBjbGVhbicpO1xuICAgIH1cbiAgfSxcbiAgY29udHJvbHM6IFtcbiAgICB1c2VybmFtZSxcbiAgICBwYXNzd29yZFxuICBdXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBsb2dpbkZvcm07XG59LHtcImNzcC1hcHAvbGlicy9mb3Jtc1wiOjE0LFwiY3NwLWFwcC9saWJzL2Zvcm1zL3ZhbGlkYXRvcnNcIjoxNX1dLDg6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgbG9naW5Gb3JtID0gcmVxdWlyZSgnLi9Mb2dpbkZvcm0nKTtcbmNvbnN0IGNsaWVudEZvcm0gPSByZXF1aXJlKCcuL0NsaWVudEZvcm0nKTtcbmNvbnN0IGV4ZWNGb3JtID0gcmVxdWlyZSgnLi9FeGVjRm9ybScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9naW5Gb3JtLFxuICBjbGllbnRGb3JtLFxuICBleGVjRm9ybVxufTtcbn0se1wiLi9DbGllbnRGb3JtXCI6NSxcIi4vRXhlY0Zvcm1cIjo2LFwiLi9Mb2dpbkZvcm1cIjo3fV0sOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vc3RhcnQudHBsJyk7XG5jb25zdCB0YWJzID0gcmVxdWlyZSgnLi90YWJzJyk7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MLCBTaW5nbGV0b259ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5jb25zdCBTdGFydCA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKHRlbXBsYXRlKCkpO1xuICBjb25zdCB0YWJzV3JhcHBlciA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnN0YXJ0LXRhYnMnKTtcbiAgdGFic1dyYXBwZXIuYXBwZW5kQ2hpbGQodGFicy5oZWFkZXIuZWxlbWVudCk7XG4gIHRhYnNXcmFwcGVyLmFwcGVuZENoaWxkKHRhYnMuY29udGVudC5lbGVtZW50KTtcblxuICByZXR1cm4ge1xuICAgIGVsZW1lbnQ6IGVsZW1lbnRcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2luZ2xldG9uKFN0YXJ0KTtcbn0se1wiLi9zdGFydC50cGxcIjoxMCxcIi4vdGFic1wiOjExLFwiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjI0fV0sMTA6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuZnVuY3Rpb24gdGVtcGxhdGUoZGF0YSkge1xuICByZXR1cm4gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cImNtcF9zdGFydFwiPlxuICAgICAgPGRpdiBjbGFzcz1cIndyYXBwZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsb2dvLWJsb2NrXCI+XG4gICAgICAgICAgICA8aDE+V2VsY29tZSB0byBDb25zdWx0aW5nIFNlcnZpY2VzIFBsYXRmb3JtPC9oMT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBcbiAgICAgICAgICA8YSBkYXRhLXJvdXRlPVwiL1wiPkhvbWU8L2E+XG4gICAgICAgICAgPGEgZGF0YS1yb3V0ZT1cIi9kYXNoYm9hcmRcIj5EYXNoYm9hcmQ8L2E+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhcnQtdGFic1wiPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xufSx7fV0sMTE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgVGFicyA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy90YWJzJyk7XG5jb25zdCBjcmVhdGVFbGVtZW50RnJvbUhUTUwgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJykuY3JlYXRlRWxlbWVudEZyb21IVE1MO1xuY29uc3Qgc2lnbnVwVGFicyA9IHJlcXVpcmUoJy4vc2lnbnVwVGFicycpO1xuY29uc3QgbG9naW5Gb3JtID0gcmVxdWlyZSgnLi4vZm9ybXMvTG9naW5Gb3JtJyk7XG5jb25zdCByYWRpYWxHcmFkaWVudE9uSG92ZXIgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvbWlzYy9idXR0b24tZWZmZWN0cy9yYWRpYWxHcmFkaWVudE9uSG92ZXInKTtcblxuY29uc3QgbG9naW5CbG9jayA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCgvKmh0bWwqL2BcbiAgPGRpdiBjbGFzcz1cImxvZ2luLWJsb2NrXCI+XG4gICAgPGRpdiBjbGFzcz1cImhlYWRlclwiPjxoMj5Mb2cgaW48L2gyPjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJmb3JtXCI+PC9kaXY+XG4gIDwvZGl2PlxuYCk7XG5cbmNvbnN0IHNpZ251cEJsb2NrID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICA8ZGl2IGNsYXNzPVwic2lnbnVwLWJsb2NrXCI+PC9kaXY+XG5gKTtcblxuY29uc3Qgc3RhcnRUYWJzID0gbmV3IFRhYnMoe1xuICBoZWFkZXI6IHtcbiAgICBjbGFzc05hbWU6ICdtYWluLWFjdGlvbnMnLFxuICAgIGl0ZW1zOiBbXG4gICAgICB7dGl0bGU6ICdMb2cgaW4nLCB0YWc6ICdidXR0b24nfSxcbiAgICAgIHt0aXRsZTogJ1NpZ24gdXAnLCB0YWc6ICdidXR0b24nfVxuICAgIF1cbiAgfSxcbiAgY29udGVudDoge1xuICAgIGl0ZW1zOiBbXG4gICAgICBsb2dpbkJsb2NrLFxuICAgICAgc2lnbnVwQmxvY2tcbiAgICBdXG4gIH0sXG4gIGFuaW1hdGlvbjoge1xuICAgIG5hbWU6ICdsb2dpblNpZ251cFN3aXRjaCdcbiAgfVxufSk7XG5cbmNvbnN0IGNvbnRlbnRXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5jb250ZW50V3JhcHBlci5jbGFzc0xpc3QuYWRkKCdmb3JtcycpO1xuY29udGVudFdyYXBwZXIuYXBwZW5kQ2hpbGQoc2lnbnVwVGFicy5jb250ZW50LmVsZW1lbnQpO1xuXG5zdGFydFRhYnMuY29udGVudC5pdGVtc1swXS5xdWVyeVNlbGVjdG9yKCcubG9naW4tYmxvY2sgLmZvcm0nKS5hcHBlbmRDaGlsZChsb2dpbkZvcm0ucmVmKTtcbnN0YXJ0VGFicy5jb250ZW50Lml0ZW1zWzFdLmFwcGVuZENoaWxkKHNpZ251cFRhYnMuaGVhZGVyLmVsZW1lbnQpO1xuc3RhcnRUYWJzLmNvbnRlbnQuaXRlbXNbMV0uYXBwZW5kQ2hpbGQoY29udGVudFdyYXBwZXIpO1xuXG5zdGFydFRhYnMuaGVhZGVyLml0ZW1zLmZvckVhY2goaXRlbSA9PiByYWRpYWxHcmFkaWVudE9uSG92ZXIoaXRlbSwge3BhZGRpbmc6IFsxMCwgMTZdfSkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YXJ0VGFicztcbn0se1wiLi4vZm9ybXMvTG9naW5Gb3JtXCI6NyxcIi4vc2lnbnVwVGFic1wiOjEyLFwiY3NwLWFwcC9saWJzL21pc2MvYnV0dG9uLWVmZmVjdHMvcmFkaWFsR3JhZGllbnRPbkhvdmVyXCI6MTYsXCJjc3AtYXBwL2xpYnMvdGFic1wiOjIzLFwiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjI0fV0sMTI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgVGFicyA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy90YWJzJyk7XG5jb25zdCBjcmVhdGVFbGVtZW50RnJvbUhUTUwgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJykuY3JlYXRlRWxlbWVudEZyb21IVE1MO1xuY29uc3Qge2NsaWVudEZvcm0sIGV4ZWNGb3JtfSA9IHJlcXVpcmUoJy4uL2Zvcm1zJyk7XG5jb25zdCByYWRpYWxHcmFkaWVudE9uSG92ZXIgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvbWlzYy9idXR0b24tZWZmZWN0cy9yYWRpYWxHcmFkaWVudE9uSG92ZXInKTtcblxuY29uc3QgY2xpZW50Rm9ybUJsb2NrID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICA8ZGl2IGNsYXNzPVwiY2xpZW50LWZvcm0gZm9ybVwiPjwvZGl2PlxuYCk7XG5cbmNvbnN0IGV4ZWNGb3JtQmxvY2sgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJleGVjLWZvcm0gZm9ybVwiPjwvZGl2PlxuYCk7XG5cbmNvbnN0IHNpZ251cFRhYnMgPSBuZXcgVGFicyh7XG4gIGhlYWRlcjoge1xuICAgIGNsYXNzTmFtZTogJ2FjdGlvbnMgY2xlYXJmaXgnLFxuICAgIGl0ZW1zOiBbXG4gICAgICB7dGl0bGU6ICdTaWduIHVwIGFzIGNsaWVudCcsIHRhZzogJ2J1dHRvbid9LFxuICAgICAge3RpdGxlOiAnU2lnbiB1cCBhcyBleGVjdXRvcicsIHRhZzogJ2J1dHRvbid9XG4gICAgXVxuICB9LFxuICBjb250ZW50OiB7XG4gICAgaXRlbXM6IFtcbiAgICAgIGNsaWVudEZvcm1CbG9jayxcbiAgICAgIGV4ZWNGb3JtQmxvY2ssXG4gICAgXVxuICB9LFxuICBhbmltYXRpb246IHtcbiAgICBuYW1lOiAndGFic0Zsb3dBbmltYXRpb24nLFxuICAgIHBhcmFtczoge3BhZGRpbmc6IDE1LCBzcGVlZDogODUwfVxuICB9XG59KTtcblxuc2lnbnVwVGFicy5jb250ZW50Lml0ZW1zWzBdLmFwcGVuZENoaWxkKGNsaWVudEZvcm0ucmVmKTtcbnNpZ251cFRhYnMuY29udGVudC5pdGVtc1sxXS5hcHBlbmRDaGlsZChleGVjRm9ybS5yZWYpO1xuXG5zaWdudXBUYWJzLmhlYWRlci5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gcmFkaWFsR3JhZGllbnRPbkhvdmVyKGl0ZW0sIHtwYWRkaW5nOiAxNX0pKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzaWdudXBUYWJzO1xufSx7XCIuLi9mb3Jtc1wiOjgsXCJjc3AtYXBwL2xpYnMvbWlzYy9idXR0b24tZWZmZWN0cy9yYWRpYWxHcmFkaWVudE9uSG92ZXJcIjoxNixcImNzcC1hcHAvbGlicy90YWJzXCI6MjMsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6MjR9XSwxMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4vLyBjb25zdCBiaW5kVmFsaWRhdG9ycyA9IGZ1bmN0aW9uKGNvbnRyb2wsIHZhbGlkYXRvcnMpIHtcbi8vICAgcmV0dXJuIHZhbGlkYXRvcnMubWFwKHZhbGlkYXRvciA9PiB2YWxpZGF0b3IuYmluZChjb250cm9sKSk7XG4vLyB9O1xuXG5jb25zdCB2YWxpZGF0ZSA9IGZ1bmN0aW9uKGNvbnRyb2wpIHtcbiAgY29udHJvbCA9IGNvbnRyb2wgfHwgdGhpcztcbiAgbGV0IGFkZCA9IHt9O1xuICBsZXQgcmVtb3ZlID0ge307XG4gIGxldCBpdGVtcyA9IGNvbnRyb2wuZXJyb3JzLml0ZW1zO1xuICBsZXQgdmFsaWRhdG9ycyA9IGNvbnRyb2wudmFsaWRhdG9ycztcblxuICAvLyB2YWxpZGF0b3JzID0gdmFsaWRhdG9ycy5maWx0ZXIodmFsaWRhdG9yID0+IHtcbiAgLy8gICBsZXQgcmVzdWx0ID0gdmFsaWRhdG9yLmNvbmRpdGlvbnMuZXZlcnkoZm4gPT4gZm4oY29udHJvbC52YWx1ZSkpO1xuICAvLyAgIGlmICghcmVzdWx0ICYmIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAvLyAgICAgcmVtb3ZlW3ZhbGlkYXRvci5uYW1lXSA9IHRydWU7XG4gIC8vICAgfVxuICAvLyAgIHJldHVybiByZXN1bHQ7XG4gIC8vIH0pO1xuXG4gIGlmIChjb250cm9sLnZhbHVlID09PSAnJykge1xuICAgIE9iamVjdC5rZXlzKGl0ZW1zKS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgaWYgKCEhaXRlbXNbaXRlbV0pIHJlbW92ZVtpdGVtXSA9IHRydWU7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoY29udHJvbC5yZXF1aXJlZCAmJiBjb250cm9sLnZhbHVlID09PSAnJykge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9ICdUaGlzIGZpZWxkIGlzIHJlcXVpcmVkJztcbiAgICBpdGVtc1sncmVxdWlyZWQnXSA9IHtcbiAgICAgIHJlZjogZWxlbWVudFxuICAgIH1cbiAgICBjb250cm9sLmVycm9ycy5yZWYuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgLy8gcmV0dXJuO1xuICB9XG5cbiAgLy8gaWYgKCFjb250cm9sLnJlcXVpcmVkICYmIGNvbnRyb2wudmFsdWUgPT09ICcnKSB7XG4gIC8vICAgcmV0dXJuO1xuICAvLyB9XG5cbiAgaWYgKGNvbnRyb2wudmFsdWUubGVuZ3RoID4gMCAmJiAhIWl0ZW1zWydyZXF1aXJlZCddKSB7XG4gICAgcmVtb3ZlWydyZXF1aXJlZCddID0gdHJ1ZTtcbiAgfVxuXG4gIGlmIChjb250cm9sLnZhbHVlICE9PSAnJykge1xuICAgIHZhbGlkYXRvcnMuZm9yRWFjaCh2YWxpZGF0b3IgPT4ge1xuICAgICAgbGV0IHJlc3VsdCA9IHZhbGlkYXRvci5oYW5kbGVyKGNvbnRyb2wudmFsdWUsIGNvbnRyb2wpO1xuICAgICAgaWYgKCFyZXN1bHQudmFsaWQgJiYgIWl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgICAgICBhZGRbdmFsaWRhdG9yLm5hbWVdID0gcmVzdWx0O1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAocmVzdWx0LnZhbGlkICYmIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgICAgICByZW1vdmVbdmFsaWRhdG9yLm5hbWVdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIE9iamVjdC5rZXlzKGFkZCkuZm9yRWFjaChlcnJvciA9PiB7XG4gICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gYWRkW2Vycm9yXS5tZXNzYWdlO1xuICAgIGl0ZW1zW2Vycm9yXSA9IHtcbiAgICAgIHJlZjogZWxlbWVudFxuICAgIH07XG4gICAgY29udHJvbC5lcnJvcnMucmVmLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICB9KTtcblxuICBPYmplY3Qua2V5cyhyZW1vdmUpLmZvckVhY2goZXJyb3IgPT4ge1xuICAgIGl0ZW1zW2Vycm9yXS5yZWYucmVtb3ZlKCk7XG4gICAgaXRlbXNbZXJyb3JdID0gbnVsbDtcbiAgfSk7XG59O1xuXG5jb25zdCBiaW5kRXJyb3JIYW5kbGluZyA9IGZ1bmN0aW9uKGNvbnRyb2wpIHtcbiAgY29udHJvbC5jb250cm9sUmVmLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgIHZhbGlkYXRlKGNvbnRyb2wpO1xuICB9KTtcbn07XG5cbmNvbnN0IHRhZ0lucHV0ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBsZXQgcHJlcGVuZCA9IG9wdGlvbnMucHJlcGVuZCB8fCAnJztcbiAgbGV0IGFwcGVuZCA9IG9wdGlvbnMuYXBwZW5kIHx8ICcnO1xuICBsZXQgbGFiZWwgPVxuICAgIG9wdGlvbnMubGFiZWwgP1xuICAgIGA8bGFiZWwgZm9yPVwiJHtvcHRpb25zLmlkfVwiPiR7b3B0aW9ucy5sYWJlbH08L2xhYmVsPmAgOlxuICAgICcnO1xuICBsZXQgZXJyb3JzID0gb3B0aW9ucy5lcnJvcnM7XG4gIGxldCBlcnJvcnNQb3NpdGlvbiA9XG4gICAgZXJyb3JzICYmIGVycm9ycy5wb3NpdGlvbiA/XG4gICAgZXJyb3JzICYmIGVycm9ycy5wb3NpdGlvbiA6XG4gICAgJ2JlZm9yZUFwcGVuZCc7XG4gIGxldCBlcnJvcnNDbGFzcyA9XG4gICAgZXJyb3JzICYmIGVycm9ycy5jbGFzcyA/XG4gICAgZXJyb3JzICYmIGVycm9ycy5jbGFzcyA6XG4gICAgJ2Vycm9ycydcbiAgbGV0IGVycm9yc0hUTUwgPSBgPGRpdiBjbGFzcz1cIiR7ZXJyb3JzQ2xhc3N9XCI+PC9kaXY+YDtcbiAgbGV0IGNvbnRyb2xIVE1MID0gJzxpbnB1dD4nO1xuICBsZXQgaHRtbDtcbiAgXG4gIHN3aXRjaCAoZXJyb3JzUG9zaXRpb24pIHtcbiAgICBjYXNlICdiZWZvcmVQcmVwZW5kJzpcbiAgICAgIGh0bWwgPSBlcnJvcnNIVE1MICsgcHJlcGVuZCArIGxhYmVsICsgY29udHJvbEhUTUwgKyBhcHBlbmQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdiZWZvcmVMYWJlbCc6XG4gICAgICBodG1sID0gcHJlcGVuZCArIGVycm9yc0hUTUwgKyBsYWJlbCArIGNvbnRyb2xIVE1MICsgYXBwZW5kO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmVmb3JlQ29udHJvbCc6XG4gICAgICBodG1sID0gcHJlcGVuZCArIGxhYmVsICsgZXJyb3JzSFRNTCArIGNvbnRyb2xIVE1MICsgYXBwZW5kO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmVmb3JlQXBwZW5kJzpcbiAgICAgIGh0bWwgPSBwcmVwZW5kICsgbGFiZWwgKyBjb250cm9sSFRNTCArIGVycm9yc0hUTUwgKyBhcHBlbmQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdhZnRlckFwcGVuZCc6XG4gICAgICBodG1sID0gcHJlcGVuZCArIGxhYmVsICsgY29udHJvbEhUTUwgKyBhcHBlbmQgKyBlcnJvcnNIVE1MO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICBsZXQgY29udHJvbElkID0gJ2lucHV0JzsgLy8gdG8gaWRlbnRpZnkgaXQgaW4gdGhlIERPTSB3aGVuIGl0J3MgcmVuZGVyZWRcbiAgbGV0IGVycm9yc0lkID0gZXJyb3JzQ2xhc3M7IC8vIGZvciB0aGlzIHRvb1xuXG4gIGxldCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHdyYXBwZXIuY2xhc3NOYW1lID0gKG9wdGlvbnMud3JhcHBlciAmJiBvcHRpb25zLndyYXBwZXIuY2xhc3MpIHx8ICcnO1xuICB3cmFwcGVyLmlubmVySFRNTCA9IGh0bWw7XG4gIGxldCBjb250cm9sUmVmID0gd3JhcHBlci5xdWVyeVNlbGVjdG9yKGNvbnRyb2xJZCk7XG4gIGxldCBlcnJvcnNSZWYgPSB3cmFwcGVyLnF1ZXJ5U2VsZWN0b3IoJy4nK2Vycm9yc0lkKTtcblxuICBpZiAob3B0aW9ucy5hdHRyaWJ1dGVzKSB7XG4gICAgb3B0aW9ucy5hdHRyaWJ1dGVzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBjb250cm9sUmVmLnNldEF0dHJpYnV0ZShhdHRyLm5hbWUsIGF0dHIudmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gbGV0IHZhbGlkYXRvcnMgPSBiaW5kVmFsaWRhdG9ycyhjb250cm9sLCBvcHRpb25zLnZhbGlkYXRvcnMpO1xuXG4gIGxldCBjb250cm9sID0ge1xuICAgIGtleU5hbWU6IG9wdGlvbnMua2V5TmFtZSB8fCAnJyxcbiAgICByZWY6IHdyYXBwZXIsXG4gICAgY29udHJvbFJlZjogY29udHJvbFJlZixcbiAgICBlcnJvcnM6IHtcbiAgICAgIHJlZjogZXJyb3JzUmVmLFxuICAgICAgaXRlbXM6IHt9XG4gICAgfSxcbiAgICByZXF1aXJlZDogb3B0aW9ucy5yZXF1aXJlZCB8fCBmYWxzZSxcbiAgICB2YWxpZDogbnVsbCxcbiAgICB2YWxpZGF0b3JzOiBvcHRpb25zLnZhbGlkYXRvcnMgfHwgW10sXG4gICAgdmFsaWRhdGU6IHZhbGlkYXRlXG4gIH07XG5cbiAgYmluZEVycm9ySGFuZGxpbmcoY29udHJvbCk7XG5cbiAgaWYgKG9wdGlvbnMuaGFuZGxlcnNPYmpzKSB7XG4gICAgbGV0IGV2ZW50cyA9IHt9O1xuICAgIGxldCBoYW5kbGVyc09ianMgPSBvcHRpb25zLmhhbmRsZXJzO1xuICAgIGhhbmRsZXJzT2Jqcy5mb3JFYWNoKG9iaiA9PiB7XG4gICAgICBpZiAoIWV2ZW50c1tvYmouZXZlbnRdKSB7XG4gICAgICAgIGV2ZW50c1tvYmouZXZlbnRdID0gW107XG4gICAgICB9XG4gICAgICBldmVudHNbb2JqLmV2ZW50XS5wdXNoKG9iai5oYW5kbGVyKTtcbiAgICB9KTtcbiAgICBPYmplY3Qua2V5cyhldmVudHMpLmZvckVhY2goZXZlbnROYW1lID0+IHtcbiAgICAgIGNvbnRyb2wuY29udHJvbFJlZi5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZXZ0ID0+IHtcbiAgICAgICAgZXZlbnRzW2V2ZW50TmFtZV0uZm9yRWFjaChoYW5kbGVyID0+IGhhbmRsZXIoZXZ0KSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb250cm9sLCAndmFsdWUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gdGhpcy5jb250cm9sUmVmLnZhbHVlfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7dGhpcy5jb250cm9sUmVmLnZhbHVlID0gbmV3VmFsdWV9XG4gIH0pXG5cbiAgcmV0dXJuIGNvbnRyb2w7XG59O1xuXG5jb25zdCBnZXRIYW5kbGVyID0gZnVuY3Rpb24odGFnKSB7XG4gIGxldCBmbjtcbiAgLy8gU3dpdGNoIHNlZW1zIHRvIGJlIGZhc3RlciB0aGFuIG9iamVjdCBsb29rIHVwXG4gIC8vIFNlYXJjaCBmb3IgJ2pzIHN3aXRjaCB2cyBvYmplY3QnXG4gIHN3aXRjaCh0YWcpIHtcbiAgICBjYXNlICdpbnB1dCc6XG4gICAgICBmbiA9IHRhZ0lucHV0O1xuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIGZuO1xufTtcblxuY29uc3QgRm9ybUNvbnRyb2wgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHJldHVybiBnZXRIYW5kbGVyKG9wdGlvbnMudGFnKShvcHRpb25zKVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtQ29udHJvbDtcbn0se31dLDE0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm1Db250cm9sID0gcmVxdWlyZSgnLi9Gb3JtQ29udHJvbCcpO1xuXG5jb25zdCB2YWxpZGF0ZSA9IGZ1bmN0aW9uKHZhbGlkYXRvciwgZm9ybSkge1xuICBsZXQgaXRlbXMgPSBmb3JtLmVycm9ycy5pdGVtcztcbiAgbGV0IHZhbHVlcyA9IHZhbGlkYXRvci5jb250cm9scy5tYXAoY3RybCA9PiBjdHJsLnZhbHVlKTtcbiAgbGV0IHJlc3VsdCA9IHZhbGlkYXRvci5oYW5kbGVyKHZhbHVlcyk7XG4gIGlmICghcmVzdWx0LnZhbGlkICYmICFpdGVtc1t2YWxpZGF0b3IubmFtZV0pIHtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSByZXN1bHQubWVzc2FnZTtcbiAgICBpdGVtc1t2YWxpZGF0b3IubmFtZV0gPSB7XG4gICAgICByZWY6IGVsZW1lbnRcbiAgICB9O1xuICAgIGZvcm0uZXJyb3JzLnJlZi5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHJlc3VsdC52YWxpZCAmJiBpdGVtc1t2YWxpZGF0b3IubmFtZV0pIHtcbiAgICBpdGVtc1t2YWxpZGF0b3IubmFtZV0ucmVmLnJlbW92ZSgpO1xuICAgIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSA9IG51bGw7XG4gIH1cbn07XG5cbmNvbnN0IEZvcm0gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIGNvbnN0IGZvcm1Db250cm9scyA9IG9wdGlvbnMuY29udHJvbHMubWFwKGN0cmwgPT4gbmV3IEZvcm1Db250cm9sKGN0cmwpKTtcbiAgbGV0IHZhbGlkYXRvcnMgPSBvcHRpb25zLnZhbGlkYXRvcnMgfHwgW107XG4gIGxldCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO1xuICBsZXQgZXJyb3JzV3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBsZXQgc3VibWl0V3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBsZXQgZm9ybUNvbnRyb2xzUmVmcyA9IGZvcm1Db250cm9scy5tYXAoY3RybCA9PiBjdHJsLnJlZik7XG4gIGVycm9yc1dyYXBwZXIuY2xhc3NOYW1lID0gJ2Vycm9ycyc7XG4gIHN1Ym1pdFdyYXBwZXIuY2xhc3NOYW1lID0gJ2FjdGlvbnMnO1xuICBzdWJtaXRXcmFwcGVyLmlubmVySFRNTCA9ICc8aW5wdXQgdHlwZT1cInN1Ym1pdFwiIHZhbHVlPVwiU3VibWl0XCIgLz4nO1xuICBzdWJtaXRSZWYgPSBzdWJtaXRXcmFwcGVyLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJzdWJtaXRcIl0nKTtcblxuICBbZXJyb3JzV3JhcHBlciwgLi4uZm9ybUNvbnRyb2xzUmVmcywgc3VibWl0V3JhcHBlcl1cbiAgICAuZm9yRWFjaChpdGVtID0+IHdyYXBwZXIuYXBwZW5kQ2hpbGQoaXRlbSkpO1xuICBcbiAgbGV0IGZvcm0gPSB7XG4gICAgcmVmOiB3cmFwcGVyLFxuICAgIGVycm9yczoge1xuICAgICAgcmVmOiBlcnJvcnNXcmFwcGVyLFxuICAgICAgaXRlbXM6IHt9XG4gICAgfSxcbiAgICBjb250cm9sczogZm9ybUNvbnRyb2xzLFxuICAgIHN1Ym1pdDoge1xuICAgICAgaGFuZGxlcjogb3B0aW9ucy5zdWJtaXQuaGFuZGxlclxuICAgIH1cbiAgfTtcblxuICBvcHRpb25zLnZhbGlkYXRvcnMuZm9yRWFjaCh2YWxpZGF0b3IgPT4ge1xuICAgIHZhbGlkYXRvci5jb250cm9scy5mb3JFYWNoKGNvbnRyb2wgPT4ge1xuICAgICAgY29udHJvbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICAgICAgdmFsaWRhdGUodmFsaWRhdG9yLCBmb3JtKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBzdWJtaXRSZWYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxldCBlcnJvcnNBbW91bnQgPSAwO1xuICAgIHZhbGlkYXRvcnMuZm9yRWFjaCh2YWxpZGF0b3IgPT4gdmFsaWRhdGUodmFsaWRhdG9yLCBmb3JtKSk7XG4gICAgZm9ybS5jb250cm9scy5mb3JFYWNoKGN0cmwgPT4gY3RybC52YWxpZGF0ZSgpKTtcbiAgICBPYmplY3QudmFsdWVzKGZvcm0uZXJyb3JzLml0ZW1zKS5mb3JFYWNoKHZhbCA9PiB7XG4gICAgICBpZiAoISF2YWwpIHtcbiAgICAgICAgZXJyb3JzQW1vdW50Kys7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZm9ybS5jb250cm9scy5mb3JFYWNoKGN0cmwgPT4ge1xuICAgICAgT2JqZWN0LnZhbHVlcyhjdHJsLmVycm9ycy5pdGVtcykuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgICBpZiAoISF2YWwpIHtcbiAgICAgICAgICBlcnJvcnNBbW91bnQrKztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgaWYgKGVycm9yc0Ftb3VudCA+IDApIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3JtIGlzIG5vdCB2YWxpZCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgdmFsdWVzID0ge307XG4gICAgZm9ybS5jb250cm9scy5mb3JFYWNoKGN0cmwgPT4ge1xuICAgICAgdmFsdWVzW2N0cmwua2V5TmFtZV0gPSBjdHJsLnZhbHVlO1xuICAgIH0pO1xuICAgIGZvcm0uc3VibWl0LmhhbmRsZXIodmFsdWVzLCBldnQpO1xuICB9KTtcblxuICByZXR1cm4gZm9ybTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybTtcbn0se1wiLi9Gb3JtQ29udHJvbFwiOjEzfV0sMTU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgbWluTGVuZ3RoID0gZnVuY3Rpb24odmFsdWUsIGNvbnRyb2wpIHtcbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogdmFsdWUubGVuZ3RoID49IDUsXG4gICAgbWVzc2FnZTogJ1RoaXMgZmllbGRzXFwncyBsZW5ndGggaXMgbGVzcyB0aGFuIDUgY2hhcnMnXG4gIH1cbn07XG5cbmNvbnN0IG1heExlbmd0aCA9IGZ1bmN0aW9uKHZhbHVlLCBjb250cm9sKSB7XG4gIHJldHVybiB7XG4gICAgdmFsaWQ6IHZhbHVlLmxlbmd0aCA8PSAxMCxcbiAgICBtZXNzYWdlOiAnVGhpcyBmaWVsZHNcXCdzIGxlbmd0aCBpcyBncmVhdGVyIHRoYW4gMTAgY2hhcnMnXG4gIH1cbn07XG5cbmNvbnN0IHN0YXJ0c1dpdGhOdW1iZXIgPSBmdW5jdGlvbih2YWx1ZSwgY29udHJvbCkge1xuICByZXR1cm4ge1xuICAgIHZhbGlkOiAhL15cXGQrL2kudGVzdCh2YWx1ZSksXG4gICAgbWVzc2FnZTogJ1VzZXJuYW1lIG11c3Qgbm90IHN0YXJ0IHdpdGggbnVtYmVycydcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1pbkxlbmd0aCxcbiAgbWF4TGVuZ3RoLFxuICBzdGFydHNXaXRoTnVtYmVyXG59O1xufSx7fV0sMTY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmNvbnN0IHJhZGlhbEdyYWRpZW50T25Ib3ZlciA9IGZ1bmN0aW9uKGJ0biwgb3B0cykge1xuICBjb25zdCB0ZXh0ID0gYnRuLmlubmVySFRNTDtcbiAgY29uc3Qgd3JhcHBlciA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCgvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwicmctYnRuXCI+XG4gICAgICA8c3Bhbj4ke3RleHR9PC9zcGFuPlxuICAgIDwvZGl2PlxuICBgKTtcbiAgYnRuLmlubmVySFRNTCA9ICcnO1xuICBidG4uc3R5bGUucGFkZGluZyA9IDA7XG5cbiAgaWYgKE51bWJlci5pc0ludGVnZXIob3B0cy5wYWRkaW5nKSkge1xuICAgIHdyYXBwZXIuc3R5bGUucGFkZGluZyA9IG9wdHMucGFkZGluZyArICdweCc7XG4gIH1cbiAgZWxzZSBpZiAob3B0cy5wYWRkaW5nIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBpZiAob3B0cy5wYWRkaW5nLmxlbmd0aCA9PSAyKSB7XG4gICAgICB3cmFwcGVyLnN0eWxlLnBhZGRpbmdUb3AgPSB3cmFwcGVyLnN0eWxlLnBhZGRpbmdCb3R0b20gPSBvcHRzLnBhZGRpbmdbMF0gKyAncHgnO1xuICAgICAgd3JhcHBlci5zdHlsZS5wYWRkaW5nTGVmdCA9IHdyYXBwZXIuc3R5bGUucGFkZGluZ1JpZ2h0ID0gb3B0cy5wYWRkaW5nWzFdICsgJ3B4JztcbiAgICB9XG4gIH1cblxuICBidG4uYXBwZW5kQ2hpbGQod3JhcHBlcik7XG5cbiAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGV2dCA9PiB7XG4gICAgY29uc3QgY29vcmRpbmF0ZXMgPSBldnQudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHggPSBldnQuY2xpZW50WCAtIGNvb3JkaW5hdGVzLmxlZnQ7XG4gICAgY29uc3QgeSA9IGV2dC5jbGllbnRZIC0gY29vcmRpbmF0ZXMudG9wO1xuICAgIGV2dC50YXJnZXQuc3R5bGUuc2V0UHJvcGVydHkoJy0teCcsIGAkeyB4IH1weGApO1xuICAgIGV2dC50YXJnZXQuc3R5bGUuc2V0UHJvcGVydHkoJy0teScsIGAkeyB5IH1weGApO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcmFkaWFsR3JhZGllbnRPbkhvdmVyO1xufSx7XCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6MjR9XSwxNzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBhcHAgPSByZXF1aXJlKCdjc3AtYXBwL3N0YXRlLmpzJyk7XG5jb25zdCBNYWluQ29udHJvbGxlciA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9yb290L01haW5Db250cm9sbGVyLmpzJyk7XG5cbmNvbnN0IFJvdXRlciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJvdXRlcyA9IFtdO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS5yZWdleHBQYXJhbXMgPSAvKFxcKDooW1xcd1xcZFxcLV9dKylcXCkpL2dpO1xuXG5Sb3V0ZXIucHJvdG90eXBlLnRyaW1Sb3V0ZSA9IGZ1bmN0aW9uKHJvdXRlKXtcbiAgcm91dGUgPSByb3V0ZVswXSA9PT0gJy8nXG4gICAgPyByb3V0ZS5zdWJzdHIoMSlcbiAgICA6IHJvdXRlO1xuXG4gIHJvdXRlID0gcm91dGVbcm91dGUubGVuZ3RoIC0gMV0gPT09ICcvJ1xuICAgID8gcm91dGUuc3Vic3RyKDAsIHJvdXRlLmxlbmd0aCAtIDEpXG4gICAgOiByb3V0ZTtcblxuICByZXR1cm4gcm91dGU7XG59LFxuXG5Sb3V0ZXIucHJvdG90eXBlLmdldFBhcmFtc05hbWVzID0gZnVuY3Rpb24ocm91dGUpIHtcbiAgbGV0IHJlc3VsdDtcbiAgbGV0IHBhcmFtc05hbWVzID0gW107XG4gIHdoaWxlICgocmVzdWx0ID0gdGhpcy5yZWdleHBQYXJhbXMuZXhlYyhyb3V0ZSkpICE9PSBudWxsKSB7XG4gICAgcGFyYW1zTmFtZXMucHVzaChyZXN1bHRbMl0pO1xuICB9XG4gIHJldHVybiBwYXJhbXNOYW1lcztcbn1cblxuUm91dGVyLnByb3RvdHlwZS5hZGRSb3V0ZSA9IGZ1bmN0aW9uKHJvdXRlLCBoYW5kbGVyKSB7XG4gIHJvdXRlID0gdGhpcy50cmltUm91dGUocm91dGUpO1xuICBsZXQgcGFyYW1zTmFtZXMgPSB0aGlzLmdldFBhcmFtc05hbWVzKHJvdXRlKTtcbiAgbGV0IHJlZ2V4cFN0ciA9IHJvdXRlLnJlcGxhY2UodGhpcy5yZWdleHBQYXJhbXMsICdbXFxcXHdcXFxcZFxcLV9dKycpO1xuICBsZXQgcmVnZXhwID0gUmVnRXhwKGBeJHtyZWdleHBTdHJ9KFxcXFwvfCQpYCwgJ2dpJyk7XG5cbiAgbGV0IHJvdXRlT2JqID0ge1xuICAgIHJlZ2V4cDogcmVnZXhwLFxuICAgIHBhcmFtc05hbWVzOiBwYXJhbXNOYW1lc1xuICB9O1xuXG4gIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJvdXRlT2JqLmhhbmRsZXIgPSBoYW5kbGVyO1xuICB9XG5cbiAgZWxzZSBpZiAoaGFuZGxlciBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgcm91dGVPYmouY2hpbGRyZW4gPSBoYW5kbGVyO1xuICB9XG5cbiAgZWxzZSB7XG4gICAgY29uc29sZS5sb2coJ0Vycm9yIG9jY3VyZWQgd2hpbGUgYWRkaW5nIHJvdXRlJyk7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyb3V0ZSBlcnJvcicpO1xuICB9XG5cbiAgdGhpcy5yb3V0ZXMucHVzaChyb3V0ZU9iaik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS5nZXRSb3V0ZSA9IGZ1bmN0aW9uKGxpbmssIHJvdXRlcyA9IHRoaXMucm91dGVzLCBwYXJhbXMgPSB7fSkge1xuICBsaW5rID0gbGluayA9PT0gJycgPyAnLycgOiBsaW5rO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aCwgcm91dGUgPSByb3V0ZXNbaV07IGkrKykge1xuICAgIGxldCByZWdleHAgPSByb3V0ZS5yZWdleHA7XG4gICAgbGV0IHJlc3VsdCA9IHJlZ2V4cC5leGVjKGxpbmspO1xuXG4gICAgaWYgKHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoID4gMSkge1xuICAgICAgZm9yIChsZXQgaWR4ID0gMTsgaWR4IDwgcmVzdWx0Lmxlbmd0aDsgaWR4KyspIHtcbiAgICAgICAgcGFyYW1zW3JvdXRlLnBhcmFtc05hbWVzW2lkeC0xXV0gPSByZXN1bHRbaWR4XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmVnZXhwLmxhc3RJbmRleCA+IDApIHtcbiAgICAgIGxpbmsgPSBsaW5rLnN1YnN0cihyZWdleHAubGFzdEluZGV4KTtcbiAgICB9XG5cbiAgICBpZiAocmVnZXhwLmxhc3RJbmRleCA+IDAgJiYgbGluay5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAocm91dGUuY2hpbGRyZW4gJiYgcm91dGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICBsZXQgY2hpbGRyZW5DaGVjayA9IHRoaXMuZ2V0Um91dGUobGluaywgcm91dGUuY2hpbGRyZW4sIHBhcmFtcyk7XG4gICAgICAgIGlmIChjaGlsZHJlbkNoZWNrICE9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkcmVuQ2hlY2s7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZWxzZSBpZiAocmVnZXhwLmxhc3RJbmRleCA+IDApIHtcbiAgICAgIC8vIEluIGNhc2UgaXQncyB0ZXJtaW5hbCByb3V0ZVxuICAgICAgaWYgKHJvdXRlLmhhbmRsZXIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBoYW5kbGVyOiByb3V0ZS5oYW5kbGVyLFxuICAgICAgICAgIHBhcmFtczogcGFyYW1zXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChyb3V0ZS5jaGlsZHJlbikge1xuICAgICAgICBsZXQgY2hpbGRyZW5DaGVjayA9IHRoaXMuZ2V0Um91dGUobGluaywgcm91dGUuY2hpbGRyZW4sIHBhcmFtcyk7XG4gICAgICAgIGlmIChjaGlsZHJlbkNoZWNrICE9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkcmVuQ2hlY2s7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLm5hdmlnYXRlID0gZnVuY3Rpb24obGluaykge1xuICBsaW5rID0gdGhpcy50cmltUm91dGUobGluayk7XG4gIGxldCByb3V0ZSA9IHRoaXMuZ2V0Um91dGUobGluayk7XG4gIGlmICghcm91dGUpIHtcbiAgICBjb25zb2xlLmxvZygnRXJyb3Igd2hpbGUgbmF2aWdhdGluZyByb3V0ZScpO1xuICAgIHJldHVybjtcbiAgfVxuICByb3V0ZS5oYW5kbGVyKHJvdXRlLnBhcmFtcyk7XG4gIGhpc3RvcnkucHVzaFN0YXRlKCcnLCAnJywgJy8nICsgbGluayk7XG59O1xuXG5jb25zdCBTdWJyb3V0ZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yb3V0ZXMgPSBbXTtcbn07XG5TdWJyb3V0ZXIucHJvdG90eXBlID0gUm91dGVyLnByb3RvdHlwZTtcblJvdXRlci5TdWJyb3V0ZXIgPSBTdWJyb3V0ZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gUm91dGVyO1xufSx7XCJjc3AtYXBwL2NvbXBvbmVudHMvcm9vdC9NYWluQ29udHJvbGxlci5qc1wiOjMsXCJjc3AtYXBwL3N0YXRlLmpzXCI6MjV9XSwxODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB0YWdzID0gWydkaXYnLCAnc3BhbicsICdidXR0b24nXTtcblxuY29uc3QgSGVhZGVySXRlbSA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgY29uc3QgdGl0bGUgPSBvcHRzLnRpdGxlIHx8ICcnO1xuICBjb25zdCBjbGFzc05hbWUgPSBvcHRzLmNsYXNzTmFtZSB8fCAnJztcbiAgY29uc3QgdGFnID0gdGFncy5maW5kKHRhZyA9PiB0YWcgPT09IG9wdHMudGFnKSA/XG4gICAgb3B0cy50YWcgOlxuICAgICdzcGFuJztcblxuICBjb25zdCBoZWFkZXJJdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICBoZWFkZXJJdGVtLmNsYXNzTmFtZSA9ICd0YWJzLWhlYWRlci1pdGVtICcgKyBjbGFzc05hbWU7XG4gIGhlYWRlckl0ZW0uaW5uZXJIVE1MID0gdGl0bGU7XG5cbiAgaWYgKG9wdHMuYXR0cmlidXRlcykge1xuICAgIG9wdHMuYXR0cmlidXRlcy5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgaGVhZGVySXRlbS5zZXRBdHRyaWJ1dGUoYXR0ci5uYW1lLCBhdHRyLnZhbHVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudDogaGVhZGVySXRlbVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJJdGVtO1xufSx7fV0sMTk6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgZGVmYXVsdEFuaW0gPSBmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gaGFuZGxlcihldnQpIHtcbiAgICBjb25zdCB0YWIgPSBldnQudGFyZ2V0LmNsb3Nlc3QoJy50YWJzLWhlYWRlci1pdGVtJykuZGF0YXNldC5vcmRlcjtcbiAgICB0aGlzLmdvdG9UYWIodGFiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdvdG9UYWIodGFiKSB7XG4gICAgdGFiLS07XG4gICAgY29uc3QgbmV3SGVhZGVySXRlbSA9IHRoaXMuaGVhZGVyLml0ZW1zW3RhYl07XG4gICAgY29uc3QgbmV3Q29udGVudEl0ZW0gPSB0aGlzLmNvbnRlbnQuaXRlbXNbdGFiXTtcblxuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG5cbiAgICBuZXdIZWFkZXJJdGVtLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgIG5ld0NvbnRlbnRJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgIG5ld0NvbnRlbnRJdGVtLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IG5ld0hlYWRlckl0ZW07XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSBuZXdDb250ZW50SXRlbTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUodGFiKSB7XG4gICAgdGFiLS07XG4gICAgY29uc3QgYWN0aXZlSGVhZGVySXRlbSA9IHRoaXMuaGVhZGVyLml0ZW1zW3RhYl07XG4gICAgY29uc3QgYWN0aXZlQ29udGVudEl0ZW0gPSB0aGlzLmNvbnRlbnQuaXRlbXNbdGFiXTtcbiAgICBjb25zdCBub25BY3RpdmVDb250ZW50SXRlbXMgPSB0aGlzLmNvbnRlbnQuaXRlbXMuZmlsdGVyKGl0ZW0gPT4gaXRlbSAhPT0gYWN0aXZlQ29udGVudEl0ZW0pO1xuXG4gICAgYWN0aXZlSGVhZGVySXRlbS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICBhY3RpdmVDb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblxuICAgIG5vbkFjdGl2ZUNvbnRlbnRJdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKSk7XG5cbiAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtID0gYWN0aXZlSGVhZGVySXRlbTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbSA9IGFjdGl2ZUNvbnRlbnRJdGVtO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBoYW5kbGVyLFxuICAgIGdvdG9UYWIsXG4gICAgaW5pdGlhbGl6ZVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0QW5pbTtcbn0se31dLDIwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHNldENvbnRlbnRJdGVtc1dpZHRocyA9IGZ1bmN0aW9uKG9wdGlvbnMsIGFuaW1QYXJhbXMpIHtcbiAgY29uc3QgY29udHJvbGxlciA9IG9wdGlvbnMuY29udHJvbGxlciB8fCB7fTtcbiAgY29uc3QgbmV3T3JkZXIgPSBvcHRpb25zLm5ld09yZGVyO1xuICBjb25zdCBzZXRGb3JOZXdPcmRlciA9IG9wdGlvbnMuc2V0Rm9yTmV3T3JkZXIgfHwgZmFsc2U7XG4gIGNvbnN0IGl0ZW1zID0gY29udHJvbGxlci5jb250ZW50Lml0ZW1zO1xuICBjb25zdCBsZW4gPSBpdGVtcy5sZW5ndGg7XG4gIGNvbnN0IHdpZHRoID0gY29udHJvbGxlci5jb250ZW50LmVsZW1lbnQuY2xpZW50V2lkdGg7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW4sIGl0ZW0gPSBpdGVtc1tpXTsgaSsrKSB7XG4gICAgaWYgKHNldEZvck5ld09yZGVyIHx8IGl0ZW0gIT09IGl0ZW1zW25ld09yZGVyXSkge1xuICAgICAgaXRlbS5zdHlsZS53aWR0aCA9ICh3aWR0aCAtIDIqYW5pbVBhcmFtcy5wYWRkaW5nKSArICdweCc7XG4gICAgfVxuICB9XG59O1xuXG5jb25zdCBzZXRDb250ZW50SXRlbXNQb3NpdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBvcHRpb25zLmNvbnRyb2xsZXIgfHwge307XG4gIGNvbnN0IG5ld09yZGVyID0gb3B0aW9ucy5uZXdPcmRlcjtcbiAgY29uc3Qgc2V0Rm9yTmV3T3JkZXIgPSBvcHRpb25zLnNldEZvck5ld09yZGVyIHx8IGZhbHNlO1xuICBjb25zdCBpdGVtcyA9IGNvbnRyb2xsZXIuY29udGVudC5pdGVtcztcbiAgY29uc3QgbGVuID0gaXRlbXMubGVuZ3RoO1xuICBjb25zdCB3aWR0aCA9IGNvbnRyb2xsZXIuY29udGVudC5lbGVtZW50LmNsaWVudFdpZHRoO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuLCBpdGVtID0gaXRlbXNbaV07IGkrKykge1xuICAgIGlmIChzZXRGb3JOZXdPcmRlciB8fCBpdGVtICE9PSBpdGVtc1tuZXdPcmRlcl0pIHtcbiAgICAgIGl0ZW0uc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZVgoJHsoaS1uZXdPcmRlcikqd2lkdGh9cHgpYDtcbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0IHNldENvbnRlbnRJdGVtc0Rpc3BsYXkgPSBmdW5jdGlvbihvcHRzKSB7XG4gIGNvbnN0IGNvbnRlbnRJdGVtcyA9IG9wdHMuY29udHJvbGxlci5jb250ZW50Lml0ZW1zO1xuICBjb25zdCBkaXNwbGF5ID0gb3B0cy5kaXNwbGF5O1xuICBjb25zdCBuZXdPcmRlciA9IG9wdHMubmV3T3JkZXI7XG4gIGNvbnN0IHNldEZvck5ld09yZGVyID0gb3B0cy5zZXRGb3JOZXdPcmRlcjtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRlbnRJdGVtcy5sZW5ndGgsIGNpID0gY29udGVudEl0ZW1zW2ldOyBpKyspIHtcbiAgICBpZiAoc2V0Rm9yTmV3T3JkZXIgfHwgY2kgIT09IGNvbnRlbnRJdGVtc1tuZXdPcmRlcl0pIHtcbiAgICAgIGNpLnN0eWxlLmRpc3BsYXkgPSBkaXNwbGF5O1xuICAgIH1cbiAgfVxufTtcblxuY29uc3QgVGFic0Zsb3dBbmltYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgbGV0IHBhcmFtcztcblxuICBmdW5jdGlvbiBoYW5kbGVyKGV2dCkge1xuICAgIGlmICh0aGlzLmFjdGl2ZS53b3JraW5nKSByZXR1cm47XG4gICAgdGhpcy5hY3RpdmUud29ya2luZyA9IHRydWU7XG4gICAgLy8gSEkgc3RhbmRzIGZvciBIZWFkZXIgSXRlbVxuICAgIC8vIENJIHN0YW5kcyBmb3IgQ29udGVudCBJdGVtXG4gICAgY29uc3QgbmV3SEkgPSBldnQudGFyZ2V0LmNsb3Nlc3QoJy50YWJzLWhlYWRlci1pdGVtJyk7XG4gICAgY29uc3Qgb3JkZXIgPSArbmV3SEkuZGF0YXNldC5vcmRlciAtIDE7XG4gICAgY29uc3QgbmV3Q0kgPSB0aGlzLmNvbnRlbnQuaXRlbXNbb3JkZXJdO1xuICAgIGNvbnN0IHNwZWVkID0gcGFyYW1zLnNwZWVkO1xuICAgIGNvbnN0IG9sZE9yZGVyID0gK3RoaXMuYWN0aXZlLmhlYWRlckl0ZW0uZGF0YXNldC5vcmRlciAtIDE7XG5cbiAgICBzZXRDb250ZW50SXRlbXNQb3NpdGlvbnMoe2NvbnRyb2xsZXI6IHRoaXMsIG5ld09yZGVyOiBvbGRPcmRlciwgc2V0Rm9yTmV3T3JkZXI6IGZhbHNlfSk7XG4gICAgc2V0Q29udGVudEl0ZW1zRGlzcGxheSh7Y29udHJvbGxlcjogdGhpcywgbmV3T3JkZXI6IG9yZGVyLCBzZXRGb3JOZXdPcmRlcjogdHJ1ZSwgZGlzcGxheTogJ2Jsb2NrJ30pO1xuICAgIG5ld0hJLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgdGhpcy5jb250ZW50LmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uY2xpZW50SGVpZ2h0ICsgJ3B4JztcbiAgICB0aGlzLmNvbnRlbnQuZWxlbWVudC5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSBzcGVlZCArICdtcyc7XG4gICAgdGhpcy5jb250ZW50LmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gbmV3Q0kuY2xpZW50SGVpZ2h0ICsgJ3B4JztcblxuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5zdHlsZS50b3AgPSBwYXJhbXMucGFkZGluZyArICdweCc7XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uc3R5bGUubGVmdCA9IHBhcmFtcy5wYWRkaW5nICsgJ3B4JztcblxuICAgIHRoaXMuY29udGVudC5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSBzcGVlZCArICdtcycpO1xuXG4gICAgc2V0Q29udGVudEl0ZW1zV2lkdGhzKHtjb250cm9sbGVyOiB0aGlzLCBuZXdPcmRlcjogb3JkZXIsIHNldEZvck5ld09yZGVyOiB0cnVlfSwgcGFyYW1zKTtcbiAgICBzZXRDb250ZW50SXRlbXNQb3NpdGlvbnMoe2NvbnRyb2xsZXI6IHRoaXMsIG5ld09yZGVyOiBvcmRlciwgc2V0Rm9yTmV3T3JkZXI6IHRydWV9KTtcbiAgICBcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIG5ld0NJLnN0eWxlLnBvc2l0aW9uID0gJ3N0YXRpYyc7XG4gICAgICBuZXdDSS5zdHlsZS53aWR0aCA9ICdhdXRvJztcbiAgICAgIHRoaXMuY29udGVudC5lbGVtZW50LnN0eWxlLmhlaWdodCA9ICdhdXRvJztcbiAgICAgIHRoaXMuY29udGVudC5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAnMG1zJyk7XG4gICAgICB0aGlzLmNvbnRlbnQuZWxlbWVudC5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAnMG1zJztcbiAgICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0gPSBuZXdISTtcbiAgICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtID0gbmV3Q0k7XG4gICAgICB0aGlzLmFjdGl2ZS53b3JraW5nID0gZmFsc2U7XG4gICAgICBzZXRDb250ZW50SXRlbXNEaXNwbGF5KHtcbiAgICAgICAgY29udHJvbGxlcjogdGhpcyxcbiAgICAgICAgbmV3T3JkZXI6IG9yZGVyLFxuICAgICAgICBzZXRGb3JOZXdPcmRlcjogZmFsc2UsXG4gICAgICAgIGRpc3BsYXk6ICdub25lJ1xuICAgICAgfSk7XG4gICAgfSwgc3BlZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ290b1RhYih0YWIpIHtcblxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdGlhbGl6ZSh0YWIsIGFuaW1PcHRpb25zKSB7XG4gICAgcGFyYW1zID0gYW5pbU9wdGlvbnMgfHwge307XG4gICAgLy8gQWRkIGNsYXNzZXNcbiAgICB0aGlzLmNvbnRlbnQuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCd0YWJzLWZsb3ctY29udGVudCcpO1xuICAgIHRoaXMuY29udGVudC5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCd0YWJzLWZsb3ctQ0knKSk7XG4gICAgXG4gICAgLy8gU2V0IGluZGl2aWR1YWwgQ1NTXG4gICAgY29uc3QgQ0lzID0gdGhpcy5jb250ZW50Lml0ZW1zO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgQ0lzLmxlbmd0aCwgaXRlbSA9IENJc1tpXTsgaSsrKSB7XG4gICAgICBpZiAoaSAhPT0gdGFiKSB7XG4gICAgICAgIENJc1tpXS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7ICAgIFxuICAgICAgICBDSXNbaV0uc3R5bGUudG9wID0gcGFyYW1zLnBhZGRpbmcgKyAncHgnO1xuICAgICAgICBDSXNbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5oZWFkZXIuaXRlbXNbdGFiXS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblxuICAgIC8vIFNldCBhY3RpdmUgb2JqZWN0XG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IHRoaXMuaGVhZGVyLml0ZW1zW3RhYl07XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSB0aGlzLmNvbnRlbnQuaXRlbXNbdGFiXTtcblxuICAgIC8vIEFkZCBvbiByZXNpemluZyBldmVudCBoYW5kbGVyXG4gICAgY29uc3QgbmV3T3JkZXIgPSArdGhpcy5hY3RpdmUuaGVhZGVySXRlbS5kYXRhc2V0Lm9yZGVyIC0gMTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtjb250cm9sbGVyOiB0aGlzLCBuZXdPcmRlcjogbmV3T3JkZXJ9O1xuICAgICAgaWYgKHRoaXMuYWN0aXZlLndvcmtpbmcpIHtcbiAgICAgICAgc2V0Q29udGVudEl0ZW1zV2lkdGhzKG9wdGlvbnMsIHBhcmFtcyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc2V0Q29udGVudEl0ZW1zV2lkdGhzKG9wdGlvbnMsIHBhcmFtcyk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHNldENvbnRlbnRJdGVtc1Bvc2l0aW9ucyhvcHRpb25zKVxuICAgIH0pO1xuXG4gICAgc2V0Q29udGVudEl0ZW1zRGlzcGxheSh7XG4gICAgICBjb250cm9sbGVyOiB0aGlzLFxuICAgICAgbmV3T3JkZXI6IG5ld09yZGVyLFxuICAgICAgc2V0Rm9yTmV3T3JkZXI6IGZhbHNlLFxuICAgICAgZGlzcGxheTogJ25vbmUnXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGhhbmRsZXIsXG4gICAgZ290b1RhYixcbiAgICBpbml0aWFsaXplXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhYnNGbG93QW5pbWF0aW9uO1xufSx7fV0sMjE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgZGVmYXVsdEFuaW0gPSByZXF1aXJlKCcuL2RlZmF1bHQnKTtcbmNvbnN0IGxvZ2luU2lnbnVwU3dpdGNoID0gcmVxdWlyZSgnLi9sb2dpblNpZ251cFN3aXRjaCcpO1xuY29uc3QgdGFic0Zsb3dBbmltYXRpb24gPSByZXF1aXJlKCcuL2Zsb3cnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRlZmF1bHRBbmltLFxuICBsb2dpblNpZ251cFN3aXRjaCxcbiAgdGFic0Zsb3dBbmltYXRpb25cbn07XG59LHtcIi4vZGVmYXVsdFwiOjE5LFwiLi9mbG93XCI6MjAsXCIuL2xvZ2luU2lnbnVwU3dpdGNoXCI6MjJ9XSwyMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBsb2dpblNpZ251cFN3aXRjaCA9IGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBoYW5kbGVyKGV2dCkge1xuICAgIGlmICh0aGlzLmJlaW5nQW5pbWF0ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5iZWluZ0FuaW1hdGVkID0gdHJ1ZTtcblxuICAgIGNvbnN0IG9sZEhJdGVtID0gdGhpcy5hY3RpdmUuaGVhZGVySXRlbTtcbiAgICBjb25zdCBvbGRDSXRlbSA9IHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtO1xuICAgIGNvbnN0IG5ld0hJdGVtID0gZXZ0LnRhcmdldC5jbG9zZXN0KCcudGFicy1oZWFkZXItaXRlbScpO1xuICAgIGNvbnN0IG9yZGVyID0gbmV3SEl0ZW0uZGF0YXNldC5vcmRlcjtcbiAgICBjb25zdCBuZXdDSXRlbSA9IHRoaXMuY29udGVudC5pdGVtc1tvcmRlci0xXTtcblxuICAgIG9sZEhJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnVwLUhJLWFjdGl2ZScpO1xuICAgIG5ld0hJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUhJLWFjdGl2ZScpO1xuXG4gICAgb2xkQ0l0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnbG9naW5TaWdudXAtQ0ktYWN0aXZlJyk7XG4gICAgb2xkQ0l0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktaGlkaW5nJyk7XG4gICAgbmV3Q0l0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnbG9naW5TaWdudXAtQ0ktaGlkZGVuJyk7XG4gICAgbmV3Q0l0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktYWN0aXZhdGluZycpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBvbGRDSXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1DSS1oaWRpbmcnKTtcbiAgICAgIG9sZENJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJLWhpZGRlbicpO1xuXG4gICAgICBuZXdDSXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1DSS1hY3RpdmF0aW5nJyk7XG4gICAgICBuZXdDSXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1hY3RpdmUnKTtcblxuICAgICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IG5ld0hJdGVtO1xuICAgICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSBuZXdDSXRlbTtcblxuICAgICAgdGhpcy5iZWluZ0FuaW1hdGVkID0gZmFsc2U7XG4gICAgfSwgNTAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdvdG9UYWIodGFiKSB7XG4gICAgY29uc3QgbmV3SGVhZGVySXRlbSA9IHRoaXMuaGVhZGVyLml0ZW1zW3RhYl07XG4gICAgY29uc3QgbmV3Q29udGVudEl0ZW0gPSB0aGlzLmNvbnRlbnQuaXRlbXNbdGFiXTtcblxuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnbG9naW5TaWdudXAtSEktYWN0aXZlJyk7XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnbG9naW5TaWdudS1DSS1hY3RpdmUnKTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1oaWRkZW4nKTtcblxuICAgIG5ld0hlYWRlckl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtSEktYWN0aXZlJyk7XG4gICAgbmV3Q29udGVudEl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnbG9naW5TaWdudXAtQ0ktaGlkZGVuJyk7XG4gICAgbmV3Q29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktYWN0aXZlJyk7XG5cbiAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtID0gbmV3SGVhZGVySXRlbTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbSA9IG5ld0NvbnRlbnRJdGVtO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdGlhbGl6ZSh0YWIpIHtcbiAgICB0aGlzLmhlYWRlci5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLWhlYWRlcicpO1xuICAgIHRoaXMuY29udGVudC5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLWNvbnRlbnQnKTtcbiAgICB0aGlzLmhlYWRlci5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1ISScpKTtcbiAgICB0aGlzLmNvbnRlbnQuaXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0knKSk7XG5cbiAgICBjb25zdCBhY3RpdmVIZWFkZXJJdGVtID0gdGhpcy5oZWFkZXIuaXRlbXNbdGFiXTtcbiAgICBjb25zdCBhY3RpdmVDb250ZW50SXRlbSA9IHRoaXMuY29udGVudC5pdGVtc1t0YWJdO1xuICAgIGNvbnN0IG5vbkFjdGl2ZUNvbnRlbnRJdGVtcyA9IHRoaXMuY29udGVudC5pdGVtcy5maWx0ZXIoaXRlbSA9PiBpdGVtICE9PSBhY3RpdmVDb250ZW50SXRlbSk7XG5cbiAgICBhY3RpdmVIZWFkZXJJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUhJLWFjdGl2ZScpO1xuICAgIGFjdGl2ZUNvbnRlbnRJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJLWFjdGl2ZScpO1xuXG4gICAgbm9uQWN0aXZlQ29udGVudEl0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJLWhpZGRlbicpKTtcblxuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0gPSBhY3RpdmVIZWFkZXJJdGVtO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtID0gYWN0aXZlQ29udGVudEl0ZW07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGhhbmRsZXIsXG4gICAgZ290b1RhYixcbiAgICBpbml0aWFsaXplXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvZ2luU2lnbnVwU3dpdGNoO1xufSx7fV0sMjM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgSGVhZGVySXRlbSA9IHJlcXVpcmUoJy4vSGVhZGVySXRlbScpO1xuY29uc3QgYW5pbXMgPSByZXF1aXJlKCcuL2FuaW1hdGlvbnMnKTtcblxuY29uc3QgVGFicyA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgY29uc3QgaGVhZGVySXRlbXMgPVxuICAgIG9wdHMuaGVhZGVyLml0ZW1zLm1hcChpdGVtID0+IG5ldyBIZWFkZXJJdGVtKGl0ZW0pLmVsZW1lbnQpIHx8IFtdO1xuICBjb25zdCBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgaGVhZGVyLmNsYXNzTmFtZSA9ICd0YWJzLWhlYWRlciAnICsgb3B0cy5oZWFkZXIuY2xhc3NOYW1lO1xuICBoZWFkZXJJdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaGVhZGVyLmFwcGVuZENoaWxkKGl0ZW0pKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGhlYWRlckl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgaGVhZGVySXRlbXNbaV0uZGF0YXNldC5vcmRlciA9IGkrMTtcbiAgfVxuXG4gIGNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgY29udGVudC5jbGFzc05hbWUgPSAndGFicy1jb250ZW50ICcgKyAob3B0cy5jb250ZW50LmNsYXNzTmFtZSB8fCAnJyk7XG4gIGNvbnN0IGNvbnRlbnRJdGVtcyA9IG9wdHMuY29udGVudC5pdGVtcyB8fCBbXTtcbiAgY29udGVudEl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgaXRlbS5jbGFzc0xpc3QuYWRkKCd0YWJzLWNvbnRlbnQtaXRlbScpO1xuICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoaXRlbSk7XG4gIH0pO1xuXG4gIGNvbnN0IGFjdGl2ZSA9IHtcbiAgICBoZWFkZXJJdGVtOiBudWxsLFxuICAgIGNvbnRlbnRJdGVtOiBudWxsXG4gIH07XG5cbiAgY29uc3QgYW5pbSA9IGFuaW1zW29wdHMuYW5pbWF0aW9uLm5hbWVdID9cbiAgICBuZXcgYW5pbXNbb3B0cy5hbmltYXRpb24ubmFtZV0gOlxuICAgIG5ldyBhbmltc1snZGVmYXVsdEFuaW0nXTtcblxuICBjb25zdCB0YWJzID0ge1xuICAgIGhlYWRlcjoge1xuICAgICAgZWxlbWVudDogaGVhZGVyLFxuICAgICAgaXRlbXM6IGhlYWRlckl0ZW1zXG4gICAgfSxcbiAgICBjb250ZW50OiB7XG4gICAgICBlbGVtZW50OiBjb250ZW50LFxuICAgICAgaXRlbXM6IGNvbnRlbnRJdGVtc1xuICAgIH0sXG4gICAgYWN0aXZlOiBhY3RpdmUsXG4gICAgZ290b1RhYjogYW5pbS5nb3RvVGFiLFxuICAgIGltaXRhdGVDbGlja09uVGFiOiBmdW5jdGlvbih0YWIpIHtcbiAgICAgIHRoaXMuaGVhZGVyLml0ZW1zW3RhYl0uY2xpY2soKTtcbiAgICB9XG4gIH07XG4gICAgXG4gIGhlYWRlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2dCA9PiB7XG4gICAgY29uc3QgbGluayA9IGV2dC50YXJnZXQ7XG4gICAgY29uc3QgcmVzdWx0ID0gaGVhZGVySXRlbXMuZmluZChpdGVtID0+IGl0ZW0gPT09IGxpbmsuY2xvc2VzdCgnLnRhYnMtaGVhZGVyLWl0ZW0nKSk7XG5cbiAgICBpZiAoIXJlc3VsdCB8fCByZXN1bHQgPT09IHRhYnMuYWN0aXZlLmhlYWRlckl0ZW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICBhbmltLmhhbmRsZXIuY2FsbCh0YWJzLCBldnQpO1xuICAgIH1cbiAgfSk7XG5cbiAgYW5pbS5pbml0aWFsaXplLmNhbGwodGFicywgb3B0cy5hbmltYXRpb24uaW5pdGlhbGl6ZXIgLSAxIHx8IDAsIG9wdHMuYW5pbWF0aW9uLnBhcmFtcyk7XG5cbiAgcmV0dXJuIHRhYnM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhYnM7XG59LHtcIi4vSGVhZGVySXRlbVwiOjE4LFwiLi9hbmltYXRpb25zXCI6MjF9XSwyNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBjcmVhdGVFbGVtZW50RnJvbUhUTUwgPSBmdW5jdGlvbihodG1sKSB7XG4gIGNvbnN0IHRlbXBQYXJlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdGVtcFBhcmVudC5pbm5lckhUTUwgPSBodG1sO1xuICByZXR1cm4gdGVtcFBhcmVudC5maXJzdEVsZW1lbnRDaGlsZDtcbn07XG5cbmZ1bmN0aW9uIFNpbmdsZXRvbihmbikge1xuICBmdW5jdGlvbiBDbGFzcygpIHtcbiAgICBpZiAoQ2xhc3MuaW5zdGFuY2UpIHtcbiAgICAgIHJldHVybiBDbGFzcy5pbnN0YW5jZTtcbiAgICB9XG5cbiAgICByZXR1cm4gQ2xhc3MuaW5zdGFuY2UgPSBmbigpO1xuICB9XG5cbiAgQ2xhc3MuZ2V0SW5zdGFuY2UgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gQ2xhc3MuaW5zdGFuY2UgfHwgbmV3IENsYXNzKCk7XG4gIH07XG5cbiAgQ2xhc3MuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIENsYXNzLmluc3RhbmNlID0gbnVsbDtcbiAgfTtcblxuICByZXR1cm4gQ2xhc3M7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGVFbGVtZW50RnJvbUhUTUwsXG4gIFNpbmdsZXRvblxufTtcbn0se31dLDI1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGFwcCA9IHtcbiAgICBjb21wb25lbnRzOiB7fSxcbiAgICBwYXRoOiBbXVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBhcHA7XG59LHt9XX0se30sWzFdKTtcbiJdLCJmaWxlIjoic291cmNlLmpzIn0=
