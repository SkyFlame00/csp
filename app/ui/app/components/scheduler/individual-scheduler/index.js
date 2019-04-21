const template = require('./index.tpl');
const CEModal = require('../create-event-modal');
const {
  dayTemplate,
  timelineTemplate,
  eventTemplate,
  tooltipTemplate
} = require('./templates');
const http = require('csp-app/libs/http');

function ISModal(options) {
  const tplController = template();
  this._instanceController = tplController;
  this._today = this.getDayStart(new Date());
  this._tooltip = null;
  this.loadEvents();
  this.bindISModalEvents();
  this.bindTooltips();
  document.body.appendChild(tplController.root);
  this._isInit = false;
  this._destroyOnClose = options && options.destroyOnClose;

  return {
    open: this.open.bind(this),
    close: this.close.bind(this),
    destroy: this.destroy.bind(this),
    root: this._instanceController.root
  };
}

ISModal.prototype.getDayStart = function(timestamp) {
  return new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 0);
};

ISModal.prototype.loadEvents = function() {
  const today = this._today;
  const postBody = {
    startAt: today,
    endAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 0)
  };

  http.post('scheduler/getAllMyEventsByDays', postBody)
    .then(days => {
      this._days = days;
      this.processDays();
      this.renderEvents();
    })
  ;
};

ISModal.prototype.processDays = function() {
  const days = this._days;
  days.forEach(day => {
    day.date = new Date(day.date);
    day.events.forEach(event => {
      event.date = new Date(event.date);
      event['time_from'] = new Date(event['time_from']);
      event['time_to'] = new Date(event['time_to']);
    });
  });
};

ISModal.prototype.bindISModalEvents = function() {
  const {closeBtn, openCEModalBtn} = this._instanceController;

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
      CEModalInstance.elements.root.addEventListener('eventCreated', evt => {
        CEModalInstance = null;
        this.addNewEvent(evt.detail);
      });
    }

    CEModalInstance.open();
  });
};

ISModal.prototype.calcSizes = function() {
  const controller = this._instanceController;

  const startHour = 9;
  const endHour = 21;
  const margin = 30;
  const width = controller.scheduler.timeline.offsetWidth - margin*2;
  const minute = (width)/((endHour - startHour)*60);

  this.sizes = {
    startHour,
    endHour,
    width,
    margin,
    minute
  };
};

ISModal.prototype.calcOffset = function(timeStart) {
  const thisDay_900 = new Date(timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(), this.sizes.startHour);
  const timeStartMinutes = new Date(
    timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(),
    timeStart.getHours(), timeStart.getMinutes()
  );
  const minutesDiff = (timeStartMinutes - thisDay_900)/(1000*60);
  return minutesDiff * this.sizes.minute + this.sizes.margin;
};

ISModal.prototype.calcWidth = function(timeStart, timeEnd) {
  const timeStartMinutes = new Date(
    timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(),
    timeStart.getHours(), timeStart.getMinutes()
  );
  const timeEndMinutes = new Date(
    timeEnd.getFullYear(), timeEnd.getMonth(), timeEnd.getDate(),
    timeEnd.getHours(), timeEnd.getMinutes()
  );
  const minutesDiff = (timeEndMinutes - timeStartMinutes)/(1000*60);
  return minutesDiff * this.sizes.minute;
};

ISModal.prototype.renderEvents = function() {
  const controller = this._instanceController;
  const days = this._days;

  days.forEach(day => {
    const dayTplController = dayTemplate({ title: day.title });
    const timelineTplController = timelineTemplate();
    day.dayTplController = dayTplController;
    day.timelineTplController = timelineTplController;

    day.events.forEach(event => {
      const el = this.getEventElement(event);
      event.element = el;
      timelineTplController.root.appendChild(el);
    });

    controller.scheduler.dates.appendChild(dayTplController.root);
    controller.scheduler.timeline.appendChild(timelineTplController.root);
  });
};

ISModal.prototype.getEventElement = function(event) {
  const eventTplController = eventTemplate({ id: event.id });
  const el = eventTplController.root;
  const offset = this.calcOffset(event['time_from']);
  const width = this.calcWidth(event['time_from'], event['time_to']);
  el.style.left = offset + 'px';
  el.style.width = width + 'px';
  return el;
};

ISModal.prototype.bindTooltips = function() {
  this._instanceController.root.addEventListener('click', evt => {
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
    const id = +eventElement.dataset.eventId;
    const allEvents = this._days.map(d=>d.events).flat();
    const eventData = allEvents.find(e=>e.id===id);
    const tooltipTplController = tooltipTemplate(eventData);
    const el = tooltipTplController.root;
    eventElement.appendChild(el);
    el.classList.remove('no-display');
    this._tooltip = el;
  });
};

ISModal.prototype.addNewEvent = function(event) {
  const dayFound = this._days.find(day => {
    const day1Str = `${event.date.getFullYear()-event.date.getMonth()-event.date.getDate()}`;
    const day2Str = `${day.date.getFullYear()-day.date.getMonth()-day.date.getDate()}`;
    return day1Str === day2Str;
  });

  if (!dayFound) return;

  dayFound.events.push(event);
  const el = this.getEventElement(event);
  dayFound.timelineTplController.root.appendChild(el);
};

ISModal.prototype.open = function() {
  const el = this._instanceController.root;
  if (!el.classList.contains('display-yes')) {
    el.classList.add('display-yes');
  }
  if (!this._isInit) {
    this._instanceController.scheduler.generateHoursMarks();
    this._instanceController.scheduler.generateStrips();
    this.calcSizes();
    this._isInit = true;
  }
  return this;
};

ISModal.prototype.close = function() {
  const el = this._instanceController.root;
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

ISModal.prototype.destroy = function() {
  this._instanceController.root.remove();
};

module.exports = {
  create: options => new ISModal(options)
};