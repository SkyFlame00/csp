const template = require('./index.tpl');
const ISModal = require('../individual-scheduler');

const SchedulerComponent = function() {
  const tplController = template();
  let ISModalInstance = null;

  tplController.btnOpenIndSch.addEventListener('click', () => {
    if (!ISModalInstance) {
      ISModalInstance = ISModal.create({ destroyOnClose: true });
      ISModalInstance.root.addEventListener('close', () => {
        ISModalInstance = null;
      });
    }
    
    ISModalInstance.open();
  });

  return {
    success: true,
    controller: {
      element: tplController.root
    }
  };
};

module.exports = SchedulerComponent;