const Modal = require('csp-app/components/modals');
const {mainTemplate, participantTemplate} = require('./templates');
const SPModal = require('../select-participants-modal');
const http = require('csp-app/libs/http');
const ECModal = require('../event-created-modal');

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
  this.data = {
    title: null,
    description: null,
    date: null,
    participants: [],
    files: [],
    time: { from: null, to: null },
    project: null,
    link: null,
    importance: null
  };
  CEModalInstance.elements.body.appendChild(tplController.root);
  this.bindSPModal();
  this.bindParticipantsEvents();
  this.bindDateAndTimeEvents();
  this.bindSimpleControls();
  this.bindOKButton();
  
  return CEModalInstance;
}

CEModal.prototype.bindSPModal = function() {
  let SPModalInstance = null;
  const openModalBtn = this.tplController.participants.btn;
  
  openModalBtn.addEventListener('click', () => {
    SPModalInstance = SPModal.create({
      participants: this.data.participants,
      date: this.data.date,
      timeFrom: this.data.time.from,
      timeTo: this.data.time.to
    });

    SPModalInstance.elements.root.addEventListener('close', evt => {
      SPModalInstance = null;
    });

    SPModalInstance.elements.root.addEventListener('participantsSelected', evt => {
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
    const {participants} = this.data;
    const pPill = evt.target.closest('.participant');
    const userId = +pPill.dataset.id;
    const pIdx = participants.find(p => p['user_id'] == userId);
    pPill.remove();
    participants.splice(pIdx, 1);

    const postBody = {
      participantsIds: participants.map(p => ({'user_id': p['user_id']})),
      date: this.data.date,
      timeFrom: this.data.time.from,
      timeTo: this.data.time.to
    };

    http.post('scheduler/getParticipantsAvailability', postBody)
      .then(pAvailability => {
        pAvailability.forEach(pa => {
          const pFound = participants.find(p => p['user_id'] == pa['user_id']);
          pFound.busy = pa.busy;
        });
        this.renderParticipants();
        this.checkParticipantsBusyness();
      })
    ;
  });
};

CEModal.prototype.renderParticipants = function() {
  const {participants} = this.data;
  this.tplController.participants.place.innerHTML = '';
  participants.forEach(p => {
    const pTplController = participantTemplate(p);
    this.tplController.participants.place.appendChild(pTplController.root);
    if (p.busy) pTplController.root.classList.add('busy');
  });
};

CEModal.prototype.checkParticipantsBusyness = function() {
  const {participants} = this.data;
  const busyList = participants.filter(p => p.busy);

  if (busyList.length > 0) {
    const busyStr = busyList.join(', ');
    this.tplController.participants.alert.place.innerHTML = busyStr;
    this.tplController.participants.alert.root.classList.remove('no-display');
    this.modal.elements.submit.setAttribute('disabled', 'disabled');
  }
  else {
    this.tplController.participants.alert.root.classList.add('no-display');
    this.tplController.participants.alert.place.innerHTML = '';
    this.modal.elements.submit.removeAttribute('disabled');
  }
};

CEModal.prototype.processDateAndTime = function(options) {
  const {dateRaw, timeFromRaw, timeToRaw} = options;

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

CEModal.prototype.bindDateAndTimeEvents = function() {
  const dateControl = this.tplController.date;
  const timeFromControl = this.tplController.time.from;
  const timeToControl = this.tplController.time.to;

  [dateControl, timeFromControl, timeToControl].forEach(control => {
    control.addEventListener('change', () => {
      const dateRaw = this.tplController.date.value;
      const timeFromRaw = this.tplController.time.from.value;
      const timeToRaw = this.tplController.time.to.value;
      
      if (!dateRaw || !timeFromRaw || !timeToRaw) {
        this.data.date = null;
        this.data.time.from = null;
        this.data.time.to = null;
        return;
      }
      
      const {participants} = this.data;
      const {date, timeFrom, timeTo} = this.processDateAndTime({ dateRaw, timeFromRaw, timeToRaw });
      
      this.data.date = date;
      this.data.time.from = timeFrom;
      this.data.time.to = timeTo;
      
      if (participants.length == 0) return;

      const participantsIds = participants.map(p => ({ 'user_id': p['user_id'] }));
      const postBody = {
        participantsIds,
        date,
        timeFrom,
        timeTo
      };
  
      http.post('scheduler/getParticipantsAvailability', postBody)
        .then(pAvailability => {
          pAvailability.forEach(pa => {
            const pFound = participants.find(p => p['user_id'] == pa['user_id']);
            pFound.busy = pa.busy;
          });
          this.renderParticipants();
          this.checkParticipantsBusyness();
        })
      ;
    });
  });
};

CEModal.prototype.bindSimpleControls = function() {
  let controls = {
    title: this.tplController.title,
    description: this.tplController.desc,
    link: this.tplController.link,
    type: this.tplController.type,
    project: this.tplController.project
  };
  
  Object.keys(controls).forEach(cName => {
    controls[cName].addEventListener('change', () => {
      this.data[cName] = controls[cName].value;
    });
  });

  const importanceOptions = [
    this.tplController.importance.none,
    this.tplController.importance.important,
    this.tplController.importance.desirable
  ];

  importanceOptions.forEach(option => {
    option.addEventListener('change', () => {
      this.data.importance = option.value;
    });
  });
};

CEModal.prototype.bindOKButton = function() {
  this.modal.elements.submit.addEventListener('click', () => {
    const postBody = {
      title: this.data.title,
      description: this.data.description,
      link: this.data.link,
      type: this.data.type,
      project: this.data.project,
      importance: this.data.importance,
      participantsIds: this.getParticipantsIds(),
      date: JSON.stringify(this.data.date.toString()),
      timeFrom: JSON.stringify(this.data.time.from.toString()),
      timeTo: JSON.stringify(this.data.time.to.toString())
    };
  
    http.post('scheduler/create-event', postBody)
      .then(answer => {
        if (!answer.success) {
          console.log('no success');
          return;
        };
  
        const userParticipates = this.data.participants.some(p => p.you);

        if (userParticipates) {
          this.data.id = +answer.data.eventId;
          this.data['participants_num'] = this.data.participants.length;
          const eventCreated = new CustomEvent('eventCreated', { detail: this.data });
          this.modal.elements.root.dispatchEvent(eventCreated);
        }

        this.modal.close();
        ECModal.create().open();
      })
    ;
  });
};

CEModal.prototype.getParticipantsIds = function() {
  return this.data.participants.map(p => ({'user_id': p['user_id']}));
};

module.exports = {
  create: () => new CEModal()
};