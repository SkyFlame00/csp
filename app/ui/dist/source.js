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

const verificationRoute = require('csp-app/routes/auth/verification');

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
        .addRoute('signup/verify', verificationRoute)
    
    router.navigate(path)
});
},{"csp-app/components/dashboard":2,"csp-app/components/main":4,"csp-app/components/main/rootComponent":5,"csp-app/components/start":10,"csp-app/components/test":14,"csp-app/libs/http":21,"csp-app/libs/router":23,"csp-app/routes/auth/verification":31}],2:[function(require,module,exports){
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
},{"./tpl":3,"csp-app/libs/http":21,"csp-app/libs/utilities":30}],3:[function(require,module,exports){
module.exports = data => /*html*/`
  <div class="cmp_dashboard">
    <h1>Dashboard Component</h1>
    <p>Your user id is ${data.id}</p>
  </div>
`;
},{}],4:[function(require,module,exports){
const MainController = self = {
  root: null,
  path: [],
  renderChain: function(components) {
    return components.reduce((accumulator, component) => {
      return Promise.all([accumulator, component])
        .then(components => {
          const accumulator = components[0];
          const component = components[1];

          accumulator.render(component.element);

          return component;
        });
    }, self.root);
  },
  initialize: function(rootInstance) {
    self.root = rootInstance;
    document.body.innerHTML = '';
    document.body.appendChild(rootInstance.reference);
  },
  render: function(components) {
    return self.renderChain(components);
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
},{"csp-app/libs/forms":19,"csp-app/libs/forms/validators":20}],7:[function(require,module,exports){
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
          console.log(response)
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
},{"csp-app/libs/forms":19,"csp-app/libs/forms/validators":20,"csp-app/libs/http":21}],8:[function(require,module,exports){
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
},{"csp-app/components/dashboard":2,"csp-app/components/main":4,"csp-app/libs/forms":19,"csp-app/libs/forms/validators":20,"csp-app/libs/http":21}],9:[function(require,module,exports){
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
},{"./start.tpl":11,"./tabs":12,"csp-app/libs/utilities":30}],11:[function(require,module,exports){
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
},{"../forms/LoginForm":8,"./signupTabs":13,"csp-app/libs/misc/button-effects/radialGradientOnHover":22,"csp-app/libs/tabs":29,"csp-app/libs/utilities":30}],13:[function(require,module,exports){
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
},{"../forms":9,"csp-app/libs/misc/button-effects/radialGradientOnHover":22,"csp-app/libs/tabs":29,"csp-app/libs/utilities":30}],14:[function(require,module,exports){
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
const http = require('csp-app/libs/http');
const template = require('./tpl');

const VerificationComponent = function() {
  const queryParams = new URLSearchParams(window.location.search);
  const userId = queryParams.get('id');
  const token = queryParams.get('token');
  const tplController = template();
  let errors = [];

  if (!userId) {
    errors.push('user id');
  }

  if (!token) {
    errors.push('token');
  }

  if (errors.length > 0) {
    const message = `You did not supply ${ errors.join(' and ') }`;
    tplController.parts.infoWrapper.textContent = message;
  }

  tplController.parts.spinnerWrapper.textContent = 'Loading...';

  const httpGet = http.get('auth/verify' + window.location.search)
  const spinnerPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      tplController.parts.spinnerWrapper.innerHTML = '';
      resolve();
    }, 3000);
  });

  Promise.all([httpGet, spinnerPromise])
    .then(arr => arr[0])
    .then((res) => {
      let message;

      if (res.success) {
        message = 'Your account has been successfully verified. You will be redirected to the dashboard in 3 seconds';
      }
      else {
        switch(res.error.type) {
          case 'no_user':
            message = 'User with the specified id does not exist';
            break;
          case 'verified':
            message = 'User has already been verified';
            break;
          case 'not_found':
            message = 'No verification token was found for this username or user with the supplied username does not exist';
            break;
          case 'no_match':
            message = 'Tokens do not match';
            break;
          case 'expired':
            message = 'Token has been expired';
            const button = document.createElement('button');
            button.textContent = 'Send verification token';
            tplController.parts.sendTokenButtonWrapper.appendChild(button);
            button.addEventListener('click', () => {
              http.get(`auth/verify/send-verification-token?id=${userId}`)
                .then((res) => {
                  let message;

                  if (res.success) {
                    message = 'You have been successfully sent new verification token';
                    tplController.parts.sendTokenInfoWrapper.textContent = message;
                  }
                  else {
                    tplController.parts.sendTokenInfoWrapper.textContent = res.error.message;
                  }
                })
              ;
            });
            break;
          default:
            message = res.error.message;
            break;
        }
      }

      tplController.parts.infoWrapper.textContent = message;
    })
  ;

  return {
    element: tplController.element
  };
};


module.exports = VerificationComponent;
},{"./tpl":16,"csp-app/libs/http":21}],16:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(data) {
  const html = /*html*/`
    <div class="cmp_verif">
      <div class="spinner-wr"></div>
      <div class="info-wr"></div>
      <div class="sendtoken-wr">
        <div class="sendtoken-info"></div>
        <div class="sendtoken-button-wr"></div>
      </div>
    </div>
  `;

  const element = createElementFromHTML(html);

  return {
    element: element,
    parts: {
      spinnerWrapper: element.querySelector('.spinner-wr'),
      infoWrapper: element.querySelector('.info-wr'),
      sendTokenInfoWrapper: element.querySelector('.sendtoken-info'),
      sendTokenButtonWrapper: element.querySelector('.sendtoken-button-wr')
    }
  };
}

