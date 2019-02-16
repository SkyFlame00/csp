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
},{"csp-app/components/dashboard":2,"csp-app/components/root":4,"csp-app/components/root/MainController":3,"csp-app/components/start/start":9,"csp-app/libs/router":16,"csp-app/state.js":22}],2:[function(require,module,exports){
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
},{"csp-app/state.js":22}],4:[function(require,module,exports){
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
const StartTabs = require('./tabs');

const Start = function() {
  const wrapper = document.createElement('div');
  wrapper.id = 'start-component';
  wrapper.innerHTML = template();
  // wrapper.querySelector('#login .login-form').appendChild(forms.loginForm.ref);
  const startpage = wrapper.querySelector('.start-tabs');
  startpage.appendChild(StartTabs.header.element);
  startpage.appendChild(StartTabs.content.element);
  StartTabs.content.items[0].querySelector('.login-block .form').appendChild(forms.loginForm.ref);

  return {
    element: wrapper,
    render: function() {

    }
  };
};

module.exports = Singleton(Start);
},{"./forms":8,"./start.tpl":10,"./tabs":12,"csp-app/components/root/MainController":3}],10:[function(require,module,exports){
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


`
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
`
},{}],11:[function(require,module,exports){
const Tabs = require('csp-app/libs/tabs');
const createElementFromHTML = require('csp-app/libs/utilities').createElementFromHTML;
const {clientForm, execForm} = require('../forms');

const clientFormBlock = createElementFromHTML(/*html*/`
  <div class="client-form form"></div>
`);

const execFormBlock = createElementFromHTML(/*html*/`
  <div class="exec-form form"></div>
`);

const SignupTabs = new Tabs({
  header: {
    className: 'actions clearfix',
    items: [
      {title: 'Sign up as client', tag: 'button'},
      {title: 'Sign up as executor', tag: 'button'}
    ]
  },
  content: {
    className: 'signup-form',
    items: [
      clientFormBlock,
      execFormBlock
    ]
  },
  animation: 'defaultAnim'
});

SignupTabs.content.items[0].appendChild(clientForm.ref);
SignupTabs.content.items[1].appendChild(execForm.ref);

module.exports = SignupTabs;
},{"../forms":8,"csp-app/libs/tabs":20,"csp-app/libs/utilities":21}],12:[function(require,module,exports){
const Tabs = require('csp-app/libs/tabs');
const createElementFromHTML = require('csp-app/libs/utilities').createElementFromHTML;
const SignupTabs = require('./SignupTabs');

const loginBlock = createElementFromHTML(/*html*/`
  <div class="login-block">
    <div class="header"><h2>Log in</h2></div>
    <div class="form"></div>
  </div>
`);

const signupBlock = createElementFromHTML(/*html*/`
  <div class="signup-block"></div>
`);

const StartTabs = new Tabs({
  header: {
    className: 'main-actions',
    items: [
      {title: 'Log in', tag: 'span'},
      {title: 'Sign up', tag: 'span'}
    ]
  },
  content: {
    items: [
      loginBlock,
      signupBlock
    ]
  },
  animation: 'defaultAnim'
});

StartTabs.content.items[1].appendChild(SignupTabs.header.element);
StartTabs.content.items[1].appendChild(SignupTabs.content.element);

module.exports = StartTabs;
},{"./SignupTabs":11,"csp-app/libs/tabs":20,"csp-app/libs/utilities":21}],13:[function(require,module,exports){
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
},{"csp-app/components/root/MainController.js":3,"csp-app/state.js":22}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
const defaultAnim = require('./default');

module.exports = {
  defaultAnim
};
},{"./default":18}],20:[function(require,module,exports){
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
    if (result) {
      anim.handler.call(tabs, evt);
    }
  });

  anim.initialize.call(tabs, opts.animation.initializer || 1);

  return tabs;
};

