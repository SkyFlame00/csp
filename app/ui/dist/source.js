(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Root = require('csp-app/components/main/rootComponent');
const Dashboard = require('csp-app/components/dashboard');
const MainController = require('csp-app/components/main');

const Router = require('csp-app/libs/router')
const Start = require('csp-app/components/start');
const Test = require('csp-app/components/test')

const router = new Router();
const http = require('csp-app/libs/http');

http.configure({ location: 'http://localhost:3000' });

document.addEventListener('click', evt => {
    const link = evt.target.closest('a');

    if (link && link.dataset.route) {
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
        .addRoute('/', function() {
            MainController.renderChain([new Start()])
        })
        .addRoute('dashboard', function() {
            MainController.renderChain([Test])
        })
        .addRoute('login', function() {
            
        })
    
    router.navigate(path)
});
},{"csp-app/components/dashboard":2,"csp-app/components/main":3,"csp-app/components/main/rootComponent":4,"csp-app/components/start":9,"csp-app/components/test":13,"csp-app/libs/http":17,"csp-app/libs/router":19}],2:[function(require,module,exports){
const Dashboard = function() {
  
};

module.exports = Dashboard;
},{}],3:[function(require,module,exports){
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
  },
  render: function(components) {
    this.renderChain(components);
  }
};

module.exports = MainController;
},{}],4:[function(require,module,exports){
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
},{"csp-app/libs/forms":15,"csp-app/libs/forms/validators":16}],6:[function(require,module,exports){
const Form = require('csp-app/libs/forms');
const {minLength, maxLength, startsWithNumber} = require('csp-app/libs/forms/validators');
const http = require('csp-app/libs/http')

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
      const body = {
        username: values.username,
        email: values.email,
        password: values.password
      };

      http.post('auth/signup/exec', body)
        .then(response => {
          console.log(JSON.parse(response))
        })
        .catch(error => {
          console.log(error)
        })
      ;
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
},{"csp-app/libs/forms":15,"csp-app/libs/forms/validators":16,"csp-app/libs/http":17}],7:[function(require,module,exports){
const Form = require('csp-app/libs/forms');
const {minLength, maxLength, startsWithNumber} = require('csp-app/libs/forms/validators');
const http = require('csp-app/libs/http');

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
      const {username, password} = values;
      const data = {
        username: username,
        password: password
      };

      http.post('auth/login', data)
        .then(res => {
          console.log (res)
        })
    }
  },
  controls: [
    username,
    password
  ]
});

module.exports = loginForm;
},{"csp-app/libs/forms":15,"csp-app/libs/forms/validators":16,"csp-app/libs/http":17}],8:[function(require,module,exports){
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
},{"./start.tpl":10,"./tabs":11,"csp-app/libs/utilities":26}],10:[function(require,module,exports){
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
},{"../forms/LoginForm":7,"./signupTabs":12,"csp-app/libs/misc/button-effects/radialGradientOnHover":18,"csp-app/libs/tabs":25,"csp-app/libs/utilities":26}],12:[function(require,module,exports){
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
},{"../forms":8,"csp-app/libs/misc/button-effects/radialGradientOnHover":18,"csp-app/libs/tabs":25,"csp-app/libs/utilities":26}],13:[function(require,module,exports){
const Test = {
    html: `
        <div id="test">
            <h1>This is Test component</h1>
        </div>
    `,
    instantiate: function() {
        const temp = document.createElement('div');
        temp.innerHTML = this.html;
        const element = temp.firstElementChild
        
        return {
            element: element,
            render: function(DOMTree) {
                element.innerHTML = '';
                element.appendChild(DOMTree);
            }
        }
    }
};

module.exports = Test.instantiate();
},{}],14:[function(require,module,exports){
const validate = function(control) {
  control = control || this;
  let add = {};
  let remove = {};
  let items = control.errors.items;
  let validators = control.validators;

  if (!control.required && control.value === '') {
    Object.keys(items).forEach(item => {
      if (!!items[item]) remove[item] = true;
    });
  }

  if (control.required && control.value === '') {
    if (!items['required']) {
      let element = document.createElement('li');
      element.innerHTML = 'This field is required';
      items['required'] = {
        ref: element
      }
      control.errors.ref.appendChild(element);
    }
  }

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
},{}],15:[function(require,module,exports){
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

  [
    errorsWrapper,
    ...formControlsRefs,
    submitWrapper
  ]
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
},{"./FormControl":14}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
const http = {
  location: null,
  correctUrl: function(url) {
    url = url[0] === '/' ?
      url.slice(1) :
      url;
    
    return url;
  },
  configure: function(options) {
    let location = options.location;
    location = location[location.length-1] === '/' ?
      location :
      location + '/';
    
    this.location = location;
  },
  post: function(url, body, contentType) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      url = this.correctUrl(url);
      contentType = contentType || 'application/json';

      xhr.open('POST', this.location + url);
      xhr.setRequestHeader('Content-Type', contentType);

      xhr.addEventListener('load', function() {
        resolve(this.responseText);
      });

      xhr.addEventListener('error', function() {
        reject('Network error occured');
      });

      xhr.send(JSON.stringify(body));
    });
  }
};

module.exports = http;
},{}],18:[function(require,module,exports){
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
},{"csp-app/libs/utilities":26}],19:[function(require,module,exports){
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
      if (route.children && route.children.length > 0) {
        let childrenCheck = this.getRoute(newLink, route.children);
        if (childrenCheck !== null) {
          childrenCheck.middlewares = middlewares.concat(childrenCheck.middlewares);
          childrenCheck.params = Object.assign(params, childrenCheck.params);
          return childrenCheck;
        }
      }
    }
    
    else if (regexp.lastIndex > 0) {
      // In case it's terminal route
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
    console.log('No suitable route has been found');
    return;
  }
  // route.handler(route.params);
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
  history.pushState('', '', '/' + link);
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
  console.log(fns)
  fns[0]();
};

const Subrouter = function() {
  this.routes = [];
};
Subrouter.prototype = Router.prototype;
Router.Subrouter = Subrouter;