module.exports = template;
},{"csp-app/libs/utilities":30}],17:[function(require,module,exports){
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
},{"./FormControl":18}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
const Form = require('./Form');

module.exports = Form;
},{"./Form":17}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
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

    // Each time along with the request we send auth_token if it exists
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
},{}],22:[function(require,module,exports){
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
},{"csp-app/libs/utilities":30}],23:[function(require,module,exports){
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
},{}],24:[function(require,module,exports){
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
},{}],25:[function(require,module,exports){
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
},{}],26:[function(require,module,exports){
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
},{}],27:[function(require,module,exports){
const defaultAnim = require('./default');
const loginSignupSwitch = require('./loginSignupSwitch');
const tabsFlowAnimation = require('./flow');

module.exports = {
  defaultAnim,
  loginSignupSwitch,
  tabsFlowAnimation
};
},{"./default":25,"./flow":26,"./loginSignupSwitch":28}],28:[function(require,module,exports){
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
},{}],29:[function(require,module,exports){
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
},{"./HeaderItem":24,"./animations":27}],30:[function(require,module,exports){
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
},{}],31:[function(require,module,exports){
const {render} = require('csp-app/components/main');
const VerificationComponent = require('csp-app/groups/auth/verification');

function verification() {
  render([new VerificationComponent()]);
}

module.exports = verification;
},{"csp-app/components/main":4,"csp-app/groups/auth/verification":15}]},{},[1]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzb3VyY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBSb290ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL21haW4vcm9vdENvbXBvbmVudCcpO1xuY29uc3QgRGFzaGJvYXJkID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL2Rhc2hib2FyZCcpO1xuY29uc3QgTWFpbkNvbnRyb2xsZXIgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvbWFpbicpO1xuXG5jb25zdCBSb3V0ZXIgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvcm91dGVyJylcbmNvbnN0IFN0YXJ0ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3N0YXJ0Jyk7XG5jb25zdCBUZXN0ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Rlc3QnKVxuXG5jb25zdCByb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcblxuaHR0cC5jb25maWd1cmUoeyBsb2NhdGlvbjogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcgfSk7XG5cbmNvbnN0IHZlcmlmaWNhdGlvblJvdXRlID0gcmVxdWlyZSgnY3NwLWFwcC9yb3V0ZXMvYXV0aC92ZXJpZmljYXRpb24nKTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgIGNvbnN0IGxpbmsgPSBldnQudGFyZ2V0LmNsb3Nlc3QoJ2EnKTtcblxuICAgIGlmIChsaW5rICYmIGxpbmsuZGF0YXNldC5yb3V0ZSkge1xuICAgICAgICByb3V0ZXIubmF2aWdhdGUobGluay5kYXRhc2V0LnJvdXRlKTtcbiAgICB9XG59KTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgZXZ0ID0+IHtcbiAgICBjb25zb2xlLmxvZygncGFnZSBjaGFuZ2VkOiAnLCBkb2N1bWVudC5sb2NhdGlvbik7XG4gICAgY29uc29sZS5sb2coZXZ0KTtcbiAgICByb3V0ZXIubmF2aWdhdGUoZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUpO1xufSk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbihldnQpIHtcbiAgICBsZXQgcGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgICBjb25zdCByb290SW5zdGFuY2UgPSBSb290LmNyZWF0ZSgpO1xuICAgIE1haW5Db250cm9sbGVyLmluaXRpYWxpemUocm9vdEluc3RhbmNlKTtcblxuICAgIHJvdXRlclxuICAgICAgICAuYWRkUm91dGUoJy8nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIE1haW5Db250cm9sbGVyLnJlbmRlckNoYWluKFtuZXcgU3RhcnQoKV0pXG4gICAgICAgIH0pXG4gICAgICAgIC5hZGRSb3V0ZSgnZGFzaGJvYXJkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBNYWluQ29udHJvbGxlci5yZW5kZXJDaGFpbihbVGVzdF0pXG4gICAgICAgIH0pXG4gICAgICAgIC5hZGRSb3V0ZSgnbG9naW4nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICB9KVxuICAgICAgICAuYWRkUm91dGUoJ3NpZ251cC92ZXJpZnknLCB2ZXJpZmljYXRpb25Sb3V0ZSlcbiAgICBcbiAgICByb3V0ZXIubmF2aWdhdGUocGF0aClcbn0pO1xufSx7XCJjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkXCI6MixcImNzcC1hcHAvY29tcG9uZW50cy9tYWluXCI6NCxcImNzcC1hcHAvY29tcG9uZW50cy9tYWluL3Jvb3RDb21wb25lbnRcIjo1LFwiY3NwLWFwcC9jb21wb25lbnRzL3N0YXJ0XCI6MTAsXCJjc3AtYXBwL2NvbXBvbmVudHMvdGVzdFwiOjE0LFwiY3NwLWFwcC9saWJzL2h0dHBcIjoyMSxcImNzcC1hcHAvbGlicy9yb3V0ZXJcIjoyMyxcImNzcC1hcHAvcm91dGVzL2F1dGgvdmVyaWZpY2F0aW9uXCI6MzF9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvaHR0cCcpO1xuY29uc3QgdGVtcGxhdGUgPSByZXF1aXJlKCcuL3RwbCcpO1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmNvbnN0IERhc2hib2FyZCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gaHR0cC5nZXQoJy91c2Vycy9nZXRVc2VyRGF0YScpXG4gICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgY29uc3QgaWQgPSByZXMuZGF0YS51c2VyLmlkO1xuICAgICAgY29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCh0ZW1wbGF0ZSh7IGlkOiBpZCB9KSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGVsZW1lbnQ6IGVsZW1lbnRcbiAgICAgIH07XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhc2hib2FyZDtcbn0se1wiLi90cGxcIjozLFwiY3NwLWFwcC9saWJzL2h0dHBcIjoyMSxcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjozMH1dLDM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xubW9kdWxlLmV4cG9ydHMgPSBkYXRhID0+IC8qaHRtbCovYFxuICA8ZGl2IGNsYXNzPVwiY21wX2Rhc2hib2FyZFwiPlxuICAgIDxoMT5EYXNoYm9hcmQgQ29tcG9uZW50PC9oMT5cbiAgICA8cD5Zb3VyIHVzZXIgaWQgaXMgJHtkYXRhLmlkfTwvcD5cbiAgPC9kaXY+XG5gO1xufSx7fV0sNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBNYWluQ29udHJvbGxlciA9IHNlbGYgPSB7XG4gIHJvb3Q6IG51bGwsXG4gIHBhdGg6IFtdLFxuICByZW5kZXJDaGFpbjogZnVuY3Rpb24oY29tcG9uZW50cykge1xuICAgIHJldHVybiBjb21wb25lbnRzLnJlZHVjZSgoYWNjdW11bGF0b3IsIGNvbXBvbmVudCkgPT4ge1xuICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFthY2N1bXVsYXRvciwgY29tcG9uZW50XSlcbiAgICAgICAgLnRoZW4oY29tcG9uZW50cyA9PiB7XG4gICAgICAgICAgY29uc3QgYWNjdW11bGF0b3IgPSBjb21wb25lbnRzWzBdO1xuICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGNvbXBvbmVudHNbMV07XG5cbiAgICAgICAgICBhY2N1bXVsYXRvci5yZW5kZXIoY29tcG9uZW50LmVsZW1lbnQpO1xuXG4gICAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICAgICAgfSk7XG4gICAgfSwgc2VsZi5yb290KTtcbiAgfSxcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ocm9vdEluc3RhbmNlKSB7XG4gICAgc2VsZi5yb290ID0gcm9vdEluc3RhbmNlO1xuICAgIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gJyc7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChyb290SW5zdGFuY2UucmVmZXJlbmNlKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbihjb21wb25lbnRzKSB7XG4gICAgcmV0dXJuIHNlbGYucmVuZGVyQ2hhaW4oY29tcG9uZW50cyk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFpbkNvbnRyb2xsZXI7XG59LHt9XSw1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IFJvb3QgPSB7XG4gICAgY29tcG9uZW50TmFtZTogJ2FwcCcsXG4gICAgaHRtbDogYDxkaXYgaWQ9XCJhcHBcIj48L2Rpdj5gLFxuICAgIGlkZW50aWZpZXI6ICcjYXBwJyxcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBDb25zaWRlciByZWltcGxlbWVudGluZyB3aXRoIEhUTUw1IHRlbXBsYXRlIGZlYXR1cmUgaW5zdGVhZCBqdXN0IHV0aWxpemluZyBkaXZcbiAgICAgICAgY29uc3QgdG1wRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0bXBFbGVtLmlubmVySFRNTCA9IHRoaXMuaHRtbDtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRtcEVsZW0uZmlyc3RDaGlsZDtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVmZXJlbmNlOiBlbGVtZW50LFxuICAgICAgICAgICAgcm91dGVyT3V0bGV0OiBlbGVtZW50LFxuICAgICAgICAgICAgY29tcG9uZW50TmFtZTogdGhpcy5jb21wb25lbnROYW1lLFxuICAgICAgICAgICAgc3RhdGU6IHt9LFxuICAgICAgICAgICAgYWN0aW9uczogKGZ1bmN0aW9uKHJvdXRlck91dGxldCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWQ6IGZ1bmN0aW9uKGZyYWdtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKGVsZW1lbnQpLFxuICAgICAgICAgICAgcmVuZGVyOiAoZnVuY3Rpb24ocm91dGVyT3V0bGV0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKERPTVRyZWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcm91dGVyT3V0bGV0LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuYXBwZW5kQ2hpbGQoRE9NVHJlZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoZWxlbWVudClcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUm9vdDtcbn0se31dLDY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgRm9ybSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3JtcycpO1xuY29uc3Qge21pbkxlbmd0aCwgbWF4TGVuZ3RoLCBzdGFydHNXaXRoTnVtYmVyfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3Jtcy92YWxpZGF0b3JzJyk7XG5cbmNvbnN0IHVzZXJuYW1lID0ge1xuICBrZXlOYW1lOiAndXNlcm5hbWUnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXVzZXJuYW1lJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICd0ZXh0J30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnVXNlcm5hbWUnfVxuICBdLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdtYXhMZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWF4TGVuZ3RoXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnc3RhcnRzV2l0aE51bWJlcicsXG4gICAgICBoYW5kbGVyOiBzdGFydHNXaXRoTnVtYmVyXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBwYXNzd29yZCA9IHtcbiAga2V5TmFtZTogJ3Bhc3N3b3JkJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1wYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAncGFzc3dvcmQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdQYXNzd29yZCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGNvbmZpcm1QYXNzd29yZCA9IHtcbiAga2V5TmFtZTogJ2NvbmZpcm1QYXNzd29yZCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tY29uZmlybVBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICdwYXNzd29yZCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ0NvbmZpcm0gcGFzc3dvcmQnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBlbWFpbCA9IHtcbiAga2V5TmFtZTogJ2VtYWlsJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1wYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAndGV4dCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ0UtbWFpbCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGNsaWVudEZvcm0gPSBuZXcgRm9ybSh7XG4gIHZhbGlkYXRvcnM6IFtdLFxuICBzdWJtaXQ6IHtcbiAgICBoYW5kbGVyOiBmdW5jdGlvbih2YWx1ZXMsIGV2dCkge1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjb25zb2xlLmxvZygnRm9ybSBpcyBjbGVhbicpO1xuICAgIH1cbiAgfSxcbiAgY29udHJvbHM6IFtcbiAgICB1c2VybmFtZSxcbiAgICBwYXNzd29yZCxcbiAgICBjb25maXJtUGFzc3dvcmQsXG4gICAgZW1haWxcbiAgXVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY2xpZW50Rm9ybTtcbn0se1wiY3NwLWFwcC9saWJzL2Zvcm1zXCI6MTksXCJjc3AtYXBwL2xpYnMvZm9ybXMvdmFsaWRhdG9yc1wiOjIwfV0sNzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBGb3JtID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2Zvcm1zJyk7XG5jb25zdCB7bWluTGVuZ3RoLCBtYXhMZW5ndGgsIHN0YXJ0c1dpdGhOdW1iZXJ9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2Zvcm1zL3ZhbGlkYXRvcnMnKTtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvaHR0cCcpXG5cbmNvbnN0IHVzZXJuYW1lID0ge1xuICBrZXlOYW1lOiAndXNlcm5hbWUnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXVzZXJuYW1lJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICd0ZXh0J30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnVXNlcm5hbWUnfVxuICBdLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdtYXhMZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWF4TGVuZ3RoXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnc3RhcnRzV2l0aE51bWJlcicsXG4gICAgICBoYW5kbGVyOiBzdGFydHNXaXRoTnVtYmVyXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBwYXNzd29yZCA9IHtcbiAga2V5TmFtZTogJ3Bhc3N3b3JkJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1wYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAncGFzc3dvcmQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdQYXNzd29yZCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGNvbmZpcm1QYXNzd29yZCA9IHtcbiAga2V5TmFtZTogJ2NvbmZpcm1QYXNzd29yZCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tY29uZmlybVBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICdwYXNzd29yZCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ0NvbmZpcm0gcGFzc3dvcmQnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBlbWFpbCA9IHtcbiAga2V5TmFtZTogJ2VtYWlsJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1wYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAndGV4dCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ0UtbWFpbCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IG9yZyA9IHtcbiAga2V5TmFtZTogJ29yZycsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tcGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3RleHQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdZb3VyIG9yZ2FuaXphdGlvbid9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGV4ZWNGb3JtID0gbmV3IEZvcm0oe1xuICB2YWxpZGF0b3JzOiBbXSxcbiAgc3VibWl0OiB7XG4gICAgaGFuZGxlcjogZnVuY3Rpb24odmFsdWVzLCBldnQpIHtcbiAgICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICAgIHVzZXJuYW1lOiB2YWx1ZXMudXNlcm5hbWUsXG4gICAgICAgIGVtYWlsOiB2YWx1ZXMuZW1haWwsXG4gICAgICAgIHBhc3N3b3JkOiB2YWx1ZXMucGFzc3dvcmRcbiAgICAgIH07XG5cbiAgICAgIGh0dHAucG9zdCgnYXV0aC9zaWdudXAvZXhlYycsIGJvZHkpXG4gICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSlcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcilcbiAgICAgICAgfSlcbiAgICAgIDtcbiAgICB9XG4gIH0sXG4gIGNvbnRyb2xzOiBbXG4gICAgdXNlcm5hbWUsXG4gICAgcGFzc3dvcmQsXG4gICAgY29uZmlybVBhc3N3b3JkLFxuICAgIGVtYWlsLFxuICAgIG9yZ1xuICBdXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBleGVjRm9ybTtcbn0se1wiY3NwLWFwcC9saWJzL2Zvcm1zXCI6MTksXCJjc3AtYXBwL2xpYnMvZm9ybXMvdmFsaWRhdG9yc1wiOjIwLFwiY3NwLWFwcC9saWJzL2h0dHBcIjoyMX1dLDg6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgRm9ybSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3JtcycpO1xuY29uc3Qge21pbkxlbmd0aCwgbWF4TGVuZ3RoLCBzdGFydHNXaXRoTnVtYmVyfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3Jtcy92YWxpZGF0b3JzJyk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IE1haW5Db250cm9sbGVyID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL21haW4nKTtcbmNvbnN0IERhc2hib2FyZCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmQnKTtcblxuY29uc3QgdXNlcm5hbWUgPSB7XG4gIGtleU5hbWU6ICd1c2VybmFtZScsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tdXNlcm5hbWUnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3RleHQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdVc2VybmFtZSd9XG4gIF0sXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ21heExlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtYXhMZW5ndGhcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdzdGFydHNXaXRoTnVtYmVyJyxcbiAgICAgIGhhbmRsZXI6IHN0YXJ0c1dpdGhOdW1iZXJcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IHBhc3N3b3JkID0ge1xuICBrZXlOYW1lOiAncGFzc3dvcmQnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICdwYXNzd29yZCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1Bhc3N3b3JkJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgbG9naW5Gb3JtID0gbmV3IEZvcm0oe1xuICB2YWxpZGF0b3JzOiBbXSxcbiAgc3VibWl0OiB7XG4gICAgaGFuZGxlcjogZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICBjb25zdCB7dXNlcm5hbWUsIHBhc3N3b3JkfSA9IHZhbHVlcztcbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICB9O1xuXG4gICAgICBodHRwLnBvc3QoJ2F1dGgvbG9naW4nLCBkYXRhKVxuICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgIGlmICghcmVzLnN1Y2Nlc3MpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzLmVycm9yLm1lc3NhZ2UpO1xuXG4gICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhdXRoX3Rva2VuJywgcmVzLmRhdGEudG9rZW4pO1xuICAgICAgICAgIE1haW5Db250cm9sbGVyLnJlbmRlcihbbmV3IERhc2hib2FyZCgpXSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyLm1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIGNvbnRyb2xzOiBbXG4gICAgdXNlcm5hbWUsXG4gICAgcGFzc3dvcmRcbiAgXVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbG9naW5Gb3JtO1xufSx7XCJjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkXCI6MixcImNzcC1hcHAvY29tcG9uZW50cy9tYWluXCI6NCxcImNzcC1hcHAvbGlicy9mb3Jtc1wiOjE5LFwiY3NwLWFwcC9saWJzL2Zvcm1zL3ZhbGlkYXRvcnNcIjoyMCxcImNzcC1hcHAvbGlicy9odHRwXCI6MjF9XSw5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGxvZ2luRm9ybSA9IHJlcXVpcmUoJy4vTG9naW5Gb3JtJyk7XG5jb25zdCBjbGllbnRGb3JtID0gcmVxdWlyZSgnLi9DbGllbnRGb3JtJyk7XG5jb25zdCBleGVjRm9ybSA9IHJlcXVpcmUoJy4vRXhlY0Zvcm0nKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvZ2luRm9ybSxcbiAgY2xpZW50Rm9ybSxcbiAgZXhlY0Zvcm1cbn07XG59LHtcIi4vQ2xpZW50Rm9ybVwiOjYsXCIuL0V4ZWNGb3JtXCI6NyxcIi4vTG9naW5Gb3JtXCI6OH1dLDEwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHRlbXBsYXRlID0gcmVxdWlyZSgnLi9zdGFydC50cGwnKTtcbmNvbnN0IHRhYnMgPSByZXF1aXJlKCcuL3RhYnMnKTtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUwsIFNpbmdsZXRvbn0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmNvbnN0IFN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwodGVtcGxhdGUoKSk7XG4gIGNvbnN0IHRhYnNXcmFwcGVyID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc3RhcnQtdGFicycpO1xuICB0YWJzV3JhcHBlci5hcHBlbmRDaGlsZCh0YWJzLmhlYWRlci5lbGVtZW50KTtcbiAgdGFic1dyYXBwZXIuYXBwZW5kQ2hpbGQodGFicy5jb250ZW50LmVsZW1lbnQpO1xuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudDogZWxlbWVudFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaW5nbGV0b24oU3RhcnQpO1xufSx7XCIuL3N0YXJ0LnRwbFwiOjExLFwiLi90YWJzXCI6MTIsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6MzB9XSwxMTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5mdW5jdGlvbiB0ZW1wbGF0ZShkYXRhKSB7XG4gIHJldHVybiAvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwiY21wX3N0YXJ0XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwid3JhcHBlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImxvZ28tYmxvY2tcIj5cbiAgICAgICAgICAgIDxoMT5XZWxjb21lIHRvIENvbnN1bHRpbmcgU2VydmljZXMgUGxhdGZvcm08L2gxPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIFxuICAgICAgICAgIDxhIGRhdGEtcm91dGU9XCIvXCI+SG9tZTwvYT5cbiAgICAgICAgICA8YSBkYXRhLXJvdXRlPVwiL2Rhc2hib2FyZFwiPkRhc2hib2FyZDwvYT5cblxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGFydC10YWJzXCI+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG59LHt9XSwxMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBUYWJzID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3RhYnMnKTtcbmNvbnN0IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKS5jcmVhdGVFbGVtZW50RnJvbUhUTUw7XG5jb25zdCBzaWdudXBUYWJzID0gcmVxdWlyZSgnLi9zaWdudXBUYWJzJyk7XG5jb25zdCBsb2dpbkZvcm0gPSByZXF1aXJlKCcuLi9mb3Jtcy9Mb2dpbkZvcm0nKTtcbmNvbnN0IHJhZGlhbEdyYWRpZW50T25Ib3ZlciA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9taXNjL2J1dHRvbi1lZmZlY3RzL3JhZGlhbEdyYWRpZW50T25Ib3ZlcicpO1xuXG5jb25zdCBsb2dpbkJsb2NrID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICA8ZGl2IGNsYXNzPVwibG9naW4tYmxvY2tcIj5cbiAgICA8ZGl2IGNsYXNzPVwiaGVhZGVyXCI+PGgyPkxvZyBpbjwvaDI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImZvcm1cIj48L2Rpdj5cbiAgPC9kaXY+XG5gKTtcblxuY29uc3Qgc2lnbnVwQmxvY2sgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJzaWdudXAtYmxvY2tcIj48L2Rpdj5cbmApO1xuXG5jb25zdCBzdGFydFRhYnMgPSBuZXcgVGFicyh7XG4gIGhlYWRlcjoge1xuICAgIGNsYXNzTmFtZTogJ21haW4tYWN0aW9ucycsXG4gICAgaXRlbXM6IFtcbiAgICAgIHt0aXRsZTogJ0xvZyBpbicsIHRhZzogJ2J1dHRvbid9LFxuICAgICAge3RpdGxlOiAnU2lnbiB1cCcsIHRhZzogJ2J1dHRvbid9XG4gICAgXVxuICB9LFxuICBjb250ZW50OiB7XG4gICAgaXRlbXM6IFtcbiAgICAgIGxvZ2luQmxvY2ssXG4gICAgICBzaWdudXBCbG9ja1xuICAgIF1cbiAgfSxcbiAgYW5pbWF0aW9uOiB7XG4gICAgbmFtZTogJ2xvZ2luU2lnbnVwU3dpdGNoJ1xuICB9XG59KTtcblxuY29uc3QgY29udGVudFdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbmNvbnRlbnRXcmFwcGVyLmNsYXNzTGlzdC5hZGQoJ2Zvcm1zJyk7XG5jb250ZW50V3JhcHBlci5hcHBlbmRDaGlsZChzaWdudXBUYWJzLmNvbnRlbnQuZWxlbWVudCk7XG5cbnN0YXJ0VGFicy5jb250ZW50Lml0ZW1zWzBdLnF1ZXJ5U2VsZWN0b3IoJy5sb2dpbi1ibG9jayAuZm9ybScpLmFwcGVuZENoaWxkKGxvZ2luRm9ybS5yZWYpO1xuc3RhcnRUYWJzLmNvbnRlbnQuaXRlbXNbMV0uYXBwZW5kQ2hpbGQoc2lnbnVwVGFicy5oZWFkZXIuZWxlbWVudCk7XG5zdGFydFRhYnMuY29udGVudC5pdGVtc1sxXS5hcHBlbmRDaGlsZChjb250ZW50V3JhcHBlcik7XG5cbnN0YXJ0VGFicy5oZWFkZXIuaXRlbXMuZm9yRWFjaChpdGVtID0+IHJhZGlhbEdyYWRpZW50T25Ib3ZlcihpdGVtLCB7cGFkZGluZzogWzEwLCAxNl19KSk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhcnRUYWJzO1xufSx7XCIuLi9mb3Jtcy9Mb2dpbkZvcm1cIjo4LFwiLi9zaWdudXBUYWJzXCI6MTMsXCJjc3AtYXBwL2xpYnMvbWlzYy9idXR0b24tZWZmZWN0cy9yYWRpYWxHcmFkaWVudE9uSG92ZXJcIjoyMixcImNzcC1hcHAvbGlicy90YWJzXCI6MjksXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6MzB9XSwxMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBUYWJzID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3RhYnMnKTtcbmNvbnN0IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKS5jcmVhdGVFbGVtZW50RnJvbUhUTUw7XG5jb25zdCB7Y2xpZW50Rm9ybSwgZXhlY0Zvcm19ID0gcmVxdWlyZSgnLi4vZm9ybXMnKTtcbmNvbnN0IHJhZGlhbEdyYWRpZW50T25Ib3ZlciA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9taXNjL2J1dHRvbi1lZmZlY3RzL3JhZGlhbEdyYWRpZW50T25Ib3ZlcicpO1xuXG5jb25zdCBjbGllbnRGb3JtQmxvY2sgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJjbGllbnQtZm9ybSBmb3JtXCI+PC9kaXY+XG5gKTtcblxuY29uc3QgZXhlY0Zvcm1CbG9jayA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCgvKmh0bWwqL2BcbiAgPGRpdiBjbGFzcz1cImV4ZWMtZm9ybSBmb3JtXCI+PC9kaXY+XG5gKTtcblxuY29uc3Qgc2lnbnVwVGFicyA9IG5ldyBUYWJzKHtcbiAgaGVhZGVyOiB7XG4gICAgY2xhc3NOYW1lOiAnYWN0aW9ucyBjbGVhcmZpeCcsXG4gICAgaXRlbXM6IFtcbiAgICAgIHt0aXRsZTogJ1NpZ24gdXAgYXMgY2xpZW50JywgdGFnOiAnYnV0dG9uJ30sXG4gICAgICB7dGl0bGU6ICdTaWduIHVwIGFzIGV4ZWN1dG9yJywgdGFnOiAnYnV0dG9uJ31cbiAgICBdXG4gIH0sXG4gIGNvbnRlbnQ6IHtcbiAgICBpdGVtczogW1xuICAgICAgY2xpZW50Rm9ybUJsb2NrLFxuICAgICAgZXhlY0Zvcm1CbG9jayxcbiAgICBdXG4gIH0sXG4gIGFuaW1hdGlvbjoge1xuICAgIG5hbWU6ICd0YWJzRmxvd0FuaW1hdGlvbicsXG4gICAgcGFyYW1zOiB7cGFkZGluZzogMTUsIHNwZWVkOiA4NTB9XG4gIH1cbn0pO1xuXG5zaWdudXBUYWJzLmNvbnRlbnQuaXRlbXNbMF0uYXBwZW5kQ2hpbGQoY2xpZW50Rm9ybS5yZWYpO1xuc2lnbnVwVGFicy5jb250ZW50Lml0ZW1zWzFdLmFwcGVuZENoaWxkKGV4ZWNGb3JtLnJlZik7XG5cbnNpZ251cFRhYnMuaGVhZGVyLml0ZW1zLmZvckVhY2goaXRlbSA9PiByYWRpYWxHcmFkaWVudE9uSG92ZXIoaXRlbSwge3BhZGRpbmc6IDE1fSkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNpZ251cFRhYnM7XG59LHtcIi4uL2Zvcm1zXCI6OSxcImNzcC1hcHAvbGlicy9taXNjL2J1dHRvbi1lZmZlY3RzL3JhZGlhbEdyYWRpZW50T25Ib3ZlclwiOjIyLFwiY3NwLWFwcC9saWJzL3RhYnNcIjoyOSxcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjozMH1dLDE0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IFRlc3QgPSB7XG4gICAgaHRtbDogYFxuICAgICAgICA8ZGl2IGlkPVwidGVzdFwiPlxuICAgICAgICAgICAgPGgxPlRoaXMgaXMgVGVzdCBjb21wb25lbnQ8L2gxPlxuICAgICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGluc3RhbnRpYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgdGVtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0ZW1wLmlubmVySFRNTCA9IHRoaXMuaHRtbDtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRlbXAuZmlyc3RFbGVtZW50Q2hpbGRcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbihET01UcmVlKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKERPTVRyZWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUZXN0Lmluc3RhbnRpYXRlKCk7XG59LHt9XSwxNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IHRlbXBsYXRlID0gcmVxdWlyZSgnLi90cGwnKTtcblxuY29uc3QgVmVyaWZpY2F0aW9uQ29tcG9uZW50ID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IHF1ZXJ5UGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgY29uc3QgdXNlcklkID0gcXVlcnlQYXJhbXMuZ2V0KCdpZCcpO1xuICBjb25zdCB0b2tlbiA9IHF1ZXJ5UGFyYW1zLmdldCgndG9rZW4nKTtcbiAgY29uc3QgdHBsQ29udHJvbGxlciA9IHRlbXBsYXRlKCk7XG4gIGxldCBlcnJvcnMgPSBbXTtcblxuICBpZiAoIXVzZXJJZCkge1xuICAgIGVycm9ycy5wdXNoKCd1c2VyIGlkJyk7XG4gIH1cblxuICBpZiAoIXRva2VuKSB7XG4gICAgZXJyb3JzLnB1c2goJ3Rva2VuJyk7XG4gIH1cblxuICBpZiAoZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBtZXNzYWdlID0gYFlvdSBkaWQgbm90IHN1cHBseSAkeyBlcnJvcnMuam9pbignIGFuZCAnKSB9YDtcbiAgICB0cGxDb250cm9sbGVyLnBhcnRzLmluZm9XcmFwcGVyLnRleHRDb250ZW50ID0gbWVzc2FnZTtcbiAgfVxuXG4gIHRwbENvbnRyb2xsZXIucGFydHMuc3Bpbm5lcldyYXBwZXIudGV4dENvbnRlbnQgPSAnTG9hZGluZy4uLic7XG5cbiAgY29uc3QgaHR0cEdldCA9IGh0dHAuZ2V0KCdhdXRoL3ZlcmlmeScgKyB3aW5kb3cubG9jYXRpb24uc2VhcmNoKVxuICBjb25zdCBzcGlubmVyUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRwbENvbnRyb2xsZXIucGFydHMuc3Bpbm5lcldyYXBwZXIuaW5uZXJIVE1MID0gJyc7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSwgMzAwMCk7XG4gIH0pO1xuXG4gIFByb21pc2UuYWxsKFtodHRwR2V0LCBzcGlubmVyUHJvbWlzZV0pXG4gICAgLnRoZW4oYXJyID0+IGFyclswXSlcbiAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICBsZXQgbWVzc2FnZTtcblxuICAgICAgaWYgKHJlcy5zdWNjZXNzKSB7XG4gICAgICAgIG1lc3NhZ2UgPSAnWW91ciBhY2NvdW50IGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSB2ZXJpZmllZC4gWW91IHdpbGwgYmUgcmVkaXJlY3RlZCB0byB0aGUgZGFzaGJvYXJkIGluIDMgc2Vjb25kcyc7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc3dpdGNoKHJlcy5lcnJvci50eXBlKSB7XG4gICAgICAgICAgY2FzZSAnbm9fdXNlcic6XG4gICAgICAgICAgICBtZXNzYWdlID0gJ1VzZXIgd2l0aCB0aGUgc3BlY2lmaWVkIGlkIGRvZXMgbm90IGV4aXN0JztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3ZlcmlmaWVkJzpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSAnVXNlciBoYXMgYWxyZWFkeSBiZWVuIHZlcmlmaWVkJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ25vdF9mb3VuZCc6XG4gICAgICAgICAgICBtZXNzYWdlID0gJ05vIHZlcmlmaWNhdGlvbiB0b2tlbiB3YXMgZm91bmQgZm9yIHRoaXMgdXNlcm5hbWUgb3IgdXNlciB3aXRoIHRoZSBzdXBwbGllZCB1c2VybmFtZSBkb2VzIG5vdCBleGlzdCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdub19tYXRjaCc6XG4gICAgICAgICAgICBtZXNzYWdlID0gJ1Rva2VucyBkbyBub3QgbWF0Y2gnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZXhwaXJlZCc6XG4gICAgICAgICAgICBtZXNzYWdlID0gJ1Rva2VuIGhhcyBiZWVuIGV4cGlyZWQnO1xuICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAnU2VuZCB2ZXJpZmljYXRpb24gdG9rZW4nO1xuICAgICAgICAgICAgdHBsQ29udHJvbGxlci5wYXJ0cy5zZW5kVG9rZW5CdXR0b25XcmFwcGVyLmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGh0dHAuZ2V0KGBhdXRoL3ZlcmlmeS9zZW5kLXZlcmlmaWNhdGlvbi10b2tlbj9pZD0ke3VzZXJJZH1gKVxuICAgICAgICAgICAgICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlO1xuXG4gICAgICAgICAgICAgICAgICBpZiAocmVzLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9ICdZb3UgaGF2ZSBiZWVuIHN1Y2Nlc3NmdWxseSBzZW50IG5ldyB2ZXJpZmljYXRpb24gdG9rZW4nO1xuICAgICAgICAgICAgICAgICAgICB0cGxDb250cm9sbGVyLnBhcnRzLnNlbmRUb2tlbkluZm9XcmFwcGVyLnRleHRDb250ZW50ID0gbWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0cGxDb250cm9sbGVyLnBhcnRzLnNlbmRUb2tlbkluZm9XcmFwcGVyLnRleHRDb250ZW50ID0gcmVzLmVycm9yLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbWVzc2FnZSA9IHJlcy5lcnJvci5tZXNzYWdlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdHBsQ29udHJvbGxlci5wYXJ0cy5pbmZvV3JhcHBlci50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gICAgfSlcbiAgO1xuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudDogdHBsQ29udHJvbGxlci5lbGVtZW50XG4gIH07XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVmVyaWZpY2F0aW9uQ29tcG9uZW50O1xufSx7XCIuL3RwbFwiOjE2LFwiY3NwLWFwcC9saWJzL2h0dHBcIjoyMX1dLDE2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiB0ZW1wbGF0ZShkYXRhKSB7XG4gIGNvbnN0IGh0bWwgPSAvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwiY21wX3ZlcmlmXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwic3Bpbm5lci13clwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImluZm8td3JcIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzZW5kdG9rZW4td3JcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNlbmR0b2tlbi1pbmZvXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZW5kdG9rZW4tYnV0dG9uLXdyXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKGh0bWwpO1xuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudDogZWxlbWVudCxcbiAgICBwYXJ0czoge1xuICAgICAgc3Bpbm5lcldyYXBwZXI6IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNwaW5uZXItd3InKSxcbiAgICAgIGluZm9XcmFwcGVyOiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbmZvLXdyJyksXG4gICAgICBzZW5kVG9rZW5JbmZvV3JhcHBlcjogZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2VuZHRva2VuLWluZm8nKSxcbiAgICAgIHNlbmRUb2tlbkJ1dHRvbldyYXBwZXI6IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNlbmR0b2tlbi1idXR0b24td3InKVxuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcbn0se1wiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjMwfV0sMTc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgRm9ybUNvbnRyb2wgPSByZXF1aXJlKCcuL0Zvcm1Db250cm9sJyk7XG5cbmNvbnN0IHZhbGlkYXRlID0gZnVuY3Rpb24odmFsaWRhdG9yLCBmb3JtKSB7XG4gIGxldCBpdGVtcyA9IGZvcm0uZXJyb3JzLml0ZW1zO1xuICBsZXQgdmFsdWVzID0gdmFsaWRhdG9yLmNvbnRyb2xzLm1hcChjdHJsID0+IGN0cmwudmFsdWUpO1xuICBsZXQgcmVzdWx0ID0gdmFsaWRhdG9yLmhhbmRsZXIodmFsdWVzKTtcbiAgaWYgKCFyZXN1bHQudmFsaWQgJiYgIWl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IHJlc3VsdC5tZXNzYWdlO1xuICAgIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSA9IHtcbiAgICAgIHJlZjogZWxlbWVudFxuICAgIH07XG4gICAgZm9ybS5lcnJvcnMucmVmLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAocmVzdWx0LnZhbGlkICYmIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXS5yZWYucmVtb3ZlKCk7XG4gICAgaXRlbXNbdmFsaWRhdG9yLm5hbWVdID0gbnVsbDtcbiAgfVxufTtcblxuY29uc3QgRm9ybSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgY29uc3QgZm9ybUNvbnRyb2xzID0gb3B0aW9ucy5jb250cm9scy5tYXAoY3RybCA9PiBuZXcgRm9ybUNvbnRyb2woY3RybCkpO1xuICBsZXQgdmFsaWRhdG9ycyA9IG9wdGlvbnMudmFsaWRhdG9ycyB8fCBbXTtcbiAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb3JtJyk7XG4gIGxldCBlcnJvcnNXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGxldCBzdWJtaXRXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGxldCBmb3JtQ29udHJvbHNSZWZzID0gZm9ybUNvbnRyb2xzLm1hcChjdHJsID0+IGN0cmwucmVmKTtcbiAgZXJyb3JzV3JhcHBlci5jbGFzc05hbWUgPSAnZXJyb3JzJztcbiAgc3VibWl0V3JhcHBlci5jbGFzc05hbWUgPSAnYWN0aW9ucyc7XG4gIHN1Ym1pdFdyYXBwZXIuaW5uZXJIVE1MID0gJzxpbnB1dCB0eXBlPVwic3VibWl0XCIgdmFsdWU9XCJTdWJtaXRcIiAvPic7XG4gIHN1Ym1pdFJlZiA9IHN1Ym1pdFdyYXBwZXIucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInN1Ym1pdFwiXScpO1xuXG4gIFtcbiAgICBlcnJvcnNXcmFwcGVyLFxuICAgIC4uLmZvcm1Db250cm9sc1JlZnMsXG4gICAgc3VibWl0V3JhcHBlclxuICBdLmZvckVhY2goaXRlbSA9PiB3cmFwcGVyLmFwcGVuZENoaWxkKGl0ZW0pKTtcbiAgXG4gIGxldCBmb3JtID0ge1xuICAgIHJlZjogd3JhcHBlcixcbiAgICBlcnJvcnM6IHtcbiAgICAgIHJlZjogZXJyb3JzV3JhcHBlcixcbiAgICAgIGl0ZW1zOiB7fVxuICAgIH0sXG4gICAgY29udHJvbHM6IGZvcm1Db250cm9scyxcbiAgICBzdWJtaXQ6IHtcbiAgICAgIGhhbmRsZXI6IG9wdGlvbnMuc3VibWl0LmhhbmRsZXJcbiAgICB9XG4gIH07XG5cbiAgb3B0aW9ucy52YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHtcbiAgICB2YWxpZGF0b3IuY29udHJvbHMuZm9yRWFjaChjb250cm9sID0+IHtcbiAgICAgIGNvbnRyb2wuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICAgIHZhbGlkYXRlKHZhbGlkYXRvciwgZm9ybSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgc3VibWl0UmVmLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICBsZXQgZXJyb3JzQW1vdW50ID0gMDtcbiAgICB2YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHZhbGlkYXRlKHZhbGlkYXRvciwgZm9ybSkpO1xuICAgIGZvcm0uY29udHJvbHMuZm9yRWFjaChjdHJsID0+IGN0cmwudmFsaWRhdGUoKSk7XG4gICAgT2JqZWN0LnZhbHVlcyhmb3JtLmVycm9ycy5pdGVtcykuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgaWYgKCEhdmFsKSB7XG4gICAgICAgIGVycm9yc0Ftb3VudCsrO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGZvcm0uY29udHJvbHMuZm9yRWFjaChjdHJsID0+IHtcbiAgICAgIE9iamVjdC52YWx1ZXMoY3RybC5lcnJvcnMuaXRlbXMpLmZvckVhY2godmFsID0+IHtcbiAgICAgICAgaWYgKCEhdmFsKSB7XG4gICAgICAgICAgZXJyb3JzQW1vdW50Kys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmIChlcnJvcnNBbW91bnQgPiAwKSB7XG4gICAgICBjb25zb2xlLmxvZygnRm9ybSBpcyBub3QgdmFsaWQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IHZhbHVlcyA9IHt9O1xuICAgIGZvcm0uY29udHJvbHMuZm9yRWFjaChjdHJsID0+IHtcbiAgICAgIHZhbHVlc1tjdHJsLmtleU5hbWVdID0gY3RybC52YWx1ZTtcbiAgICB9KTtcbiAgICBmb3JtLnN1Ym1pdC5oYW5kbGVyKHZhbHVlcywgZXZ0KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZvcm07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvcm07XG59LHtcIi4vRm9ybUNvbnRyb2xcIjoxOH1dLDE4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHZhbGlkYXRlID0gZnVuY3Rpb24oY29udHJvbCkge1xuICBjb250cm9sID0gY29udHJvbCB8fCB0aGlzO1xuICBsZXQgYWRkID0ge307XG4gIGxldCByZW1vdmUgPSB7fTtcbiAgbGV0IGl0ZW1zID0gY29udHJvbC5lcnJvcnMuaXRlbXM7XG4gIGxldCB2YWxpZGF0b3JzID0gY29udHJvbC52YWxpZGF0b3JzO1xuXG4gIGlmICghY29udHJvbC5yZXF1aXJlZCAmJiBjb250cm9sLnZhbHVlID09PSAnJykge1xuICAgIE9iamVjdC5rZXlzKGl0ZW1zKS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgaWYgKCEhaXRlbXNbaXRlbV0pIHJlbW92ZVtpdGVtXSA9IHRydWU7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoY29udHJvbC5yZXF1aXJlZCAmJiBjb250cm9sLnZhbHVlID09PSAnJykge1xuICAgIGlmICghaXRlbXNbJ3JlcXVpcmVkJ10pIHtcbiAgICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJ1RoaXMgZmllbGQgaXMgcmVxdWlyZWQnO1xuICAgICAgaXRlbXNbJ3JlcXVpcmVkJ10gPSB7XG4gICAgICAgIHJlZjogZWxlbWVudFxuICAgICAgfVxuICAgICAgY29udHJvbC5lcnJvcnMucmVmLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChjb250cm9sLnZhbHVlLmxlbmd0aCA+IDAgJiYgISFpdGVtc1sncmVxdWlyZWQnXSkge1xuICAgIHJlbW92ZVsncmVxdWlyZWQnXSA9IHRydWU7XG4gIH1cblxuICBpZiAoY29udHJvbC52YWx1ZSAhPT0gJycpIHtcbiAgICB2YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHtcbiAgICAgIGxldCByZXN1bHQgPSB2YWxpZGF0b3IuaGFuZGxlcihjb250cm9sLnZhbHVlLCBjb250cm9sKTtcbiAgICAgIGlmICghcmVzdWx0LnZhbGlkICYmICFpdGVtc1t2YWxpZGF0b3IubmFtZV0pIHtcbiAgICAgICAgYWRkW3ZhbGlkYXRvci5uYW1lXSA9IHJlc3VsdDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHJlc3VsdC52YWxpZCAmJiBpdGVtc1t2YWxpZGF0b3IubmFtZV0pIHtcbiAgICAgICAgcmVtb3ZlW3ZhbGlkYXRvci5uYW1lXSA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBPYmplY3Qua2V5cyhhZGQpLmZvckVhY2goZXJyb3IgPT4ge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGFkZFtlcnJvcl0ubWVzc2FnZTtcbiAgICBpdGVtc1tlcnJvcl0gPSB7XG4gICAgICByZWY6IGVsZW1lbnRcbiAgICB9O1xuICAgIGNvbnRyb2wuZXJyb3JzLnJlZi5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgfSk7XG5cbiAgT2JqZWN0LmtleXMocmVtb3ZlKS5mb3JFYWNoKGVycm9yID0+IHtcbiAgICBpdGVtc1tlcnJvcl0ucmVmLnJlbW92ZSgpO1xuICAgIGl0ZW1zW2Vycm9yXSA9IG51bGw7XG4gIH0pO1xufTtcblxuY29uc3QgYmluZEVycm9ySGFuZGxpbmcgPSBmdW5jdGlvbihjb250cm9sKSB7XG4gIGNvbnRyb2wuY29udHJvbFJlZi5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICB2YWxpZGF0ZShjb250cm9sKTtcbiAgfSk7XG59O1xuXG5jb25zdCB0YWdJbnB1dCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgbGV0IHByZXBlbmQgPSBvcHRpb25zLnByZXBlbmQgfHwgJyc7XG4gIGxldCBhcHBlbmQgPSBvcHRpb25zLmFwcGVuZCB8fCAnJztcbiAgbGV0IGxhYmVsID1cbiAgICBvcHRpb25zLmxhYmVsID9cbiAgICBgPGxhYmVsIGZvcj1cIiR7b3B0aW9ucy5pZH1cIj4ke29wdGlvbnMubGFiZWx9PC9sYWJlbD5gIDpcbiAgICAnJztcbiAgbGV0IGVycm9ycyA9IG9wdGlvbnMuZXJyb3JzO1xuICBsZXQgZXJyb3JzUG9zaXRpb24gPVxuICAgIGVycm9ycyAmJiBlcnJvcnMucG9zaXRpb24gP1xuICAgIGVycm9ycyAmJiBlcnJvcnMucG9zaXRpb24gOlxuICAgICdiZWZvcmVBcHBlbmQnO1xuICBsZXQgZXJyb3JzQ2xhc3MgPVxuICAgIGVycm9ycyAmJiBlcnJvcnMuY2xhc3MgP1xuICAgIGVycm9ycyAmJiBlcnJvcnMuY2xhc3MgOlxuICAgICdlcnJvcnMnXG4gIGxldCBlcnJvcnNIVE1MID0gYDxkaXYgY2xhc3M9XCIke2Vycm9yc0NsYXNzfVwiPjwvZGl2PmA7XG4gIGxldCBjb250cm9sSFRNTCA9ICc8aW5wdXQ+JztcbiAgbGV0IGh0bWw7XG4gIFxuICBzd2l0Y2ggKGVycm9yc1Bvc2l0aW9uKSB7XG4gICAgY2FzZSAnYmVmb3JlUHJlcGVuZCc6XG4gICAgICBodG1sID0gZXJyb3JzSFRNTCArIHByZXBlbmQgKyBsYWJlbCArIGNvbnRyb2xIVE1MICsgYXBwZW5kO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmVmb3JlTGFiZWwnOlxuICAgICAgaHRtbCA9IHByZXBlbmQgKyBlcnJvcnNIVE1MICsgbGFiZWwgKyBjb250cm9sSFRNTCArIGFwcGVuZDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JlZm9yZUNvbnRyb2wnOlxuICAgICAgaHRtbCA9IHByZXBlbmQgKyBsYWJlbCArIGVycm9yc0hUTUwgKyBjb250cm9sSFRNTCArIGFwcGVuZDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JlZm9yZUFwcGVuZCc6XG4gICAgICBodG1sID0gcHJlcGVuZCArIGxhYmVsICsgY29udHJvbEhUTUwgKyBlcnJvcnNIVE1MICsgYXBwZW5kO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYWZ0ZXJBcHBlbmQnOlxuICAgICAgaHRtbCA9IHByZXBlbmQgKyBsYWJlbCArIGNvbnRyb2xIVE1MICsgYXBwZW5kICsgZXJyb3JzSFRNTDtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgbGV0IGNvbnRyb2xJZCA9ICdpbnB1dCc7IC8vIHRvIGlkZW50aWZ5IGl0IGluIHRoZSBET00gd2hlbiBpdCdzIHJlbmRlcmVkXG4gIGxldCBlcnJvcnNJZCA9IGVycm9yc0NsYXNzOyAvLyBmb3IgdGhpcyB0b29cblxuICBsZXQgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB3cmFwcGVyLmNsYXNzTmFtZSA9IChvcHRpb25zLndyYXBwZXIgJiYgb3B0aW9ucy53cmFwcGVyLmNsYXNzKSB8fCAnJztcbiAgd3JhcHBlci5pbm5lckhUTUwgPSBodG1sO1xuICBsZXQgY29udHJvbFJlZiA9IHdyYXBwZXIucXVlcnlTZWxlY3Rvcihjb250cm9sSWQpO1xuICBsZXQgZXJyb3JzUmVmID0gd3JhcHBlci5xdWVyeVNlbGVjdG9yKCcuJytlcnJvcnNJZCk7XG5cbiAgaWYgKG9wdGlvbnMuYXR0cmlidXRlcykge1xuICAgIG9wdGlvbnMuYXR0cmlidXRlcy5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgY29udHJvbFJlZi5zZXRBdHRyaWJ1dGUoYXR0ci5uYW1lLCBhdHRyLnZhbHVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGxldCBjb250cm9sID0ge1xuICAgIGtleU5hbWU6IG9wdGlvbnMua2V5TmFtZSB8fCAnJyxcbiAgICByZWY6IHdyYXBwZXIsXG4gICAgY29udHJvbFJlZjogY29udHJvbFJlZixcbiAgICBlcnJvcnM6IHtcbiAgICAgIHJlZjogZXJyb3JzUmVmLFxuICAgICAgaXRlbXM6IHt9XG4gICAgfSxcbiAgICByZXF1aXJlZDogb3B0aW9ucy5yZXF1aXJlZCB8fCBmYWxzZSxcbiAgICB2YWxpZDogbnVsbCxcbiAgICB2YWxpZGF0b3JzOiBvcHRpb25zLnZhbGlkYXRvcnMgfHwgW10sXG4gICAgdmFsaWRhdGU6IHZhbGlkYXRlXG4gIH07XG5cbiAgYmluZEVycm9ySGFuZGxpbmcoY29udHJvbCk7XG5cbiAgaWYgKG9wdGlvbnMuaGFuZGxlcnNPYmpzKSB7XG4gICAgbGV0IGV2ZW50cyA9IHt9O1xuICAgIGxldCBoYW5kbGVyc09ianMgPSBvcHRpb25zLmhhbmRsZXJzO1xuICAgIGhhbmRsZXJzT2Jqcy5mb3JFYWNoKG9iaiA9PiB7XG4gICAgICBpZiAoIWV2ZW50c1tvYmouZXZlbnRdKSB7XG4gICAgICAgIGV2ZW50c1tvYmouZXZlbnRdID0gW107XG4gICAgICB9XG4gICAgICBldmVudHNbb2JqLmV2ZW50XS5wdXNoKG9iai5oYW5kbGVyKTtcbiAgICB9KTtcbiAgICBPYmplY3Qua2V5cyhldmVudHMpLmZvckVhY2goZXZlbnROYW1lID0+IHtcbiAgICAgIGNvbnRyb2wuY29udHJvbFJlZi5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZXZ0ID0+IHtcbiAgICAgICAgZXZlbnRzW2V2ZW50TmFtZV0uZm9yRWFjaChoYW5kbGVyID0+IGhhbmRsZXIoZXZ0KSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb250cm9sLCAndmFsdWUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gdGhpcy5jb250cm9sUmVmLnZhbHVlfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7dGhpcy5jb250cm9sUmVmLnZhbHVlID0gbmV3VmFsdWV9XG4gIH0pXG5cbiAgcmV0dXJuIGNvbnRyb2w7XG59O1xuXG5jb25zdCBnZXRIYW5kbGVyID0gZnVuY3Rpb24odGFnKSB7XG4gIGxldCBmbjtcbiAgLy8gU3dpdGNoIHNlZW1zIHRvIGJlIGZhc3RlciB0aGFuIG9iamVjdCBsb29rIHVwXG4gIC8vIFNlYXJjaCBmb3IgJ2pzIHN3aXRjaCB2cyBvYmplY3QnXG4gIHN3aXRjaCh0YWcpIHtcbiAgICBjYXNlICdpbnB1dCc6XG4gICAgICBmbiA9IHRhZ0lucHV0O1xuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIGZuO1xufTtcblxuY29uc3QgRm9ybUNvbnRyb2wgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHJldHVybiBnZXRIYW5kbGVyKG9wdGlvbnMudGFnKShvcHRpb25zKVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtQ29udHJvbDtcbn0se31dLDE5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm0gPSByZXF1aXJlKCcuL0Zvcm0nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtO1xufSx7XCIuL0Zvcm1cIjoxN31dLDIwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IG1pbkxlbmd0aCA9IGZ1bmN0aW9uKHZhbHVlLCBjb250cm9sKSB7XG4gIHJldHVybiB7XG4gICAgdmFsaWQ6IHZhbHVlLmxlbmd0aCA+PSA1LFxuICAgIG1lc3NhZ2U6ICdUaGlzIGZpZWxkc1xcJ3MgbGVuZ3RoIGlzIGxlc3MgdGhhbiA1IGNoYXJzJ1xuICB9XG59O1xuXG5jb25zdCBtYXhMZW5ndGggPSBmdW5jdGlvbih2YWx1ZSwgY29udHJvbCkge1xuICByZXR1cm4ge1xuICAgIHZhbGlkOiB2YWx1ZS5sZW5ndGggPD0gMTAsXG4gICAgbWVzc2FnZTogJ1RoaXMgZmllbGRzXFwncyBsZW5ndGggaXMgZ3JlYXRlciB0aGFuIDEwIGNoYXJzJ1xuICB9XG59O1xuXG5jb25zdCBzdGFydHNXaXRoTnVtYmVyID0gZnVuY3Rpb24odmFsdWUsIGNvbnRyb2wpIHtcbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogIS9eXFxkKy9pLnRlc3QodmFsdWUpLFxuICAgIG1lc3NhZ2U6ICdVc2VybmFtZSBtdXN0IG5vdCBzdGFydCB3aXRoIG51bWJlcnMnXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtaW5MZW5ndGgsXG4gIG1heExlbmd0aCxcbiAgc3RhcnRzV2l0aE51bWJlclxufTtcbn0se31dLDIxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmZ1bmN0aW9uIGNvbmZpZ3VyZShvcHRpb25zKSB7XG4gIGxldCBsb2NhdGlvbiA9IG9wdGlvbnMubG9jYXRpb247XG4gIGxvY2F0aW9uID0gbG9jYXRpb25bbG9jYXRpb24ubGVuZ3RoLTFdID09PSAnLycgP1xuICAgIGxvY2F0aW9uIDpcbiAgICBsb2NhdGlvbiArICcvJztcbiAgXG4gIHRoaXMubG9jYXRpb24gPSBsb2NhdGlvbjtcbn1cblxuZnVuY3Rpb24gZ2V0Q29ycmVjdFVybCh1cmwpIHtcbiAgdXJsID0gdXJsWzBdID09PSAnLycgP1xuICAgIHVybC5zbGljZSgxKSA6XG4gICAgdXJsO1xuXG4gIHJldHVybiB1cmw7XG59XG5cbmZ1bmN0aW9uIHNldEF1dGhvcml6YXRpb25IZWFkZXIoeGhyKSB7XG4gIGNvbnN0IHRva2VuID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhdXRoX3Rva2VuJyk7XG5cbiAgaWYgKHRva2VuKSB7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ2F1dGhvcml6YXRpb24nLCBgQmVhcmVyICR7dG9rZW59YCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0KHVybCwgb3B0aW9ucykge1xuICByZXR1cm4gdGhpcy5tYWtlUmVxdWVzdCgnR0VUJywgdXJsLCBudWxsLCBvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gcG9zdCh1cmwsIGJvZHksIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHRoaXMubWFrZVJlcXVlc3QoJ1BPU1QnLCB1cmwsIGJvZHksIG9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiBtYWtlUmVxdWVzdChtZXRob2QsIHVybCwgYm9keSwgb3B0aW9ucykge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHVybCA9IHRoaXMuZ2V0Q29ycmVjdFVybCh1cmwpO1xuXG4gICAgeGhyLm9wZW4obWV0aG9kLCB0aGlzLmxvY2F0aW9uICsgdXJsKTtcblxuICAgIGlmIChtZXRob2QgPT0gJ1BPU1QnKSB7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcbiAgICAgICAgJ0NvbnRlbnQtVHlwZScsXG4gICAgICAgIChvcHRpb25zICYmIG9wdGlvbnMuY29udGVudFR5cGUpIHx8IHRoaXMuY29udGVudFR5cGVzLmpzb25cbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gRWFjaCB0aW1lIGFsb25nIHdpdGggdGhlIHJlcXVlc3Qgd2Ugc2VuZCBhdXRoX3Rva2VuIGlmIGl0IGV4aXN0c1xuICAgIHRoaXMuc2V0QXV0aG9yaXphdGlvbkhlYWRlcih4aHIpO1xuXG4gICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBpc0pzb24gPSB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ0NvbnRlbnQtVHlwZScpLm1hdGNoKHRoaXMuY29udGVudFR5cGVzLmpzb24pO1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBpc0pzb24gP1xuICAgICAgICBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpIDpcbiAgICAgICAgeGhyLnJlc3BvbnNlVGV4dDtcblxuICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgfSk7XG5cbiAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbigpIHtcbiAgICAgIHJlamVjdCgnTmV0d29yayBlcnJvciBvY2N1cmVkJyk7XG4gICAgfSk7XG5cbiAgICBpZiAobWV0aG9kID09ICdHRVQnKSB7XG4gICAgICB4aHIuc2VuZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChtZXRob2QgPT0gJ1BPU1QnKSB7XG4gICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShib2R5KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvY2F0aW9uOiBudWxsLFxuICBnZXRDb3JyZWN0VXJsOiBnZXRDb3JyZWN0VXJsLFxuICBjb25maWd1cmU6IGNvbmZpZ3VyZSxcbiAgc2V0QXV0aG9yaXphdGlvbkhlYWRlcjogc2V0QXV0aG9yaXphdGlvbkhlYWRlcixcbiAgY29udGVudFR5cGVzOiB7XG4gICAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nXG4gIH0sXG4gIG1ha2VSZXF1ZXN0OiBtYWtlUmVxdWVzdCxcbiAgZ2V0OiBnZXQsXG4gIHBvc3Q6IHBvc3Rcbn07XG59LHt9XSwyMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuY29uc3QgcmFkaWFsR3JhZGllbnRPbkhvdmVyID0gZnVuY3Rpb24oYnRuLCBvcHRzKSB7XG4gIGNvbnN0IHRleHQgPSBidG4uaW5uZXJIVE1MO1xuICBjb25zdCB3cmFwcGVyID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCJyZy1idG5cIj5cbiAgICAgIDxzcGFuPiR7dGV4dH08L3NwYW4+XG4gICAgPC9kaXY+XG4gIGApO1xuICBidG4uaW5uZXJIVE1MID0gJyc7XG4gIGJ0bi5zdHlsZS5wYWRkaW5nID0gMDtcblxuICBpZiAoTnVtYmVyLmlzSW50ZWdlcihvcHRzLnBhZGRpbmcpKSB7XG4gICAgd3JhcHBlci5zdHlsZS5wYWRkaW5nID0gb3B0cy5wYWRkaW5nICsgJ3B4JztcbiAgfVxuICBlbHNlIGlmIChvcHRzLnBhZGRpbmcgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIGlmIChvcHRzLnBhZGRpbmcubGVuZ3RoID09IDIpIHtcbiAgICAgIHdyYXBwZXIuc3R5bGUucGFkZGluZ1RvcCA9IHdyYXBwZXIuc3R5bGUucGFkZGluZ0JvdHRvbSA9IG9wdHMucGFkZGluZ1swXSArICdweCc7XG4gICAgICB3cmFwcGVyLnN0eWxlLnBhZGRpbmdMZWZ0ID0gd3JhcHBlci5zdHlsZS5wYWRkaW5nUmlnaHQgPSBvcHRzLnBhZGRpbmdbMV0gKyAncHgnO1xuICAgIH1cbiAgfVxuXG4gIGJ0bi5hcHBlbmRDaGlsZCh3cmFwcGVyKTtcblxuICBidG4uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZXZ0ID0+IHtcbiAgICBjb25zdCBjb29yZGluYXRlcyA9IGV2dC50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgeCA9IGV2dC5jbGllbnRYIC0gY29vcmRpbmF0ZXMubGVmdDtcbiAgICBjb25zdCB5ID0gZXZ0LmNsaWVudFkgLSBjb29yZGluYXRlcy50b3A7XG4gICAgZXZ0LnRhcmdldC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS14JywgYCR7IHggfXB4YCk7XG4gICAgZXZ0LnRhcmdldC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS15JywgYCR7IHkgfXB4YCk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSByYWRpYWxHcmFkaWVudE9uSG92ZXI7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjozMH1dLDIzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IFJvdXRlciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJvdXRlcyA9IFtdO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS5yZWdleHBQYXJhbXMgPSAvKFxcKDooW1xcd1xcZFxcLV9dKylcXCkpL2dpO1xuXG5Sb3V0ZXIucHJvdG90eXBlLnRyaW1Sb3V0ZSA9IGZ1bmN0aW9uKHJvdXRlKXtcbiAgcm91dGUgPSByb3V0ZVswXSA9PT0gJy8nXG4gICAgPyByb3V0ZS5zdWJzdHIoMSlcbiAgICA6IHJvdXRlO1xuXG4gIHJvdXRlID0gcm91dGVbcm91dGUubGVuZ3RoIC0gMV0gPT09ICcvJ1xuICAgID8gcm91dGUuc3Vic3RyKDAsIHJvdXRlLmxlbmd0aCAtIDEpXG4gICAgOiByb3V0ZTtcblxuICByZXR1cm4gcm91dGU7XG59LFxuXG5Sb3V0ZXIucHJvdG90eXBlLmdldFBhcmFtc05hbWVzID0gZnVuY3Rpb24ocm91dGUpIHtcbiAgbGV0IHJlc3VsdDtcbiAgbGV0IHBhcmFtc05hbWVzID0gW107XG4gIHdoaWxlICgocmVzdWx0ID0gdGhpcy5yZWdleHBQYXJhbXMuZXhlYyhyb3V0ZSkpICE9PSBudWxsKSB7XG4gICAgcGFyYW1zTmFtZXMucHVzaChyZXN1bHRbMl0pO1xuICB9XG4gIHJldHVybiBwYXJhbXNOYW1lcztcbn1cblxuUm91dGVyLnByb3RvdHlwZS5hZGRSb3V0ZSA9IGZ1bmN0aW9uKHJvdXRlLCBvYmopIHtcbiAgcm91dGUgPSB0aGlzLnRyaW1Sb3V0ZShyb3V0ZSk7XG4gIGxldCBwYXJhbXNOYW1lcyA9IHRoaXMuZ2V0UGFyYW1zTmFtZXMocm91dGUpO1xuICBsZXQgcmVnZXhwU3RyID0gcm91dGUucmVwbGFjZSh0aGlzLnJlZ2V4cFBhcmFtcywgJyhbXFxcXHdcXFxcZFxcLV9dKyknKTtcbiAgbGV0IHJlZ2V4cCA9IFJlZ0V4cChgXiR7cmVnZXhwU3RyfShcXFxcL3wkKWAsICdnaScpO1xuXG4gIGxldCByb3V0ZU9iaiA9IHtcbiAgICB0eXBlOiAncm91dGUnLFxuICAgIHJlZ2V4cDogcmVnZXhwLFxuICAgIHBhcmFtc05hbWVzOiBwYXJhbXNOYW1lc1xuICB9O1xuXG4gIGlmICh0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLyoqXG4gICAgICogUm91dGUgaGFuZGxlciB3aWxsIGJlIGludm9rZWQgd2hlbiB1c2VyIGdvZXMgdG8gdGhlIGNvcnJlc3BvbmRpbmdcbiAgICAgKiByb3V0ZSBhbmQgbm90IHRlcm1pbmF0ZWQgYnkgbWlkZGxld2FyZXMgdW5kZXJ3YXlcbiAgICAgKiBAZnVuY3Rpb24gaGFuZGxlclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBoYW5kbGVyUGFyYW1zIC0gcGFyYW1zIG1heSBiZSBnaXZlbiB3aGVuIFJvdXRlci5uYXZpZ2F0ZSBpcyBpbnZva2VkXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHJvdXRlUGFyYW1zIC0gcGFyYW1zIGV4aXN0aW5nIG9uIHRoZSByb3V0ZSBpZiBhbnlcbiAgICAgKiBAcGFyYW0ge2FueX0gYXJnIC0gdGhpcyBpcyBnaXZlbiBieSB0aGUgbGFzdCBtaWRkbGV3YXJlIGlmIGFueVxuICAgICAqL1xuICAgIHJvdXRlT2JqLmhhbmRsZXIgPSBvYmo7XG4gIH1cblxuICBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIHJvdXRlT2JqLmNoaWxkcmVuID0gb2JqO1xuICB9XG5cbiAgZWxzZSB7XG4gICAgY29uc29sZS5sb2coJ0Vycm9yIG9jY3VyZWQgd2hpbGUgYWRkaW5nIHJvdXRlJyk7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyb3V0ZSBlcnJvcicpO1xuICB9XG5cbiAgdGhpcy5yb3V0ZXMucHVzaChyb3V0ZU9iaik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS5nZXRSb3V0ZSA9IGZ1bmN0aW9uKGxpbmssIHJvdXRlcyA9IHRoaXMucm91dGVzKSB7XG4gIGxpbmsgPSBsaW5rID09PSAnJyA/ICcvJyA6IGxpbms7XG4gIGxldCBtaWRkbGV3YXJlcyA9IFtdO1xuICBsZXQgcGFyYW1zID0ge307XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoLCByb3V0ZSA9IHJvdXRlc1tpXTsgaSsrKSB7XG4gICAgaWYgKHJvdXRlLnR5cGUgPT0gJ21pZGRsZXdhcmUnKSB7XG4gICAgICBtaWRkbGV3YXJlcy5wdXNoKHJvdXRlLmZuKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChyb3V0ZS50eXBlID09ICdyb3V0ZXMnKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbkNoZWNrID0gdGhpcy5nZXRSb3V0ZShsaW5rLCByb3V0ZS5yb3V0ZXMpO1xuICAgICAgaWYgKGNoaWxkcmVuQ2hlY2sgIT09IG51bGwpIHtcbiAgICAgICAgY2hpbGRyZW5DaGVjay5taWRkbGV3YXJlcyA9IG1pZGRsZXdhcmVzLmNvbmNhdChjaGlsZHJlbkNoZWNrLm1pZGRsZXdhcmVzKTtcbiAgICAgICAgY2hpbGRyZW5DaGVjay5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHBhcmFtcywgY2hpbGRyZW5DaGVjay5wYXJhbXMpO1xuICAgICAgICByZXR1cm4gY2hpbGRyZW5DaGVjaztcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGxldCByZWdleHAgPSByb3V0ZS5yZWdleHA7XG4gICAgbGV0IHJlc3VsdCA9IHJlZ2V4cC5leGVjKGxpbmspO1xuICAgIGxldCBuZXdMaW5rO1xuXG4gICAgaWYgKHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoID4gMSkge1xuICAgICAgcGFyYW1zID0ge307XG4gICAgICBmb3IgKGxldCBpZHggPSAxOyBpZHggPCByZXN1bHQubGVuZ3RoIC0gMTsgaWR4KyspIHtcbiAgICAgICAgcGFyYW1zW3JvdXRlLnBhcmFtc05hbWVzW2lkeC0xXV0gPSByZXN1bHRbaWR4XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmVnZXhwLmxhc3RJbmRleCA+IDApIHtcbiAgICAgIG5ld0xpbmsgPSBsaW5rLnN1YnN0cihyZWdleHAubGFzdEluZGV4KTtcbiAgICB9XG5cbiAgICBpZiAocmVnZXhwLmxhc3RJbmRleCA+IDAgJiYgbmV3TGluay5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAocm91dGUuY2hpbGRyZW4gJiYgcm91dGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICBsZXQgY2hpbGRyZW5DaGVjayA9IHRoaXMuZ2V0Um91dGUobmV3TGluaywgcm91dGUuY2hpbGRyZW4pO1xuICAgICAgICBpZiAoY2hpbGRyZW5DaGVjayAhPT0gbnVsbCkge1xuICAgICAgICAgIGNoaWxkcmVuQ2hlY2subWlkZGxld2FyZXMgPSBtaWRkbGV3YXJlcy5jb25jYXQoY2hpbGRyZW5DaGVjay5taWRkbGV3YXJlcyk7XG4gICAgICAgICAgY2hpbGRyZW5DaGVjay5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHBhcmFtcywgY2hpbGRyZW5DaGVjay5wYXJhbXMpO1xuICAgICAgICAgIHJldHVybiBjaGlsZHJlbkNoZWNrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIGVsc2UgaWYgKHJlZ2V4cC5sYXN0SW5kZXggPiAwKSB7XG4gICAgICAvLyBJbiBjYXNlIGl0J3MgdGVybWluYWwgcm91dGVcbiAgICAgIGlmIChyb3V0ZS5oYW5kbGVyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaGFuZGxlcjogcm91dGUuaGFuZGxlcixcbiAgICAgICAgICBwYXJhbXM6IHBhcmFtcyxcbiAgICAgICAgICBtaWRkbGV3YXJlczogbWlkZGxld2FyZXNcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gU2luY2UgaXQncyBkb25lIGFuZCBsaW5rIGlzIChhY3R1YWxseSwgd2lsbCBiZSB3aGVuIHdlXG4gICAgICAvLyBnZXQgaW50byByZWN1cnNpb24pICcvJywgc28gd2UgbG9vayB1cCBjaGlsZHJlbiB0b1xuICAgICAgLy8gdG8gbWF0Y2ggdGhlIHJvb3QgJy8nIHdoaWNoIG11c3QgZXhpc3QgdGhlcmVcbiAgICAgIGlmIChyb3V0ZS5jaGlsZHJlbikge1xuICAgICAgICBsZXQgY2hpbGRyZW5DaGVjayA9IHRoaXMuZ2V0Um91dGUobmV3TGluaywgcm91dGUuY2hpbGRyZW4pO1xuICAgICAgICBpZiAoY2hpbGRyZW5DaGVjayAhPT0gbnVsbCkge1xuICAgICAgICAgIGNoaWxkcmVuQ2hlY2subWlkZGxld2FyZXMgPSBtaWRkbGV3YXJlcy5jb25jYXQoY2hpbGRyZW5DaGVjay5taWRkbGV3YXJlcyk7XG4gICAgICAgICAgY2hpbGRyZW5DaGVjay5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHBhcmFtcywgY2hpbGRyZW5DaGVjay5wYXJhbXMpO1xuICAgICAgICAgIHJldHVybiBjaGlsZHJlbkNoZWNrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS5hZGRSb3V0ZXMgPSBmdW5jdGlvbihyb3V0ZXMpIHtcbiAgdGhpcy5yb3V0ZXMucHVzaCh7XG4gICAgdHlwZTogJ3JvdXRlcycsXG4gICAgcm91dGVzOiByb3V0ZXNcbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLmFkZE1pZGRsZXdhcmUgPSBmdW5jdGlvbihmbikge1xuICB0aGlzLnJvdXRlcy5wdXNoKHtcbiAgICB0eXBlOiAnbWlkZGxld2FyZScsXG4gICAgZm46IGZuXG4gIH0pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS5uYXZpZ2F0ZSA9IGZ1bmN0aW9uKGxpbmssIGhhbmRsZXJQYXJhbXMpIHtcbiAgbGluayA9IHRoaXMudHJpbVJvdXRlKGxpbmspO1xuICBsZXQgcm91dGUgPSB0aGlzLmdldFJvdXRlKGxpbmspO1xuICBpZiAoIXJvdXRlKSB7XG4gICAgY29uc29sZS5sb2coJ05vIHN1aXRhYmxlIHJvdXRlIGhhcyBiZWVuIGZvdW5kJyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHJvdXRlLmhhbmRsZXIocm91dGUucGFyYW1zKTtcbiAgZm5zID0gcm91dGUubWlkZGxld2FyZXMuY29uY2F0KFtyb3V0ZS5oYW5kbGVyLmJpbmQobnVsbCwgaGFuZGxlclBhcmFtcyldKTtcbiAgZm9yIChsZXQgaSA9IGZucy5sZW5ndGggLSAxOyBpID4gMCwgZm4gPSBmbnNbaV07IGktLSkge1xuICAgIGlmIChpICE9PSBmbnMubGVuZ3RoIC0gMSkge1xuICAgICAgZm5zW2ldID0gZm4uYmluZChudWxsLCBmbnNbaSsxXSwgcm91dGUucGFyYW1zKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBmbnNbaV0gPSBmbi5iaW5kKG51bGwsIHJvdXRlLnBhcmFtcyk7XG4gICAgfVxuICB9XG4gIGZuc1swXSgpO1xuICBoaXN0b3J5LnB1c2hTdGF0ZSgnJywgJycsICcvJyArIGxpbmspO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS50ZXN0TmF2ID0gZnVuY3Rpb24obGluaywgaGFuZGxlclBhcmFtcykge1xuICBsaW5rID0gdGhpcy50cmltUm91dGUobGluayk7XG4gIGxldCByb3V0ZSA9IHRoaXMuZ2V0Um91dGUobGluayk7XG4gIGlmICghcm91dGUpIHtcbiAgICBjb25zb2xlLmxvZygnTm8gc3VpdGFibGUgcm91dGUgaGFzIGJlZW4gZm91bmQnKVxuICAgIHJldHVybjtcbiAgfVxuICAvLyBjb25zb2xlLmxvZyhyb3V0ZSk7XG4gIGZucyA9IHJvdXRlLm1pZGRsZXdhcmVzLmNvbmNhdChbcm91dGUuaGFuZGxlci5iaW5kKG51bGwsIGhhbmRsZXJQYXJhbXMpXSk7XG4gIGZvciAobGV0IGkgPSBmbnMubGVuZ3RoIC0gMTsgaSA+IDAsIGZuID0gZm5zW2ldOyBpLS0pIHtcbiAgICBpZiAoaSAhPT0gZm5zLmxlbmd0aCAtIDEpIHtcbiAgICAgIGZuc1tpXSA9IGZuLmJpbmQobnVsbCwgZm5zW2krMV0sIHJvdXRlLnBhcmFtcyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZm5zW2ldID0gZm4uYmluZChudWxsLCByb3V0ZS5wYXJhbXMpO1xuICAgIH1cbiAgfVxuICBjb25zb2xlLmxvZyhmbnMpXG4gIGZuc1swXSgpO1xufTtcblxuY29uc3QgU3Vicm91dGVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucm91dGVzID0gW107XG59O1xuU3Vicm91dGVyLnByb3RvdHlwZSA9IFJvdXRlci5wcm90b3R5cGU7XG5Sb3V0ZXIuU3Vicm91dGVyID0gU3Vicm91dGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJvdXRlcjtcbn0se31dLDI0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHRhZ3MgPSBbJ2RpdicsICdzcGFuJywgJ2J1dHRvbiddO1xuXG5jb25zdCBIZWFkZXJJdGVtID0gZnVuY3Rpb24ob3B0cykge1xuICBjb25zdCB0aXRsZSA9IG9wdHMudGl0bGUgfHwgJyc7XG4gIGNvbnN0IGNsYXNzTmFtZSA9IG9wdHMuY2xhc3NOYW1lIHx8ICcnO1xuICBjb25zdCB0YWcgPSB0YWdzLmZpbmQodGFnID0+IHRhZyA9PT0gb3B0cy50YWcpID9cbiAgICBvcHRzLnRhZyA6XG4gICAgJ3NwYW4nO1xuXG4gIGNvbnN0IGhlYWRlckl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG4gIGhlYWRlckl0ZW0uY2xhc3NOYW1lID0gJ3RhYnMtaGVhZGVyLWl0ZW0gJyArIGNsYXNzTmFtZTtcbiAgaGVhZGVySXRlbS5pbm5lckhUTUwgPSB0aXRsZTtcblxuICBpZiAob3B0cy5hdHRyaWJ1dGVzKSB7XG4gICAgb3B0cy5hdHRyaWJ1dGVzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBoZWFkZXJJdGVtLnNldEF0dHJpYnV0ZShhdHRyLm5hbWUsIGF0dHIudmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBlbGVtZW50OiBoZWFkZXJJdGVtXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlckl0ZW07XG59LHt9XSwyNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBkZWZhdWx0QW5pbSA9IGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBoYW5kbGVyKGV2dCkge1xuICAgIGNvbnN0IHRhYiA9IGV2dC50YXJnZXQuY2xvc2VzdCgnLnRhYnMtaGVhZGVyLWl0ZW0nKS5kYXRhc2V0Lm9yZGVyO1xuICAgIHRoaXMuZ290b1RhYih0YWIpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ290b1RhYih0YWIpIHtcbiAgICB0YWItLTtcbiAgICBjb25zdCBuZXdIZWFkZXJJdGVtID0gdGhpcy5oZWFkZXIuaXRlbXNbdGFiXTtcbiAgICBjb25zdCBuZXdDb250ZW50SXRlbSA9IHRoaXMuY29udGVudC5pdGVtc1t0YWJdO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcblxuICAgIG5ld0hlYWRlckl0ZW0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgbmV3Q29udGVudEl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gICAgbmV3Q29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cbiAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtID0gbmV3SGVhZGVySXRlbTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbSA9IG5ld0NvbnRlbnRJdGVtO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdGlhbGl6ZSh0YWIpIHtcbiAgICB0YWItLTtcbiAgICBjb25zdCBhY3RpdmVIZWFkZXJJdGVtID0gdGhpcy5oZWFkZXIuaXRlbXNbdGFiXTtcbiAgICBjb25zdCBhY3RpdmVDb250ZW50SXRlbSA9IHRoaXMuY29udGVudC5pdGVtc1t0YWJdO1xuICAgIGNvbnN0IG5vbkFjdGl2ZUNvbnRlbnRJdGVtcyA9IHRoaXMuY29udGVudC5pdGVtcy5maWx0ZXIoaXRlbSA9PiBpdGVtICE9PSBhY3RpdmVDb250ZW50SXRlbSk7XG5cbiAgICBhY3RpdmVIZWFkZXJJdGVtLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgIGFjdGl2ZUNvbnRlbnRJdGVtLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXG4gICAgbm9uQWN0aXZlQ29udGVudEl0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpKTtcblxuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0gPSBhY3RpdmVIZWFkZXJJdGVtO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtID0gYWN0aXZlQ29udGVudEl0ZW07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGhhbmRsZXIsXG4gICAgZ290b1RhYixcbiAgICBpbml0aWFsaXplXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRBbmltO1xufSx7fV0sMjY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qgc2V0Q29udGVudEl0ZW1zV2lkdGhzID0gZnVuY3Rpb24ob3B0aW9ucywgYW5pbVBhcmFtcykge1xuICBjb25zdCBjb250cm9sbGVyID0gb3B0aW9ucy5jb250cm9sbGVyIHx8IHt9O1xuICBjb25zdCBuZXdPcmRlciA9IG9wdGlvbnMubmV3T3JkZXI7XG4gIGNvbnN0IHNldEZvck5ld09yZGVyID0gb3B0aW9ucy5zZXRGb3JOZXdPcmRlciB8fCBmYWxzZTtcbiAgY29uc3QgaXRlbXMgPSBjb250cm9sbGVyLmNvbnRlbnQuaXRlbXM7XG4gIGNvbnN0IGxlbiA9IGl0ZW1zLmxlbmd0aDtcbiAgY29uc3Qgd2lkdGggPSBjb250cm9sbGVyLmNvbnRlbnQuZWxlbWVudC5jbGllbnRXaWR0aDtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbiwgaXRlbSA9IGl0ZW1zW2ldOyBpKyspIHtcbiAgICBpZiAoc2V0Rm9yTmV3T3JkZXIgfHwgaXRlbSAhPT0gaXRlbXNbbmV3T3JkZXJdKSB7XG4gICAgICBpdGVtLnN0eWxlLndpZHRoID0gKHdpZHRoIC0gMiphbmltUGFyYW1zLnBhZGRpbmcpICsgJ3B4JztcbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0IHNldENvbnRlbnRJdGVtc1Bvc2l0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgY29uc3QgY29udHJvbGxlciA9IG9wdGlvbnMuY29udHJvbGxlciB8fCB7fTtcbiAgY29uc3QgbmV3T3JkZXIgPSBvcHRpb25zLm5ld09yZGVyO1xuICBjb25zdCBzZXRGb3JOZXdPcmRlciA9IG9wdGlvbnMuc2V0Rm9yTmV3T3JkZXIgfHwgZmFsc2U7XG4gIGNvbnN0IGl0ZW1zID0gY29udHJvbGxlci5jb250ZW50Lml0ZW1zO1xuICBjb25zdCBsZW4gPSBpdGVtcy5sZW5ndGg7XG4gIGNvbnN0IHdpZHRoID0gY29udHJvbGxlci5jb250ZW50LmVsZW1lbnQuY2xpZW50V2lkdGg7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW4sIGl0ZW0gPSBpdGVtc1tpXTsgaSsrKSB7XG4gICAgaWYgKHNldEZvck5ld09yZGVyIHx8IGl0ZW0gIT09IGl0ZW1zW25ld09yZGVyXSkge1xuICAgICAgaXRlbS5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlWCgkeyhpLW5ld09yZGVyKSp3aWR0aH1weClgO1xuICAgIH1cbiAgfVxufTtcblxuY29uc3Qgc2V0Q29udGVudEl0ZW1zRGlzcGxheSA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgY29uc3QgY29udGVudEl0ZW1zID0gb3B0cy5jb250cm9sbGVyLmNvbnRlbnQuaXRlbXM7XG4gIGNvbnN0IGRpc3BsYXkgPSBvcHRzLmRpc3BsYXk7XG4gIGNvbnN0IG5ld09yZGVyID0gb3B0cy5uZXdPcmRlcjtcbiAgY29uc3Qgc2V0Rm9yTmV3T3JkZXIgPSBvcHRzLnNldEZvck5ld09yZGVyO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY29udGVudEl0ZW1zLmxlbmd0aCwgY2kgPSBjb250ZW50SXRlbXNbaV07IGkrKykge1xuICAgIGlmIChzZXRGb3JOZXdPcmRlciB8fCBjaSAhPT0gY29udGVudEl0ZW1zW25ld09yZGVyXSkge1xuICAgICAgY2kuc3R5bGUuZGlzcGxheSA9IGRpc3BsYXk7XG4gICAgfVxuICB9XG59O1xuXG5jb25zdCBUYWJzRmxvd0FuaW1hdGlvbiA9IGZ1bmN0aW9uKCkge1xuICBsZXQgcGFyYW1zO1xuXG4gIGZ1bmN0aW9uIGhhbmRsZXIoZXZ0KSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlLndvcmtpbmcpIHJldHVybjtcbiAgICB0aGlzLmFjdGl2ZS53b3JraW5nID0gdHJ1ZTtcbiAgICAvLyBISSBzdGFuZHMgZm9yIEhlYWRlciBJdGVtXG4gICAgLy8gQ0kgc3RhbmRzIGZvciBDb250ZW50IEl0ZW1cbiAgICBjb25zdCBuZXdISSA9IGV2dC50YXJnZXQuY2xvc2VzdCgnLnRhYnMtaGVhZGVyLWl0ZW0nKTtcbiAgICBjb25zdCBvcmRlciA9ICtuZXdISS5kYXRhc2V0Lm9yZGVyIC0gMTtcbiAgICBjb25zdCBuZXdDSSA9IHRoaXMuY29udGVudC5pdGVtc1tvcmRlcl07XG4gICAgY29uc3Qgc3BlZWQgPSBwYXJhbXMuc3BlZWQ7XG4gICAgY29uc3Qgb2xkT3JkZXIgPSArdGhpcy5hY3RpdmUuaGVhZGVySXRlbS5kYXRhc2V0Lm9yZGVyIC0gMTtcblxuICAgIHNldENvbnRlbnRJdGVtc1Bvc2l0aW9ucyh7Y29udHJvbGxlcjogdGhpcywgbmV3T3JkZXI6IG9sZE9yZGVyLCBzZXRGb3JOZXdPcmRlcjogZmFsc2V9KTtcbiAgICBzZXRDb250ZW50SXRlbXNEaXNwbGF5KHtjb250cm9sbGVyOiB0aGlzLCBuZXdPcmRlcjogb3JkZXIsIHNldEZvck5ld09yZGVyOiB0cnVlLCBkaXNwbGF5OiAnYmxvY2snfSk7XG4gICAgbmV3SEkuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICB0aGlzLmNvbnRlbnQuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5jbGllbnRIZWlnaHQgKyAncHgnO1xuICAgIHRoaXMuY29udGVudC5lbGVtZW50LnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IHNwZWVkICsgJ21zJztcbiAgICB0aGlzLmNvbnRlbnQuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSBuZXdDSS5jbGllbnRIZWlnaHQgKyAncHgnO1xuXG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLnN0eWxlLnRvcCA9IHBhcmFtcy5wYWRkaW5nICsgJ3B4JztcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5zdHlsZS5sZWZ0ID0gcGFyYW1zLnBhZGRpbmcgKyAncHgnO1xuXG4gICAgdGhpcy5jb250ZW50Lml0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IHNwZWVkICsgJ21zJyk7XG5cbiAgICBzZXRDb250ZW50SXRlbXNXaWR0aHMoe2NvbnRyb2xsZXI6IHRoaXMsIG5ld09yZGVyOiBvcmRlciwgc2V0Rm9yTmV3T3JkZXI6IHRydWV9LCBwYXJhbXMpO1xuICAgIHNldENvbnRlbnRJdGVtc1Bvc2l0aW9ucyh7Y29udHJvbGxlcjogdGhpcywgbmV3T3JkZXI6IG9yZGVyLCBzZXRGb3JOZXdPcmRlcjogdHJ1ZX0pO1xuICAgIFxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgbmV3Q0kuc3R5bGUucG9zaXRpb24gPSAnc3RhdGljJztcbiAgICAgIG5ld0NJLnN0eWxlLndpZHRoID0gJ2F1dG8nO1xuICAgICAgdGhpcy5jb250ZW50LmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuICAgICAgdGhpcy5jb250ZW50Lml0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9ICcwbXMnKTtcbiAgICAgIHRoaXMuY29udGVudC5lbGVtZW50LnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9ICcwbXMnO1xuICAgICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IG5ld0hJO1xuICAgICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSBuZXdDSTtcbiAgICAgIHRoaXMuYWN0aXZlLndvcmtpbmcgPSBmYWxzZTtcbiAgICAgIHNldENvbnRlbnRJdGVtc0Rpc3BsYXkoe1xuICAgICAgICBjb250cm9sbGVyOiB0aGlzLFxuICAgICAgICBuZXdPcmRlcjogb3JkZXIsXG4gICAgICAgIHNldEZvck5ld09yZGVyOiBmYWxzZSxcbiAgICAgICAgZGlzcGxheTogJ25vbmUnXG4gICAgICB9KTtcbiAgICB9LCBzcGVlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBnb3RvVGFiKHRhYikge1xuXG4gIH1cblxuICBmdW5jdGlvbiBpbml0aWFsaXplKHRhYiwgYW5pbU9wdGlvbnMpIHtcbiAgICBwYXJhbXMgPSBhbmltT3B0aW9ucyB8fCB7fTtcbiAgICAvLyBBZGQgY2xhc3Nlc1xuICAgIHRoaXMuY29udGVudC5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3RhYnMtZmxvdy1jb250ZW50Jyk7XG4gICAgdGhpcy5jb250ZW50Lml0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLmNsYXNzTGlzdC5hZGQoJ3RhYnMtZmxvdy1DSScpKTtcbiAgICBcbiAgICAvLyBTZXQgaW5kaXZpZHVhbCBDU1NcbiAgICBjb25zdCBDSXMgPSB0aGlzLmNvbnRlbnQuaXRlbXM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBDSXMubGVuZ3RoLCBpdGVtID0gQ0lzW2ldOyBpKyspIHtcbiAgICAgIGlmIChpICE9PSB0YWIpIHtcbiAgICAgICAgQ0lzW2ldLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJzsgICAgXG4gICAgICAgIENJc1tpXS5zdHlsZS50b3AgPSBwYXJhbXMucGFkZGluZyArICdweCc7XG4gICAgICAgIENJc1tpXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmhlYWRlci5pdGVtc1t0YWJdLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXG4gICAgLy8gU2V0IGFjdGl2ZSBvYmplY3RcbiAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtID0gdGhpcy5oZWFkZXIuaXRlbXNbdGFiXTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbSA9IHRoaXMuY29udGVudC5pdGVtc1t0YWJdO1xuXG4gICAgLy8gQWRkIG9uIHJlc2l6aW5nIGV2ZW50IGhhbmRsZXJcbiAgICBjb25zdCBuZXdPcmRlciA9ICt0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtLmRhdGFzZXQub3JkZXIgLSAxO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICBjb25zdCBvcHRpb25zID0ge2NvbnRyb2xsZXI6IHRoaXMsIG5ld09yZGVyOiBuZXdPcmRlcn07XG4gICAgICBpZiAodGhpcy5hY3RpdmUud29ya2luZykge1xuICAgICAgICBzZXRDb250ZW50SXRlbXNXaWR0aHMob3B0aW9ucywgcGFyYW1zKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBzZXRDb250ZW50SXRlbXNXaWR0aHMob3B0aW9ucywgcGFyYW1zKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgc2V0Q29udGVudEl0ZW1zUG9zaXRpb25zKG9wdGlvbnMpXG4gICAgfSk7XG5cbiAgICBzZXRDb250ZW50SXRlbXNEaXNwbGF5KHtcbiAgICAgIGNvbnRyb2xsZXI6IHRoaXMsXG4gICAgICBuZXdPcmRlcjogbmV3T3JkZXIsXG4gICAgICBzZXRGb3JOZXdPcmRlcjogZmFsc2UsXG4gICAgICBkaXNwbGF5OiAnbm9uZSdcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlcixcbiAgICBnb3RvVGFiLFxuICAgIGluaXRpYWxpemVcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGFic0Zsb3dBbmltYXRpb247XG59LHt9XSwyNzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBkZWZhdWx0QW5pbSA9IHJlcXVpcmUoJy4vZGVmYXVsdCcpO1xuY29uc3QgbG9naW5TaWdudXBTd2l0Y2ggPSByZXF1aXJlKCcuL2xvZ2luU2lnbnVwU3dpdGNoJyk7XG5jb25zdCB0YWJzRmxvd0FuaW1hdGlvbiA9IHJlcXVpcmUoJy4vZmxvdycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZGVmYXVsdEFuaW0sXG4gIGxvZ2luU2lnbnVwU3dpdGNoLFxuICB0YWJzRmxvd0FuaW1hdGlvblxufTtcbn0se1wiLi9kZWZhdWx0XCI6MjUsXCIuL2Zsb3dcIjoyNixcIi4vbG9naW5TaWdudXBTd2l0Y2hcIjoyOH1dLDI4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGxvZ2luU2lnbnVwU3dpdGNoID0gZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIGhhbmRsZXIoZXZ0KSB7XG4gICAgaWYgKHRoaXMuYmVpbmdBbmltYXRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmJlaW5nQW5pbWF0ZWQgPSB0cnVlO1xuXG4gICAgY29uc3Qgb2xkSEl0ZW0gPSB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtO1xuICAgIGNvbnN0IG9sZENJdGVtID0gdGhpcy5hY3RpdmUuY29udGVudEl0ZW07XG4gICAgY29uc3QgbmV3SEl0ZW0gPSBldnQudGFyZ2V0LmNsb3Nlc3QoJy50YWJzLWhlYWRlci1pdGVtJyk7XG4gICAgY29uc3Qgb3JkZXIgPSBuZXdISXRlbS5kYXRhc2V0Lm9yZGVyO1xuICAgIGNvbnN0IG5ld0NJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW29yZGVyLTFdO1xuXG4gICAgb2xkSEl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnbG9naW5TaWdudXAtSEktYWN0aXZlJyk7XG4gICAgbmV3SEl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtSEktYWN0aXZlJyk7XG5cbiAgICBvbGRDSXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1DSS1hY3RpdmUnKTtcbiAgICBvbGRDSXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1oaWRpbmcnKTtcbiAgICBuZXdDSXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1DSS1oaWRkZW4nKTtcbiAgICBuZXdDSXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1hY3RpdmF0aW5nJyk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIG9sZENJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnVwLUNJLWhpZGluZycpO1xuICAgICAgb2xkQ0l0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktaGlkZGVuJyk7XG5cbiAgICAgIG5ld0NJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnVwLUNJLWFjdGl2YXRpbmcnKTtcbiAgICAgIG5ld0NJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJLWFjdGl2ZScpO1xuXG4gICAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtID0gbmV3SEl0ZW07XG4gICAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbSA9IG5ld0NJdGVtO1xuXG4gICAgICB0aGlzLmJlaW5nQW5pbWF0ZWQgPSBmYWxzZTtcbiAgICB9LCA1MDApO1xuICB9XG5cbiAgZnVuY3Rpb24gZ290b1RhYih0YWIpIHtcbiAgICBjb25zdCBuZXdIZWFkZXJJdGVtID0gdGhpcy5oZWFkZXIuaXRlbXNbdGFiXTtcbiAgICBjb25zdCBuZXdDb250ZW50SXRlbSA9IHRoaXMuY29udGVudC5pdGVtc1t0YWJdO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1ISS1hY3RpdmUnKTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251LUNJLWFjdGl2ZScpO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJLWhpZGRlbicpO1xuXG4gICAgbmV3SGVhZGVySXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1ISS1hY3RpdmUnKTtcbiAgICBuZXdDb250ZW50SXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1DSS1oaWRkZW4nKTtcbiAgICBuZXdDb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1hY3RpdmUnKTtcblxuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0gPSBuZXdIZWFkZXJJdGVtO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtID0gbmV3Q29udGVudEl0ZW07XG4gIH1cblxuICBmdW5jdGlvbiBpbml0aWFsaXplKHRhYikge1xuICAgIHRoaXMuaGVhZGVyLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtaGVhZGVyJyk7XG4gICAgdGhpcy5jb250ZW50LmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtY29udGVudCcpO1xuICAgIHRoaXMuaGVhZGVyLml0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUhJJykpO1xuICAgIHRoaXMuY29udGVudC5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSScpKTtcblxuICAgIGNvbnN0IGFjdGl2ZUhlYWRlckl0ZW0gPSB0aGlzLmhlYWRlci5pdGVtc1t0YWJdO1xuICAgIGNvbnN0IGFjdGl2ZUNvbnRlbnRJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW3RhYl07XG4gICAgY29uc3Qgbm9uQWN0aXZlQ29udGVudEl0ZW1zID0gdGhpcy5jb250ZW50Lml0ZW1zLmZpbHRlcihpdGVtID0+IGl0ZW0gIT09IGFjdGl2ZUNvbnRlbnRJdGVtKTtcblxuICAgIGFjdGl2ZUhlYWRlckl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtSEktYWN0aXZlJyk7XG4gICAgYWN0aXZlQ29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktYWN0aXZlJyk7XG5cbiAgICBub25BY3RpdmVDb250ZW50SXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktaGlkZGVuJykpO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IGFjdGl2ZUhlYWRlckl0ZW07XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSBhY3RpdmVDb250ZW50SXRlbTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlcixcbiAgICBnb3RvVGFiLFxuICAgIGluaXRpYWxpemVcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbG9naW5TaWdudXBTd2l0Y2g7XG59LHt9XSwyOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBIZWFkZXJJdGVtID0gcmVxdWlyZSgnLi9IZWFkZXJJdGVtJyk7XG5jb25zdCBhbmltcyA9IHJlcXVpcmUoJy4vYW5pbWF0aW9ucycpO1xuXG5jb25zdCBUYWJzID0gZnVuY3Rpb24ob3B0cykge1xuICBjb25zdCBoZWFkZXJJdGVtcyA9XG4gICAgb3B0cy5oZWFkZXIuaXRlbXMubWFwKGl0ZW0gPT4gbmV3IEhlYWRlckl0ZW0oaXRlbSkuZWxlbWVudCkgfHwgW107XG4gIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBoZWFkZXIuY2xhc3NOYW1lID0gJ3RhYnMtaGVhZGVyICcgKyBvcHRzLmhlYWRlci5jbGFzc05hbWU7XG4gIGhlYWRlckl0ZW1zLmZvckVhY2goaXRlbSA9PiBoZWFkZXIuYXBwZW5kQ2hpbGQoaXRlbSkpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaGVhZGVySXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBoZWFkZXJJdGVtc1tpXS5kYXRhc2V0Lm9yZGVyID0gaSsxO1xuICB9XG5cbiAgY29uc3QgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBjb250ZW50LmNsYXNzTmFtZSA9ICd0YWJzLWNvbnRlbnQgJyArIChvcHRzLmNvbnRlbnQuY2xhc3NOYW1lIHx8ICcnKTtcbiAgY29uc3QgY29udGVudEl0ZW1zID0gb3B0cy5jb250ZW50Lml0ZW1zIHx8IFtdO1xuICBjb250ZW50SXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ3RhYnMtY29udGVudC1pdGVtJyk7XG4gICAgY29udGVudC5hcHBlbmRDaGlsZChpdGVtKTtcbiAgfSk7XG5cbiAgY29uc3QgYWN0aXZlID0ge1xuICAgIGhlYWRlckl0ZW06IG51bGwsXG4gICAgY29udGVudEl0ZW06IG51bGxcbiAgfTtcblxuICBjb25zdCBhbmltID0gYW5pbXNbb3B0cy5hbmltYXRpb24ubmFtZV0gP1xuICAgIG5ldyBhbmltc1tvcHRzLmFuaW1hdGlvbi5uYW1lXSA6XG4gICAgbmV3IGFuaW1zWydkZWZhdWx0QW5pbSddO1xuXG4gIGNvbnN0IHRhYnMgPSB7XG4gICAgaGVhZGVyOiB7XG4gICAgICBlbGVtZW50OiBoZWFkZXIsXG4gICAgICBpdGVtczogaGVhZGVySXRlbXNcbiAgICB9LFxuICAgIGNvbnRlbnQ6IHtcbiAgICAgIGVsZW1lbnQ6IGNvbnRlbnQsXG4gICAgICBpdGVtczogY29udGVudEl0ZW1zXG4gICAgfSxcbiAgICBhY3RpdmU6IGFjdGl2ZSxcbiAgICBnb3RvVGFiOiBhbmltLmdvdG9UYWIsXG4gICAgaW1pdGF0ZUNsaWNrT25UYWI6IGZ1bmN0aW9uKHRhYikge1xuICAgICAgdGhpcy5oZWFkZXIuaXRlbXNbdGFiXS5jbGljaygpO1xuICAgIH1cbiAgfTtcbiAgICBcbiAgaGVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBjb25zdCBsaW5rID0gZXZ0LnRhcmdldDtcbiAgICBjb25zdCByZXN1bHQgPSBoZWFkZXJJdGVtcy5maW5kKGl0ZW0gPT4gaXRlbSA9PT0gbGluay5jbG9zZXN0KCcudGFicy1oZWFkZXItaXRlbScpKTtcblxuICAgIGlmICghcmVzdWx0IHx8IHJlc3VsdCA9PT0gdGFicy5hY3RpdmUuaGVhZGVySXRlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGFuaW0uaGFuZGxlci5jYWxsKHRhYnMsIGV2dCk7XG4gICAgfVxuICB9KTtcblxuICBhbmltLmluaXRpYWxpemUuY2FsbCh0YWJzLCBvcHRzLmFuaW1hdGlvbi5pbml0aWFsaXplciAtIDEgfHwgMCwgb3B0cy5hbmltYXRpb24ucGFyYW1zKTtcblxuICByZXR1cm4gdGFicztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGFicztcbn0se1wiLi9IZWFkZXJJdGVtXCI6MjQsXCIuL2FuaW1hdGlvbnNcIjoyN31dLDMwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCA9IGZ1bmN0aW9uKGh0bWwpIHtcbiAgY29uc3QgdGVtcFBhcmVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB0ZW1wUGFyZW50LmlubmVySFRNTCA9IGh0bWw7XG4gIHJldHVybiB0ZW1wUGFyZW50LmZpcnN0RWxlbWVudENoaWxkO1xufTtcblxuZnVuY3Rpb24gU2luZ2xldG9uKGZuKSB7XG4gIGZ1bmN0aW9uIENsYXNzKCkge1xuICAgIGlmIChDbGFzcy5pbnN0YW5jZSkge1xuICAgICAgcmV0dXJuIENsYXNzLmluc3RhbmNlO1xuICAgIH1cblxuICAgIHJldHVybiBDbGFzcy5pbnN0YW5jZSA9IGZuKCk7XG4gIH1cblxuICBDbGFzcy5nZXRJbnN0YW5jZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBDbGFzcy5pbnN0YW5jZSB8fCBuZXcgQ2xhc3MoKTtcbiAgfTtcblxuICBDbGFzcy5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgQ2xhc3MuaW5zdGFuY2UgPSBudWxsO1xuICB9O1xuXG4gIHJldHVybiBDbGFzcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCxcbiAgU2luZ2xldG9uXG59O1xufSx7fV0sMzE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge3JlbmRlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvbWFpbicpO1xuY29uc3QgVmVyaWZpY2F0aW9uQ29tcG9uZW50ID0gcmVxdWlyZSgnY3NwLWFwcC9ncm91cHMvYXV0aC92ZXJpZmljYXRpb24nKTtcblxuZnVuY3Rpb24gdmVyaWZpY2F0aW9uKCkge1xuICByZW5kZXIoW25ldyBWZXJpZmljYXRpb25Db21wb25lbnQoKV0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHZlcmlmaWNhdGlvbjtcbn0se1wiY3NwLWFwcC9jb21wb25lbnRzL21haW5cIjo0LFwiY3NwLWFwcC9ncm91cHMvYXV0aC92ZXJpZmljYXRpb25cIjoxNX1dfSx7fSxbMV0pO1xuIl0sImZpbGUiOiJzb3VyY2UuanMifQ==
