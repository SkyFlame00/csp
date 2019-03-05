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
},{"csp-app/components/dashboard":2,"csp-app/components/main":4,"csp-app/components/main/rootComponent":5,"csp-app/components/start":10,"csp-app/components/test":14,"csp-app/libs/http":19,"csp-app/libs/router":21}],2:[function(require,module,exports){
const http = require('csp-app/libs/http');
const template = require('./tpl');
const {createElementFromHTML} = require('csp-app/libs/utilities');

const Dashboard = function() {
  return http.get('/users/getUserData')
    .then((res) => {
      const id = res.data.user.id;
      const element = createElementFromHTML(template({ id: id }));

      return {
        element: element
      };
    });
};

module.exports = Dashboard;
},{"./tpl":3,"csp-app/libs/http":19,"csp-app/libs/utilities":28}],3:[function(require,module,exports){
module.exports = data => /*html*/`
  <div class="cmp_dashboard">
    <h1>Dashboard Component</h1>
    <p>Your user id is ${data.id}</p>
  </div>
`;
},{}],4:[function(require,module,exports){
const MainController = {
  root: null,
  path: [],
  renderChain: function(components) {
    return components.reduce((accumulator, component) => {
      // accumulator.render(component.element);
      // return component;

      // accumulator = accumulator instanceof Promise ?
      //   accumulator : 
      //   Promise.resolve(accumulator);
      
      // component = component instanceof Promise ?
      //   component :
      //   Promise.resolve(component);
      
      console.log(component)

      return Promise.all([accumulator, component])
        .then(components => {
          const accumulator = components[0];
          const component = components[1];

          console.log(components)
          accumulator.render(component.element);

          return component;
        });
    }, this.root);
  },
  initialize: function(rootInstance) {
    this.root = rootInstance;
    document.body.innerHTML = '';
    document.body.appendChild(rootInstance.reference);
  },
  render: function(components) {
    return this.renderChain(components);
  }
};

module.exports = MainController;
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{"csp-app/libs/forms":17,"csp-app/libs/forms/validators":18}],7:[function(require,module,exports){
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
},{"csp-app/libs/forms":17,"csp-app/libs/forms/validators":18,"csp-app/libs/http":19}],8:[function(require,module,exports){
const Form = require('csp-app/libs/forms');
const {minLength, maxLength, startsWithNumber} = require('csp-app/libs/forms/validators');
const http = require('csp-app/libs/http');
const MainController = require('csp-app/components/main');
const Dashboard = require('csp-app/components/dashboard');

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
    handler: function(values) {
      const {username, password} = values;
      const data = {
        username: username,
        password: password
      };

      http.post('auth/login', data)
        .then(res => {
          if (!res.success)
            throw new Error(res.error.message);

          window.localStorage.setItem('auth_token', res.data.token);
          MainController.render([new Dashboard()]);
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  },
  controls: [
    username,
    password
  ]
});

module.exports = loginForm;
},{"csp-app/components/dashboard":2,"csp-app/components/main":4,"csp-app/libs/forms":17,"csp-app/libs/forms/validators":18,"csp-app/libs/http":19}],9:[function(require,module,exports){
const loginForm = require('./LoginForm');
const clientForm = require('./ClientForm');
const execForm = require('./ExecForm');

module.exports = {
  loginForm,
  clientForm,
  execForm
};
},{"./ClientForm":6,"./ExecForm":7,"./LoginForm":8}],10:[function(require,module,exports){
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
},{"./start.tpl":11,"./tabs":12,"csp-app/libs/utilities":28}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
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
},{"../forms/LoginForm":8,"./signupTabs":13,"csp-app/libs/misc/button-effects/radialGradientOnHover":20,"csp-app/libs/tabs":27,"csp-app/libs/utilities":28}],13:[function(require,module,exports){
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
},{"../forms":9,"csp-app/libs/misc/button-effects/radialGradientOnHover":20,"csp-app/libs/tabs":27,"csp-app/libs/utilities":28}],14:[function(require,module,exports){
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
  ].forEach(item => wrapper.appendChild(item));
  
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
},{"./FormControl":16}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
const Form = require('./Form');

module.exports = Form;
},{"./Form":15}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
function configure(options) {
  let location = options.location;
  location = location[location.length-1] === '/' ?
    location :
    location + '/';
  
  this.location = location;
}

function getCorrectUrl(url) {
  url = url[0] === '/' ?
    url.slice(1) :
    url;

  return url;
}

function setAuthorizationHeader(xhr) {
  const token = window.localStorage.getItem('auth_token');

  if (token) {
    xhr.setRequestHeader('authorization', `Bearer ${token}`);
  }
}

function get(url, options) {
  return this.makeRequest('GET', url, null, options);
}

function post(url, body, options) {
  return this.makeRequest('POST', url, body, options);
}

function makeRequest(method, url, body, options) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    url = this.getCorrectUrl(url);

    xhr.open(method, this.location + url);

    if (method == 'POST') {
      xhr.setRequestHeader(
        'Content-Type',
        (options && options.contentType) || this.contentTypes.json
      );
    }

    this.setAuthorizationHeader(xhr);

    xhr.addEventListener('load', () => {
      const isJson = xhr.getResponseHeader('Content-Type').match(this.contentTypes.json);
      const response = isJson ?
        JSON.parse(xhr.responseText) :
        xhr.responseText;

      resolve(response);
    });

    xhr.addEventListener('error', function() {
      reject('Network error occured');
    });

    if (method == 'GET') {
      xhr.send();
      return;
    }

    if (method == 'POST') {
      xhr.send(JSON.stringify(body));
      return;
    }
  });
}

