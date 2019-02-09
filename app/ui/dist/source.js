(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
    // let res = Router(path, routes);
    // console.log(res);

    // Router.navigate(path);
});
},{"csp-app/components/dashboard":2,"csp-app/components/root":4,"csp-app/components/root/MainController":3,"csp-app/components/startpage":9,"csp-app/components/test":10,"csp-app/libs/router":15,"csp-app/state.js":16}],2:[function(require,module,exports){
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
    render: function(componentsObjects) {
        
        // const allRoutersExist = instances.every(instance => !!instance.routerOutlet);
        // if (!allRoutersExist) throw new Error('One or more router outlets do not exist');
        
        const index = this.path.findIndex((part, i) => {
            return part.path !== componentsObjects[i].path
        });
        if (index > -1) {
            componentsObjects.splice(0, index);
            this.path.splice(index);
            this.path.concat(componentsObjects);
        }
        else {
            this.path = componentsObjects;
        }

        if (this.path.length === componentsObjects.length) {

        }
        

        if (componentsObjects.length > 0) {
            let instances = componentsObjects.map(co => co.component.instantiate(co.parameters));
            // console.log('instances', instances)
            const renderedChain = instances.reverse().reduce((accumulator, instance) => {
                if (!!accumulator) instance.actions.render(accumulator.reference);
                return instance;
            }, null);
            console.log('renderedChain', renderedChain)
            MainController.root.render(renderedChain.reference);
        }
    },
    initialize: function(rootInstance) {
        this.root = rootInstance;
        document.body.innerHTML = '';
        document.body.appendChild(rootInstance.reference);
    }
};

module.exports = MainController;
},{"csp-app/state.js":16}],4:[function(require,module,exports){
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
const { Form, FormElem } = require('csp-app/libs/forms');
const { minLength: minLengthGeneric, maxLength: maxLengthGeneric } = require('csp-app/libs/forms/utilities/validators');
const minLength = minLengthGeneric(4);
const maxLength = maxLengthGeneric(16);

const loginElem = new FormElem({
    html: `
        <div class="input-block clearfix">
            
            <input type="text" id="signup-client-login" placeholder="Login" />
        </div>
        <div class="formelem-errors"></div>`
        ,
    input: { selector: '.input-block input', value: null },
    errors: {
        elemClass: 'formelem-errors'
    },
    validators: [
        {
            handler: minLength,
            message: 'The length is less than 4 chars'
        },
        {
            handler: maxLength,
            message: 'The length is more than 16 chars'
        }
    ]
});

const passwordElem = new FormElem({
    html: `
        <div class="input-block clearfix">
            <input type="password" id="signup-client-password" placeholder="Password" />
        </div>
        <div class="formelem-errors"></div>`,
    input: { selector: '.input-block input', value: null },
    errors: {
        elemClass: 'formelem-errors'
    },
    validators: [
        {
            handler: minLength,
            message: 'The length is less than 4 chars'
        }
    ]
});

const passwordConfElem = new FormElem({
    html: `
        <div class="input-block clearfix">
            
            <input type="password" id="signup-client-passwordconf" placeholder="Confirm password" />
        </div>
        <div class="formelem-errors"></div>`,
    input: { selector: '.input-block input', value: null },
    errors: {
        elemClass: 'formelem-errors'
    },
    validators: [
        {
            handler: minLength,
            message: 'The length is less than 4 chars'
        }
    ]
});

const organization = new FormElem({
    html: `
        <div class="input-block clearfix">
            
            <input type="password" id="signup-client-org" placeholder="Organization" />
        </div>
        <div class="formelem-errors"></div>`,
    input: { selector: '.input-block input', value: null },
    errors: {
        elemClass: 'formelem-errors'
    },
});

const SignupClientForm = new Form({
    name: 'signup-client',
    html: `
        <form>
            <div class="inputs"></div>
            <div class="actions">
                <input type="submit" value="Sign Up">
            </div>
        </form>
    `,
    elems: [loginElem, passwordElem, passwordConfElem, organization],
    whereToPut: '.inputs',
    submit: {
        handler: () => {},
    }
});

module.exports = SignupClientForm;
},{"csp-app/libs/forms":13,"csp-app/libs/forms/utilities/validators":14}],6:[function(require,module,exports){
const { Form, FormElem } = require('csp-app/libs/forms');
const { minLength: minLengthGeneric, maxLength: maxLengthGeneric } = require('csp-app/libs/forms/utilities/validators');
const minLength = minLengthGeneric(4);
const maxLength = maxLengthGeneric(16);

const loginElem = new FormElem({
    html: `
        <div class="input-block clearfix">
            
            <input type="text" id="signup-exec-login" placeholder="Login" />
        </div>
        <div class="formelem-errors"></div>`,
    input: { selector: '.input-block input', value: null },
    errors: {
        elemClass: 'formelem-errors'
    },
    validators: [
        {
            handler: minLength,
            message: 'The length is less than 4 chars'
        },
        {
            handler: maxLength,
            message: 'The length is more than 16 chars'
        }
    ]
});

const passwordElem = new FormElem({
    html: `
        <div class="input-block clearfix">
            
            <input type="password" id="signup-exec-password" placeholder="Password" />
        </div>
        <div class="formelem-errors"></div>`,
    input: { selector: '.input-block input', value: null },
    errors: {
        elemClass: 'formelem-errors'
    },
    validators: [
        {
            handler: minLength,
            message: 'The length is less than 4 chars'
        }
    ]
});

const passwordConfElem = new FormElem({
    html: `
        <div class="input-block clearfix">
            
            <input type="password" id="signup-exec-passwordconf" placeholder="Confirm password"  />
        </div>
        <div class="formelem-errors"></div>`,
    input: { selector: '.input-block input', value: null },
    errors: {
        elemClass: 'formelem-errors'
    },
    validators: [
        {
            handler: minLength,
            message: 'The length is less than 4 chars'
        }
    ]
});

const SignupExecForm = new Form({
    name: 'signup-exec',
    html: `
        <form>
            <div class="inputs"></div>
            <div class="actions">
                <input type="submit" value="Sign Up">
            </div>
        </form>
    `,
    elems: {
        'login': loginElem,
        'pw': passwordElem,
        'pwConf': passwordConfElem
    },
    whereToPut: '.inputs',
    submit: {
        handler: elems => {
            console.log('hello')

            const http = new XMLHttpRequest();

            const regData = {
                login: elems['login'].value,
                passwordElem: elems['pw'].value
            };
            console.log(regData)

            http.addEventListener('load', function(evt) {
                console.log(this.responseText);
            });
            http.open('POST', '/api/getData', true);
            http.setRequestHeader('Content-Type', 'application/json');
            http.send(JSON.stringify(regData));

        },
    }
});

module.exports = SignupExecForm;
},{"csp-app/libs/forms":13,"csp-app/libs/forms/utilities/validators":14}],7:[function(require,module,exports){
const LoginForm = require('./loginform');
const SignupExecForm = require('./execform');
const SignupClientForm = require('./clientform');

module.exports = {
    LoginForm,
    SignupExecForm,
    SignupClientForm
};
},{"./clientform":5,"./execform":6,"./loginform":8}],8:[function(require,module,exports){
const { Form, FormElem } = require('csp-app/libs/forms');
const { minLength: minLengthGeneric, maxLength: maxLengthGeneric } = require('csp-app/libs/forms/utilities/validators');
const minLength = minLengthGeneric(4);
const maxLength = maxLengthGeneric(16);

const loginElem = new FormElem({
    html: `
        <div class="input-block">
            
            <input type="text" id="login-login" placeholder="Login" />
        </div>
        <div class="formelem-errors"></div>`,
    input: { selector: '.input-block input', value: null },
    errors: {
        elemClass: 'formelem-errors'
    },
    validators: [
        {
            handler: minLength,
            message: 'The length is less than 4 chars'
        },
        {
            handler: maxLength,
            message: 'The length is more than 16 chars'
        }
    ]
});

const passwordElem = new FormElem({
    html: `
        <div class="input-block clearfix">
            
            <input type="password" id="login-password" placeholder="Password" />
        </div>
        <div class="formelem-errors"></div>`,
    input: { selector: '.input-block input', value: null },
    errors: {
        elemClass: 'formelem-errors'
    },
    validators: [
        {
            handler: minLength,
            message: 'The length is less than 4 chars'
        }
    ]
});

const LoginForm = new Form({
    name: 'login',
    html: `
        <form>
            <div class="inputs"></div>
            <div class="actions">
                <input type="submit" value="Log in">
            </div>
        </form>
    `,
    elems: {
        'login': loginElem,
        'pw': passwordElem
    }, 
    whereToPut: '.inputs',
    submit: {
        handler: elems => {
            const http = new XMLHttpRequest();

            http.addEventListener('load', function(evt) {
                console.log('we re loginning');
            });

            http.open('POST', '/api/login', true);
            http.setRequestHeader('Content-Type', 'application/json');
            http.send(JSON.stringify({login: elems.login, pw: elems.pw}));
        },
    }
});

module.exports = LoginForm;
},{"csp-app/libs/forms":13,"csp-app/libs/forms/utilities/validators":14}],9:[function(require,module,exports){
const { LoginForm, SignupClientForm, SignupExecForm } = require('./forms');

const hideClass = 'display-none';

const StartPage = function() {
    this.html = `
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
                    <div class="login-form form"></div>
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
    this.forms = {
        [LoginForm.name]: LoginForm,
        [SignupClientForm.name]: SignupClientForm,
        [SignupExecForm.name]: SignupExecForm
    };
    this.fragment = this.createDOM(this.html);
    this.whereToPut = {
        [LoginForm.name]: '.login-form',
        [SignupClientForm.name]: '.client-form',
        [SignupExecForm.name]: '.exec-form'
    };
    this.elems = {
        loginBtn: this.fragment.querySelector('#login-switch'),
        signupBtn: this.fragment.querySelector('#signup-switch'),
        loginPart: this.fragment.querySelector('#login'),
        signupPart: this.fragment.querySelector('#signup'),
        clientBtn: this.fragment.querySelector('#client-switch'),
        execBtn: this.fragment.querySelector('#exec-switch'),
        clientPart: this.fragment.querySelector('#client-form'),
        execPart: this.fragment.querySelector('#exec-form'),
        // Sign Up part
        signupTab1: this.fragment.querySelector('#signup .tab-actions button:first-child'),
        signupTab2: this.fragment.querySelector('#signup .tab-actions button:last-child'),
        signupPartForm: this.fragment.querySelector('#signup-form')
    };
    
    this.insertForms();
    this.initializeEvents();
    this.setDefaultState();
};

StartPage.prototype.createDOM = function(html) {
    const fragment = document.createDocumentFragment();
    const tmpElem = document.createElement('div');
    tmpElem.innerHTML = html;

    const elems = Array.prototype.slice.call(tmpElem.children);
    elems.forEach(elem => fragment.appendChild(elem));

    return fragment;
};

StartPage.prototype.insertForms = function() {
    Object.keys(this.whereToPut).forEach(formName => {
        this.fragment
            .querySelector(this.whereToPut[formName])
            .appendChild(this.forms[formName].fragment);
    });
};

StartPage.prototype.initializeEvents = function() {
    this.elems.loginBtn.addEventListener('click', evt => {
        this.elems.loginPart.classList.remove(hideClass);
        this.elems.signupPart.classList.add(hideClass);

        this.elems.loginBtn.classList.add('active');
        this.elems.signupBtn.classList.remove('active');
    });
    this.elems.signupBtn.addEventListener('click', evt => {
        this.elems.signupPart.classList.remove(hideClass);
        this.elems.loginPart.classList.add(hideClass);

        this.elems.signupBtn.classList.add('active');
        this.elems.loginBtn.classList.remove('active');
    });
    this.elems.clientBtn.addEventListener('click', evt => {
        this.elems.clientPart.classList.remove(hideClass);
        this.elems.execPart.classList.add(hideClass);

        this.elems.clientBtn.classList.add('active');
        this.elems.execBtn.classList.remove('active');
    });
    this.elems.execBtn.addEventListener('click', evt => {
        this.elems.execPart.classList.remove(hideClass);
        this.elems.clientPart.classList.add(hideClass);

        this.elems.execBtn.classList.add('active');
        this.elems.clientBtn.classList.remove('active');
    });
    this.elems.signupTab1.addEventListener('click', () => {
        this.elems.signupTab1.classList.add('active');
        this.elems.signupTab2.classList.remove('active');
        this.elems.signupPartForm.classList.add('first-tab-active');
        this.elems.signupPartForm.classList.remove('last-tab-active');
    });
    this.elems.signupTab2.addEventListener('click', () => {
        this.elems.signupTab2.classList.add('active');
        this.elems.signupTab1.classList.remove('active');
        this.elems.signupPartForm.classList.add('last-tab-active');
        this.elems.signupPartForm.classList.remove('first-tab-active');
    });
};

StartPage.prototype.setDefaultState = function() {
    this.elems.signupPart.classList.add(hideClass);
    this.elems.execPart.classList.add(hideClass);
    this.elems.loginBtn.classList.add('active');
    this.elems.clientBtn.classList.add('active');
    this.elems.signupTab1.classList.add('active');
    this.elems.signupPartForm.classList.add('first-tab-active');

};

module.exports = new StartPage();
},{"./forms":7}],10:[function(require,module,exports){
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

module.exports = Test;
},{}],11:[function(require,module,exports){
/*
    settings: {
        name,
        html,
        elems: [],
        whereToPut: '',
        submit
    }
*/

const Form = function(settings) {
    this.name = settings.name;
    this.html = settings.html;
    this.elems = settings.elems;
    this.fragment = this.createDOM();
    this.whereToPut = settings.whereToPut || 'form';
    this.submit = {
        selector: settings.submit.selector || 'input[type="submit"]',
        handler: settings.submit.handler || function(){}
    };

    this.insertElems();
    this.initializeEvents();
};

Form.prototype.createDOM = function() {
    const fragment = document.createDocumentFragment();
    const tmpElem = document.createElement('div');
    tmpElem.innerHTML = this.html;

    const elems = Array.prototype.slice.call(tmpElem.children);
    elems.forEach(elem => fragment.appendChild(elem));

    return fragment;
};

Form.prototype.insertElems = function() {
    const place = this.fragment.querySelector(this.whereToPut);
    Object.values(this.elems).forEach(elem => place.appendChild(elem.fragment));
};

Form.prototype.initializeEvents = function() {
    
    this.fragment.querySelector(this.submit.selector).addEventListener('click', evt => {
        evt.preventDefault();
        this.submit.handler(this.elems);
    });
};

module.exports = Form;
},{}],12:[function(require,module,exports){
/*
    settings object has the following structure:
    settings = {
        html,
        input: {
            selector, value
        },
        validators: [
            {validator, message} ...
        ],
        errors = {
            elemClass, hidingClass
        }
    }
*/

const FormElem = function(settings) {
    this.value = settings.input.value || null;
    this.fragment = this.createDOM(settings.html);
    this.elem = this.fragment.querySelector(settings.input.selector) || null;
    this.validators = settings.validators || [];
    this.errors = {
        elem: this.fragment.querySelector('.' + settings.errors.elemClass) || null,
        hidingClass: settings.errors.hidingClass || '.none',
        messages: []
    };

    this.initializeEvents();
};

FormElem.prototype.createDOM = function(html) {
    const fragment = document.createDocumentFragment();
    const tmpElem = document.createElement('div');
    tmpElem.innerHTML = html;

    const elems = Array.prototype.slice.call(tmpElem.children);
    elems.forEach(elem => fragment.appendChild(elem))

    return fragment;
};

FormElem.prototype.initializeEvents = function() {
    this.elem.addEventListener('change', evt => {
        this.errors.messages = [];
        
        this.validators.forEach(validator => {
            if (!validator.handler(this.elem.value)) {
                this.errors.messages.push(validator.message);
            }
        });

        if (this.errors.messages.length == 0) {
            this.hideErrors();
            this.errors.elem.innerHTML = '';

            console.log (evt.target.value)
        this.value = evt.target.value;
            return;
        }
        
        this.listErrors();
        this.showErrors();
    });
};

FormElem.prototype.showErrors = function() {
    if (this.errors.elem.classList.contains(this.errors.hidingClass)) {
        this.errors.elem.classList.remove(this.errors.hidingClass);
    }
};

FormElem.prototype.hideErrors = function() {
    if (!this.errors.elem.classList.contains(this.errors.hidingClass)) {
        this.errors.elem.classList.add(this.errors.hidingClass);
    }
};

FormElem.prototype.listErrors = function() {
    const fragment = document.createDocumentFragment();
    this.errors.messages.forEach(error => {
        const li = document.createElement('li');
        li.textContent = error;
        fragment.appendChild(li);
    });
    this.errors.elem.innerHTML = '';
    this.errors.elem.appendChild(fragment);
};

module.exports = FormElem;
},{}],13:[function(require,module,exports){
const Form = require('csp-app/libs/forms/Form');
const FormElem = require('csp-app/libs/forms/FormElem');

module.exports = {
    Form,
    FormElem
};
},{"csp-app/libs/forms/Form":11,"csp-app/libs/forms/FormElem":12}],14:[function(require,module,exports){
const minLength = function(min) {
    return function(str) {
        return str.toString().length >= min;
    };
};

const maxLength = function(max) {
    return function(str) {
        return str.toString().length <= max;
    };
};

module.exports = {
    minLength,
    maxLength
};
},{}],15:[function(require,module,exports){
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
},{"csp-app/components/root/MainController.js":3,"csp-app/state.js":16}],16:[function(require,module,exports){
const app = {
    components: {},
    path: []
};

module.exports = app;
},{}]},{},[1]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzb3VyY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBSb290ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QnKTtcbmNvbnN0IFN0YXJ0UGFnZSA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9zdGFydHBhZ2UnKTtcbmNvbnN0IERhc2hib2FyZCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmQnKTtcbmNvbnN0IE1haW5Db250cm9sbGVyID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QvTWFpbkNvbnRyb2xsZXInKTtcbmNvbnN0IGFwcCA9IHJlcXVpcmUoJ2NzcC1hcHAvc3RhdGUuanMnKTtcbmNvbnN0IFRlc3QgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvdGVzdCcpO1xuXG5jb25zdCBSb3V0ZXIgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvcm91dGVyJylcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgIGNvbnN0IGxpbmsgPSBldnQudGFyZ2V0LmNsb3Nlc3QoJ2EnKTtcblxuICAgIGlmIChsaW5rICYmIGxpbmsuZGF0YXNldC5yb3V0ZSkge1xuICAgICAgICBSb3V0ZXIubmF2aWdhdGUobGluay5kYXRhc2V0LnJvdXRlKTtcbiAgICB9XG59KTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgZXZ0ID0+IHtcbiAgICBjb25zb2xlLmxvZygncGFnZSBjaGFuZ2VkOiAnLCBkb2N1bWVudC5sb2NhdGlvbik7XG4gICAgY29uc29sZS5sb2coZXZ0KTtcbiAgICBSb3V0ZXIubmF2aWdhdGUoZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUpO1xufSk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbihldnQpIHtcbiAgICBsZXQgcGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgICBjb25zdCByb290SW5zdGFuY2UgPSBSb290LmNyZWF0ZSgpO1xuICAgIE1haW5Db250cm9sbGVyLmluaXRpYWxpemUocm9vdEluc3RhbmNlKTtcblxuICAgIGNvbnNvbGUubG9nKHBhdGgpO1xuXG4gICAgLy8gcGF0aCA9IHBhdGhbMF0gPT09ICcvJyA/IHBhdGguc3Vic3RyKDEpOiBwYXRoO1xuICAgIC8vIHBhdGggPSBwYXRoW3BhdGgubGVuZ3RoLTFdID09PSAnLycgPyBwYXRoLnN1YnN0cigwLCBwYXRoLmxlbmd0aC0xKSA6IHBhdGg7XG5cbiAgICBsZXQgcm91dGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICByZWdleHA6IC9eZ2VucmVzJC9naSxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdnZW5yZXMgaGFuZGxlcidcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgcmVnZXhwOiAvXmdlbnJlc1xcLyhbXlxcL1xcc10rKSg/OlxcL3wkKS9naSxcbiAgICAgICAgICAgIHBhcmFtc05hbWVzOiBbJ2dlbnJlJ10sXG4gICAgICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmVnZXhwOiAvXlxcLyQvZ2ksXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXI6ICdnZW5yZSBoYW5kbGVyJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZWdleHA6IC9ebW92aWVzKD86XFwvfCQpL2dpLFxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2V4cDogL15cXC8kL2dpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXI6ICdtb3ZpZXMgaGFuZGxlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnZXhwOiAvXihbXlxcL1xcc10rKSQvZ2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zTmFtZXM6IFsnbW92aWUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyOiAnbW92aWUgaGFuZGxlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgIF07XG5cbiAgICBjb25zdCByb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG4gICAgcm91dGVyXG4gICAgICAgIC5hZGRSb3V0ZSgnZ2VucmVzLyg6Z2VucmUpL21vdmllcycsIGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ3JvdXRlIDEnKX0pXG4gICAgICAgIC5hZGRSb3V0ZSgnZ2VucmVzLyg6Z2VucmUpL21vdmllcy8oOm1vdmllKScsIGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ3JvdXRlIDInKX0pXG4gICAgICAgIC5hZGRSb3V0ZSgnbGliLyg6Ym9vayknLCBmdW5jdGlvbigpe2NvbnNvbGUubG9nKCdyb3V0ZSAzJyl9KVxuXG4gICAgY29uc29sZS5sb2cocm91dGVyLnJvdXRlcylcblxuICAgIHJvdXRlci5uYXZpZ2F0ZShwYXRoKVxuICAgIC8vIGxldCByZXMgPSBSb3V0ZXIocGF0aCwgcm91dGVzKTtcbiAgICAvLyBjb25zb2xlLmxvZyhyZXMpO1xuXG4gICAgLy8gUm91dGVyLm5hdmlnYXRlKHBhdGgpO1xufSk7XG59LHtcImNzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmRcIjoyLFwiY3NwLWFwcC9jb21wb25lbnRzL3Jvb3RcIjo0LFwiY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QvTWFpbkNvbnRyb2xsZXJcIjozLFwiY3NwLWFwcC9jb21wb25lbnRzL3N0YXJ0cGFnZVwiOjksXCJjc3AtYXBwL2NvbXBvbmVudHMvdGVzdFwiOjEwLFwiY3NwLWFwcC9saWJzL3JvdXRlclwiOjE1LFwiY3NwLWFwcC9zdGF0ZS5qc1wiOjE2fV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBEYXNoYm9hcmQgPSB7XG4gICAgaHRtbDogYFxuICAgICAgICA8ZGl2IGlkPVwiZGFzaGJvYXJkXCI+XG4gICAgICAgICAgICA8aDE+SGVsbG8gd29ybGQhPC9oMT5cbiAgICAgICAgICAgIDxhIGRhdGEtcm91dGU9XCJ0ZXN0XCI+R28gdG8gVGVzdCBjb21wb25lbnQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgIGAsXG4gICAgaW5zdGFudGlhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCB0ZW1wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRlbXAuaW5uZXJIVE1MID0gdGhpcy5odG1sO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGVtcC5maXJzdEVsZW1lbnRDaGlsZFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlZmVyZW5jZTogZWxlbWVudCxcbiAgICAgICAgICAgIGFjdGlvbnM6IHtcbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKERPTVRyZWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChET01UcmVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhc2hib2FyZDtcbn0se31dLDM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgYXBwID0gcmVxdWlyZSgnY3NwLWFwcC9zdGF0ZS5qcycpO1xuXG5jb25zdCBNYWluQ29udHJvbGxlciA9IHtcbiAgICByb290OiBudWxsLFxuICAgIHBhdGg6IFtdLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oY29tcG9uZW50c09iamVjdHMpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIGNvbnN0IGFsbFJvdXRlcnNFeGlzdCA9IGluc3RhbmNlcy5ldmVyeShpbnN0YW5jZSA9PiAhIWluc3RhbmNlLnJvdXRlck91dGxldCk7XG4gICAgICAgIC8vIGlmICghYWxsUm91dGVyc0V4aXN0KSB0aHJvdyBuZXcgRXJyb3IoJ09uZSBvciBtb3JlIHJvdXRlciBvdXRsZXRzIGRvIG5vdCBleGlzdCcpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnBhdGguZmluZEluZGV4KChwYXJ0LCBpKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcGFydC5wYXRoICE9PSBjb21wb25lbnRzT2JqZWN0c1tpXS5wYXRoXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgY29tcG9uZW50c09iamVjdHMuc3BsaWNlKDAsIGluZGV4KTtcbiAgICAgICAgICAgIHRoaXMucGF0aC5zcGxpY2UoaW5kZXgpO1xuICAgICAgICAgICAgdGhpcy5wYXRoLmNvbmNhdChjb21wb25lbnRzT2JqZWN0cyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnBhdGggPSBjb21wb25lbnRzT2JqZWN0cztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnBhdGgubGVuZ3RoID09PSBjb21wb25lbnRzT2JqZWN0cy5sZW5ndGgpIHtcblxuICAgICAgICB9XG4gICAgICAgIFxuXG4gICAgICAgIGlmIChjb21wb25lbnRzT2JqZWN0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsZXQgaW5zdGFuY2VzID0gY29tcG9uZW50c09iamVjdHMubWFwKGNvID0+IGNvLmNvbXBvbmVudC5pbnN0YW50aWF0ZShjby5wYXJhbWV0ZXJzKSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnaW5zdGFuY2VzJywgaW5zdGFuY2VzKVxuICAgICAgICAgICAgY29uc3QgcmVuZGVyZWRDaGFpbiA9IGluc3RhbmNlcy5yZXZlcnNlKCkucmVkdWNlKChhY2N1bXVsYXRvciwgaW5zdGFuY2UpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoISFhY2N1bXVsYXRvcikgaW5zdGFuY2UuYWN0aW9ucy5yZW5kZXIoYWNjdW11bGF0b3IucmVmZXJlbmNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICAgICAgICB9LCBudWxsKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZW5kZXJlZENoYWluJywgcmVuZGVyZWRDaGFpbilcbiAgICAgICAgICAgIE1haW5Db250cm9sbGVyLnJvb3QucmVuZGVyKHJlbmRlcmVkQ2hhaW4ucmVmZXJlbmNlKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ocm9vdEluc3RhbmNlKSB7XG4gICAgICAgIHRoaXMucm9vdCA9IHJvb3RJbnN0YW5jZTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChyb290SW5zdGFuY2UucmVmZXJlbmNlKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1haW5Db250cm9sbGVyO1xufSx7XCJjc3AtYXBwL3N0YXRlLmpzXCI6MTZ9XSw0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IFJvb3QgPSB7XG4gICAgY29tcG9uZW50TmFtZTogJ2FwcCcsXG4gICAgaHRtbDogYDxkaXYgaWQ9XCJhcHBcIj48L2Rpdj5gLFxuICAgIGlkZW50aWZpZXI6ICcjYXBwJyxcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBDb25zaWRlciByZWltcGxlbWVudGluZyB3aXRoIEhUTUw1IHRlbXBsYXRlIGZlYXR1cmUgaW5zdGVhZCBqdXN0IHV0aWxpemluZyBkaXZcbiAgICAgICAgY29uc3QgdG1wRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0bXBFbGVtLmlubmVySFRNTCA9IHRoaXMuaHRtbDtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRtcEVsZW0uZmlyc3RDaGlsZDtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVmZXJlbmNlOiBlbGVtZW50LFxuICAgICAgICAgICAgcm91dGVyT3V0bGV0OiBlbGVtZW50LFxuICAgICAgICAgICAgY29tcG9uZW50TmFtZTogdGhpcy5jb21wb25lbnROYW1lLFxuICAgICAgICAgICAgc3RhdGU6IHt9LFxuICAgICAgICAgICAgYWN0aW9uczogKGZ1bmN0aW9uKHJvdXRlck91dGxldCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWQ6IGZ1bmN0aW9uKGZyYWdtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKGVsZW1lbnQpLFxuICAgICAgICAgICAgcmVuZGVyOiAoZnVuY3Rpb24ocm91dGVyT3V0bGV0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKERPTVRyZWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcm91dGVyT3V0bGV0LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuYXBwZW5kQ2hpbGQoRE9NVHJlZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoZWxlbWVudClcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUm9vdDtcbn0se31dLDU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgeyBGb3JtLCBGb3JtRWxlbSB9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2Zvcm1zJyk7XG5jb25zdCB7IG1pbkxlbmd0aDogbWluTGVuZ3RoR2VuZXJpYywgbWF4TGVuZ3RoOiBtYXhMZW5ndGhHZW5lcmljIH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMvdXRpbGl0aWVzL3ZhbGlkYXRvcnMnKTtcbmNvbnN0IG1pbkxlbmd0aCA9IG1pbkxlbmd0aEdlbmVyaWMoNCk7XG5jb25zdCBtYXhMZW5ndGggPSBtYXhMZW5ndGhHZW5lcmljKDE2KTtcblxuY29uc3QgbG9naW5FbGVtID0gbmV3IEZvcm1FbGVtKHtcbiAgICBodG1sOiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ibG9jayBjbGVhcmZpeFwiPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cInNpZ251cC1jbGllbnQtbG9naW5cIiBwbGFjZWhvbGRlcj1cIkxvZ2luXCIgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtZWxlbS1lcnJvcnNcIj48L2Rpdj5gXG4gICAgICAgICxcbiAgICBpbnB1dDogeyBzZWxlY3RvcjogJy5pbnB1dC1ibG9jayBpbnB1dCcsIHZhbHVlOiBudWxsIH0sXG4gICAgZXJyb3JzOiB7XG4gICAgICAgIGVsZW1DbGFzczogJ2Zvcm1lbGVtLWVycm9ycydcbiAgICB9LFxuICAgIHZhbGlkYXRvcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaGFuZGxlcjogbWluTGVuZ3RoLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1RoZSBsZW5ndGggaXMgbGVzcyB0aGFuIDQgY2hhcnMnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhhbmRsZXI6IG1heExlbmd0aCxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdUaGUgbGVuZ3RoIGlzIG1vcmUgdGhhbiAxNiBjaGFycydcbiAgICAgICAgfVxuICAgIF1cbn0pO1xuXG5jb25zdCBwYXNzd29yZEVsZW0gPSBuZXcgRm9ybUVsZW0oe1xuICAgIGh0bWw6IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWJsb2NrIGNsZWFyZml4XCI+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgaWQ9XCJzaWdudXAtY2xpZW50LXBhc3N3b3JkXCIgcGxhY2Vob2xkZXI9XCJQYXNzd29yZFwiIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybWVsZW0tZXJyb3JzXCI+PC9kaXY+YCxcbiAgICBpbnB1dDogeyBzZWxlY3RvcjogJy5pbnB1dC1ibG9jayBpbnB1dCcsIHZhbHVlOiBudWxsIH0sXG4gICAgZXJyb3JzOiB7XG4gICAgICAgIGVsZW1DbGFzczogJ2Zvcm1lbGVtLWVycm9ycydcbiAgICB9LFxuICAgIHZhbGlkYXRvcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaGFuZGxlcjogbWluTGVuZ3RoLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1RoZSBsZW5ndGggaXMgbGVzcyB0aGFuIDQgY2hhcnMnXG4gICAgICAgIH1cbiAgICBdXG59KTtcblxuY29uc3QgcGFzc3dvcmRDb25mRWxlbSA9IG5ldyBGb3JtRWxlbSh7XG4gICAgaHRtbDogYFxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW5wdXQtYmxvY2sgY2xlYXJmaXhcIj5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIGlkPVwic2lnbnVwLWNsaWVudC1wYXNzd29yZGNvbmZcIiBwbGFjZWhvbGRlcj1cIkNvbmZpcm0gcGFzc3dvcmRcIiAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZvcm1lbGVtLWVycm9yc1wiPjwvZGl2PmAsXG4gICAgaW5wdXQ6IHsgc2VsZWN0b3I6ICcuaW5wdXQtYmxvY2sgaW5wdXQnLCB2YWx1ZTogbnVsbCB9LFxuICAgIGVycm9yczoge1xuICAgICAgICBlbGVtQ2xhc3M6ICdmb3JtZWxlbS1lcnJvcnMnXG4gICAgfSxcbiAgICB2YWxpZGF0b3JzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aCxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdUaGUgbGVuZ3RoIGlzIGxlc3MgdGhhbiA0IGNoYXJzJ1xuICAgICAgICB9XG4gICAgXVxufSk7XG5cbmNvbnN0IG9yZ2FuaXphdGlvbiA9IG5ldyBGb3JtRWxlbSh7XG4gICAgaHRtbDogYFxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW5wdXQtYmxvY2sgY2xlYXJmaXhcIj5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIGlkPVwic2lnbnVwLWNsaWVudC1vcmdcIiBwbGFjZWhvbGRlcj1cIk9yZ2FuaXphdGlvblwiIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybWVsZW0tZXJyb3JzXCI+PC9kaXY+YCxcbiAgICBpbnB1dDogeyBzZWxlY3RvcjogJy5pbnB1dC1ibG9jayBpbnB1dCcsIHZhbHVlOiBudWxsIH0sXG4gICAgZXJyb3JzOiB7XG4gICAgICAgIGVsZW1DbGFzczogJ2Zvcm1lbGVtLWVycm9ycydcbiAgICB9LFxufSk7XG5cbmNvbnN0IFNpZ251cENsaWVudEZvcm0gPSBuZXcgRm9ybSh7XG4gICAgbmFtZTogJ3NpZ251cC1jbGllbnQnLFxuICAgIGh0bWw6IGBcbiAgICAgICAgPGZvcm0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaW5wdXRzXCI+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWN0aW9uc1wiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwic3VibWl0XCIgdmFsdWU9XCJTaWduIFVwXCI+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9mb3JtPlxuICAgIGAsXG4gICAgZWxlbXM6IFtsb2dpbkVsZW0sIHBhc3N3b3JkRWxlbSwgcGFzc3dvcmRDb25mRWxlbSwgb3JnYW5pemF0aW9uXSxcbiAgICB3aGVyZVRvUHV0OiAnLmlucHV0cycsXG4gICAgc3VibWl0OiB7XG4gICAgICAgIGhhbmRsZXI6ICgpID0+IHt9LFxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZ251cENsaWVudEZvcm07XG59LHtcImNzcC1hcHAvbGlicy9mb3Jtc1wiOjEzLFwiY3NwLWFwcC9saWJzL2Zvcm1zL3V0aWxpdGllcy92YWxpZGF0b3JzXCI6MTR9XSw2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHsgRm9ybSwgRm9ybUVsZW0gfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3JtcycpO1xuY29uc3QgeyBtaW5MZW5ndGg6IG1pbkxlbmd0aEdlbmVyaWMsIG1heExlbmd0aDogbWF4TGVuZ3RoR2VuZXJpYyB9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2Zvcm1zL3V0aWxpdGllcy92YWxpZGF0b3JzJyk7XG5jb25zdCBtaW5MZW5ndGggPSBtaW5MZW5ndGhHZW5lcmljKDQpO1xuY29uc3QgbWF4TGVuZ3RoID0gbWF4TGVuZ3RoR2VuZXJpYygxNik7XG5cbmNvbnN0IGxvZ2luRWxlbSA9IG5ldyBGb3JtRWxlbSh7XG4gICAgaHRtbDogYFxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW5wdXQtYmxvY2sgY2xlYXJmaXhcIj5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgaWQ9XCJzaWdudXAtZXhlYy1sb2dpblwiIHBsYWNlaG9sZGVyPVwiTG9naW5cIiAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZvcm1lbGVtLWVycm9yc1wiPjwvZGl2PmAsXG4gICAgaW5wdXQ6IHsgc2VsZWN0b3I6ICcuaW5wdXQtYmxvY2sgaW5wdXQnLCB2YWx1ZTogbnVsbCB9LFxuICAgIGVycm9yczoge1xuICAgICAgICBlbGVtQ2xhc3M6ICdmb3JtZWxlbS1lcnJvcnMnXG4gICAgfSxcbiAgICB2YWxpZGF0b3JzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aCxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdUaGUgbGVuZ3RoIGlzIGxlc3MgdGhhbiA0IGNoYXJzJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoYW5kbGVyOiBtYXhMZW5ndGgsXG4gICAgICAgICAgICBtZXNzYWdlOiAnVGhlIGxlbmd0aCBpcyBtb3JlIHRoYW4gMTYgY2hhcnMnXG4gICAgICAgIH1cbiAgICBdXG59KTtcblxuY29uc3QgcGFzc3dvcmRFbGVtID0gbmV3IEZvcm1FbGVtKHtcbiAgICBodG1sOiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ibG9jayBjbGVhcmZpeFwiPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgaWQ9XCJzaWdudXAtZXhlYy1wYXNzd29yZFwiIHBsYWNlaG9sZGVyPVwiUGFzc3dvcmRcIiAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZvcm1lbGVtLWVycm9yc1wiPjwvZGl2PmAsXG4gICAgaW5wdXQ6IHsgc2VsZWN0b3I6ICcuaW5wdXQtYmxvY2sgaW5wdXQnLCB2YWx1ZTogbnVsbCB9LFxuICAgIGVycm9yczoge1xuICAgICAgICBlbGVtQ2xhc3M6ICdmb3JtZWxlbS1lcnJvcnMnXG4gICAgfSxcbiAgICB2YWxpZGF0b3JzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aCxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdUaGUgbGVuZ3RoIGlzIGxlc3MgdGhhbiA0IGNoYXJzJ1xuICAgICAgICB9XG4gICAgXVxufSk7XG5cbmNvbnN0IHBhc3N3b3JkQ29uZkVsZW0gPSBuZXcgRm9ybUVsZW0oe1xuICAgIGh0bWw6IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWJsb2NrIGNsZWFyZml4XCI+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBpZD1cInNpZ251cC1leGVjLXBhc3N3b3JkY29uZlwiIHBsYWNlaG9sZGVyPVwiQ29uZmlybSBwYXNzd29yZFwiICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZvcm1lbGVtLWVycm9yc1wiPjwvZGl2PmAsXG4gICAgaW5wdXQ6IHsgc2VsZWN0b3I6ICcuaW5wdXQtYmxvY2sgaW5wdXQnLCB2YWx1ZTogbnVsbCB9LFxuICAgIGVycm9yczoge1xuICAgICAgICBlbGVtQ2xhc3M6ICdmb3JtZWxlbS1lcnJvcnMnXG4gICAgfSxcbiAgICB2YWxpZGF0b3JzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aCxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdUaGUgbGVuZ3RoIGlzIGxlc3MgdGhhbiA0IGNoYXJzJ1xuICAgICAgICB9XG4gICAgXVxufSk7XG5cbmNvbnN0IFNpZ251cEV4ZWNGb3JtID0gbmV3IEZvcm0oe1xuICAgIG5hbWU6ICdzaWdudXAtZXhlYycsXG4gICAgaHRtbDogYFxuICAgICAgICA8Zm9ybT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dHNcIj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhY3Rpb25zXCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJzdWJtaXRcIiB2YWx1ZT1cIlNpZ24gVXBcIj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Zvcm0+XG4gICAgYCxcbiAgICBlbGVtczoge1xuICAgICAgICAnbG9naW4nOiBsb2dpbkVsZW0sXG4gICAgICAgICdwdyc6IHBhc3N3b3JkRWxlbSxcbiAgICAgICAgJ3B3Q29uZic6IHBhc3N3b3JkQ29uZkVsZW1cbiAgICB9LFxuICAgIHdoZXJlVG9QdXQ6ICcuaW5wdXRzJyxcbiAgICBzdWJtaXQ6IHtcbiAgICAgICAgaGFuZGxlcjogZWxlbXMgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2hlbGxvJylcblxuICAgICAgICAgICAgY29uc3QgaHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgICAgICBjb25zdCByZWdEYXRhID0ge1xuICAgICAgICAgICAgICAgIGxvZ2luOiBlbGVtc1snbG9naW4nXS52YWx1ZSxcbiAgICAgICAgICAgICAgICBwYXNzd29yZEVsZW06IGVsZW1zWydwdyddLnZhbHVlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVnRGF0YSlcblxuICAgICAgICAgICAgaHR0cC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBodHRwLm9wZW4oJ1BPU1QnLCAnL2FwaS9nZXREYXRhJywgdHJ1ZSk7XG4gICAgICAgICAgICBodHRwLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICBodHRwLnNlbmQoSlNPTi5zdHJpbmdpZnkocmVnRGF0YSkpO1xuXG4gICAgICAgIH0sXG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbnVwRXhlY0Zvcm07XG59LHtcImNzcC1hcHAvbGlicy9mb3Jtc1wiOjEzLFwiY3NwLWFwcC9saWJzL2Zvcm1zL3V0aWxpdGllcy92YWxpZGF0b3JzXCI6MTR9XSw3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IExvZ2luRm9ybSA9IHJlcXVpcmUoJy4vbG9naW5mb3JtJyk7XG5jb25zdCBTaWdudXBFeGVjRm9ybSA9IHJlcXVpcmUoJy4vZXhlY2Zvcm0nKTtcbmNvbnN0IFNpZ251cENsaWVudEZvcm0gPSByZXF1aXJlKCcuL2NsaWVudGZvcm0nKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgTG9naW5Gb3JtLFxuICAgIFNpZ251cEV4ZWNGb3JtLFxuICAgIFNpZ251cENsaWVudEZvcm1cbn07XG59LHtcIi4vY2xpZW50Zm9ybVwiOjUsXCIuL2V4ZWNmb3JtXCI6NixcIi4vbG9naW5mb3JtXCI6OH1dLDg6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgeyBGb3JtLCBGb3JtRWxlbSB9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2Zvcm1zJyk7XG5jb25zdCB7IG1pbkxlbmd0aDogbWluTGVuZ3RoR2VuZXJpYywgbWF4TGVuZ3RoOiBtYXhMZW5ndGhHZW5lcmljIH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMvdXRpbGl0aWVzL3ZhbGlkYXRvcnMnKTtcbmNvbnN0IG1pbkxlbmd0aCA9IG1pbkxlbmd0aEdlbmVyaWMoNCk7XG5jb25zdCBtYXhMZW5ndGggPSBtYXhMZW5ndGhHZW5lcmljKDE2KTtcblxuY29uc3QgbG9naW5FbGVtID0gbmV3IEZvcm1FbGVtKHtcbiAgICBodG1sOiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ibG9ja1wiPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cImxvZ2luLWxvZ2luXCIgcGxhY2Vob2xkZXI9XCJMb2dpblwiIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybWVsZW0tZXJyb3JzXCI+PC9kaXY+YCxcbiAgICBpbnB1dDogeyBzZWxlY3RvcjogJy5pbnB1dC1ibG9jayBpbnB1dCcsIHZhbHVlOiBudWxsIH0sXG4gICAgZXJyb3JzOiB7XG4gICAgICAgIGVsZW1DbGFzczogJ2Zvcm1lbGVtLWVycm9ycydcbiAgICB9LFxuICAgIHZhbGlkYXRvcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaGFuZGxlcjogbWluTGVuZ3RoLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1RoZSBsZW5ndGggaXMgbGVzcyB0aGFuIDQgY2hhcnMnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhhbmRsZXI6IG1heExlbmd0aCxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdUaGUgbGVuZ3RoIGlzIG1vcmUgdGhhbiAxNiBjaGFycydcbiAgICAgICAgfVxuICAgIF1cbn0pO1xuXG5jb25zdCBwYXNzd29yZEVsZW0gPSBuZXcgRm9ybUVsZW0oe1xuICAgIGh0bWw6IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWJsb2NrIGNsZWFyZml4XCI+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBpZD1cImxvZ2luLXBhc3N3b3JkXCIgcGxhY2Vob2xkZXI9XCJQYXNzd29yZFwiIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybWVsZW0tZXJyb3JzXCI+PC9kaXY+YCxcbiAgICBpbnB1dDogeyBzZWxlY3RvcjogJy5pbnB1dC1ibG9jayBpbnB1dCcsIHZhbHVlOiBudWxsIH0sXG4gICAgZXJyb3JzOiB7XG4gICAgICAgIGVsZW1DbGFzczogJ2Zvcm1lbGVtLWVycm9ycydcbiAgICB9LFxuICAgIHZhbGlkYXRvcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaGFuZGxlcjogbWluTGVuZ3RoLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1RoZSBsZW5ndGggaXMgbGVzcyB0aGFuIDQgY2hhcnMnXG4gICAgICAgIH1cbiAgICBdXG59KTtcblxuY29uc3QgTG9naW5Gb3JtID0gbmV3IEZvcm0oe1xuICAgIG5hbWU6ICdsb2dpbicsXG4gICAgaHRtbDogYFxuICAgICAgICA8Zm9ybT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dHNcIj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhY3Rpb25zXCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJzdWJtaXRcIiB2YWx1ZT1cIkxvZyBpblwiPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZm9ybT5cbiAgICBgLFxuICAgIGVsZW1zOiB7XG4gICAgICAgICdsb2dpbic6IGxvZ2luRWxlbSxcbiAgICAgICAgJ3B3JzogcGFzc3dvcmRFbGVtXG4gICAgfSwgXG4gICAgd2hlcmVUb1B1dDogJy5pbnB1dHMnLFxuICAgIHN1Ym1pdDoge1xuICAgICAgICBoYW5kbGVyOiBlbGVtcyA9PiB7XG4gICAgICAgICAgICBjb25zdCBodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgICAgIGh0dHAuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3ZSByZSBsb2dpbm5pbmcnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBodHRwLm9wZW4oJ1BPU1QnLCAnL2FwaS9sb2dpbicsIHRydWUpO1xuICAgICAgICAgICAgaHR0cC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgaHR0cC5zZW5kKEpTT04uc3RyaW5naWZ5KHtsb2dpbjogZWxlbXMubG9naW4sIHB3OiBlbGVtcy5wd30pKTtcbiAgICAgICAgfSxcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2dpbkZvcm07XG59LHtcImNzcC1hcHAvbGlicy9mb3Jtc1wiOjEzLFwiY3NwLWFwcC9saWJzL2Zvcm1zL3V0aWxpdGllcy92YWxpZGF0b3JzXCI6MTR9XSw5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHsgTG9naW5Gb3JtLCBTaWdudXBDbGllbnRGb3JtLCBTaWdudXBFeGVjRm9ybSB9ID0gcmVxdWlyZSgnLi9mb3JtcycpO1xuXG5jb25zdCBoaWRlQ2xhc3MgPSAnZGlzcGxheS1ub25lJztcblxuY29uc3QgU3RhcnRQYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5odG1sID0gYFxuICAgICAgICA8ZGl2IGNsYXNzPVwid3JhcHBlclwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXJ0cGFnZVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsb2dvLWJsb2NrXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoMT5XZWxjb21lIHRvIENvbnN1bHRpbmcgU2VydmljZXMgUGxhdGZvcm08L2gxPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPGEgZGF0YS1yb3V0ZT1cIi9cIj5Ib21lPC9hPlxuICAgICAgICAgICAgICAgIDxhIGRhdGEtcm91dGU9XCIvZGFzaGJvYXJkXCI+RGFzaGJvYXJkPC9hPlxuXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1haW4tYWN0aW9uc1wiPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwibG9naW4tc3dpdGNoXCI+TG9nIGluPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJzaWdudXAtc3dpdGNoXCI+U2lnbiB1cDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxvZ2luXCIgaWQ9XCJsb2dpblwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaGVhZGVyXCI+PGgyPkxvZyBpbjwvaDI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsb2dpbi1mb3JtIGZvcm1cIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2lnbnVwXCIgaWQ9XCJzaWdudXBcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhYi1hY3Rpb25zIGNsZWFyZml4XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiY2xpZW50LXN3aXRjaFwiPlNpZ24gdXAgYXMgY2xpZW50PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiZXhlYy1zd2l0Y2hcIj5TaWduIHVwIGFzIGV4ZWN1dG9yPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzaWdudXAtZm9ybVwiIGlkPVwic2lnbnVwLWZvcm1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjbGllbnQtZm9ybSBmb3JtXCIgaWQ9XCJjbGllbnQtZm9ybVwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImV4ZWMtZm9ybSBmb3JtXCIgaWQ9XCJleGVjLWZvcm1cIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgYDtcbiAgICB0aGlzLmZvcm1zID0ge1xuICAgICAgICBbTG9naW5Gb3JtLm5hbWVdOiBMb2dpbkZvcm0sXG4gICAgICAgIFtTaWdudXBDbGllbnRGb3JtLm5hbWVdOiBTaWdudXBDbGllbnRGb3JtLFxuICAgICAgICBbU2lnbnVwRXhlY0Zvcm0ubmFtZV06IFNpZ251cEV4ZWNGb3JtXG4gICAgfTtcbiAgICB0aGlzLmZyYWdtZW50ID0gdGhpcy5jcmVhdGVET00odGhpcy5odG1sKTtcbiAgICB0aGlzLndoZXJlVG9QdXQgPSB7XG4gICAgICAgIFtMb2dpbkZvcm0ubmFtZV06ICcubG9naW4tZm9ybScsXG4gICAgICAgIFtTaWdudXBDbGllbnRGb3JtLm5hbWVdOiAnLmNsaWVudC1mb3JtJyxcbiAgICAgICAgW1NpZ251cEV4ZWNGb3JtLm5hbWVdOiAnLmV4ZWMtZm9ybSdcbiAgICB9O1xuICAgIHRoaXMuZWxlbXMgPSB7XG4gICAgICAgIGxvZ2luQnRuOiB0aGlzLmZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsb2dpbi1zd2l0Y2gnKSxcbiAgICAgICAgc2lnbnVwQnRuOiB0aGlzLmZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzaWdudXAtc3dpdGNoJyksXG4gICAgICAgIGxvZ2luUGFydDogdGhpcy5mcmFnbWVudC5xdWVyeVNlbGVjdG9yKCcjbG9naW4nKSxcbiAgICAgICAgc2lnbnVwUGFydDogdGhpcy5mcmFnbWVudC5xdWVyeVNlbGVjdG9yKCcjc2lnbnVwJyksXG4gICAgICAgIGNsaWVudEJ0bjogdGhpcy5mcmFnbWVudC5xdWVyeVNlbGVjdG9yKCcjY2xpZW50LXN3aXRjaCcpLFxuICAgICAgICBleGVjQnRuOiB0aGlzLmZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoJyNleGVjLXN3aXRjaCcpLFxuICAgICAgICBjbGllbnRQYXJ0OiB0aGlzLmZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjbGllbnQtZm9ybScpLFxuICAgICAgICBleGVjUGFydDogdGhpcy5mcmFnbWVudC5xdWVyeVNlbGVjdG9yKCcjZXhlYy1mb3JtJyksXG4gICAgICAgIC8vIFNpZ24gVXAgcGFydFxuICAgICAgICBzaWdudXBUYWIxOiB0aGlzLmZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzaWdudXAgLnRhYi1hY3Rpb25zIGJ1dHRvbjpmaXJzdC1jaGlsZCcpLFxuICAgICAgICBzaWdudXBUYWIyOiB0aGlzLmZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzaWdudXAgLnRhYi1hY3Rpb25zIGJ1dHRvbjpsYXN0LWNoaWxkJyksXG4gICAgICAgIHNpZ251cFBhcnRGb3JtOiB0aGlzLmZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzaWdudXAtZm9ybScpXG4gICAgfTtcbiAgICBcbiAgICB0aGlzLmluc2VydEZvcm1zKCk7XG4gICAgdGhpcy5pbml0aWFsaXplRXZlbnRzKCk7XG4gICAgdGhpcy5zZXREZWZhdWx0U3RhdGUoKTtcbn07XG5cblN0YXJ0UGFnZS5wcm90b3R5cGUuY3JlYXRlRE9NID0gZnVuY3Rpb24oaHRtbCkge1xuICAgIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIGNvbnN0IHRtcEVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0bXBFbGVtLmlubmVySFRNTCA9IGh0bWw7XG5cbiAgICBjb25zdCBlbGVtcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRtcEVsZW0uY2hpbGRyZW4pO1xuICAgIGVsZW1zLmZvckVhY2goZWxlbSA9PiBmcmFnbWVudC5hcHBlbmRDaGlsZChlbGVtKSk7XG5cbiAgICByZXR1cm4gZnJhZ21lbnQ7XG59O1xuXG5TdGFydFBhZ2UucHJvdG90eXBlLmluc2VydEZvcm1zID0gZnVuY3Rpb24oKSB7XG4gICAgT2JqZWN0LmtleXModGhpcy53aGVyZVRvUHV0KS5mb3JFYWNoKGZvcm1OYW1lID0+IHtcbiAgICAgICAgdGhpcy5mcmFnbWVudFxuICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IodGhpcy53aGVyZVRvUHV0W2Zvcm1OYW1lXSlcbiAgICAgICAgICAgIC5hcHBlbmRDaGlsZCh0aGlzLmZvcm1zW2Zvcm1OYW1lXS5mcmFnbWVudCk7XG4gICAgfSk7XG59O1xuXG5TdGFydFBhZ2UucHJvdG90eXBlLmluaXRpYWxpemVFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVsZW1zLmxvZ2luQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICAgICAgdGhpcy5lbGVtcy5sb2dpblBhcnQuY2xhc3NMaXN0LnJlbW92ZShoaWRlQ2xhc3MpO1xuICAgICAgICB0aGlzLmVsZW1zLnNpZ251cFBhcnQuY2xhc3NMaXN0LmFkZChoaWRlQ2xhc3MpO1xuXG4gICAgICAgIHRoaXMuZWxlbXMubG9naW5CdG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgIHRoaXMuZWxlbXMuc2lnbnVwQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIH0pO1xuICAgIHRoaXMuZWxlbXMuc2lnbnVwQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICAgICAgdGhpcy5lbGVtcy5zaWdudXBQYXJ0LmNsYXNzTGlzdC5yZW1vdmUoaGlkZUNsYXNzKTtcbiAgICAgICAgdGhpcy5lbGVtcy5sb2dpblBhcnQuY2xhc3NMaXN0LmFkZChoaWRlQ2xhc3MpO1xuXG4gICAgICAgIHRoaXMuZWxlbXMuc2lnbnVwQnRuLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICB0aGlzLmVsZW1zLmxvZ2luQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIH0pO1xuICAgIHRoaXMuZWxlbXMuY2xpZW50QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICAgICAgdGhpcy5lbGVtcy5jbGllbnRQYXJ0LmNsYXNzTGlzdC5yZW1vdmUoaGlkZUNsYXNzKTtcbiAgICAgICAgdGhpcy5lbGVtcy5leGVjUGFydC5jbGFzc0xpc3QuYWRkKGhpZGVDbGFzcyk7XG5cbiAgICAgICAgdGhpcy5lbGVtcy5jbGllbnRCdG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgIHRoaXMuZWxlbXMuZXhlY0J0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICB9KTtcbiAgICB0aGlzLmVsZW1zLmV4ZWNCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgICAgICB0aGlzLmVsZW1zLmV4ZWNQYXJ0LmNsYXNzTGlzdC5yZW1vdmUoaGlkZUNsYXNzKTtcbiAgICAgICAgdGhpcy5lbGVtcy5jbGllbnRQYXJ0LmNsYXNzTGlzdC5hZGQoaGlkZUNsYXNzKTtcblxuICAgICAgICB0aGlzLmVsZW1zLmV4ZWNCdG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgIHRoaXMuZWxlbXMuY2xpZW50QnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIH0pO1xuICAgIHRoaXMuZWxlbXMuc2lnbnVwVGFiMS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgdGhpcy5lbGVtcy5zaWdudXBUYWIxLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICB0aGlzLmVsZW1zLnNpZ251cFRhYjIuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgIHRoaXMuZWxlbXMuc2lnbnVwUGFydEZvcm0uY2xhc3NMaXN0LmFkZCgnZmlyc3QtdGFiLWFjdGl2ZScpO1xuICAgICAgICB0aGlzLmVsZW1zLnNpZ251cFBhcnRGb3JtLmNsYXNzTGlzdC5yZW1vdmUoJ2xhc3QtdGFiLWFjdGl2ZScpO1xuICAgIH0pO1xuICAgIHRoaXMuZWxlbXMuc2lnbnVwVGFiMi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgdGhpcy5lbGVtcy5zaWdudXBUYWIyLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICB0aGlzLmVsZW1zLnNpZ251cFRhYjEuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgIHRoaXMuZWxlbXMuc2lnbnVwUGFydEZvcm0uY2xhc3NMaXN0LmFkZCgnbGFzdC10YWItYWN0aXZlJyk7XG4gICAgICAgIHRoaXMuZWxlbXMuc2lnbnVwUGFydEZvcm0uY2xhc3NMaXN0LnJlbW92ZSgnZmlyc3QtdGFiLWFjdGl2ZScpO1xuICAgIH0pO1xufTtcblxuU3RhcnRQYWdlLnByb3RvdHlwZS5zZXREZWZhdWx0U3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVsZW1zLnNpZ251cFBhcnQuY2xhc3NMaXN0LmFkZChoaWRlQ2xhc3MpO1xuICAgIHRoaXMuZWxlbXMuZXhlY1BhcnQuY2xhc3NMaXN0LmFkZChoaWRlQ2xhc3MpO1xuICAgIHRoaXMuZWxlbXMubG9naW5CdG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgdGhpcy5lbGVtcy5jbGllbnRCdG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgdGhpcy5lbGVtcy5zaWdudXBUYWIxLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgIHRoaXMuZWxlbXMuc2lnbnVwUGFydEZvcm0uY2xhc3NMaXN0LmFkZCgnZmlyc3QtdGFiLWFjdGl2ZScpO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTdGFydFBhZ2UoKTtcbn0se1wiLi9mb3Jtc1wiOjd9XSwxMDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBUZXN0ID0ge1xuICAgIGh0bWw6IGBcbiAgICAgICAgPGRpdiBpZD1cInRlc3RcIj5cbiAgICAgICAgICAgIDxoMT5UaGlzIGlzIFRlc3QgY29tcG9uZW50PC9oMT5cbiAgICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBpbnN0YW50aWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGVtcC5pbm5lckhUTUwgPSB0aGlzLmh0bWw7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0ZW1wLmZpcnN0RWxlbWVudENoaWxkXG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVmZXJlbmNlOiBlbGVtZW50LFxuICAgICAgICAgICAgYWN0aW9uczoge1xuICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24oRE9NVHJlZSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKERPTVRyZWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGVzdDtcbn0se31dLDExOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbi8qXG4gICAgc2V0dGluZ3M6IHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgaHRtbCxcbiAgICAgICAgZWxlbXM6IFtdLFxuICAgICAgICB3aGVyZVRvUHV0OiAnJyxcbiAgICAgICAgc3VibWl0XG4gICAgfVxuKi9cblxuY29uc3QgRm9ybSA9IGZ1bmN0aW9uKHNldHRpbmdzKSB7XG4gICAgdGhpcy5uYW1lID0gc2V0dGluZ3MubmFtZTtcbiAgICB0aGlzLmh0bWwgPSBzZXR0aW5ncy5odG1sO1xuICAgIHRoaXMuZWxlbXMgPSBzZXR0aW5ncy5lbGVtcztcbiAgICB0aGlzLmZyYWdtZW50ID0gdGhpcy5jcmVhdGVET00oKTtcbiAgICB0aGlzLndoZXJlVG9QdXQgPSBzZXR0aW5ncy53aGVyZVRvUHV0IHx8ICdmb3JtJztcbiAgICB0aGlzLnN1Ym1pdCA9IHtcbiAgICAgICAgc2VsZWN0b3I6IHNldHRpbmdzLnN1Ym1pdC5zZWxlY3RvciB8fCAnaW5wdXRbdHlwZT1cInN1Ym1pdFwiXScsXG4gICAgICAgIGhhbmRsZXI6IHNldHRpbmdzLnN1Ym1pdC5oYW5kbGVyIHx8IGZ1bmN0aW9uKCl7fVxuICAgIH07XG5cbiAgICB0aGlzLmluc2VydEVsZW1zKCk7XG4gICAgdGhpcy5pbml0aWFsaXplRXZlbnRzKCk7XG59O1xuXG5Gb3JtLnByb3RvdHlwZS5jcmVhdGVET00gPSBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICBjb25zdCB0bXBFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdG1wRWxlbS5pbm5lckhUTUwgPSB0aGlzLmh0bWw7XG5cbiAgICBjb25zdCBlbGVtcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRtcEVsZW0uY2hpbGRyZW4pO1xuICAgIGVsZW1zLmZvckVhY2goZWxlbSA9PiBmcmFnbWVudC5hcHBlbmRDaGlsZChlbGVtKSk7XG5cbiAgICByZXR1cm4gZnJhZ21lbnQ7XG59O1xuXG5Gb3JtLnByb3RvdHlwZS5pbnNlcnRFbGVtcyA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHBsYWNlID0gdGhpcy5mcmFnbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMud2hlcmVUb1B1dCk7XG4gICAgT2JqZWN0LnZhbHVlcyh0aGlzLmVsZW1zKS5mb3JFYWNoKGVsZW0gPT4gcGxhY2UuYXBwZW5kQ2hpbGQoZWxlbS5mcmFnbWVudCkpO1xufTtcblxuRm9ybS5wcm90b3R5cGUuaW5pdGlhbGl6ZUV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIFxuICAgIHRoaXMuZnJhZ21lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnN1Ym1pdC5zZWxlY3RvcikuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5zdWJtaXQuaGFuZGxlcih0aGlzLmVsZW1zKTtcbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybTtcbn0se31dLDEyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbi8qXG4gICAgc2V0dGluZ3Mgb2JqZWN0IGhhcyB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZTpcbiAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgaHRtbCxcbiAgICAgICAgaW5wdXQ6IHtcbiAgICAgICAgICAgIHNlbGVjdG9yLCB2YWx1ZVxuICAgICAgICB9LFxuICAgICAgICB2YWxpZGF0b3JzOiBbXG4gICAgICAgICAgICB7dmFsaWRhdG9yLCBtZXNzYWdlfSAuLi5cbiAgICAgICAgXSxcbiAgICAgICAgZXJyb3JzID0ge1xuICAgICAgICAgICAgZWxlbUNsYXNzLCBoaWRpbmdDbGFzc1xuICAgICAgICB9XG4gICAgfVxuKi9cblxuY29uc3QgRm9ybUVsZW0gPSBmdW5jdGlvbihzZXR0aW5ncykge1xuICAgIHRoaXMudmFsdWUgPSBzZXR0aW5ncy5pbnB1dC52YWx1ZSB8fCBudWxsO1xuICAgIHRoaXMuZnJhZ21lbnQgPSB0aGlzLmNyZWF0ZURPTShzZXR0aW5ncy5odG1sKTtcbiAgICB0aGlzLmVsZW0gPSB0aGlzLmZyYWdtZW50LnF1ZXJ5U2VsZWN0b3Ioc2V0dGluZ3MuaW5wdXQuc2VsZWN0b3IpIHx8IG51bGw7XG4gICAgdGhpcy52YWxpZGF0b3JzID0gc2V0dGluZ3MudmFsaWRhdG9ycyB8fCBbXTtcbiAgICB0aGlzLmVycm9ycyA9IHtcbiAgICAgICAgZWxlbTogdGhpcy5mcmFnbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIHNldHRpbmdzLmVycm9ycy5lbGVtQ2xhc3MpIHx8IG51bGwsXG4gICAgICAgIGhpZGluZ0NsYXNzOiBzZXR0aW5ncy5lcnJvcnMuaGlkaW5nQ2xhc3MgfHwgJy5ub25lJyxcbiAgICAgICAgbWVzc2FnZXM6IFtdXG4gICAgfTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZUV2ZW50cygpO1xufTtcblxuRm9ybUVsZW0ucHJvdG90eXBlLmNyZWF0ZURPTSA9IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICBjb25zdCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICBjb25zdCB0bXBFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdG1wRWxlbS5pbm5lckhUTUwgPSBodG1sO1xuXG4gICAgY29uc3QgZWxlbXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0bXBFbGVtLmNoaWxkcmVuKTtcbiAgICBlbGVtcy5mb3JFYWNoKGVsZW0gPT4gZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZWxlbSkpXG5cbiAgICByZXR1cm4gZnJhZ21lbnQ7XG59O1xuXG5Gb3JtRWxlbS5wcm90b3R5cGUuaW5pdGlhbGl6ZUV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWxlbS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBldnQgPT4ge1xuICAgICAgICB0aGlzLmVycm9ycy5tZXNzYWdlcyA9IFtdO1xuICAgICAgICBcbiAgICAgICAgdGhpcy52YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHtcbiAgICAgICAgICAgIGlmICghdmFsaWRhdG9yLmhhbmRsZXIodGhpcy5lbGVtLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLm1lc3NhZ2VzLnB1c2godmFsaWRhdG9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5lcnJvcnMubWVzc2FnZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZUVycm9ycygpO1xuICAgICAgICAgICAgdGhpcy5lcnJvcnMuZWxlbS5pbm5lckhUTUwgPSAnJztcblxuICAgICAgICAgICAgY29uc29sZS5sb2cgKGV2dC50YXJnZXQudmFsdWUpXG4gICAgICAgIHRoaXMudmFsdWUgPSBldnQudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmxpc3RFcnJvcnMoKTtcbiAgICAgICAgdGhpcy5zaG93RXJyb3JzKCk7XG4gICAgfSk7XG59O1xuXG5Gb3JtRWxlbS5wcm90b3R5cGUuc2hvd0Vycm9ycyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmVycm9ycy5lbGVtLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLmVycm9ycy5oaWRpbmdDbGFzcykpIHtcbiAgICAgICAgdGhpcy5lcnJvcnMuZWxlbS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuZXJyb3JzLmhpZGluZ0NsYXNzKTtcbiAgICB9XG59O1xuXG5Gb3JtRWxlbS5wcm90b3R5cGUuaGlkZUVycm9ycyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5lcnJvcnMuZWxlbS5jbGFzc0xpc3QuY29udGFpbnModGhpcy5lcnJvcnMuaGlkaW5nQ2xhc3MpKSB7XG4gICAgICAgIHRoaXMuZXJyb3JzLmVsZW0uY2xhc3NMaXN0LmFkZCh0aGlzLmVycm9ycy5oaWRpbmdDbGFzcyk7XG4gICAgfVxufTtcblxuRm9ybUVsZW0ucHJvdG90eXBlLmxpc3RFcnJvcnMgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICB0aGlzLmVycm9ycy5tZXNzYWdlcy5mb3JFYWNoKGVycm9yID0+IHtcbiAgICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICBsaS50ZXh0Q29udGVudCA9IGVycm9yO1xuICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChsaSk7XG4gICAgfSk7XG4gICAgdGhpcy5lcnJvcnMuZWxlbS5pbm5lckhUTUwgPSAnJztcbiAgICB0aGlzLmVycm9ycy5lbGVtLmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybUVsZW07XG59LHt9XSwxMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBGb3JtID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2Zvcm1zL0Zvcm0nKTtcbmNvbnN0IEZvcm1FbGVtID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2Zvcm1zL0Zvcm1FbGVtJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIEZvcm0sXG4gICAgRm9ybUVsZW1cbn07XG59LHtcImNzcC1hcHAvbGlicy9mb3Jtcy9Gb3JtXCI6MTEsXCJjc3AtYXBwL2xpYnMvZm9ybXMvRm9ybUVsZW1cIjoxMn1dLDE0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IG1pbkxlbmd0aCA9IGZ1bmN0aW9uKG1pbikge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgcmV0dXJuIHN0ci50b1N0cmluZygpLmxlbmd0aCA+PSBtaW47XG4gICAgfTtcbn07XG5cbmNvbnN0IG1heExlbmd0aCA9IGZ1bmN0aW9uKG1heCkge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgcmV0dXJuIHN0ci50b1N0cmluZygpLmxlbmd0aCA8PSBtYXg7XG4gICAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG1pbkxlbmd0aCxcbiAgICBtYXhMZW5ndGhcbn07XG59LHt9XSwxNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBhcHAgPSByZXF1aXJlKCdjc3AtYXBwL3N0YXRlLmpzJyk7XG5jb25zdCBNYWluQ29udHJvbGxlciA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9yb290L01haW5Db250cm9sbGVyLmpzJyk7XG5cbi8vIGNvbnN0IFJvdXRlciA9IHtcbi8vICAgcm91dGVzOiBbXSxcbi8vICAgcmVnZXhwUGFyYW1zOiAvKFxcKDooW1xcd1xcZFxcLV9dKylcXCkpL2dpLFxuLy8gICB0cmltUm91dGU6IGZ1bmN0aW9uKHJvdXRlKXtcbi8vICAgICByb3V0ZSA9IHJvdXRlWzBdID09PSAnLydcbi8vICAgICAgID8gcm91dGUuc3Vic3RyKDEpXG4vLyAgICAgICA6IHJvdXRlO1xuXG4vLyAgICAgcm91dGUgPSByb3V0ZVtyb3V0ZS5sZW5ndGggLSAxXSA9PT0gJy8nXG4vLyAgICAgICA/IHJvdXRlLnN1YnN0cigwLCByb3V0ZS5sZW5ndGggLSAxKVxuLy8gICAgICAgOiByb3V0ZTtcblxuLy8gICAgIHJldHVybiByb3V0ZTtcbi8vICAgfSxcbi8vICAgZ2V0UGFyYW1zTmFtZXM6IGZ1bmN0aW9uIChyb3V0ZSkge1xuLy8gICAgIGxldCByZXN1bHQ7XG4vLyAgICAgbGV0IHBhcmFtc05hbWVzID0gW107XG4vLyAgICAgd2hpbGUgKChyZXN1bHQgPSB0aGlzLnJlZ2V4cFBhcmFtcy5leGVjKHJvdXRlKSkgIT09IG51bGwpIHtcbi8vICAgICAgIHBhcmFtc05hbWVzLnB1c2gocmVzdWx0WzJdKTtcbi8vICAgICB9XG4vLyAgICAgcmV0dXJuIHBhcmFtc05hbWVzO1xuLy8gICB9LFxuLy8gICBhZGRSb3V0ZTogZnVuY3Rpb24ocm91dGUsIGhhbmRsZXIpIHtcbi8vICAgICByb3V0ZSA9IHRoaXMudHJpbVJvdXRlKHJvdXRlKTtcbi8vICAgICBsZXQgcGFyYW1zTmFtZXMgPSB0aGlzLmdldFBhcmFtc05hbWVzKHJvdXRlKTtcbi8vICAgICBsZXQgcmVnZXhwU3RyID0gcm91dGUucmVwbGFjZShyZWdleHBQYXJhbXMsICdbXFxcXHdcXFxcZFxcLV9dKycpO1xuLy8gICAgIGxldCByZWdleHAgPSBSZWdFeHAoYF4ke3JlZ2V4cFN0cn0oXFxcXC98JClgLCAnZ2knKTtcblxuLy8gICAgIGxldCByb3V0ZU9iaiA9IHtcbi8vICAgICAgIHJlZ2V4cDogcmVnZXhwLFxuLy8gICAgICAgcGFyYW1zTmFtZXM6IHBhcmFtc05hbWVzXG4vLyAgICAgfTtcblxuLy8gICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuLy8gICAgICAgcm91dGVPYmouaGFuZGxlciA9IGhhbmRsZXI7XG4vLyAgICAgfVxuXG4vLyAgICAgaWYgKGhhbmRsZXIgaW5zdGFuY2VvZiBBcnJheSkge1xuLy8gICAgICAgcm91dGVPYmouY2hpbGRyZW4gPSBoYW5kbGVyO1xuLy8gICAgIH1cblxuLy8gICAgIGlmICghKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nIHx8IGhhbmRsZXIgaW5zdGFuY2VvZiBBcnJheSkpIHtcbi8vICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciBvY2N1cmVkIHdoaWxlIGFkZGluZyByb3V0ZScpO1xuLy8gICAgICAgdGhyb3cgbmV3IEVycm9yKCdyb3V0ZSBlcnJvcicpO1xuLy8gICAgIH1cblxuLy8gICAgIHRoaXMucm91dGVzLnB1c2gocm91dGVPYmopO1xuLy8gICAgIHJldHVybiB0aGlzO1xuLy8gICB9XG4vLyB9O1xuXG5jb25zdCBSb3V0ZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yb3V0ZXMgPSBbXTtcbn07XG5cblJvdXRlci5wcm90b3R5cGUucmVnZXhwUGFyYW1zID0gLyhcXCg6KFtcXHdcXGRcXC1fXSspXFwpKS9naTtcblxuUm91dGVyLnByb3RvdHlwZS50cmltUm91dGUgPSBmdW5jdGlvbihyb3V0ZSl7XG4gIHJvdXRlID0gcm91dGVbMF0gPT09ICcvJ1xuICAgID8gcm91dGUuc3Vic3RyKDEpXG4gICAgOiByb3V0ZTtcblxuICByb3V0ZSA9IHJvdXRlW3JvdXRlLmxlbmd0aCAtIDFdID09PSAnLydcbiAgICA/IHJvdXRlLnN1YnN0cigwLCByb3V0ZS5sZW5ndGggLSAxKVxuICAgIDogcm91dGU7XG5cbiAgcmV0dXJuIHJvdXRlO1xufSxcblxuUm91dGVyLnByb3RvdHlwZS5nZXRQYXJhbXNOYW1lcyA9IGZ1bmN0aW9uKHJvdXRlKSB7XG4gIGxldCByZXN1bHQ7XG4gIGxldCBwYXJhbXNOYW1lcyA9IFtdO1xuICB3aGlsZSAoKHJlc3VsdCA9IHRoaXMucmVnZXhwUGFyYW1zLmV4ZWMocm91dGUpKSAhPT0gbnVsbCkge1xuICAgIHBhcmFtc05hbWVzLnB1c2gocmVzdWx0WzJdKTtcbiAgfVxuICByZXR1cm4gcGFyYW1zTmFtZXM7XG59XG5cblJvdXRlci5wcm90b3R5cGUuYWRkUm91dGUgPSBmdW5jdGlvbihyb3V0ZSwgaGFuZGxlcikge1xuICByb3V0ZSA9IHRoaXMudHJpbVJvdXRlKHJvdXRlKTtcbiAgbGV0IHBhcmFtc05hbWVzID0gdGhpcy5nZXRQYXJhbXNOYW1lcyhyb3V0ZSk7XG4gIGxldCByZWdleHBTdHIgPSByb3V0ZS5yZXBsYWNlKHRoaXMucmVnZXhwUGFyYW1zLCAnW1xcXFx3XFxcXGRcXC1fXSsnKTtcbiAgbGV0IHJlZ2V4cCA9IFJlZ0V4cChgXiR7cmVnZXhwU3RyfShcXFxcL3wkKWAsICdnaScpO1xuXG4gIGxldCByb3V0ZU9iaiA9IHtcbiAgICByZWdleHA6IHJlZ2V4cCxcbiAgICBwYXJhbXNOYW1lczogcGFyYW1zTmFtZXNcbiAgfTtcblxuICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICByb3V0ZU9iai5oYW5kbGVyID0gaGFuZGxlcjtcbiAgfVxuXG4gIGlmIChoYW5kbGVyIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICByb3V0ZU9iai5jaGlsZHJlbiA9IGhhbmRsZXI7XG4gIH1cblxuICBpZiAoISh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJyB8fCBoYW5kbGVyIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgY29uc29sZS5sb2coJ0Vycm9yIG9jY3VyZWQgd2hpbGUgYWRkaW5nIHJvdXRlJyk7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyb3V0ZSBlcnJvcicpO1xuICB9XG5cbiAgdGhpcy5yb3V0ZXMucHVzaChyb3V0ZU9iaik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS5nZXRSb3V0ZSA9IGZ1bmN0aW9uKGxpbmssIHJvdXRlcyA9IHRoaXMucm91dGVzLCBwYXJhbXMgPSB7fSkge1xuICBsaW5rID0gbGluayA9PT0gJycgPyAnLycgOiBsaW5rO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aCwgcm91dGUgPSByb3V0ZXNbaV07IGkrKykge1xuICAgIGxldCByZWdleHAgPSByb3V0ZS5yZWdleHA7XG4gICAgbGV0IHJlc3VsdCA9IHJlZ2V4cC5leGVjKGxpbmspO1xuXG4gICAgaWYgKHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoID4gMSkge1xuICAgICAgZm9yIChsZXQgaWR4ID0gMTsgaWR4IDwgcmVzdWx0Lmxlbmd0aDsgaWR4KyspIHtcbiAgICAgICAgcGFyYW1zW3JvdXRlLnBhcmFtc05hbWVzW2lkeC0xXV0gPSByZXN1bHRbaWR4XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmVnZXhwLmxhc3RJbmRleCA+IDApIHtcbiAgICAgIGxpbmsgPSBsaW5rLnN1YnN0cihyZWdleHAubGFzdEluZGV4KTtcbiAgICB9XG5cbiAgICBpZiAocmVnZXhwLmxhc3RJbmRleCA+IDAgJiYgbGluay5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAocm91dGUuY2hpbGRyZW4gJiYgcm91dGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICBsZXQgY2hpbGRyZW5DaGVjayA9IHRoaXMuZ2V0Um91dGUobGluaywgcm91dGUuY2hpbGRyZW4sIHBhcmFtcyk7XG4gICAgICAgIGlmIChjaGlsZHJlbkNoZWNrICE9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkcmVuQ2hlY2s7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBlbHNlIGlmIChyZWdleHAubGFzdEluZGV4ID4gMCkge1xuICAgICAgaWYgKHJvdXRlLmhhbmRsZXIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBoYW5kbGVyOiByb3V0ZS5oYW5kbGVyLFxuICAgICAgICAgIHBhcmFtczogcGFyYW1zXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChyb3V0ZS5jaGlsZHJlbikge1xuICAgICAgICBsZXQgY2hpbGRyZW5DaGVjayA9IHRoaXMuZ2V0Um91dGUobGluaywgcm91dGUuY2hpbGRyZW4sIHBhcmFtcyk7XG4gICAgICAgIGlmIChjaGlsZHJlbkNoZWNrICE9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkcmVuQ2hlY2s7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cblJvdXRlci5wcm90b3R5cGUubmF2aWdhdGUgPSBmdW5jdGlvbihsaW5rKSB7XG4gIGxpbmsgPSB0aGlzLnRyaW1Sb3V0ZShsaW5rKTtcbiAgbGV0IHJvdXRlID0gdGhpcy5nZXRSb3V0ZShsaW5rKTtcbiAgaWYgKCFyb3V0ZSkge1xuICAgIGNvbnNvbGUubG9nKCdFcnJvciB3aGlsZSBuYXZpZ2F0aW5nIHJvdXRlJyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHJvdXRlLmhhbmRsZXIocm91dGUucGFyYW1zKTtcbiAgaGlzdG9yeS5wdXNoU3RhdGUoJycsICcnLCBsaW5rKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUm91dGVyO1xufSx7XCJjc3AtYXBwL2NvbXBvbmVudHMvcm9vdC9NYWluQ29udHJvbGxlci5qc1wiOjMsXCJjc3AtYXBwL3N0YXRlLmpzXCI6MTZ9XSwxNjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBhcHAgPSB7XG4gICAgY29tcG9uZW50czoge30sXG4gICAgcGF0aDogW11cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXBwO1xufSx7fV19LHt9LFsxXSk7XG4iXSwiZmlsZSI6InNvdXJjZS5qcyJ9
