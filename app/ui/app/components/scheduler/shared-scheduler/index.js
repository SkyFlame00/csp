const {schedulerTemplate, resultsButtonTemplate, commonFITemplate} = require('./templates');
const SPModal = require('../select-participants-modal');
const {participantPillTemplate} = require('../main/templates');
const http = require('csp-app/libs/http');
const {
  calcSizes,
  calcOffset,
  calcWidth,
  getEventElement
} = require('../main/functions');
const {
  timelineTitleTemplate,
  timelineTemplate,
  tooltipTemplate
} = require('../main/templates');
const EDModal = require('../event-details-modal');
const {getCoords, getMonthName} = require('csp-app/libs/utilities');

function SSModal(options) {
  const tplController = schedulerTemplate();
  this._tplController = tplController;
  this._isInit = false;
  this._destroyOnClose = options && options.destroyOnClose;
  this.bindSimpleEvents();
  this.bindSPModal();
  this.bindParticipantsEvents();
  this.bindSearchBtn();
  this.bindResults();
  this.bindTooltips();
  document.body.appendChild(tplController.root);
  this.data = {
    participants: [],
    days: { from: null, to: null },
    time: {
      type: null,
      from: null,
      to: null,
      duration: null,
      isTimeChecked: false
    }
  };
  this.results = [];
  this._tooltip = null;

  return {
    open: this.open.bind(this),
    close: this.close.bind(this),
    destroy: this.destroy.bind(this),
    elements: tplController
  };
}

SSModal.prototype.calcSizes = calcSizes('_tplController');
SSModal.prototype.calcOffset = calcOffset;
SSModal.prototype.calcWidth= calcWidth;
SSModal.prototype.getEventElement = getEventElement;

SSModal.prototype.bindSimpleEvents = function() {
  const tplController = this._tplController;
  const {closeBtn} = tplController;

  closeBtn.addEventListener('click', () => {
    this.close();
  });

  // let CEModalInstance = null;

  // openCEModalBtn.addEventListener('click', () => {
  //   if (!CEModalInstance) {
  //     CEModalInstance = CEModal.create();
  //     CEModalInstance.elements.root.addEventListener('close', evt => {
  //       CEModalInstance = null;
  //     });
  //     CEModalInstance.elements.root.addEventListener('eventCreated', evt => {
  //       CEModalInstance = null;
  //       this.addNewEvent(evt.detail);
  //     });
  //   }

  //   CEModalInstance.open();
  // });

  const timeOptions = tplController.sidebar.time.options;
  const timeInputs = tplController.sidebar.time.inputs;
  const fixedOption = timeOptions.fixed;
  const floatingOption = timeOptions.floating;

  [fixedOption, floatingOption].forEach(option => {
    option.addEventListener('change', () => {
      const type = option.value;
      const oppositeType = Object.keys(timeOptions).find(opt=>opt!=type);
      this.data.time.type = type;
      timeInputs[type].root.classList.remove('no-display');
      timeInputs[oppositeType].root.classList.add('no-display');
    });
  });

  const daysFrom = tplController.sidebar.days.from;
  const daysTo = tplController.sidebar.days.to;
  const timeFrom = timeInputs.floating.from;
  const timeTo = timeInputs.floating.to;
  const timeDuration = timeInputs.fixed.value;
  const isTimeChecked = tplController.sidebar.time.isTimeChecked;
  const timeSpan = tplController.sidebar.time.timeSpan;

  daysFrom.addEventListener('input', () => {
    const [day, month, year] = daysFrom.value.split('/');
    const date = new Date(year, month - 1, day);
    this.data.days.from = date;
  });

  daysTo.addEventListener('input', () => {
    const [day, month, year] = daysTo.value.split('/');
    const date = new Date(year, month - 1, day);
    this.data.days.to = date;
  });

  timeFrom.addEventListener('input', () => {
    this.data.time.from = timeFrom.value;
  });

  timeTo.addEventListener('input', () => {
    this.data.time.to = timeTo.value;
  });

  timeDuration.addEventListener('input', () => {
    this.data.time.duration = timeDuration.value;
  });

  isTimeChecked.addEventListener('input', () => {
    const checked = isTimeChecked.checked;
    this.data.time.isTimeChecked = checked;
    if (checked) timeSpan.classList.remove('no-display');
    else timeSpan.classList.add('no-display');
  });
};