module.exports = Router;
},{}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){
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
},{}],23:[function(require,module,exports){
const defaultAnim = require('./default');
const loginSignupSwitch = require('./loginSignupSwitch');
const tabsFlowAnimation = require('./flow');

module.exports = {
  defaultAnim,
  loginSignupSwitch,
  tabsFlowAnimation
};
},{"./default":21,"./flow":22,"./loginSignupSwitch":24}],24:[function(require,module,exports){
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
},{}],25:[function(require,module,exports){
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
},{"./HeaderItem":20,"./animations":23}],26:[function(require,module,exports){
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
},{}]},{},[1]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzb3VyY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBSb290ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL21haW4vcm9vdENvbXBvbmVudCcpO1xuY29uc3QgRGFzaGJvYXJkID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL2Rhc2hib2FyZCcpO1xuY29uc3QgTWFpbkNvbnRyb2xsZXIgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvbWFpbicpO1xuXG5jb25zdCBSb3V0ZXIgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvcm91dGVyJylcbmNvbnN0IFN0YXJ0ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3N0YXJ0Jyk7XG5jb25zdCBUZXN0ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Rlc3QnKVxuXG5jb25zdCByb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcblxuaHR0cC5jb25maWd1cmUoeyBsb2NhdGlvbjogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcgfSk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBjb25zdCBsaW5rID0gZXZ0LnRhcmdldC5jbG9zZXN0KCdhJyk7XG5cbiAgICBpZiAobGluayAmJiBsaW5rLmRhdGFzZXQucm91dGUpIHtcbiAgICAgICAgcm91dGVyLm5hdmlnYXRlKGxpbmsuZGF0YXNldC5yb3V0ZSk7XG4gICAgfVxufSk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIGV2dCA9PiB7XG4gICAgY29uc29sZS5sb2coJ3BhZ2UgY2hhbmdlZDogJywgZG9jdW1lbnQubG9jYXRpb24pO1xuICAgIGNvbnNvbGUubG9nKGV2dCk7XG4gICAgcm91dGVyLm5hdmlnYXRlKGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lKTtcbn0pO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oZXZ0KSB7XG4gICAgbGV0IHBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgY29uc3Qgcm9vdEluc3RhbmNlID0gUm9vdC5jcmVhdGUoKTtcbiAgICBNYWluQ29udHJvbGxlci5pbml0aWFsaXplKHJvb3RJbnN0YW5jZSk7XG5cbiAgICByb3V0ZXJcbiAgICAgICAgLmFkZFJvdXRlKCcvJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBNYWluQ29udHJvbGxlci5yZW5kZXJDaGFpbihbbmV3IFN0YXJ0KCldKVxuICAgICAgICB9KVxuICAgICAgICAuYWRkUm91dGUoJ2Rhc2hib2FyZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgTWFpbkNvbnRyb2xsZXIucmVuZGVyQ2hhaW4oW1Rlc3RdKVxuICAgICAgICB9KVxuICAgICAgICAuYWRkUm91dGUoJ2xvZ2luJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgfSlcbiAgICBcbiAgICByb3V0ZXIubmF2aWdhdGUocGF0aClcbn0pO1xufSx7XCJjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkXCI6MixcImNzcC1hcHAvY29tcG9uZW50cy9tYWluXCI6MyxcImNzcC1hcHAvY29tcG9uZW50cy9tYWluL3Jvb3RDb21wb25lbnRcIjo0LFwiY3NwLWFwcC9jb21wb25lbnRzL3N0YXJ0XCI6OSxcImNzcC1hcHAvY29tcG9uZW50cy90ZXN0XCI6MTMsXCJjc3AtYXBwL2xpYnMvaHR0cFwiOjE3LFwiY3NwLWFwcC9saWJzL3JvdXRlclwiOjE5fV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBEYXNoYm9hcmQgPSBmdW5jdGlvbigpIHtcbiAgXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhc2hib2FyZDtcbn0se31dLDM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgTWFpbkNvbnRyb2xsZXIgPSB7XG4gIHJvb3Q6IG51bGwsXG4gIHBhdGg6IFtdLFxuICByZW5kZXJDaGFpbjogZnVuY3Rpb24oY29tcG9uZW50cykge1xuICAgIGNvbXBvbmVudHMucmVkdWNlKChhY2N1bXVsYXRvciwgY29tcG9uZW50KSA9PiB7XG4gICAgICBhY2N1bXVsYXRvci5yZW5kZXIoY29tcG9uZW50LmVsZW1lbnQpO1xuICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9LCB0aGlzLnJvb3QpO1xuICB9LFxuICBpbml0aWFsaXplOiBmdW5jdGlvbihyb290SW5zdGFuY2UpIHtcbiAgICB0aGlzLnJvb3QgPSByb290SW5zdGFuY2U7XG4gICAgZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnJztcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHJvb3RJbnN0YW5jZS5yZWZlcmVuY2UpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKGNvbXBvbmVudHMpIHtcbiAgICB0aGlzLnJlbmRlckNoYWluKGNvbXBvbmVudHMpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1haW5Db250cm9sbGVyO1xufSx7fV0sNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBSb290ID0ge1xuICAgIGNvbXBvbmVudE5hbWU6ICdhcHAnLFxuICAgIGh0bWw6IGA8ZGl2IGlkPVwiYXBwXCI+PC9kaXY+YCxcbiAgICBpZGVudGlmaWVyOiAnI2FwcCcsXG4gICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gQ29uc2lkZXIgcmVpbXBsZW1lbnRpbmcgd2l0aCBIVE1MNSB0ZW1wbGF0ZSBmZWF0dXJlIGluc3RlYWQganVzdCB1dGlsaXppbmcgZGl2XG4gICAgICAgIGNvbnN0IHRtcEVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdG1wRWxlbS5pbm5lckhUTUwgPSB0aGlzLmh0bWw7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0bXBFbGVtLmZpcnN0Q2hpbGQ7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlZmVyZW5jZTogZWxlbWVudCxcbiAgICAgICAgICAgIHJvdXRlck91dGxldDogZWxlbWVudCxcbiAgICAgICAgICAgIGNvbXBvbmVudE5hbWU6IHRoaXMuY29tcG9uZW50TmFtZSxcbiAgICAgICAgICAgIHN0YXRlOiB7fSxcbiAgICAgICAgICAgIGFjdGlvbnM6IChmdW5jdGlvbihyb3V0ZXJPdXRsZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBsb2FkOiBmdW5jdGlvbihmcmFnbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVyT3V0bGV0LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVyT3V0bGV0LmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KShlbGVtZW50KSxcbiAgICAgICAgICAgIHJlbmRlcjogKGZ1bmN0aW9uKHJvdXRlck91dGxldCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihET01UcmVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJvdXRlck91dGxldC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgcm91dGVyT3V0bGV0LmFwcGVuZENoaWxkKERPTVRyZWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKGVsZW1lbnQpXG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJvb3Q7XG59LHt9XSw1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMnKTtcbmNvbnN0IHttaW5MZW5ndGgsIG1heExlbmd0aCwgc3RhcnRzV2l0aE51bWJlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMvdmFsaWRhdG9ycycpO1xuXG5jb25zdCB1c2VybmFtZSA9IHtcbiAga2V5TmFtZTogJ3VzZXJuYW1lJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS11c2VybmFtZScsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAndGV4dCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1VzZXJuYW1lJ31cbiAgXSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnbWF4TGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1heExlbmd0aFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3N0YXJ0c1dpdGhOdW1iZXInLFxuICAgICAgaGFuZGxlcjogc3RhcnRzV2l0aE51bWJlclxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgcGFzc3dvcmQgPSB7XG4gIGtleU5hbWU6ICdwYXNzd29yZCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tcGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3Bhc3N3b3JkJ30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnUGFzc3dvcmQnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBjb25maXJtUGFzc3dvcmQgPSB7XG4gIGtleU5hbWU6ICdjb25maXJtUGFzc3dvcmQnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLWNvbmZpcm1QYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAncGFzc3dvcmQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdDb25maXJtIHBhc3N3b3JkJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgZW1haWwgPSB7XG4gIGtleU5hbWU6ICdlbWFpbCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tcGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3RleHQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdFLW1haWwnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBjbGllbnRGb3JtID0gbmV3IEZvcm0oe1xuICB2YWxpZGF0b3JzOiBbXSxcbiAgc3VibWl0OiB7XG4gICAgaGFuZGxlcjogZnVuY3Rpb24odmFsdWVzLCBldnQpIHtcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY29uc29sZS5sb2coJ0Zvcm0gaXMgY2xlYW4nKTtcbiAgICB9XG4gIH0sXG4gIGNvbnRyb2xzOiBbXG4gICAgdXNlcm5hbWUsXG4gICAgcGFzc3dvcmQsXG4gICAgY29uZmlybVBhc3N3b3JkLFxuICAgIGVtYWlsXG4gIF1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsaWVudEZvcm07XG59LHtcImNzcC1hcHAvbGlicy9mb3Jtc1wiOjE1LFwiY3NwLWFwcC9saWJzL2Zvcm1zL3ZhbGlkYXRvcnNcIjoxNn1dLDY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgRm9ybSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3JtcycpO1xuY29uc3Qge21pbkxlbmd0aCwgbWF4TGVuZ3RoLCBzdGFydHNXaXRoTnVtYmVyfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3Jtcy92YWxpZGF0b3JzJyk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKVxuXG5jb25zdCB1c2VybmFtZSA9IHtcbiAga2V5TmFtZTogJ3VzZXJuYW1lJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS11c2VybmFtZScsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAndGV4dCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1VzZXJuYW1lJ31cbiAgXSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnbWF4TGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1heExlbmd0aFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3N0YXJ0c1dpdGhOdW1iZXInLFxuICAgICAgaGFuZGxlcjogc3RhcnRzV2l0aE51bWJlclxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgcGFzc3dvcmQgPSB7XG4gIGtleU5hbWU6ICdwYXNzd29yZCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tcGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3Bhc3N3b3JkJ30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnUGFzc3dvcmQnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBjb25maXJtUGFzc3dvcmQgPSB7XG4gIGtleU5hbWU6ICdjb25maXJtUGFzc3dvcmQnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLWNvbmZpcm1QYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAncGFzc3dvcmQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdDb25maXJtIHBhc3N3b3JkJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgZW1haWwgPSB7XG4gIGtleU5hbWU6ICdlbWFpbCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tcGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3RleHQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdFLW1haWwnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBvcmcgPSB7XG4gIGtleU5hbWU6ICdvcmcnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICd0ZXh0J30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnWW91ciBvcmdhbml6YXRpb24nfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBleGVjRm9ybSA9IG5ldyBGb3JtKHtcbiAgdmFsaWRhdG9yczogW10sXG4gIHN1Ym1pdDoge1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uKHZhbHVlcywgZXZ0KSB7XG4gICAgICBjb25zdCBib2R5ID0ge1xuICAgICAgICB1c2VybmFtZTogdmFsdWVzLnVzZXJuYW1lLFxuICAgICAgICBlbWFpbDogdmFsdWVzLmVtYWlsLFxuICAgICAgICBwYXNzd29yZDogdmFsdWVzLnBhc3N3b3JkXG4gICAgICB9O1xuXG4gICAgICBodHRwLnBvc3QoJ2F1dGgvc2lnbnVwL2V4ZWMnLCBib2R5KVxuICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coSlNPTi5wYXJzZShyZXNwb25zZSkpXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpXG4gICAgICAgIH0pXG4gICAgICA7XG4gICAgfVxuICB9LFxuICBjb250cm9sczogW1xuICAgIHVzZXJuYW1lLFxuICAgIHBhc3N3b3JkLFxuICAgIGNvbmZpcm1QYXNzd29yZCxcbiAgICBlbWFpbCxcbiAgICBvcmdcbiAgXVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhlY0Zvcm07XG59LHtcImNzcC1hcHAvbGlicy9mb3Jtc1wiOjE1LFwiY3NwLWFwcC9saWJzL2Zvcm1zL3ZhbGlkYXRvcnNcIjoxNixcImNzcC1hcHAvbGlicy9odHRwXCI6MTd9XSw3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMnKTtcbmNvbnN0IHttaW5MZW5ndGgsIG1heExlbmd0aCwgc3RhcnRzV2l0aE51bWJlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMvdmFsaWRhdG9ycycpO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9odHRwJyk7XG5cbmNvbnN0IHVzZXJuYW1lID0ge1xuICBrZXlOYW1lOiAndXNlcm5hbWUnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXVzZXJuYW1lJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICd0ZXh0J30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnVXNlcm5hbWUnfVxuICBdLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdtYXhMZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWF4TGVuZ3RoXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnc3RhcnRzV2l0aE51bWJlcicsXG4gICAgICBoYW5kbGVyOiBzdGFydHNXaXRoTnVtYmVyXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBwYXNzd29yZCA9IHtcbiAga2V5TmFtZTogJ3Bhc3N3b3JkJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1wYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAncGFzc3dvcmQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdQYXNzd29yZCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGxvZ2luRm9ybSA9IG5ldyBGb3JtKHtcbiAgdmFsaWRhdG9yczogW10sXG4gIHN1Ym1pdDoge1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uKHZhbHVlcywgZXZ0KSB7XG4gICAgICBjb25zdCB7dXNlcm5hbWUsIHBhc3N3b3JkfSA9IHZhbHVlcztcbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICB9O1xuXG4gICAgICBodHRwLnBvc3QoJ2F1dGgvbG9naW4nLCBkYXRhKVxuICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nIChyZXMpXG4gICAgICAgIH0pXG4gICAgfVxuICB9LFxuICBjb250cm9sczogW1xuICAgIHVzZXJuYW1lLFxuICAgIHBhc3N3b3JkXG4gIF1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvZ2luRm9ybTtcbn0se1wiY3NwLWFwcC9saWJzL2Zvcm1zXCI6MTUsXCJjc3AtYXBwL2xpYnMvZm9ybXMvdmFsaWRhdG9yc1wiOjE2LFwiY3NwLWFwcC9saWJzL2h0dHBcIjoxN31dLDg6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgbG9naW5Gb3JtID0gcmVxdWlyZSgnLi9Mb2dpbkZvcm0nKTtcbmNvbnN0IGNsaWVudEZvcm0gPSByZXF1aXJlKCcuL0NsaWVudEZvcm0nKTtcbmNvbnN0IGV4ZWNGb3JtID0gcmVxdWlyZSgnLi9FeGVjRm9ybScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9naW5Gb3JtLFxuICBjbGllbnRGb3JtLFxuICBleGVjRm9ybVxufTtcbn0se1wiLi9DbGllbnRGb3JtXCI6NSxcIi4vRXhlY0Zvcm1cIjo2LFwiLi9Mb2dpbkZvcm1cIjo3fV0sOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vc3RhcnQudHBsJyk7XG5jb25zdCB0YWJzID0gcmVxdWlyZSgnLi90YWJzJyk7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MLCBTaW5nbGV0b259ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5jb25zdCBTdGFydCA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKHRlbXBsYXRlKCkpO1xuICBjb25zdCB0YWJzV3JhcHBlciA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnN0YXJ0LXRhYnMnKTtcbiAgdGFic1dyYXBwZXIuYXBwZW5kQ2hpbGQodGFicy5oZWFkZXIuZWxlbWVudCk7XG4gIHRhYnNXcmFwcGVyLmFwcGVuZENoaWxkKHRhYnMuY29udGVudC5lbGVtZW50KTtcblxuICByZXR1cm4ge1xuICAgIGVsZW1lbnQ6IGVsZW1lbnRcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2luZ2xldG9uKFN0YXJ0KTtcbn0se1wiLi9zdGFydC50cGxcIjoxMCxcIi4vdGFic1wiOjExLFwiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjI2fV0sMTA6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuZnVuY3Rpb24gdGVtcGxhdGUoZGF0YSkge1xuICByZXR1cm4gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cImNtcF9zdGFydFwiPlxuICAgICAgPGRpdiBjbGFzcz1cIndyYXBwZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsb2dvLWJsb2NrXCI+XG4gICAgICAgICAgICA8aDE+V2VsY29tZSB0byBDb25zdWx0aW5nIFNlcnZpY2VzIFBsYXRmb3JtPC9oMT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBcbiAgICAgICAgICA8YSBkYXRhLXJvdXRlPVwiL1wiPkhvbWU8L2E+XG4gICAgICAgICAgPGEgZGF0YS1yb3V0ZT1cIi9kYXNoYm9hcmRcIj5EYXNoYm9hcmQ8L2E+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhcnQtdGFic1wiPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xufSx7fV0sMTE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgVGFicyA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy90YWJzJyk7XG5jb25zdCBjcmVhdGVFbGVtZW50RnJvbUhUTUwgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJykuY3JlYXRlRWxlbWVudEZyb21IVE1MO1xuY29uc3Qgc2lnbnVwVGFicyA9IHJlcXVpcmUoJy4vc2lnbnVwVGFicycpO1xuY29uc3QgbG9naW5Gb3JtID0gcmVxdWlyZSgnLi4vZm9ybXMvTG9naW5Gb3JtJyk7XG5jb25zdCByYWRpYWxHcmFkaWVudE9uSG92ZXIgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvbWlzYy9idXR0b24tZWZmZWN0cy9yYWRpYWxHcmFkaWVudE9uSG92ZXInKTtcblxuY29uc3QgbG9naW5CbG9jayA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCgvKmh0bWwqL2BcbiAgPGRpdiBjbGFzcz1cImxvZ2luLWJsb2NrXCI+XG4gICAgPGRpdiBjbGFzcz1cImhlYWRlclwiPjxoMj5Mb2cgaW48L2gyPjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJmb3JtXCI+PC9kaXY+XG4gIDwvZGl2PlxuYCk7XG5cbmNvbnN0IHNpZ251cEJsb2NrID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICA8ZGl2IGNsYXNzPVwic2lnbnVwLWJsb2NrXCI+PC9kaXY+XG5gKTtcblxuY29uc3Qgc3RhcnRUYWJzID0gbmV3IFRhYnMoe1xuICBoZWFkZXI6IHtcbiAgICBjbGFzc05hbWU6ICdtYWluLWFjdGlvbnMnLFxuICAgIGl0ZW1zOiBbXG4gICAgICB7dGl0bGU6ICdMb2cgaW4nLCB0YWc6ICdidXR0b24nfSxcbiAgICAgIHt0aXRsZTogJ1NpZ24gdXAnLCB0YWc6ICdidXR0b24nfVxuICAgIF1cbiAgfSxcbiAgY29udGVudDoge1xuICAgIGl0ZW1zOiBbXG4gICAgICBsb2dpbkJsb2NrLFxuICAgICAgc2lnbnVwQmxvY2tcbiAgICBdXG4gIH0sXG4gIGFuaW1hdGlvbjoge1xuICAgIG5hbWU6ICdsb2dpblNpZ251cFN3aXRjaCdcbiAgfVxufSk7XG5cbmNvbnN0IGNvbnRlbnRXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5jb250ZW50V3JhcHBlci5jbGFzc0xpc3QuYWRkKCdmb3JtcycpO1xuY29udGVudFdyYXBwZXIuYXBwZW5kQ2hpbGQoc2lnbnVwVGFicy5jb250ZW50LmVsZW1lbnQpO1xuXG5zdGFydFRhYnMuY29udGVudC5pdGVtc1swXS5xdWVyeVNlbGVjdG9yKCcubG9naW4tYmxvY2sgLmZvcm0nKS5hcHBlbmRDaGlsZChsb2dpbkZvcm0ucmVmKTtcbnN0YXJ0VGFicy5jb250ZW50Lml0ZW1zWzFdLmFwcGVuZENoaWxkKHNpZ251cFRhYnMuaGVhZGVyLmVsZW1lbnQpO1xuc3RhcnRUYWJzLmNvbnRlbnQuaXRlbXNbMV0uYXBwZW5kQ2hpbGQoY29udGVudFdyYXBwZXIpO1xuXG5zdGFydFRhYnMuaGVhZGVyLml0ZW1zLmZvckVhY2goaXRlbSA9PiByYWRpYWxHcmFkaWVudE9uSG92ZXIoaXRlbSwge3BhZGRpbmc6IFsxMCwgMTZdfSkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YXJ0VGFicztcbn0se1wiLi4vZm9ybXMvTG9naW5Gb3JtXCI6NyxcIi4vc2lnbnVwVGFic1wiOjEyLFwiY3NwLWFwcC9saWJzL21pc2MvYnV0dG9uLWVmZmVjdHMvcmFkaWFsR3JhZGllbnRPbkhvdmVyXCI6MTgsXCJjc3AtYXBwL2xpYnMvdGFic1wiOjI1LFwiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjI2fV0sMTI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgVGFicyA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy90YWJzJyk7XG5jb25zdCBjcmVhdGVFbGVtZW50RnJvbUhUTUwgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJykuY3JlYXRlRWxlbWVudEZyb21IVE1MO1xuY29uc3Qge2NsaWVudEZvcm0sIGV4ZWNGb3JtfSA9IHJlcXVpcmUoJy4uL2Zvcm1zJyk7XG5jb25zdCByYWRpYWxHcmFkaWVudE9uSG92ZXIgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvbWlzYy9idXR0b24tZWZmZWN0cy9yYWRpYWxHcmFkaWVudE9uSG92ZXInKTtcblxuY29uc3QgY2xpZW50Rm9ybUJsb2NrID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICA8ZGl2IGNsYXNzPVwiY2xpZW50LWZvcm0gZm9ybVwiPjwvZGl2PlxuYCk7XG5cbmNvbnN0IGV4ZWNGb3JtQmxvY2sgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJleGVjLWZvcm0gZm9ybVwiPjwvZGl2PlxuYCk7XG5cbmNvbnN0IHNpZ251cFRhYnMgPSBuZXcgVGFicyh7XG4gIGhlYWRlcjoge1xuICAgIGNsYXNzTmFtZTogJ2FjdGlvbnMgY2xlYXJmaXgnLFxuICAgIGl0ZW1zOiBbXG4gICAgICB7dGl0bGU6ICdTaWduIHVwIGFzIGNsaWVudCcsIHRhZzogJ2J1dHRvbid9LFxuICAgICAge3RpdGxlOiAnU2lnbiB1cCBhcyBleGVjdXRvcicsIHRhZzogJ2J1dHRvbid9XG4gICAgXVxuICB9LFxuICBjb250ZW50OiB7XG4gICAgaXRlbXM6IFtcbiAgICAgIGNsaWVudEZvcm1CbG9jayxcbiAgICAgIGV4ZWNGb3JtQmxvY2ssXG4gICAgXVxuICB9LFxuICBhbmltYXRpb246IHtcbiAgICBuYW1lOiAndGFic0Zsb3dBbmltYXRpb24nLFxuICAgIHBhcmFtczoge3BhZGRpbmc6IDE1LCBzcGVlZDogODUwfVxuICB9XG59KTtcblxuc2lnbnVwVGFicy5jb250ZW50Lml0ZW1zWzBdLmFwcGVuZENoaWxkKGNsaWVudEZvcm0ucmVmKTtcbnNpZ251cFRhYnMuY29udGVudC5pdGVtc1sxXS5hcHBlbmRDaGlsZChleGVjRm9ybS5yZWYpO1xuXG5zaWdudXBUYWJzLmhlYWRlci5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gcmFkaWFsR3JhZGllbnRPbkhvdmVyKGl0ZW0sIHtwYWRkaW5nOiAxNX0pKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzaWdudXBUYWJzO1xufSx7XCIuLi9mb3Jtc1wiOjgsXCJjc3AtYXBwL2xpYnMvbWlzYy9idXR0b24tZWZmZWN0cy9yYWRpYWxHcmFkaWVudE9uSG92ZXJcIjoxOCxcImNzcC1hcHAvbGlicy90YWJzXCI6MjUsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6MjZ9XSwxMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBUZXN0ID0ge1xuICAgIGh0bWw6IGBcbiAgICAgICAgPGRpdiBpZD1cInRlc3RcIj5cbiAgICAgICAgICAgIDxoMT5UaGlzIGlzIFRlc3QgY29tcG9uZW50PC9oMT5cbiAgICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBpbnN0YW50aWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGVtcC5pbm5lckhUTUwgPSB0aGlzLmh0bWw7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0ZW1wLmZpcnN0RWxlbWVudENoaWxkXG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24oRE9NVHJlZSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChET01UcmVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGVzdC5pbnN0YW50aWF0ZSgpO1xufSx7fV0sMTQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgdmFsaWRhdGUgPSBmdW5jdGlvbihjb250cm9sKSB7XG4gIGNvbnRyb2wgPSBjb250cm9sIHx8IHRoaXM7XG4gIGxldCBhZGQgPSB7fTtcbiAgbGV0IHJlbW92ZSA9IHt9O1xuICBsZXQgaXRlbXMgPSBjb250cm9sLmVycm9ycy5pdGVtcztcbiAgbGV0IHZhbGlkYXRvcnMgPSBjb250cm9sLnZhbGlkYXRvcnM7XG5cbiAgaWYgKCFjb250cm9sLnJlcXVpcmVkICYmIGNvbnRyb2wudmFsdWUgPT09ICcnKSB7XG4gICAgT2JqZWN0LmtleXMoaXRlbXMpLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBpZiAoISFpdGVtc1tpdGVtXSkgcmVtb3ZlW2l0ZW1dID0gdHJ1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChjb250cm9sLnJlcXVpcmVkICYmIGNvbnRyb2wudmFsdWUgPT09ICcnKSB7XG4gICAgaWYgKCFpdGVtc1sncmVxdWlyZWQnXSkge1xuICAgICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSAnVGhpcyBmaWVsZCBpcyByZXF1aXJlZCc7XG4gICAgICBpdGVtc1sncmVxdWlyZWQnXSA9IHtcbiAgICAgICAgcmVmOiBlbGVtZW50XG4gICAgICB9XG4gICAgICBjb250cm9sLmVycm9ycy5yZWYuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGNvbnRyb2wudmFsdWUubGVuZ3RoID4gMCAmJiAhIWl0ZW1zWydyZXF1aXJlZCddKSB7XG4gICAgcmVtb3ZlWydyZXF1aXJlZCddID0gdHJ1ZTtcbiAgfVxuXG4gIGlmIChjb250cm9sLnZhbHVlICE9PSAnJykge1xuICAgIHZhbGlkYXRvcnMuZm9yRWFjaCh2YWxpZGF0b3IgPT4ge1xuICAgICAgbGV0IHJlc3VsdCA9IHZhbGlkYXRvci5oYW5kbGVyKGNvbnRyb2wudmFsdWUsIGNvbnRyb2wpO1xuICAgICAgaWYgKCFyZXN1bHQudmFsaWQgJiYgIWl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgICAgICBhZGRbdmFsaWRhdG9yLm5hbWVdID0gcmVzdWx0O1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAocmVzdWx0LnZhbGlkICYmIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgICAgICByZW1vdmVbdmFsaWRhdG9yLm5hbWVdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIE9iamVjdC5rZXlzKGFkZCkuZm9yRWFjaChlcnJvciA9PiB7XG4gICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gYWRkW2Vycm9yXS5tZXNzYWdlO1xuICAgIGl0ZW1zW2Vycm9yXSA9IHtcbiAgICAgIHJlZjogZWxlbWVudFxuICAgIH07XG4gICAgY29udHJvbC5lcnJvcnMucmVmLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICB9KTtcblxuICBPYmplY3Qua2V5cyhyZW1vdmUpLmZvckVhY2goZXJyb3IgPT4ge1xuICAgIGl0ZW1zW2Vycm9yXS5yZWYucmVtb3ZlKCk7XG4gICAgaXRlbXNbZXJyb3JdID0gbnVsbDtcbiAgfSk7XG59O1xuXG5jb25zdCBiaW5kRXJyb3JIYW5kbGluZyA9IGZ1bmN0aW9uKGNvbnRyb2wpIHtcbiAgY29udHJvbC5jb250cm9sUmVmLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgIHZhbGlkYXRlKGNvbnRyb2wpO1xuICB9KTtcbn07XG5cbmNvbnN0IHRhZ0lucHV0ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBsZXQgcHJlcGVuZCA9IG9wdGlvbnMucHJlcGVuZCB8fCAnJztcbiAgbGV0IGFwcGVuZCA9IG9wdGlvbnMuYXBwZW5kIHx8ICcnO1xuICBsZXQgbGFiZWwgPVxuICAgIG9wdGlvbnMubGFiZWwgP1xuICAgIGA8bGFiZWwgZm9yPVwiJHtvcHRpb25zLmlkfVwiPiR7b3B0aW9ucy5sYWJlbH08L2xhYmVsPmAgOlxuICAgICcnO1xuICBsZXQgZXJyb3JzID0gb3B0aW9ucy5lcnJvcnM7XG4gIGxldCBlcnJvcnNQb3NpdGlvbiA9XG4gICAgZXJyb3JzICYmIGVycm9ycy5wb3NpdGlvbiA/XG4gICAgZXJyb3JzICYmIGVycm9ycy5wb3NpdGlvbiA6XG4gICAgJ2JlZm9yZUFwcGVuZCc7XG4gIGxldCBlcnJvcnNDbGFzcyA9XG4gICAgZXJyb3JzICYmIGVycm9ycy5jbGFzcyA/XG4gICAgZXJyb3JzICYmIGVycm9ycy5jbGFzcyA6XG4gICAgJ2Vycm9ycydcbiAgbGV0IGVycm9yc0hUTUwgPSBgPGRpdiBjbGFzcz1cIiR7ZXJyb3JzQ2xhc3N9XCI+PC9kaXY+YDtcbiAgbGV0IGNvbnRyb2xIVE1MID0gJzxpbnB1dD4nO1xuICBsZXQgaHRtbDtcbiAgXG4gIHN3aXRjaCAoZXJyb3JzUG9zaXRpb24pIHtcbiAgICBjYXNlICdiZWZvcmVQcmVwZW5kJzpcbiAgICAgIGh0bWwgPSBlcnJvcnNIVE1MICsgcHJlcGVuZCArIGxhYmVsICsgY29udHJvbEhUTUwgKyBhcHBlbmQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdiZWZvcmVMYWJlbCc6XG4gICAgICBodG1sID0gcHJlcGVuZCArIGVycm9yc0hUTUwgKyBsYWJlbCArIGNvbnRyb2xIVE1MICsgYXBwZW5kO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmVmb3JlQ29udHJvbCc6XG4gICAgICBodG1sID0gcHJlcGVuZCArIGxhYmVsICsgZXJyb3JzSFRNTCArIGNvbnRyb2xIVE1MICsgYXBwZW5kO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmVmb3JlQXBwZW5kJzpcbiAgICAgIGh0bWwgPSBwcmVwZW5kICsgbGFiZWwgKyBjb250cm9sSFRNTCArIGVycm9yc0hUTUwgKyBhcHBlbmQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdhZnRlckFwcGVuZCc6XG4gICAgICBodG1sID0gcHJlcGVuZCArIGxhYmVsICsgY29udHJvbEhUTUwgKyBhcHBlbmQgKyBlcnJvcnNIVE1MO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICBsZXQgY29udHJvbElkID0gJ2lucHV0JzsgLy8gdG8gaWRlbnRpZnkgaXQgaW4gdGhlIERPTSB3aGVuIGl0J3MgcmVuZGVyZWRcbiAgbGV0IGVycm9yc0lkID0gZXJyb3JzQ2xhc3M7IC8vIGZvciB0aGlzIHRvb1xuXG4gIGxldCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHdyYXBwZXIuY2xhc3NOYW1lID0gKG9wdGlvbnMud3JhcHBlciAmJiBvcHRpb25zLndyYXBwZXIuY2xhc3MpIHx8ICcnO1xuICB3cmFwcGVyLmlubmVySFRNTCA9IGh0bWw7XG4gIGxldCBjb250cm9sUmVmID0gd3JhcHBlci5xdWVyeVNlbGVjdG9yKGNvbnRyb2xJZCk7XG4gIGxldCBlcnJvcnNSZWYgPSB3cmFwcGVyLnF1ZXJ5U2VsZWN0b3IoJy4nK2Vycm9yc0lkKTtcblxuICBpZiAob3B0aW9ucy5hdHRyaWJ1dGVzKSB7XG4gICAgb3B0aW9ucy5hdHRyaWJ1dGVzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBjb250cm9sUmVmLnNldEF0dHJpYnV0ZShhdHRyLm5hbWUsIGF0dHIudmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgbGV0IGNvbnRyb2wgPSB7XG4gICAga2V5TmFtZTogb3B0aW9ucy5rZXlOYW1lIHx8ICcnLFxuICAgIHJlZjogd3JhcHBlcixcbiAgICBjb250cm9sUmVmOiBjb250cm9sUmVmLFxuICAgIGVycm9yczoge1xuICAgICAgcmVmOiBlcnJvcnNSZWYsXG4gICAgICBpdGVtczoge31cbiAgICB9LFxuICAgIHJlcXVpcmVkOiBvcHRpb25zLnJlcXVpcmVkIHx8IGZhbHNlLFxuICAgIHZhbGlkOiBudWxsLFxuICAgIHZhbGlkYXRvcnM6IG9wdGlvbnMudmFsaWRhdG9ycyB8fCBbXSxcbiAgICB2YWxpZGF0ZTogdmFsaWRhdGVcbiAgfTtcblxuICBiaW5kRXJyb3JIYW5kbGluZyhjb250cm9sKTtcblxuICBpZiAob3B0aW9ucy5oYW5kbGVyc09ianMpIHtcbiAgICBsZXQgZXZlbnRzID0ge307XG4gICAgbGV0IGhhbmRsZXJzT2JqcyA9IG9wdGlvbnMuaGFuZGxlcnM7XG4gICAgaGFuZGxlcnNPYmpzLmZvckVhY2gob2JqID0+IHtcbiAgICAgIGlmICghZXZlbnRzW29iai5ldmVudF0pIHtcbiAgICAgICAgZXZlbnRzW29iai5ldmVudF0gPSBbXTtcbiAgICAgIH1cbiAgICAgIGV2ZW50c1tvYmouZXZlbnRdLnB1c2gob2JqLmhhbmRsZXIpO1xuICAgIH0pO1xuICAgIE9iamVjdC5rZXlzKGV2ZW50cykuZm9yRWFjaChldmVudE5hbWUgPT4ge1xuICAgICAgY29udHJvbC5jb250cm9sUmVmLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBldnQgPT4ge1xuICAgICAgICBldmVudHNbZXZlbnROYW1lXS5mb3JFYWNoKGhhbmRsZXIgPT4gaGFuZGxlcihldnQpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnRyb2wsICd2YWx1ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiB0aGlzLmNvbnRyb2xSZWYudmFsdWV9LFxuICAgIHNldDogZnVuY3Rpb24obmV3VmFsdWUpIHt0aGlzLmNvbnRyb2xSZWYudmFsdWUgPSBuZXdWYWx1ZX1cbiAgfSlcblxuICByZXR1cm4gY29udHJvbDtcbn07XG5cbmNvbnN0IGdldEhhbmRsZXIgPSBmdW5jdGlvbih0YWcpIHtcbiAgbGV0IGZuO1xuICAvLyBTd2l0Y2ggc2VlbXMgdG8gYmUgZmFzdGVyIHRoYW4gb2JqZWN0IGxvb2sgdXBcbiAgLy8gU2VhcmNoIGZvciAnanMgc3dpdGNoIHZzIG9iamVjdCdcbiAgc3dpdGNoKHRhZykge1xuICAgIGNhc2UgJ2lucHV0JzpcbiAgICAgIGZuID0gdGFnSW5wdXQ7XG4gICAgICBicmVhaztcbiAgfVxuICByZXR1cm4gZm47XG59O1xuXG5jb25zdCBGb3JtQ29udHJvbCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgcmV0dXJuIGdldEhhbmRsZXIob3B0aW9ucy50YWcpKG9wdGlvbnMpXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvcm1Db250cm9sO1xufSx7fV0sMTU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgRm9ybUNvbnRyb2wgPSByZXF1aXJlKCcuL0Zvcm1Db250cm9sJyk7XG5cbmNvbnN0IHZhbGlkYXRlID0gZnVuY3Rpb24odmFsaWRhdG9yLCBmb3JtKSB7XG4gIGxldCBpdGVtcyA9IGZvcm0uZXJyb3JzLml0ZW1zO1xuICBsZXQgdmFsdWVzID0gdmFsaWRhdG9yLmNvbnRyb2xzLm1hcChjdHJsID0+IGN0cmwudmFsdWUpO1xuICBsZXQgcmVzdWx0ID0gdmFsaWRhdG9yLmhhbmRsZXIodmFsdWVzKTtcbiAgaWYgKCFyZXN1bHQudmFsaWQgJiYgIWl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IHJlc3VsdC5tZXNzYWdlO1xuICAgIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSA9IHtcbiAgICAgIHJlZjogZWxlbWVudFxuICAgIH07XG4gICAgZm9ybS5lcnJvcnMucmVmLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAocmVzdWx0LnZhbGlkICYmIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXS5yZWYucmVtb3ZlKCk7XG4gICAgaXRlbXNbdmFsaWRhdG9yLm5hbWVdID0gbnVsbDtcbiAgfVxufTtcblxuY29uc3QgRm9ybSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgY29uc3QgZm9ybUNvbnRyb2xzID0gb3B0aW9ucy5jb250cm9scy5tYXAoY3RybCA9PiBuZXcgRm9ybUNvbnRyb2woY3RybCkpO1xuICBsZXQgdmFsaWRhdG9ycyA9IG9wdGlvbnMudmFsaWRhdG9ycyB8fCBbXTtcbiAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb3JtJyk7XG4gIGxldCBlcnJvcnNXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGxldCBzdWJtaXRXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGxldCBmb3JtQ29udHJvbHNSZWZzID0gZm9ybUNvbnRyb2xzLm1hcChjdHJsID0+IGN0cmwucmVmKTtcbiAgZXJyb3JzV3JhcHBlci5jbGFzc05hbWUgPSAnZXJyb3JzJztcbiAgc3VibWl0V3JhcHBlci5jbGFzc05hbWUgPSAnYWN0aW9ucyc7XG4gIHN1Ym1pdFdyYXBwZXIuaW5uZXJIVE1MID0gJzxpbnB1dCB0eXBlPVwic3VibWl0XCIgdmFsdWU9XCJTdWJtaXRcIiAvPic7XG4gIHN1Ym1pdFJlZiA9IHN1Ym1pdFdyYXBwZXIucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInN1Ym1pdFwiXScpO1xuXG4gIFtcbiAgICBlcnJvcnNXcmFwcGVyLFxuICAgIC4uLmZvcm1Db250cm9sc1JlZnMsXG4gICAgc3VibWl0V3JhcHBlclxuICBdXG4gICAgLmZvckVhY2goaXRlbSA9PiB3cmFwcGVyLmFwcGVuZENoaWxkKGl0ZW0pKTtcbiAgXG4gIGxldCBmb3JtID0ge1xuICAgIHJlZjogd3JhcHBlcixcbiAgICBlcnJvcnM6IHtcbiAgICAgIHJlZjogZXJyb3JzV3JhcHBlcixcbiAgICAgIGl0ZW1zOiB7fVxuICAgIH0sXG4gICAgY29udHJvbHM6IGZvcm1Db250cm9scyxcbiAgICBzdWJtaXQ6IHtcbiAgICAgIGhhbmRsZXI6IG9wdGlvbnMuc3VibWl0LmhhbmRsZXJcbiAgICB9XG4gIH07XG5cbiAgb3B0aW9ucy52YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHtcbiAgICB2YWxpZGF0b3IuY29udHJvbHMuZm9yRWFjaChjb250cm9sID0+IHtcbiAgICAgIGNvbnRyb2wuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICAgIHZhbGlkYXRlKHZhbGlkYXRvciwgZm9ybSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgc3VibWl0UmVmLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICBsZXQgZXJyb3JzQW1vdW50ID0gMDtcbiAgICB2YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHZhbGlkYXRlKHZhbGlkYXRvciwgZm9ybSkpO1xuICAgIGZvcm0uY29udHJvbHMuZm9yRWFjaChjdHJsID0+IGN0cmwudmFsaWRhdGUoKSk7XG4gICAgT2JqZWN0LnZhbHVlcyhmb3JtLmVycm9ycy5pdGVtcykuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgaWYgKCEhdmFsKSB7XG4gICAgICAgIGVycm9yc0Ftb3VudCsrO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGZvcm0uY29udHJvbHMuZm9yRWFjaChjdHJsID0+IHtcbiAgICAgIE9iamVjdC52YWx1ZXMoY3RybC5lcnJvcnMuaXRlbXMpLmZvckVhY2godmFsID0+IHtcbiAgICAgICAgaWYgKCEhdmFsKSB7XG4gICAgICAgICAgZXJyb3JzQW1vdW50Kys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmIChlcnJvcnNBbW91bnQgPiAwKSB7XG4gICAgICBjb25zb2xlLmxvZygnRm9ybSBpcyBub3QgdmFsaWQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IHZhbHVlcyA9IHt9O1xuICAgIGZvcm0uY29udHJvbHMuZm9yRWFjaChjdHJsID0+IHtcbiAgICAgIHZhbHVlc1tjdHJsLmtleU5hbWVdID0gY3RybC52YWx1ZTtcbiAgICB9KTtcbiAgICBmb3JtLnN1Ym1pdC5oYW5kbGVyKHZhbHVlcywgZXZ0KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZvcm07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvcm07XG59LHtcIi4vRm9ybUNvbnRyb2xcIjoxNH1dLDE2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IG1pbkxlbmd0aCA9IGZ1bmN0aW9uKHZhbHVlLCBjb250cm9sKSB7XG4gIHJldHVybiB7XG4gICAgdmFsaWQ6IHZhbHVlLmxlbmd0aCA+PSA1LFxuICAgIG1lc3NhZ2U6ICdUaGlzIGZpZWxkc1xcJ3MgbGVuZ3RoIGlzIGxlc3MgdGhhbiA1IGNoYXJzJ1xuICB9XG59O1xuXG5jb25zdCBtYXhMZW5ndGggPSBmdW5jdGlvbih2YWx1ZSwgY29udHJvbCkge1xuICByZXR1cm4ge1xuICAgIHZhbGlkOiB2YWx1ZS5sZW5ndGggPD0gMTAsXG4gICAgbWVzc2FnZTogJ1RoaXMgZmllbGRzXFwncyBsZW5ndGggaXMgZ3JlYXRlciB0aGFuIDEwIGNoYXJzJ1xuICB9XG59O1xuXG5jb25zdCBzdGFydHNXaXRoTnVtYmVyID0gZnVuY3Rpb24odmFsdWUsIGNvbnRyb2wpIHtcbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogIS9eXFxkKy9pLnRlc3QodmFsdWUpLFxuICAgIG1lc3NhZ2U6ICdVc2VybmFtZSBtdXN0IG5vdCBzdGFydCB3aXRoIG51bWJlcnMnXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtaW5MZW5ndGgsXG4gIG1heExlbmd0aCxcbiAgc3RhcnRzV2l0aE51bWJlclxufTtcbn0se31dLDE3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGh0dHAgPSB7XG4gIGxvY2F0aW9uOiBudWxsLFxuICBjb3JyZWN0VXJsOiBmdW5jdGlvbih1cmwpIHtcbiAgICB1cmwgPSB1cmxbMF0gPT09ICcvJyA/XG4gICAgICB1cmwuc2xpY2UoMSkgOlxuICAgICAgdXJsO1xuICAgIFxuICAgIHJldHVybiB1cmw7XG4gIH0sXG4gIGNvbmZpZ3VyZTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGxldCBsb2NhdGlvbiA9IG9wdGlvbnMubG9jYXRpb247XG4gICAgbG9jYXRpb24gPSBsb2NhdGlvbltsb2NhdGlvbi5sZW5ndGgtMV0gPT09ICcvJyA/XG4gICAgICBsb2NhdGlvbiA6XG4gICAgICBsb2NhdGlvbiArICcvJztcbiAgICBcbiAgICB0aGlzLmxvY2F0aW9uID0gbG9jYXRpb247XG4gIH0sXG4gIHBvc3Q6IGZ1bmN0aW9uKHVybCwgYm9keSwgY29udGVudFR5cGUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICB1cmwgPSB0aGlzLmNvcnJlY3RVcmwodXJsKTtcbiAgICAgIGNvbnRlbnRUeXBlID0gY29udGVudFR5cGUgfHwgJ2FwcGxpY2F0aW9uL2pzb24nO1xuXG4gICAgICB4aHIub3BlbignUE9TVCcsIHRoaXMubG9jYXRpb24gKyB1cmwpO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsIGNvbnRlbnRUeXBlKTtcblxuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZSh0aGlzLnJlc3BvbnNlVGV4dCk7XG4gICAgICB9KTtcblxuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdCgnTmV0d29yayBlcnJvciBvY2N1cmVkJyk7XG4gICAgICB9KTtcblxuICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkoYm9keSkpO1xuICAgIH0pO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGh0dHA7XG59LHt9XSwxODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuY29uc3QgcmFkaWFsR3JhZGllbnRPbkhvdmVyID0gZnVuY3Rpb24oYnRuLCBvcHRzKSB7XG4gIGNvbnN0IHRleHQgPSBidG4uaW5uZXJIVE1MO1xuICBjb25zdCB3cmFwcGVyID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCJyZy1idG5cIj5cbiAgICAgIDxzcGFuPiR7dGV4dH08L3NwYW4+XG4gICAgPC9kaXY+XG4gIGApO1xuICBidG4uaW5uZXJIVE1MID0gJyc7XG4gIGJ0bi5zdHlsZS5wYWRkaW5nID0gMDtcblxuICBpZiAoTnVtYmVyLmlzSW50ZWdlcihvcHRzLnBhZGRpbmcpKSB7XG4gICAgd3JhcHBlci5zdHlsZS5wYWRkaW5nID0gb3B0cy5wYWRkaW5nICsgJ3B4JztcbiAgfVxuICBlbHNlIGlmIChvcHRzLnBhZGRpbmcgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIGlmIChvcHRzLnBhZGRpbmcubGVuZ3RoID09IDIpIHtcbiAgICAgIHdyYXBwZXIuc3R5bGUucGFkZGluZ1RvcCA9IHdyYXBwZXIuc3R5bGUucGFkZGluZ0JvdHRvbSA9IG9wdHMucGFkZGluZ1swXSArICdweCc7XG4gICAgICB3cmFwcGVyLnN0eWxlLnBhZGRpbmdMZWZ0ID0gd3JhcHBlci5zdHlsZS5wYWRkaW5nUmlnaHQgPSBvcHRzLnBhZGRpbmdbMV0gKyAncHgnO1xuICAgIH1cbiAgfVxuXG4gIGJ0bi5hcHBlbmRDaGlsZCh3cmFwcGVyKTtcblxuICBidG4uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZXZ0ID0+IHtcbiAgICBjb25zdCBjb29yZGluYXRlcyA9IGV2dC50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgeCA9IGV2dC5jbGllbnRYIC0gY29vcmRpbmF0ZXMubGVmdDtcbiAgICBjb25zdCB5ID0gZXZ0LmNsaWVudFkgLSBjb29yZGluYXRlcy50b3A7XG4gICAgZXZ0LnRhcmdldC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS14JywgYCR7IHggfXB4YCk7XG4gICAgZXZ0LnRhcmdldC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS15JywgYCR7IHkgfXB4YCk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSByYWRpYWxHcmFkaWVudE9uSG92ZXI7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjoyNn1dLDE5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IFJvdXRlciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJvdXRlcyA9IFtdO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS5yZWdleHBQYXJhbXMgPSAvKFxcKDooW1xcd1xcZFxcLV9dKylcXCkpL2dpO1xuXG5Sb3V0ZXIucHJvdG90eXBlLnRyaW1Sb3V0ZSA9IGZ1bmN0aW9uKHJvdXRlKXtcbiAgcm91dGUgPSByb3V0ZVswXSA9PT0gJy8nXG4gICAgPyByb3V0ZS5zdWJzdHIoMSlcbiAgICA6IHJvdXRlO1xuXG4gIHJvdXRlID0gcm91dGVbcm91dGUubGVuZ3RoIC0gMV0gPT09ICcvJ1xuICAgID8gcm91dGUuc3Vic3RyKDAsIHJvdXRlLmxlbmd0aCAtIDEpXG4gICAgOiByb3V0ZTtcblxuICByZXR1cm4gcm91dGU7XG59LFxuXG5Sb3V0ZXIucHJvdG90eXBlLmdldFBhcmFtc05hbWVzID0gZnVuY3Rpb24ocm91dGUpIHtcbiAgbGV0IHJlc3VsdDtcbiAgbGV0IHBhcmFtc05hbWVzID0gW107XG4gIHdoaWxlICgocmVzdWx0ID0gdGhpcy5yZWdleHBQYXJhbXMuZXhlYyhyb3V0ZSkpICE9PSBudWxsKSB7XG4gICAgcGFyYW1zTmFtZXMucHVzaChyZXN1bHRbMl0pO1xuICB9XG4gIHJldHVybiBwYXJhbXNOYW1lcztcbn1cblxuUm91dGVyLnByb3RvdHlwZS5hZGRSb3V0ZSA9IGZ1bmN0aW9uKHJvdXRlLCBvYmopIHtcbiAgcm91dGUgPSB0aGlzLnRyaW1Sb3V0ZShyb3V0ZSk7XG4gIGxldCBwYXJhbXNOYW1lcyA9IHRoaXMuZ2V0UGFyYW1zTmFtZXMocm91dGUpO1xuICBsZXQgcmVnZXhwU3RyID0gcm91dGUucmVwbGFjZSh0aGlzLnJlZ2V4cFBhcmFtcywgJyhbXFxcXHdcXFxcZFxcLV9dKyknKTtcbiAgbGV0IHJlZ2V4cCA9IFJlZ0V4cChgXiR7cmVnZXhwU3RyfShcXFxcL3wkKWAsICdnaScpO1xuXG4gIGxldCByb3V0ZU9iaiA9IHtcbiAgICB0eXBlOiAncm91dGUnLFxuICAgIHJlZ2V4cDogcmVnZXhwLFxuICAgIHBhcmFtc05hbWVzOiBwYXJhbXNOYW1lc1xuICB9O1xuXG4gIGlmICh0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLyoqXG4gICAgICogUm91dGUgaGFuZGxlciB3aWxsIGJlIGludm9rZWQgd2hlbiB1c2VyIGdvZXMgdG8gdGhlIGNvcnJlc3BvbmRpbmdcbiAgICAgKiByb3V0ZSBhbmQgbm90IHRlcm1pbmF0ZWQgYnkgbWlkZGxld2FyZXMgdW5kZXJ3YXlcbiAgICAgKiBAZnVuY3Rpb24gaGFuZGxlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBoYW5kbGVyUGFyYW1zIC0gcGFyYW1zIG1heSBiZSBnaXZlbiB3aGVuIFJvdXRlci5uYXZpZ2F0ZSBpcyBpbnZva2VkXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHJvdXRlUGFyYW1zIC0gcGFyYW1zIGV4aXN0aW5nIG9uIHRoZSByb3V0ZSBpZiBhbnlcbiAgICAgKiBAcGFyYW0ge2FueX0gYXJnIC0gdGhpcyBpcyBnaXZlbiBieSB0aGUgbGFzdCBtaWRkbGV3YXJlIGlmIGFueVxuICAgICAqL1xuICAgIHJvdXRlT2JqLmhhbmRsZXIgPSBvYmo7XG4gIH1cblxuICBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIHJvdXRlT2JqLmNoaWxkcmVuID0gb2JqO1xuICB9XG5cbiAgZWxzZSB7XG4gICAgY29uc29sZS5sb2coJ0Vycm9yIG9jY3VyZWQgd2hpbGUgYWRkaW5nIHJvdXRlJyk7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyb3V0ZSBlcnJvcicpO1xuICB9XG5cbiAgdGhpcy5yb3V0ZXMucHVzaChyb3V0ZU9iaik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS5nZXRSb3V0ZSA9IGZ1bmN0aW9uKGxpbmssIHJvdXRlcyA9IHRoaXMucm91dGVzKSB7XG4gIGxpbmsgPSBsaW5rID09PSAnJyA/ICcvJyA6IGxpbms7XG4gIGxldCBtaWRkbGV3YXJlcyA9IFtdO1xuICBsZXQgcGFyYW1zID0ge307XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoLCByb3V0ZSA9IHJvdXRlc1tpXTsgaSsrKSB7XG4gICAgaWYgKHJvdXRlLnR5cGUgPT0gJ21pZGRsZXdhcmUnKSB7XG4gICAgICBtaWRkbGV3YXJlcy5wdXNoKHJvdXRlLmZuKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChyb3V0ZS50eXBlID09ICdyb3V0ZXMnKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbkNoZWNrID0gdGhpcy5nZXRSb3V0ZShsaW5rLCByb3V0ZS5yb3V0ZXMpO1xuICAgICAgaWYgKGNoaWxkcmVuQ2hlY2sgIT09IG51bGwpIHtcbiAgICAgICAgY2hpbGRyZW5DaGVjay5taWRkbGV3YXJlcyA9IG1pZGRsZXdhcmVzLmNvbmNhdChjaGlsZHJlbkNoZWNrLm1pZGRsZXdhcmVzKTtcbiAgICAgICAgY2hpbGRyZW5DaGVjay5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHBhcmFtcywgY2hpbGRyZW5DaGVjay5wYXJhbXMpO1xuICAgICAgICByZXR1cm4gY2hpbGRyZW5DaGVjaztcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGxldCByZWdleHAgPSByb3V0ZS5yZWdleHA7XG4gICAgbGV0IHJlc3VsdCA9IHJlZ2V4cC5leGVjKGxpbmspO1xuICAgIGxldCBuZXdMaW5rO1xuXG4gICAgaWYgKHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoID4gMSkge1xuICAgICAgcGFyYW1zID0ge307XG4gICAgICBmb3IgKGxldCBpZHggPSAxOyBpZHggPCByZXN1bHQubGVuZ3RoIC0gMTsgaWR4KyspIHtcbiAgICAgICAgcGFyYW1zW3JvdXRlLnBhcmFtc05hbWVzW2lkeC0xXV0gPSByZXN1bHRbaWR4XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmVnZXhwLmxhc3RJbmRleCA+IDApIHtcbiAgICAgIG5ld0xpbmsgPSBsaW5rLnN1YnN0cihyZWdleHAubGFzdEluZGV4KTtcbiAgICB9XG5cbiAgICBpZiAocmVnZXhwLmxhc3RJbmRleCA+IDAgJiYgbmV3TGluay5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAocm91dGUuY2hpbGRyZW4gJiYgcm91dGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICBsZXQgY2hpbGRyZW5DaGVjayA9IHRoaXMuZ2V0Um91dGUobmV3TGluaywgcm91dGUuY2hpbGRyZW4pO1xuICAgICAgICBpZiAoY2hpbGRyZW5DaGVjayAhPT0gbnVsbCkge1xuICAgICAgICAgIGNoaWxkcmVuQ2hlY2subWlkZGxld2FyZXMgPSBtaWRkbGV3YXJlcy5jb25jYXQoY2hpbGRyZW5DaGVjay5taWRkbGV3YXJlcyk7XG4gICAgICAgICAgY2hpbGRyZW5DaGVjay5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHBhcmFtcywgY2hpbGRyZW5DaGVjay5wYXJhbXMpO1xuICAgICAgICAgIHJldHVybiBjaGlsZHJlbkNoZWNrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIGVsc2UgaWYgKHJlZ2V4cC5sYXN0SW5kZXggPiAwKSB7XG4gICAgICAvLyBJbiBjYXNlIGl0J3MgdGVybWluYWwgcm91dGVcbiAgICAgIGlmIChyb3V0ZS5oYW5kbGVyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaGFuZGxlcjogcm91dGUuaGFuZGxlcixcbiAgICAgICAgICBwYXJhbXM6IHBhcmFtcyxcbiAgICAgICAgICBtaWRkbGV3YXJlczogbWlkZGxld2FyZXNcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gU2luY2UgaXQncyBkb25lIGFuZCBsaW5rIGlzIChhY3R1YWxseSwgd2lsbCBiZSB3aGVuIHdlXG4gICAgICAvLyBnZXQgaW50byByZWN1cnNpb24pICcvJywgc28gd2UgbG9vayB1cCBjaGlsZHJlbiB0b1xuICAgICAgLy8gdG8gbWF0Y2ggdGhlIHJvb3QgJy8nIHdoaWNoIG11c3QgZXhpc3QgdGhlcmVcbiAgICAgIGlmIChyb3V0ZS5jaGlsZHJlbikge1xuICAgICAgICBsZXQgY2hpbGRyZW5DaGVjayA9IHRoaXMuZ2V0Um91dGUobmV3TGluaywgcm91dGUuY2hpbGRyZW4pO1xuICAgICAgICBpZiAoY2hpbGRyZW5DaGVjayAhPT0gbnVsbCkge1xuICAgICAgICAgIGNoaWxkcmVuQ2hlY2subWlkZGxld2FyZXMgPSBtaWRkbGV3YXJlcy5jb25jYXQoY2hpbGRyZW5DaGVjay5taWRkbGV3YXJlcyk7XG4gICAgICAgICAgY2hpbGRyZW5DaGVjay5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHBhcmFtcywgY2hpbGRyZW5DaGVjay5wYXJhbXMpO1xuICAgICAgICAgIHJldHVybiBjaGlsZHJlbkNoZWNrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS5hZGRSb3V0ZXMgPSBmdW5jdGlvbihyb3V0ZXMpIHtcbiAgdGhpcy5yb3V0ZXMucHVzaCh7XG4gICAgdHlwZTogJ3JvdXRlcycsXG4gICAgcm91dGVzOiByb3V0ZXNcbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLmFkZE1pZGRsZXdhcmUgPSBmdW5jdGlvbihmbikge1xuICB0aGlzLnJvdXRlcy5wdXNoKHtcbiAgICB0eXBlOiAnbWlkZGxld2FyZScsXG4gICAgZm46IGZuXG4gIH0pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS5uYXZpZ2F0ZSA9IGZ1bmN0aW9uKGxpbmssIGhhbmRsZXJQYXJhbXMpIHtcbiAgbGluayA9IHRoaXMudHJpbVJvdXRlKGxpbmspO1xuICBsZXQgcm91dGUgPSB0aGlzLmdldFJvdXRlKGxpbmspO1xuICBpZiAoIXJvdXRlKSB7XG4gICAgY29uc29sZS5sb2coJ05vIHN1aXRhYmxlIHJvdXRlIGhhcyBiZWVuIGZvdW5kJyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHJvdXRlLmhhbmRsZXIocm91dGUucGFyYW1zKTtcbiAgZm5zID0gcm91dGUubWlkZGxld2FyZXMuY29uY2F0KFtyb3V0ZS5oYW5kbGVyLmJpbmQobnVsbCwgaGFuZGxlclBhcmFtcyldKTtcbiAgZm9yIChsZXQgaSA9IGZucy5sZW5ndGggLSAxOyBpID4gMCwgZm4gPSBmbnNbaV07IGktLSkge1xuICAgIGlmIChpICE9PSBmbnMubGVuZ3RoIC0gMSkge1xuICAgICAgZm5zW2ldID0gZm4uYmluZChudWxsLCBmbnNbaSsxXSwgcm91dGUucGFyYW1zKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBmbnNbaV0gPSBmbi5iaW5kKG51bGwsIHJvdXRlLnBhcmFtcyk7XG4gICAgfVxuICB9XG4gIGZuc1swXSgpO1xuICBoaXN0b3J5LnB1c2hTdGF0ZSgnJywgJycsICcvJyArIGxpbmspO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS50ZXN0TmF2ID0gZnVuY3Rpb24obGluaywgaGFuZGxlclBhcmFtcykge1xuICBsaW5rID0gdGhpcy50cmltUm91dGUobGluayk7XG4gIGxldCByb3V0ZSA9IHRoaXMuZ2V0Um91dGUobGluayk7XG4gIGlmICghcm91dGUpIHtcbiAgICBjb25zb2xlLmxvZygnTm8gc3VpdGFibGUgcm91dGUgaGFzIGJlZW4gZm91bmQnKVxuICAgIHJldHVybjtcbiAgfVxuICAvLyBjb25zb2xlLmxvZyhyb3V0ZSk7XG4gIGZucyA9IHJvdXRlLm1pZGRsZXdhcmVzLmNvbmNhdChbcm91dGUuaGFuZGxlci5iaW5kKG51bGwsIGhhbmRsZXJQYXJhbXMpXSk7XG4gIGZvciAobGV0IGkgPSBmbnMubGVuZ3RoIC0gMTsgaSA+IDAsIGZuID0gZm5zW2ldOyBpLS0pIHtcbiAgICBpZiAoaSAhPT0gZm5zLmxlbmd0aCAtIDEpIHtcbiAgICAgIGZuc1tpXSA9IGZuLmJpbmQobnVsbCwgZm5zW2krMV0sIHJvdXRlLnBhcmFtcyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZm5zW2ldID0gZm4uYmluZChudWxsLCByb3V0ZS5wYXJhbXMpO1xuICAgIH1cbiAgfVxuICBjb25zb2xlLmxvZyhmbnMpXG4gIGZuc1swXSgpO1xufTtcblxuY29uc3QgU3Vicm91dGVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucm91dGVzID0gW107XG59O1xuU3Vicm91dGVyLnByb3RvdHlwZSA9IFJvdXRlci5wcm90b3R5cGU7XG5Sb3V0ZXIuU3Vicm91dGVyID0gU3Vicm91dGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJvdXRlcjtcbn0se31dLDIwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHRhZ3MgPSBbJ2RpdicsICdzcGFuJywgJ2J1dHRvbiddO1xuXG5jb25zdCBIZWFkZXJJdGVtID0gZnVuY3Rpb24ob3B0cykge1xuICBjb25zdCB0aXRsZSA9IG9wdHMudGl0bGUgfHwgJyc7XG4gIGNvbnN0IGNsYXNzTmFtZSA9IG9wdHMuY2xhc3NOYW1lIHx8ICcnO1xuICBjb25zdCB0YWcgPSB0YWdzLmZpbmQodGFnID0+IHRhZyA9PT0gb3B0cy50YWcpID9cbiAgICBvcHRzLnRhZyA6XG4gICAgJ3NwYW4nO1xuXG4gIGNvbnN0IGhlYWRlckl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG4gIGhlYWRlckl0ZW0uY2xhc3NOYW1lID0gJ3RhYnMtaGVhZGVyLWl0ZW0gJyArIGNsYXNzTmFtZTtcbiAgaGVhZGVySXRlbS5pbm5lckhUTUwgPSB0aXRsZTtcblxuICBpZiAob3B0cy5hdHRyaWJ1dGVzKSB7XG4gICAgb3B0cy5hdHRyaWJ1dGVzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBoZWFkZXJJdGVtLnNldEF0dHJpYnV0ZShhdHRyLm5hbWUsIGF0dHIudmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBlbGVtZW50OiBoZWFkZXJJdGVtXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlckl0ZW07XG59LHt9XSwyMTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBkZWZhdWx0QW5pbSA9IGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBoYW5kbGVyKGV2dCkge1xuICAgIGNvbnN0IHRhYiA9IGV2dC50YXJnZXQuY2xvc2VzdCgnLnRhYnMtaGVhZGVyLWl0ZW0nKS5kYXRhc2V0Lm9yZGVyO1xuICAgIHRoaXMuZ290b1RhYih0YWIpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ290b1RhYih0YWIpIHtcbiAgICB0YWItLTtcbiAgICBjb25zdCBuZXdIZWFkZXJJdGVtID0gdGhpcy5oZWFkZXIuaXRlbXNbdGFiXTtcbiAgICBjb25zdCBuZXdDb250ZW50SXRlbSA9IHRoaXMuY29udGVudC5pdGVtc1t0YWJdO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcblxuICAgIG5ld0hlYWRlckl0ZW0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgbmV3Q29udGVudEl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gICAgbmV3Q29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cbiAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtID0gbmV3SGVhZGVySXRlbTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbSA9IG5ld0NvbnRlbnRJdGVtO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdGlhbGl6ZSh0YWIpIHtcbiAgICB0YWItLTtcbiAgICBjb25zdCBhY3RpdmVIZWFkZXJJdGVtID0gdGhpcy5oZWFkZXIuaXRlbXNbdGFiXTtcbiAgICBjb25zdCBhY3RpdmVDb250ZW50SXRlbSA9IHRoaXMuY29udGVudC5pdGVtc1t0YWJdO1xuICAgIGNvbnN0IG5vbkFjdGl2ZUNvbnRlbnRJdGVtcyA9IHRoaXMuY29udGVudC5pdGVtcy5maWx0ZXIoaXRlbSA9PiBpdGVtICE9PSBhY3RpdmVDb250ZW50SXRlbSk7XG5cbiAgICBhY3RpdmVIZWFkZXJJdGVtLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgIGFjdGl2ZUNvbnRlbnRJdGVtLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXG4gICAgbm9uQWN0aXZlQ29udGVudEl0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpKTtcblxuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0gPSBhY3RpdmVIZWFkZXJJdGVtO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtID0gYWN0aXZlQ29udGVudEl0ZW07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGhhbmRsZXIsXG4gICAgZ290b1RhYixcbiAgICBpbml0aWFsaXplXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRBbmltO1xufSx7fV0sMjI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qgc2V0Q29udGVudEl0ZW1zV2lkdGhzID0gZnVuY3Rpb24ob3B0aW9ucywgYW5pbVBhcmFtcykge1xuICBjb25zdCBjb250cm9sbGVyID0gb3B0aW9ucy5jb250cm9sbGVyIHx8IHt9O1xuICBjb25zdCBuZXdPcmRlciA9IG9wdGlvbnMubmV3T3JkZXI7XG4gIGNvbnN0IHNldEZvck5ld09yZGVyID0gb3B0aW9ucy5zZXRGb3JOZXdPcmRlciB8fCBmYWxzZTtcbiAgY29uc3QgaXRlbXMgPSBjb250cm9sbGVyLmNvbnRlbnQuaXRlbXM7XG4gIGNvbnN0IGxlbiA9IGl0ZW1zLmxlbmd0aDtcbiAgY29uc3Qgd2lkdGggPSBjb250cm9sbGVyLmNvbnRlbnQuZWxlbWVudC5jbGllbnRXaWR0aDtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbiwgaXRlbSA9IGl0ZW1zW2ldOyBpKyspIHtcbiAgICBpZiAoc2V0Rm9yTmV3T3JkZXIgfHwgaXRlbSAhPT0gaXRlbXNbbmV3T3JkZXJdKSB7XG4gICAgICBpdGVtLnN0eWxlLndpZHRoID0gKHdpZHRoIC0gMiphbmltUGFyYW1zLnBhZGRpbmcpICsgJ3B4JztcbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0IHNldENvbnRlbnRJdGVtc1Bvc2l0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgY29uc3QgY29udHJvbGxlciA9IG9wdGlvbnMuY29udHJvbGxlciB8fCB7fTtcbiAgY29uc3QgbmV3T3JkZXIgPSBvcHRpb25zLm5ld09yZGVyO1xuICBjb25zdCBzZXRGb3JOZXdPcmRlciA9IG9wdGlvbnMuc2V0Rm9yTmV3T3JkZXIgfHwgZmFsc2U7XG4gIGNvbnN0IGl0ZW1zID0gY29udHJvbGxlci5jb250ZW50Lml0ZW1zO1xuICBjb25zdCBsZW4gPSBpdGVtcy5sZW5ndGg7XG4gIGNvbnN0IHdpZHRoID0gY29udHJvbGxlci5jb250ZW50LmVsZW1lbnQuY2xpZW50V2lkdGg7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW4sIGl0ZW0gPSBpdGVtc1tpXTsgaSsrKSB7XG4gICAgaWYgKHNldEZvck5ld09yZGVyIHx8IGl0ZW0gIT09IGl0ZW1zW25ld09yZGVyXSkge1xuICAgICAgaXRlbS5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlWCgkeyhpLW5ld09yZGVyKSp3aWR0aH1weClgO1xuICAgIH1cbiAgfVxufTtcblxuY29uc3Qgc2V0Q29udGVudEl0ZW1zRGlzcGxheSA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgY29uc3QgY29udGVudEl0ZW1zID0gb3B0cy5jb250cm9sbGVyLmNvbnRlbnQuaXRlbXM7XG4gIGNvbnN0IGRpc3BsYXkgPSBvcHRzLmRpc3BsYXk7XG4gIGNvbnN0IG5ld09yZGVyID0gb3B0cy5uZXdPcmRlcjtcbiAgY29uc3Qgc2V0Rm9yTmV3T3JkZXIgPSBvcHRzLnNldEZvck5ld09yZGVyO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY29udGVudEl0ZW1zLmxlbmd0aCwgY2kgPSBjb250ZW50SXRlbXNbaV07IGkrKykge1xuICAgIGlmIChzZXRGb3JOZXdPcmRlciB8fCBjaSAhPT0gY29udGVudEl0ZW1zW25ld09yZGVyXSkge1xuICAgICAgY2kuc3R5bGUuZGlzcGxheSA9IGRpc3BsYXk7XG4gICAgfVxuICB9XG59O1xuXG5jb25zdCBUYWJzRmxvd0FuaW1hdGlvbiA9IGZ1bmN0aW9uKCkge1xuICBsZXQgcGFyYW1zO1xuXG4gIGZ1bmN0aW9uIGhhbmRsZXIoZXZ0KSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlLndvcmtpbmcpIHJldHVybjtcbiAgICB0aGlzLmFjdGl2ZS53b3JraW5nID0gdHJ1ZTtcbiAgICAvLyBISSBzdGFuZHMgZm9yIEhlYWRlciBJdGVtXG4gICAgLy8gQ0kgc3RhbmRzIGZvciBDb250ZW50IEl0ZW1cbiAgICBjb25zdCBuZXdISSA9IGV2dC50YXJnZXQuY2xvc2VzdCgnLnRhYnMtaGVhZGVyLWl0ZW0nKTtcbiAgICBjb25zdCBvcmRlciA9ICtuZXdISS5kYXRhc2V0Lm9yZGVyIC0gMTtcbiAgICBjb25zdCBuZXdDSSA9IHRoaXMuY29udGVudC5pdGVtc1tvcmRlcl07XG4gICAgY29uc3Qgc3BlZWQgPSBwYXJhbXMuc3BlZWQ7XG4gICAgY29uc3Qgb2xkT3JkZXIgPSArdGhpcy5hY3RpdmUuaGVhZGVySXRlbS5kYXRhc2V0Lm9yZGVyIC0gMTtcblxuICAgIHNldENvbnRlbnRJdGVtc1Bvc2l0aW9ucyh7Y29udHJvbGxlcjogdGhpcywgbmV3T3JkZXI6IG9sZE9yZGVyLCBzZXRGb3JOZXdPcmRlcjogZmFsc2V9KTtcbiAgICBzZXRDb250ZW50SXRlbXNEaXNwbGF5KHtjb250cm9sbGVyOiB0aGlzLCBuZXdPcmRlcjogb3JkZXIsIHNldEZvck5ld09yZGVyOiB0cnVlLCBkaXNwbGF5OiAnYmxvY2snfSk7XG4gICAgbmV3SEkuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICB0aGlzLmNvbnRlbnQuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5jbGllbnRIZWlnaHQgKyAncHgnO1xuICAgIHRoaXMuY29udGVudC5lbGVtZW50LnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IHNwZWVkICsgJ21zJztcbiAgICB0aGlzLmNvbnRlbnQuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSBuZXdDSS5jbGllbnRIZWlnaHQgKyAncHgnO1xuXG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLnN0eWxlLnRvcCA9IHBhcmFtcy5wYWRkaW5nICsgJ3B4JztcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5zdHlsZS5sZWZ0ID0gcGFyYW1zLnBhZGRpbmcgKyAncHgnO1xuXG4gICAgdGhpcy5jb250ZW50Lml0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IHNwZWVkICsgJ21zJyk7XG5cbiAgICBzZXRDb250ZW50SXRlbXNXaWR0aHMoe2NvbnRyb2xsZXI6IHRoaXMsIG5ld09yZGVyOiBvcmRlciwgc2V0Rm9yTmV3T3JkZXI6IHRydWV9LCBwYXJhbXMpO1xuICAgIHNldENvbnRlbnRJdGVtc1Bvc2l0aW9ucyh7Y29udHJvbGxlcjogdGhpcywgbmV3T3JkZXI6IG9yZGVyLCBzZXRGb3JOZXdPcmRlcjogdHJ1ZX0pO1xuICAgIFxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgbmV3Q0kuc3R5bGUucG9zaXRpb24gPSAnc3RhdGljJztcbiAgICAgIG5ld0NJLnN0eWxlLndpZHRoID0gJ2F1dG8nO1xuICAgICAgdGhpcy5jb250ZW50LmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuICAgICAgdGhpcy5jb250ZW50Lml0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9ICcwbXMnKTtcbiAgICAgIHRoaXMuY29udGVudC5lbGVtZW50LnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9ICcwbXMnO1xuICAgICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IG5ld0hJO1xuICAgICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSBuZXdDSTtcbiAgICAgIHRoaXMuYWN0aXZlLndvcmtpbmcgPSBmYWxzZTtcbiAgICAgIHNldENvbnRlbnRJdGVtc0Rpc3BsYXkoe1xuICAgICAgICBjb250cm9sbGVyOiB0aGlzLFxuICAgICAgICBuZXdPcmRlcjogb3JkZXIsXG4gICAgICAgIHNldEZvck5ld09yZGVyOiBmYWxzZSxcbiAgICAgICAgZGlzcGxheTogJ25vbmUnXG4gICAgICB9KTtcbiAgICB9LCBzcGVlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBnb3RvVGFiKHRhYikge1xuXG4gIH1cblxuICBmdW5jdGlvbiBpbml0aWFsaXplKHRhYiwgYW5pbU9wdGlvbnMpIHtcbiAgICBwYXJhbXMgPSBhbmltT3B0aW9ucyB8fCB7fTtcbiAgICAvLyBBZGQgY2xhc3Nlc1xuICAgIHRoaXMuY29udGVudC5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3RhYnMtZmxvdy1jb250ZW50Jyk7XG4gICAgdGhpcy5jb250ZW50Lml0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLmNsYXNzTGlzdC5hZGQoJ3RhYnMtZmxvdy1DSScpKTtcbiAgICBcbiAgICAvLyBTZXQgaW5kaXZpZHVhbCBDU1NcbiAgICBjb25zdCBDSXMgPSB0aGlzLmNvbnRlbnQuaXRlbXM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBDSXMubGVuZ3RoLCBpdGVtID0gQ0lzW2ldOyBpKyspIHtcbiAgICAgIGlmIChpICE9PSB0YWIpIHtcbiAgICAgICAgQ0lzW2ldLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJzsgICAgXG4gICAgICAgIENJc1tpXS5zdHlsZS50b3AgPSBwYXJhbXMucGFkZGluZyArICdweCc7XG4gICAgICAgIENJc1tpXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmhlYWRlci5pdGVtc1t0YWJdLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXG4gICAgLy8gU2V0IGFjdGl2ZSBvYmplY3RcbiAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtID0gdGhpcy5oZWFkZXIuaXRlbXNbdGFiXTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbSA9IHRoaXMuY29udGVudC5pdGVtc1t0YWJdO1xuXG4gICAgLy8gQWRkIG9uIHJlc2l6aW5nIGV2ZW50IGhhbmRsZXJcbiAgICBjb25zdCBuZXdPcmRlciA9ICt0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtLmRhdGFzZXQub3JkZXIgLSAxO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICBjb25zdCBvcHRpb25zID0ge2NvbnRyb2xsZXI6IHRoaXMsIG5ld09yZGVyOiBuZXdPcmRlcn07XG4gICAgICBpZiAodGhpcy5hY3RpdmUud29ya2luZykge1xuICAgICAgICBzZXRDb250ZW50SXRlbXNXaWR0aHMob3B0aW9ucywgcGFyYW1zKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBzZXRDb250ZW50SXRlbXNXaWR0aHMob3B0aW9ucywgcGFyYW1zKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgc2V0Q29udGVudEl0ZW1zUG9zaXRpb25zKG9wdGlvbnMpXG4gICAgfSk7XG5cbiAgICBzZXRDb250ZW50SXRlbXNEaXNwbGF5KHtcbiAgICAgIGNvbnRyb2xsZXI6IHRoaXMsXG4gICAgICBuZXdPcmRlcjogbmV3T3JkZXIsXG4gICAgICBzZXRGb3JOZXdPcmRlcjogZmFsc2UsXG4gICAgICBkaXNwbGF5OiAnbm9uZSdcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlcixcbiAgICBnb3RvVGFiLFxuICAgIGluaXRpYWxpemVcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGFic0Zsb3dBbmltYXRpb247XG59LHt9XSwyMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBkZWZhdWx0QW5pbSA9IHJlcXVpcmUoJy4vZGVmYXVsdCcpO1xuY29uc3QgbG9naW5TaWdudXBTd2l0Y2ggPSByZXF1aXJlKCcuL2xvZ2luU2lnbnVwU3dpdGNoJyk7XG5jb25zdCB0YWJzRmxvd0FuaW1hdGlvbiA9IHJlcXVpcmUoJy4vZmxvdycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZGVmYXVsdEFuaW0sXG4gIGxvZ2luU2lnbnVwU3dpdGNoLFxuICB0YWJzRmxvd0FuaW1hdGlvblxufTtcbn0se1wiLi9kZWZhdWx0XCI6MjEsXCIuL2Zsb3dcIjoyMixcIi4vbG9naW5TaWdudXBTd2l0Y2hcIjoyNH1dLDI0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGxvZ2luU2lnbnVwU3dpdGNoID0gZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIGhhbmRsZXIoZXZ0KSB7XG4gICAgaWYgKHRoaXMuYmVpbmdBbmltYXRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmJlaW5nQW5pbWF0ZWQgPSB0cnVlO1xuXG4gICAgY29uc3Qgb2xkSEl0ZW0gPSB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtO1xuICAgIGNvbnN0IG9sZENJdGVtID0gdGhpcy5hY3RpdmUuY29udGVudEl0ZW07XG4gICAgY29uc3QgbmV3SEl0ZW0gPSBldnQudGFyZ2V0LmNsb3Nlc3QoJy50YWJzLWhlYWRlci1pdGVtJyk7XG4gICAgY29uc3Qgb3JkZXIgPSBuZXdISXRlbS5kYXRhc2V0Lm9yZGVyO1xuICAgIGNvbnN0IG5ld0NJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW29yZGVyLTFdO1xuXG4gICAgb2xkSEl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnbG9naW5TaWdudXAtSEktYWN0aXZlJyk7XG4gICAgbmV3SEl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtSEktYWN0aXZlJyk7XG5cbiAgICBvbGRDSXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1DSS1hY3RpdmUnKTtcbiAgICBvbGRDSXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1oaWRpbmcnKTtcbiAgICBuZXdDSXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1DSS1oaWRkZW4nKTtcbiAgICBuZXdDSXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1hY3RpdmF0aW5nJyk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIG9sZENJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnVwLUNJLWhpZGluZycpO1xuICAgICAgb2xkQ0l0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktaGlkZGVuJyk7XG5cbiAgICAgIG5ld0NJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnVwLUNJLWFjdGl2YXRpbmcnKTtcbiAgICAgIG5ld0NJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJLWFjdGl2ZScpO1xuXG4gICAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtID0gbmV3SEl0ZW07XG4gICAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbSA9IG5ld0NJdGVtO1xuXG4gICAgICB0aGlzLmJlaW5nQW5pbWF0ZWQgPSBmYWxzZTtcbiAgICB9LCA1MDApO1xuICB9XG5cbiAgZnVuY3Rpb24gZ290b1RhYih0YWIpIHtcbiAgICBjb25zdCBuZXdIZWFkZXJJdGVtID0gdGhpcy5oZWFkZXIuaXRlbXNbdGFiXTtcbiAgICBjb25zdCBuZXdDb250ZW50SXRlbSA9IHRoaXMuY29udGVudC5pdGVtc1t0YWJdO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1ISS1hY3RpdmUnKTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251LUNJLWFjdGl2ZScpO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJLWhpZGRlbicpO1xuXG4gICAgbmV3SGVhZGVySXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1ISS1hY3RpdmUnKTtcbiAgICBuZXdDb250ZW50SXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1DSS1oaWRkZW4nKTtcbiAgICBuZXdDb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1hY3RpdmUnKTtcblxuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0gPSBuZXdIZWFkZXJJdGVtO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtID0gbmV3Q29udGVudEl0ZW07XG4gIH1cblxuICBmdW5jdGlvbiBpbml0aWFsaXplKHRhYikge1xuICAgIHRoaXMuaGVhZGVyLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtaGVhZGVyJyk7XG4gICAgdGhpcy5jb250ZW50LmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtY29udGVudCcpO1xuICAgIHRoaXMuaGVhZGVyLml0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUhJJykpO1xuICAgIHRoaXMuY29udGVudC5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSScpKTtcblxuICAgIGNvbnN0IGFjdGl2ZUhlYWRlckl0ZW0gPSB0aGlzLmhlYWRlci5pdGVtc1t0YWJdO1xuICAgIGNvbnN0IGFjdGl2ZUNvbnRlbnRJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW3RhYl07XG4gICAgY29uc3Qgbm9uQWN0aXZlQ29udGVudEl0ZW1zID0gdGhpcy5jb250ZW50Lml0ZW1zLmZpbHRlcihpdGVtID0+IGl0ZW0gIT09IGFjdGl2ZUNvbnRlbnRJdGVtKTtcblxuICAgIGFjdGl2ZUhlYWRlckl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtSEktYWN0aXZlJyk7XG4gICAgYWN0aXZlQ29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktYWN0aXZlJyk7XG5cbiAgICBub25BY3RpdmVDb250ZW50SXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktaGlkZGVuJykpO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IGFjdGl2ZUhlYWRlckl0ZW07XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSBhY3RpdmVDb250ZW50SXRlbTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlcixcbiAgICBnb3RvVGFiLFxuICAgIGluaXRpYWxpemVcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbG9naW5TaWdudXBTd2l0Y2g7XG59LHt9XSwyNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBIZWFkZXJJdGVtID0gcmVxdWlyZSgnLi9IZWFkZXJJdGVtJyk7XG5jb25zdCBhbmltcyA9IHJlcXVpcmUoJy4vYW5pbWF0aW9ucycpO1xuXG5jb25zdCBUYWJzID0gZnVuY3Rpb24ob3B0cykge1xuICBjb25zdCBoZWFkZXJJdGVtcyA9XG4gICAgb3B0cy5oZWFkZXIuaXRlbXMubWFwKGl0ZW0gPT4gbmV3IEhlYWRlckl0ZW0oaXRlbSkuZWxlbWVudCkgfHwgW107XG4gIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBoZWFkZXIuY2xhc3NOYW1lID0gJ3RhYnMtaGVhZGVyICcgKyBvcHRzLmhlYWRlci5jbGFzc05hbWU7XG4gIGhlYWRlckl0ZW1zLmZvckVhY2goaXRlbSA9PiBoZWFkZXIuYXBwZW5kQ2hpbGQoaXRlbSkpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaGVhZGVySXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBoZWFkZXJJdGVtc1tpXS5kYXRhc2V0Lm9yZGVyID0gaSsxO1xuICB9XG5cbiAgY29uc3QgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBjb250ZW50LmNsYXNzTmFtZSA9ICd0YWJzLWNvbnRlbnQgJyArIChvcHRzLmNvbnRlbnQuY2xhc3NOYW1lIHx8ICcnKTtcbiAgY29uc3QgY29udGVudEl0ZW1zID0gb3B0cy5jb250ZW50Lml0ZW1zIHx8IFtdO1xuICBjb250ZW50SXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ3RhYnMtY29udGVudC1pdGVtJyk7XG4gICAgY29udGVudC5hcHBlbmRDaGlsZChpdGVtKTtcbiAgfSk7XG5cbiAgY29uc3QgYWN0aXZlID0ge1xuICAgIGhlYWRlckl0ZW06IG51bGwsXG4gICAgY29udGVudEl0ZW06IG51bGxcbiAgfTtcblxuICBjb25zdCBhbmltID0gYW5pbXNbb3B0cy5hbmltYXRpb24ubmFtZV0gP1xuICAgIG5ldyBhbmltc1tvcHRzLmFuaW1hdGlvbi5uYW1lXSA6XG4gICAgbmV3IGFuaW1zWydkZWZhdWx0QW5pbSddO1xuXG4gIGNvbnN0IHRhYnMgPSB7XG4gICAgaGVhZGVyOiB7XG4gICAgICBlbGVtZW50OiBoZWFkZXIsXG4gICAgICBpdGVtczogaGVhZGVySXRlbXNcbiAgICB9LFxuICAgIGNvbnRlbnQ6IHtcbiAgICAgIGVsZW1lbnQ6IGNvbnRlbnQsXG4gICAgICBpdGVtczogY29udGVudEl0ZW1zXG4gICAgfSxcbiAgICBhY3RpdmU6IGFjdGl2ZSxcbiAgICBnb3RvVGFiOiBhbmltLmdvdG9UYWIsXG4gICAgaW1pdGF0ZUNsaWNrT25UYWI6IGZ1bmN0aW9uKHRhYikge1xuICAgICAgdGhpcy5oZWFkZXIuaXRlbXNbdGFiXS5jbGljaygpO1xuICAgIH1cbiAgfTtcbiAgICBcbiAgaGVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBjb25zdCBsaW5rID0gZXZ0LnRhcmdldDtcbiAgICBjb25zdCByZXN1bHQgPSBoZWFkZXJJdGVtcy5maW5kKGl0ZW0gPT4gaXRlbSA9PT0gbGluay5jbG9zZXN0KCcudGFicy1oZWFkZXItaXRlbScpKTtcblxuICAgIGlmICghcmVzdWx0IHx8IHJlc3VsdCA9PT0gdGFicy5hY3RpdmUuaGVhZGVySXRlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGFuaW0uaGFuZGxlci5jYWxsKHRhYnMsIGV2dCk7XG4gICAgfVxuICB9KTtcblxuICBhbmltLmluaXRpYWxpemUuY2FsbCh0YWJzLCBvcHRzLmFuaW1hdGlvbi5pbml0aWFsaXplciAtIDEgfHwgMCwgb3B0cy5hbmltYXRpb24ucGFyYW1zKTtcblxuICByZXR1cm4gdGFicztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGFicztcbn0se1wiLi9IZWFkZXJJdGVtXCI6MjAsXCIuL2FuaW1hdGlvbnNcIjoyM31dLDI2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCA9IGZ1bmN0aW9uKGh0bWwpIHtcbiAgY29uc3QgdGVtcFBhcmVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB0ZW1wUGFyZW50LmlubmVySFRNTCA9IGh0bWw7XG4gIHJldHVybiB0ZW1wUGFyZW50LmZpcnN0RWxlbWVudENoaWxkO1xufTtcblxuZnVuY3Rpb24gU2luZ2xldG9uKGZuKSB7XG4gIGZ1bmN0aW9uIENsYXNzKCkge1xuICAgIGlmIChDbGFzcy5pbnN0YW5jZSkge1xuICAgICAgcmV0dXJuIENsYXNzLmluc3RhbmNlO1xuICAgIH1cblxuICAgIHJldHVybiBDbGFzcy5pbnN0YW5jZSA9IGZuKCk7XG4gIH1cblxuICBDbGFzcy5nZXRJbnN0YW5jZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBDbGFzcy5pbnN0YW5jZSB8fCBuZXcgQ2xhc3MoKTtcbiAgfTtcblxuICBDbGFzcy5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgQ2xhc3MuaW5zdGFuY2UgPSBudWxsO1xuICB9O1xuXG4gIHJldHVybiBDbGFzcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCxcbiAgU2luZ2xldG9uXG59O1xufSx7fV19LHt9LFsxXSk7XG4iXSwiZmlsZSI6InNvdXJjZS5qcyJ9