module.exports = Tabs;
},{"./HeaderItem":17,"./animations":19}],21:[function(require,module,exports){
const createElementFromHTML = function(html) {
  const tempParent = document.createElement('div');
  tempParent.innerHTML = html;
  return tempParent.firstElementChild;
};

module.exports = {
  createElementFromHTML
};
},{}],22:[function(require,module,exports){
const app = {
    components: {},
    path: []
};

module.exports = app;
},{}]},{},[1]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzb3VyY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBSb290ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QnKTtcbi8vIGNvbnN0IFN0YXJ0UGFnZSA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9zdGFydHBhZ2UnKTtcbmNvbnN0IERhc2hib2FyZCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmQnKTtcbmNvbnN0IE1haW5Db250cm9sbGVyID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QvTWFpbkNvbnRyb2xsZXInKTtcbmNvbnN0IGFwcCA9IHJlcXVpcmUoJ2NzcC1hcHAvc3RhdGUuanMnKTtcbi8vIGNvbnN0IFRlc3QgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvdGVzdCcpO1xuXG5jb25zdCBSb3V0ZXIgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvcm91dGVyJylcbmNvbnN0IFN0YXJ0ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3N0YXJ0L3N0YXJ0Jyk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBjb25zdCBsaW5rID0gZXZ0LnRhcmdldC5jbG9zZXN0KCdhJyk7XG5cbiAgICBpZiAobGluayAmJiBsaW5rLmRhdGFzZXQucm91dGUpIHtcbiAgICAgICAgUm91dGVyLm5hdmlnYXRlKGxpbmsuZGF0YXNldC5yb3V0ZSk7XG4gICAgfVxufSk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIGV2dCA9PiB7XG4gICAgY29uc29sZS5sb2coJ3BhZ2UgY2hhbmdlZDogJywgZG9jdW1lbnQubG9jYXRpb24pO1xuICAgIGNvbnNvbGUubG9nKGV2dCk7XG4gICAgUm91dGVyLm5hdmlnYXRlKGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lKTtcbn0pO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oZXZ0KSB7XG4gICAgbGV0IHBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgY29uc3Qgcm9vdEluc3RhbmNlID0gUm9vdC5jcmVhdGUoKTtcbiAgICBNYWluQ29udHJvbGxlci5pbml0aWFsaXplKHJvb3RJbnN0YW5jZSk7XG5cbiAgICBjb25zb2xlLmxvZyhwYXRoKTtcblxuICAgIC8vIHBhdGggPSBwYXRoWzBdID09PSAnLycgPyBwYXRoLnN1YnN0cigxKTogcGF0aDtcbiAgICAvLyBwYXRoID0gcGF0aFtwYXRoLmxlbmd0aC0xXSA9PT0gJy8nID8gcGF0aC5zdWJzdHIoMCwgcGF0aC5sZW5ndGgtMSkgOiBwYXRoO1xuXG4gICAgLy8gbGV0IHJvdXRlcyA9IFtcbiAgICAvLyAgICAge1xuICAgIC8vICAgICAgICAgcmVnZXhwOiAvXmdlbnJlcyQvZ2ksXG4gICAgLy8gICAgICAgICBoYW5kbGVyOiAnZ2VucmVzIGhhbmRsZXInXG4gICAgLy8gICAgIH0sXG4gICAgLy8gICAgIHtcbiAgICAvLyAgICAgICAgIHJlZ2V4cDogL15nZW5yZXNcXC8oW15cXC9cXHNdKykoPzpcXC98JCkvZ2ksXG4gICAgLy8gICAgICAgICBwYXJhbXNOYW1lczogWydnZW5yZSddLFxuICAgIC8vICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAvLyAgICAgICAgICAgICB7XG4gICAgLy8gICAgICAgICAgICAgICAgIHJlZ2V4cDogL15cXC8kL2dpLFxuICAgIC8vICAgICAgICAgICAgICAgICBoYW5kbGVyOiAnZ2VucmUgaGFuZGxlcidcbiAgICAvLyAgICAgICAgICAgICB9LFxuICAgIC8vICAgICAgICAgICAgIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgcmVnZXhwOiAvXm1vdmllcyg/OlxcL3wkKS9naSxcbiAgICAvLyAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICByZWdleHA6IC9eXFwvJC9naSxcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyOiAnbW92aWVzIGhhbmRsZXInXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB9LFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAge1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2V4cDogL14oW15cXC9cXHNdKykkL2dpLFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtc05hbWVzOiBbJ21vdmllJ10sXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcjogJ21vdmllIGhhbmRsZXInXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICAgICAgICAgIF1cbiAgICAvLyAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICBdXG4gICAgLy8gICAgIH1cbiAgICAvLyBdO1xuXG4gICAgY29uc3Qgcm91dGVyID0gbmV3IFJvdXRlcigpO1xuICAgIC8vIHJvdXRlclxuICAgIC8vICAgICAuYWRkUm91dGUoJ2dlbnJlcy8oOmdlbnJlKS9tb3ZpZXMnLCBmdW5jdGlvbigpe2NvbnNvbGUubG9nKCdyb3V0ZSAxJyl9KVxuICAgIC8vICAgICAuYWRkUm91dGUoJ2dlbnJlcy8oOmdlbnJlKS9tb3ZpZXMvKDptb3ZpZSknLCBmdW5jdGlvbigpe2NvbnNvbGUubG9nKCdyb3V0ZSAyJyl9KVxuICAgIC8vICAgICAuYWRkUm91dGUoJ2xpYi8oOmJvb2spJywgZnVuY3Rpb24oKXtjb25zb2xlLmxvZygncm91dGUgMycpfSlcblxuICAgIC8vIGNvbnNvbGUubG9nKHJvdXRlci5yb3V0ZXMpXG5cbiAgICAvLyBjb25zb2xlLmxvZygnUm91dGVyOiAnLCBSb3V0ZXIpXG4gICAgLy8gY29uc29sZS5sb2coJ1JvdXRlci5wcm90b3R5cGU6ICcsIFJvdXRlci5wcm90b3R5cGUpXG4gICAgLy8gY29uc29sZS5sb2coJ3JvdXRlcjogJywgcm91dGVyKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKCdjb25zdHJ1Y3RvcjE6ICcsIFJvdXRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPT09IFJvdXRlcilcbiAgICAvLyBjb25zb2xlLmxvZygnY29uc3RydWN0b3IyOiAnLCByb3V0ZXIuX19wcm90b19fLmNvbnN0cnVjdG9yID09PSBSb3V0ZXIpXG4gICAgcm91dGVyXG4gICAgICAgIC5hZGRSb3V0ZSgnLycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgTWFpbkNvbnRyb2xsZXIucmVuZGVyQ2hhaW4oW25ldyBTdGFydCgpXSlcbiAgICAgICAgfSlcbiAgICBcblxuICAgIHJvdXRlci5uYXZpZ2F0ZShwYXRoKVxufSk7XG59LHtcImNzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmRcIjoyLFwiY3NwLWFwcC9jb21wb25lbnRzL3Jvb3RcIjo0LFwiY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QvTWFpbkNvbnRyb2xsZXJcIjozLFwiY3NwLWFwcC9jb21wb25lbnRzL3N0YXJ0L3N0YXJ0XCI6OSxcImNzcC1hcHAvbGlicy9yb3V0ZXJcIjoxNixcImNzcC1hcHAvc3RhdGUuanNcIjoyMn1dLDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgRGFzaGJvYXJkID0ge1xuICAgIGh0bWw6IGBcbiAgICAgICAgPGRpdiBpZD1cImRhc2hib2FyZFwiPlxuICAgICAgICAgICAgPGgxPkhlbGxvIHdvcmxkITwvaDE+XG4gICAgICAgICAgICA8YSBkYXRhLXJvdXRlPVwidGVzdFwiPkdvIHRvIFRlc3QgY29tcG9uZW50PC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGluc3RhbnRpYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgdGVtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0ZW1wLmlubmVySFRNTCA9IHRoaXMuaHRtbDtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRlbXAuZmlyc3RFbGVtZW50Q2hpbGRcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZWZlcmVuY2U6IGVsZW1lbnQsXG4gICAgICAgICAgICBhY3Rpb25zOiB7XG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbihET01UcmVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoRE9NVHJlZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEYXNoYm9hcmQ7XG59LHt9XSwzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGFwcCA9IHJlcXVpcmUoJ2NzcC1hcHAvc3RhdGUuanMnKTtcblxuY29uc3QgTWFpbkNvbnRyb2xsZXIgPSB7XG4gICAgcm9vdDogbnVsbCxcbiAgICBwYXRoOiBbXSxcbiAgICAvLyByZW5kZXI6IGZ1bmN0aW9uKGNvbXBvbmVudHNPYmplY3RzKSB7XG4gICAgICAgIFxuICAgIC8vICAgICAvLyBjb25zdCBhbGxSb3V0ZXJzRXhpc3QgPSBpbnN0YW5jZXMuZXZlcnkoaW5zdGFuY2UgPT4gISFpbnN0YW5jZS5yb3V0ZXJPdXRsZXQpO1xuICAgIC8vICAgICAvLyBpZiAoIWFsbFJvdXRlcnNFeGlzdCkgdGhyb3cgbmV3IEVycm9yKCdPbmUgb3IgbW9yZSByb3V0ZXIgb3V0bGV0cyBkbyBub3QgZXhpc3QnKTtcbiAgICAgICAgXG4gICAgLy8gICAgIGNvbnN0IGluZGV4ID0gdGhpcy5wYXRoLmZpbmRJbmRleCgocGFydCwgaSkgPT4ge1xuICAgIC8vICAgICAgICAgcmV0dXJuIHBhcnQucGF0aCAhPT0gY29tcG9uZW50c09iamVjdHNbaV0ucGF0aFxuICAgIC8vICAgICB9KTtcbiAgICAvLyAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAvLyAgICAgICAgIGNvbXBvbmVudHNPYmplY3RzLnNwbGljZSgwLCBpbmRleCk7XG4gICAgLy8gICAgICAgICB0aGlzLnBhdGguc3BsaWNlKGluZGV4KTtcbiAgICAvLyAgICAgICAgIHRoaXMucGF0aC5jb25jYXQoY29tcG9uZW50c09iamVjdHMpO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGVsc2Uge1xuICAgIC8vICAgICAgICAgdGhpcy5wYXRoID0gY29tcG9uZW50c09iamVjdHM7XG4gICAgLy8gICAgIH1cblxuICAgIC8vICAgICBpZiAodGhpcy5wYXRoLmxlbmd0aCA9PT0gY29tcG9uZW50c09iamVjdHMubGVuZ3RoKSB7XG5cbiAgICAvLyAgICAgfVxuICAgICAgICBcblxuICAgIC8vICAgICBpZiAoY29tcG9uZW50c09iamVjdHMubGVuZ3RoID4gMCkge1xuICAgIC8vICAgICAgICAgbGV0IGluc3RhbmNlcyA9IGNvbXBvbmVudHNPYmplY3RzLm1hcChjbyA9PiBjby5jb21wb25lbnQuaW5zdGFudGlhdGUoY28ucGFyYW1ldGVycykpO1xuICAgIC8vICAgICAgICAgLy8gY29uc29sZS5sb2coJ2luc3RhbmNlcycsIGluc3RhbmNlcylcbiAgICAvLyAgICAgICAgIGNvbnN0IHJlbmRlcmVkQ2hhaW4gPSBpbnN0YW5jZXMucmV2ZXJzZSgpLnJlZHVjZSgoYWNjdW11bGF0b3IsIGluc3RhbmNlKSA9PiB7XG4gICAgLy8gICAgICAgICAgICAgaWYgKCEhYWNjdW11bGF0b3IpIGluc3RhbmNlLmFjdGlvbnMucmVuZGVyKGFjY3VtdWxhdG9yLnJlZmVyZW5jZSk7XG4gICAgLy8gICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIC8vICAgICAgICAgfSwgbnVsbCk7XG4gICAgLy8gICAgICAgICBjb25zb2xlLmxvZygncmVuZGVyZWRDaGFpbicsIHJlbmRlcmVkQ2hhaW4pXG4gICAgLy8gICAgICAgICBNYWluQ29udHJvbGxlci5yb290LnJlbmRlcihyZW5kZXJlZENoYWluLnJlZmVyZW5jZSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyB9LFxuICAgIHJlbmRlckNoYWluOiBmdW5jdGlvbihjb21wb25lbnRzKSB7XG4gICAgICBjb21wb25lbnRzLnJlZHVjZSgoYWNjLCBjb21wb25lbnQpID0+IHtcbiAgICAgICAgYWNjLnJlbmRlcihjb21wb25lbnQuZWxlbWVudCk7XG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgICB9LCB0aGlzLnJvb3QpXG4gICAgfSxcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihyb290SW5zdGFuY2UpIHtcbiAgICAgIHRoaXMucm9vdCA9IHJvb3RJbnN0YW5jZTtcbiAgICAgIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gJyc7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHJvb3RJbnN0YW5jZS5yZWZlcmVuY2UpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFpbkNvbnRyb2xsZXI7XG59LHtcImNzcC1hcHAvc3RhdGUuanNcIjoyMn1dLDQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgUm9vdCA9IHtcbiAgICBjb21wb25lbnROYW1lOiAnYXBwJyxcbiAgICBodG1sOiBgPGRpdiBpZD1cImFwcFwiPjwvZGl2PmAsXG4gICAgaWRlbnRpZmllcjogJyNhcHAnLFxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIENvbnNpZGVyIHJlaW1wbGVtZW50aW5nIHdpdGggSFRNTDUgdGVtcGxhdGUgZmVhdHVyZSBpbnN0ZWFkIGp1c3QgdXRpbGl6aW5nIGRpdlxuICAgICAgICBjb25zdCB0bXBFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRtcEVsZW0uaW5uZXJIVE1MID0gdGhpcy5odG1sO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdG1wRWxlbS5maXJzdENoaWxkO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZWZlcmVuY2U6IGVsZW1lbnQsXG4gICAgICAgICAgICByb3V0ZXJPdXRsZXQ6IGVsZW1lbnQsXG4gICAgICAgICAgICBjb21wb25lbnROYW1lOiB0aGlzLmNvbXBvbmVudE5hbWUsXG4gICAgICAgICAgICBzdGF0ZToge30sXG4gICAgICAgICAgICBhY3Rpb25zOiAoZnVuY3Rpb24ocm91dGVyT3V0bGV0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZDogZnVuY3Rpb24oZnJhZ21lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlck91dGxldC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlck91dGxldC5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoZWxlbWVudCksXG4gICAgICAgICAgICByZW5kZXI6IChmdW5jdGlvbihyb3V0ZXJPdXRsZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oRE9NVHJlZSkge1xuICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIHJvdXRlck91dGxldC5hcHBlbmRDaGlsZChET01UcmVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KShlbGVtZW50KVxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb290O1xufSx7fV0sNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBGb3JtID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2Zvcm1zJyk7XG5jb25zdCB7bWluTGVuZ3RoLCBtYXhMZW5ndGgsIHN0YXJ0c1dpdGhOdW1iZXJ9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2Zvcm1zL3ZhbGlkYXRvcnMnKTtcblxuY29uc3QgdXNlcm5hbWUgPSB7XG4gIGtleU5hbWU6ICd1c2VybmFtZScsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tdXNlcm5hbWUnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3RleHQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdVc2VybmFtZSd9XG4gIF0sXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ21heExlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtYXhMZW5ndGhcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdzdGFydHNXaXRoTnVtYmVyJyxcbiAgICAgIGhhbmRsZXI6IHN0YXJ0c1dpdGhOdW1iZXJcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IHBhc3N3b3JkID0ge1xuICBrZXlOYW1lOiAncGFzc3dvcmQnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICdwYXNzd29yZCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1Bhc3N3b3JkJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgY29uZmlybVBhc3N3b3JkID0ge1xuICBrZXlOYW1lOiAnY29uZmlybVBhc3N3b3JkJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1jb25maXJtUGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3Bhc3N3b3JkJ30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnQ29uZmlybSBwYXNzd29yZCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGVtYWlsID0ge1xuICBrZXlOYW1lOiAnZW1haWwnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICd0ZXh0J30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnRS1tYWlsJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgY2xpZW50Rm9ybSA9IG5ldyBGb3JtKHtcbiAgdmFsaWRhdG9yczogW10sXG4gIHN1Ym1pdDoge1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uKHZhbHVlcywgZXZ0KSB7XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3JtIGlzIGNsZWFuJyk7XG4gICAgfVxuICB9LFxuICBjb250cm9sczogW1xuICAgIHVzZXJuYW1lLFxuICAgIHBhc3N3b3JkLFxuICAgIGNvbmZpcm1QYXNzd29yZCxcbiAgICBlbWFpbFxuICBdXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjbGllbnRGb3JtO1xufSx7XCJjc3AtYXBwL2xpYnMvZm9ybXNcIjoxNCxcImNzcC1hcHAvbGlicy9mb3Jtcy92YWxpZGF0b3JzXCI6MTV9XSw2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMnKTtcbmNvbnN0IHttaW5MZW5ndGgsIG1heExlbmd0aCwgc3RhcnRzV2l0aE51bWJlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMvdmFsaWRhdG9ycycpO1xuXG5jb25zdCB1c2VybmFtZSA9IHtcbiAga2V5TmFtZTogJ3VzZXJuYW1lJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS11c2VybmFtZScsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAndGV4dCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1VzZXJuYW1lJ31cbiAgXSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnbWF4TGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1heExlbmd0aFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3N0YXJ0c1dpdGhOdW1iZXInLFxuICAgICAgaGFuZGxlcjogc3RhcnRzV2l0aE51bWJlclxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgcGFzc3dvcmQgPSB7XG4gIGtleU5hbWU6ICdwYXNzd29yZCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tcGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3Bhc3N3b3JkJ30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnUGFzc3dvcmQnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBjb25maXJtUGFzc3dvcmQgPSB7XG4gIGtleU5hbWU6ICdjb25maXJtUGFzc3dvcmQnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLWNvbmZpcm1QYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAncGFzc3dvcmQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdDb25maXJtIHBhc3N3b3JkJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgZW1haWwgPSB7XG4gIGtleU5hbWU6ICdlbWFpbCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tcGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3RleHQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdFLW1haWwnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBvcmcgPSB7XG4gIGtleU5hbWU6ICdvcmcnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICd0ZXh0J30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnWW91ciBvcmdhbml6YXRpb24nfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBleGVjRm9ybSA9IG5ldyBGb3JtKHtcbiAgdmFsaWRhdG9yczogW10sXG4gIHN1Ym1pdDoge1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uKHZhbHVlcywgZXZ0KSB7XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3JtIGlzIGNsZWFuJyk7XG4gICAgfVxuICB9LFxuICBjb250cm9sczogW1xuICAgIHVzZXJuYW1lLFxuICAgIHBhc3N3b3JkLFxuICAgIGNvbmZpcm1QYXNzd29yZCxcbiAgICBlbWFpbCxcbiAgICBvcmdcbiAgXVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhlY0Zvcm07XG59LHtcImNzcC1hcHAvbGlicy9mb3Jtc1wiOjE0LFwiY3NwLWFwcC9saWJzL2Zvcm1zL3ZhbGlkYXRvcnNcIjoxNX1dLDc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgRm9ybSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3JtcycpO1xuY29uc3Qge21pbkxlbmd0aCwgbWF4TGVuZ3RoLCBzdGFydHNXaXRoTnVtYmVyfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3Jtcy92YWxpZGF0b3JzJyk7XG5cbmNvbnN0IHVzZXJuYW1lID0ge1xuICBrZXlOYW1lOiAndXNlcm5hbWUnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXVzZXJuYW1lJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICd0ZXh0J30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnVXNlcm5hbWUnfVxuICBdLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdtYXhMZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWF4TGVuZ3RoXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnc3RhcnRzV2l0aE51bWJlcicsXG4gICAgICBoYW5kbGVyOiBzdGFydHNXaXRoTnVtYmVyXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBwYXNzd29yZCA9IHtcbiAga2V5TmFtZTogJ3Bhc3N3b3JkJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1wYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAncGFzc3dvcmQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdQYXNzd29yZCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGxvZ2luRm9ybSA9IG5ldyBGb3JtKHtcbiAgdmFsaWRhdG9yczogW10sXG4gIHN1Ym1pdDoge1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uKHZhbHVlcywgZXZ0KSB7XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3JtIGlzIGNsZWFuJyk7XG4gICAgfVxuICB9LFxuICBjb250cm9sczogW1xuICAgIHVzZXJuYW1lLFxuICAgIHBhc3N3b3JkXG4gIF1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvZ2luRm9ybTtcbn0se1wiY3NwLWFwcC9saWJzL2Zvcm1zXCI6MTQsXCJjc3AtYXBwL2xpYnMvZm9ybXMvdmFsaWRhdG9yc1wiOjE1fV0sODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBsb2dpbkZvcm0gPSByZXF1aXJlKCcuL0xvZ2luRm9ybScpO1xuY29uc3QgY2xpZW50Rm9ybSA9IHJlcXVpcmUoJy4vQ2xpZW50Rm9ybScpO1xuY29uc3QgZXhlY0Zvcm0gPSByZXF1aXJlKCcuL0V4ZWNGb3JtJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBsb2dpbkZvcm0sXG4gIGNsaWVudEZvcm0sXG4gIGV4ZWNGb3JtXG59O1xufSx7XCIuL0NsaWVudEZvcm1cIjo1LFwiLi9FeGVjRm9ybVwiOjYsXCIuL0xvZ2luRm9ybVwiOjd9XSw5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmZ1bmN0aW9uIFNpbmdsZXRvbihmbikge1xuICBmdW5jdGlvbiBDbGFzcygpIHtcbiAgICBpZiAoQ2xhc3MuaW5zdGFuY2UpIHtcbiAgICAgIHJldHVybiBDbGFzcy5pbnN0YW5jZTtcbiAgICB9XG5cbiAgICByZXR1cm4gQ2xhc3MuaW5zdGFuY2UgPSBmbigpO1xuICB9XG5cbiAgQ2xhc3MuZ2V0SW5zdGFuY2UgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gQ2xhc3MuaW5zdGFuY2UgfHwgbmV3IENsYXNzKCk7XG4gIH07XG5cbiAgQ2xhc3MuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIENsYXNzLmluc3RhbmNlID0gbnVsbDtcbiAgfTtcblxuICByZXR1cm4gQ2xhc3M7XG59XG5cbmNvbnN0IHRlbXBsYXRlID0gcmVxdWlyZSgnLi9zdGFydC50cGwnKTtcbmNvbnN0IE1haW5Db250cm9sbGVyID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QvTWFpbkNvbnRyb2xsZXInKTtcbmNvbnN0IGZvcm1zID0gcmVxdWlyZSgnLi9mb3JtcycpO1xuY29uc3QgU3RhcnRUYWJzID0gcmVxdWlyZSgnLi90YWJzJyk7XG5cbmNvbnN0IFN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgd3JhcHBlci5pZCA9ICdzdGFydC1jb21wb25lbnQnO1xuICB3cmFwcGVyLmlubmVySFRNTCA9IHRlbXBsYXRlKCk7XG4gIC8vIHdyYXBwZXIucXVlcnlTZWxlY3RvcignI2xvZ2luIC5sb2dpbi1mb3JtJykuYXBwZW5kQ2hpbGQoZm9ybXMubG9naW5Gb3JtLnJlZik7XG4gIGNvbnN0IHN0YXJ0cGFnZSA9IHdyYXBwZXIucXVlcnlTZWxlY3RvcignLnN0YXJ0LXRhYnMnKTtcbiAgc3RhcnRwYWdlLmFwcGVuZENoaWxkKFN0YXJ0VGFicy5oZWFkZXIuZWxlbWVudCk7XG4gIHN0YXJ0cGFnZS5hcHBlbmRDaGlsZChTdGFydFRhYnMuY29udGVudC5lbGVtZW50KTtcbiAgU3RhcnRUYWJzLmNvbnRlbnQuaXRlbXNbMF0ucXVlcnlTZWxlY3RvcignLmxvZ2luLWJsb2NrIC5mb3JtJykuYXBwZW5kQ2hpbGQoZm9ybXMubG9naW5Gb3JtLnJlZik7XG5cbiAgcmV0dXJuIHtcbiAgICBlbGVtZW50OiB3cmFwcGVyLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbmdsZXRvbihTdGFydCk7XG59LHtcIi4vZm9ybXNcIjo4LFwiLi9zdGFydC50cGxcIjoxMCxcIi4vdGFic1wiOjEyLFwiY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QvTWFpbkNvbnRyb2xsZXJcIjozfV0sMTA6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuZnVuY3Rpb24gdGVtcGxhdGUoZGF0YSkge1xuICByZXR1cm4gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cImNtcF9zdGFydFwiPlxuICAgICAgPGRpdiBjbGFzcz1cIndyYXBwZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsb2dvLWJsb2NrXCI+XG4gICAgICAgICAgICA8aDE+V2VsY29tZSB0byBDb25zdWx0aW5nIFNlcnZpY2VzIFBsYXRmb3JtPC9oMT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBcbiAgICAgICAgICA8YSBkYXRhLXJvdXRlPVwiL1wiPkhvbWU8L2E+XG4gICAgICAgICAgPGEgZGF0YS1yb3V0ZT1cIi9kYXNoYm9hcmRcIj5EYXNoYm9hcmQ8L2E+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhcnQtdGFic1wiPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xuXG5cbmBcbjxkaXYgY2xhc3M9XCJtYWluLWFjdGlvbnNcIj5cbiAgPGJ1dHRvbiBpZD1cImxvZ2luLXN3aXRjaFwiPkxvZyBpbjwvYnV0dG9uPlxuICA8YnV0dG9uIGlkPVwic2lnbnVwLXN3aXRjaFwiPlNpZ24gdXA8L2J1dHRvbj5cbjwvZGl2PlxuXG48ZGl2IGNsYXNzPVwibG9naW5cIiBpZD1cImxvZ2luXCI+XG4gIDxkaXYgY2xhc3M9XCJoZWFkZXJcIj48aDI+TG9nIGluPC9oMj48L2Rpdj5cbiAgPGRpdiBjbGFzcz1cImxvZ2luLWZvcm0gZm9ybVwiPlxuICAgIFxuICA8L2Rpdj5cbjwvZGl2PlxuXG48ZGl2IGNsYXNzPVwic2lnbnVwXCIgaWQ9XCJzaWdudXBcIj5cbiAgPGRpdiBjbGFzcz1cInRhYi1hY3Rpb25zIGNsZWFyZml4XCI+XG4gICAgPGJ1dHRvbiBpZD1cImNsaWVudC1zd2l0Y2hcIj5TaWduIHVwIGFzIGNsaWVudDwvYnV0dG9uPlxuICAgIDxidXR0b24gaWQ9XCJleGVjLXN3aXRjaFwiPlNpZ24gdXAgYXMgZXhlY3V0b3I8L2J1dHRvbj5cbiAgPC9kaXY+XG5cbiAgPGRpdiBjbGFzcz1cInNpZ251cC1mb3JtXCIgaWQ9XCJzaWdudXAtZm9ybVwiPlxuICAgIDxkaXYgY2xhc3M9XCJjbGllbnQtZm9ybSBmb3JtXCIgaWQ9XCJjbGllbnQtZm9ybVwiPjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJleGVjLWZvcm0gZm9ybVwiIGlkPVwiZXhlYy1mb3JtXCI+PC9kaXY+XG4gIDwvZGl2PlxuPC9kaXY+XG5gXG59LHt9XSwxMTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBUYWJzID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3RhYnMnKTtcbmNvbnN0IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKS5jcmVhdGVFbGVtZW50RnJvbUhUTUw7XG5jb25zdCB7Y2xpZW50Rm9ybSwgZXhlY0Zvcm19ID0gcmVxdWlyZSgnLi4vZm9ybXMnKTtcblxuY29uc3QgY2xpZW50Rm9ybUJsb2NrID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICA8ZGl2IGNsYXNzPVwiY2xpZW50LWZvcm0gZm9ybVwiPjwvZGl2PlxuYCk7XG5cbmNvbnN0IGV4ZWNGb3JtQmxvY2sgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJleGVjLWZvcm0gZm9ybVwiPjwvZGl2PlxuYCk7XG5cbmNvbnN0IFNpZ251cFRhYnMgPSBuZXcgVGFicyh7XG4gIGhlYWRlcjoge1xuICAgIGNsYXNzTmFtZTogJ2FjdGlvbnMgY2xlYXJmaXgnLFxuICAgIGl0ZW1zOiBbXG4gICAgICB7dGl0bGU6ICdTaWduIHVwIGFzIGNsaWVudCcsIHRhZzogJ2J1dHRvbid9LFxuICAgICAge3RpdGxlOiAnU2lnbiB1cCBhcyBleGVjdXRvcicsIHRhZzogJ2J1dHRvbid9XG4gICAgXVxuICB9LFxuICBjb250ZW50OiB7XG4gICAgY2xhc3NOYW1lOiAnc2lnbnVwLWZvcm0nLFxuICAgIGl0ZW1zOiBbXG4gICAgICBjbGllbnRGb3JtQmxvY2ssXG4gICAgICBleGVjRm9ybUJsb2NrXG4gICAgXVxuICB9LFxuICBhbmltYXRpb246ICdkZWZhdWx0QW5pbSdcbn0pO1xuXG5TaWdudXBUYWJzLmNvbnRlbnQuaXRlbXNbMF0uYXBwZW5kQ2hpbGQoY2xpZW50Rm9ybS5yZWYpO1xuU2lnbnVwVGFicy5jb250ZW50Lml0ZW1zWzFdLmFwcGVuZENoaWxkKGV4ZWNGb3JtLnJlZik7XG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbnVwVGFicztcbn0se1wiLi4vZm9ybXNcIjo4LFwiY3NwLWFwcC9saWJzL3RhYnNcIjoyMCxcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjoyMX1dLDEyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IFRhYnMgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdGFicycpO1xuY29uc3QgY3JlYXRlRWxlbWVudEZyb21IVE1MID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpLmNyZWF0ZUVsZW1lbnRGcm9tSFRNTDtcbmNvbnN0IFNpZ251cFRhYnMgPSByZXF1aXJlKCcuL1NpZ251cFRhYnMnKTtcblxuY29uc3QgbG9naW5CbG9jayA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCgvKmh0bWwqL2BcbiAgPGRpdiBjbGFzcz1cImxvZ2luLWJsb2NrXCI+XG4gICAgPGRpdiBjbGFzcz1cImhlYWRlclwiPjxoMj5Mb2cgaW48L2gyPjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJmb3JtXCI+PC9kaXY+XG4gIDwvZGl2PlxuYCk7XG5cbmNvbnN0IHNpZ251cEJsb2NrID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICA8ZGl2IGNsYXNzPVwic2lnbnVwLWJsb2NrXCI+PC9kaXY+XG5gKTtcblxuY29uc3QgU3RhcnRUYWJzID0gbmV3IFRhYnMoe1xuICBoZWFkZXI6IHtcbiAgICBjbGFzc05hbWU6ICdtYWluLWFjdGlvbnMnLFxuICAgIGl0ZW1zOiBbXG4gICAgICB7dGl0bGU6ICdMb2cgaW4nLCB0YWc6ICdzcGFuJ30sXG4gICAgICB7dGl0bGU6ICdTaWduIHVwJywgdGFnOiAnc3Bhbid9XG4gICAgXVxuICB9LFxuICBjb250ZW50OiB7XG4gICAgaXRlbXM6IFtcbiAgICAgIGxvZ2luQmxvY2ssXG4gICAgICBzaWdudXBCbG9ja1xuICAgIF1cbiAgfSxcbiAgYW5pbWF0aW9uOiAnZGVmYXVsdEFuaW0nXG59KTtcblxuU3RhcnRUYWJzLmNvbnRlbnQuaXRlbXNbMV0uYXBwZW5kQ2hpbGQoU2lnbnVwVGFicy5oZWFkZXIuZWxlbWVudCk7XG5TdGFydFRhYnMuY29udGVudC5pdGVtc1sxXS5hcHBlbmRDaGlsZChTaWdudXBUYWJzLmNvbnRlbnQuZWxlbWVudCk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhcnRUYWJzO1xufSx7XCIuL1NpZ251cFRhYnNcIjoxMSxcImNzcC1hcHAvbGlicy90YWJzXCI6MjAsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6MjF9XSwxMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4vLyBjb25zdCBiaW5kVmFsaWRhdG9ycyA9IGZ1bmN0aW9uKGNvbnRyb2wsIHZhbGlkYXRvcnMpIHtcbi8vICAgcmV0dXJuIHZhbGlkYXRvcnMubWFwKHZhbGlkYXRvciA9PiB2YWxpZGF0b3IuYmluZChjb250cm9sKSk7XG4vLyB9O1xuXG5jb25zdCB2YWxpZGF0ZSA9IGZ1bmN0aW9uKGNvbnRyb2wpIHtcbiAgY29udHJvbCA9IGNvbnRyb2wgfHwgdGhpcztcbiAgbGV0IGFkZCA9IHt9O1xuICBsZXQgcmVtb3ZlID0ge307XG4gIGxldCBpdGVtcyA9IGNvbnRyb2wuZXJyb3JzLml0ZW1zO1xuICBsZXQgdmFsaWRhdG9ycyA9IGNvbnRyb2wudmFsaWRhdG9ycztcblxuICAvLyB2YWxpZGF0b3JzID0gdmFsaWRhdG9ycy5maWx0ZXIodmFsaWRhdG9yID0+IHtcbiAgLy8gICBsZXQgcmVzdWx0ID0gdmFsaWRhdG9yLmNvbmRpdGlvbnMuZXZlcnkoZm4gPT4gZm4oY29udHJvbC52YWx1ZSkpO1xuICAvLyAgIGlmICghcmVzdWx0ICYmIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAvLyAgICAgcmVtb3ZlW3ZhbGlkYXRvci5uYW1lXSA9IHRydWU7XG4gIC8vICAgfVxuICAvLyAgIHJldHVybiByZXN1bHQ7XG4gIC8vIH0pO1xuXG4gIGlmIChjb250cm9sLnZhbHVlID09PSAnJykge1xuICAgIE9iamVjdC5rZXlzKGl0ZW1zKS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgaWYgKCEhaXRlbXNbaXRlbV0pIHJlbW92ZVtpdGVtXSA9IHRydWU7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoY29udHJvbC5yZXF1aXJlZCAmJiBjb250cm9sLnZhbHVlID09PSAnJykge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9ICdUaGlzIGZpZWxkIGlzIHJlcXVpcmVkJztcbiAgICBpdGVtc1sncmVxdWlyZWQnXSA9IHtcbiAgICAgIHJlZjogZWxlbWVudFxuICAgIH1cbiAgICBjb250cm9sLmVycm9ycy5yZWYuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgLy8gcmV0dXJuO1xuICB9XG5cbiAgLy8gaWYgKCFjb250cm9sLnJlcXVpcmVkICYmIGNvbnRyb2wudmFsdWUgPT09ICcnKSB7XG4gIC8vICAgcmV0dXJuO1xuICAvLyB9XG5cbiAgaWYgKGNvbnRyb2wudmFsdWUubGVuZ3RoID4gMCAmJiAhIWl0ZW1zWydyZXF1aXJlZCddKSB7XG4gICAgcmVtb3ZlWydyZXF1aXJlZCddID0gdHJ1ZTtcbiAgfVxuXG4gIGlmIChjb250cm9sLnZhbHVlICE9PSAnJykge1xuICAgIHZhbGlkYXRvcnMuZm9yRWFjaCh2YWxpZGF0b3IgPT4ge1xuICAgICAgbGV0IHJlc3VsdCA9IHZhbGlkYXRvci5oYW5kbGVyKGNvbnRyb2wudmFsdWUsIGNvbnRyb2wpO1xuICAgICAgaWYgKCFyZXN1bHQudmFsaWQgJiYgIWl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgICAgICBhZGRbdmFsaWRhdG9yLm5hbWVdID0gcmVzdWx0O1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAocmVzdWx0LnZhbGlkICYmIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgICAgICByZW1vdmVbdmFsaWRhdG9yLm5hbWVdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIE9iamVjdC5rZXlzKGFkZCkuZm9yRWFjaChlcnJvciA9PiB7XG4gICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gYWRkW2Vycm9yXS5tZXNzYWdlO1xuICAgIGl0ZW1zW2Vycm9yXSA9IHtcbiAgICAgIHJlZjogZWxlbWVudFxuICAgIH07XG4gICAgY29udHJvbC5lcnJvcnMucmVmLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICB9KTtcblxuICBPYmplY3Qua2V5cyhyZW1vdmUpLmZvckVhY2goZXJyb3IgPT4ge1xuICAgIGl0ZW1zW2Vycm9yXS5yZWYucmVtb3ZlKCk7XG4gICAgaXRlbXNbZXJyb3JdID0gbnVsbDtcbiAgfSk7XG59O1xuXG5jb25zdCBiaW5kRXJyb3JIYW5kbGluZyA9IGZ1bmN0aW9uKGNvbnRyb2wpIHtcbiAgY29udHJvbC5jb250cm9sUmVmLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgIHZhbGlkYXRlKGNvbnRyb2wpO1xuICB9KTtcbn07XG5cbmNvbnN0IHRhZ0lucHV0ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBsZXQgcHJlcGVuZCA9IG9wdGlvbnMucHJlcGVuZCB8fCAnJztcbiAgbGV0IGFwcGVuZCA9IG9wdGlvbnMuYXBwZW5kIHx8ICcnO1xuICBsZXQgbGFiZWwgPVxuICAgIG9wdGlvbnMubGFiZWwgP1xuICAgIGA8bGFiZWwgZm9yPVwiJHtvcHRpb25zLmlkfVwiPiR7b3B0aW9ucy5sYWJlbH08L2xhYmVsPmAgOlxuICAgICcnO1xuICBsZXQgZXJyb3JzID0gb3B0aW9ucy5lcnJvcnM7XG4gIGxldCBlcnJvcnNQb3NpdGlvbiA9XG4gICAgZXJyb3JzICYmIGVycm9ycy5wb3NpdGlvbiA/XG4gICAgZXJyb3JzICYmIGVycm9ycy5wb3NpdGlvbiA6XG4gICAgJ2JlZm9yZUFwcGVuZCc7XG4gIGxldCBlcnJvcnNDbGFzcyA9XG4gICAgZXJyb3JzICYmIGVycm9ycy5jbGFzcyA/XG4gICAgZXJyb3JzICYmIGVycm9ycy5jbGFzcyA6XG4gICAgJ2Vycm9ycydcbiAgbGV0IGVycm9yc0hUTUwgPSBgPGRpdiBjbGFzcz1cIiR7ZXJyb3JzQ2xhc3N9XCI+PC9kaXY+YDtcbiAgbGV0IGNvbnRyb2xIVE1MID0gJzxpbnB1dD4nO1xuICBsZXQgaHRtbDtcbiAgXG4gIHN3aXRjaCAoZXJyb3JzUG9zaXRpb24pIHtcbiAgICBjYXNlICdiZWZvcmVQcmVwZW5kJzpcbiAgICAgIGh0bWwgPSBlcnJvcnNIVE1MICsgcHJlcGVuZCArIGxhYmVsICsgY29udHJvbEhUTUwgKyBhcHBlbmQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdiZWZvcmVMYWJlbCc6XG4gICAgICBodG1sID0gcHJlcGVuZCArIGVycm9yc0hUTUwgKyBsYWJlbCArIGNvbnRyb2xIVE1MICsgYXBwZW5kO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmVmb3JlQ29udHJvbCc6XG4gICAgICBodG1sID0gcHJlcGVuZCArIGxhYmVsICsgZXJyb3JzSFRNTCArIGNvbnRyb2xIVE1MICsgYXBwZW5kO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmVmb3JlQXBwZW5kJzpcbiAgICAgIGh0bWwgPSBwcmVwZW5kICsgbGFiZWwgKyBjb250cm9sSFRNTCArIGVycm9yc0hUTUwgKyBhcHBlbmQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdhZnRlckFwcGVuZCc6XG4gICAgICBodG1sID0gcHJlcGVuZCArIGxhYmVsICsgY29udHJvbEhUTUwgKyBhcHBlbmQgKyBlcnJvcnNIVE1MO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICBsZXQgY29udHJvbElkID0gJ2lucHV0JzsgLy8gdG8gaWRlbnRpZnkgaXQgaW4gdGhlIERPTSB3aGVuIGl0J3MgcmVuZGVyZWRcbiAgbGV0IGVycm9yc0lkID0gZXJyb3JzQ2xhc3M7IC8vIGZvciB0aGlzIHRvb1xuXG4gIGxldCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHdyYXBwZXIuY2xhc3NOYW1lID0gKG9wdGlvbnMud3JhcHBlciAmJiBvcHRpb25zLndyYXBwZXIuY2xhc3MpIHx8ICcnO1xuICB3cmFwcGVyLmlubmVySFRNTCA9IGh0bWw7XG4gIGxldCBjb250cm9sUmVmID0gd3JhcHBlci5xdWVyeVNlbGVjdG9yKGNvbnRyb2xJZCk7XG4gIGxldCBlcnJvcnNSZWYgPSB3cmFwcGVyLnF1ZXJ5U2VsZWN0b3IoJy4nK2Vycm9yc0lkKTtcblxuICBpZiAob3B0aW9ucy5hdHRyaWJ1dGVzKSB7XG4gICAgb3B0aW9ucy5hdHRyaWJ1dGVzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBjb250cm9sUmVmLnNldEF0dHJpYnV0ZShhdHRyLm5hbWUsIGF0dHIudmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gbGV0IHZhbGlkYXRvcnMgPSBiaW5kVmFsaWRhdG9ycyhjb250cm9sLCBvcHRpb25zLnZhbGlkYXRvcnMpO1xuXG4gIGxldCBjb250cm9sID0ge1xuICAgIGtleU5hbWU6IG9wdGlvbnMua2V5TmFtZSB8fCAnJyxcbiAgICByZWY6IHdyYXBwZXIsXG4gICAgY29udHJvbFJlZjogY29udHJvbFJlZixcbiAgICBlcnJvcnM6IHtcbiAgICAgIHJlZjogZXJyb3JzUmVmLFxuICAgICAgaXRlbXM6IHt9XG4gICAgfSxcbiAgICByZXF1aXJlZDogb3B0aW9ucy5yZXF1aXJlZCB8fCBmYWxzZSxcbiAgICB2YWxpZDogbnVsbCxcbiAgICB2YWxpZGF0b3JzOiBvcHRpb25zLnZhbGlkYXRvcnMgfHwgW10sXG4gICAgdmFsaWRhdGU6IHZhbGlkYXRlXG4gIH07XG5cbiAgYmluZEVycm9ySGFuZGxpbmcoY29udHJvbCk7XG5cbiAgaWYgKG9wdGlvbnMuaGFuZGxlcnNPYmpzKSB7XG4gICAgbGV0IGV2ZW50cyA9IHt9O1xuICAgIGxldCBoYW5kbGVyc09ianMgPSBvcHRpb25zLmhhbmRsZXJzO1xuICAgIGhhbmRsZXJzT2Jqcy5mb3JFYWNoKG9iaiA9PiB7XG4gICAgICBpZiAoIWV2ZW50c1tvYmouZXZlbnRdKSB7XG4gICAgICAgIGV2ZW50c1tvYmouZXZlbnRdID0gW107XG4gICAgICB9XG4gICAgICBldmVudHNbb2JqLmV2ZW50XS5wdXNoKG9iai5oYW5kbGVyKTtcbiAgICB9KTtcbiAgICBPYmplY3Qua2V5cyhldmVudHMpLmZvckVhY2goZXZlbnROYW1lID0+IHtcbiAgICAgIGNvbnRyb2wuY29udHJvbFJlZi5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZXZ0ID0+IHtcbiAgICAgICAgZXZlbnRzW2V2ZW50TmFtZV0uZm9yRWFjaChoYW5kbGVyID0+IGhhbmRsZXIoZXZ0KSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb250cm9sLCAndmFsdWUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gdGhpcy5jb250cm9sUmVmLnZhbHVlfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7dGhpcy5jb250cm9sUmVmLnZhbHVlID0gbmV3VmFsdWV9XG4gIH0pXG5cbiAgcmV0dXJuIGNvbnRyb2w7XG59O1xuXG5jb25zdCBnZXRIYW5kbGVyID0gZnVuY3Rpb24odGFnKSB7XG4gIGxldCBmbjtcbiAgLy8gU3dpdGNoIHNlZW1zIHRvIGJlIGZhc3RlciB0aGFuIG9iamVjdCBsb29rIHVwXG4gIC8vIFNlYXJjaCBmb3IgJ2pzIHN3aXRjaCB2cyBvYmplY3QnXG4gIHN3aXRjaCh0YWcpIHtcbiAgICBjYXNlICdpbnB1dCc6XG4gICAgICBmbiA9IHRhZ0lucHV0O1xuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIGZuO1xufTtcblxuY29uc3QgRm9ybUNvbnRyb2wgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHJldHVybiBnZXRIYW5kbGVyKG9wdGlvbnMudGFnKShvcHRpb25zKVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtQ29udHJvbDtcbn0se31dLDE0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm1Db250cm9sID0gcmVxdWlyZSgnLi9Gb3JtQ29udHJvbCcpO1xuXG5jb25zdCB2YWxpZGF0ZSA9IGZ1bmN0aW9uKHZhbGlkYXRvciwgZm9ybSkge1xuICBsZXQgaXRlbXMgPSBmb3JtLmVycm9ycy5pdGVtcztcbiAgbGV0IHZhbHVlcyA9IHZhbGlkYXRvci5jb250cm9scy5tYXAoY3RybCA9PiBjdHJsLnZhbHVlKTtcbiAgbGV0IHJlc3VsdCA9IHZhbGlkYXRvci5oYW5kbGVyKHZhbHVlcyk7XG4gIGlmICghcmVzdWx0LnZhbGlkICYmICFpdGVtc1t2YWxpZGF0b3IubmFtZV0pIHtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSByZXN1bHQubWVzc2FnZTtcbiAgICBpdGVtc1t2YWxpZGF0b3IubmFtZV0gPSB7XG4gICAgICByZWY6IGVsZW1lbnRcbiAgICB9O1xuICAgIGZvcm0uZXJyb3JzLnJlZi5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHJlc3VsdC52YWxpZCAmJiBpdGVtc1t2YWxpZGF0b3IubmFtZV0pIHtcbiAgICBpdGVtc1t2YWxpZGF0b3IubmFtZV0ucmVmLnJlbW92ZSgpO1xuICAgIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSA9IG51bGw7XG4gIH1cbn07XG5cbmNvbnN0IEZvcm0gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIGNvbnN0IGZvcm1Db250cm9scyA9IG9wdGlvbnMuY29udHJvbHMubWFwKGN0cmwgPT4gbmV3IEZvcm1Db250cm9sKGN0cmwpKTtcbiAgbGV0IHZhbGlkYXRvcnMgPSBvcHRpb25zLnZhbGlkYXRvcnMgfHwgW107XG4gIGxldCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO1xuICBsZXQgZXJyb3JzV3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBsZXQgc3VibWl0V3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBsZXQgZm9ybUNvbnRyb2xzUmVmcyA9IGZvcm1Db250cm9scy5tYXAoY3RybCA9PiBjdHJsLnJlZik7XG4gIGVycm9yc1dyYXBwZXIuY2xhc3NOYW1lID0gJ2Vycm9ycyc7XG4gIHN1Ym1pdFdyYXBwZXIuY2xhc3NOYW1lID0gJ2FjdGlvbnMnO1xuICBzdWJtaXRXcmFwcGVyLmlubmVySFRNTCA9ICc8aW5wdXQgdHlwZT1cInN1Ym1pdFwiIHZhbHVlPVwiU3VibWl0XCIgLz4nO1xuICBzdWJtaXRSZWYgPSBzdWJtaXRXcmFwcGVyLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJzdWJtaXRcIl0nKTtcblxuICBbZXJyb3JzV3JhcHBlciwgLi4uZm9ybUNvbnRyb2xzUmVmcywgc3VibWl0V3JhcHBlcl1cbiAgICAuZm9yRWFjaChpdGVtID0+IHdyYXBwZXIuYXBwZW5kQ2hpbGQoaXRlbSkpO1xuICBcbiAgbGV0IGZvcm0gPSB7XG4gICAgcmVmOiB3cmFwcGVyLFxuICAgIGVycm9yczoge1xuICAgICAgcmVmOiBlcnJvcnNXcmFwcGVyLFxuICAgICAgaXRlbXM6IHt9XG4gICAgfSxcbiAgICBjb250cm9sczogZm9ybUNvbnRyb2xzLFxuICAgIHN1Ym1pdDoge1xuICAgICAgaGFuZGxlcjogb3B0aW9ucy5zdWJtaXQuaGFuZGxlclxuICAgIH1cbiAgfTtcblxuICBvcHRpb25zLnZhbGlkYXRvcnMuZm9yRWFjaCh2YWxpZGF0b3IgPT4ge1xuICAgIHZhbGlkYXRvci5jb250cm9scy5mb3JFYWNoKGNvbnRyb2wgPT4ge1xuICAgICAgY29udHJvbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICAgICAgdmFsaWRhdGUodmFsaWRhdG9yLCBmb3JtKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBzdWJtaXRSZWYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxldCBlcnJvcnNBbW91bnQgPSAwO1xuICAgIHZhbGlkYXRvcnMuZm9yRWFjaCh2YWxpZGF0b3IgPT4gdmFsaWRhdGUodmFsaWRhdG9yLCBmb3JtKSk7XG4gICAgZm9ybS5jb250cm9scy5mb3JFYWNoKGN0cmwgPT4gY3RybC52YWxpZGF0ZSgpKTtcbiAgICBPYmplY3QudmFsdWVzKGZvcm0uZXJyb3JzLml0ZW1zKS5mb3JFYWNoKHZhbCA9PiB7XG4gICAgICBpZiAoISF2YWwpIHtcbiAgICAgICAgZXJyb3JzQW1vdW50Kys7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZm9ybS5jb250cm9scy5mb3JFYWNoKGN0cmwgPT4ge1xuICAgICAgT2JqZWN0LnZhbHVlcyhjdHJsLmVycm9ycy5pdGVtcykuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgICBpZiAoISF2YWwpIHtcbiAgICAgICAgICBlcnJvcnNBbW91bnQrKztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgaWYgKGVycm9yc0Ftb3VudCA+IDApIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3JtIGlzIG5vdCB2YWxpZCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgdmFsdWVzID0ge307XG4gICAgZm9ybS5jb250cm9scy5mb3JFYWNoKGN0cmwgPT4ge1xuICAgICAgdmFsdWVzW2N0cmwua2V5TmFtZV0gPSBjdHJsLnZhbHVlO1xuICAgIH0pO1xuICAgIGZvcm0uc3VibWl0LmhhbmRsZXIodmFsdWVzLCBldnQpO1xuICB9KTtcblxuICByZXR1cm4gZm9ybTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybTtcbn0se1wiLi9Gb3JtQ29udHJvbFwiOjEzfV0sMTU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgbWluTGVuZ3RoID0gZnVuY3Rpb24odmFsdWUsIGNvbnRyb2wpIHtcbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogdmFsdWUubGVuZ3RoID49IDUsXG4gICAgbWVzc2FnZTogJ1RoaXMgZmllbGRzXFwncyBsZW5ndGggaXMgbGVzcyB0aGFuIDUgY2hhcnMnXG4gIH1cbn07XG5cbmNvbnN0IG1heExlbmd0aCA9IGZ1bmN0aW9uKHZhbHVlLCBjb250cm9sKSB7XG4gIHJldHVybiB7XG4gICAgdmFsaWQ6IHZhbHVlLmxlbmd0aCA8PSAxMCxcbiAgICBtZXNzYWdlOiAnVGhpcyBmaWVsZHNcXCdzIGxlbmd0aCBpcyBncmVhdGVyIHRoYW4gMTAgY2hhcnMnXG4gIH1cbn07XG5cbmNvbnN0IHN0YXJ0c1dpdGhOdW1iZXIgPSBmdW5jdGlvbih2YWx1ZSwgY29udHJvbCkge1xuICByZXR1cm4ge1xuICAgIHZhbGlkOiAhL15cXGQrL2kudGVzdCh2YWx1ZSksXG4gICAgbWVzc2FnZTogJ1VzZXJuYW1lIG11c3Qgbm90IHN0YXJ0IHdpdGggbnVtYmVycydcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1pbkxlbmd0aCxcbiAgbWF4TGVuZ3RoLFxuICBzdGFydHNXaXRoTnVtYmVyXG59O1xufSx7fV0sMTY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgYXBwID0gcmVxdWlyZSgnY3NwLWFwcC9zdGF0ZS5qcycpO1xuY29uc3QgTWFpbkNvbnRyb2xsZXIgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvcm9vdC9NYWluQ29udHJvbGxlci5qcycpO1xuXG5jb25zdCBSb3V0ZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yb3V0ZXMgPSBbXTtcbn07XG5cblJvdXRlci5wcm90b3R5cGUucmVnZXhwUGFyYW1zID0gLyhcXCg6KFtcXHdcXGRcXC1fXSspXFwpKS9naTtcblxuUm91dGVyLnByb3RvdHlwZS50cmltUm91dGUgPSBmdW5jdGlvbihyb3V0ZSl7XG4gIHJvdXRlID0gcm91dGVbMF0gPT09ICcvJ1xuICAgID8gcm91dGUuc3Vic3RyKDEpXG4gICAgOiByb3V0ZTtcblxuICByb3V0ZSA9IHJvdXRlW3JvdXRlLmxlbmd0aCAtIDFdID09PSAnLydcbiAgICA/IHJvdXRlLnN1YnN0cigwLCByb3V0ZS5sZW5ndGggLSAxKVxuICAgIDogcm91dGU7XG5cbiAgcmV0dXJuIHJvdXRlO1xufSxcblxuUm91dGVyLnByb3RvdHlwZS5nZXRQYXJhbXNOYW1lcyA9IGZ1bmN0aW9uKHJvdXRlKSB7XG4gIGxldCByZXN1bHQ7XG4gIGxldCBwYXJhbXNOYW1lcyA9IFtdO1xuICB3aGlsZSAoKHJlc3VsdCA9IHRoaXMucmVnZXhwUGFyYW1zLmV4ZWMocm91dGUpKSAhPT0gbnVsbCkge1xuICAgIHBhcmFtc05hbWVzLnB1c2gocmVzdWx0WzJdKTtcbiAgfVxuICByZXR1cm4gcGFyYW1zTmFtZXM7XG59XG5cblJvdXRlci5wcm90b3R5cGUuYWRkUm91dGUgPSBmdW5jdGlvbihyb3V0ZSwgaGFuZGxlcikge1xuICByb3V0ZSA9IHRoaXMudHJpbVJvdXRlKHJvdXRlKTtcbiAgbGV0IHBhcmFtc05hbWVzID0gdGhpcy5nZXRQYXJhbXNOYW1lcyhyb3V0ZSk7XG4gIGxldCByZWdleHBTdHIgPSByb3V0ZS5yZXBsYWNlKHRoaXMucmVnZXhwUGFyYW1zLCAnW1xcXFx3XFxcXGRcXC1fXSsnKTtcbiAgbGV0IHJlZ2V4cCA9IFJlZ0V4cChgXiR7cmVnZXhwU3RyfShcXFxcL3wkKWAsICdnaScpO1xuXG4gIGxldCByb3V0ZU9iaiA9IHtcbiAgICByZWdleHA6IHJlZ2V4cCxcbiAgICBwYXJhbXNOYW1lczogcGFyYW1zTmFtZXNcbiAgfTtcblxuICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICByb3V0ZU9iai5oYW5kbGVyID0gaGFuZGxlcjtcbiAgfVxuXG4gIGVsc2UgaWYgKGhhbmRsZXIgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIHJvdXRlT2JqLmNoaWxkcmVuID0gaGFuZGxlcjtcbiAgfVxuXG4gIGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKCdFcnJvciBvY2N1cmVkIHdoaWxlIGFkZGluZyByb3V0ZScpO1xuICAgIHRocm93IG5ldyBFcnJvcigncm91dGUgZXJyb3InKTtcbiAgfVxuXG4gIHRoaXMucm91dGVzLnB1c2gocm91dGVPYmopO1xuICByZXR1cm4gdGhpcztcbn07XG5cblJvdXRlci5wcm90b3R5cGUuZ2V0Um91dGUgPSBmdW5jdGlvbihsaW5rLCByb3V0ZXMgPSB0aGlzLnJvdXRlcywgcGFyYW1zID0ge30pIHtcbiAgbGluayA9IGxpbmsgPT09ICcnID8gJy8nIDogbGluaztcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJvdXRlcy5sZW5ndGgsIHJvdXRlID0gcm91dGVzW2ldOyBpKyspIHtcbiAgICBsZXQgcmVnZXhwID0gcm91dGUucmVnZXhwO1xuICAgIGxldCByZXN1bHQgPSByZWdleHAuZXhlYyhsaW5rKTtcblxuICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCA+IDEpIHtcbiAgICAgIGZvciAobGV0IGlkeCA9IDE7IGlkeCA8IHJlc3VsdC5sZW5ndGg7IGlkeCsrKSB7XG4gICAgICAgIHBhcmFtc1tyb3V0ZS5wYXJhbXNOYW1lc1tpZHgtMV1dID0gcmVzdWx0W2lkeF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJlZ2V4cC5sYXN0SW5kZXggPiAwKSB7XG4gICAgICBsaW5rID0gbGluay5zdWJzdHIocmVnZXhwLmxhc3RJbmRleCk7XG4gICAgfVxuXG4gICAgaWYgKHJlZ2V4cC5sYXN0SW5kZXggPiAwICYmIGxpbmsubGVuZ3RoID4gMCkge1xuICAgICAgaWYgKHJvdXRlLmNoaWxkcmVuICYmIHJvdXRlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGV0IGNoaWxkcmVuQ2hlY2sgPSB0aGlzLmdldFJvdXRlKGxpbmssIHJvdXRlLmNoaWxkcmVuLCBwYXJhbXMpO1xuICAgICAgICBpZiAoY2hpbGRyZW5DaGVjayAhPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBjaGlsZHJlbkNoZWNrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIGVsc2UgaWYgKHJlZ2V4cC5sYXN0SW5kZXggPiAwKSB7XG4gICAgICAvLyBJbiBjYXNlIGl0J3MgdGVybWluYWwgcm91dGVcbiAgICAgIGlmIChyb3V0ZS5oYW5kbGVyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaGFuZGxlcjogcm91dGUuaGFuZGxlcixcbiAgICAgICAgICBwYXJhbXM6IHBhcmFtc1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAocm91dGUuY2hpbGRyZW4pIHtcbiAgICAgICAgbGV0IGNoaWxkcmVuQ2hlY2sgPSB0aGlzLmdldFJvdXRlKGxpbmssIHJvdXRlLmNoaWxkcmVuLCBwYXJhbXMpO1xuICAgICAgICBpZiAoY2hpbGRyZW5DaGVjayAhPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBjaGlsZHJlbkNoZWNrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS5uYXZpZ2F0ZSA9IGZ1bmN0aW9uKGxpbmspIHtcbiAgbGluayA9IHRoaXMudHJpbVJvdXRlKGxpbmspO1xuICBsZXQgcm91dGUgPSB0aGlzLmdldFJvdXRlKGxpbmspO1xuICBpZiAoIXJvdXRlKSB7XG4gICAgY29uc29sZS5sb2coJ0Vycm9yIHdoaWxlIG5hdmlnYXRpbmcgcm91dGUnKTtcbiAgICByZXR1cm47XG4gIH1cbiAgcm91dGUuaGFuZGxlcihyb3V0ZS5wYXJhbXMpO1xuICBjb25zb2xlLmxvZyhsaW5rKVxuICBoaXN0b3J5LnB1c2hTdGF0ZSgnJywgJycsICcvJyArIGxpbmspO1xufTtcblxuY29uc3QgU3Vicm91dGVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucm91dGVzID0gW107XG59O1xuU3Vicm91dGVyLnByb3RvdHlwZSA9IFJvdXRlci5wcm90b3R5cGU7XG5Sb3V0ZXIuU3Vicm91dGVyID0gU3Vicm91dGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJvdXRlcjtcbn0se1wiY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QvTWFpbkNvbnRyb2xsZXIuanNcIjozLFwiY3NwLWFwcC9zdGF0ZS5qc1wiOjIyfV0sMTc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgdGFncyA9IFsnZGl2JywgJ3NwYW4nLCAnYnV0dG9uJ107XG5cbmNvbnN0IEhlYWRlckl0ZW0gPSBmdW5jdGlvbihvcHRzKSB7XG4gIGNvbnN0IHRpdGxlID0gb3B0cy50aXRsZSB8fCAnJztcbiAgY29uc3QgY2xhc3NOYW1lID0gb3B0cy5jbGFzc05hbWUgfHwgJyc7XG4gIGNvbnN0IHRhZyA9IHRhZ3MuZmluZCh0YWcgPT4gdGFnID09PSBvcHRzLnRhZykgP1xuICAgIG9wdHMudGFnIDpcbiAgICAnc3Bhbic7XG5cbiAgY29uc3QgaGVhZGVySXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgaGVhZGVySXRlbS5jbGFzc05hbWUgPSAndGFicy1oZWFkZXItaXRlbSAnICsgY2xhc3NOYW1lO1xuICBoZWFkZXJJdGVtLmlubmVySFRNTCA9IHRpdGxlO1xuXG4gIGlmIChvcHRzLmF0dHJpYnV0ZXMpIHtcbiAgICBvcHRzLmF0dHJpYnV0ZXMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgIGhlYWRlckl0ZW0uc2V0QXR0cmlidXRlKGF0dHIubmFtZSwgYXR0ci52YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGVsZW1lbnQ6IGhlYWRlckl0ZW1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVySXRlbTtcbn0se31dLDE4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGRlZmF1bHRBbmltID0gZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIGhhbmRsZXIoZXZ0KSB7XG4gICAgY29uc3QgdGFiID0gZXZ0LnRhcmdldC5jbG9zZXN0KCcudGFicy1oZWFkZXItaXRlbScpLmRhdGFzZXQub3JkZXI7XG4gICAgdGhpcy5nb3RvVGFiKHRhYik7XG4gIH1cblxuICBmdW5jdGlvbiBnb3RvVGFiKHRhYikge1xuICAgIHRhYi0tO1xuICAgIGNvbnN0IG5ld0hlYWRlckl0ZW0gPSB0aGlzLmhlYWRlci5pdGVtc1t0YWJdO1xuICAgIGNvbnN0IG5ld0NvbnRlbnRJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW3RhYl07XG5cbiAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuXG4gICAgbmV3SGVhZGVySXRlbS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICBuZXdDb250ZW50SXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICBuZXdDb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblxuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0gPSBuZXdIZWFkZXJJdGVtO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtID0gbmV3Q29udGVudEl0ZW07XG4gIH1cblxuICBmdW5jdGlvbiBpbml0aWFsaXplKHRhYikge1xuICAgIHRhYi0tO1xuICAgIGNvbnN0IGFjdGl2ZUhlYWRlckl0ZW0gPSB0aGlzLmhlYWRlci5pdGVtc1t0YWJdO1xuICAgIGNvbnN0IGFjdGl2ZUNvbnRlbnRJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW3RhYl07XG4gICAgY29uc3Qgbm9uQWN0aXZlQ29udGVudEl0ZW1zID0gdGhpcy5jb250ZW50Lml0ZW1zLmZpbHRlcihpdGVtID0+IGl0ZW0gIT09IGFjdGl2ZUNvbnRlbnRJdGVtKTtcblxuICAgIGFjdGl2ZUhlYWRlckl0ZW0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgYWN0aXZlQ29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cbiAgICBub25BY3RpdmVDb250ZW50SXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJykpO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IGFjdGl2ZUhlYWRlckl0ZW07XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSBhY3RpdmVDb250ZW50SXRlbTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlcixcbiAgICBnb3RvVGFiLFxuICAgIGluaXRpYWxpemVcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdEFuaW07XG59LHt9XSwxOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBkZWZhdWx0QW5pbSA9IHJlcXVpcmUoJy4vZGVmYXVsdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZGVmYXVsdEFuaW1cbn07XG59LHtcIi4vZGVmYXVsdFwiOjE4fV0sMjA6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgSGVhZGVySXRlbSA9IHJlcXVpcmUoJy4vSGVhZGVySXRlbScpO1xuY29uc3QgYW5pbXMgPSByZXF1aXJlKCcuL2FuaW1hdGlvbnMnKTtcblxuY29uc3QgVGFicyA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgY29uc3QgaGVhZGVySXRlbXMgPVxuICAgIG9wdHMuaGVhZGVyLml0ZW1zLm1hcChpdGVtID0+IG5ldyBIZWFkZXJJdGVtKGl0ZW0pLmVsZW1lbnQpIHx8IFtdO1xuICBjb25zdCBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgaGVhZGVyLmNsYXNzTmFtZSA9ICd0YWJzLWhlYWRlciAnICsgb3B0cy5oZWFkZXIuY2xhc3NOYW1lO1xuICBoZWFkZXJJdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaGVhZGVyLmFwcGVuZENoaWxkKGl0ZW0pKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGhlYWRlckl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgaGVhZGVySXRlbXNbaV0uZGF0YXNldC5vcmRlciA9IGkrMTtcbiAgfVxuXG4gIGNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgY29udGVudC5jbGFzc05hbWUgPSAndGFicy1jb250ZW50ICcgKyAob3B0cy5jb250ZW50LmNsYXNzTmFtZSB8fCAnJyk7XG4gIGNvbnN0IGNvbnRlbnRJdGVtcyA9IG9wdHMuY29udGVudC5pdGVtcyB8fCBbXTtcbiAgY29udGVudEl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgaXRlbS5jbGFzc0xpc3QuYWRkKCd0YWJzLWNvbnRlbnQtaXRlbScpO1xuICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoaXRlbSk7XG4gIH0pO1xuXG4gIGNvbnN0IGFjdGl2ZSA9IHtcbiAgICBoZWFkZXJJdGVtOiBudWxsLFxuICAgIGNvbnRlbnRJdGVtOiBudWxsXG4gIH07XG5cbiAgY29uc3QgYW5pbSA9IGFuaW1zW29wdHMuYW5pbWF0aW9uLm5hbWVdID9cbiAgICBuZXcgYW5pbXNbb3B0cy5hbmltYXRpb24ubmFtZV0gOlxuICAgIG5ldyBhbmltc1snZGVmYXVsdEFuaW0nXTtcblxuICBjb25zdCB0YWJzID0ge1xuICAgIGhlYWRlcjoge1xuICAgICAgZWxlbWVudDogaGVhZGVyLFxuICAgICAgaXRlbXM6IGhlYWRlckl0ZW1zXG4gICAgfSxcbiAgICBjb250ZW50OiB7XG4gICAgICBlbGVtZW50OiBjb250ZW50LFxuICAgICAgaXRlbXM6IGNvbnRlbnRJdGVtc1xuICAgIH0sXG4gICAgYWN0aXZlOiBhY3RpdmUsXG4gICAgZ290b1RhYjogYW5pbS5nb3RvVGFiLFxuICAgIGltaXRhdGVDbGlja09uVGFiOiBmdW5jdGlvbih0YWIpIHtcbiAgICAgIHRoaXMuaGVhZGVyLml0ZW1zW3RhYl0uY2xpY2soKTtcbiAgICB9XG4gIH07XG4gICAgXG4gIGhlYWRlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2dCA9PiB7XG4gICAgY29uc3QgbGluayA9IGV2dC50YXJnZXQ7XG4gICAgY29uc3QgcmVzdWx0ID0gaGVhZGVySXRlbXMuZmluZChpdGVtID0+IGl0ZW0gPT09IGxpbmsuY2xvc2VzdCgnLnRhYnMtaGVhZGVyLWl0ZW0nKSk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgYW5pbS5oYW5kbGVyLmNhbGwodGFicywgZXZ0KTtcbiAgICB9XG4gIH0pO1xuXG4gIGFuaW0uaW5pdGlhbGl6ZS5jYWxsKHRhYnMsIG9wdHMuYW5pbWF0aW9uLmluaXRpYWxpemVyIHx8IDEpO1xuXG4gIHJldHVybiB0YWJzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYWJzO1xufSx7XCIuL0hlYWRlckl0ZW1cIjoxNyxcIi4vYW5pbWF0aW9uc1wiOjE5fV0sMjE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgY3JlYXRlRWxlbWVudEZyb21IVE1MID0gZnVuY3Rpb24oaHRtbCkge1xuICBjb25zdCB0ZW1wUGFyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHRlbXBQYXJlbnQuaW5uZXJIVE1MID0gaHRtbDtcbiAgcmV0dXJuIHRlbXBQYXJlbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlRWxlbWVudEZyb21IVE1MXG59O1xufSx7fV0sMjI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgYXBwID0ge1xuICAgIGNvbXBvbmVudHM6IHt9LFxuICAgIHBhdGg6IFtdXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcDtcbn0se31dfSx7fSxbMV0pO1xuIl0sImZpbGUiOiJzb3VyY2UuanMifQ==
