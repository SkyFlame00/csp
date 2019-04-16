const template = require('./index.tpl');
const Modal = require('csp-app/components/modals');
const CEModal = require('../create-event-modal');

function fillWithEvents(tplController) {
  const {closeBtn, openCEModalBtn} = tplController;

  closeBtn.addEventListener('click', () => {
    this.close();
  });

  let CEModalInstance = null;

  openCEModalBtn.addEventListener('click', () => {
    if (!CEModalInstance) {
      CEModalInstance = CEModal.create();
      CEModalInstance.elements.root.addEventListener('close', evt => {
        CEModalInstance = null;
      });
    }

    CEModalInstance.open();
  });
}

function create() {
  const tplController = template();
  this._instanceController = tplController;
  fillWithEvents.call(this, tplController);
  document.body.appendChild(tplController.root);
  this._isInit = false;
  return this;
}

function open() {
  const el = this._instanceController.root;
  if (!el.classList.contains('display-yes')) {
    el.classList.add('display-yes');
  }
  if (!this._isInit) {
    this._instanceController.scheduler.generateHoursMarks();
    this._instanceController.scheduler.generateStrips();
    this._isInit = true;
  }
  return this;
}

function close() {
  const el = this._instanceController.root;
  if (el.classList.contains('display-yes')) {
    el.classList.remove('display-yes');
  }
  return this;
}

function destroy() {

}

module.exports = {
  create,
  open,
  close,
  destroy
};