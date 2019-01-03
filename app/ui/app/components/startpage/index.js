const { LoginForm, SignupClientForm, SignupExecForm } = require('./forms');

const hideClass = 'display-none';

const StartPage = function() {
    this.html = `
        <div class="wrapper">
            <div class="startpage">
                <div class="logo-block">
                    <h1>Welcome to Consulting Services Platform</h1>
                </div>

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