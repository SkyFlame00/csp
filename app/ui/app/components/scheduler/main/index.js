const template = require('./index.tpl');
const ISModal = require('../individual-scheduler');
const SSModal = require('../shared-scheduler');

const SchedulerComponent = function() {
  const tplController = template();
  let ISModalInstance = null;
  let SSModalInstance = null;

  tplController.btnOpenIndSch.addEventListener('click', () => {
    if (!ISModalInstance) {
      ISModalInstance = ISModal.create({ destroyOnClose: true });
      ISModalInstance.root.addEventListener('close', () => {
        ISModalInstance = null;
      });
    }
    
    ISModalInstance.open();
  });

  tplController.btnOpenShSch.addEventListener('click', () => {
    if (!SSModalInstance) {
      SSModalInstance = SSModal.create({ destroyOnClose: true });
      SSModalInstance.elements.root.addEventListener('close', () => {
        SSModalInstance = null;
      });
    }
    
    SSModalInstance.open();
  });

  return {
    success: true,
    controller: {
      element: tplController.root
    }
  };
};

module.exports = SchedulerComponent;