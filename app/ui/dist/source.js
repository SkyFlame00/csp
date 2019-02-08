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
    const path = window.location.pathname;
    const rootInstance = Root.create();
    MainController.initialize(rootInstance);

    Router.setPaths({
        '/': {
            component: Dashboard,
            children: {
                'test': {
                    component: Test,
                    children: {}
                }
            }
        }
    });

    Router.navigate(path);
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
        let instances = componentsObjects.map(co => co.component.instantiate(co.parameters));
        // console.log('instances', instances)
        const renderedChain = instances.reverse().reduce((accumulator, instance) => {
            if (!!accumulator) instance.actions.render(accumulator.reference);
            return instance;
        }, null);
        console.log('renderedChain', renderedChain)
        MainController.root.render(renderedChain.reference);
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

const Router = {
    paths: {},
    setPaths: function(paths) {this.paths = paths;},
    pathExists: function(parts) {
        let paths = this.paths;
        for (let i = 0, part; i < parts.length, part = parts[i]; i++) {
            if (!paths || !this.paths[part]) return false;
            const params = paths[part].parameters;
            if (params && params.length > 0 && i !== parts.length) {
                if (parts.length-i < params.length) return false;
                i = i + params.length;
            }
            paths = paths[part].children;
        }
        return true;
    },
    makeComponentsObjects: function(parts) {
        let componentsObjects = [];
        let paths = this.paths;
        for (let i = 0, part; i < parts.length, part = parts[i]; i++) {
            const pathParams = paths[part].parameters;
            let params;
            if (pathParams && pathParams.length > 0 && i !== parts.length) {
                params = parts.slice(i+1, i+1+pathParams.length);
                i = i + params.length;
            }
            componentsObjects.push({
                path: part,
                component: paths[part].component,
                params: params || null
            })
            paths = paths[part].children;
        }
        return componentsObjects;
    },
    navigate: function(link) {
        let parts = ['/'];

        if (link !== '/') {
            link = link[0]               === '/' ? link.substring(1)              : link;
            link = link[link.length - 1] === '/' ? link.substring(0, link.length) : link;
            parts = parts.concat(link.split('/'));
        }
        
        if (!this.pathExists(parts)) {
            // display error
            console.log('The current path does not exist')
        }

        const componentsObjects = this.makeComponentsObjects(parts);

        try {
            MainController.render(componentsObjects);
            // add state
            history.pushState({}, '', link);
            console.log('Navigated to ' + link)
        }
        catch(e) {

        }
    }
};

