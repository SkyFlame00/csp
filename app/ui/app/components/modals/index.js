const modalStandard = require('./modal-standard');

function Modal() {
  
}

Modal.prototype.create = function(options) {
  let modalClass;
  switch (options.type) {
    case 'standard':
      modalClass = modalStandard;
      break;
    default:
      modalClass = modalStandard;
      break;
  }
  return new modalClass(options);
};

module.exports = new Modal();