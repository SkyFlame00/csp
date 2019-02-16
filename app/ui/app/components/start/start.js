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