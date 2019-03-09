const app = self = {
  root: null,
  path: [],
  renderChain: function(components) {
    // Promise is returned
    return components.reduce((accumulator, component) => {
      // Accumulator may not only be a Promise but it can
      // also be a plain js object (as is with self.root)
      return Promise.resolve(accumulator)
        // Before we make sure the previous component (it is now accumulator)
        // has resolved, we do not create the component that follows
        .then(accumulator => Promise.all([accumulator, new component()]))
        .then(([accumulator, component]) => {
          if (!component.success)
            return Promise.reject({component: component.error, accumulator: accumulator});

          accumulator.render(component.controller.element);
          return component;
        })
      ;
    }, self.root)
    .catch(err => console.log(err));
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

module.exports = app;