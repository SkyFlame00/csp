const Modal = require('csp-app/components/modals');
const {mainTemplate, participantTemplate} = require('./templates');
const SPModal = require('../select-participants-modal');
const http = require('csp-app/libs/http');

function CEModal() {
  const CEModalInstance = Modal.create({
    type: 'standard',
    title: 'Create event',
    width: 400,
    defaultActions: true,
    destroyOnClose: true
  });

  const tplController = mainTemplate();
  this.modal = CEModalInstance;
  this.tplController = tplController;
  this.data = { participants: [], files: [] };
  CEModalInstance.elements.body.appendChild(tplController.root);
  this.bindSPModal();
  this.bindParticipantsEvents();
  
  return CEModalInstance;
}

// SP stands for select participants
CEModal.prototype.bindSPModal = function() {
  let SPModalInstance = null;
  const openModalBtn = this.tplController.participants.btn;
  
  openModalBtn.addEventListener('click', () => {
    const dateRaw = this.tplController.date.value;
    const timeFromRaw = this.tplController.time.from.value;
    const timeToRaw = this.tplController.time.to.value;
    const dateAndTime = this.processDateAndTime({
      date: dateRaw,
      timeFrom: timeFromRaw,
      timeTo: timeToRaw
    });

    SPModalInstance = SPModal.create({
      participants: this.data.participants,
      ...dateAndTime
    });

    SPModalInstance.elements.root.addEventListener('close', evt => {
      SPModalInstance = null;
      // this.data.participants = evt.detail.participants;
      // this.renderParticipants();
    });

    SPModalInstance.elements.root.addEventListener('submitEvent', evt => {
      SPModalInstance = null;
      this.data.participants = evt.detail.participants;
      this.renderParticipants();
    });

    SPModalInstance.open();
  });
};

CEModal.prototype.bindParticipantsEvents = function() {
  this.tplController.participants.place.addEventListener('click', evt => {
    const closeBtn = evt.target.closest('.btn-close');
    if (!closeBtn) return;
    const pPill = evt.target.closest('.participant');
    const userId = +pPill.dataset.id;
    const pIdx = this.data.participants(p => p['user_id'] == userId);
    pPill.remove();
    this.data.participants.splice(pIdx, 1);

    http.post
  });
};

CEModal.prototype.renderParticipants = function() {
  const {participants} = this.data;
  this.tplController.participants.place.innerHTML = '';
  participants.forEach(p => {
    const pTplController = participantTemplate(p);
    this.tplController.participants.place.appendChild(pTplController.root);
  });
};

CEModal.prototype.checkParticipantsBusyness = function() {

};

CEModal.prototype.processDateAndTime = function(options) {
  const dateRaw = options.date;
  const timeFromRaw = options.timeFrom;
  const timeToRaw = options.timeTo;

  const [day, month, year] = dateRaw.split('/').map(n => +n);
  const [timeFromHH, timeFromMM] = timeFromRaw.split(':').map(n => +n);
  const [timeToHH, timeToMM] = timeToRaw.split(':').map(n => +n);

  const date = new Date(year, month-1, day);
  const timeFrom = new Date(year, month-1, day, timeFromHH, timeFromMM);
  const timeTo = new Date(year, month-1, day, timeToHH, timeToMM);

  return {
    date,
    timeFrom,
    timeTo
  };
};

module.exports = {
  create: () => new CEModal()
};