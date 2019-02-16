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