module.exports = Router;
},{"csp-app/components/root/MainController.js":3,"csp-app/state.js":16}],16:[function(require,module,exports){
const app = {
    components: {},
    path: []
};

module.exports = app;
},{}]},{},[1]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzb3VyY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBSb290ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QnKTtcbmNvbnN0IFN0YXJ0UGFnZSA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9zdGFydHBhZ2UnKTtcbmNvbnN0IERhc2hib2FyZCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmQnKTtcbmNvbnN0IE1haW5Db250cm9sbGVyID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QvTWFpbkNvbnRyb2xsZXInKTtcbmNvbnN0IGFwcCA9IHJlcXVpcmUoJ2NzcC1hcHAvc3RhdGUuanMnKTtcbmNvbnN0IFRlc3QgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvdGVzdCcpO1xuXG5jb25zdCBSb3V0ZXIgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvcm91dGVyJylcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgIGNvbnN0IGxpbmsgPSBldnQudGFyZ2V0LmNsb3Nlc3QoJ2EnKTtcblxuICAgIGlmIChsaW5rICYmIGxpbmsuZGF0YXNldC5yb3V0ZSkge1xuICAgICAgICBSb3V0ZXIubmF2aWdhdGUobGluay5kYXRhc2V0LnJvdXRlKTtcbiAgICB9XG59KTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgZXZ0ID0+IHtcbiAgICBjb25zb2xlLmxvZygncGFnZSBjaGFuZ2VkOiAnLCBkb2N1bWVudC5sb2NhdGlvbik7XG4gICAgY29uc29sZS5sb2coZXZ0KTtcbiAgICBSb3V0ZXIubmF2aWdhdGUoZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUpO1xufSk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbihldnQpIHtcbiAgICBjb25zdCBwYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuICAgIGNvbnN0IHJvb3RJbnN0YW5jZSA9IFJvb3QuY3JlYXRlKCk7XG4gICAgTWFpbkNvbnRyb2xsZXIuaW5pdGlhbGl6ZShyb290SW5zdGFuY2UpO1xuXG4gICAgUm91dGVyLnNldFBhdGhzKHtcbiAgICAgICAgJy8nOiB7XG4gICAgICAgICAgICBjb21wb25lbnQ6IERhc2hib2FyZCxcbiAgICAgICAgICAgIGNoaWxkcmVuOiB7XG4gICAgICAgICAgICAgICAgJ3Rlc3QnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogVGVzdCxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IHt9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBSb3V0ZXIubmF2aWdhdGUocGF0aCk7XG59KTtcbn0se1wiY3NwLWFwcC9jb21wb25lbnRzL2Rhc2hib2FyZFwiOjIsXCJjc3AtYXBwL2NvbXBvbmVudHMvcm9vdFwiOjQsXCJjc3AtYXBwL2NvbXBvbmVudHMvcm9vdC9NYWluQ29udHJvbGxlclwiOjMsXCJjc3AtYXBwL2NvbXBvbmVudHMvc3RhcnRwYWdlXCI6OSxcImNzcC1hcHAvY29tcG9uZW50cy90ZXN0XCI6MTAsXCJjc3AtYXBwL2xpYnMvcm91dGVyXCI6MTUsXCJjc3AtYXBwL3N0YXRlLmpzXCI6MTZ9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IERhc2hib2FyZCA9IHtcbiAgICBodG1sOiBgXG4gICAgICAgIDxkaXYgaWQ9XCJkYXNoYm9hcmRcIj5cbiAgICAgICAgICAgIDxoMT5IZWxsbyB3b3JsZCE8L2gxPlxuICAgICAgICAgICAgPGEgZGF0YS1yb3V0ZT1cInRlc3RcIj5HbyB0byBUZXN0IGNvbXBvbmVudDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBpbnN0YW50aWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGVtcC5pbm5lckhUTUwgPSB0aGlzLmh0bWw7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0ZW1wLmZpcnN0RWxlbWVudENoaWxkXG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVmZXJlbmNlOiBlbGVtZW50LFxuICAgICAgICAgICAgYWN0aW9uczoge1xuICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24oRE9NVHJlZSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKERPTVRyZWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRGFzaGJvYXJkO1xufSx7fV0sMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBhcHAgPSByZXF1aXJlKCdjc3AtYXBwL3N0YXRlLmpzJyk7XG5cbmNvbnN0IE1haW5Db250cm9sbGVyID0ge1xuICAgIHJvb3Q6IG51bGwsXG4gICAgcGF0aDogW10sXG4gICAgcmVuZGVyOiBmdW5jdGlvbihjb21wb25lbnRzT2JqZWN0cykge1xuICAgICAgICBcbiAgICAgICAgLy8gY29uc3QgYWxsUm91dGVyc0V4aXN0ID0gaW5zdGFuY2VzLmV2ZXJ5KGluc3RhbmNlID0+ICEhaW5zdGFuY2Uucm91dGVyT3V0bGV0KTtcbiAgICAgICAgLy8gaWYgKCFhbGxSb3V0ZXJzRXhpc3QpIHRocm93IG5ldyBFcnJvcignT25lIG9yIG1vcmUgcm91dGVyIG91dGxldHMgZG8gbm90IGV4aXN0Jyk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucGF0aC5maW5kSW5kZXgoKHBhcnQsIGkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBwYXJ0LnBhdGggIT09IGNvbXBvbmVudHNPYmplY3RzW2ldLnBhdGhcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICBjb21wb25lbnRzT2JqZWN0cy5zcGxpY2UoMCwgaW5kZXgpO1xuICAgICAgICAgICAgdGhpcy5wYXRoLnNwbGljZShpbmRleCk7XG4gICAgICAgICAgICB0aGlzLnBhdGguY29uY2F0KGNvbXBvbmVudHNPYmplY3RzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucGF0aCA9IGNvbXBvbmVudHNPYmplY3RzO1xuICAgICAgICB9XG4gICAgICAgIGxldCBpbnN0YW5jZXMgPSBjb21wb25lbnRzT2JqZWN0cy5tYXAoY28gPT4gY28uY29tcG9uZW50Lmluc3RhbnRpYXRlKGNvLnBhcmFtZXRlcnMpKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2luc3RhbmNlcycsIGluc3RhbmNlcylcbiAgICAgICAgY29uc3QgcmVuZGVyZWRDaGFpbiA9IGluc3RhbmNlcy5yZXZlcnNlKCkucmVkdWNlKChhY2N1bXVsYXRvciwgaW5zdGFuY2UpID0+IHtcbiAgICAgICAgICAgIGlmICghIWFjY3VtdWxhdG9yKSBpbnN0YW5jZS5hY3Rpb25zLnJlbmRlcihhY2N1bXVsYXRvci5yZWZlcmVuY2UpO1xuICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgICB9LCBudWxsKTtcbiAgICAgICAgY29uc29sZS5sb2coJ3JlbmRlcmVkQ2hhaW4nLCByZW5kZXJlZENoYWluKVxuICAgICAgICBNYWluQ29udHJvbGxlci5yb290LnJlbmRlcihyZW5kZXJlZENoYWluLnJlZmVyZW5jZSk7XG4gICAgfSxcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihyb290SW5zdGFuY2UpIHtcbiAgICAgICAgdGhpcy5yb290ID0gcm9vdEluc3RhbmNlO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9ICcnO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHJvb3RJbnN0YW5jZS5yZWZlcmVuY2UpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFpbkNvbnRyb2xsZXI7XG59LHtcImNzcC1hcHAvc3RhdGUuanNcIjoxNn1dLDQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgUm9vdCA9IHtcbiAgICBjb21wb25lbnROYW1lOiAnYXBwJyxcbiAgICBodG1sOiBgPGRpdiBpZD1cImFwcFwiPjwvZGl2PmAsXG4gICAgaWRlbnRpZmllcjogJyNhcHAnLFxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIENvbnNpZGVyIHJlaW1wbGVtZW50aW5nIHdpdGggSFRNTDUgdGVtcGxhdGUgZmVhdHVyZSBpbnN0ZWFkIGp1c3QgdXRpbGl6aW5nIGRpdlxuICAgICAgICBjb25zdCB0bXBFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRtcEVsZW0uaW5uZXJIVE1MID0gdGhpcy5odG1sO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdG1wRWxlbS5maXJzdENoaWxkO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZWZlcmVuY2U6IGVsZW1lbnQsXG4gICAgICAgICAgICByb3V0ZXJPdXRsZXQ6IGVsZW1lbnQsXG4gICAgICAgICAgICBjb21wb25lbnROYW1lOiB0aGlzLmNvbXBvbmVudE5hbWUsXG4gICAgICAgICAgICBzdGF0ZToge30sXG4gICAgICAgICAgICBhY3Rpb25zOiAoZnVuY3Rpb24ocm91dGVyT3V0bGV0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZDogZnVuY3Rpb24oZnJhZ21lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlck91dGxldC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlck91dGxldC5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoZWxlbWVudCksXG4gICAgICAgICAgICByZW5kZXI6IChmdW5jdGlvbihyb3V0ZXJPdXRsZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oRE9NVHJlZSkge1xuICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIHJvdXRlck91dGxldC5hcHBlbmRDaGlsZChET01UcmVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KShlbGVtZW50KVxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb290O1xufSx7fV0sNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7IEZvcm0sIEZvcm1FbGVtIH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMnKTtcbmNvbnN0IHsgbWluTGVuZ3RoOiBtaW5MZW5ndGhHZW5lcmljLCBtYXhMZW5ndGg6IG1heExlbmd0aEdlbmVyaWMgfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3Jtcy91dGlsaXRpZXMvdmFsaWRhdG9ycycpO1xuY29uc3QgbWluTGVuZ3RoID0gbWluTGVuZ3RoR2VuZXJpYyg0KTtcbmNvbnN0IG1heExlbmd0aCA9IG1heExlbmd0aEdlbmVyaWMoMTYpO1xuXG5jb25zdCBsb2dpbkVsZW0gPSBuZXcgRm9ybUVsZW0oe1xuICAgIGh0bWw6IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWJsb2NrIGNsZWFyZml4XCI+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwic2lnbnVwLWNsaWVudC1sb2dpblwiIHBsYWNlaG9sZGVyPVwiTG9naW5cIiAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZvcm1lbGVtLWVycm9yc1wiPjwvZGl2PmBcbiAgICAgICAgLFxuICAgIGlucHV0OiB7IHNlbGVjdG9yOiAnLmlucHV0LWJsb2NrIGlucHV0JywgdmFsdWU6IG51bGwgfSxcbiAgICBlcnJvcnM6IHtcbiAgICAgICAgZWxlbUNsYXNzOiAnZm9ybWVsZW0tZXJyb3JzJ1xuICAgIH0sXG4gICAgdmFsaWRhdG9yczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBoYW5kbGVyOiBtaW5MZW5ndGgsXG4gICAgICAgICAgICBtZXNzYWdlOiAnVGhlIGxlbmd0aCBpcyBsZXNzIHRoYW4gNCBjaGFycydcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGFuZGxlcjogbWF4TGVuZ3RoLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1RoZSBsZW5ndGggaXMgbW9yZSB0aGFuIDE2IGNoYXJzJ1xuICAgICAgICB9XG4gICAgXVxufSk7XG5cbmNvbnN0IHBhc3N3b3JkRWxlbSA9IG5ldyBGb3JtRWxlbSh7XG4gICAgaHRtbDogYFxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW5wdXQtYmxvY2sgY2xlYXJmaXhcIj5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBpZD1cInNpZ251cC1jbGllbnQtcGFzc3dvcmRcIiBwbGFjZWhvbGRlcj1cIlBhc3N3b3JkXCIgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtZWxlbS1lcnJvcnNcIj48L2Rpdj5gLFxuICAgIGlucHV0OiB7IHNlbGVjdG9yOiAnLmlucHV0LWJsb2NrIGlucHV0JywgdmFsdWU6IG51bGwgfSxcbiAgICBlcnJvcnM6IHtcbiAgICAgICAgZWxlbUNsYXNzOiAnZm9ybWVsZW0tZXJyb3JzJ1xuICAgIH0sXG4gICAgdmFsaWRhdG9yczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBoYW5kbGVyOiBtaW5MZW5ndGgsXG4gICAgICAgICAgICBtZXNzYWdlOiAnVGhlIGxlbmd0aCBpcyBsZXNzIHRoYW4gNCBjaGFycydcbiAgICAgICAgfVxuICAgIF1cbn0pO1xuXG5jb25zdCBwYXNzd29yZENvbmZFbGVtID0gbmV3IEZvcm1FbGVtKHtcbiAgICBodG1sOiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ibG9jayBjbGVhcmZpeFwiPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgaWQ9XCJzaWdudXAtY2xpZW50LXBhc3N3b3JkY29uZlwiIHBsYWNlaG9sZGVyPVwiQ29uZmlybSBwYXNzd29yZFwiIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybWVsZW0tZXJyb3JzXCI+PC9kaXY+YCxcbiAgICBpbnB1dDogeyBzZWxlY3RvcjogJy5pbnB1dC1ibG9jayBpbnB1dCcsIHZhbHVlOiBudWxsIH0sXG4gICAgZXJyb3JzOiB7XG4gICAgICAgIGVsZW1DbGFzczogJ2Zvcm1lbGVtLWVycm9ycydcbiAgICB9LFxuICAgIHZhbGlkYXRvcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaGFuZGxlcjogbWluTGVuZ3RoLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1RoZSBsZW5ndGggaXMgbGVzcyB0aGFuIDQgY2hhcnMnXG4gICAgICAgIH1cbiAgICBdXG59KTtcblxuY29uc3Qgb3JnYW5pemF0aW9uID0gbmV3IEZvcm1FbGVtKHtcbiAgICBodG1sOiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ibG9jayBjbGVhcmZpeFwiPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgaWQ9XCJzaWdudXAtY2xpZW50LW9yZ1wiIHBsYWNlaG9sZGVyPVwiT3JnYW5pemF0aW9uXCIgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtZWxlbS1lcnJvcnNcIj48L2Rpdj5gLFxuICAgIGlucHV0OiB7IHNlbGVjdG9yOiAnLmlucHV0LWJsb2NrIGlucHV0JywgdmFsdWU6IG51bGwgfSxcbiAgICBlcnJvcnM6IHtcbiAgICAgICAgZWxlbUNsYXNzOiAnZm9ybWVsZW0tZXJyb3JzJ1xuICAgIH0sXG59KTtcblxuY29uc3QgU2lnbnVwQ2xpZW50Rm9ybSA9IG5ldyBGb3JtKHtcbiAgICBuYW1lOiAnc2lnbnVwLWNsaWVudCcsXG4gICAgaHRtbDogYFxuICAgICAgICA8Zm9ybT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dHNcIj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhY3Rpb25zXCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJzdWJtaXRcIiB2YWx1ZT1cIlNpZ24gVXBcIj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Zvcm0+XG4gICAgYCxcbiAgICBlbGVtczogW2xvZ2luRWxlbSwgcGFzc3dvcmRFbGVtLCBwYXNzd29yZENvbmZFbGVtLCBvcmdhbml6YXRpb25dLFxuICAgIHdoZXJlVG9QdXQ6ICcuaW5wdXRzJyxcbiAgICBzdWJtaXQ6IHtcbiAgICAgICAgaGFuZGxlcjogKCkgPT4ge30sXG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbnVwQ2xpZW50Rm9ybTtcbn0se1wiY3NwLWFwcC9saWJzL2Zvcm1zXCI6MTMsXCJjc3AtYXBwL2xpYnMvZm9ybXMvdXRpbGl0aWVzL3ZhbGlkYXRvcnNcIjoxNH1dLDY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgeyBGb3JtLCBGb3JtRWxlbSB9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2Zvcm1zJyk7XG5jb25zdCB7IG1pbkxlbmd0aDogbWluTGVuZ3RoR2VuZXJpYywgbWF4TGVuZ3RoOiBtYXhMZW5ndGhHZW5lcmljIH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMvdXRpbGl0aWVzL3ZhbGlkYXRvcnMnKTtcbmNvbnN0IG1pbkxlbmd0aCA9IG1pbkxlbmd0aEdlbmVyaWMoNCk7XG5jb25zdCBtYXhMZW5ndGggPSBtYXhMZW5ndGhHZW5lcmljKDE2KTtcblxuY29uc3QgbG9naW5FbGVtID0gbmV3IEZvcm1FbGVtKHtcbiAgICBodG1sOiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ibG9jayBjbGVhcmZpeFwiPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cInNpZ251cC1leGVjLWxvZ2luXCIgcGxhY2Vob2xkZXI9XCJMb2dpblwiIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybWVsZW0tZXJyb3JzXCI+PC9kaXY+YCxcbiAgICBpbnB1dDogeyBzZWxlY3RvcjogJy5pbnB1dC1ibG9jayBpbnB1dCcsIHZhbHVlOiBudWxsIH0sXG4gICAgZXJyb3JzOiB7XG4gICAgICAgIGVsZW1DbGFzczogJ2Zvcm1lbGVtLWVycm9ycydcbiAgICB9LFxuICAgIHZhbGlkYXRvcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaGFuZGxlcjogbWluTGVuZ3RoLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1RoZSBsZW5ndGggaXMgbGVzcyB0aGFuIDQgY2hhcnMnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhhbmRsZXI6IG1heExlbmd0aCxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdUaGUgbGVuZ3RoIGlzIG1vcmUgdGhhbiAxNiBjaGFycydcbiAgICAgICAgfVxuICAgIF1cbn0pO1xuXG5jb25zdCBwYXNzd29yZEVsZW0gPSBuZXcgRm9ybUVsZW0oe1xuICAgIGh0bWw6IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWJsb2NrIGNsZWFyZml4XCI+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBpZD1cInNpZ251cC1leGVjLXBhc3N3b3JkXCIgcGxhY2Vob2xkZXI9XCJQYXNzd29yZFwiIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybWVsZW0tZXJyb3JzXCI+PC9kaXY+YCxcbiAgICBpbnB1dDogeyBzZWxlY3RvcjogJy5pbnB1dC1ibG9jayBpbnB1dCcsIHZhbHVlOiBudWxsIH0sXG4gICAgZXJyb3JzOiB7XG4gICAgICAgIGVsZW1DbGFzczogJ2Zvcm1lbGVtLWVycm9ycydcbiAgICB9LFxuICAgIHZhbGlkYXRvcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaGFuZGxlcjogbWluTGVuZ3RoLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1RoZSBsZW5ndGggaXMgbGVzcyB0aGFuIDQgY2hhcnMnXG4gICAgICAgIH1cbiAgICBdXG59KTtcblxuY29uc3QgcGFzc3dvcmRDb25mRWxlbSA9IG5ldyBGb3JtRWxlbSh7XG4gICAgaHRtbDogYFxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW5wdXQtYmxvY2sgY2xlYXJmaXhcIj5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIGlkPVwic2lnbnVwLWV4ZWMtcGFzc3dvcmRjb25mXCIgcGxhY2Vob2xkZXI9XCJDb25maXJtIHBhc3N3b3JkXCIgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybWVsZW0tZXJyb3JzXCI+PC9kaXY+YCxcbiAgICBpbnB1dDogeyBzZWxlY3RvcjogJy5pbnB1dC1ibG9jayBpbnB1dCcsIHZhbHVlOiBudWxsIH0sXG4gICAgZXJyb3JzOiB7XG4gICAgICAgIGVsZW1DbGFzczogJ2Zvcm1lbGVtLWVycm9ycydcbiAgICB9LFxuICAgIHZhbGlkYXRvcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaGFuZGxlcjogbWluTGVuZ3RoLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1RoZSBsZW5ndGggaXMgbGVzcyB0aGFuIDQgY2hhcnMnXG4gICAgICAgIH1cbiAgICBdXG59KTtcblxuY29uc3QgU2lnbnVwRXhlY0Zvcm0gPSBuZXcgRm9ybSh7XG4gICAgbmFtZTogJ3NpZ251cC1leGVjJyxcbiAgICBodG1sOiBgXG4gICAgICAgIDxmb3JtPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0c1wiPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInN1Ym1pdFwiIHZhbHVlPVwiU2lnbiBVcFwiPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZm9ybT5cbiAgICBgLFxuICAgIGVsZW1zOiB7XG4gICAgICAgICdsb2dpbic6IGxvZ2luRWxlbSxcbiAgICAgICAgJ3B3JzogcGFzc3dvcmRFbGVtLFxuICAgICAgICAncHdDb25mJzogcGFzc3dvcmRDb25mRWxlbVxuICAgIH0sXG4gICAgd2hlcmVUb1B1dDogJy5pbnB1dHMnLFxuICAgIHN1Ym1pdDoge1xuICAgICAgICBoYW5kbGVyOiBlbGVtcyA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnaGVsbG8nKVxuXG4gICAgICAgICAgICBjb25zdCBodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlZ0RhdGEgPSB7XG4gICAgICAgICAgICAgICAgbG9naW46IGVsZW1zWydsb2dpbiddLnZhbHVlLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkRWxlbTogZWxlbXNbJ3B3J10udmFsdWVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZWdEYXRhKVxuXG4gICAgICAgICAgICBodHRwLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGh0dHAub3BlbignUE9TVCcsICcvYXBpL2dldERhdGEnLCB0cnVlKTtcbiAgICAgICAgICAgIGh0dHAuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgIGh0dHAuc2VuZChKU09OLnN0cmluZ2lmeShyZWdEYXRhKSk7XG5cbiAgICAgICAgfSxcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaWdudXBFeGVjRm9ybTtcbn0se1wiY3NwLWFwcC9saWJzL2Zvcm1zXCI6MTMsXCJjc3AtYXBwL2xpYnMvZm9ybXMvdXRpbGl0aWVzL3ZhbGlkYXRvcnNcIjoxNH1dLDc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgTG9naW5Gb3JtID0gcmVxdWlyZSgnLi9sb2dpbmZvcm0nKTtcbmNvbnN0IFNpZ251cEV4ZWNGb3JtID0gcmVxdWlyZSgnLi9leGVjZm9ybScpO1xuY29uc3QgU2lnbnVwQ2xpZW50Rm9ybSA9IHJlcXVpcmUoJy4vY2xpZW50Zm9ybScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBMb2dpbkZvcm0sXG4gICAgU2lnbnVwRXhlY0Zvcm0sXG4gICAgU2lnbnVwQ2xpZW50Rm9ybVxufTtcbn0se1wiLi9jbGllbnRmb3JtXCI6NSxcIi4vZXhlY2Zvcm1cIjo2LFwiLi9sb2dpbmZvcm1cIjo4fV0sODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7IEZvcm0sIEZvcm1FbGVtIH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMnKTtcbmNvbnN0IHsgbWluTGVuZ3RoOiBtaW5MZW5ndGhHZW5lcmljLCBtYXhMZW5ndGg6IG1heExlbmd0aEdlbmVyaWMgfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3Jtcy91dGlsaXRpZXMvdmFsaWRhdG9ycycpO1xuY29uc3QgbWluTGVuZ3RoID0gbWluTGVuZ3RoR2VuZXJpYyg0KTtcbmNvbnN0IG1heExlbmd0aCA9IG1heExlbmd0aEdlbmVyaWMoMTYpO1xuXG5jb25zdCBsb2dpbkVsZW0gPSBuZXcgRm9ybUVsZW0oe1xuICAgIGh0bWw6IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWJsb2NrXCI+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwibG9naW4tbG9naW5cIiBwbGFjZWhvbGRlcj1cIkxvZ2luXCIgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtZWxlbS1lcnJvcnNcIj48L2Rpdj5gLFxuICAgIGlucHV0OiB7IHNlbGVjdG9yOiAnLmlucHV0LWJsb2NrIGlucHV0JywgdmFsdWU6IG51bGwgfSxcbiAgICBlcnJvcnM6IHtcbiAgICAgICAgZWxlbUNsYXNzOiAnZm9ybWVsZW0tZXJyb3JzJ1xuICAgIH0sXG4gICAgdmFsaWRhdG9yczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBoYW5kbGVyOiBtaW5MZW5ndGgsXG4gICAgICAgICAgICBtZXNzYWdlOiAnVGhlIGxlbmd0aCBpcyBsZXNzIHRoYW4gNCBjaGFycydcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGFuZGxlcjogbWF4TGVuZ3RoLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1RoZSBsZW5ndGggaXMgbW9yZSB0aGFuIDE2IGNoYXJzJ1xuICAgICAgICB9XG4gICAgXVxufSk7XG5cbmNvbnN0IHBhc3N3b3JkRWxlbSA9IG5ldyBGb3JtRWxlbSh7XG4gICAgaHRtbDogYFxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW5wdXQtYmxvY2sgY2xlYXJmaXhcIj5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIGlkPVwibG9naW4tcGFzc3dvcmRcIiBwbGFjZWhvbGRlcj1cIlBhc3N3b3JkXCIgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtZWxlbS1lcnJvcnNcIj48L2Rpdj5gLFxuICAgIGlucHV0OiB7IHNlbGVjdG9yOiAnLmlucHV0LWJsb2NrIGlucHV0JywgdmFsdWU6IG51bGwgfSxcbiAgICBlcnJvcnM6IHtcbiAgICAgICAgZWxlbUNsYXNzOiAnZm9ybWVsZW0tZXJyb3JzJ1xuICAgIH0sXG4gICAgdmFsaWRhdG9yczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBoYW5kbGVyOiBtaW5MZW5ndGgsXG4gICAgICAgICAgICBtZXNzYWdlOiAnVGhlIGxlbmd0aCBpcyBsZXNzIHRoYW4gNCBjaGFycydcbiAgICAgICAgfVxuICAgIF1cbn0pO1xuXG5jb25zdCBMb2dpbkZvcm0gPSBuZXcgRm9ybSh7XG4gICAgbmFtZTogJ2xvZ2luJyxcbiAgICBodG1sOiBgXG4gICAgICAgIDxmb3JtPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0c1wiPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInN1Ym1pdFwiIHZhbHVlPVwiTG9nIGluXCI+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9mb3JtPlxuICAgIGAsXG4gICAgZWxlbXM6IHtcbiAgICAgICAgJ2xvZ2luJzogbG9naW5FbGVtLFxuICAgICAgICAncHcnOiBwYXNzd29yZEVsZW1cbiAgICB9LCBcbiAgICB3aGVyZVRvUHV0OiAnLmlucHV0cycsXG4gICAgc3VibWl0OiB7XG4gICAgICAgIGhhbmRsZXI6IGVsZW1zID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICAgICAgaHR0cC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dlIHJlIGxvZ2lubmluZycpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGh0dHAub3BlbignUE9TVCcsICcvYXBpL2xvZ2luJywgdHJ1ZSk7XG4gICAgICAgICAgICBodHRwLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICBodHRwLnNlbmQoSlNPTi5zdHJpbmdpZnkoe2xvZ2luOiBlbGVtcy5sb2dpbiwgcHc6IGVsZW1zLnB3fSkpO1xuICAgICAgICB9LFxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvZ2luRm9ybTtcbn0se1wiY3NwLWFwcC9saWJzL2Zvcm1zXCI6MTMsXCJjc3AtYXBwL2xpYnMvZm9ybXMvdXRpbGl0aWVzL3ZhbGlkYXRvcnNcIjoxNH1dLDk6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgeyBMb2dpbkZvcm0sIFNpZ251cENsaWVudEZvcm0sIFNpZ251cEV4ZWNGb3JtIH0gPSByZXF1aXJlKCcuL2Zvcm1zJyk7XG5cbmNvbnN0IGhpZGVDbGFzcyA9ICdkaXNwbGF5LW5vbmUnO1xuXG5jb25zdCBTdGFydFBhZ2UgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmh0bWwgPSBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJ3cmFwcGVyXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhcnRwYWdlXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxvZ28tYmxvY2tcIj5cbiAgICAgICAgICAgICAgICAgICAgPGgxPldlbGNvbWUgdG8gQ29uc3VsdGluZyBTZXJ2aWNlcyBQbGF0Zm9ybTwvaDE+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICA8YSBkYXRhLXJvdXRlPVwiL1wiPkhvbWU8L2E+XG4gICAgICAgICAgICAgICAgPGEgZGF0YS1yb3V0ZT1cIi9kYXNoYm9hcmRcIj5EYXNoYm9hcmQ8L2E+XG5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWFpbi1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJsb2dpbi1zd2l0Y2hcIj5Mb2cgaW48L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cInNpZ251cC1zd2l0Y2hcIj5TaWduIHVwPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibG9naW5cIiBpZD1cImxvZ2luXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJoZWFkZXJcIj48aDI+TG9nIGluPC9oMj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxvZ2luLWZvcm0gZm9ybVwiPjwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzaWdudXBcIiBpZD1cInNpZ251cFwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFiLWFjdGlvbnMgY2xlYXJmaXhcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJjbGllbnQtc3dpdGNoXCI+U2lnbiB1cCBhcyBjbGllbnQ8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJleGVjLXN3aXRjaFwiPlNpZ24gdXAgYXMgZXhlY3V0b3I8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNpZ251cC1mb3JtXCIgaWQ9XCJzaWdudXAtZm9ybVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNsaWVudC1mb3JtIGZvcm1cIiBpZD1cImNsaWVudC1mb3JtXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXhlYy1mb3JtIGZvcm1cIiBpZD1cImV4ZWMtZm9ybVwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICBgO1xuICAgIHRoaXMuZm9ybXMgPSB7XG4gICAgICAgIFtMb2dpbkZvcm0ubmFtZV06IExvZ2luRm9ybSxcbiAgICAgICAgW1NpZ251cENsaWVudEZvcm0ubmFtZV06IFNpZ251cENsaWVudEZvcm0sXG4gICAgICAgIFtTaWdudXBFeGVjRm9ybS5uYW1lXTogU2lnbnVwRXhlY0Zvcm1cbiAgICB9O1xuICAgIHRoaXMuZnJhZ21lbnQgPSB0aGlzLmNyZWF0ZURPTSh0aGlzLmh0bWwpO1xuICAgIHRoaXMud2hlcmVUb1B1dCA9IHtcbiAgICAgICAgW0xvZ2luRm9ybS5uYW1lXTogJy5sb2dpbi1mb3JtJyxcbiAgICAgICAgW1NpZ251cENsaWVudEZvcm0ubmFtZV06ICcuY2xpZW50LWZvcm0nLFxuICAgICAgICBbU2lnbnVwRXhlY0Zvcm0ubmFtZV06ICcuZXhlYy1mb3JtJ1xuICAgIH07XG4gICAgdGhpcy5lbGVtcyA9IHtcbiAgICAgICAgbG9naW5CdG46IHRoaXMuZnJhZ21lbnQucXVlcnlTZWxlY3RvcignI2xvZ2luLXN3aXRjaCcpLFxuICAgICAgICBzaWdudXBCdG46IHRoaXMuZnJhZ21lbnQucXVlcnlTZWxlY3RvcignI3NpZ251cC1zd2l0Y2gnKSxcbiAgICAgICAgbG9naW5QYXJ0OiB0aGlzLmZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsb2dpbicpLFxuICAgICAgICBzaWdudXBQYXJ0OiB0aGlzLmZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzaWdudXAnKSxcbiAgICAgICAgY2xpZW50QnRuOiB0aGlzLmZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjbGllbnQtc3dpdGNoJyksXG4gICAgICAgIGV4ZWNCdG46IHRoaXMuZnJhZ21lbnQucXVlcnlTZWxlY3RvcignI2V4ZWMtc3dpdGNoJyksXG4gICAgICAgIGNsaWVudFBhcnQ6IHRoaXMuZnJhZ21lbnQucXVlcnlTZWxlY3RvcignI2NsaWVudC1mb3JtJyksXG4gICAgICAgIGV4ZWNQYXJ0OiB0aGlzLmZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoJyNleGVjLWZvcm0nKSxcbiAgICAgICAgLy8gU2lnbiBVcCBwYXJ0XG4gICAgICAgIHNpZ251cFRhYjE6IHRoaXMuZnJhZ21lbnQucXVlcnlTZWxlY3RvcignI3NpZ251cCAudGFiLWFjdGlvbnMgYnV0dG9uOmZpcnN0LWNoaWxkJyksXG4gICAgICAgIHNpZ251cFRhYjI6IHRoaXMuZnJhZ21lbnQucXVlcnlTZWxlY3RvcignI3NpZ251cCAudGFiLWFjdGlvbnMgYnV0dG9uOmxhc3QtY2hpbGQnKSxcbiAgICAgICAgc2lnbnVwUGFydEZvcm06IHRoaXMuZnJhZ21lbnQucXVlcnlTZWxlY3RvcignI3NpZ251cC1mb3JtJylcbiAgICB9O1xuICAgIFxuICAgIHRoaXMuaW5zZXJ0Rm9ybXMoKTtcbiAgICB0aGlzLmluaXRpYWxpemVFdmVudHMoKTtcbiAgICB0aGlzLnNldERlZmF1bHRTdGF0ZSgpO1xufTtcblxuU3RhcnRQYWdlLnByb3RvdHlwZS5jcmVhdGVET00gPSBmdW5jdGlvbihodG1sKSB7XG4gICAgY29uc3QgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgY29uc3QgdG1wRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRtcEVsZW0uaW5uZXJIVE1MID0gaHRtbDtcblxuICAgIGNvbnN0IGVsZW1zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodG1wRWxlbS5jaGlsZHJlbik7XG4gICAgZWxlbXMuZm9yRWFjaChlbGVtID0+IGZyYWdtZW50LmFwcGVuZENoaWxkKGVsZW0pKTtcblxuICAgIHJldHVybiBmcmFnbWVudDtcbn07XG5cblN0YXJ0UGFnZS5wcm90b3R5cGUuaW5zZXJ0Rm9ybXMgPSBmdW5jdGlvbigpIHtcbiAgICBPYmplY3Qua2V5cyh0aGlzLndoZXJlVG9QdXQpLmZvckVhY2goZm9ybU5hbWUgPT4ge1xuICAgICAgICB0aGlzLmZyYWdtZW50XG4gICAgICAgICAgICAucXVlcnlTZWxlY3Rvcih0aGlzLndoZXJlVG9QdXRbZm9ybU5hbWVdKVxuICAgICAgICAgICAgLmFwcGVuZENoaWxkKHRoaXMuZm9ybXNbZm9ybU5hbWVdLmZyYWdtZW50KTtcbiAgICB9KTtcbn07XG5cblN0YXJ0UGFnZS5wcm90b3R5cGUuaW5pdGlhbGl6ZUV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWxlbXMubG9naW5CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgICAgICB0aGlzLmVsZW1zLmxvZ2luUGFydC5jbGFzc0xpc3QucmVtb3ZlKGhpZGVDbGFzcyk7XG4gICAgICAgIHRoaXMuZWxlbXMuc2lnbnVwUGFydC5jbGFzc0xpc3QuYWRkKGhpZGVDbGFzcyk7XG5cbiAgICAgICAgdGhpcy5lbGVtcy5sb2dpbkJ0bi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgdGhpcy5lbGVtcy5zaWdudXBCdG4uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgfSk7XG4gICAgdGhpcy5lbGVtcy5zaWdudXBCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgICAgICB0aGlzLmVsZW1zLnNpZ251cFBhcnQuY2xhc3NMaXN0LnJlbW92ZShoaWRlQ2xhc3MpO1xuICAgICAgICB0aGlzLmVsZW1zLmxvZ2luUGFydC5jbGFzc0xpc3QuYWRkKGhpZGVDbGFzcyk7XG5cbiAgICAgICAgdGhpcy5lbGVtcy5zaWdudXBCdG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgIHRoaXMuZWxlbXMubG9naW5CdG4uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgfSk7XG4gICAgdGhpcy5lbGVtcy5jbGllbnRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgICAgICB0aGlzLmVsZW1zLmNsaWVudFBhcnQuY2xhc3NMaXN0LnJlbW92ZShoaWRlQ2xhc3MpO1xuICAgICAgICB0aGlzLmVsZW1zLmV4ZWNQYXJ0LmNsYXNzTGlzdC5hZGQoaGlkZUNsYXNzKTtcblxuICAgICAgICB0aGlzLmVsZW1zLmNsaWVudEJ0bi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgdGhpcy5lbGVtcy5leGVjQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIH0pO1xuICAgIHRoaXMuZWxlbXMuZXhlY0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2dCA9PiB7XG4gICAgICAgIHRoaXMuZWxlbXMuZXhlY1BhcnQuY2xhc3NMaXN0LnJlbW92ZShoaWRlQ2xhc3MpO1xuICAgICAgICB0aGlzLmVsZW1zLmNsaWVudFBhcnQuY2xhc3NMaXN0LmFkZChoaWRlQ2xhc3MpO1xuXG4gICAgICAgIHRoaXMuZWxlbXMuZXhlY0J0bi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgdGhpcy5lbGVtcy5jbGllbnRCdG4uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgfSk7XG4gICAgdGhpcy5lbGVtcy5zaWdudXBUYWIxLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICB0aGlzLmVsZW1zLnNpZ251cFRhYjEuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgIHRoaXMuZWxlbXMuc2lnbnVwVGFiMi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgICAgdGhpcy5lbGVtcy5zaWdudXBQYXJ0Rm9ybS5jbGFzc0xpc3QuYWRkKCdmaXJzdC10YWItYWN0aXZlJyk7XG4gICAgICAgIHRoaXMuZWxlbXMuc2lnbnVwUGFydEZvcm0uY2xhc3NMaXN0LnJlbW92ZSgnbGFzdC10YWItYWN0aXZlJyk7XG4gICAgfSk7XG4gICAgdGhpcy5lbGVtcy5zaWdudXBUYWIyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICB0aGlzLmVsZW1zLnNpZ251cFRhYjIuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgIHRoaXMuZWxlbXMuc2lnbnVwVGFiMS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgICAgdGhpcy5lbGVtcy5zaWdudXBQYXJ0Rm9ybS5jbGFzc0xpc3QuYWRkKCdsYXN0LXRhYi1hY3RpdmUnKTtcbiAgICAgICAgdGhpcy5lbGVtcy5zaWdudXBQYXJ0Rm9ybS5jbGFzc0xpc3QucmVtb3ZlKCdmaXJzdC10YWItYWN0aXZlJyk7XG4gICAgfSk7XG59O1xuXG5TdGFydFBhZ2UucHJvdG90eXBlLnNldERlZmF1bHRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWxlbXMuc2lnbnVwUGFydC5jbGFzc0xpc3QuYWRkKGhpZGVDbGFzcyk7XG4gICAgdGhpcy5lbGVtcy5leGVjUGFydC5jbGFzc0xpc3QuYWRkKGhpZGVDbGFzcyk7XG4gICAgdGhpcy5lbGVtcy5sb2dpbkJ0bi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICB0aGlzLmVsZW1zLmNsaWVudEJ0bi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICB0aGlzLmVsZW1zLnNpZ251cFRhYjEuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgdGhpcy5lbGVtcy5zaWdudXBQYXJ0Rm9ybS5jbGFzc0xpc3QuYWRkKCdmaXJzdC10YWItYWN0aXZlJyk7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFN0YXJ0UGFnZSgpO1xufSx7XCIuL2Zvcm1zXCI6N31dLDEwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IFRlc3QgPSB7XG4gICAgaHRtbDogYFxuICAgICAgICA8ZGl2IGlkPVwidGVzdFwiPlxuICAgICAgICAgICAgPGgxPlRoaXMgaXMgVGVzdCBjb21wb25lbnQ8L2gxPlxuICAgICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGluc3RhbnRpYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgdGVtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0ZW1wLmlubmVySFRNTCA9IHRoaXMuaHRtbDtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRlbXAuZmlyc3RFbGVtZW50Q2hpbGRcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZWZlcmVuY2U6IGVsZW1lbnQsXG4gICAgICAgICAgICBhY3Rpb25zOiB7XG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbihET01UcmVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoRE9NVHJlZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUZXN0O1xufSx7fV0sMTE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuLypcbiAgICBzZXR0aW5nczoge1xuICAgICAgICBuYW1lLFxuICAgICAgICBodG1sLFxuICAgICAgICBlbGVtczogW10sXG4gICAgICAgIHdoZXJlVG9QdXQ6ICcnLFxuICAgICAgICBzdWJtaXRcbiAgICB9XG4qL1xuXG5jb25zdCBGb3JtID0gZnVuY3Rpb24oc2V0dGluZ3MpIHtcbiAgICB0aGlzLm5hbWUgPSBzZXR0aW5ncy5uYW1lO1xuICAgIHRoaXMuaHRtbCA9IHNldHRpbmdzLmh0bWw7XG4gICAgdGhpcy5lbGVtcyA9IHNldHRpbmdzLmVsZW1zO1xuICAgIHRoaXMuZnJhZ21lbnQgPSB0aGlzLmNyZWF0ZURPTSgpO1xuICAgIHRoaXMud2hlcmVUb1B1dCA9IHNldHRpbmdzLndoZXJlVG9QdXQgfHwgJ2Zvcm0nO1xuICAgIHRoaXMuc3VibWl0ID0ge1xuICAgICAgICBzZWxlY3Rvcjogc2V0dGluZ3Muc3VibWl0LnNlbGVjdG9yIHx8ICdpbnB1dFt0eXBlPVwic3VibWl0XCJdJyxcbiAgICAgICAgaGFuZGxlcjogc2V0dGluZ3Muc3VibWl0LmhhbmRsZXIgfHwgZnVuY3Rpb24oKXt9XG4gICAgfTtcblxuICAgIHRoaXMuaW5zZXJ0RWxlbXMoKTtcbiAgICB0aGlzLmluaXRpYWxpemVFdmVudHMoKTtcbn07XG5cbkZvcm0ucHJvdG90eXBlLmNyZWF0ZURPTSA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIGNvbnN0IHRtcEVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0bXBFbGVtLmlubmVySFRNTCA9IHRoaXMuaHRtbDtcblxuICAgIGNvbnN0IGVsZW1zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodG1wRWxlbS5jaGlsZHJlbik7XG4gICAgZWxlbXMuZm9yRWFjaChlbGVtID0+IGZyYWdtZW50LmFwcGVuZENoaWxkKGVsZW0pKTtcblxuICAgIHJldHVybiBmcmFnbWVudDtcbn07XG5cbkZvcm0ucHJvdG90eXBlLmluc2VydEVsZW1zID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgcGxhY2UgPSB0aGlzLmZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy53aGVyZVRvUHV0KTtcbiAgICBPYmplY3QudmFsdWVzKHRoaXMuZWxlbXMpLmZvckVhY2goZWxlbSA9PiBwbGFjZS5hcHBlbmRDaGlsZChlbGVtLmZyYWdtZW50KSk7XG59O1xuXG5Gb3JtLnByb3RvdHlwZS5pbml0aWFsaXplRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgdGhpcy5mcmFnbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc3VibWl0LnNlbGVjdG9yKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2dCA9PiB7XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnN1Ym1pdC5oYW5kbGVyKHRoaXMuZWxlbXMpO1xuICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtO1xufSx7fV0sMTI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuLypcbiAgICBzZXR0aW5ncyBvYmplY3QgaGFzIHRoZSBmb2xsb3dpbmcgc3RydWN0dXJlOlxuICAgIHNldHRpbmdzID0ge1xuICAgICAgICBodG1sLFxuICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgc2VsZWN0b3IsIHZhbHVlXG4gICAgICAgIH0sXG4gICAgICAgIHZhbGlkYXRvcnM6IFtcbiAgICAgICAgICAgIHt2YWxpZGF0b3IsIG1lc3NhZ2V9IC4uLlxuICAgICAgICBdLFxuICAgICAgICBlcnJvcnMgPSB7XG4gICAgICAgICAgICBlbGVtQ2xhc3MsIGhpZGluZ0NsYXNzXG4gICAgICAgIH1cbiAgICB9XG4qL1xuXG5jb25zdCBGb3JtRWxlbSA9IGZ1bmN0aW9uKHNldHRpbmdzKSB7XG4gICAgdGhpcy52YWx1ZSA9IHNldHRpbmdzLmlucHV0LnZhbHVlIHx8IG51bGw7XG4gICAgdGhpcy5mcmFnbWVudCA9IHRoaXMuY3JlYXRlRE9NKHNldHRpbmdzLmh0bWwpO1xuICAgIHRoaXMuZWxlbSA9IHRoaXMuZnJhZ21lbnQucXVlcnlTZWxlY3RvcihzZXR0aW5ncy5pbnB1dC5zZWxlY3RvcikgfHwgbnVsbDtcbiAgICB0aGlzLnZhbGlkYXRvcnMgPSBzZXR0aW5ncy52YWxpZGF0b3JzIHx8IFtdO1xuICAgIHRoaXMuZXJyb3JzID0ge1xuICAgICAgICBlbGVtOiB0aGlzLmZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgc2V0dGluZ3MuZXJyb3JzLmVsZW1DbGFzcykgfHwgbnVsbCxcbiAgICAgICAgaGlkaW5nQ2xhc3M6IHNldHRpbmdzLmVycm9ycy5oaWRpbmdDbGFzcyB8fCAnLm5vbmUnLFxuICAgICAgICBtZXNzYWdlczogW11cbiAgICB9O1xuXG4gICAgdGhpcy5pbml0aWFsaXplRXZlbnRzKCk7XG59O1xuXG5Gb3JtRWxlbS5wcm90b3R5cGUuY3JlYXRlRE9NID0gZnVuY3Rpb24oaHRtbCkge1xuICAgIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIGNvbnN0IHRtcEVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0bXBFbGVtLmlubmVySFRNTCA9IGh0bWw7XG5cbiAgICBjb25zdCBlbGVtcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRtcEVsZW0uY2hpbGRyZW4pO1xuICAgIGVsZW1zLmZvckVhY2goZWxlbSA9PiBmcmFnbWVudC5hcHBlbmRDaGlsZChlbGVtKSlcblxuICAgIHJldHVybiBmcmFnbWVudDtcbn07XG5cbkZvcm1FbGVtLnByb3RvdHlwZS5pbml0aWFsaXplRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGV2dCA9PiB7XG4gICAgICAgIHRoaXMuZXJyb3JzLm1lc3NhZ2VzID0gW107XG4gICAgICAgIFxuICAgICAgICB0aGlzLnZhbGlkYXRvcnMuZm9yRWFjaCh2YWxpZGF0b3IgPT4ge1xuICAgICAgICAgICAgaWYgKCF2YWxpZGF0b3IuaGFuZGxlcih0aGlzLmVsZW0udmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMubWVzc2FnZXMucHVzaCh2YWxpZGF0b3IubWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLmVycm9ycy5tZXNzYWdlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlRXJyb3JzKCk7XG4gICAgICAgICAgICB0aGlzLmVycm9ycy5lbGVtLmlubmVySFRNTCA9ICcnO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyAoZXZ0LnRhcmdldC52YWx1ZSlcbiAgICAgICAgdGhpcy52YWx1ZSA9IGV2dC50YXJnZXQudmFsdWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMubGlzdEVycm9ycygpO1xuICAgICAgICB0aGlzLnNob3dFcnJvcnMoKTtcbiAgICB9KTtcbn07XG5cbkZvcm1FbGVtLnByb3RvdHlwZS5zaG93RXJyb3JzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuZXJyb3JzLmVsZW0uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuZXJyb3JzLmhpZGluZ0NsYXNzKSkge1xuICAgICAgICB0aGlzLmVycm9ycy5lbGVtLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5lcnJvcnMuaGlkaW5nQ2xhc3MpO1xuICAgIH1cbn07XG5cbkZvcm1FbGVtLnByb3RvdHlwZS5oaWRlRXJyb3JzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLmVycm9ycy5lbGVtLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLmVycm9ycy5oaWRpbmdDbGFzcykpIHtcbiAgICAgICAgdGhpcy5lcnJvcnMuZWxlbS5jbGFzc0xpc3QuYWRkKHRoaXMuZXJyb3JzLmhpZGluZ0NsYXNzKTtcbiAgICB9XG59O1xuXG5Gb3JtRWxlbS5wcm90b3R5cGUubGlzdEVycm9ycyA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIHRoaXMuZXJyb3JzLm1lc3NhZ2VzLmZvckVhY2goZXJyb3IgPT4ge1xuICAgICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgIGxpLnRleHRDb250ZW50ID0gZXJyb3I7XG4gICAgICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGxpKTtcbiAgICB9KTtcbiAgICB0aGlzLmVycm9ycy5lbGVtLmlubmVySFRNTCA9ICcnO1xuICAgIHRoaXMuZXJyb3JzLmVsZW0uYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtRWxlbTtcbn0se31dLDEzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMvRm9ybScpO1xuY29uc3QgRm9ybUVsZW0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMvRm9ybUVsZW0nKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgRm9ybSxcbiAgICBGb3JtRWxlbVxufTtcbn0se1wiY3NwLWFwcC9saWJzL2Zvcm1zL0Zvcm1cIjoxMSxcImNzcC1hcHAvbGlicy9mb3Jtcy9Gb3JtRWxlbVwiOjEyfV0sMTQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgbWluTGVuZ3RoID0gZnVuY3Rpb24obWluKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cikge1xuICAgICAgICByZXR1cm4gc3RyLnRvU3RyaW5nKCkubGVuZ3RoID49IG1pbjtcbiAgICB9O1xufTtcblxuY29uc3QgbWF4TGVuZ3RoID0gZnVuY3Rpb24obWF4KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cikge1xuICAgICAgICByZXR1cm4gc3RyLnRvU3RyaW5nKCkubGVuZ3RoIDw9IG1heDtcbiAgICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbWluTGVuZ3RoLFxuICAgIG1heExlbmd0aFxufTtcbn0se31dLDE1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGFwcCA9IHJlcXVpcmUoJ2NzcC1hcHAvc3RhdGUuanMnKTtcbmNvbnN0IE1haW5Db250cm9sbGVyID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Jvb3QvTWFpbkNvbnRyb2xsZXIuanMnKTtcblxuY29uc3QgUm91dGVyID0ge1xuICAgIHBhdGhzOiB7fSxcbiAgICBzZXRQYXRoczogZnVuY3Rpb24ocGF0aHMpIHt0aGlzLnBhdGhzID0gcGF0aHM7fSxcbiAgICBwYXRoRXhpc3RzOiBmdW5jdGlvbihwYXJ0cykge1xuICAgICAgICBsZXQgcGF0aHMgPSB0aGlzLnBhdGhzO1xuICAgICAgICBmb3IgKGxldCBpID0gMCwgcGFydDsgaSA8IHBhcnRzLmxlbmd0aCwgcGFydCA9IHBhcnRzW2ldOyBpKyspIHtcbiAgICAgICAgICAgIGlmICghcGF0aHMgfHwgIXRoaXMucGF0aHNbcGFydF0pIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9IHBhdGhzW3BhcnRdLnBhcmFtZXRlcnM7XG4gICAgICAgICAgICBpZiAocGFyYW1zICYmIHBhcmFtcy5sZW5ndGggPiAwICYmIGkgIT09IHBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGgtaSA8IHBhcmFtcy5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICBpID0gaSArIHBhcmFtcy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRocyA9IHBhdGhzW3BhcnRdLmNoaWxkcmVuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgbWFrZUNvbXBvbmVudHNPYmplY3RzOiBmdW5jdGlvbihwYXJ0cykge1xuICAgICAgICBsZXQgY29tcG9uZW50c09iamVjdHMgPSBbXTtcbiAgICAgICAgbGV0IHBhdGhzID0gdGhpcy5wYXRocztcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIHBhcnQ7IGkgPCBwYXJ0cy5sZW5ndGgsIHBhcnQgPSBwYXJ0c1tpXTsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBwYXRoUGFyYW1zID0gcGF0aHNbcGFydF0ucGFyYW1ldGVycztcbiAgICAgICAgICAgIGxldCBwYXJhbXM7XG4gICAgICAgICAgICBpZiAocGF0aFBhcmFtcyAmJiBwYXRoUGFyYW1zLmxlbmd0aCA+IDAgJiYgaSAhPT0gcGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zID0gcGFydHMuc2xpY2UoaSsxLCBpKzErcGF0aFBhcmFtcy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGkgPSBpICsgcGFyYW1zLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBvbmVudHNPYmplY3RzLnB1c2goe1xuICAgICAgICAgICAgICAgIHBhdGg6IHBhcnQsXG4gICAgICAgICAgICAgICAgY29tcG9uZW50OiBwYXRoc1twYXJ0XS5jb21wb25lbnQsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXMgfHwgbnVsbFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHBhdGhzID0gcGF0aHNbcGFydF0uY2hpbGRyZW47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudHNPYmplY3RzO1xuICAgIH0sXG4gICAgbmF2aWdhdGU6IGZ1bmN0aW9uKGxpbmspIHtcbiAgICAgICAgbGV0IHBhcnRzID0gWycvJ107XG5cbiAgICAgICAgaWYgKGxpbmsgIT09ICcvJykge1xuICAgICAgICAgICAgbGluayA9IGxpbmtbMF0gICAgICAgICAgICAgICA9PT0gJy8nID8gbGluay5zdWJzdHJpbmcoMSkgICAgICAgICAgICAgIDogbGluaztcbiAgICAgICAgICAgIGxpbmsgPSBsaW5rW2xpbmsubGVuZ3RoIC0gMV0gPT09ICcvJyA/IGxpbmsuc3Vic3RyaW5nKDAsIGxpbmsubGVuZ3RoKSA6IGxpbms7XG4gICAgICAgICAgICBwYXJ0cyA9IHBhcnRzLmNvbmNhdChsaW5rLnNwbGl0KCcvJykpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoIXRoaXMucGF0aEV4aXN0cyhwYXJ0cykpIHtcbiAgICAgICAgICAgIC8vIGRpc3BsYXkgZXJyb3JcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUaGUgY3VycmVudCBwYXRoIGRvZXMgbm90IGV4aXN0JylcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudHNPYmplY3RzID0gdGhpcy5tYWtlQ29tcG9uZW50c09iamVjdHMocGFydHMpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBNYWluQ29udHJvbGxlci5yZW5kZXIoY29tcG9uZW50c09iamVjdHMpO1xuICAgICAgICAgICAgLy8gYWRkIHN0YXRlXG4gICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgJycsIGxpbmspO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ05hdmlnYXRlZCB0byAnICsgbGluaylcbiAgICAgICAgfVxuICAgICAgICBjYXRjaChlKSB7XG5cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUm91dGVyO1xufSx7XCJjc3AtYXBwL2NvbXBvbmVudHMvcm9vdC9NYWluQ29udHJvbGxlci5qc1wiOjMsXCJjc3AtYXBwL3N0YXRlLmpzXCI6MTZ9XSwxNjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBhcHAgPSB7XG4gICAgY29tcG9uZW50czoge30sXG4gICAgcGF0aDogW11cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXBwO1xufSx7fV19LHt9LFsxXSk7XG4iXSwiZmlsZSI6InNvdXJjZS5qcyJ9