module.exports = {
  location: null,
  getCorrectUrl: getCorrectUrl,
  configure: configure,
  setAuthorizationHeader: setAuthorizationHeader,
  contentTypes: {
    json: 'application/json'
  },
  makeRequest: makeRequest,
  get: get,
  post: post
};
},{}],20:[function(require,module,exports){
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
},{"csp-app/libs/utilities":28}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){
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
},{}],23:[function(require,module,exports){
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
},{}],24:[function(require,module,exports){
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
},{}],25:[function(require,module,exports){
const defaultAnim = require('./default');
const loginSignupSwitch = require('./loginSignupSwitch');
const tabsFlowAnimation = require('./flow');

module.exports = {
  defaultAnim,
  loginSignupSwitch,
  tabsFlowAnimation
};
},{"./default":23,"./flow":24,"./loginSignupSwitch":26}],26:[function(require,module,exports){
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
},{}],27:[function(require,module,exports){
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
},{"./HeaderItem":22,"./animations":25}],28:[function(require,module,exports){
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzb3VyY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBSb290ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL21haW4vcm9vdENvbXBvbmVudCcpO1xuY29uc3QgRGFzaGJvYXJkID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL2Rhc2hib2FyZCcpO1xuY29uc3QgTWFpbkNvbnRyb2xsZXIgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvbWFpbicpO1xuXG5jb25zdCBSb3V0ZXIgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvcm91dGVyJylcbmNvbnN0IFN0YXJ0ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3N0YXJ0Jyk7XG5jb25zdCBUZXN0ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Rlc3QnKVxuXG5jb25zdCByb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcblxuaHR0cC5jb25maWd1cmUoeyBsb2NhdGlvbjogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcgfSk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBjb25zdCBsaW5rID0gZXZ0LnRhcmdldC5jbG9zZXN0KCdhJyk7XG5cbiAgICBpZiAobGluayAmJiBsaW5rLmRhdGFzZXQucm91dGUpIHtcbiAgICAgICAgcm91dGVyLm5hdmlnYXRlKGxpbmsuZGF0YXNldC5yb3V0ZSk7XG4gICAgfVxufSk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIGV2dCA9PiB7XG4gICAgY29uc29sZS5sb2coJ3BhZ2UgY2hhbmdlZDogJywgZG9jdW1lbnQubG9jYXRpb24pO1xuICAgIGNvbnNvbGUubG9nKGV2dCk7XG4gICAgcm91dGVyLm5hdmlnYXRlKGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lKTtcbn0pO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oZXZ0KSB7XG4gICAgbGV0IHBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgY29uc3Qgcm9vdEluc3RhbmNlID0gUm9vdC5jcmVhdGUoKTtcbiAgICBNYWluQ29udHJvbGxlci5pbml0aWFsaXplKHJvb3RJbnN0YW5jZSk7XG5cbiAgICByb3V0ZXJcbiAgICAgICAgLmFkZFJvdXRlKCcvJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBNYWluQ29udHJvbGxlci5yZW5kZXJDaGFpbihbbmV3IFN0YXJ0KCldKVxuICAgICAgICB9KVxuICAgICAgICAuYWRkUm91dGUoJ2Rhc2hib2FyZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgTWFpbkNvbnRyb2xsZXIucmVuZGVyQ2hhaW4oW1Rlc3RdKVxuICAgICAgICB9KVxuICAgICAgICAuYWRkUm91dGUoJ2xvZ2luJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgfSlcbiAgICBcbiAgICByb3V0ZXIubmF2aWdhdGUocGF0aClcbn0pO1xufSx7XCJjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkXCI6MixcImNzcC1hcHAvY29tcG9uZW50cy9tYWluXCI6NCxcImNzcC1hcHAvY29tcG9uZW50cy9tYWluL3Jvb3RDb21wb25lbnRcIjo1LFwiY3NwLWFwcC9jb21wb25lbnRzL3N0YXJ0XCI6MTAsXCJjc3AtYXBwL2NvbXBvbmVudHMvdGVzdFwiOjE0LFwiY3NwLWFwcC9saWJzL2h0dHBcIjoxOSxcImNzcC1hcHAvbGlicy9yb3V0ZXJcIjoyMX1dLDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9odHRwJyk7XG5jb25zdCB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdHBsJyk7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuY29uc3QgRGFzaGJvYXJkID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBodHRwLmdldCgnL3VzZXJzL2dldFVzZXJEYXRhJylcbiAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICBjb25zdCBpZCA9IHJlcy5kYXRhLnVzZXIuaWQ7XG4gICAgICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKHRlbXBsYXRlKHsgaWQ6IGlkIH0pKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZWxlbWVudDogZWxlbWVudFxuICAgICAgfTtcbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRGFzaGJvYXJkO1xufSx7XCIuL3RwbFwiOjMsXCJjc3AtYXBwL2xpYnMvaHR0cFwiOjE5LFwiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjI4fV0sMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5tb2R1bGUuZXhwb3J0cyA9IGRhdGEgPT4gLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJjbXBfZGFzaGJvYXJkXCI+XG4gICAgPGgxPkRhc2hib2FyZCBDb21wb25lbnQ8L2gxPlxuICAgIDxwPllvdXIgdXNlciBpZCBpcyAke2RhdGEuaWR9PC9wPlxuICA8L2Rpdj5cbmA7XG59LHt9XSw0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IE1haW5Db250cm9sbGVyID0ge1xuICByb290OiBudWxsLFxuICBwYXRoOiBbXSxcbiAgcmVuZGVyQ2hhaW46IGZ1bmN0aW9uKGNvbXBvbmVudHMpIHtcbiAgICByZXR1cm4gY29tcG9uZW50cy5yZWR1Y2UoKGFjY3VtdWxhdG9yLCBjb21wb25lbnQpID0+IHtcbiAgICAgIC8vIGFjY3VtdWxhdG9yLnJlbmRlcihjb21wb25lbnQuZWxlbWVudCk7XG4gICAgICAvLyByZXR1cm4gY29tcG9uZW50O1xuXG4gICAgICAvLyBhY2N1bXVsYXRvciA9IGFjY3VtdWxhdG9yIGluc3RhbmNlb2YgUHJvbWlzZSA/XG4gICAgICAvLyAgIGFjY3VtdWxhdG9yIDogXG4gICAgICAvLyAgIFByb21pc2UucmVzb2x2ZShhY2N1bXVsYXRvcik7XG4gICAgICBcbiAgICAgIC8vIGNvbXBvbmVudCA9IGNvbXBvbmVudCBpbnN0YW5jZW9mIFByb21pc2UgP1xuICAgICAgLy8gICBjb21wb25lbnQgOlxuICAgICAgLy8gICBQcm9taXNlLnJlc29sdmUoY29tcG9uZW50KTtcbiAgICAgIFxuICAgICAgY29uc29sZS5sb2coY29tcG9uZW50KVxuXG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW2FjY3VtdWxhdG9yLCBjb21wb25lbnRdKVxuICAgICAgICAudGhlbihjb21wb25lbnRzID0+IHtcbiAgICAgICAgICBjb25zdCBhY2N1bXVsYXRvciA9IGNvbXBvbmVudHNbMF07XG4gICAgICAgICAgY29uc3QgY29tcG9uZW50ID0gY29tcG9uZW50c1sxXTtcblxuICAgICAgICAgIGNvbnNvbGUubG9nKGNvbXBvbmVudHMpXG4gICAgICAgICAgYWNjdW11bGF0b3IucmVuZGVyKGNvbXBvbmVudC5lbGVtZW50KTtcblxuICAgICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgICAgIH0pO1xuICAgIH0sIHRoaXMucm9vdCk7XG4gIH0sXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKHJvb3RJbnN0YW5jZSkge1xuICAgIHRoaXMucm9vdCA9IHJvb3RJbnN0YW5jZTtcbiAgICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9ICcnO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocm9vdEluc3RhbmNlLnJlZmVyZW5jZSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oY29tcG9uZW50cykge1xuICAgIHJldHVybiB0aGlzLnJlbmRlckNoYWluKGNvbXBvbmVudHMpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1haW5Db250cm9sbGVyO1xufSx7fV0sNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBSb290ID0ge1xuICAgIGNvbXBvbmVudE5hbWU6ICdhcHAnLFxuICAgIGh0bWw6IGA8ZGl2IGlkPVwiYXBwXCI+PC9kaXY+YCxcbiAgICBpZGVudGlmaWVyOiAnI2FwcCcsXG4gICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gQ29uc2lkZXIgcmVpbXBsZW1lbnRpbmcgd2l0aCBIVE1MNSB0ZW1wbGF0ZSBmZWF0dXJlIGluc3RlYWQganVzdCB1dGlsaXppbmcgZGl2XG4gICAgICAgIGNvbnN0IHRtcEVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdG1wRWxlbS5pbm5lckhUTUwgPSB0aGlzLmh0bWw7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0bXBFbGVtLmZpcnN0Q2hpbGQ7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlZmVyZW5jZTogZWxlbWVudCxcbiAgICAgICAgICAgIHJvdXRlck91dGxldDogZWxlbWVudCxcbiAgICAgICAgICAgIGNvbXBvbmVudE5hbWU6IHRoaXMuY29tcG9uZW50TmFtZSxcbiAgICAgICAgICAgIHN0YXRlOiB7fSxcbiAgICAgICAgICAgIGFjdGlvbnM6IChmdW5jdGlvbihyb3V0ZXJPdXRsZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBsb2FkOiBmdW5jdGlvbihmcmFnbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVyT3V0bGV0LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVyT3V0bGV0LmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KShlbGVtZW50KSxcbiAgICAgICAgICAgIHJlbmRlcjogKGZ1bmN0aW9uKHJvdXRlck91dGxldCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihET01UcmVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJvdXRlck91dGxldC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgcm91dGVyT3V0bGV0LmFwcGVuZENoaWxkKERPTVRyZWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKGVsZW1lbnQpXG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJvb3Q7XG59LHt9XSw2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMnKTtcbmNvbnN0IHttaW5MZW5ndGgsIG1heExlbmd0aCwgc3RhcnRzV2l0aE51bWJlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMvdmFsaWRhdG9ycycpO1xuXG5jb25zdCB1c2VybmFtZSA9IHtcbiAga2V5TmFtZTogJ3VzZXJuYW1lJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS11c2VybmFtZScsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAndGV4dCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1VzZXJuYW1lJ31cbiAgXSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnbWF4TGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1heExlbmd0aFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3N0YXJ0c1dpdGhOdW1iZXInLFxuICAgICAgaGFuZGxlcjogc3RhcnRzV2l0aE51bWJlclxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgcGFzc3dvcmQgPSB7XG4gIGtleU5hbWU6ICdwYXNzd29yZCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tcGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3Bhc3N3b3JkJ30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnUGFzc3dvcmQnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBjb25maXJtUGFzc3dvcmQgPSB7XG4gIGtleU5hbWU6ICdjb25maXJtUGFzc3dvcmQnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLWNvbmZpcm1QYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAncGFzc3dvcmQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdDb25maXJtIHBhc3N3b3JkJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgZW1haWwgPSB7XG4gIGtleU5hbWU6ICdlbWFpbCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tcGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3RleHQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdFLW1haWwnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBjbGllbnRGb3JtID0gbmV3IEZvcm0oe1xuICB2YWxpZGF0b3JzOiBbXSxcbiAgc3VibWl0OiB7XG4gICAgaGFuZGxlcjogZnVuY3Rpb24odmFsdWVzLCBldnQpIHtcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY29uc29sZS5sb2coJ0Zvcm0gaXMgY2xlYW4nKTtcbiAgICB9XG4gIH0sXG4gIGNvbnRyb2xzOiBbXG4gICAgdXNlcm5hbWUsXG4gICAgcGFzc3dvcmQsXG4gICAgY29uZmlybVBhc3N3b3JkLFxuICAgIGVtYWlsXG4gIF1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsaWVudEZvcm07XG59LHtcImNzcC1hcHAvbGlicy9mb3Jtc1wiOjE3LFwiY3NwLWFwcC9saWJzL2Zvcm1zL3ZhbGlkYXRvcnNcIjoxOH1dLDc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgRm9ybSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3JtcycpO1xuY29uc3Qge21pbkxlbmd0aCwgbWF4TGVuZ3RoLCBzdGFydHNXaXRoTnVtYmVyfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3Jtcy92YWxpZGF0b3JzJyk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKVxuXG5jb25zdCB1c2VybmFtZSA9IHtcbiAga2V5TmFtZTogJ3VzZXJuYW1lJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS11c2VybmFtZScsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAndGV4dCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1VzZXJuYW1lJ31cbiAgXSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnbWF4TGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1heExlbmd0aFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3N0YXJ0c1dpdGhOdW1iZXInLFxuICAgICAgaGFuZGxlcjogc3RhcnRzV2l0aE51bWJlclxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgcGFzc3dvcmQgPSB7XG4gIGtleU5hbWU6ICdwYXNzd29yZCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tcGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3Bhc3N3b3JkJ30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnUGFzc3dvcmQnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBjb25maXJtUGFzc3dvcmQgPSB7XG4gIGtleU5hbWU6ICdjb25maXJtUGFzc3dvcmQnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLWNvbmZpcm1QYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAncGFzc3dvcmQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdDb25maXJtIHBhc3N3b3JkJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgZW1haWwgPSB7XG4gIGtleU5hbWU6ICdlbWFpbCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tcGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3RleHQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdFLW1haWwnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBvcmcgPSB7XG4gIGtleU5hbWU6ICdvcmcnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICd0ZXh0J30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnWW91ciBvcmdhbml6YXRpb24nfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBleGVjRm9ybSA9IG5ldyBGb3JtKHtcbiAgdmFsaWRhdG9yczogW10sXG4gIHN1Ym1pdDoge1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uKHZhbHVlcywgZXZ0KSB7XG4gICAgICBjb25zdCBib2R5ID0ge1xuICAgICAgICB1c2VybmFtZTogdmFsdWVzLnVzZXJuYW1lLFxuICAgICAgICBlbWFpbDogdmFsdWVzLmVtYWlsLFxuICAgICAgICBwYXNzd29yZDogdmFsdWVzLnBhc3N3b3JkXG4gICAgICB9O1xuXG4gICAgICBodHRwLnBvc3QoJ2F1dGgvc2lnbnVwL2V4ZWMnLCBib2R5KVxuICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coSlNPTi5wYXJzZShyZXNwb25zZSkpXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpXG4gICAgICAgIH0pXG4gICAgICA7XG4gICAgfVxuICB9LFxuICBjb250cm9sczogW1xuICAgIHVzZXJuYW1lLFxuICAgIHBhc3N3b3JkLFxuICAgIGNvbmZpcm1QYXNzd29yZCxcbiAgICBlbWFpbCxcbiAgICBvcmdcbiAgXVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhlY0Zvcm07XG59LHtcImNzcC1hcHAvbGlicy9mb3Jtc1wiOjE3LFwiY3NwLWFwcC9saWJzL2Zvcm1zL3ZhbGlkYXRvcnNcIjoxOCxcImNzcC1hcHAvbGlicy9odHRwXCI6MTl9XSw4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMnKTtcbmNvbnN0IHttaW5MZW5ndGgsIG1heExlbmd0aCwgc3RhcnRzV2l0aE51bWJlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMvdmFsaWRhdG9ycycpO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9odHRwJyk7XG5jb25zdCBNYWluQ29udHJvbGxlciA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9tYWluJyk7XG5jb25zdCBEYXNoYm9hcmQgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkJyk7XG5cbmNvbnN0IHVzZXJuYW1lID0ge1xuICBrZXlOYW1lOiAndXNlcm5hbWUnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXVzZXJuYW1lJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICd0ZXh0J30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnVXNlcm5hbWUnfVxuICBdLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdtYXhMZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWF4TGVuZ3RoXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnc3RhcnRzV2l0aE51bWJlcicsXG4gICAgICBoYW5kbGVyOiBzdGFydHNXaXRoTnVtYmVyXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBwYXNzd29yZCA9IHtcbiAga2V5TmFtZTogJ3Bhc3N3b3JkJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1wYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAncGFzc3dvcmQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdQYXNzd29yZCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGxvZ2luRm9ybSA9IG5ldyBGb3JtKHtcbiAgdmFsaWRhdG9yczogW10sXG4gIHN1Ym1pdDoge1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgY29uc3Qge3VzZXJuYW1lLCBwYXNzd29yZH0gPSB2YWx1ZXM7XG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgfTtcblxuICAgICAgaHR0cC5wb3N0KCdhdXRoL2xvZ2luJywgZGF0YSlcbiAgICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgICBpZiAoIXJlcy5zdWNjZXNzKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlcy5lcnJvci5tZXNzYWdlKTtcblxuICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYXV0aF90b2tlbicsIHJlcy5kYXRhLnRva2VuKTtcbiAgICAgICAgICBNYWluQ29udHJvbGxlci5yZW5kZXIoW25ldyBEYXNoYm9hcmQoKV0pO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVyci5tZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBjb250cm9sczogW1xuICAgIHVzZXJuYW1lLFxuICAgIHBhc3N3b3JkXG4gIF1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvZ2luRm9ybTtcbn0se1wiY3NwLWFwcC9jb21wb25lbnRzL2Rhc2hib2FyZFwiOjIsXCJjc3AtYXBwL2NvbXBvbmVudHMvbWFpblwiOjQsXCJjc3AtYXBwL2xpYnMvZm9ybXNcIjoxNyxcImNzcC1hcHAvbGlicy9mb3Jtcy92YWxpZGF0b3JzXCI6MTgsXCJjc3AtYXBwL2xpYnMvaHR0cFwiOjE5fV0sOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBsb2dpbkZvcm0gPSByZXF1aXJlKCcuL0xvZ2luRm9ybScpO1xuY29uc3QgY2xpZW50Rm9ybSA9IHJlcXVpcmUoJy4vQ2xpZW50Rm9ybScpO1xuY29uc3QgZXhlY0Zvcm0gPSByZXF1aXJlKCcuL0V4ZWNGb3JtJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBsb2dpbkZvcm0sXG4gIGNsaWVudEZvcm0sXG4gIGV4ZWNGb3JtXG59O1xufSx7XCIuL0NsaWVudEZvcm1cIjo2LFwiLi9FeGVjRm9ybVwiOjcsXCIuL0xvZ2luRm9ybVwiOjh9XSwxMDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vc3RhcnQudHBsJyk7XG5jb25zdCB0YWJzID0gcmVxdWlyZSgnLi90YWJzJyk7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MLCBTaW5nbGV0b259ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5jb25zdCBTdGFydCA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKHRlbXBsYXRlKCkpO1xuICBjb25zdCB0YWJzV3JhcHBlciA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnN0YXJ0LXRhYnMnKTtcbiAgdGFic1dyYXBwZXIuYXBwZW5kQ2hpbGQodGFicy5oZWFkZXIuZWxlbWVudCk7XG4gIHRhYnNXcmFwcGVyLmFwcGVuZENoaWxkKHRhYnMuY29udGVudC5lbGVtZW50KTtcblxuICByZXR1cm4ge1xuICAgIGVsZW1lbnQ6IGVsZW1lbnRcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2luZ2xldG9uKFN0YXJ0KTtcbn0se1wiLi9zdGFydC50cGxcIjoxMSxcIi4vdGFic1wiOjEyLFwiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjI4fV0sMTE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuZnVuY3Rpb24gdGVtcGxhdGUoZGF0YSkge1xuICByZXR1cm4gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cImNtcF9zdGFydFwiPlxuICAgICAgPGRpdiBjbGFzcz1cIndyYXBwZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsb2dvLWJsb2NrXCI+XG4gICAgICAgICAgICA8aDE+V2VsY29tZSB0byBDb25zdWx0aW5nIFNlcnZpY2VzIFBsYXRmb3JtPC9oMT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBcbiAgICAgICAgICA8YSBkYXRhLXJvdXRlPVwiL1wiPkhvbWU8L2E+XG4gICAgICAgICAgPGEgZGF0YS1yb3V0ZT1cIi9kYXNoYm9hcmRcIj5EYXNoYm9hcmQ8L2E+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhcnQtdGFic1wiPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xufSx7fV0sMTI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgVGFicyA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy90YWJzJyk7XG5jb25zdCBjcmVhdGVFbGVtZW50RnJvbUhUTUwgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJykuY3JlYXRlRWxlbWVudEZyb21IVE1MO1xuY29uc3Qgc2lnbnVwVGFicyA9IHJlcXVpcmUoJy4vc2lnbnVwVGFicycpO1xuY29uc3QgbG9naW5Gb3JtID0gcmVxdWlyZSgnLi4vZm9ybXMvTG9naW5Gb3JtJyk7XG5jb25zdCByYWRpYWxHcmFkaWVudE9uSG92ZXIgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvbWlzYy9idXR0b24tZWZmZWN0cy9yYWRpYWxHcmFkaWVudE9uSG92ZXInKTtcblxuY29uc3QgbG9naW5CbG9jayA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCgvKmh0bWwqL2BcbiAgPGRpdiBjbGFzcz1cImxvZ2luLWJsb2NrXCI+XG4gICAgPGRpdiBjbGFzcz1cImhlYWRlclwiPjxoMj5Mb2cgaW48L2gyPjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJmb3JtXCI+PC9kaXY+XG4gIDwvZGl2PlxuYCk7XG5cbmNvbnN0IHNpZ251cEJsb2NrID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICA8ZGl2IGNsYXNzPVwic2lnbnVwLWJsb2NrXCI+PC9kaXY+XG5gKTtcblxuY29uc3Qgc3RhcnRUYWJzID0gbmV3IFRhYnMoe1xuICBoZWFkZXI6IHtcbiAgICBjbGFzc05hbWU6ICdtYWluLWFjdGlvbnMnLFxuICAgIGl0ZW1zOiBbXG4gICAgICB7dGl0bGU6ICdMb2cgaW4nLCB0YWc6ICdidXR0b24nfSxcbiAgICAgIHt0aXRsZTogJ1NpZ24gdXAnLCB0YWc6ICdidXR0b24nfVxuICAgIF1cbiAgfSxcbiAgY29udGVudDoge1xuICAgIGl0ZW1zOiBbXG4gICAgICBsb2dpbkJsb2NrLFxuICAgICAgc2lnbnVwQmxvY2tcbiAgICBdXG4gIH0sXG4gIGFuaW1hdGlvbjoge1xuICAgIG5hbWU6ICdsb2dpblNpZ251cFN3aXRjaCdcbiAgfVxufSk7XG5cbmNvbnN0IGNvbnRlbnRXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5jb250ZW50V3JhcHBlci5jbGFzc0xpc3QuYWRkKCdmb3JtcycpO1xuY29udGVudFdyYXBwZXIuYXBwZW5kQ2hpbGQoc2lnbnVwVGFicy5jb250ZW50LmVsZW1lbnQpO1xuXG5zdGFydFRhYnMuY29udGVudC5pdGVtc1swXS5xdWVyeVNlbGVjdG9yKCcubG9naW4tYmxvY2sgLmZvcm0nKS5hcHBlbmRDaGlsZChsb2dpbkZvcm0ucmVmKTtcbnN0YXJ0VGFicy5jb250ZW50Lml0ZW1zWzFdLmFwcGVuZENoaWxkKHNpZ251cFRhYnMuaGVhZGVyLmVsZW1lbnQpO1xuc3RhcnRUYWJzLmNvbnRlbnQuaXRlbXNbMV0uYXBwZW5kQ2hpbGQoY29udGVudFdyYXBwZXIpO1xuXG5zdGFydFRhYnMuaGVhZGVyLml0ZW1zLmZvckVhY2goaXRlbSA9PiByYWRpYWxHcmFkaWVudE9uSG92ZXIoaXRlbSwge3BhZGRpbmc6IFsxMCwgMTZdfSkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YXJ0VGFicztcbn0se1wiLi4vZm9ybXMvTG9naW5Gb3JtXCI6OCxcIi4vc2lnbnVwVGFic1wiOjEzLFwiY3NwLWFwcC9saWJzL21pc2MvYnV0dG9uLWVmZmVjdHMvcmFkaWFsR3JhZGllbnRPbkhvdmVyXCI6MjAsXCJjc3AtYXBwL2xpYnMvdGFic1wiOjI3LFwiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjI4fV0sMTM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgVGFicyA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy90YWJzJyk7XG5jb25zdCBjcmVhdGVFbGVtZW50RnJvbUhUTUwgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJykuY3JlYXRlRWxlbWVudEZyb21IVE1MO1xuY29uc3Qge2NsaWVudEZvcm0sIGV4ZWNGb3JtfSA9IHJlcXVpcmUoJy4uL2Zvcm1zJyk7XG5jb25zdCByYWRpYWxHcmFkaWVudE9uSG92ZXIgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvbWlzYy9idXR0b24tZWZmZWN0cy9yYWRpYWxHcmFkaWVudE9uSG92ZXInKTtcblxuY29uc3QgY2xpZW50Rm9ybUJsb2NrID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICA8ZGl2IGNsYXNzPVwiY2xpZW50LWZvcm0gZm9ybVwiPjwvZGl2PlxuYCk7XG5cbmNvbnN0IGV4ZWNGb3JtQmxvY2sgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJleGVjLWZvcm0gZm9ybVwiPjwvZGl2PlxuYCk7XG5cbmNvbnN0IHNpZ251cFRhYnMgPSBuZXcgVGFicyh7XG4gIGhlYWRlcjoge1xuICAgIGNsYXNzTmFtZTogJ2FjdGlvbnMgY2xlYXJmaXgnLFxuICAgIGl0ZW1zOiBbXG4gICAgICB7dGl0bGU6ICdTaWduIHVwIGFzIGNsaWVudCcsIHRhZzogJ2J1dHRvbid9LFxuICAgICAge3RpdGxlOiAnU2lnbiB1cCBhcyBleGVjdXRvcicsIHRhZzogJ2J1dHRvbid9XG4gICAgXVxuICB9LFxuICBjb250ZW50OiB7XG4gICAgaXRlbXM6IFtcbiAgICAgIGNsaWVudEZvcm1CbG9jayxcbiAgICAgIGV4ZWNGb3JtQmxvY2ssXG4gICAgXVxuICB9LFxuICBhbmltYXRpb246IHtcbiAgICBuYW1lOiAndGFic0Zsb3dBbmltYXRpb24nLFxuICAgIHBhcmFtczoge3BhZGRpbmc6IDE1LCBzcGVlZDogODUwfVxuICB9XG59KTtcblxuc2lnbnVwVGFicy5jb250ZW50Lml0ZW1zWzBdLmFwcGVuZENoaWxkKGNsaWVudEZvcm0ucmVmKTtcbnNpZ251cFRhYnMuY29udGVudC5pdGVtc1sxXS5hcHBlbmRDaGlsZChleGVjRm9ybS5yZWYpO1xuXG5zaWdudXBUYWJzLmhlYWRlci5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gcmFkaWFsR3JhZGllbnRPbkhvdmVyKGl0ZW0sIHtwYWRkaW5nOiAxNX0pKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzaWdudXBUYWJzO1xufSx7XCIuLi9mb3Jtc1wiOjksXCJjc3AtYXBwL2xpYnMvbWlzYy9idXR0b24tZWZmZWN0cy9yYWRpYWxHcmFkaWVudE9uSG92ZXJcIjoyMCxcImNzcC1hcHAvbGlicy90YWJzXCI6MjcsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6Mjh9XSwxNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBUZXN0ID0ge1xuICAgIGh0bWw6IGBcbiAgICAgICAgPGRpdiBpZD1cInRlc3RcIj5cbiAgICAgICAgICAgIDxoMT5UaGlzIGlzIFRlc3QgY29tcG9uZW50PC9oMT5cbiAgICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBpbnN0YW50aWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGVtcC5pbm5lckhUTUwgPSB0aGlzLmh0bWw7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0ZW1wLmZpcnN0RWxlbWVudENoaWxkXG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24oRE9NVHJlZSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChET01UcmVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGVzdC5pbnN0YW50aWF0ZSgpO1xufSx7fV0sMTU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgRm9ybUNvbnRyb2wgPSByZXF1aXJlKCcuL0Zvcm1Db250cm9sJyk7XG5cbmNvbnN0IHZhbGlkYXRlID0gZnVuY3Rpb24odmFsaWRhdG9yLCBmb3JtKSB7XG4gIGxldCBpdGVtcyA9IGZvcm0uZXJyb3JzLml0ZW1zO1xuICBsZXQgdmFsdWVzID0gdmFsaWRhdG9yLmNvbnRyb2xzLm1hcChjdHJsID0+IGN0cmwudmFsdWUpO1xuICBsZXQgcmVzdWx0ID0gdmFsaWRhdG9yLmhhbmRsZXIodmFsdWVzKTtcbiAgaWYgKCFyZXN1bHQudmFsaWQgJiYgIWl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IHJlc3VsdC5tZXNzYWdlO1xuICAgIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSA9IHtcbiAgICAgIHJlZjogZWxlbWVudFxuICAgIH07XG4gICAgZm9ybS5lcnJvcnMucmVmLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAocmVzdWx0LnZhbGlkICYmIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXS5yZWYucmVtb3ZlKCk7XG4gICAgaXRlbXNbdmFsaWRhdG9yLm5hbWVdID0gbnVsbDtcbiAgfVxufTtcblxuY29uc3QgRm9ybSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgY29uc3QgZm9ybUNvbnRyb2xzID0gb3B0aW9ucy5jb250cm9scy5tYXAoY3RybCA9PiBuZXcgRm9ybUNvbnRyb2woY3RybCkpO1xuICBsZXQgdmFsaWRhdG9ycyA9IG9wdGlvbnMudmFsaWRhdG9ycyB8fCBbXTtcbiAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb3JtJyk7XG4gIGxldCBlcnJvcnNXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGxldCBzdWJtaXRXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGxldCBmb3JtQ29udHJvbHNSZWZzID0gZm9ybUNvbnRyb2xzLm1hcChjdHJsID0+IGN0cmwucmVmKTtcbiAgZXJyb3JzV3JhcHBlci5jbGFzc05hbWUgPSAnZXJyb3JzJztcbiAgc3VibWl0V3JhcHBlci5jbGFzc05hbWUgPSAnYWN0aW9ucyc7XG4gIHN1Ym1pdFdyYXBwZXIuaW5uZXJIVE1MID0gJzxpbnB1dCB0eXBlPVwic3VibWl0XCIgdmFsdWU9XCJTdWJtaXRcIiAvPic7XG4gIHN1Ym1pdFJlZiA9IHN1Ym1pdFdyYXBwZXIucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInN1Ym1pdFwiXScpO1xuXG4gIFtcbiAgICBlcnJvcnNXcmFwcGVyLFxuICAgIC4uLmZvcm1Db250cm9sc1JlZnMsXG4gICAgc3VibWl0V3JhcHBlclxuICBdLmZvckVhY2goaXRlbSA9PiB3cmFwcGVyLmFwcGVuZENoaWxkKGl0ZW0pKTtcbiAgXG4gIGxldCBmb3JtID0ge1xuICAgIHJlZjogd3JhcHBlcixcbiAgICBlcnJvcnM6IHtcbiAgICAgIHJlZjogZXJyb3JzV3JhcHBlcixcbiAgICAgIGl0ZW1zOiB7fVxuICAgIH0sXG4gICAgY29udHJvbHM6IGZvcm1Db250cm9scyxcbiAgICBzdWJtaXQ6IHtcbiAgICAgIGhhbmRsZXI6IG9wdGlvbnMuc3VibWl0LmhhbmRsZXJcbiAgICB9XG4gIH07XG5cbiAgb3B0aW9ucy52YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHtcbiAgICB2YWxpZGF0b3IuY29udHJvbHMuZm9yRWFjaChjb250cm9sID0+IHtcbiAgICAgIGNvbnRyb2wuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICAgIHZhbGlkYXRlKHZhbGlkYXRvciwgZm9ybSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgc3VibWl0UmVmLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICBsZXQgZXJyb3JzQW1vdW50ID0gMDtcbiAgICB2YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHZhbGlkYXRlKHZhbGlkYXRvciwgZm9ybSkpO1xuICAgIGZvcm0uY29udHJvbHMuZm9yRWFjaChjdHJsID0+IGN0cmwudmFsaWRhdGUoKSk7XG4gICAgT2JqZWN0LnZhbHVlcyhmb3JtLmVycm9ycy5pdGVtcykuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgaWYgKCEhdmFsKSB7XG4gICAgICAgIGVycm9yc0Ftb3VudCsrO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGZvcm0uY29udHJvbHMuZm9yRWFjaChjdHJsID0+IHtcbiAgICAgIE9iamVjdC52YWx1ZXMoY3RybC5lcnJvcnMuaXRlbXMpLmZvckVhY2godmFsID0+IHtcbiAgICAgICAgaWYgKCEhdmFsKSB7XG4gICAgICAgICAgZXJyb3JzQW1vdW50Kys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmIChlcnJvcnNBbW91bnQgPiAwKSB7XG4gICAgICBjb25zb2xlLmxvZygnRm9ybSBpcyBub3QgdmFsaWQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IHZhbHVlcyA9IHt9O1xuICAgIGZvcm0uY29udHJvbHMuZm9yRWFjaChjdHJsID0+IHtcbiAgICAgIHZhbHVlc1tjdHJsLmtleU5hbWVdID0gY3RybC52YWx1ZTtcbiAgICB9KTtcbiAgICBmb3JtLnN1Ym1pdC5oYW5kbGVyKHZhbHVlcywgZXZ0KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZvcm07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvcm07XG59LHtcIi4vRm9ybUNvbnRyb2xcIjoxNn1dLDE2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHZhbGlkYXRlID0gZnVuY3Rpb24oY29udHJvbCkge1xuICBjb250cm9sID0gY29udHJvbCB8fCB0aGlzO1xuICBsZXQgYWRkID0ge307XG4gIGxldCByZW1vdmUgPSB7fTtcbiAgbGV0IGl0ZW1zID0gY29udHJvbC5lcnJvcnMuaXRlbXM7XG4gIGxldCB2YWxpZGF0b3JzID0gY29udHJvbC52YWxpZGF0b3JzO1xuXG4gIGlmICghY29udHJvbC5yZXF1aXJlZCAmJiBjb250cm9sLnZhbHVlID09PSAnJykge1xuICAgIE9iamVjdC5rZXlzKGl0ZW1zKS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgaWYgKCEhaXRlbXNbaXRlbV0pIHJlbW92ZVtpdGVtXSA9IHRydWU7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoY29udHJvbC5yZXF1aXJlZCAmJiBjb250cm9sLnZhbHVlID09PSAnJykge1xuICAgIGlmICghaXRlbXNbJ3JlcXVpcmVkJ10pIHtcbiAgICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJ1RoaXMgZmllbGQgaXMgcmVxdWlyZWQnO1xuICAgICAgaXRlbXNbJ3JlcXVpcmVkJ10gPSB7XG4gICAgICAgIHJlZjogZWxlbWVudFxuICAgICAgfVxuICAgICAgY29udHJvbC5lcnJvcnMucmVmLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChjb250cm9sLnZhbHVlLmxlbmd0aCA+IDAgJiYgISFpdGVtc1sncmVxdWlyZWQnXSkge1xuICAgIHJlbW92ZVsncmVxdWlyZWQnXSA9IHRydWU7XG4gIH1cblxuICBpZiAoY29udHJvbC52YWx1ZSAhPT0gJycpIHtcbiAgICB2YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHtcbiAgICAgIGxldCByZXN1bHQgPSB2YWxpZGF0b3IuaGFuZGxlcihjb250cm9sLnZhbHVlLCBjb250cm9sKTtcbiAgICAgIGlmICghcmVzdWx0LnZhbGlkICYmICFpdGVtc1t2YWxpZGF0b3IubmFtZV0pIHtcbiAgICAgICAgYWRkW3ZhbGlkYXRvci5uYW1lXSA9IHJlc3VsdDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHJlc3VsdC52YWxpZCAmJiBpdGVtc1t2YWxpZGF0b3IubmFtZV0pIHtcbiAgICAgICAgcmVtb3ZlW3ZhbGlkYXRvci5uYW1lXSA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBPYmplY3Qua2V5cyhhZGQpLmZvckVhY2goZXJyb3IgPT4ge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGFkZFtlcnJvcl0ubWVzc2FnZTtcbiAgICBpdGVtc1tlcnJvcl0gPSB7XG4gICAgICByZWY6IGVsZW1lbnRcbiAgICB9O1xuICAgIGNvbnRyb2wuZXJyb3JzLnJlZi5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgfSk7XG5cbiAgT2JqZWN0LmtleXMocmVtb3ZlKS5mb3JFYWNoKGVycm9yID0+IHtcbiAgICBpdGVtc1tlcnJvcl0ucmVmLnJlbW92ZSgpO1xuICAgIGl0ZW1zW2Vycm9yXSA9IG51bGw7XG4gIH0pO1xufTtcblxuY29uc3QgYmluZEVycm9ySGFuZGxpbmcgPSBmdW5jdGlvbihjb250cm9sKSB7XG4gIGNvbnRyb2wuY29udHJvbFJlZi5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICB2YWxpZGF0ZShjb250cm9sKTtcbiAgfSk7XG59O1xuXG5jb25zdCB0YWdJbnB1dCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgbGV0IHByZXBlbmQgPSBvcHRpb25zLnByZXBlbmQgfHwgJyc7XG4gIGxldCBhcHBlbmQgPSBvcHRpb25zLmFwcGVuZCB8fCAnJztcbiAgbGV0IGxhYmVsID1cbiAgICBvcHRpb25zLmxhYmVsID9cbiAgICBgPGxhYmVsIGZvcj1cIiR7b3B0aW9ucy5pZH1cIj4ke29wdGlvbnMubGFiZWx9PC9sYWJlbD5gIDpcbiAgICAnJztcbiAgbGV0IGVycm9ycyA9IG9wdGlvbnMuZXJyb3JzO1xuICBsZXQgZXJyb3JzUG9zaXRpb24gPVxuICAgIGVycm9ycyAmJiBlcnJvcnMucG9zaXRpb24gP1xuICAgIGVycm9ycyAmJiBlcnJvcnMucG9zaXRpb24gOlxuICAgICdiZWZvcmVBcHBlbmQnO1xuICBsZXQgZXJyb3JzQ2xhc3MgPVxuICAgIGVycm9ycyAmJiBlcnJvcnMuY2xhc3MgP1xuICAgIGVycm9ycyAmJiBlcnJvcnMuY2xhc3MgOlxuICAgICdlcnJvcnMnXG4gIGxldCBlcnJvcnNIVE1MID0gYDxkaXYgY2xhc3M9XCIke2Vycm9yc0NsYXNzfVwiPjwvZGl2PmA7XG4gIGxldCBjb250cm9sSFRNTCA9ICc8aW5wdXQ+JztcbiAgbGV0IGh0bWw7XG4gIFxuICBzd2l0Y2ggKGVycm9yc1Bvc2l0aW9uKSB7XG4gICAgY2FzZSAnYmVmb3JlUHJlcGVuZCc6XG4gICAgICBodG1sID0gZXJyb3JzSFRNTCArIHByZXBlbmQgKyBsYWJlbCArIGNvbnRyb2xIVE1MICsgYXBwZW5kO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmVmb3JlTGFiZWwnOlxuICAgICAgaHRtbCA9IHByZXBlbmQgKyBlcnJvcnNIVE1MICsgbGFiZWwgKyBjb250cm9sSFRNTCArIGFwcGVuZDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JlZm9yZUNvbnRyb2wnOlxuICAgICAgaHRtbCA9IHByZXBlbmQgKyBsYWJlbCArIGVycm9yc0hUTUwgKyBjb250cm9sSFRNTCArIGFwcGVuZDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JlZm9yZUFwcGVuZCc6XG4gICAgICBodG1sID0gcHJlcGVuZCArIGxhYmVsICsgY29udHJvbEhUTUwgKyBlcnJvcnNIVE1MICsgYXBwZW5kO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYWZ0ZXJBcHBlbmQnOlxuICAgICAgaHRtbCA9IHByZXBlbmQgKyBsYWJlbCArIGNvbnRyb2xIVE1MICsgYXBwZW5kICsgZXJyb3JzSFRNTDtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgbGV0IGNvbnRyb2xJZCA9ICdpbnB1dCc7IC8vIHRvIGlkZW50aWZ5IGl0IGluIHRoZSBET00gd2hlbiBpdCdzIHJlbmRlcmVkXG4gIGxldCBlcnJvcnNJZCA9IGVycm9yc0NsYXNzOyAvLyBmb3IgdGhpcyB0b29cblxuICBsZXQgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB3cmFwcGVyLmNsYXNzTmFtZSA9IChvcHRpb25zLndyYXBwZXIgJiYgb3B0aW9ucy53cmFwcGVyLmNsYXNzKSB8fCAnJztcbiAgd3JhcHBlci5pbm5lckhUTUwgPSBodG1sO1xuICBsZXQgY29udHJvbFJlZiA9IHdyYXBwZXIucXVlcnlTZWxlY3Rvcihjb250cm9sSWQpO1xuICBsZXQgZXJyb3JzUmVmID0gd3JhcHBlci5xdWVyeVNlbGVjdG9yKCcuJytlcnJvcnNJZCk7XG5cbiAgaWYgKG9wdGlvbnMuYXR0cmlidXRlcykge1xuICAgIG9wdGlvbnMuYXR0cmlidXRlcy5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgY29udHJvbFJlZi5zZXRBdHRyaWJ1dGUoYXR0ci5uYW1lLCBhdHRyLnZhbHVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGxldCBjb250cm9sID0ge1xuICAgIGtleU5hbWU6IG9wdGlvbnMua2V5TmFtZSB8fCAnJyxcbiAgICByZWY6IHdyYXBwZXIsXG4gICAgY29udHJvbFJlZjogY29udHJvbFJlZixcbiAgICBlcnJvcnM6IHtcbiAgICAgIHJlZjogZXJyb3JzUmVmLFxuICAgICAgaXRlbXM6IHt9XG4gICAgfSxcbiAgICByZXF1aXJlZDogb3B0aW9ucy5yZXF1aXJlZCB8fCBmYWxzZSxcbiAgICB2YWxpZDogbnVsbCxcbiAgICB2YWxpZGF0b3JzOiBvcHRpb25zLnZhbGlkYXRvcnMgfHwgW10sXG4gICAgdmFsaWRhdGU6IHZhbGlkYXRlXG4gIH07XG5cbiAgYmluZEVycm9ySGFuZGxpbmcoY29udHJvbCk7XG5cbiAgaWYgKG9wdGlvbnMuaGFuZGxlcnNPYmpzKSB7XG4gICAgbGV0IGV2ZW50cyA9IHt9O1xuICAgIGxldCBoYW5kbGVyc09ianMgPSBvcHRpb25zLmhhbmRsZXJzO1xuICAgIGhhbmRsZXJzT2Jqcy5mb3JFYWNoKG9iaiA9PiB7XG4gICAgICBpZiAoIWV2ZW50c1tvYmouZXZlbnRdKSB7XG4gICAgICAgIGV2ZW50c1tvYmouZXZlbnRdID0gW107XG4gICAgICB9XG4gICAgICBldmVudHNbb2JqLmV2ZW50XS5wdXNoKG9iai5oYW5kbGVyKTtcbiAgICB9KTtcbiAgICBPYmplY3Qua2V5cyhldmVudHMpLmZvckVhY2goZXZlbnROYW1lID0+IHtcbiAgICAgIGNvbnRyb2wuY29udHJvbFJlZi5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZXZ0ID0+IHtcbiAgICAgICAgZXZlbnRzW2V2ZW50TmFtZV0uZm9yRWFjaChoYW5kbGVyID0+IGhhbmRsZXIoZXZ0KSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb250cm9sLCAndmFsdWUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gdGhpcy5jb250cm9sUmVmLnZhbHVlfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7dGhpcy5jb250cm9sUmVmLnZhbHVlID0gbmV3VmFsdWV9XG4gIH0pXG5cbiAgcmV0dXJuIGNvbnRyb2w7XG59O1xuXG5jb25zdCBnZXRIYW5kbGVyID0gZnVuY3Rpb24odGFnKSB7XG4gIGxldCBmbjtcbiAgLy8gU3dpdGNoIHNlZW1zIHRvIGJlIGZhc3RlciB0aGFuIG9iamVjdCBsb29rIHVwXG4gIC8vIFNlYXJjaCBmb3IgJ2pzIHN3aXRjaCB2cyBvYmplY3QnXG4gIHN3aXRjaCh0YWcpIHtcbiAgICBjYXNlICdpbnB1dCc6XG4gICAgICBmbiA9IHRhZ0lucHV0O1xuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIGZuO1xufTtcblxuY29uc3QgRm9ybUNvbnRyb2wgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHJldHVybiBnZXRIYW5kbGVyKG9wdGlvbnMudGFnKShvcHRpb25zKVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtQ29udHJvbDtcbn0se31dLDE3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm0gPSByZXF1aXJlKCcuL0Zvcm0nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtO1xufSx7XCIuL0Zvcm1cIjoxNX1dLDE4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IG1pbkxlbmd0aCA9IGZ1bmN0aW9uKHZhbHVlLCBjb250cm9sKSB7XG4gIHJldHVybiB7XG4gICAgdmFsaWQ6IHZhbHVlLmxlbmd0aCA+PSA1LFxuICAgIG1lc3NhZ2U6ICdUaGlzIGZpZWxkc1xcJ3MgbGVuZ3RoIGlzIGxlc3MgdGhhbiA1IGNoYXJzJ1xuICB9XG59O1xuXG5jb25zdCBtYXhMZW5ndGggPSBmdW5jdGlvbih2YWx1ZSwgY29udHJvbCkge1xuICByZXR1cm4ge1xuICAgIHZhbGlkOiB2YWx1ZS5sZW5ndGggPD0gMTAsXG4gICAgbWVzc2FnZTogJ1RoaXMgZmllbGRzXFwncyBsZW5ndGggaXMgZ3JlYXRlciB0aGFuIDEwIGNoYXJzJ1xuICB9XG59O1xuXG5jb25zdCBzdGFydHNXaXRoTnVtYmVyID0gZnVuY3Rpb24odmFsdWUsIGNvbnRyb2wpIHtcbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogIS9eXFxkKy9pLnRlc3QodmFsdWUpLFxuICAgIG1lc3NhZ2U6ICdVc2VybmFtZSBtdXN0IG5vdCBzdGFydCB3aXRoIG51bWJlcnMnXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtaW5MZW5ndGgsXG4gIG1heExlbmd0aCxcbiAgc3RhcnRzV2l0aE51bWJlclxufTtcbn0se31dLDE5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmZ1bmN0aW9uIGNvbmZpZ3VyZShvcHRpb25zKSB7XG4gIGxldCBsb2NhdGlvbiA9IG9wdGlvbnMubG9jYXRpb247XG4gIGxvY2F0aW9uID0gbG9jYXRpb25bbG9jYXRpb24ubGVuZ3RoLTFdID09PSAnLycgP1xuICAgIGxvY2F0aW9uIDpcbiAgICBsb2NhdGlvbiArICcvJztcbiAgXG4gIHRoaXMubG9jYXRpb24gPSBsb2NhdGlvbjtcbn1cblxuZnVuY3Rpb24gZ2V0Q29ycmVjdFVybCh1cmwpIHtcbiAgdXJsID0gdXJsWzBdID09PSAnLycgP1xuICAgIHVybC5zbGljZSgxKSA6XG4gICAgdXJsO1xuXG4gIHJldHVybiB1cmw7XG59XG5cbmZ1bmN0aW9uIHNldEF1dGhvcml6YXRpb25IZWFkZXIoeGhyKSB7XG4gIGNvbnN0IHRva2VuID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhdXRoX3Rva2VuJyk7XG5cbiAgaWYgKHRva2VuKSB7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ2F1dGhvcml6YXRpb24nLCBgQmVhcmVyICR7dG9rZW59YCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0KHVybCwgb3B0aW9ucykge1xuICByZXR1cm4gdGhpcy5tYWtlUmVxdWVzdCgnR0VUJywgdXJsLCBudWxsLCBvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gcG9zdCh1cmwsIGJvZHksIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHRoaXMubWFrZVJlcXVlc3QoJ1BPU1QnLCB1cmwsIGJvZHksIG9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiBtYWtlUmVxdWVzdChtZXRob2QsIHVybCwgYm9keSwgb3B0aW9ucykge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHVybCA9IHRoaXMuZ2V0Q29ycmVjdFVybCh1cmwpO1xuXG4gICAgeGhyLm9wZW4obWV0aG9kLCB0aGlzLmxvY2F0aW9uICsgdXJsKTtcblxuICAgIGlmIChtZXRob2QgPT0gJ1BPU1QnKSB7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcbiAgICAgICAgJ0NvbnRlbnQtVHlwZScsXG4gICAgICAgIChvcHRpb25zICYmIG9wdGlvbnMuY29udGVudFR5cGUpIHx8IHRoaXMuY29udGVudFR5cGVzLmpzb25cbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRBdXRob3JpemF0aW9uSGVhZGVyKHhocik7XG5cbiAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcbiAgICAgIGNvbnN0IGlzSnNvbiA9IHhoci5nZXRSZXNwb25zZUhlYWRlcignQ29udGVudC1UeXBlJykubWF0Y2godGhpcy5jb250ZW50VHlwZXMuanNvbik7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGlzSnNvbiA/XG4gICAgICAgIEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCkgOlxuICAgICAgICB4aHIucmVzcG9uc2VUZXh0O1xuXG4gICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICB9KTtcblxuICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGZ1bmN0aW9uKCkge1xuICAgICAgcmVqZWN0KCdOZXR3b3JrIGVycm9yIG9jY3VyZWQnKTtcbiAgICB9KTtcblxuICAgIGlmIChtZXRob2QgPT0gJ0dFVCcpIHtcbiAgICAgIHhoci5zZW5kKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1ldGhvZCA9PSAnUE9TVCcpIHtcbiAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KGJvZHkpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9jYXRpb246IG51bGwsXG4gIGdldENvcnJlY3RVcmw6IGdldENvcnJlY3RVcmwsXG4gIGNvbmZpZ3VyZTogY29uZmlndXJlLFxuICBzZXRBdXRob3JpemF0aW9uSGVhZGVyOiBzZXRBdXRob3JpemF0aW9uSGVhZGVyLFxuICBjb250ZW50VHlwZXM6IHtcbiAgICBqc29uOiAnYXBwbGljYXRpb24vanNvbidcbiAgfSxcbiAgbWFrZVJlcXVlc3Q6IG1ha2VSZXF1ZXN0LFxuICBnZXQ6IGdldCxcbiAgcG9zdDogcG9zdFxufTtcbn0se31dLDIwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5jb25zdCByYWRpYWxHcmFkaWVudE9uSG92ZXIgPSBmdW5jdGlvbihidG4sIG9wdHMpIHtcbiAgY29uc3QgdGV4dCA9IGJ0bi5pbm5lckhUTUw7XG4gIGNvbnN0IHdyYXBwZXIgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cInJnLWJ0blwiPlxuICAgICAgPHNwYW4+JHt0ZXh0fTwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgYCk7XG4gIGJ0bi5pbm5lckhUTUwgPSAnJztcbiAgYnRuLnN0eWxlLnBhZGRpbmcgPSAwO1xuXG4gIGlmIChOdW1iZXIuaXNJbnRlZ2VyKG9wdHMucGFkZGluZykpIHtcbiAgICB3cmFwcGVyLnN0eWxlLnBhZGRpbmcgPSBvcHRzLnBhZGRpbmcgKyAncHgnO1xuICB9XG4gIGVsc2UgaWYgKG9wdHMucGFkZGluZyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgaWYgKG9wdHMucGFkZGluZy5sZW5ndGggPT0gMikge1xuICAgICAgd3JhcHBlci5zdHlsZS5wYWRkaW5nVG9wID0gd3JhcHBlci5zdHlsZS5wYWRkaW5nQm90dG9tID0gb3B0cy5wYWRkaW5nWzBdICsgJ3B4JztcbiAgICAgIHdyYXBwZXIuc3R5bGUucGFkZGluZ0xlZnQgPSB3cmFwcGVyLnN0eWxlLnBhZGRpbmdSaWdodCA9IG9wdHMucGFkZGluZ1sxXSArICdweCc7XG4gICAgfVxuICB9XG5cbiAgYnRuLmFwcGVuZENoaWxkKHdyYXBwZXIpO1xuXG4gIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBldnQgPT4ge1xuICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gZXZ0LnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCB4ID0gZXZ0LmNsaWVudFggLSBjb29yZGluYXRlcy5sZWZ0O1xuICAgIGNvbnN0IHkgPSBldnQuY2xpZW50WSAtIGNvb3JkaW5hdGVzLnRvcDtcbiAgICBldnQudGFyZ2V0LnN0eWxlLnNldFByb3BlcnR5KCctLXgnLCBgJHsgeCB9cHhgKTtcbiAgICBldnQudGFyZ2V0LnN0eWxlLnNldFByb3BlcnR5KCctLXknLCBgJHsgeSB9cHhgKTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJhZGlhbEdyYWRpZW50T25Ib3Zlcjtcbn0se1wiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjI4fV0sMjE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgUm91dGVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucm91dGVzID0gW107XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLnJlZ2V4cFBhcmFtcyA9IC8oXFwoOihbXFx3XFxkXFwtX10rKVxcKSkvZ2k7XG5cblJvdXRlci5wcm90b3R5cGUudHJpbVJvdXRlID0gZnVuY3Rpb24ocm91dGUpe1xuICByb3V0ZSA9IHJvdXRlWzBdID09PSAnLydcbiAgICA/IHJvdXRlLnN1YnN0cigxKVxuICAgIDogcm91dGU7XG5cbiAgcm91dGUgPSByb3V0ZVtyb3V0ZS5sZW5ndGggLSAxXSA9PT0gJy8nXG4gICAgPyByb3V0ZS5zdWJzdHIoMCwgcm91dGUubGVuZ3RoIC0gMSlcbiAgICA6IHJvdXRlO1xuXG4gIHJldHVybiByb3V0ZTtcbn0sXG5cblJvdXRlci5wcm90b3R5cGUuZ2V0UGFyYW1zTmFtZXMgPSBmdW5jdGlvbihyb3V0ZSkge1xuICBsZXQgcmVzdWx0O1xuICBsZXQgcGFyYW1zTmFtZXMgPSBbXTtcbiAgd2hpbGUgKChyZXN1bHQgPSB0aGlzLnJlZ2V4cFBhcmFtcy5leGVjKHJvdXRlKSkgIT09IG51bGwpIHtcbiAgICBwYXJhbXNOYW1lcy5wdXNoKHJlc3VsdFsyXSk7XG4gIH1cbiAgcmV0dXJuIHBhcmFtc05hbWVzO1xufVxuXG5Sb3V0ZXIucHJvdG90eXBlLmFkZFJvdXRlID0gZnVuY3Rpb24ocm91dGUsIG9iaikge1xuICByb3V0ZSA9IHRoaXMudHJpbVJvdXRlKHJvdXRlKTtcbiAgbGV0IHBhcmFtc05hbWVzID0gdGhpcy5nZXRQYXJhbXNOYW1lcyhyb3V0ZSk7XG4gIGxldCByZWdleHBTdHIgPSByb3V0ZS5yZXBsYWNlKHRoaXMucmVnZXhwUGFyYW1zLCAnKFtcXFxcd1xcXFxkXFwtX10rKScpO1xuICBsZXQgcmVnZXhwID0gUmVnRXhwKGBeJHtyZWdleHBTdHJ9KFxcXFwvfCQpYCwgJ2dpJyk7XG5cbiAgbGV0IHJvdXRlT2JqID0ge1xuICAgIHR5cGU6ICdyb3V0ZScsXG4gICAgcmVnZXhwOiByZWdleHAsXG4gICAgcGFyYW1zTmFtZXM6IHBhcmFtc05hbWVzXG4gIH07XG5cbiAgaWYgKHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbicpIHtcbiAgICAvKipcbiAgICAgKiBSb3V0ZSBoYW5kbGVyIHdpbGwgYmUgaW52b2tlZCB3aGVuIHVzZXIgZ29lcyB0byB0aGUgY29ycmVzcG9uZGluZ1xuICAgICAqIHJvdXRlIGFuZCBub3QgdGVybWluYXRlZCBieSBtaWRkbGV3YXJlcyB1bmRlcndheVxuICAgICAqIEBmdW5jdGlvbiBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGhhbmRsZXJQYXJhbXMgLSBwYXJhbXMgbWF5IGJlIGdpdmVuIHdoZW4gUm91dGVyLm5hdmlnYXRlIGlzIGludm9rZWRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcm91dGVQYXJhbXMgLSBwYXJhbXMgZXhpc3Rpbmcgb24gdGhlIHJvdXRlIGlmIGFueVxuICAgICAqIEBwYXJhbSB7YW55fSBhcmcgLSB0aGlzIGlzIGdpdmVuIGJ5IHRoZSBsYXN0IG1pZGRsZXdhcmUgaWYgYW55XG4gICAgICovXG4gICAgcm91dGVPYmouaGFuZGxlciA9IG9iajtcbiAgfVxuXG4gIGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgcm91dGVPYmouY2hpbGRyZW4gPSBvYmo7XG4gIH1cblxuICBlbHNlIHtcbiAgICBjb25zb2xlLmxvZygnRXJyb3Igb2NjdXJlZCB3aGlsZSBhZGRpbmcgcm91dGUnKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JvdXRlIGVycm9yJyk7XG4gIH1cblxuICB0aGlzLnJvdXRlcy5wdXNoKHJvdXRlT2JqKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLmdldFJvdXRlID0gZnVuY3Rpb24obGluaywgcm91dGVzID0gdGhpcy5yb3V0ZXMpIHtcbiAgbGluayA9IGxpbmsgPT09ICcnID8gJy8nIDogbGluaztcbiAgbGV0IG1pZGRsZXdhcmVzID0gW107XG4gIGxldCBwYXJhbXMgPSB7fTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJvdXRlcy5sZW5ndGgsIHJvdXRlID0gcm91dGVzW2ldOyBpKyspIHtcbiAgICBpZiAocm91dGUudHlwZSA9PSAnbWlkZGxld2FyZScpIHtcbiAgICAgIG1pZGRsZXdhcmVzLnB1c2gocm91dGUuZm4pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHJvdXRlLnR5cGUgPT0gJ3JvdXRlcycpIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuQ2hlY2sgPSB0aGlzLmdldFJvdXRlKGxpbmssIHJvdXRlLnJvdXRlcyk7XG4gICAgICBpZiAoY2hpbGRyZW5DaGVjayAhPT0gbnVsbCkge1xuICAgICAgICBjaGlsZHJlbkNoZWNrLm1pZGRsZXdhcmVzID0gbWlkZGxld2FyZXMuY29uY2F0KGNoaWxkcmVuQ2hlY2subWlkZGxld2FyZXMpO1xuICAgICAgICBjaGlsZHJlbkNoZWNrLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24ocGFyYW1zLCBjaGlsZHJlbkNoZWNrLnBhcmFtcyk7XG4gICAgICAgIHJldHVybiBjaGlsZHJlbkNoZWNrO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgbGV0IHJlZ2V4cCA9IHJvdXRlLnJlZ2V4cDtcbiAgICBsZXQgcmVzdWx0ID0gcmVnZXhwLmV4ZWMobGluayk7XG4gICAgbGV0IG5ld0xpbms7XG5cbiAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggPiAxKSB7XG4gICAgICBwYXJhbXMgPSB7fTtcbiAgICAgIGZvciAobGV0IGlkeCA9IDE7IGlkeCA8IHJlc3VsdC5sZW5ndGggLSAxOyBpZHgrKykge1xuICAgICAgICBwYXJhbXNbcm91dGUucGFyYW1zTmFtZXNbaWR4LTFdXSA9IHJlc3VsdFtpZHhdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZWdleHAubGFzdEluZGV4ID4gMCkge1xuICAgICAgbmV3TGluayA9IGxpbmsuc3Vic3RyKHJlZ2V4cC5sYXN0SW5kZXgpO1xuICAgIH1cblxuICAgIGlmIChyZWdleHAubGFzdEluZGV4ID4gMCAmJiBuZXdMaW5rLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChyb3V0ZS5jaGlsZHJlbiAmJiByb3V0ZS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxldCBjaGlsZHJlbkNoZWNrID0gdGhpcy5nZXRSb3V0ZShuZXdMaW5rLCByb3V0ZS5jaGlsZHJlbik7XG4gICAgICAgIGlmIChjaGlsZHJlbkNoZWNrICE9PSBudWxsKSB7XG4gICAgICAgICAgY2hpbGRyZW5DaGVjay5taWRkbGV3YXJlcyA9IG1pZGRsZXdhcmVzLmNvbmNhdChjaGlsZHJlbkNoZWNrLm1pZGRsZXdhcmVzKTtcbiAgICAgICAgICBjaGlsZHJlbkNoZWNrLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24ocGFyYW1zLCBjaGlsZHJlbkNoZWNrLnBhcmFtcyk7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkcmVuQ2hlY2s7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZWxzZSBpZiAocmVnZXhwLmxhc3RJbmRleCA+IDApIHtcbiAgICAgIC8vIEluIGNhc2UgaXQncyB0ZXJtaW5hbCByb3V0ZVxuICAgICAgaWYgKHJvdXRlLmhhbmRsZXIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBoYW5kbGVyOiByb3V0ZS5oYW5kbGVyLFxuICAgICAgICAgIHBhcmFtczogcGFyYW1zLFxuICAgICAgICAgIG1pZGRsZXdhcmVzOiBtaWRkbGV3YXJlc1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBTaW5jZSBpdCdzIGRvbmUgYW5kIGxpbmsgaXMgKGFjdHVhbGx5LCB3aWxsIGJlIHdoZW4gd2VcbiAgICAgIC8vIGdldCBpbnRvIHJlY3Vyc2lvbikgJy8nLCBzbyB3ZSBsb29rIHVwIGNoaWxkcmVuIHRvXG4gICAgICAvLyB0byBtYXRjaCB0aGUgcm9vdCAnLycgd2hpY2ggbXVzdCBleGlzdCB0aGVyZVxuICAgICAgaWYgKHJvdXRlLmNoaWxkcmVuKSB7XG4gICAgICAgIGxldCBjaGlsZHJlbkNoZWNrID0gdGhpcy5nZXRSb3V0ZShuZXdMaW5rLCByb3V0ZS5jaGlsZHJlbik7XG4gICAgICAgIGlmIChjaGlsZHJlbkNoZWNrICE9PSBudWxsKSB7XG4gICAgICAgICAgY2hpbGRyZW5DaGVjay5taWRkbGV3YXJlcyA9IG1pZGRsZXdhcmVzLmNvbmNhdChjaGlsZHJlbkNoZWNrLm1pZGRsZXdhcmVzKTtcbiAgICAgICAgICBjaGlsZHJlbkNoZWNrLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24ocGFyYW1zLCBjaGlsZHJlbkNoZWNrLnBhcmFtcyk7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkcmVuQ2hlY2s7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLmFkZFJvdXRlcyA9IGZ1bmN0aW9uKHJvdXRlcykge1xuICB0aGlzLnJvdXRlcy5wdXNoKHtcbiAgICB0eXBlOiAncm91dGVzJyxcbiAgICByb3V0ZXM6IHJvdXRlc1xuICB9KTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cblJvdXRlci5wcm90b3R5cGUuYWRkTWlkZGxld2FyZSA9IGZ1bmN0aW9uKGZuKSB7XG4gIHRoaXMucm91dGVzLnB1c2goe1xuICAgIHR5cGU6ICdtaWRkbGV3YXJlJyxcbiAgICBmbjogZm5cbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLm5hdmlnYXRlID0gZnVuY3Rpb24obGluaywgaGFuZGxlclBhcmFtcykge1xuICBsaW5rID0gdGhpcy50cmltUm91dGUobGluayk7XG4gIGxldCByb3V0ZSA9IHRoaXMuZ2V0Um91dGUobGluayk7XG4gIGlmICghcm91dGUpIHtcbiAgICBjb25zb2xlLmxvZygnTm8gc3VpdGFibGUgcm91dGUgaGFzIGJlZW4gZm91bmQnKTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gcm91dGUuaGFuZGxlcihyb3V0ZS5wYXJhbXMpO1xuICBmbnMgPSByb3V0ZS5taWRkbGV3YXJlcy5jb25jYXQoW3JvdXRlLmhhbmRsZXIuYmluZChudWxsLCBoYW5kbGVyUGFyYW1zKV0pO1xuICBmb3IgKGxldCBpID0gZm5zLmxlbmd0aCAtIDE7IGkgPiAwLCBmbiA9IGZuc1tpXTsgaS0tKSB7XG4gICAgaWYgKGkgIT09IGZucy5sZW5ndGggLSAxKSB7XG4gICAgICBmbnNbaV0gPSBmbi5iaW5kKG51bGwsIGZuc1tpKzFdLCByb3V0ZS5wYXJhbXMpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGZuc1tpXSA9IGZuLmJpbmQobnVsbCwgcm91dGUucGFyYW1zKTtcbiAgICB9XG4gIH1cbiAgZm5zWzBdKCk7XG4gIGhpc3RvcnkucHVzaFN0YXRlKCcnLCAnJywgJy8nICsgbGluayk7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLnRlc3ROYXYgPSBmdW5jdGlvbihsaW5rLCBoYW5kbGVyUGFyYW1zKSB7XG4gIGxpbmsgPSB0aGlzLnRyaW1Sb3V0ZShsaW5rKTtcbiAgbGV0IHJvdXRlID0gdGhpcy5nZXRSb3V0ZShsaW5rKTtcbiAgaWYgKCFyb3V0ZSkge1xuICAgIGNvbnNvbGUubG9nKCdObyBzdWl0YWJsZSByb3V0ZSBoYXMgYmVlbiBmb3VuZCcpXG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGNvbnNvbGUubG9nKHJvdXRlKTtcbiAgZm5zID0gcm91dGUubWlkZGxld2FyZXMuY29uY2F0KFtyb3V0ZS5oYW5kbGVyLmJpbmQobnVsbCwgaGFuZGxlclBhcmFtcyldKTtcbiAgZm9yIChsZXQgaSA9IGZucy5sZW5ndGggLSAxOyBpID4gMCwgZm4gPSBmbnNbaV07IGktLSkge1xuICAgIGlmIChpICE9PSBmbnMubGVuZ3RoIC0gMSkge1xuICAgICAgZm5zW2ldID0gZm4uYmluZChudWxsLCBmbnNbaSsxXSwgcm91dGUucGFyYW1zKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBmbnNbaV0gPSBmbi5iaW5kKG51bGwsIHJvdXRlLnBhcmFtcyk7XG4gICAgfVxuICB9XG4gIGNvbnNvbGUubG9nKGZucylcbiAgZm5zWzBdKCk7XG59O1xuXG5jb25zdCBTdWJyb3V0ZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yb3V0ZXMgPSBbXTtcbn07XG5TdWJyb3V0ZXIucHJvdG90eXBlID0gUm91dGVyLnByb3RvdHlwZTtcblJvdXRlci5TdWJyb3V0ZXIgPSBTdWJyb3V0ZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gUm91dGVyO1xufSx7fV0sMjI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgdGFncyA9IFsnZGl2JywgJ3NwYW4nLCAnYnV0dG9uJ107XG5cbmNvbnN0IEhlYWRlckl0ZW0gPSBmdW5jdGlvbihvcHRzKSB7XG4gIGNvbnN0IHRpdGxlID0gb3B0cy50aXRsZSB8fCAnJztcbiAgY29uc3QgY2xhc3NOYW1lID0gb3B0cy5jbGFzc05hbWUgfHwgJyc7XG4gIGNvbnN0IHRhZyA9IHRhZ3MuZmluZCh0YWcgPT4gdGFnID09PSBvcHRzLnRhZykgP1xuICAgIG9wdHMudGFnIDpcbiAgICAnc3Bhbic7XG5cbiAgY29uc3QgaGVhZGVySXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgaGVhZGVySXRlbS5jbGFzc05hbWUgPSAndGFicy1oZWFkZXItaXRlbSAnICsgY2xhc3NOYW1lO1xuICBoZWFkZXJJdGVtLmlubmVySFRNTCA9IHRpdGxlO1xuXG4gIGlmIChvcHRzLmF0dHJpYnV0ZXMpIHtcbiAgICBvcHRzLmF0dHJpYnV0ZXMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgIGhlYWRlckl0ZW0uc2V0QXR0cmlidXRlKGF0dHIubmFtZSwgYXR0ci52YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGVsZW1lbnQ6IGhlYWRlckl0ZW1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVySXRlbTtcbn0se31dLDIzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGRlZmF1bHRBbmltID0gZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIGhhbmRsZXIoZXZ0KSB7XG4gICAgY29uc3QgdGFiID0gZXZ0LnRhcmdldC5jbG9zZXN0KCcudGFicy1oZWFkZXItaXRlbScpLmRhdGFzZXQub3JkZXI7XG4gICAgdGhpcy5nb3RvVGFiKHRhYik7XG4gIH1cblxuICBmdW5jdGlvbiBnb3RvVGFiKHRhYikge1xuICAgIHRhYi0tO1xuICAgIGNvbnN0IG5ld0hlYWRlckl0ZW0gPSB0aGlzLmhlYWRlci5pdGVtc1t0YWJdO1xuICAgIGNvbnN0IG5ld0NvbnRlbnRJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW3RhYl07XG5cbiAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuXG4gICAgbmV3SGVhZGVySXRlbS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICBuZXdDb250ZW50SXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICBuZXdDb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblxuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0gPSBuZXdIZWFkZXJJdGVtO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtID0gbmV3Q29udGVudEl0ZW07XG4gIH1cblxuICBmdW5jdGlvbiBpbml0aWFsaXplKHRhYikge1xuICAgIHRhYi0tO1xuICAgIGNvbnN0IGFjdGl2ZUhlYWRlckl0ZW0gPSB0aGlzLmhlYWRlci5pdGVtc1t0YWJdO1xuICAgIGNvbnN0IGFjdGl2ZUNvbnRlbnRJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW3RhYl07XG4gICAgY29uc3Qgbm9uQWN0aXZlQ29udGVudEl0ZW1zID0gdGhpcy5jb250ZW50Lml0ZW1zLmZpbHRlcihpdGVtID0+IGl0ZW0gIT09IGFjdGl2ZUNvbnRlbnRJdGVtKTtcblxuICAgIGFjdGl2ZUhlYWRlckl0ZW0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgYWN0aXZlQ29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cbiAgICBub25BY3RpdmVDb250ZW50SXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJykpO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IGFjdGl2ZUhlYWRlckl0ZW07XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSBhY3RpdmVDb250ZW50SXRlbTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlcixcbiAgICBnb3RvVGFiLFxuICAgIGluaXRpYWxpemVcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdEFuaW07XG59LHt9XSwyNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBzZXRDb250ZW50SXRlbXNXaWR0aHMgPSBmdW5jdGlvbihvcHRpb25zLCBhbmltUGFyYW1zKSB7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBvcHRpb25zLmNvbnRyb2xsZXIgfHwge307XG4gIGNvbnN0IG5ld09yZGVyID0gb3B0aW9ucy5uZXdPcmRlcjtcbiAgY29uc3Qgc2V0Rm9yTmV3T3JkZXIgPSBvcHRpb25zLnNldEZvck5ld09yZGVyIHx8IGZhbHNlO1xuICBjb25zdCBpdGVtcyA9IGNvbnRyb2xsZXIuY29udGVudC5pdGVtcztcbiAgY29uc3QgbGVuID0gaXRlbXMubGVuZ3RoO1xuICBjb25zdCB3aWR0aCA9IGNvbnRyb2xsZXIuY29udGVudC5lbGVtZW50LmNsaWVudFdpZHRoO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuLCBpdGVtID0gaXRlbXNbaV07IGkrKykge1xuICAgIGlmIChzZXRGb3JOZXdPcmRlciB8fCBpdGVtICE9PSBpdGVtc1tuZXdPcmRlcl0pIHtcbiAgICAgIGl0ZW0uc3R5bGUud2lkdGggPSAod2lkdGggLSAyKmFuaW1QYXJhbXMucGFkZGluZykgKyAncHgnO1xuICAgIH1cbiAgfVxufTtcblxuY29uc3Qgc2V0Q29udGVudEl0ZW1zUG9zaXRpb25zID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBjb25zdCBjb250cm9sbGVyID0gb3B0aW9ucy5jb250cm9sbGVyIHx8IHt9O1xuICBjb25zdCBuZXdPcmRlciA9IG9wdGlvbnMubmV3T3JkZXI7XG4gIGNvbnN0IHNldEZvck5ld09yZGVyID0gb3B0aW9ucy5zZXRGb3JOZXdPcmRlciB8fCBmYWxzZTtcbiAgY29uc3QgaXRlbXMgPSBjb250cm9sbGVyLmNvbnRlbnQuaXRlbXM7XG4gIGNvbnN0IGxlbiA9IGl0ZW1zLmxlbmd0aDtcbiAgY29uc3Qgd2lkdGggPSBjb250cm9sbGVyLmNvbnRlbnQuZWxlbWVudC5jbGllbnRXaWR0aDtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbiwgaXRlbSA9IGl0ZW1zW2ldOyBpKyspIHtcbiAgICBpZiAoc2V0Rm9yTmV3T3JkZXIgfHwgaXRlbSAhPT0gaXRlbXNbbmV3T3JkZXJdKSB7XG4gICAgICBpdGVtLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGVYKCR7KGktbmV3T3JkZXIpKndpZHRofXB4KWA7XG4gICAgfVxuICB9XG59O1xuXG5jb25zdCBzZXRDb250ZW50SXRlbXNEaXNwbGF5ID0gZnVuY3Rpb24ob3B0cykge1xuICBjb25zdCBjb250ZW50SXRlbXMgPSBvcHRzLmNvbnRyb2xsZXIuY29udGVudC5pdGVtcztcbiAgY29uc3QgZGlzcGxheSA9IG9wdHMuZGlzcGxheTtcbiAgY29uc3QgbmV3T3JkZXIgPSBvcHRzLm5ld09yZGVyO1xuICBjb25zdCBzZXRGb3JOZXdPcmRlciA9IG9wdHMuc2V0Rm9yTmV3T3JkZXI7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb250ZW50SXRlbXMubGVuZ3RoLCBjaSA9IGNvbnRlbnRJdGVtc1tpXTsgaSsrKSB7XG4gICAgaWYgKHNldEZvck5ld09yZGVyIHx8IGNpICE9PSBjb250ZW50SXRlbXNbbmV3T3JkZXJdKSB7XG4gICAgICBjaS5zdHlsZS5kaXNwbGF5ID0gZGlzcGxheTtcbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0IFRhYnNGbG93QW5pbWF0aW9uID0gZnVuY3Rpb24oKSB7XG4gIGxldCBwYXJhbXM7XG5cbiAgZnVuY3Rpb24gaGFuZGxlcihldnQpIHtcbiAgICBpZiAodGhpcy5hY3RpdmUud29ya2luZykgcmV0dXJuO1xuICAgIHRoaXMuYWN0aXZlLndvcmtpbmcgPSB0cnVlO1xuICAgIC8vIEhJIHN0YW5kcyBmb3IgSGVhZGVyIEl0ZW1cbiAgICAvLyBDSSBzdGFuZHMgZm9yIENvbnRlbnQgSXRlbVxuICAgIGNvbnN0IG5ld0hJID0gZXZ0LnRhcmdldC5jbG9zZXN0KCcudGFicy1oZWFkZXItaXRlbScpO1xuICAgIGNvbnN0IG9yZGVyID0gK25ld0hJLmRhdGFzZXQub3JkZXIgLSAxO1xuICAgIGNvbnN0IG5ld0NJID0gdGhpcy5jb250ZW50Lml0ZW1zW29yZGVyXTtcbiAgICBjb25zdCBzcGVlZCA9IHBhcmFtcy5zcGVlZDtcbiAgICBjb25zdCBvbGRPcmRlciA9ICt0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtLmRhdGFzZXQub3JkZXIgLSAxO1xuXG4gICAgc2V0Q29udGVudEl0ZW1zUG9zaXRpb25zKHtjb250cm9sbGVyOiB0aGlzLCBuZXdPcmRlcjogb2xkT3JkZXIsIHNldEZvck5ld09yZGVyOiBmYWxzZX0pO1xuICAgIHNldENvbnRlbnRJdGVtc0Rpc3BsYXkoe2NvbnRyb2xsZXI6IHRoaXMsIG5ld09yZGVyOiBvcmRlciwgc2V0Rm9yTmV3T3JkZXI6IHRydWUsIGRpc3BsYXk6ICdibG9jayd9KTtcbiAgICBuZXdISS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIHRoaXMuY29udGVudC5lbGVtZW50LnN0eWxlLmhlaWdodCA9IHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLmNsaWVudEhlaWdodCArICdweCc7XG4gICAgdGhpcy5jb250ZW50LmVsZW1lbnQuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gc3BlZWQgKyAnbXMnO1xuICAgIHRoaXMuY29udGVudC5lbGVtZW50LnN0eWxlLmhlaWdodCA9IG5ld0NJLmNsaWVudEhlaWdodCArICdweCc7XG5cbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uc3R5bGUudG9wID0gcGFyYW1zLnBhZGRpbmcgKyAncHgnO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLnN0eWxlLmxlZnQgPSBwYXJhbXMucGFkZGluZyArICdweCc7XG5cbiAgICB0aGlzLmNvbnRlbnQuaXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gc3BlZWQgKyAnbXMnKTtcblxuICAgIHNldENvbnRlbnRJdGVtc1dpZHRocyh7Y29udHJvbGxlcjogdGhpcywgbmV3T3JkZXI6IG9yZGVyLCBzZXRGb3JOZXdPcmRlcjogdHJ1ZX0sIHBhcmFtcyk7XG4gICAgc2V0Q29udGVudEl0ZW1zUG9zaXRpb25zKHtjb250cm9sbGVyOiB0aGlzLCBuZXdPcmRlcjogb3JkZXIsIHNldEZvck5ld09yZGVyOiB0cnVlfSk7XG4gICAgXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBuZXdDSS5zdHlsZS5wb3NpdGlvbiA9ICdzdGF0aWMnO1xuICAgICAgbmV3Q0kuc3R5bGUud2lkdGggPSAnYXV0byc7XG4gICAgICB0aGlzLmNvbnRlbnQuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XG4gICAgICB0aGlzLmNvbnRlbnQuaXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gJzBtcycpO1xuICAgICAgdGhpcy5jb250ZW50LmVsZW1lbnQuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gJzBtcyc7XG4gICAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtID0gbmV3SEk7XG4gICAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbSA9IG5ld0NJO1xuICAgICAgdGhpcy5hY3RpdmUud29ya2luZyA9IGZhbHNlO1xuICAgICAgc2V0Q29udGVudEl0ZW1zRGlzcGxheSh7XG4gICAgICAgIGNvbnRyb2xsZXI6IHRoaXMsXG4gICAgICAgIG5ld09yZGVyOiBvcmRlcixcbiAgICAgICAgc2V0Rm9yTmV3T3JkZXI6IGZhbHNlLFxuICAgICAgICBkaXNwbGF5OiAnbm9uZSdcbiAgICAgIH0pO1xuICAgIH0sIHNwZWVkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdvdG9UYWIodGFiKSB7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUodGFiLCBhbmltT3B0aW9ucykge1xuICAgIHBhcmFtcyA9IGFuaW1PcHRpb25zIHx8IHt9O1xuICAgIC8vIEFkZCBjbGFzc2VzXG4gICAgdGhpcy5jb250ZW50LmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgndGFicy1mbG93LWNvbnRlbnQnKTtcbiAgICB0aGlzLmNvbnRlbnQuaXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgndGFicy1mbG93LUNJJykpO1xuICAgIFxuICAgIC8vIFNldCBpbmRpdmlkdWFsIENTU1xuICAgIGNvbnN0IENJcyA9IHRoaXMuY29udGVudC5pdGVtcztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IENJcy5sZW5ndGgsIGl0ZW0gPSBDSXNbaV07IGkrKykge1xuICAgICAgaWYgKGkgIT09IHRhYikge1xuICAgICAgICBDSXNbaV0uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnOyAgICBcbiAgICAgICAgQ0lzW2ldLnN0eWxlLnRvcCA9IHBhcmFtcy5wYWRkaW5nICsgJ3B4JztcbiAgICAgICAgQ0lzW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuaGVhZGVyLml0ZW1zW3RhYl0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cbiAgICAvLyBTZXQgYWN0aXZlIG9iamVjdFxuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0gPSB0aGlzLmhlYWRlci5pdGVtc1t0YWJdO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW3RhYl07XG5cbiAgICAvLyBBZGQgb24gcmVzaXppbmcgZXZlbnQgaGFuZGxlclxuICAgIGNvbnN0IG5ld09yZGVyID0gK3RoaXMuYWN0aXZlLmhlYWRlckl0ZW0uZGF0YXNldC5vcmRlciAtIDE7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7Y29udHJvbGxlcjogdGhpcywgbmV3T3JkZXI6IG5ld09yZGVyfTtcbiAgICAgIGlmICh0aGlzLmFjdGl2ZS53b3JraW5nKSB7XG4gICAgICAgIHNldENvbnRlbnRJdGVtc1dpZHRocyhvcHRpb25zLCBwYXJhbXMpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHNldENvbnRlbnRJdGVtc1dpZHRocyhvcHRpb25zLCBwYXJhbXMpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBzZXRDb250ZW50SXRlbXNQb3NpdGlvbnMob3B0aW9ucylcbiAgICB9KTtcblxuICAgIHNldENvbnRlbnRJdGVtc0Rpc3BsYXkoe1xuICAgICAgY29udHJvbGxlcjogdGhpcyxcbiAgICAgIG5ld09yZGVyOiBuZXdPcmRlcixcbiAgICAgIHNldEZvck5ld09yZGVyOiBmYWxzZSxcbiAgICAgIGRpc3BsYXk6ICdub25lJ1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBoYW5kbGVyLFxuICAgIGdvdG9UYWIsXG4gICAgaW5pdGlhbGl6ZVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYWJzRmxvd0FuaW1hdGlvbjtcbn0se31dLDI1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGRlZmF1bHRBbmltID0gcmVxdWlyZSgnLi9kZWZhdWx0Jyk7XG5jb25zdCBsb2dpblNpZ251cFN3aXRjaCA9IHJlcXVpcmUoJy4vbG9naW5TaWdudXBTd2l0Y2gnKTtcbmNvbnN0IHRhYnNGbG93QW5pbWF0aW9uID0gcmVxdWlyZSgnLi9mbG93Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBkZWZhdWx0QW5pbSxcbiAgbG9naW5TaWdudXBTd2l0Y2gsXG4gIHRhYnNGbG93QW5pbWF0aW9uXG59O1xufSx7XCIuL2RlZmF1bHRcIjoyMyxcIi4vZmxvd1wiOjI0LFwiLi9sb2dpblNpZ251cFN3aXRjaFwiOjI2fV0sMjY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgbG9naW5TaWdudXBTd2l0Y2ggPSBmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gaGFuZGxlcihldnQpIHtcbiAgICBpZiAodGhpcy5iZWluZ0FuaW1hdGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuYmVpbmdBbmltYXRlZCA9IHRydWU7XG5cbiAgICBjb25zdCBvbGRISXRlbSA9IHRoaXMuYWN0aXZlLmhlYWRlckl0ZW07XG4gICAgY29uc3Qgb2xkQ0l0ZW0gPSB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbTtcbiAgICBjb25zdCBuZXdISXRlbSA9IGV2dC50YXJnZXQuY2xvc2VzdCgnLnRhYnMtaGVhZGVyLWl0ZW0nKTtcbiAgICBjb25zdCBvcmRlciA9IG5ld0hJdGVtLmRhdGFzZXQub3JkZXI7XG4gICAgY29uc3QgbmV3Q0l0ZW0gPSB0aGlzLmNvbnRlbnQuaXRlbXNbb3JkZXItMV07XG5cbiAgICBvbGRISXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1ISS1hY3RpdmUnKTtcbiAgICBuZXdISXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1ISS1hY3RpdmUnKTtcblxuICAgIG9sZENJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnVwLUNJLWFjdGl2ZScpO1xuICAgIG9sZENJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJLWhpZGluZycpO1xuICAgIG5ld0NJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnVwLUNJLWhpZGRlbicpO1xuICAgIG5ld0NJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJLWFjdGl2YXRpbmcnKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgb2xkQ0l0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnbG9naW5TaWdudXAtQ0ktaGlkaW5nJyk7XG4gICAgICBvbGRDSXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1oaWRkZW4nKTtcblxuICAgICAgbmV3Q0l0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnbG9naW5TaWdudXAtQ0ktYWN0aXZhdGluZycpO1xuICAgICAgbmV3Q0l0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktYWN0aXZlJyk7XG5cbiAgICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0gPSBuZXdISXRlbTtcbiAgICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtID0gbmV3Q0l0ZW07XG5cbiAgICAgIHRoaXMuYmVpbmdBbmltYXRlZCA9IGZhbHNlO1xuICAgIH0sIDUwMCk7XG4gIH1cblxuICBmdW5jdGlvbiBnb3RvVGFiKHRhYikge1xuICAgIGNvbnN0IG5ld0hlYWRlckl0ZW0gPSB0aGlzLmhlYWRlci5pdGVtc1t0YWJdO1xuICAgIGNvbnN0IG5ld0NvbnRlbnRJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW3RhYl07XG5cbiAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnVwLUhJLWFjdGl2ZScpO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnUtQ0ktYWN0aXZlJyk7XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktaGlkZGVuJyk7XG5cbiAgICBuZXdIZWFkZXJJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUhJLWFjdGl2ZScpO1xuICAgIG5ld0NvbnRlbnRJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnVwLUNJLWhpZGRlbicpO1xuICAgIG5ld0NvbnRlbnRJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJLWFjdGl2ZScpO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IG5ld0hlYWRlckl0ZW07XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSBuZXdDb250ZW50SXRlbTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUodGFiKSB7XG4gICAgdGhpcy5oZWFkZXIuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1oZWFkZXInKTtcbiAgICB0aGlzLmNvbnRlbnQuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1jb250ZW50Jyk7XG4gICAgdGhpcy5oZWFkZXIuaXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtSEknKSk7XG4gICAgdGhpcy5jb250ZW50Lml0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJJykpO1xuXG4gICAgY29uc3QgYWN0aXZlSGVhZGVySXRlbSA9IHRoaXMuaGVhZGVyLml0ZW1zW3RhYl07XG4gICAgY29uc3QgYWN0aXZlQ29udGVudEl0ZW0gPSB0aGlzLmNvbnRlbnQuaXRlbXNbdGFiXTtcbiAgICBjb25zdCBub25BY3RpdmVDb250ZW50SXRlbXMgPSB0aGlzLmNvbnRlbnQuaXRlbXMuZmlsdGVyKGl0ZW0gPT4gaXRlbSAhPT0gYWN0aXZlQ29udGVudEl0ZW0pO1xuXG4gICAgYWN0aXZlSGVhZGVySXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1ISS1hY3RpdmUnKTtcbiAgICBhY3RpdmVDb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1hY3RpdmUnKTtcblxuICAgIG5vbkFjdGl2ZUNvbnRlbnRJdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1oaWRkZW4nKSk7XG5cbiAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtID0gYWN0aXZlSGVhZGVySXRlbTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbSA9IGFjdGl2ZUNvbnRlbnRJdGVtO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBoYW5kbGVyLFxuICAgIGdvdG9UYWIsXG4gICAgaW5pdGlhbGl6ZVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBsb2dpblNpZ251cFN3aXRjaDtcbn0se31dLDI3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEhlYWRlckl0ZW0gPSByZXF1aXJlKCcuL0hlYWRlckl0ZW0nKTtcbmNvbnN0IGFuaW1zID0gcmVxdWlyZSgnLi9hbmltYXRpb25zJyk7XG5cbmNvbnN0IFRhYnMgPSBmdW5jdGlvbihvcHRzKSB7XG4gIGNvbnN0IGhlYWRlckl0ZW1zID1cbiAgICBvcHRzLmhlYWRlci5pdGVtcy5tYXAoaXRlbSA9PiBuZXcgSGVhZGVySXRlbShpdGVtKS5lbGVtZW50KSB8fCBbXTtcbiAgY29uc3QgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGhlYWRlci5jbGFzc05hbWUgPSAndGFicy1oZWFkZXIgJyArIG9wdHMuaGVhZGVyLmNsYXNzTmFtZTtcbiAgaGVhZGVySXRlbXMuZm9yRWFjaChpdGVtID0+IGhlYWRlci5hcHBlbmRDaGlsZChpdGVtKSk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBoZWFkZXJJdGVtcy5sZW5ndGg7IGkrKykge1xuICAgIGhlYWRlckl0ZW1zW2ldLmRhdGFzZXQub3JkZXIgPSBpKzE7XG4gIH1cblxuICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGNvbnRlbnQuY2xhc3NOYW1lID0gJ3RhYnMtY29udGVudCAnICsgKG9wdHMuY29udGVudC5jbGFzc05hbWUgfHwgJycpO1xuICBjb25zdCBjb250ZW50SXRlbXMgPSBvcHRzLmNvbnRlbnQuaXRlbXMgfHwgW107XG4gIGNvbnRlbnRJdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgndGFicy1jb250ZW50LWl0ZW0nKTtcbiAgICBjb250ZW50LmFwcGVuZENoaWxkKGl0ZW0pO1xuICB9KTtcblxuICBjb25zdCBhY3RpdmUgPSB7XG4gICAgaGVhZGVySXRlbTogbnVsbCxcbiAgICBjb250ZW50SXRlbTogbnVsbFxuICB9O1xuXG4gIGNvbnN0IGFuaW0gPSBhbmltc1tvcHRzLmFuaW1hdGlvbi5uYW1lXSA/XG4gICAgbmV3IGFuaW1zW29wdHMuYW5pbWF0aW9uLm5hbWVdIDpcbiAgICBuZXcgYW5pbXNbJ2RlZmF1bHRBbmltJ107XG5cbiAgY29uc3QgdGFicyA9IHtcbiAgICBoZWFkZXI6IHtcbiAgICAgIGVsZW1lbnQ6IGhlYWRlcixcbiAgICAgIGl0ZW1zOiBoZWFkZXJJdGVtc1xuICAgIH0sXG4gICAgY29udGVudDoge1xuICAgICAgZWxlbWVudDogY29udGVudCxcbiAgICAgIGl0ZW1zOiBjb250ZW50SXRlbXNcbiAgICB9LFxuICAgIGFjdGl2ZTogYWN0aXZlLFxuICAgIGdvdG9UYWI6IGFuaW0uZ290b1RhYixcbiAgICBpbWl0YXRlQ2xpY2tPblRhYjogZnVuY3Rpb24odGFiKSB7XG4gICAgICB0aGlzLmhlYWRlci5pdGVtc1t0YWJdLmNsaWNrKCk7XG4gICAgfVxuICB9O1xuICAgIFxuICBoZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgIGNvbnN0IGxpbmsgPSBldnQudGFyZ2V0O1xuICAgIGNvbnN0IHJlc3VsdCA9IGhlYWRlckl0ZW1zLmZpbmQoaXRlbSA9PiBpdGVtID09PSBsaW5rLmNsb3Nlc3QoJy50YWJzLWhlYWRlci1pdGVtJykpO1xuXG4gICAgaWYgKCFyZXN1bHQgfHwgcmVzdWx0ID09PSB0YWJzLmFjdGl2ZS5oZWFkZXJJdGVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgYW5pbS5oYW5kbGVyLmNhbGwodGFicywgZXZ0KTtcbiAgICB9XG4gIH0pO1xuXG4gIGFuaW0uaW5pdGlhbGl6ZS5jYWxsKHRhYnMsIG9wdHMuYW5pbWF0aW9uLmluaXRpYWxpemVyIC0gMSB8fCAwLCBvcHRzLmFuaW1hdGlvbi5wYXJhbXMpO1xuXG4gIHJldHVybiB0YWJzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYWJzO1xufSx7XCIuL0hlYWRlckl0ZW1cIjoyMixcIi4vYW5pbWF0aW9uc1wiOjI1fV0sMjg6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgY3JlYXRlRWxlbWVudEZyb21IVE1MID0gZnVuY3Rpb24oaHRtbCkge1xuICBjb25zdCB0ZW1wUGFyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHRlbXBQYXJlbnQuaW5uZXJIVE1MID0gaHRtbDtcbiAgcmV0dXJuIHRlbXBQYXJlbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG59O1xuXG5mdW5jdGlvbiBTaW5nbGV0b24oZm4pIHtcbiAgZnVuY3Rpb24gQ2xhc3MoKSB7XG4gICAgaWYgKENsYXNzLmluc3RhbmNlKSB7XG4gICAgICByZXR1cm4gQ2xhc3MuaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIENsYXNzLmluc3RhbmNlID0gZm4oKTtcbiAgfVxuXG4gIENsYXNzLmdldEluc3RhbmNlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIENsYXNzLmluc3RhbmNlIHx8IG5ldyBDbGFzcygpO1xuICB9O1xuXG4gIENsYXNzLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBDbGFzcy5pbnN0YW5jZSA9IG51bGw7XG4gIH07XG5cbiAgcmV0dXJuIENsYXNzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlRWxlbWVudEZyb21IVE1MLFxuICBTaW5nbGV0b25cbn07XG59LHt9XX0se30sWzFdKTtcbiJdLCJmaWxlIjoic291cmNlLmpzIn0=
