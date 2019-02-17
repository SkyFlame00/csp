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
    className: 'forms',
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