SSModal.prototype.renderParticipants = function() {
  const {participants} = this.data;
  const place = this._tplController.sidebar.participants.body;
  place.innerHTML = '';
  participants.forEach(p => {
    const pTplController = participantPillTemplate(p);
    place.appendChild(pTplController.root);
  });
};

SSModal.prototype.bindSPModal = function() {
  const openModalBtn = this._tplController.sidebar.participants.button;
  let SPModalInstance = null;
  
  openModalBtn.addEventListener('click', () => {
    SPModalInstance = SPModal.create({
      participants: this.data.participants
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

SSModal.prototype.bindParticipantsEvents = function() {
  this._tplController.sidebar.participants.body.addEventListener('click', evt => {
    const closeBtn = evt.target.closest('.btn-close');
    if (!closeBtn) return;
    const {participants} = this.data;
    const pPill = evt.target.closest('.participant');
    const userId = +pPill.dataset.id;
    const pIdx = participants.findIndex(p => p['user_id'] == userId);
    pPill.remove();
    participants.splice(pIdx, 1);
  });
};

SSModal.prototype.bindSearchBtn = function() {
  const controller = this._tplController;
  controller.sidebar.searchBtn.addEventListener('click', () => {
    console.log(this.data);
    const postBody = {
      participants: this.data.participants.map(p=>p['user_id']),
      days: {
        from: this.data.days.from,
        to: this.data.days.to
      },
      time: {
        type: this.data.time.type,
        from: this.data.time.from,
        to: this.data.time.to,
        duration: this.data.time.duration
      }
    };

    http.post('scheduler/getSharedSchedulerObjects', postBody)
      .then(res => {
        // console.log(res)
        this.results = res;
        this.processResults();
        console.log(this.results);

        controller.sidebar.results.body.innerHTML = '';

        for (let idx = 0; idx < this.results.length; idx++) {
          const data = {
            id: idx,
            date: this.results[idx].date,
            hasFreeIntevals: this.results[idx].commonFreeIntervals.length > 0
          };
          const btnTplController = resultsButtonTemplate(data);
          controller.sidebar.results.body.appendChild(btnTplController.root);
        }

        controller.sidebar.results.root.classList.remove('no-display');
      })
    ;
  });
};

SSModal.prototype.processResults = function() {
  this.results.forEach(day => {
    day.date = new Date(day.date);
    day.participants.forEach(p => {
      p.events.forEach(e => {
        e.date = new Date(e.date);
        e['time_from'] = new Date(e['time_from']);
        e['time_to'] = new Date(e['time_to']);
      })
    });
    day.commonFreeIntervals.forEach(fi => {
      fi.from = new Date(fi.from);
      fi.to = new Date(fi.to);
    });
  });
};

SSModal.prototype.bindResults = function() {
  this._tplController.sidebar.results.body.addEventListener('click', evt => {
    const btn = evt.target.closest('.results-btn');

    if (!btn) return;

    const id = +btn.dataset.dayId;
    const schedulerId = +this._tplController.main.scheduler.root.dataset.dayId;

    if (id == schedulerId) return;

    this._tplController.main.scheduler.root.dataset.dayId = id;
    this.renderScheduler(this.results[id]);
  });
};

SSModal.prototype.renderScheduler = function(day) {
  const main = this._tplController.main;
  const scheduler = main.scheduler;
  main.initial.classList.add('no-display');
  main.loading.classList.add('no-display');
  main.schedulerContainer.classList.remove('no-display');
  scheduler.participants.innerHTML = '';
  scheduler.timelineHeader.innerHTML = '';
  scheduler.strips.innerHTML = '';
  scheduler.timeline.innerHTML = '';
  scheduler.commonFIs.innerHTML = '';
  scheduler.generateHoursMarks();
  scheduler.generateStrips();
  scheduler.date.innerHTML = `${getMonthName(day.date.getMonth())}, ${day.date.getDate()}`;
  this.calcSizes();
  this.renderEvents(day);
  this.renderFreeIntervals(day);
};

SSModal.prototype.renderEvents = function(day) {
  const controller = this._tplController;

  day.participants.forEach(p => {
    const ttTplController = timelineTitleTemplate({ title: p.username });
    const timelineTplController = timelineTemplate();
    p.ttTplController = ttTplController;
    p.timelineTplController = timelineTplController;

    p.events.forEach(event => {
      const el = this.getEventElement(event);
      event.element = el;
      timelineTplController.root.appendChild(el);
    });

    controller.scheduler.participants.appendChild(ttTplController.root);
    controller.scheduler.timeline.appendChild(timelineTplController.root);
  });
};

SSModal.prototype.bindTooltips = function() {
  const controller = this._tplController;

  controller.root.addEventListener('click', evt => {
    const eventElement = evt.target.closest('.event');
    const tooltip = evt.target.closest('.tooltip');
    const currentEventElement = this._tooltip && this._tooltip.closest('.event');
    const newEventElementClicked = currentEventElement!==eventElement;

    if (tooltip) {
      return;
    }

    if (!tooltip && this._tooltip) {
      this._tooltip.classList.add('no-display');
      this._tooltip.remove();
      this._tooltip = null;
      currentEventElement.classList.remove('clicked');
    }

    if (!eventElement) {
      return;
    }

    if (!newEventElementClicked) {
      return;
    }
    
    eventElement.classList.add('clicked');
    const dayId = +controller.main.scheduler.root.dataset.dayId;
    const day = this.results[dayId];
    const id = +eventElement.dataset.eventId;
    const allEvents = day.participants.map(p => p.events).flat();
    const eventData = allEvents.find(e=>e.id===id);
    const tooltipTplController = tooltipTemplate(eventData);
    const el = tooltipTplController.root;
    eventElement.appendChild(el);
    el.classList.remove('no-display');
    this._tooltip = el;

    tooltipTplController.details.addEventListener('click', () => {
      EDModal.create({ eventId: id }).open();
    });
  });
};

SSModal.prototype.renderFreeIntervals = function(day) {
  const controller = this._tplController
  const timeline = controller.main.scheduler.timeline;
  const firstTimeline = timeline.firstElementChild;
  const lastTimeline = timeline.lastElementChild;
  const height = getCoords(lastTimeline).top - getCoords(firstTimeline).top + lastTimeline.offsetHeight;
  day.commonFreeIntervals.forEach(fi => {
    const fiTplController = commonFITemplate(fi);
    controller.main.scheduler.commonFIs.appendChild(fiTplController.root);
    // timeline.appendChild(fiTplController.root);
    fiTplController.root.style.width = this.calcWidth(fi.from, fi.to) + 'px';
    fiTplController.root.style.left = this.calcOffset(fi.from) + 'px';
    fiTplController.root.style.top = (getCoords(firstTimeline).top - getCoords(fiTplController.root).top) + 'px';
    fiTplController.root.style.height = height + 'px';
  });
};

SSModal.prototype.open = function() {
  const el = this._tplController.root;
  if (!el.classList.contains('display-yes')) {
    el.classList.add('display-yes');
  }
  if (!this._isInit) {
    this._isInit = true;
  }
  return this;
};

SSModal.prototype.close = function() {
  const el = this._tplController.root;
  if (el.classList.contains('display-yes')) {
    el.classList.remove('display-yes');
  }
  if (this._destroyOnClose) {
    this.destroy();
  }
  const closeEvent = new CustomEvent('close');
  el.dispatchEvent(closeEvent);
  return this;
};

SSModal.prototype.destroy = function() {
  this._tplController.root.remove();
};

module.exports = {
  create: options => new SSModal(options)
};