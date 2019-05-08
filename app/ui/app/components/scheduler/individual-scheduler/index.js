const template = require('./index.tpl');
const CEModal = require('../create-event-modal');
const {
  timestripTemplate
} = require('./templates');
const {
  timelineTitleTemplate: dayTemplate,
  timelineTemplate,
  tooltipTemplate
} = require('../main/templates');
const http = require('csp-app/libs/http');
const EDModal = require('../event-details-modal');
const {
  calcSizes,
  calcOffset,
  calcWidth,
  getEventElement
} = require('../main/functions');

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

ISModal.prototype.calcSizes = calcSizes('_instanceController');
ISModal.prototype.calcOffset = calcOffset;
ISModal.prototype.calcWidth = calcWidth;
ISModal.prototype.getEventElement = getEventElement;

ISModal.prototype.getDayStart = function(timestamp) {
  return new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 0);
};

ISModal.prototype.loadEvents = function() {
  const today = this._today;
  const postBody = {
    startAt: today.toString(),
    endAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 0).toString()
  };

  http.post('scheduler/getAllMyEventsByDays', postBody)
    .then(days => {
      this._days = days;
      days.forEach(day => this.processDay(day));
      this.renderEvents();
      this.bindDatesMovement();
      return http.get('scheduler/getMyLocalTime');
    })
    .then(data => {
      this._timestrip = {};
      this.initTimestrip(new Date(data.timestamp));
    })
  ;
};

ISModal.prototype.initTimestrip = function(timestamp) {
  const timestrip = this._timestrip;
  timestrip.el = null;
  timestrip.timeDiff = timestamp - new Date();
  timestrip.curDay = new Date(new Date().setMilliseconds(timestrip.timeDiff));
  timestrip.curDay_9h = new Date(timestrip.curDay.getFullYear(), timestrip.curDay.getMonth(), timestrip.curDay.getDate(), 9);
  timestrip.curDay_21h = new Date(timestrip.curDay.getFullYear(), timestrip.curDay.getMonth(), timestrip.curDay.getDate(), 21);
  timestrip.day = this.findDay(timestrip.curDay);
  // let c = timestrip.curDay;
  // let st = new Date(c.getFullYear(), c.getMonth(), c.getDate(), 20, 59);
  // let dd = new Date(new Date().getTime() - st);
  this.run();
  setInterval(this.run.bind(this), 1000*60);
};

ISModal.prototype.run = function() {
  let timestrip = this._timestrip;
  let moment = new Date(new Date().getTime() + timestrip.timeDiff);
  // let moment = new Date(new Date().getTime() - 1000*60*60*15);
  // let moment = new Date(new Date().getTime() - dd);
  if (timestrip.curDay_21h < moment) {
    timestrip.curDay = new Date(timestrip.curDay.getFullYear(), timestrip.curDay.getMonth(), timestrip.curDay.getDate() + 1, 0);
    timestrip.curDay_9h = new Date(timestrip.curDay.getFullYear(), timestrip.curDay.getMonth(), timestrip.curDay.getDate(), 9);
    timestrip.curDay_21h = new Date(timestrip.curDay.getFullYear(), timestrip.curDay.getMonth(), timestrip.curDay.getDate(), 21);
    timestrip.day = this.findDay(timestrip.curDay);
    if (timestrip.el) {
      timestrip.el.root.classList.add('no-display');
      timestrip.el.root.remove();
      timestrip.el = null;
    }
  }

  if (!timestrip.day) {
    timestrip.day = this.findDay(timestrip.curDay);
  };

  if (moment >= timestrip.curDay_9h && moment <= timestrip.curDay_21h && timestrip.day) {
    const hh = moment.getHours().toString().length == 1 ? '0' + moment.getHours() : moment.getHours();
    const mm = moment.getMinutes().toString().length == 1 ? '0' + moment.getMinutes() : moment.getMinutes();
    const offset = Math.floor((moment - timestrip.curDay_9h)/(1000*60)) * this.sizes.minute;

    if (!timestrip.el) {
      timestrip.el = timestripTemplate({ time: `${hh}:${mm}` });
      timestrip.day.timelineTplController.root.appendChild(timestrip.el.root);
      timestrip.el.time.style.marginLeft = -(timestrip.el.time.offsetWidth / 2) + 'px';
      const height = timestrip.el.time.offsetHeight;
      const deltaHeight = +getComputedStyle(timestrip.el.root).getPropertyValue('--height-delta');
      timestrip.el.root.style.top = -(height+deltaHeight) + 'px';
    }

    timestrip.el.root.style.left = (offset + this.sizes.margin) + 'px';
    timestrip.el.time.textContent = `${hh}:${mm}`;
  }
};

