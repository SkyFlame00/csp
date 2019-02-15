const Form = require('csp-app/libs/forms');

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

const username = {
  keyName: 'username',
  tag: 'input',
  id: 'loginform-username',
  label: '',
  attributes: [
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

module.exports = {
  loginForm: loginForm
};