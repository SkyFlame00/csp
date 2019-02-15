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