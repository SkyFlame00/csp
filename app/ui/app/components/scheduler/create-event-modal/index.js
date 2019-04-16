const Modal = require('csp-app/components/modals');
const template = require('./form.tpl');
const SPModal = require('../select-participants-modal');

// // SP stands for select participants
// function bindSPModal(openModalBtn) {
//   let SPModalInstance = null;
  
//   openModalBtn.addEventListener('click', () => {
//     SPModalInstance = SPModal.create(this.participants);
//     SPModalInstance.elements.root.addEventListener('close', evt => {
//       SPModalInstance = null;

//       const participants = evt.detail.participants;
//     });

//     SPModalInstance.open();
//   });
// }

// function renderParticipants() {
  
// }

// const CEModal = {
//   create() {
//     const CEModalInstance = Modal.create({
//       type: 'standard',
//       title: 'Create event',
//       width: 400,
//       defaultActions: true,
//       destroyOnClose: true
//     });

//     const tplController = template();
//     CEModalInstance.elements.body.appendChild(tplController.root);

//     this.participants = [];
//     this.bindSPModal(tplController.participants.btn);

    

//     return CEModalInstance;
//   }
// };



function CEModal() {
  const CEModalInstance = Modal.create({
    type: 'standard',
    title: 'Create event',
    width: 400,
    defaultActions: true,
    destroyOnClose: true
  });

  const tplController = template();
  this.modal = CEModalInstance;
  this.tplController = tplController;
  this.data = { participants: [], files: [] };
  CEModalInstance.elements.body.appendChild(tplController.root);
  this.bindSPModal();

  
  return CEModalInstance;
}

CEModal.prototype.bindSPModal = function() {
  let SPModalInstance = null;
  const openModalBtn = this.tplController.participants.btn;
  
  openModalBtn.addEventListener('click', () => {
    SPModalInstance = SPModal.create({
      participants: this.data.participants,
      date: this.tplController.date,
      timeFrom: this.tplController.time.from,
      timeTo: this.tplController.time.to
    });
    SPModalInstance.elements.root.addEventListener('close', evt => {
      SPModalInstance = null;
      this.data.participants = evt.detail.participants;
      this.renderParticipants();
    });

    SPModalInstance.open();
  });
};

CEModal.prototype.renderParticipants = function() {

};

module.exports = {
  create: () => new CEModal()
};