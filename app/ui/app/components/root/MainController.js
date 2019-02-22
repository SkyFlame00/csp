const app = require('csp-app/state.js');

const MainController = {
  root: null,
  path: [],
  renderChain: function(components) {
    components.reduce((accumulator, component) => {
      accumulator.render(component.element);
      return component;
    }, this.root);
  },
  initialize: function(rootInstance) {
    this.root = rootInstance;
    document.body.innerHTML = '';
    document.body.appendChild(rootInstance.reference);
  }
};

module.exports = MainController;