ISModal.prototype.findDay = function(day) {
  return this._days.find(d => {
    const day1Str = `${d.date.getFullYear()-d.date.getMonth()-d.date.getDate()}`;
    const day2Str = `${day.getFullYear()-day.getMonth()-day.getDate()}`;
    return day1Str === day2Str;
  });
};

ISModal.prototype.processDay = function(day) {
  day.date = new Date(day.date);
  day.events.forEach(event => {
    event.date = new Date(event.date);
    event['time_from'] = new Date(event['time_from']);
    event['time_to'] = new Date(event['time_to']);
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

ISModal.prototype.renderDayEvents = function(dayNum) {
  const days = this._days;
  const day = days[dayNum];
  const dayAfter = days[dayNum+1] ? days[dayNum+1] : null;
  const controller = this._instanceController;

  const dayTplController = dayTemplate({ title: day.title });
  const timelineTplController = timelineTemplate();
  day.dayTplController = dayTplController;
  day.timelineTplController = timelineTplController;

  day.events.forEach(event => {
    const el = this.getEventElement(event);
    event.element = el;
    timelineTplController.root.appendChild(el);
  });

  controller.scheduler.dates.insertBefore(dayTplController.root, dayAfter && dayAfter.dayTplController.root);
  controller.scheduler.timeline.insertBefore(timelineTplController.root, dayAfter && dayAfter.timelineTplController.root);
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

    tooltipTplController.details.addEventListener('click', () => {
      EDModal.create({ eventId: id }).open();
    });
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

ISModal.prototype.bindDatesMovement = function() {
  const controller = this._instanceController;
  const dateUp = controller.scheduler.dateUp;
  const dateDown = controller.scheduler.dateDown;
  const days = this._days;

  dateUp.addEventListener('click', () => dateMove.call(this, 'up'));
  dateDown.addEventListener('click', () => dateMove.call(this, 'down'));

  function dateMove(direction) {
    if (direction == 'up') {
      const firstDay = days[0].date;
      const prevDay = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() - 1, 0);
      const postBody = { startAt: prevDay, endAt: firstDay };

      http.post('scheduler/getAllMyEventsByDays', postBody)
        .then(([day]) => {
          const lastDay = days.splice(days.length - 1, 1)[0];
          days.unshift(day);
          this.processDay(day);
          this.renderDayEvents(0);
          
          const timestrip = lastDay.timelineTplController.root.querySelector('.timestrip');

          if (timestrip) {
            this._timestrip.el = null;
            this._timestrip.day = null;
          }

          lastDay.dayTplController.root.remove();
          lastDay.timelineTplController.root.remove();

          dateUp.removeAttribute('disabled');
          dateDown.removeAttribute('disabled');

          this.run();
        })
      ;

      dateUp.setAttribute('disabled', 'disabled');
      dateDown.setAttribute('disabled', 'disabled');
    }

    if (direction == 'down') {
      const lastDay = days[days.length-1].date;
      const nextDay = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + 1, 0);
      const nNextDay = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + 2, 0);
      const postBody = { startAt: nextDay, endAt: nNextDay };

      http.post('scheduler/getAllMyEventsByDays', postBody)
        .then(([day]) => {
          const firstDay = days.splice(0, 1)[0];
          days.push(day);
          this.processDay(day);
          this.renderDayEvents(days.length-1);

          const timestrip = firstDay.timelineTplController.root.querySelector('.timestrip');

          if (timestrip) {
            this._timestrip.el = null;
            this._timestrip.day = null;
          }
          
          firstDay.dayTplController.root.remove();
          firstDay.timelineTplController.root.remove();

          dateUp.removeAttribute('disabled');
          dateDown.removeAttribute('disabled');
          this.run();
        })
      ;

      dateUp.setAttribute('disabled', 'disabled');
      dateDown.setAttribute('disabled', 'disabled');
    }
  }
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