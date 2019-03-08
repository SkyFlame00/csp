const MainController = self = {
  root: null,
  path: [],
  renderChain: function(components) {
    return components.reduce((accumulator, component) => {
      return Promise.all([accumulator, component])
        .then(components => {
          const accumulator = components[0];
          const component = components[1];

          accumulator.render(component.element);

          return component;
        });
    }, self.root);
  },
  initialize: function(rootInstance) {
    self.root = rootInstance;
    document.body.innerHTML = '';
    document.body.appendChild(rootInstance.reference);
  },
  render: function(components) {
    return self.renderChain(components);
  }
};

module.exports = MainController;