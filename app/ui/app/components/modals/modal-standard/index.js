const template = require('./tpl');
const {cancel, submit} = require('./actions'); 
const {sortNumbers} = require('csp-app/libs/utilities');
const ModalsController = require('../modals-controller');

/**
 * 
 * @param {Object} options 
 * @param {String} options.title - the title of the modal
 * @param {Number} options.width - the width of the modal
 * @param {Number} options.height - the height of the modal
 * @param {Boolean} options.defaultActions - indicates if actions at the bottom of the modal are default. If false, then needed params are specified in 'actions'
 * @param {Array.<{id: String, title: String, type: String, order: Number}>} options.actions - if non-default actions
 */

function Modal(options) {
  const tplController = template();

  tplController.root.classList.add('no-display');
  tplController.title.textContent = options.title || '';
  tplController.body.style.width = (options.width || '300') + 'px';
  tplController.body.style.height = options.height ? options.height + 'px' : 'auto';

  tplController.closeBtn.addEventListener('click', () => {
    this.close();
  });

  let actionsParams =
    options.defaultActions ?
    [cancel, submit] :
    options.actions;

  const actions = actionsParams.sort(sortNumbers)
    .map(item => {
      const action = document.createElement('button');
      action.textContent = item.title;
      action.classList.add('btn-' + item.type);
      return { id: item.id, element: action };
    });
  
  let actionsObj = {};

  actions.forEach(action => {
    tplController.footer.appendChild(action.element);
    actionsObj[action.id] = action.element;
  });

  if (actionsObj['cancel']) {
    actionsObj['cancel'].addEventListener('click', () => {
      this.close();
    });
  }

  this.elements = {
    ...tplController,
    ...actionsObj
  };
  this.destroyOnClose = options.destroyOnClose;

  ModalsController.add(this);
}

Modal.prototype.open = function() {
  ModalsController.open(this);
};

Modal.prototype.close = function() {
  const closeEvent = new CustomEvent('close');
  this.elements.root.dispatchEvent(closeEvent);
  
  ModalsController.closeLast();

  if (this.destroyOnClose) {
    this.destroy();
  }
};

Modal.prototype.destroy = function() {
  this.elements.root.remove();
};

module.exports = Modal;