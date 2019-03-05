const MainController = {
  root: null,
  path: [],
  renderChain: function(components) {
    return components.reduce((accumulator, component) => {
      return Promise.all([accumulator, component])
        .then(components => {
          const accumulator = components[0];
          const component = components[1];

          console.log(components)
          accumulator.render(component.element);

          return component;
        });
    }, this.root);
  },
  initialize: function(rootInstance) {
    this.root = rootInstance;
    document.body.innerHTML = '';
    document.body.appendChild(rootInstance.reference);
  },
  render: function(components) {
    return this.renderChain(components);
  }
};

module.exports = MainController;