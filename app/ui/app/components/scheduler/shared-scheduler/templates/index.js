const modalTemplate = require('../../main/modal.tpl');
const baseTemplate = require('./base');
const resultsButtonTemplate = require('./results-button');
const commonFITemplate = require('./common-free-interval');

function schedulerTemplate() {
  const modalTplController = modalTemplate();
  const baseTplController = baseTemplate();

  modalTplController.sidebar.appendChild(baseTplController.sidebar.root);
  modalTplController.content.appendChild(baseTplController.main.root);
  
  return {
    root: modalTplController.root,
    closeBtn: modalTplController.closeBtn,
    ...baseTplController
  };
}

module.exports = {
  schedulerTemplate,
  resultsButtonTemplate,
  commonFITemplate
};