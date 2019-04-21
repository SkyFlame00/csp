(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const http = require('csp-app/libs/http');
const template = require('./tpl');
const {createElementFromHTML} = require('csp-app/libs/utilities');
const {router} = require('csp-app/components/main');

const Dashboard = function() {
  return http.get('/users/getUserData')
    .then((res) => {
      const id = res.data.user.id;
      console.log(res.data)

      if (!res.success) throw new Error(res.error);

      const templateData = {
        user: res.data.user
      };

      const element = createElementFromHTML(template(templateData));
      const btn = element.querySelector('#log-out');
      btn.addEventListener('click', () => {
        window.localStorage.removeItem('auth_token');
        router.navigate('/');
      });
      const routerOutler = element.querySelector('.router-outlet');

      return {
        success: true,
        controller: {
          element: element
        },
        render: function(element) {
          routerOutler.innerHTML = '';
          routerOutler.append(element);
        }
      };
    });
};

module.exports = Dashboard;
},{"./tpl":4,"csp-app/components/main":5,"csp-app/libs/http":58,"csp-app/libs/utilities":67}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
module.exports = /*html*/`
  <div class="menu">
    <ul>
      <li><a data-route=""><i class="i i-survey"></i><span>Surveys</span></a></li>
      <li><a data-route="users"><i class="i i-users"></i><span>Users</span></a></li>
      <li><a data-route=""><i class="i i-project"></i><span>Projects</span></a></li>
      <li><a data-route="scheduler"><span>Scheduler</span></a></li>
    </ul>
  </div>
`;
},{}],4:[function(require,module,exports){
const sidebarExec = require('./templates/sidebar_exec.tpl');
const sidebarClient = require('./templates/sidebar_client.tpl');

module.exports = data => {
  const group = data.user.group;
  let sidebar;

  if (['academic', 'student', 'ext_exec', null, undefined].includes(group)) {
    sidebar = sidebarExec;
  }

  if (group == 'client') {
    sidebar = sidebarClient;
  }

  return /*html*/`
  <div class="cmp_dashboard">
    <div class="sidebar">
      <div class="logo-block">
        <span class="logo">{ CSP }</span>
      </div>

      ${ sidebar }
    </div>
    <div class="main">
      <div class="dboard-header"><button id="log-out">Log out</button></div>
      <div class="content">
        <div class="router-outlet"></div>
      </div>
    </div>
  </div>`;
};
},{"./templates/sidebar_client.tpl":2,"./templates/sidebar_exec.tpl":3}],5:[function(require,module,exports){
const Router = require('csp-app/libs/router')

const app = self = {
  root: null,
  router: new Router(),
  path: [],
  renderChain: function(components) {
    // Promise is returned
    return components.reduce((accumulator, component) => {
      // Accumulator may not only be a Promise but it can
      // also be a plain js object (as is with self.root)
      return Promise.resolve(accumulator)
        // Before we make sure the previous component (it is now accumulator)
        // has resolved, we do not create the component that follows
        .then(accumulator => Promise.all([accumulator, new component()]))
        .then(([accumulator, component]) => {
          if (!component.success)
            return Promise.reject({component: component.error, accumulator: accumulator});

          accumulator.render(component.controller.element);
          return component;
        })
      ;
    }, self.root)
    .catch(err => console.error(err));
  },
  initialize: function(rootInstance) {
    self.root = rootInstance;
    document.body.innerHTML = '';
    document.body.appendChild(rootInstance.reference);
  },
  render: function(components) {
    return self.renderChain(components);
  }
};

module.exports = app;
},{"csp-app/libs/router":60}],6:[function(require,module,exports){
const Root = {
    componentName: 'app',
    html: `<div id="app"></div>`,
    identifier: '#app',
    create: function() {
        // Consider reimplementing with HTML5 template feature instead just utilizing div
        const tmpElem = document.createElement('div');
        tmpElem.innerHTML = this.html;
        const element = tmpElem.firstChild;

        return {
            reference: element,
            routerOutlet: element,
            componentName: this.componentName,
            state: {},
            actions: (function(routerOutlet) {
                return {
                    load: function(fragment) {
                        routerOutlet.innerHTML = '';
                        routerOutlet.appendChild(fragment);
                    }
                };
            })(element),
            render: (function(routerOutlet) {
                return function(DOMTree) {
                    routerOutlet.innerHTML = '';
                    routerOutlet.appendChild(DOMTree);
                }
            })(element)
        }
    }
};

module.exports = Root;
},{}],7:[function(require,module,exports){
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
},{"./modal-standard":9}],8:[function(require,module,exports){
const cancel = {
  id: 'cancel',
  type: 'secondary',
  order: 0,
  title: 'Cancel'
};

const submit = {
  id: 'submit',
  type: 'primary',
  order: 1,
  title: 'OK'
};

module.exports = {
  cancel,
  submit
};
},{}],9:[function(require,module,exports){
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
},{"../modals-controller":11,"./actions":8,"./tpl":10,"csp-app/libs/utilities":67}],10:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template() {
  const html = /*html*/`
    <div class="modal modal-standard">
      <div class="header">
        <div class="title"></div>
        <div class="close">
          <button><i class="i i-close"></i></button>
        </div>
      </div>

      <div class="body"></div>
      <div class="footer"></div>
    </div>
  `;

  const modal = createElementFromHTML(html);
  const title = modal.querySelector('.title');
  const closeBtn = modal.querySelector('.close button');
  const body = modal.querySelector('.body');
  const footer = modal.querySelector('.footer');

  return {
    root: modal,
    title,
    closeBtn,
    body,
    footer
  };
}

module.exports = template;
},{"csp-app/libs/utilities":67}],11:[function(require,module,exports){
function ModalsController() {
  window.addEventListener('DOMContentLoaded', () => {
    let container = document.getElementById('modals')

    if (!container) {
      container = document.createElement('div');
      container.classList.add('modals');
      container.classList.add('no-display');
      container.id = 'modals';
      document.body.appendChild(container);
      this.container = container;
    }
    else {
      this.container = container;
    }

    let cover = document.getElementById('modals-cover')

    if (!cover) {
      cover = document.createElement('div');
      cover.classList.add('modals-cover');
      cover.id = 'modals-cover';
      this.cover = cover;
    }
    else {
      this.cover = cover;
    }

    this.modalsOpen = [];
  });
}

ModalsController.prototype.add = function(modal) {
  const element = modal.elements.root;
  this.container.appendChild(element);
  this.container.insertBefore(this.cover, element);
};

ModalsController.prototype.open = function(modal) {
  if (this.container.classList.contains('no-display')) {
    this.container.classList.remove('no-display');
  }

  if (this.modalsOpen.length > 0) {
    this.getLast().elements.root.classList.add('no-display');
  }

  const element = modal.elements.root;
  this.container.insertBefore(this.cover, element);
  element.classList.remove('no-display');
  this.modalsOpen.push(modal);
};

ModalsController.prototype.closeLast = function() {
  if (this.modalsOpen.length == 0) throw new Error('No modals to close');

  this.getLast().elements.root.classList.add('no-display');
  this.modalsOpen.pop();

  if (this.modalsOpen.length > 0) {
    this.getLast().elements.root.classList.remove('no-display');
  }
  else {
    this.container.classList.add('no-display');
  }
};

ModalsController.prototype.getLast = function() {
  return this.modalsOpen[this.modalsOpen.length - 1];
};

module.exports = new ModalsController();
},{}],12:[function(require,module,exports){
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
  
        const eventCreated = new CustomEvent('eventCreated', { detail: this.data });
        this.modal.elements.root.dispatchEvent(eventCreated);
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
},{"../event-created-modal":16,"../select-participants-modal":28,"./templates":13,"csp-app/components/modals":7,"csp-app/libs/http":58}],13:[function(require,module,exports){
const mainTemplate = require('./main.tpl');
const participantTemplate = require('./participant.tpl');

module.exports = {
  mainTemplate,
  participantTemplate
};
},{"./main.tpl":14,"./participant.tpl":15}],14:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template() {
  const html = /*html*/`
    <div class="form ce-form">
      <div class="field field-oneline field-title clearfix">
        <div class="field-label"><label for="ce-form-title">Title</label></div>
        <div class="field-input"><input type="text" id="ce-form-title" /></div>
      </div>

      <div class="field field-oneline field-desc clearfix">
        <div class="field-label"><label for="ce-form-desc">Description</label></div>
        <div class="field-input"><textarea id="ce-form-desc"></textarea></div>
      </div>

      <div class="field field-oneline field-date clearfix">
        <div class="field-label"><label for="ce-form-date">Date</label></div>
        <div class="field-input">
          <input type="text" id="ce-form-date" placeholder="dd/mm/yyyy" />
          <button class="btn-no-style"><i class="i i-calendar"></i></button>
        </div>
      </div>

      <div class="field field-oneline field-time clearfix">
        <div class="field-label"><label>Time</label></div>
        <div class="field-input">
          <input type="text" placeholder="hh:mm" class="from" />
          <span>-</span>
          <input type="text" placeholder="hh:mm" class="to" />
        </div>
      </div>

      <div class="field field-participants">
        <div class="field-label">Participants <button class="btn-primary-outlined"><i class="i i-plus"></i>Add participant</button></div>
        <div class="field-input"></div>
        <div class="field-alert no-display">
          These cannot participate: <span class="participants-list"></span>
        </div>
      </div>

      <div class="field field-oneline field-link clearfix">
        <div class="field-label"><label for="ce-form-link">Link</label></div>
        <div class="field-input"><input type="text" id="ce-form-link" /></div>
      </div>

      <div class="field field-oneline field-type clearfix">
        <div class="field-label"><label for="ce-form-link">Type</label></div>
        <div class="field-input">
          <select></select>
        </div>
      </div>

      <div class="field field-oneline field-project clearfix">
        <div class="field-label"><label for="ce-form-project">Project</label></div>
        <div class="field-input">
        <select></select>
        </div>
      </div>

      <div class="field field-importance">
        <div class="field-label">Importance mark</div>
        <div class="field-input">
          <div>
            <input type="radio" name="importance" value="none" id="imp-none" />
            <label for="imp-none">None</label>
          </div>
          
          <div>
            <input type="radio" name="importance" value="important" id="imp-important" />
            <label for="imp-important">Important</label>
          </div>

          <div>
            <input type="radio" name="importance" value="desirable" id="imp-desirable" />
            <label for="imp-desirable">Desirable</label>
          </div>
        </div>
      </div>

      <div class="field field-docs">
        <div class="field-label">Documents <button class="btn-primary-outlined"><i class="i i-plus"></i>Attach document</button></div>
        <div class="field-input"></div>
      </div>
    </div>
  `;

  const element = createElementFromHTML(html);
  const title = element.querySelector('.field-title input');
  const desc = element.querySelector('.field-desc textarea');
  const date = element.querySelector('.field-date input');
  const from = element.querySelector('.field-time .from');
  const to = element.querySelector('.field-time .to');
  const addParticipantBtn = element.querySelector('.field-participants button');
  const addParticipantPlace = element.querySelector('.field-participants .field-input');
  const link = element.querySelector('.field-link input');
  const typeSelect = element.querySelector('.field-type select');
  const projectSelect = element.querySelector('.field-project select');
  const impRadioNone = element.querySelector('#imp-none');
  const impRadioImportant = element.querySelector('#imp-important');
  const impRadioDesirable = element.querySelector('#imp-desirable');
  const addDocBtn = element.querySelector('.field-docs button');
  const addDocPlace = element.querySelector('.field-docs .field-input');

  return {
    root: element,
    title,
    desc,
    date,
    time: {
      from,
      to
    },
    participants: {
      btn: addParticipantBtn,
      place: addParticipantPlace,
      alert: {
        root: element.querySelector('.field-participants .field-alert'),
        place: element.querySelector('.field-participants .participants-list')
      }
    },
    link,
    type: typeSelect,
    project: projectSelect,
    importance: {
      none: impRadioNone,
      important: impRadioImportant,
      desirable: impRadioDesirable
    },
    docs: {
      btn: addDocBtn,
      place: addDocPlace
    }
  };
}

module.exports = template;
},{"csp-app/libs/utilities":67}],15:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(participant) {
  const html = /*html*/`
    <div class="participant">
      <div class="user-info" data-id="${ participant['user_id'] }">
        ${ participant['username'] }
      </div>
      
      <div class="close">
        <button class="btn-close"><i class="i i-close"></i></button>
      </div>
    </div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element,
    closeBtn: element.querySelector('.btn-close')
  };
}

module.exports = template;
},{"csp-app/libs/utilities":67}],16:[function(require,module,exports){
const Modal = require('csp-app/components/modals');
const {createElementFromHTML} = require('csp-app/libs/utilities');

function ECModal() {
  const ECModalInstance = Modal.create({
    type: 'standard',
    title: 'Success',
    width: 400,
    defaultActions: false,
    actions: [{
      id: 'submit',
      type: 'primary',
      title: 'OK'
    }],
    destroyOnClose: true
  });

  const html = /*html*/`
    <p style="text-align: center">The event has been successfully created!</p>
  `;
  const element = createElementFromHTML(html);

  ECModalInstance.elements.root.appendChild(element);

  return ECModalInstance;
}

module.exports = {
  create: () => new ECModal()
};
},{"csp-app/components/modals":7,"csp-app/libs/utilities":67}],17:[function(require,module,exports){
const SchedulerComponent = require('./main');

module.exports = SchedulerComponent;
},{"./main":25}],18:[function(require,module,exports){
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
},{"../create-event-modal":12,"./index.tpl":19,"./templates":22,"csp-app/libs/http":58}],19:[function(require,module,exports){
const modalTemplate = require('../main/modal.tpl');
const {range, createElementFromHTML} = require('csp-app/libs/utilities');

const sidebarTpl = /*html*/`

`;

const schedulerTpl = /*html*/`
  <div class="cmp_ind-scheduler">
    <div class="scheduler-container">
      <button id="open-CEModal">Open modal</button>
      <div class="scheduler">
        <div class="left">
          <div class="date-move date-up-wrapper">
            <button><i class="i i-sort"></i></button>
          </div>

          <div class="dates"></div>

          <div class="date-move date-down-wrapper">
            <button><i class="i i-sort"></i></button>
          </div>
        </div>
        
        <div class="right">
          <div class="strips"></div>
          <div class="timeline-h"></div>
          <div class="timeline-b"></div>
        </div>
      </div>
    </div>
  </div>
`;

function generateHoursMarks(timelineHeader) {
  return function() {
    const initMargin = 30;
    const width = timelineHeader.offsetWidth;
    const nums = range(9, 21);
    const offset = (width - initMargin*2)/(nums.length-1);
    const elements = nums.map(num => {
      const div = document.createElement('div');
      div.classList.add('hour');
      div.textContent = num;
      return div;
    });
    let sum = 0;

    sum += initMargin;
    timelineHeader.appendChild(elements[0]);
    elements[0].textContent = nums[0];
    const width0 = elements[0].offsetWidth;
    
    elements[0].style.left = (sum-width0/2) + 'px';
    elements.slice(1).forEach(el => {
      sum += offset;
      timelineHeader.appendChild(el);
      const width = el.offsetWidth;
      el.style.left = (sum - width/2) + 'px';
    });
  }
}

function generateStrips(stripsWrapper) {
  return function() {
    const initMargin = 30;
    const width = stripsWrapper.offsetWidth;
    const nums = range(9, 21);
    const offset = (width - initMargin*2)/(nums.length-1);
    let sum = 0;

    const strips = nums.map(num => {
      const strip = document.createElement('div');
      strip.classList.add('strip');
      return strip;
    });

    sum += initMargin;

    strips.forEach(strip => {
      strip.style.left = sum + 'px';
      stripsWrapper.appendChild(strip);
      sum += offset;
    });
  }
}

function template() {
  const modalTplController = modalTemplate();
  const scheduler = createElementFromHTML(schedulerTpl);

  const dateUp = scheduler.querySelector('.date-up-wrapper button');
  const dateDown = scheduler.querySelector('.date-down-wrapper button');
  const dates = scheduler.querySelector('.dates');
  const timelineHeader = scheduler.querySelector('.timeline-h');
  const timelineBody = scheduler.querySelector('.timeline-b');
  const strips = scheduler.querySelector('.strips');
  const openCEModalBtn = scheduler.querySelector('#open-CEModal');

  modalTplController.content.appendChild(scheduler);

  return {
    ...modalTplController,
    openCEModalBtn,
    scheduler: {
      root: scheduler,
      dateUp,
      dateDown,
      dates,      
      timeline: timelineBody,
      right: scheduler.querySelector('.right'),
      generateHoursMarks: generateHoursMarks(timelineHeader),
      generateStrips: generateStrips(strips)
    }
  };
}

module.exports = template;
},{"../main/modal.tpl":27,"csp-app/libs/utilities":67}],20:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(data) {
  const html = /*html*/`
    <div class="date">${ data.title }</div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element
  };
}

module.exports = template;
},{"csp-app/libs/utilities":67}],21:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(event) {
  const html = /*html*/`
    <div class="event" data-event-id="${ event.id }"></div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element
  };
}

module.exports = template;
},{"csp-app/libs/utilities":67}],22:[function(require,module,exports){
const dayTemplate = require('./day.tpl');
const timelineTemplate = require('./timeline.tpl');
const eventTemplate = require('./event.tpl');
const tooltipTemplate = require('./tooltip.tpl');

module.exports = {
  dayTemplate,
  timelineTemplate,
  eventTemplate,
  tooltipTemplate
};
},{"./day.tpl":20,"./event.tpl":21,"./timeline.tpl":23,"./tooltip.tpl":24}],23:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template() {
  const html = /*html*/`
    <div class="timeline"></div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element
  };
}

module.exports = template;
},{"csp-app/libs/utilities":67}],24:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(event) {
  console.log(event)

  let importance;
  let importanceHint;
  let description;

  switch(event.importance) {
    case 'none':
      importance = 'peace';
      importanceHint = 'The event is not important';
      break;
    case 'desirable':
      importance = 'rock';
      importanceHint = 'The event is desirable to visit';
      break;
    case 'important':
      importance = 'paper';
      importanceHint = 'The event is obligatory to visit';
      break;
    default:
      importance = 'peace';
      importanceHint = 'The event is not important';
      break;
  }

  if (event.description && event.description.length > 150) {
    description = description.slice(0, 146) + '...';
  }
  else if (!description || description.length == 0) {
    description = 'No description supplied';
  }

  const html = /*html*/`
    <div class="tooltip no-display">
      <div class="header">
        <div class="title"><h3>${ event.title }</h3></div>
        <div class="importance" title="${ importanceHint }"><i class="i i-hand-${ importance }"></i></div>
      </div>
      <div class="description">${ description }</div>
      <div class="footer">
        <div class="item details"><button title="Show details"><i class="i i-info"></i></button></div>

        ${
          event.link ?
          /*html*/`<div class="item link" title="${ event.link }"><a href="${ event.link }"><i class="i i-link"></i></a></div>` :
          ''
        }

        ${
          event['project_id'] ?
          /*html*/`<div class="item project" title="Project's page"><a data-route="${ event['project_id'] }"><i class="i i-project"></i></a></div>` :
          ''
        }
        
        <div class="item participants" title="Number of participants">
          <i class="i i-users"></i> 
          <span>${ event['participants_num'] }</span>
        </div>
      </div>
    </div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element
  };
}

module.exports = template;
},{"csp-app/libs/utilities":67}],25:[function(require,module,exports){
const template = require('./index.tpl');
const ISModal = require('../individual-scheduler');

const SchedulerComponent = function() {
  const tplController = template();
  let ISModalInstance = null;

  tplController.btnOpenIndSch.addEventListener('click', () => {
    if (!ISModalInstance) {
      ISModalInstance = ISModal.create({ destroyOnClose: true });
      ISModalInstance.root.addEventListener('close', () => {
        ISModalInstance = null;
      });
    }
    
    ISModalInstance.open();
  });

  return {
    success: true,
    controller: {
      element: tplController.root
    }
  };
};

module.exports = SchedulerComponent;
},{"../individual-scheduler":18,"./index.tpl":26}],26:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template() {
  const html = /*html*/`
    <div class="cmp_scheduler-dboard">
      <button id="btn-open-indSch">Open individual scheduler<button>
    </div>
  `;
  const element = createElementFromHTML(html);
  const btnOpenIndSch = element.querySelector('#btn-open-indSch');

  return {
    root: element,
    btnOpenIndSch: btnOpenIndSch
  };
}

module.exports = template;
},{"csp-app/libs/utilities":67}],27:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template() {
  const html = /*html*/`
    <div class="cmp_scheduler">
      <div class="sidebar">
        <div class="back-wrapper modal-close">
          <div class="back-icon"><i class="i i-arrow"></i></div>
          <div class="back-label">Back to dashboard</div>
        </div>
      </div>
      <div class="content"></div>
    </div>
  `;
  const element = createElementFromHTML(html);
  const closeBtn = element.querySelector('.modal-close');
  const sidebar = element.querySelector('.sidebar');
  const content = element.querySelector('.content');
  
  return {
    root: element,
    closeBtn,
    sidebar,
    content
  };
}

module.exports = template;
},{"csp-app/libs/utilities":67}],28:[function(require,module,exports){
const Modal = require('csp-app/components/modals');
const http = require('csp-app/libs/http');
const {createElementFromHTML} = require('csp-app/libs/utilities');

function listTemplate() {
  const html = /*html*/`
    <div class="cmp_sel-ps"></div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element
  };
}

function participantTemplate(participant) {
  const selected = participant.selected ? 'selected' : '';
  const username = participant.you ? 'You' : participant['username'];
  const html = /*html*/`
    <div class="participant ${ selected }" data-id="${ participant['user_id'] }">
      <div class="select-box"><i class="i i-check"></i></div>
      <div class="user-info">
        <div class="user-name">${ username }</div>
        ${
          participant['busy'] ?
          /*html*/`<div class="busy"><i class="i i-clock"></i> Busy</div>`
          : ''
        }
      </div>
    </div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element
  };
}

function SPModal(options) {
  const {
    participants: participantsSelected,
    date,
    timeFrom,
    timeTo
  } = options;

  const SPModalInstance = Modal.create({
    type: 'standard',
    title: 'Select participants',
    width: 300,
    height: 200,
    defaultActions: true,
    destroyOnClose: true
  });

  const params = { date, timeFrom, timeTo };
  const tplController = listTemplate();
  const submit = SPModalInstance.elements.submit;
  let participants = [];
  
  SPModalInstance.elements.body.appendChild(tplController.root);

  http.post('scheduler/getAllFriendsBasedOnAvailability', params)
    .then(friends => {
      friends = friends.sort((a, b) => {
        if (a.you == false) return 1;
        if (b.you == false) return -1;
        return 0;
      });

      friends.forEach(friend => {
        const selected = participantsSelected.findIndex(p => p['user_id'] === friend['user_id']);
        friend.selected = selected > -1;
        participants.push(friend);
      });

      participants.forEach(p => {
        const PItemTplController = participantTemplate(p);
        tplController.root.appendChild(PItemTplController.root);
      });

      tplController.root.addEventListener('click', evt => {
        const participantTpl = evt.target.closest('.participant');
        if (!participantTpl) return;
        const userId = +participantTpl.dataset.id;
        const participant = participants.find(p => p['user_id'] === userId);
        participant.selected = !participant.selected;
        participantTpl.classList.toggle('selected');
        disableOnBusySelected();
      });

      submit.addEventListener('click', () => {
        const data = participants.filter(p => p.selected);
        const submitEvent = new CustomEvent('participantsSelected', { detail: {participants: data} });
        SPModalInstance.elements.root.dispatchEvent(submitEvent);
        SPModalInstance.close();
      });

      disableOnBusySelected();
    })
  ;

  function disableOnBusySelected() {
    const busySelected = participants.find(p => p.selected && p['busy']);

    if (busySelected && !submit.getAttribute('disabled')) {
      submit.setAttribute('disabled', 'disabled');
    }

    if (!busySelected && submit.getAttribute('disabled')) {
      submit.removeAttribute('disabled');
    }
  }

  return SPModalInstance;
}

module.exports = {
  create: options => new SPModal(options)
};
},{"csp-app/components/modals":7,"csp-app/libs/http":58,"csp-app/libs/utilities":67}],29:[function(require,module,exports){
const Form = require('csp-app/libs/forms');
const {minLength, maxLength, startsWithNumber} = require('csp-app/libs/forms/validators');

const username = {
  keyName: 'username',
  tag: 'input',
  id: 'loginform-username',
  label: '',
  attributes: [
    {name: 'type', value: 'text'},
    {name: 'placeholder', value: 'Username'}
  ],
  validators: [
    {
      name: 'minLength',
      handler: minLength
    },
    {
      name: 'maxLength',
      handler: maxLength
    },
    {
      name: 'startsWithNumber',
      handler: startsWithNumber
    }
  ],
  wrapper: {class: 'input-block'}
};

const password = {
  keyName: 'password',
  tag: 'input',
  id: 'loginform-password',
  label: '',
  attributes: [
    {name: 'type', value: 'password'},
    {name: 'placeholder', value: 'Password'}
  ],
  required: true,
  validators: [
    {
      name: 'minLength',
      handler: minLength
    }
  ],
  wrapper: {class: 'input-block'}
};

const confirmPassword = {
  keyName: 'confirmPassword',
  tag: 'input',
  id: 'loginform-confirmPassword',
  label: '',
  attributes: [
    {name: 'type', value: 'password'},
    {name: 'placeholder', value: 'Confirm password'}
  ],
  required: true,
  validators: [
    {
      name: 'minLength',
      handler: minLength
    }
  ],
  wrapper: {class: 'input-block'}
};

const email = {
  keyName: 'email',
  tag: 'input',
  id: 'loginform-password',
  label: '',
  attributes: [
    {name: 'type', value: 'text'},
    {name: 'placeholder', value: 'E-mail'}
  ],
  required: true,
  validators: [
    {
      name: 'minLength',
      handler: minLength
    }
  ],
  wrapper: {class: 'input-block'}
};

const clientForm = new Form({
  validators: [],
  submit: {
    handler: function(values, evt) {
      evt.preventDefault();
      console.log('Form is clean');
    }
  },
  controls: [
    username,
    password,
    confirmPassword,
    email
  ]
});

module.exports = clientForm;
},{"csp-app/libs/forms":56,"csp-app/libs/forms/validators":57}],30:[function(require,module,exports){
const Form = require('csp-app/libs/forms');
const {minLength, maxLength, startsWithNumber} = require('csp-app/libs/forms/validators');
const http = require('csp-app/libs/http')

const username = {
  keyName: 'username',
  tag: 'input',
  id: 'loginform-username',
  label: '',
  attributes: [
    {name: 'type', value: 'text'},
    {name: 'placeholder', value: 'Username'}
  ],
  validators: [
    {
      name: 'minLength',
      handler: minLength
    },
    {
      name: 'maxLength',
      handler: maxLength
    },
    {
      name: 'startsWithNumber',
      handler: startsWithNumber
    }
  ],
  wrapper: {class: 'input-block'}
};

const password = {
  keyName: 'password',
  tag: 'input',
  id: 'loginform-password',
  label: '',
  attributes: [
    {name: 'type', value: 'password'},
    {name: 'placeholder', value: 'Password'}
  ],
  required: true,
  validators: [
    {
      name: 'minLength',
      handler: minLength
    }
  ],
  wrapper: {class: 'input-block'}
};

const confirmPassword = {
  keyName: 'confirmPassword',
  tag: 'input',
  id: 'loginform-confirmPassword',
  label: '',
  attributes: [
    {name: 'type', value: 'password'},
    {name: 'placeholder', value: 'Confirm password'}
  ],
  required: true,
  validators: [
    {
      name: 'minLength',
      handler: minLength
    }
  ],
  wrapper: {class: 'input-block'}
};

const email = {
  keyName: 'email',
  tag: 'input',
  id: 'loginform-password',
  label: '',
  attributes: [
    {name: 'type', value: 'text'},
    {name: 'placeholder', value: 'E-mail'}
  ],
  required: true,
  validators: [
    {
      name: 'minLength',
      handler: minLength
    }
  ],
  wrapper: {class: 'input-block'}
};

const org = {
  keyName: 'org',
  tag: 'input',
  id: 'loginform-password',
  label: '',
  attributes: [
    {name: 'type', value: 'text'},
    {name: 'placeholder', value: 'Your organization'}
  ],
  required: true,
  validators: [
    {
      name: 'minLength',
      handler: minLength
    }
  ],
  wrapper: {class: 'input-block'}
};

const execForm = new Form({
  validators: [],
  submit: {
    handler: function(values, evt) {
      const body = {
        username: values.username,
        email: values.email,
        password: values.password
      };

      http.post('auth/signup/exec', body)
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          console.log(error)
        })
      ;
    }
  },
  controls: [
    username,
    password,
    confirmPassword,
    email,
    org
  ]
});

module.exports = execForm;
},{"csp-app/libs/forms":56,"csp-app/libs/forms/validators":57,"csp-app/libs/http":58}],31:[function(require,module,exports){
const Form = require('csp-app/libs/forms');
const {minLength, maxLength, startsWithNumber} = require('csp-app/libs/forms/validators');
const http = require('csp-app/libs/http');
const MainController = require('csp-app/components/main');
const Dashboard = require('csp-app/components/dashboard');

const username = {
  keyName: 'username',
  tag: 'input',
  id: 'loginform-username',
  label: '',
  attributes: [
    {name: 'type', value: 'text'},
    {name: 'placeholder', value: 'Username'}
  ],
  validators: [
    {
      name: 'minLength',
      handler: minLength
    },
    {
      name: 'maxLength',
      handler: maxLength
    },
    {
      name: 'startsWithNumber',
      handler: startsWithNumber
    }
  ],
  wrapper: {class: 'input-block'}
};

const password = {
  keyName: 'password',
  tag: 'input',
  id: 'loginform-password',
  label: '',
  attributes: [
    {name: 'type', value: 'password'},
    {name: 'placeholder', value: 'Password'}
  ],
  required: true,
  validators: [
    {
      name: 'minLength',
      handler: minLength
    }
  ],
  wrapper: {class: 'input-block'}
};

const loginForm = new Form({
  validators: [],
  submit: {
    handler: function(values) {
      const {username, password} = values;
      const data = {
        username: username,
        password: password
      };

      http.post('auth/login', data)
        .then(res => {
          if (!res.success)
            throw new Error(res.error.message);

          window.localStorage.setItem('auth_token', res.data.token);
          MainController.render([Dashboard]);
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  },
  controls: [
    username,
    password
  ]
});

module.exports = loginForm;
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/libs/forms":56,"csp-app/libs/forms/validators":57,"csp-app/libs/http":58}],32:[function(require,module,exports){
const loginForm = require('./LoginForm');
const clientForm = require('./ClientForm');
const execForm = require('./ExecForm');

module.exports = {
  loginForm,
  clientForm,
  execForm
};
},{"./ClientForm":29,"./ExecForm":30,"./LoginForm":31}],33:[function(require,module,exports){
const template = require('./start.tpl');
const tabs = require('./tabs');
const {createElementFromHTML, Singleton} = require('csp-app/libs/utilities');

const Start = function() {
  const element = createElementFromHTML(template());
  const tabsWrapper = element.querySelector('.start-tabs');
  tabsWrapper.appendChild(tabs.header.element);
  tabsWrapper.appendChild(tabs.content.element);

  return {
    success: true,
    controller: {
      element: element
    }    
  };
};

module.exports = Singleton(Start);
},{"./start.tpl":34,"./tabs":35,"csp-app/libs/utilities":67}],34:[function(require,module,exports){
function template(data) {
  return /*html*/`
    <div class="cmp_start">
      <div class="wrapper">
        <div class="container">
          <div class="logo-block">
            <h1>Welcome to Consulting Services Platform</h1>
          </div>
          
          <a data-route="/">Home</a>
          <a data-route="/dashboard">Dashboard</a>

          <div class="start-tabs"></div>
        </div>
      </div>
    </div>
  `;
}

module.exports = template;
},{}],35:[function(require,module,exports){
const Tabs = require('csp-app/libs/tabs');
const createElementFromHTML = require('csp-app/libs/utilities').createElementFromHTML;
const signupTabs = require('./signupTabs');
const loginForm = require('../forms/LoginForm');
const radialGradientOnHover = require('csp-app/libs/misc/button-effects/radialGradientOnHover');

const loginBlock = createElementFromHTML(/*html*/`
  <div class="login-block">
    <div class="header"><h2>Log in</h2></div>
    <div class="form"></div>
  </div>
`);

const signupBlock = createElementFromHTML(/*html*/`
  <div class="signup-block"></div>
`);

const startTabs = new Tabs({
  header: {
    className: 'main-actions',
    items: [
      {title: 'Log in', tag: 'button'},
      {title: 'Sign up', tag: 'button'}
    ]
  },
  content: {
    items: [
      loginBlock,
      signupBlock
    ]
  },
  animation: {
    name: 'loginSignupSwitch'
  }
});

const contentWrapper = document.createElement('div');
contentWrapper.classList.add('forms');
contentWrapper.appendChild(signupTabs.content.element);

startTabs.content.items[0].querySelector('.login-block .form').appendChild(loginForm.ref);
startTabs.content.items[1].appendChild(signupTabs.header.element);
startTabs.content.items[1].appendChild(contentWrapper);

startTabs.header.items.forEach(item => radialGradientOnHover(item, {padding: [10, 16]}));

module.exports = startTabs;
},{"../forms/LoginForm":31,"./signupTabs":36,"csp-app/libs/misc/button-effects/radialGradientOnHover":59,"csp-app/libs/tabs":66,"csp-app/libs/utilities":67}],36:[function(require,module,exports){
const Tabs = require('csp-app/libs/tabs');
const createElementFromHTML = require('csp-app/libs/utilities').createElementFromHTML;
const {clientForm, execForm} = require('../forms');
const radialGradientOnHover = require('csp-app/libs/misc/button-effects/radialGradientOnHover');

const clientFormBlock = createElementFromHTML(/*html*/`
  <div class="client-form form"></div>
`);

const execFormBlock = createElementFromHTML(/*html*/`
  <div class="exec-form form"></div>
`);

const academicFormBlock = createElementFromHTML(/*html*/`
  <div class="form">Academic</div>
`);

const studentFormBlock = createElementFromHTML(/*html*/`
  <div class="form">Student</div>
`);

const signupTabs = new Tabs({
  header: {
    className: 'actions clearfix',
    items: [
      {title: 'Sign up as client', tag: 'button'},
      {title: 'Sign up as executor', tag: 'button'},
      {title: 'As academic', tag: 'button'},
      {title: 'As student', tag: 'button'}
    ]
  },
  content: {
    items: [
      clientFormBlock,
      execFormBlock,
      academicFormBlock,
      studentFormBlock
    ]
  },
  animation: {
    name: 'tabsFlowAnimation',
    params: {padding: 15, speed: 850}
  }
});

signupTabs.content.items[0].appendChild(clientForm.ref);
signupTabs.content.items[1].appendChild(execForm.ref);

signupTabs.header.items.forEach(item => radialGradientOnHover(item, {padding: 15}));

module.exports = signupTabs;
},{"../forms":32,"csp-app/libs/misc/button-effects/radialGradientOnHover":59,"csp-app/libs/tabs":66,"csp-app/libs/utilities":67}],37:[function(require,module,exports){
const Test = {
    html: `
        <div id="test">
            <h1>This is Test component</h1>
        </div>
    `,
    instantiate: function() {
        const temp = document.createElement('div');
        temp.innerHTML = this.html;
        const element = temp.firstElementChild
        
        return {
            element: element,
            render: function(DOMTree) {
                element.innerHTML = '';
                element.appendChild(DOMTree);
            }
        }
    }
};

module.exports = Test.instantiate();
},{}],38:[function(require,module,exports){
const {
  AllUsersTabComponent,
  FriendsTabComponent,
  IncomingRequestsTabComponent,
  OutgoingRequestsTabComponent
} = require('./tabs');
const {createElementFromHTML} = require('csp-app/libs/utilities');
const Tabs = require('csp-app/libs/tabs');

function UsersComponent() { 
  return Promise
    .all([
      AllUsersTabComponent(),
      FriendsTabComponent(),
      IncomingRequestsTabComponent(),
      OutgoingRequestsTabComponent()
    ])
    .then(([allUsersTab, friendsTab, IRTab, ORTab]) => {
      const tabs = new Tabs({
        header: {
          items: [
            {title: 'All users', tag: 'button'},
            {title: `Friends (${friendsTab.friendsAmount})`, tag: 'button'},
            {title: `Incoming requests (${IRTab.requestsAmount})`, tag: 'button'},
            {title: `Outgoing requests (${ORTab.requestsAmount})`, tag: 'button'}
          ]
        },
        content: {
          items: [
            allUsersTab.element,
            friendsTab.element,
            IRTab.element,
            ORTab.element
          ]
        },
        animation: {
          name: 'defaultAnim'
        }
      });
    
      const wrapper = createElementFromHTML('<div class="cmp_users"></div>');
    
      wrapper.appendChild(tabs.header.element);
      wrapper.appendChild(tabs.content.element);
    
      return {
        success: true,
        controller: {
          element: wrapper
        }
      };
    })
  ;
}

module.exports = UsersComponent;
},{"./tabs":50,"csp-app/libs/tabs":66,"csp-app/libs/utilities":67}],39:[function(require,module,exports){
const UserPageComponent = require('./user');

module.exports = {
  UserPageComponent
};
},{"./user":40}],40:[function(require,module,exports){
const http = require('csp-app/libs/http');
const {mainTemplate, blockMoreTemplate} = require('./templates');
const {createElementFromHTML} = require('csp-app/libs/utilities');

const friendsMsg = 'You are friends';
const friendReqSentMsg = 'You have sent a request to become a friend';

function insertSendFriendReqBtn(options) {
  const tplController = options.tplController;
  const userId = options.userId;

  const sendFriendReqBtn = createElementFromHTML(/*html*/`
    <button class="btn-primary">Add to friends</button>
  `);

  sendFriendReqBtn.addEventListener('click', () => {
    http.get(`users/send-friend-req/${userId}`)
      .then(res => {
        if (res.answer) {
          tplController.additional.innerHTML = friendReqSentMsg;
        }
      })
    ;
  });

  tplController.actionWrapper.appendChild(sendFriendReqBtn);
}

function insertBlockMore(options) {
  const tplController = options.tplController;
  const userId = options.userId;
  BMTplController = blockMoreTemplate();
          
  BMTplController.btnMore.addEventListener('click', () => {
    BMTplController.list.classList.toggle('no-display');
  });

  document.body.addEventListener('click', evt => {
    const isMoreBtn = evt.target.closest('.btn-more') === BMTplController.btnMore;
    const isMoreBlock = evt.target.closest('.more-list') === BMTplController.list;

    if (!isMoreBtn && !isMoreBlock) {
      BMTplController.list.classList.add('no-display');
    }
  });

  BMTplController.btnRemove.addEventListener('click', () => {
    http.get(`users/remove-from-friends/${userId}`)
      .then(res => {
        if (res.answer) {
          tplController.message.innerHTML = '';
          tplController.moreWrapper.innerHTML = '';
          insertSendFriendReqBtn({ tplController, userId });
        }
      })
    ;
  });

  tplController.moreWrapper.appendChild(BMTplController.root);
}

function UserPageComponent(userId) {
  return function() {
    return http.get(`users/getUserBase/${userId}`)
      .then(user => {
        if (Object.keys(user).length === 0) {
          return {
            success: false,
            error: 'User with the supplied id has not been found'
          };
        }

        return Promise.all([
          user,
          http.get(`users/me-friend-with/${userId}`),
          http.get(`users/me-sent-friend-req/${userId}`)
        ]);
      })
      .then(([user, isFriendObj, friendReq]) => {
        const tplController = mainTemplate(user);
        
        if (isFriendObj.answer) {
          tplController.message.textContent = friendsMsg;
          insertBlockMore({ tplController, userId });
        }
        else if (friendReq.requested && friendReq.amRequester) {
          tplController.message.textContent = friendReqSentMsg;
        }
        else if (friendReq.requested && !friendReq.amRequester) {
          const confirmFriendReqBtn = createElementFromHTML(/*html*/`
            <button class="btn-primary">Confirm you are friends</button>
          `);

          confirmFriendReqBtn.addEventListener('click', () => {
            http.get(`users/confirm-friend-req/${userId}`)
              .then(res => {
                if (res.answer) {
                  tplController.actionWrapper.innerHTML = '';
                  tplController.message.textContent = friendsMsg;
                  insertBlockMore({ tplController, userId });
                }
              })
            ;
          });

          tplController.actionWrapper.appendChild(confirmFriendReqBtn);
        }
        else {
          insertSendFriendReqBtn({ tplController, userId });
        }
        
        return {
          success: true,
          controller: {
            element: tplController.root
          }
        };
      })
    ;
  };
}

module.exports = UserPageComponent;
},{"./templates":42,"csp-app/libs/http":58,"csp-app/libs/utilities":67}],41:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function blockMore() {
  const html = /*html*/`
    <div class="more">
      <button class="btn-more"><i class="i i-more"></i></button>
      <div class="more-list block-shadowed no-display">
        <ul>
          <li><button class="remove">Remove user from friends</button></li>
        </ul>
      </div>
    </div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element,
    list: element.querySelector('.more-list'),
    btnMore: element.querySelector('.btn-more'),
    btnRemove: element.querySelector('.remove')
  };
}

module.exports = blockMore;
},{"csp-app/libs/utilities":67}],42:[function(require,module,exports){
const mainTemplate = require('./tpl');
const blockMoreTemplate = require('./block-more.tpl');

module.exports = {
  mainTemplate,
  blockMoreTemplate
};
},{"./block-more.tpl":41,"./tpl":43}],43:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(user) {
  const html = /*html*/`
    <div class="cmp_user-page block-shadowed">
      <div class="header">
        <div class="title"><h1>${user.first_name} ${user.last_name}</h1></div>
        <div class="additional">
          <div class="message"></div>
          <div class="btn-action-wrapper"></div>
          <div class="more-wrapper"></div>
        </div>
      </div>
      
      <div class="body">
        <div class="item">First name: ${user.first_name}</div>
        <div class="item">Second name: ${user.last_name}</div>
        <div class="item">Patronymic: ${user.patronymic}</div>
        <div class="item">Username: ${user.username}</div>
        <div class="item">Email: ${user.email}</div>
      </div>
    </div>
  `;
  const el = createElementFromHTML(html);

  return {
    root: el,
    additional: el.querySelector('.additional'),
    body: el.querySelector('.body'),
    message: el.querySelector('.message'),
    actionWrapper: el.querySelector('.btn-action-wrapper'),
    moreWrapper: el.querySelector('.more-wrapper')
  };
}

module.exports = template;
},{"csp-app/libs/utilities":67}],44:[function(require,module,exports){
const http = require('csp-app/libs/http');
const tabTemplate = require('../common/tab.tpl');
const createUsersList = require('../common/createUsersList');

function FriendsTabComponent() {
  return http.get('users/getAllFriendsBase')
    .then(friends => {
      const element = tabTemplate({
        className: 'tab-allfriends',
        onListEmpty: {
          empty: friends.length == 0,
          message: 'You have no friends yet'
        }
      });

      if (friends.length > 0) {
        friendsElements = createUsersList(friends);
        friendsElements.forEach(el => element.root.appendChild(el.root));
      }

      return {
        element: element.root,
        friendsAmount: friends.length
      };
    })
  ;
}

module.exports = FriendsTabComponent;
},{"../common/createUsersList":46,"../common/tab.tpl":47,"csp-app/libs/http":58}],45:[function(require,module,exports){
const http = require('csp-app/libs/http');
const tabTemplate = require('../common/tab.tpl');
const createUsersList = require('../common/createUsersList');

function AllUsersTabComponent() {
  return http.get('users/getAllOtherUsersBase')
    .then(users => {
      const element = tabTemplate({
        className: 'tab-allusers',
        onListEmpty: {
          empty: users.length == 0,
          message: 'No one apart from you has registered on the site'
        }
      });

      if (users.length > 0) {
        usersElements = createUsersList(users);
        usersElements.forEach(el => element.root.appendChild(el.root));
      }

      return {
        element: element.root
      };
    })
  ;
}

module.exports = AllUsersTabComponent;
},{"../common/createUsersList":46,"../common/tab.tpl":47,"csp-app/libs/http":58}],46:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');
const userItemTemplate = require('./userItem.tpl');

function createUsersList(users) {
  return users.map(user => {
    const userAccountLink = createElementFromHTML(/*html*/`
      <a data-route="users/${user.id}">${user.username}</a>
    `);
    const userItem = userItemTemplate();
    userItem.username.appendChild(userAccountLink);
    return userItem;
  });
}

module.exports = createUsersList;
},{"./userItem.tpl":48,"csp-app/libs/utilities":67}],47:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function alertOnEmpty(message) {
  return /*html*/`
    <div class="empty">${ message }</div>
  `;
}

function tabTemplate(options) {
  const html = /*html*/`
    <div class="${ options.className }">
      ${
        options.onListEmpty && options.onListEmpty.empty ?
        alertOnEmpty(options.onListEmpty.message) :
        ''
      }
    </div>
  `;
  const el = createElementFromHTML(html);

  return {
    root: el
  };
}

module.exports = tabTemplate;
},{"csp-app/libs/utilities":67}],48:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function userItemTemplate() {
  const html = /*html*/`
    <div class="user-item">
      <div class="avatar"></div>
      <div class="username"></div>
    </div>
  `;
  const el = createElementFromHTML(html);

  return {
    root: el,
    avatar: el.querySelector('.avatar'),
    username: el.querySelector('.username')
  };
}

module.exports = userItemTemplate;
},{"csp-app/libs/utilities":67}],49:[function(require,module,exports){
const http = require('csp-app/libs/http');
const tabTemplate = require('../common/tab.tpl');
const createUsersList = require('../common/createUsersList');

function IncomingRequestsTabComponent() {
  return http.get('users/getAllIncomingRequests')
    .then(requesters => {
      const element = tabTemplate({
        className: 'tab-allIncReqs',
        onListEmpty: {
          empty: requesters.length == 0,
          message: 'No incoming requests sent yet'
        }
      });

      if (requesters.length > 0) {
        requestersElements = createUsersList(requesters);
        requestersElements.forEach(el => element.root.appendChild(el.root));
      }

      return {
        element: element.root,
        requestsAmount: requesters.length
      };
    })
  ;
}

module.exports = IncomingRequestsTabComponent;
},{"../common/createUsersList":46,"../common/tab.tpl":47,"csp-app/libs/http":58}],50:[function(require,module,exports){
const AllUsersTabComponent = require('./all-users');
const FriendsTabComponent = require('./all-friends')
const IncomingRequestsTabComponent = require('./incoming-requests');
const OutgoingRequestsTabComponent = require('./outgoing-requests');

module.exports = {
  AllUsersTabComponent,
  FriendsTabComponent,
  IncomingRequestsTabComponent,
  OutgoingRequestsTabComponent
};
},{"./all-friends":44,"./all-users":45,"./incoming-requests":49,"./outgoing-requests":51}],51:[function(require,module,exports){
const http = require('csp-app/libs/http');
const tabTemplate = require('../common/tab.tpl');
const createUsersList = require('../common/createUsersList');

function OutgoingRequestsTabComponent() {
  return http.get('users/getAllOutgoingRequests')
    .then(requestees => {
      const element = tabTemplate({
        className: 'tab-allIncReqs',
        onListEmpty: {
          empty: requestees.length == 0,
          message: 'No outgoing requests sent yet'
        }
      });

      if (requestees.length > 0) {
        requesteesElements = createUsersList(requestees);
        requesteesElements.forEach(el => element.root.appendChild(el.root));
      }

      return {
        element: element.root,
        requestsAmount: requestees.length
      };
    })
  ;
}

module.exports = OutgoingRequestsTabComponent;
},{"../common/createUsersList":46,"../common/tab.tpl":47,"csp-app/libs/http":58}],52:[function(require,module,exports){
const http = require('csp-app/libs/http');
const template = require('./tpl');

const VerificationComponent = function() {
  const queryParams = new URLSearchParams(window.location.search);
  const userId = queryParams.get('id');
  const token = queryParams.get('token');
  const tplController = template();
  let errors = [];

  if (!userId) {
    errors.push('user id');
  }

  if (!token) {
    errors.push('token');
  }

  if (errors.length > 0) {
    const message = `You did not supply ${ errors.join(' and ') }`;
    tplController.parts.infoWrapper.textContent = message;
  }

  tplController.parts.spinnerWrapper.textContent = 'Loading...';

  const httpGet = http.get('auth/verify' + window.location.search)
  const spinnerPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      tplController.parts.spinnerWrapper.innerHTML = '';
      resolve();
    }, 3000);
  });

  Promise.all([httpGet, spinnerPromise])
    .then(arr => arr[0])
    .then((res) => {
      let message;

      if (res.success) {
        message = 'Your account has been successfully verified. You will be redirected to the dashboard in 3 seconds';
      }
      else {
        switch(res.error.type) {
          case 'no_user':
            message = 'User with the specified id does not exist';
            break;
          case 'verified':
            message = 'User has already been verified';
            break;
          case 'not_found':
            message = 'No verification token was found for this username or user with the supplied username does not exist';
            break;
          case 'no_match':
            message = 'Tokens do not match';
            break;
          case 'expired':
            message = 'Token has been expired';
            const button = document.createElement('button');
            button.textContent = 'Send verification token';
            tplController.parts.sendTokenButtonWrapper.appendChild(button);
            button.addEventListener('click', () => {
              http.get(`auth/verify/send-verification-token?id=${userId}`)
                .then((res) => {
                  let message;

                  if (res.success) {
                    message = 'You have been successfully sent new verification token';
                    tplController.parts.sendTokenInfoWrapper.textContent = message;
                  }
                  else {
                    tplController.parts.sendTokenInfoWrapper.textContent = res.error.message;
                  }
                })
              ;
            });
            break;
          default:
            message = res.error.message;
            break;
        }
      }

      tplController.parts.infoWrapper.textContent = message;
    })
  ;

  return {
    element: tplController.element
  };
};


module.exports = VerificationComponent;
},{"./tpl":53,"csp-app/libs/http":58}],53:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(data) {
  const html = /*html*/`
    <div class="cmp_verif">
      <div class="spinner-wr"></div>
      <div class="info-wr"></div>
      <div class="sendtoken-wr">
        <div class="sendtoken-info"></div>
        <div class="sendtoken-button-wr"></div>
      </div>
    </div>
  `;

  const element = createElementFromHTML(html);

  return {
    element: element,
    parts: {
      spinnerWrapper: element.querySelector('.spinner-wr'),
      infoWrapper: element.querySelector('.info-wr'),
      sendTokenInfoWrapper: element.querySelector('.sendtoken-info'),
      sendTokenButtonWrapper: element.querySelector('.sendtoken-button-wr')
    }
  };
}

module.exports = template;
},{"csp-app/libs/utilities":67}],54:[function(require,module,exports){
const FormControl = require('./FormControl');

const validate = function(validator, form) {
  let items = form.errors.items;
  let values = validator.controls.map(ctrl => ctrl.value);
  let result = validator.handler(values);
  if (!result.valid && !items[validator.name]) {
    let element = document.createElement('li');
    element.innerHTML = result.message;
    items[validator.name] = {
      ref: element
    };
    form.errors.ref.appendChild(element);
    return;
  }
  if (result.valid && items[validator.name]) {
    items[validator.name].ref.remove();
    items[validator.name] = null;
  }
};

const Form = function(options) {
  const formControls = options.controls.map(ctrl => new FormControl(ctrl));
  let validators = options.validators || [];
  let wrapper = document.createElement('form');
  let errorsWrapper = document.createElement('div');
  let submitWrapper = document.createElement('div');
  let formControlsRefs = formControls.map(ctrl => ctrl.ref);
  errorsWrapper.className = 'errors';
  submitWrapper.className = 'actions';
  submitWrapper.innerHTML = '<input type="submit" value="Submit" />';
  submitRef = submitWrapper.querySelector('input[type="submit"]');

  [
    errorsWrapper,
    ...formControlsRefs,
    submitWrapper
  ].forEach(item => wrapper.appendChild(item));
  
  let form = {
    ref: wrapper,
    errors: {
      ref: errorsWrapper,
      items: {}
    },
    controls: formControls,
    submit: {
      handler: options.submit.handler
    }
  };

  options.validators.forEach(validator => {
    validator.controls.forEach(control => {
      control.addEventListener('input', () => {
        validate(validator, form);
      });
    });
  });

  submitRef.addEventListener('click', evt => {
    evt.preventDefault();
    let errorsAmount = 0;
    validators.forEach(validator => validate(validator, form));
    form.controls.forEach(ctrl => ctrl.validate());
    Object.values(form.errors.items).forEach(val => {
      if (!!val) {
        errorsAmount++;
      }
    });
    form.controls.forEach(ctrl => {
      Object.values(ctrl.errors.items).forEach(val => {
        if (!!val) {
          errorsAmount++;
        }
      });
    });
    if (errorsAmount > 0) {
      console.log('Form is not valid');
      return;
    }
    let values = {};
    form.controls.forEach(ctrl => {
      values[ctrl.keyName] = ctrl.value;
    });
    form.submit.handler(values, evt);
  });

  return form;
};

module.exports = Form;
},{"./FormControl":55}],55:[function(require,module,exports){
const validate = function(control) {
  control = control || this;
  let add = {};
  let remove = {};
  let items = control.errors.items;
  let validators = control.validators;

  if (!control.required && control.value === '') {
    Object.keys(items).forEach(item => {
      if (!!items[item]) remove[item] = true;
    });
  }

  if (control.required && control.value === '') {
    if (!items['required']) {
      let element = document.createElement('li');
      element.innerHTML = 'This field is required';
      items['required'] = {
        ref: element
      }
      control.errors.ref.appendChild(element);
    }
  }

  if (control.value.length > 0 && !!items['required']) {
    remove['required'] = true;
  }

  if (control.value !== '') {
    validators.forEach(validator => {
      let result = validator.handler(control.value, control);
      if (!result.valid && !items[validator.name]) {
        add[validator.name] = result;
        return;
      }
      if (result.valid && items[validator.name]) {
        remove[validator.name] = true;
      }
    });
  }

  Object.keys(add).forEach(error => {
    let element = document.createElement('li');
    element.innerHTML = add[error].message;
    items[error] = {
      ref: element
    };
    control.errors.ref.appendChild(element);
  });

  Object.keys(remove).forEach(error => {
    items[error].ref.remove();
    items[error] = null;
  });
};

const bindErrorHandling = function(control) {
  control.controlRef.addEventListener('input', () => {
    validate(control);
  });
};

const tagInput = function(options) {
  let prepend = options.prepend || '';
  let append = options.append || '';
  let label =
    options.label ?
    `<label for="${options.id}">${options.label}</label>` :
    '';
  let errors = options.errors;
  let errorsPosition =
    errors && errors.position ?
    errors && errors.position :
    'beforeAppend';
  let errorsClass =
    errors && errors.class ?
    errors && errors.class :
    'errors'
  let errorsHTML = `<div class="${errorsClass}"></div>`;
  let controlHTML = '<input>';
  let html;
  
  switch (errorsPosition) {
    case 'beforePrepend':
      html = errorsHTML + prepend + label + controlHTML + append;
      break;
    case 'beforeLabel':
      html = prepend + errorsHTML + label + controlHTML + append;
      break;
    case 'beforeControl':
      html = prepend + label + errorsHTML + controlHTML + append;
      break;
    case 'beforeAppend':
      html = prepend + label + controlHTML + errorsHTML + append;
      break;
    case 'afterAppend':
      html = prepend + label + controlHTML + append + errorsHTML;
      break;
  }

  let controlId = 'input'; // to identify it in the DOM when it's rendered
  let errorsId = errorsClass; // for this too

  let wrapper = document.createElement('div');
  wrapper.className = (options.wrapper && options.wrapper.class) || '';
  wrapper.innerHTML = html;
  let controlRef = wrapper.querySelector(controlId);
  let errorsRef = wrapper.querySelector('.'+errorsId);

  if (options.attributes) {
    options.attributes.forEach(attr => {
      controlRef.setAttribute(attr.name, attr.value);
    });
  }

  let control = {
    keyName: options.keyName || '',
    ref: wrapper,
    controlRef: controlRef,
    errors: {
      ref: errorsRef,
      items: {}
    },
    required: options.required || false,
    valid: null,
    validators: options.validators || [],
    validate: validate
  };

  bindErrorHandling(control);

  if (options.handlersObjs) {
    let events = {};
    let handlersObjs = options.handlers;
    handlersObjs.forEach(obj => {
      if (!events[obj.event]) {
        events[obj.event] = [];
      }
      events[obj.event].push(obj.handler);
    });
    Object.keys(events).forEach(eventName => {
      control.controlRef.addEventListener(eventName, evt => {
        events[eventName].forEach(handler => handler(evt));
      });
    });
  }

  Object.defineProperty(control, 'value', {
    get: function() {return this.controlRef.value},
    set: function(newValue) {this.controlRef.value = newValue}
  })

  return control;
};

const getHandler = function(tag) {
  let fn;
  // Switch seems to be faster than object look up
  // Search for 'js switch vs object'
  switch(tag) {
    case 'input':
      fn = tagInput;
      break;
  }
  return fn;
};

const FormControl = function(options) {
  return getHandler(options.tag)(options)
};

module.exports = FormControl;
},{}],56:[function(require,module,exports){
const Form = require('./Form');

module.exports = Form;
},{"./Form":54}],57:[function(require,module,exports){
const minLength = function(value, control) {
  return {
    valid: value.length >= 5,
    message: 'This fields\'s length is less than 5 chars'
  }
};

const maxLength = function(value, control) {
  return {
    valid: value.length <= 10,
    message: 'This fields\'s length is greater than 10 chars'
  }
};

const startsWithNumber = function(value, control) {
  return {
    valid: !/^\d+/i.test(value),
    message: 'Username must not start with numbers'
  }
};

module.exports = {
  minLength,
  maxLength,
  startsWithNumber
};
},{}],58:[function(require,module,exports){
function configure(options) {
  let location = options.location;
  location = location[location.length-1] === '/' ?
    location :
    location + '/';
  
  this.location = location;
}

function getCorrectUrl(url) {
  url = url[0] === '/' ?
    url.slice(1) :
    url;

  return url;
}

function setAuthorizationHeader(xhr) {
  const token = window.localStorage.getItem('auth_token');

  if (token) {
    xhr.setRequestHeader('authorization', `Bearer ${token}`);
  }
}

function get(url, options) {
  return this.makeRequest('GET', url, null, options);
}

function post(url, body, options) {
  return this.makeRequest('POST', url, body, options);
}

function makeRequest(method, url, body, options) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    url = this.getCorrectUrl(url);

    xhr.open(method, this.location + url);

    if (method == 'POST') {
      xhr.setRequestHeader(
        'Content-Type',
        (options && options.contentType) || this.contentTypes.json
      );
    }

    // Each time along with the request we send auth_token if it exists
    this.setAuthorizationHeader(xhr);

    xhr.addEventListener('load', () => {
      const isJson = xhr.getResponseHeader('Content-Type').match(this.contentTypes.json);
      const response = isJson ?
        JSON.parse(xhr.responseText) :
        xhr.responseText;

      resolve(response);
    });

    xhr.addEventListener('error', function() {
      reject('Network error occured');
    });

    if (method == 'GET') {
      xhr.send();
      return;
    }

    if (method == 'POST') {
      xhr.send(JSON.stringify(body));
      return;
    }
  });
}

module.exports = {
  location: null,
  getCorrectUrl: getCorrectUrl,
  configure: configure,
  setAuthorizationHeader: setAuthorizationHeader,
  contentTypes: {
    json: 'application/json'
  },
  makeRequest: makeRequest,
  get: get,
  post: post
};
},{}],59:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

const radialGradientOnHover = function(btn, opts) {
  const text = btn.innerHTML;
  const wrapper = createElementFromHTML(/*html*/`
    <div class="rg-btn">
      <span>${text}</span>
    </div>
  `);
  btn.innerHTML = '';
  btn.style.padding = 0;

  if (Number.isInteger(opts.padding)) {
    wrapper.style.padding = opts.padding + 'px';
  }
  else if (opts.padding instanceof Array) {
    if (opts.padding.length == 2) {
      wrapper.style.paddingTop = wrapper.style.paddingBottom = opts.padding[0] + 'px';
      wrapper.style.paddingLeft = wrapper.style.paddingRight = opts.padding[1] + 'px';
    }
  }

  btn.appendChild(wrapper);

  btn.addEventListener('mousemove', evt => {
    const coordinates = evt.target.getBoundingClientRect();
    const x = evt.clientX - coordinates.left;
    const y = evt.clientY - coordinates.top;
    evt.target.style.setProperty('--x', `${ x }px`);
    evt.target.style.setProperty('--y', `${ y }px`);
  });
};

module.exports = radialGradientOnHover;
},{"csp-app/libs/utilities":67}],60:[function(require,module,exports){
const Router = function() {
  this.routes = [];
};

Router.prototype.regexpParams = /(\(:([\w\d\-_]+)\))/gi;

Router.prototype.trimRoute = function(route) {
  route = route[0] === '/'
    ? route.substr(1)
    : route;

  route = route[route.length - 1] === '/'
    ? route.substr(0, route.length - 1)
    : route;

  return route;
},

Router.prototype.getParamsNames = function(route) {
  let result;
  let paramsNames = [];
  while ((result = this.regexpParams.exec(route)) !== null) {
    paramsNames.push(result[2]);
  }
  return paramsNames;
}

Router.prototype.addRoute = function(route, obj) {
  route = this.trimRoute(route);
  let paramsNames = this.getParamsNames(route);
  let regexpStr = route.replace(this.regexpParams, '([\\w\\d\-_]+)');
  let regexp = RegExp(`^${regexpStr}(\\/|$)`, 'gi');

  let routeObj = {
    type: 'route',
    regexp: regexp,
    paramsNames: paramsNames
  };

  if (typeof obj === 'function') {
    /**
     * Route handler will be invoked when user goes to the corresponding
     * route and not terminated by middlewares underway
     * @function handler
     * @param {object} handlerParams - params may be given when Router.navigate is invoked
     * @param {object} routeParams - params existing on the route if any
     * @param {any} arg - this is given by the last middleware if any
     */
    routeObj.handler = obj;
  }

  else if (obj instanceof Array) {
    routeObj.children = obj;
  }

  else {
    console.log('Error occured while adding route');
    throw new Error('route error');
  }

  this.routes.push(routeObj);
  return this;
};

Router.prototype.getRoute = function(link, routes = this.routes) {
  link = link === '' ? '/' : link;
  let middlewares = [];
  let params = {};

  for (let i = 0; i < routes.length, route = routes[i]; i++) {
    if (route.type == 'middleware') {
      middlewares.push(route.fn);
      continue;
    }

    if (route.type == 'routes') {
      const childrenCheck = this.getRoute(link, route.routes);
      if (childrenCheck !== null) {
        childrenCheck.middlewares = middlewares.concat(childrenCheck.middlewares);
        childrenCheck.params = Object.assign(params, childrenCheck.params);
        return childrenCheck;
      }
      continue;
    }

    let regexp = route.regexp;
    let result = regexp.exec(link);
    let newLink;

    if (result && result.length > 1) {
      params = {};
      for (let idx = 1; idx < result.length - 1; idx++) {
        params[route.paramsNames[idx-1]] = result[idx];
      }
    }

    if (regexp.lastIndex > 0) {
      newLink = link.substr(regexp.lastIndex);
    }

    if (regexp.lastIndex > 0 && newLink.length > 0) {
      regexp.lastIndex = 0;
      if (route.children && route.children.length > 0) {
        let childrenCheck = this.getRoute(newLink, route.children);
        if (childrenCheck !== null) {
          childrenCheck.middlewares = middlewares.concat(childrenCheck.middlewares);
          childrenCheck.params = Object.assign(params, childrenCheck.params);
          return childrenCheck;
        }
      }
    }
    
    // In case it's terminal route
    else if (regexp.lastIndex > 0) {
      regexp.lastIndex = 0;
      if (route.handler) {
        return {
          handler: route.handler,
          params: params,
          middlewares: middlewares
        };
      }
      
      // Since it's done and link is (actually, will be when we
      // get into recursion) '/', so we look up children to
      // to match the root '/' which must exist there
      if (route.children) {
        regexp.lastIndex = 0;
        let childrenCheck = this.getRoute(newLink, route.children);
        if (childrenCheck !== null) {
          childrenCheck.middlewares = middlewares.concat(childrenCheck.middlewares);
          childrenCheck.params = Object.assign(params, childrenCheck.params);
          return childrenCheck;
        }
      }
    }
  }
  return null;
};

Router.prototype.addRoutes = function(routes) {
  this.routes.push({
    type: 'routes',
    routes: routes
  });

  return this;
};

Router.prototype.addMiddleware = function(fn) {
  this.routes.push({
    type: 'middleware',
    fn: fn
  });

  return this;
};

Router.prototype.navigate = function(link, handlerParams) {
  link = this.trimRoute(link);
  let route = this.getRoute(link);
  if (!route) {
    console.error('No suitable route has been found!');
    return;
  }
  
  fns = route.middlewares.concat([route.handler.bind(null, handlerParams)]);
  for (let i = fns.length - 1; i > 0, fn = fns[i]; i--) {
    if (i !== fns.length - 1) {
      fns[i] = fn.bind(null, fns[i+1], route.params);
    }
    else {
      fns[i] = fn.bind(null, route.params);
    }
  }
  fns[0]();
  history.pushState('', '', '/' + link);
};

Router.prototype.testNav = function(link, handlerParams) {
  link = this.trimRoute(link);
  let route = this.getRoute(link);
  if (!route) {
    console.log('No suitable route has been found')
    return;
  }
  // console.log(route);
  fns = route.middlewares.concat([route.handler.bind(null, handlerParams)]);
  for (let i = fns.length - 1; i > 0, fn = fns[i]; i--) {
    if (i !== fns.length - 1) {
      fns[i] = fn.bind(null, fns[i+1], route.params);
    }
    else {
      fns[i] = fn.bind(null, route.params);
    }
  }
  // console.log(fns)
  fns[0]();
};

const Subrouter = function() {
  this.routes = [];
};
Subrouter.prototype = Router.prototype;
Router.Subrouter = Subrouter;

module.exports = Router;
},{}],61:[function(require,module,exports){
const tags = ['div', 'span', 'button'];

const HeaderItem = function(opts) {
  const title = opts.title || '';
  const className = opts.className || '';
  const tag = tags.find(tag => tag === opts.tag) ?
    opts.tag :
    'span';

  const headerItem = document.createElement(tag);
  headerItem.className = 'tabs-header-item ' + className;
  headerItem.innerHTML = title;

  if (opts.attributes) {
    opts.attributes.forEach(attr => {
      headerItem.setAttribute(attr.name, attr.value);
    });
  }

  return {
    element: headerItem
  };
};

module.exports = HeaderItem;
},{}],62:[function(require,module,exports){
const defaultAnim = function() {
  function handler(evt) {
    const tab = evt.target.closest('.tabs-header-item').dataset.order;
    this.gotoTab(tab);
  }

  function gotoTab(tab) {
    tab--;
    const newHeaderItem = this.header.items[tab];
    const newContentItem = this.content.items[tab];

    this.active.headerItem.classList.remove('active');
    this.active.contentItem.classList.remove('active');
    this.active.contentItem.classList.add('hidden');

    newHeaderItem.classList.add('active');
    newContentItem.classList.remove('hidden');
    newContentItem.classList.add('active');

    this.active.headerItem = newHeaderItem;
    this.active.contentItem = newContentItem;
  }

  function initialize(tab) {
    tab;
    const activeHeaderItem = this.header.items[tab];
    const activeContentItem = this.content.items[tab];
    const nonActiveContentItems = this.content.items.filter(item => item !== activeContentItem);

    activeHeaderItem.classList.add('active');
    activeContentItem.classList.add('active');

    nonActiveContentItems.forEach(item => item.classList.add('hidden'));

    this.active.headerItem = activeHeaderItem;
    this.active.contentItem = activeContentItem;
  }

  return {
    handler,
    gotoTab,
    initialize
  };
};

module.exports = defaultAnim;
},{}],63:[function(require,module,exports){
const setContentItemsWidths = function(options, animParams) {
  const controller = options.controller || {};
  const newOrder = options.newOrder;
  const setForNewOrder = options.setForNewOrder || false;
  const items = controller.content.items;
  const len = items.length;
  const width = controller.content.element.clientWidth;

  for (let i = 0; i < len, item = items[i]; i++) {
    if (setForNewOrder || item !== items[newOrder]) {
      item.style.width = (width - 2*animParams.padding) + 'px';
    }
  }
};

const setContentItemsPositions = function(options) {
  const controller = options.controller || {};
  const newOrder = options.newOrder;
  const setForNewOrder = options.setForNewOrder || false;
  const items = controller.content.items;
  const len = items.length;
  const width = controller.content.element.clientWidth;

  for (let i = 0; i < len, item = items[i]; i++) {
    if (setForNewOrder || item !== items[newOrder]) {
      item.style.transform = `translateX(${(i-newOrder)*width}px)`;
    }
  }
};

const setContentItemsDisplay = function(opts) {
  const contentItems = opts.controller.content.items;
  const display = opts.display;
  const newOrder = opts.newOrder;
  const setForNewOrder = opts.setForNewOrder;

  for (let i = 0; i < contentItems.length, ci = contentItems[i]; i++) {
    if (setForNewOrder || ci !== contentItems[newOrder]) {
      ci.style.display = display;
    }
  }
};

const TabsFlowAnimation = function() {
  let params;

  function handler(evt) {
    if (this.active.working) return;
    this.active.working = true;
    // HI stands for Header Item
    // CI stands for Content Item
    const newHI = evt.target.closest('.tabs-header-item');
    const order = +newHI.dataset.order - 1;
    const newCI = this.content.items[order];
    const speed = params.speed;
    const oldOrder = +this.active.headerItem.dataset.order - 1;

    setContentItemsPositions({controller: this, newOrder: oldOrder, setForNewOrder: false});
    setContentItemsDisplay({controller: this, newOrder: order, setForNewOrder: true, display: 'block'});
    newHI.classList.add('active');
    this.active.headerItem.classList.remove('active');
    this.content.element.style.height = this.active.contentItem.clientHeight + 'px';
    this.content.element.style.transitionDuration = speed + 'ms';
    this.content.element.style.height = newCI.clientHeight + 'px';

    this.active.contentItem.style.position = 'absolute';
    this.active.contentItem.style.top = params.padding + 'px';
    this.active.contentItem.style.left = params.padding + 'px';

    this.content.items.forEach(item => item.style.transitionDuration = speed + 'ms');

    setContentItemsWidths({controller: this, newOrder: order, setForNewOrder: true}, params);
    setContentItemsPositions({controller: this, newOrder: order, setForNewOrder: true});
    
    setTimeout(() => {
      newCI.style.position = 'static';
      newCI.style.width = 'auto';
      this.content.element.style.height = 'auto';
      this.content.items.forEach(item => item.style.transitionDuration = '0ms');
      this.content.element.style.transitionDuration = '0ms';
      this.active.headerItem = newHI;
      this.active.contentItem = newCI;
      this.active.working = false;
      setContentItemsDisplay({
        controller: this,
        newOrder: order,
        setForNewOrder: false,
        display: 'none'
      });
    }, speed);
  }

  function gotoTab(tab) {

  }

  function initialize(tab, animOptions) {
    params = animOptions || {};
    // Add classes
    this.content.element.classList.add('tabs-flow-content');
    this.content.items.forEach(item => item.classList.add('tabs-flow-CI'));
    
    // Set individual CSS
    const CIs = this.content.items;
    for (let i = 0; i < CIs.length, item = CIs[i]; i++) {
      if (i !== tab) {
        CIs[i].style.position = 'absolute';    
        CIs[i].style.top = params.padding + 'px';
        CIs[i].style.display = 'none';
      }
    }
    this.header.items[tab].classList.add('active');

    // Set active object
    this.active.headerItem = this.header.items[tab];
    this.active.contentItem = this.content.items[tab];

    // Add on resizing event handler
    const newOrder = +this.active.headerItem.dataset.order - 1;
    window.addEventListener('resize', () => {
      const newOrder = +controller.active.headerItem.dataset.order - 1;
      const options = {controller: this, newOrder: newOrder};
      if (this.active.working) {
        setContentItemsWidths(options, params);
      }
      else {
        setContentItemsWidths(options, params);
      }
      
      setContentItemsPositions(options)
    });

    setContentItemsDisplay({
      controller: this,
      newOrder: newOrder,
      setForNewOrder: false,
      display: 'none'
    });
  }

  return {
    handler,
    gotoTab,
    initialize
  };
};

module.exports = TabsFlowAnimation;
},{}],64:[function(require,module,exports){
const defaultAnim = require('./default');
const loginSignupSwitch = require('./loginSignupSwitch');
const tabsFlowAnimation = require('./flow');

module.exports = {
  defaultAnim,
  loginSignupSwitch,
  tabsFlowAnimation
};
},{"./default":62,"./flow":63,"./loginSignupSwitch":65}],65:[function(require,module,exports){
const loginSignupSwitch = function() {
  function handler(evt) {
    if (this.beingAnimated) {
      return;
    }
    this.beingAnimated = true;

    const oldHItem = this.active.headerItem;
    const oldCItem = this.active.contentItem;
    const newHItem = evt.target.closest('.tabs-header-item');
    const order = newHItem.dataset.order;
    const newCItem = this.content.items[order-1];

    oldHItem.classList.remove('loginSignup-HI-active');
    newHItem.classList.add('loginSignup-HI-active');

    oldCItem.classList.remove('loginSignup-CI-active');
    oldCItem.classList.add('loginSignup-CI-hiding');
    newCItem.classList.remove('loginSignup-CI-hidden');
    newCItem.classList.add('loginSignup-CI-activating');

    setTimeout(() => {
      oldCItem.classList.remove('loginSignup-CI-hiding');
      oldCItem.classList.add('loginSignup-CI-hidden');

      newCItem.classList.remove('loginSignup-CI-activating');
      newCItem.classList.add('loginSignup-CI-active');

      this.active.headerItem = newHItem;
      this.active.contentItem = newCItem;

      this.beingAnimated = false;
    }, 500);
  }

  function gotoTab(tab) {
    const newHeaderItem = this.header.items[tab];
    const newContentItem = this.content.items[tab];

    this.active.headerItem.classList.remove('loginSignup-HI-active');
    this.active.contentItem.classList.remove('loginSignu-CI-active');
    this.active.contentItem.classList.add('loginSignup-CI-hidden');

    newHeaderItem.classList.add('loginSignup-HI-active');
    newContentItem.classList.remove('loginSignup-CI-hidden');
    newContentItem.classList.add('loginSignup-CI-active');

    this.active.headerItem = newHeaderItem;
    this.active.contentItem = newContentItem;
  }

  function initialize(tab) {
    this.header.element.classList.add('loginSignup-header');
    this.content.element.classList.add('loginSignup-content');
    this.header.items.forEach(item => item.classList.add('loginSignup-HI'));
    this.content.items.forEach(item => item.classList.add('loginSignup-CI'));

    const activeHeaderItem = this.header.items[tab];
    const activeContentItem = this.content.items[tab];
    const nonActiveContentItems = this.content.items.filter(item => item !== activeContentItem);

    activeHeaderItem.classList.add('loginSignup-HI-active');
    activeContentItem.classList.add('loginSignup-CI-active');

    nonActiveContentItems.forEach(item => item.classList.add('loginSignup-CI-hidden'));

    this.active.headerItem = activeHeaderItem;
    this.active.contentItem = activeContentItem;
  }

  return {
    handler,
    gotoTab,
    initialize
  };
};

module.exports = loginSignupSwitch;
},{}],66:[function(require,module,exports){
const HeaderItem = require('./HeaderItem');
const anims = require('./animations');

const Tabs = function(opts) {
  const headerItems =
    opts.header.items.map(item => new HeaderItem(item).element) || [];
  const header = document.createElement('div');
  header.className = 'tabs-header ' + opts.header.className;
  headerItems.forEach(item => header.appendChild(item));

  for (let i = 0; i < headerItems.length; i++) {
    headerItems[i].dataset.order = i+1;
  }

  const content = document.createElement('div');
  content.className = 'tabs-content ' + (opts.content.className || '');
  const contentItems = opts.content.items || [];
  contentItems.forEach(item => {
    item.classList.add('tabs-content-item');
    content.appendChild(item);
  });

  const active = {
    headerItem: null,
    contentItem: null
  };

  const anim = anims[opts.animation.name] ?
    new anims[opts.animation.name] :
    new anims['defaultAnim'];

  const tabs = {
    header: {
      element: header,
      items: headerItems
    },
    content: {
      element: content,
      items: contentItems
    },
    active: active,
    gotoTab: anim.gotoTab,
    imitateClickOnTab: function(tab) {
      this.header.items[tab].click();
    }
  };
    
  header.addEventListener('click', evt => {
    const link = evt.target;
    const result = headerItems.find(item => item === link.closest('.tabs-header-item'));

    if (!result || result === tabs.active.headerItem) {
      return;
    }

    if (result) {
      anim.handler.call(tabs, evt);
    }
  });

  const initializer =
    opts.animation.initializer ?
    opts.animation.initializer - 1 :
    0;
  
  anim.initialize.call(tabs, initializer, opts.animation.params);

  return tabs;
};

module.exports = Tabs;
},{"./HeaderItem":61,"./animations":64}],67:[function(require,module,exports){
const createElementFromHTML = function(html) {
  const tempParent = document.createElement('div');
  tempParent.innerHTML = html;
  return tempParent.firstElementChild;
};

function Singleton(fn) {
  function Class() {
    if (Class.instance) {
      return Class.instance;
    }

    return Class.instance = fn();
  }

  Class.getInstance = function() {
    return Class.instance || new Class();
  };

  Class.destroy = function() {
    Class.instance = null;
  };

  return Class;
}

function range(start, end) {
  let arr = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

function sortNumbers(a, b) {
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}

module.exports = {
  createElementFromHTML,
  Singleton,
  range,
  sortNumbers
};
},{}],68:[function(require,module,exports){
const Root = require('csp-app/components/main/rootComponent');
const Dashboard = require('csp-app/components/dashboard');
const MainController = require('csp-app/components/main');
const {router} = MainController;

const Router = require('csp-app/libs/router');
const Start = require('csp-app/components/start');
const Test = require('csp-app/components/test')

// const router = new Router();
// MainController.router = router;
const http = require('csp-app/libs/http');

http.configure({ location: 'http://localhost:3000' });

const verificationRoute = require('csp-app/routes/auth/verification');
const rootHandler = require('csp-app/routes/root');
const {schedulerHandler, usersHandler, userHandler} = require('csp-app/routes/dashboard');

document.addEventListener('click', evt => {
    const link = evt.target.closest('a');

    if (link && link.dataset.route) {
        router.navigate(link.dataset.route);
    }
});

window.addEventListener('popstate', evt => {
    console.log('page changed: ', document.location);
    console.log(evt);
    router.navigate(document.location.pathname);
});

document.addEventListener('DOMContentLoaded', function(evt) {
    let path = window.location.pathname;
    const rootInstance = Root.create();
    MainController.initialize(rootInstance);

    router
        // .addRoute('/', function() {
        //     MainController.renderChain([Start])
        // })
        .addRoute('/', rootHandler)
        .addRoute('dashboard', function() {
            MainController.renderChain([Test])
        })
        .addRoute('login', function() {
            
        })
        .addRoute('signup/verify', verificationRoute)
        .addRoute('scheduler', schedulerHandler)
        .addRoute('users', usersHandler)
        .addRoute('users/(:id)', userHandler)
    
    router.navigate(path)
});
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/components/main/rootComponent":6,"csp-app/components/start":33,"csp-app/components/test":37,"csp-app/libs/http":58,"csp-app/libs/router":60,"csp-app/routes/auth/verification":69,"csp-app/routes/dashboard":70,"csp-app/routes/root":74}],69:[function(require,module,exports){
const {render} = require('csp-app/components/main');
const VerificationComponent = require('csp-app/groups/auth/verification');

function verification() {
  render([new VerificationComponent()]);
}

module.exports = verification;
},{"csp-app/components/main":5,"csp-app/groups/auth/verification":52}],70:[function(require,module,exports){
const schedulerHandler = require('./scheduler'); 
const usersHandler = require('./users');
const userHandler = require('./user');

module.exports = {
  schedulerHandler,
  usersHandler,
  userHandler
};
},{"./scheduler":71,"./user":72,"./users":73}],71:[function(require,module,exports){
const {render} = require('csp-app/components/main');
const Dashboard = require('csp-app/components/dashboard');
const SchedulerComponent = require('csp-app/components/scheduler');

const SchedulerHandler = function() {
  render([Dashboard, SchedulerComponent]);
};

module.exports = SchedulerHandler;
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/components/scheduler":17}],72:[function(require,module,exports){
const {render} = require('csp-app/components/main');
const Dashboard = require('csp-app/components/dashboard');
const {UserPageComponent} = require('csp-app/components/users/standalones');

const UserHandler = function(none, params) {
  render([Dashboard, UserPageComponent(params.id)]);
};

module.exports = UserHandler;
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/components/users/standalones":39}],73:[function(require,module,exports){
const {render} = require('csp-app/components/main');
const Dashboard = require('csp-app/components/dashboard');
const UsersComponent = require('csp-app/components/users');

const UsersHandler = function() {
  render([Dashboard, UsersComponent]);
};

module.exports = UsersHandler;
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/components/users":38}],74:[function(require,module,exports){
const http = require('csp-app/libs/http');
const {render} = require('csp-app/components/main');
const Start = require('csp-app/components/start');
const Dashboard = require('csp-app/components/dashboard');

const checkAuth = function(token) {
  return http
    .post('auth/authenticate', {token: token})
  ;
};

const rootHandler = async function() {
  const token = window.localStorage.getItem('auth_token') || null;
  const isAuthenticated = token ? (await checkAuth(token)).success : false;

  if (isAuthenticated) {
    render([Dashboard]);
  }
  else {
    render([Start]);
  }
};

module.exports = rootHandler;
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/components/start":33,"csp-app/libs/http":58}]},{},[68]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzb3VyY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IHRlbXBsYXRlID0gcmVxdWlyZSgnLi90cGwnKTtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuY29uc3Qge3JvdXRlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvbWFpbicpO1xuXG5jb25zdCBEYXNoYm9hcmQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGh0dHAuZ2V0KCcvdXNlcnMvZ2V0VXNlckRhdGEnKVxuICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgIGNvbnN0IGlkID0gcmVzLmRhdGEudXNlci5pZDtcbiAgICAgIGNvbnNvbGUubG9nKHJlcy5kYXRhKVxuXG4gICAgICBpZiAoIXJlcy5zdWNjZXNzKSB0aHJvdyBuZXcgRXJyb3IocmVzLmVycm9yKTtcblxuICAgICAgY29uc3QgdGVtcGxhdGVEYXRhID0ge1xuICAgICAgICB1c2VyOiByZXMuZGF0YS51c2VyXG4gICAgICB9O1xuXG4gICAgICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKHRlbXBsYXRlKHRlbXBsYXRlRGF0YSkpO1xuICAgICAgY29uc3QgYnRuID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcjbG9nLW91dCcpO1xuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2F1dGhfdG9rZW4nKTtcbiAgICAgICAgcm91dGVyLm5hdmlnYXRlKCcvJyk7XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHJvdXRlck91dGxlciA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnJvdXRlci1vdXRsZXQnKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjoge1xuICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnRcbiAgICAgICAgfSxcbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgcm91dGVyT3V0bGVyLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgIHJvdXRlck91dGxlci5hcHBlbmQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhc2hib2FyZDtcbn0se1wiLi90cGxcIjo0LFwiY3NwLWFwcC9jb21wb25lbnRzL21haW5cIjo1LFwiY3NwLWFwcC9saWJzL2h0dHBcIjo1OCxcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo2N31dLDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuXG59LHt9XSwzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbm1vZHVsZS5leHBvcnRzID0gLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJtZW51XCI+XG4gICAgPHVsPlxuICAgICAgPGxpPjxhIGRhdGEtcm91dGU9XCJcIj48aSBjbGFzcz1cImkgaS1zdXJ2ZXlcIj48L2k+PHNwYW4+U3VydmV5czwvc3Bhbj48L2E+PC9saT5cbiAgICAgIDxsaT48YSBkYXRhLXJvdXRlPVwidXNlcnNcIj48aSBjbGFzcz1cImkgaS11c2Vyc1wiPjwvaT48c3Bhbj5Vc2Vyczwvc3Bhbj48L2E+PC9saT5cbiAgICAgIDxsaT48YSBkYXRhLXJvdXRlPVwiXCI+PGkgY2xhc3M9XCJpIGktcHJvamVjdFwiPjwvaT48c3Bhbj5Qcm9qZWN0czwvc3Bhbj48L2E+PC9saT5cbiAgICAgIDxsaT48YSBkYXRhLXJvdXRlPVwic2NoZWR1bGVyXCI+PHNwYW4+U2NoZWR1bGVyPC9zcGFuPjwvYT48L2xpPlxuICAgIDwvdWw+XG4gIDwvZGl2PlxuYDtcbn0se31dLDQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qgc2lkZWJhckV4ZWMgPSByZXF1aXJlKCcuL3RlbXBsYXRlcy9zaWRlYmFyX2V4ZWMudHBsJyk7XG5jb25zdCBzaWRlYmFyQ2xpZW50ID0gcmVxdWlyZSgnLi90ZW1wbGF0ZXMvc2lkZWJhcl9jbGllbnQudHBsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGF0YSA9PiB7XG4gIGNvbnN0IGdyb3VwID0gZGF0YS51c2VyLmdyb3VwO1xuICBsZXQgc2lkZWJhcjtcblxuICBpZiAoWydhY2FkZW1pYycsICdzdHVkZW50JywgJ2V4dF9leGVjJywgbnVsbCwgdW5kZWZpbmVkXS5pbmNsdWRlcyhncm91cCkpIHtcbiAgICBzaWRlYmFyID0gc2lkZWJhckV4ZWM7XG4gIH1cblxuICBpZiAoZ3JvdXAgPT0gJ2NsaWVudCcpIHtcbiAgICBzaWRlYmFyID0gc2lkZWJhckNsaWVudDtcbiAgfVxuXG4gIHJldHVybiAvKmh0bWwqL2BcbiAgPGRpdiBjbGFzcz1cImNtcF9kYXNoYm9hcmRcIj5cbiAgICA8ZGl2IGNsYXNzPVwic2lkZWJhclwiPlxuICAgICAgPGRpdiBjbGFzcz1cImxvZ28tYmxvY2tcIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJsb2dvXCI+eyBDU1AgfTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICAkeyBzaWRlYmFyIH1cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwibWFpblwiPlxuICAgICAgPGRpdiBjbGFzcz1cImRib2FyZC1oZWFkZXJcIj48YnV0dG9uIGlkPVwibG9nLW91dFwiPkxvZyBvdXQ8L2J1dHRvbj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjb250ZW50XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJyb3V0ZXItb3V0bGV0XCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+YDtcbn07XG59LHtcIi4vdGVtcGxhdGVzL3NpZGViYXJfY2xpZW50LnRwbFwiOjIsXCIuL3RlbXBsYXRlcy9zaWRlYmFyX2V4ZWMudHBsXCI6M31dLDU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgUm91dGVyID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3JvdXRlcicpXG5cbmNvbnN0IGFwcCA9IHNlbGYgPSB7XG4gIHJvb3Q6IG51bGwsXG4gIHJvdXRlcjogbmV3IFJvdXRlcigpLFxuICBwYXRoOiBbXSxcbiAgcmVuZGVyQ2hhaW46IGZ1bmN0aW9uKGNvbXBvbmVudHMpIHtcbiAgICAvLyBQcm9taXNlIGlzIHJldHVybmVkXG4gICAgcmV0dXJuIGNvbXBvbmVudHMucmVkdWNlKChhY2N1bXVsYXRvciwgY29tcG9uZW50KSA9PiB7XG4gICAgICAvLyBBY2N1bXVsYXRvciBtYXkgbm90IG9ubHkgYmUgYSBQcm9taXNlIGJ1dCBpdCBjYW5cbiAgICAgIC8vIGFsc28gYmUgYSBwbGFpbiBqcyBvYmplY3QgKGFzIGlzIHdpdGggc2VsZi5yb290KVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhY2N1bXVsYXRvcilcbiAgICAgICAgLy8gQmVmb3JlIHdlIG1ha2Ugc3VyZSB0aGUgcHJldmlvdXMgY29tcG9uZW50IChpdCBpcyBub3cgYWNjdW11bGF0b3IpXG4gICAgICAgIC8vIGhhcyByZXNvbHZlZCwgd2UgZG8gbm90IGNyZWF0ZSB0aGUgY29tcG9uZW50IHRoYXQgZm9sbG93c1xuICAgICAgICAudGhlbihhY2N1bXVsYXRvciA9PiBQcm9taXNlLmFsbChbYWNjdW11bGF0b3IsIG5ldyBjb21wb25lbnQoKV0pKVxuICAgICAgICAudGhlbigoW2FjY3VtdWxhdG9yLCBjb21wb25lbnRdKSA9PiB7XG4gICAgICAgICAgaWYgKCFjb21wb25lbnQuc3VjY2VzcylcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh7Y29tcG9uZW50OiBjb21wb25lbnQuZXJyb3IsIGFjY3VtdWxhdG9yOiBhY2N1bXVsYXRvcn0pO1xuXG4gICAgICAgICAgYWNjdW11bGF0b3IucmVuZGVyKGNvbXBvbmVudC5jb250cm9sbGVyLmVsZW1lbnQpO1xuICAgICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgICAgIH0pXG4gICAgICA7XG4gICAgfSwgc2VsZi5yb290KVxuICAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcbiAgfSxcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ocm9vdEluc3RhbmNlKSB7XG4gICAgc2VsZi5yb290ID0gcm9vdEluc3RhbmNlO1xuICAgIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gJyc7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChyb290SW5zdGFuY2UucmVmZXJlbmNlKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbihjb21wb25lbnRzKSB7XG4gICAgcmV0dXJuIHNlbGYucmVuZGVyQ2hhaW4oY29tcG9uZW50cyk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXBwO1xufSx7XCJjc3AtYXBwL2xpYnMvcm91dGVyXCI6NjB9XSw2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IFJvb3QgPSB7XG4gICAgY29tcG9uZW50TmFtZTogJ2FwcCcsXG4gICAgaHRtbDogYDxkaXYgaWQ9XCJhcHBcIj48L2Rpdj5gLFxuICAgIGlkZW50aWZpZXI6ICcjYXBwJyxcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBDb25zaWRlciByZWltcGxlbWVudGluZyB3aXRoIEhUTUw1IHRlbXBsYXRlIGZlYXR1cmUgaW5zdGVhZCBqdXN0IHV0aWxpemluZyBkaXZcbiAgICAgICAgY29uc3QgdG1wRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0bXBFbGVtLmlubmVySFRNTCA9IHRoaXMuaHRtbDtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRtcEVsZW0uZmlyc3RDaGlsZDtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVmZXJlbmNlOiBlbGVtZW50LFxuICAgICAgICAgICAgcm91dGVyT3V0bGV0OiBlbGVtZW50LFxuICAgICAgICAgICAgY29tcG9uZW50TmFtZTogdGhpcy5jb21wb25lbnROYW1lLFxuICAgICAgICAgICAgc3RhdGU6IHt9LFxuICAgICAgICAgICAgYWN0aW9uczogKGZ1bmN0aW9uKHJvdXRlck91dGxldCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWQ6IGZ1bmN0aW9uKGZyYWdtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKGVsZW1lbnQpLFxuICAgICAgICAgICAgcmVuZGVyOiAoZnVuY3Rpb24ocm91dGVyT3V0bGV0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKERPTVRyZWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcm91dGVyT3V0bGV0LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuYXBwZW5kQ2hpbGQoRE9NVHJlZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoZWxlbWVudClcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUm9vdDtcbn0se31dLDc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgbW9kYWxTdGFuZGFyZCA9IHJlcXVpcmUoJy4vbW9kYWwtc3RhbmRhcmQnKTtcblxuZnVuY3Rpb24gTW9kYWwoKSB7XG4gIFxufVxuXG5Nb2RhbC5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBsZXQgbW9kYWxDbGFzcztcbiAgc3dpdGNoIChvcHRpb25zLnR5cGUpIHtcbiAgICBjYXNlICdzdGFuZGFyZCc6XG4gICAgICBtb2RhbENsYXNzID0gbW9kYWxTdGFuZGFyZDtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBtb2RhbENsYXNzID0gbW9kYWxTdGFuZGFyZDtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiBuZXcgbW9kYWxDbGFzcyhvcHRpb25zKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZGFsKCk7XG59LHtcIi4vbW9kYWwtc3RhbmRhcmRcIjo5fV0sODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBjYW5jZWwgPSB7XG4gIGlkOiAnY2FuY2VsJyxcbiAgdHlwZTogJ3NlY29uZGFyeScsXG4gIG9yZGVyOiAwLFxuICB0aXRsZTogJ0NhbmNlbCdcbn07XG5cbmNvbnN0IHN1Ym1pdCA9IHtcbiAgaWQ6ICdzdWJtaXQnLFxuICB0eXBlOiAncHJpbWFyeScsXG4gIG9yZGVyOiAxLFxuICB0aXRsZTogJ09LJ1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNhbmNlbCxcbiAgc3VibWl0XG59O1xufSx7fV0sOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdHBsJyk7XG5jb25zdCB7Y2FuY2VsLCBzdWJtaXR9ID0gcmVxdWlyZSgnLi9hY3Rpb25zJyk7IFxuY29uc3Qge3NvcnROdW1iZXJzfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcbmNvbnN0IE1vZGFsc0NvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9tb2RhbHMtY29udHJvbGxlcicpO1xuXG4vKipcbiAqIFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy50aXRsZSAtIHRoZSB0aXRsZSBvZiB0aGUgbW9kYWxcbiAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLndpZHRoIC0gdGhlIHdpZHRoIG9mIHRoZSBtb2RhbFxuICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMuaGVpZ2h0IC0gdGhlIGhlaWdodCBvZiB0aGUgbW9kYWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5kZWZhdWx0QWN0aW9ucyAtIGluZGljYXRlcyBpZiBhY3Rpb25zIGF0IHRoZSBib3R0b20gb2YgdGhlIG1vZGFsIGFyZSBkZWZhdWx0LiBJZiBmYWxzZSwgdGhlbiBuZWVkZWQgcGFyYW1zIGFyZSBzcGVjaWZpZWQgaW4gJ2FjdGlvbnMnXG4gKiBAcGFyYW0ge0FycmF5Ljx7aWQ6IFN0cmluZywgdGl0bGU6IFN0cmluZywgdHlwZTogU3RyaW5nLCBvcmRlcjogTnVtYmVyfT59IG9wdGlvbnMuYWN0aW9ucyAtIGlmIG5vbi1kZWZhdWx0IGFjdGlvbnNcbiAqL1xuXG5mdW5jdGlvbiBNb2RhbChvcHRpb25zKSB7XG4gIGNvbnN0IHRwbENvbnRyb2xsZXIgPSB0ZW1wbGF0ZSgpO1xuXG4gIHRwbENvbnRyb2xsZXIucm9vdC5jbGFzc0xpc3QuYWRkKCduby1kaXNwbGF5Jyk7XG4gIHRwbENvbnRyb2xsZXIudGl0bGUudGV4dENvbnRlbnQgPSBvcHRpb25zLnRpdGxlIHx8ICcnO1xuICB0cGxDb250cm9sbGVyLmJvZHkuc3R5bGUud2lkdGggPSAob3B0aW9ucy53aWR0aCB8fCAnMzAwJykgKyAncHgnO1xuICB0cGxDb250cm9sbGVyLmJvZHkuc3R5bGUuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgPyBvcHRpb25zLmhlaWdodCArICdweCcgOiAnYXV0byc7XG5cbiAgdHBsQ29udHJvbGxlci5jbG9zZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICB0aGlzLmNsb3NlKCk7XG4gIH0pO1xuXG4gIGxldCBhY3Rpb25zUGFyYW1zID1cbiAgICBvcHRpb25zLmRlZmF1bHRBY3Rpb25zID9cbiAgICBbY2FuY2VsLCBzdWJtaXRdIDpcbiAgICBvcHRpb25zLmFjdGlvbnM7XG5cbiAgY29uc3QgYWN0aW9ucyA9IGFjdGlvbnNQYXJhbXMuc29ydChzb3J0TnVtYmVycylcbiAgICAubWFwKGl0ZW0gPT4ge1xuICAgICAgY29uc3QgYWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICBhY3Rpb24udGV4dENvbnRlbnQgPSBpdGVtLnRpdGxlO1xuICAgICAgYWN0aW9uLmNsYXNzTGlzdC5hZGQoJ2J0bi0nICsgaXRlbS50eXBlKTtcbiAgICAgIHJldHVybiB7IGlkOiBpdGVtLmlkLCBlbGVtZW50OiBhY3Rpb24gfTtcbiAgICB9KTtcbiAgXG4gIGxldCBhY3Rpb25zT2JqID0ge307XG5cbiAgYWN0aW9ucy5mb3JFYWNoKGFjdGlvbiA9PiB7XG4gICAgdHBsQ29udHJvbGxlci5mb290ZXIuYXBwZW5kQ2hpbGQoYWN0aW9uLmVsZW1lbnQpO1xuICAgIGFjdGlvbnNPYmpbYWN0aW9uLmlkXSA9IGFjdGlvbi5lbGVtZW50O1xuICB9KTtcblxuICBpZiAoYWN0aW9uc09ialsnY2FuY2VsJ10pIHtcbiAgICBhY3Rpb25zT2JqWydjYW5jZWwnXS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuZWxlbWVudHMgPSB7XG4gICAgLi4udHBsQ29udHJvbGxlcixcbiAgICAuLi5hY3Rpb25zT2JqXG4gIH07XG4gIHRoaXMuZGVzdHJveU9uQ2xvc2UgPSBvcHRpb25zLmRlc3Ryb3lPbkNsb3NlO1xuXG4gIE1vZGFsc0NvbnRyb2xsZXIuYWRkKHRoaXMpO1xufVxuXG5Nb2RhbC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKCkge1xuICBNb2RhbHNDb250cm9sbGVyLm9wZW4odGhpcyk7XG59O1xuXG5Nb2RhbC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgY2xvc2VFdmVudCA9IG5ldyBDdXN0b21FdmVudCgnY2xvc2UnKTtcbiAgdGhpcy5lbGVtZW50cy5yb290LmRpc3BhdGNoRXZlbnQoY2xvc2VFdmVudCk7XG4gIFxuICBNb2RhbHNDb250cm9sbGVyLmNsb3NlTGFzdCgpO1xuXG4gIGlmICh0aGlzLmRlc3Ryb3lPbkNsb3NlKSB7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH1cbn07XG5cbk1vZGFsLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZWxlbWVudHMucm9vdC5yZW1vdmUoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kYWw7XG59LHtcIi4uL21vZGFscy1jb250cm9sbGVyXCI6MTEsXCIuL2FjdGlvbnNcIjo4LFwiLi90cGxcIjoxMCxcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo2N31dLDEwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiB0ZW1wbGF0ZSgpIHtcbiAgY29uc3QgaHRtbCA9IC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCJtb2RhbCBtb2RhbC1zdGFuZGFyZFwiPlxuICAgICAgPGRpdiBjbGFzcz1cImhlYWRlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidGl0bGVcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNsb3NlXCI+XG4gICAgICAgICAgPGJ1dHRvbj48aSBjbGFzcz1cImkgaS1jbG9zZVwiPjwvaT48L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImJvZHlcIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJmb290ZXJcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBjb25zdCBtb2RhbCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcbiAgY29uc3QgdGl0bGUgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcudGl0bGUnKTtcbiAgY29uc3QgY2xvc2VCdG4gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuY2xvc2UgYnV0dG9uJyk7XG4gIGNvbnN0IGJvZHkgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuYm9keScpO1xuICBjb25zdCBmb290ZXIgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuZm9vdGVyJyk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBtb2RhbCxcbiAgICB0aXRsZSxcbiAgICBjbG9zZUJ0bixcbiAgICBib2R5LFxuICAgIGZvb3RlclxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xufSx7XCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6Njd9XSwxMTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5mdW5jdGlvbiBNb2RhbHNDb250cm9sbGVyKCkge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFscycpXG5cbiAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnbW9kYWxzJyk7XG4gICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnbm8tZGlzcGxheScpO1xuICAgICAgY29udGFpbmVyLmlkID0gJ21vZGFscyc7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICB9XG5cbiAgICBsZXQgY292ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWxzLWNvdmVyJylcblxuICAgIGlmICghY292ZXIpIHtcbiAgICAgIGNvdmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBjb3Zlci5jbGFzc0xpc3QuYWRkKCdtb2RhbHMtY292ZXInKTtcbiAgICAgIGNvdmVyLmlkID0gJ21vZGFscy1jb3Zlcic7XG4gICAgICB0aGlzLmNvdmVyID0gY292ZXI7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5jb3ZlciA9IGNvdmVyO1xuICAgIH1cblxuICAgIHRoaXMubW9kYWxzT3BlbiA9IFtdO1xuICB9KTtcbn1cblxuTW9kYWxzQ29udHJvbGxlci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24obW9kYWwpIHtcbiAgY29uc3QgZWxlbWVudCA9IG1vZGFsLmVsZW1lbnRzLnJvb3Q7XG4gIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICB0aGlzLmNvbnRhaW5lci5pbnNlcnRCZWZvcmUodGhpcy5jb3ZlciwgZWxlbWVudCk7XG59O1xuXG5Nb2RhbHNDb250cm9sbGVyLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24obW9kYWwpIHtcbiAgaWYgKHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5jb250YWlucygnbm8tZGlzcGxheScpKSB7XG4gICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnbm8tZGlzcGxheScpO1xuICB9XG5cbiAgaWYgKHRoaXMubW9kYWxzT3Blbi5sZW5ndGggPiAwKSB7XG4gICAgdGhpcy5nZXRMYXN0KCkuZWxlbWVudHMucm9vdC5jbGFzc0xpc3QuYWRkKCduby1kaXNwbGF5Jyk7XG4gIH1cblxuICBjb25zdCBlbGVtZW50ID0gbW9kYWwuZWxlbWVudHMucm9vdDtcbiAgdGhpcy5jb250YWluZXIuaW5zZXJ0QmVmb3JlKHRoaXMuY292ZXIsIGVsZW1lbnQpO1xuICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ25vLWRpc3BsYXknKTtcbiAgdGhpcy5tb2RhbHNPcGVuLnB1c2gobW9kYWwpO1xufTtcblxuTW9kYWxzQ29udHJvbGxlci5wcm90b3R5cGUuY2xvc2VMYXN0ID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLm1vZGFsc09wZW4ubGVuZ3RoID09IDApIHRocm93IG5ldyBFcnJvcignTm8gbW9kYWxzIHRvIGNsb3NlJyk7XG5cbiAgdGhpcy5nZXRMYXN0KCkuZWxlbWVudHMucm9vdC5jbGFzc0xpc3QuYWRkKCduby1kaXNwbGF5Jyk7XG4gIHRoaXMubW9kYWxzT3Blbi5wb3AoKTtcblxuICBpZiAodGhpcy5tb2RhbHNPcGVuLmxlbmd0aCA+IDApIHtcbiAgICB0aGlzLmdldExhc3QoKS5lbGVtZW50cy5yb290LmNsYXNzTGlzdC5yZW1vdmUoJ25vLWRpc3BsYXknKTtcbiAgfVxuICBlbHNlIHtcbiAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCduby1kaXNwbGF5Jyk7XG4gIH1cbn07XG5cbk1vZGFsc0NvbnRyb2xsZXIucHJvdG90eXBlLmdldExhc3QgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMubW9kYWxzT3Blblt0aGlzLm1vZGFsc09wZW4ubGVuZ3RoIC0gMV07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RhbHNDb250cm9sbGVyKCk7XG59LHt9XSwxMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBNb2RhbCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9tb2RhbHMnKTtcbmNvbnN0IHttYWluVGVtcGxhdGUsIHBhcnRpY2lwYW50VGVtcGxhdGV9ID0gcmVxdWlyZSgnLi90ZW1wbGF0ZXMnKTtcbmNvbnN0IFNQTW9kYWwgPSByZXF1aXJlKCcuLi9zZWxlY3QtcGFydGljaXBhbnRzLW1vZGFsJyk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IEVDTW9kYWwgPSByZXF1aXJlKCcuLi9ldmVudC1jcmVhdGVkLW1vZGFsJyk7XG5cbmZ1bmN0aW9uIENFTW9kYWwoKSB7XG4gIGNvbnN0IENFTW9kYWxJbnN0YW5jZSA9IE1vZGFsLmNyZWF0ZSh7XG4gICAgdHlwZTogJ3N0YW5kYXJkJyxcbiAgICB0aXRsZTogJ0NyZWF0ZSBldmVudCcsXG4gICAgd2lkdGg6IDQwMCxcbiAgICBkZWZhdWx0QWN0aW9uczogdHJ1ZSxcbiAgICBkZXN0cm95T25DbG9zZTogdHJ1ZVxuICB9KTtcblxuICBjb25zdCB0cGxDb250cm9sbGVyID0gbWFpblRlbXBsYXRlKCk7XG4gIHRoaXMubW9kYWwgPSBDRU1vZGFsSW5zdGFuY2U7XG4gIHRoaXMudHBsQ29udHJvbGxlciA9IHRwbENvbnRyb2xsZXI7XG4gIHRoaXMuZGF0YSA9IHtcbiAgICB0aXRsZTogbnVsbCxcbiAgICBkZXNjcmlwdGlvbjogbnVsbCxcbiAgICBkYXRlOiBudWxsLFxuICAgIHBhcnRpY2lwYW50czogW10sXG4gICAgZmlsZXM6IFtdLFxuICAgIHRpbWU6IHsgZnJvbTogbnVsbCwgdG86IG51bGwgfSxcbiAgICBwcm9qZWN0OiBudWxsLFxuICAgIGxpbms6IG51bGwsXG4gICAgaW1wb3J0YW5jZTogbnVsbFxuICB9O1xuICBDRU1vZGFsSW5zdGFuY2UuZWxlbWVudHMuYm9keS5hcHBlbmRDaGlsZCh0cGxDb250cm9sbGVyLnJvb3QpO1xuICB0aGlzLmJpbmRTUE1vZGFsKCk7XG4gIHRoaXMuYmluZFBhcnRpY2lwYW50c0V2ZW50cygpO1xuICB0aGlzLmJpbmREYXRlQW5kVGltZUV2ZW50cygpO1xuICB0aGlzLmJpbmRTaW1wbGVDb250cm9scygpO1xuICB0aGlzLmJpbmRPS0J1dHRvbigpO1xuICBcbiAgcmV0dXJuIENFTW9kYWxJbnN0YW5jZTtcbn1cblxuQ0VNb2RhbC5wcm90b3R5cGUuYmluZFNQTW9kYWwgPSBmdW5jdGlvbigpIHtcbiAgbGV0IFNQTW9kYWxJbnN0YW5jZSA9IG51bGw7XG4gIGNvbnN0IG9wZW5Nb2RhbEJ0biA9IHRoaXMudHBsQ29udHJvbGxlci5wYXJ0aWNpcGFudHMuYnRuO1xuICBcbiAgb3Blbk1vZGFsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIFNQTW9kYWxJbnN0YW5jZSA9IFNQTW9kYWwuY3JlYXRlKHtcbiAgICAgIHBhcnRpY2lwYW50czogdGhpcy5kYXRhLnBhcnRpY2lwYW50cyxcbiAgICAgIGRhdGU6IHRoaXMuZGF0YS5kYXRlLFxuICAgICAgdGltZUZyb206IHRoaXMuZGF0YS50aW1lLmZyb20sXG4gICAgICB0aW1lVG86IHRoaXMuZGF0YS50aW1lLnRvXG4gICAgfSk7XG5cbiAgICBTUE1vZGFsSW5zdGFuY2UuZWxlbWVudHMucm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGV2dCA9PiB7XG4gICAgICBTUE1vZGFsSW5zdGFuY2UgPSBudWxsO1xuICAgIH0pO1xuXG4gICAgU1BNb2RhbEluc3RhbmNlLmVsZW1lbnRzLnJvb3QuYWRkRXZlbnRMaXN0ZW5lcigncGFydGljaXBhbnRzU2VsZWN0ZWQnLCBldnQgPT4ge1xuICAgICAgU1BNb2RhbEluc3RhbmNlID0gbnVsbDtcbiAgICAgIHRoaXMuZGF0YS5wYXJ0aWNpcGFudHMgPSBldnQuZGV0YWlsLnBhcnRpY2lwYW50cztcbiAgICAgIHRoaXMucmVuZGVyUGFydGljaXBhbnRzKCk7XG4gICAgfSk7XG5cbiAgICBTUE1vZGFsSW5zdGFuY2Uub3BlbigpO1xuICB9KTtcbn07XG5cbkNFTW9kYWwucHJvdG90eXBlLmJpbmRQYXJ0aWNpcGFudHNFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy50cGxDb250cm9sbGVyLnBhcnRpY2lwYW50cy5wbGFjZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2dCA9PiB7XG4gICAgY29uc3QgY2xvc2VCdG4gPSBldnQudGFyZ2V0LmNsb3Nlc3QoJy5idG4tY2xvc2UnKTtcbiAgICBpZiAoIWNsb3NlQnRuKSByZXR1cm47XG4gICAgY29uc3Qge3BhcnRpY2lwYW50c30gPSB0aGlzLmRhdGE7XG4gICAgY29uc3QgcFBpbGwgPSBldnQudGFyZ2V0LmNsb3Nlc3QoJy5wYXJ0aWNpcGFudCcpO1xuICAgIGNvbnN0IHVzZXJJZCA9ICtwUGlsbC5kYXRhc2V0LmlkO1xuICAgIGNvbnN0IHBJZHggPSBwYXJ0aWNpcGFudHMuZmluZChwID0+IHBbJ3VzZXJfaWQnXSA9PSB1c2VySWQpO1xuICAgIHBQaWxsLnJlbW92ZSgpO1xuICAgIHBhcnRpY2lwYW50cy5zcGxpY2UocElkeCwgMSk7XG5cbiAgICBjb25zdCBwb3N0Qm9keSA9IHtcbiAgICAgIHBhcnRpY2lwYW50c0lkczogcGFydGljaXBhbnRzLm1hcChwID0+ICh7J3VzZXJfaWQnOiBwWyd1c2VyX2lkJ119KSksXG4gICAgICBkYXRlOiB0aGlzLmRhdGEuZGF0ZSxcbiAgICAgIHRpbWVGcm9tOiB0aGlzLmRhdGEudGltZS5mcm9tLFxuICAgICAgdGltZVRvOiB0aGlzLmRhdGEudGltZS50b1xuICAgIH07XG5cbiAgICBodHRwLnBvc3QoJ3NjaGVkdWxlci9nZXRQYXJ0aWNpcGFudHNBdmFpbGFiaWxpdHknLCBwb3N0Qm9keSlcbiAgICAgIC50aGVuKHBBdmFpbGFiaWxpdHkgPT4ge1xuICAgICAgICBwQXZhaWxhYmlsaXR5LmZvckVhY2gocGEgPT4ge1xuICAgICAgICAgIGNvbnN0IHBGb3VuZCA9IHBhcnRpY2lwYW50cy5maW5kKHAgPT4gcFsndXNlcl9pZCddID09IHBhWyd1c2VyX2lkJ10pO1xuICAgICAgICAgIHBGb3VuZC5idXN5ID0gcGEuYnVzeTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucmVuZGVyUGFydGljaXBhbnRzKCk7XG4gICAgICAgIHRoaXMuY2hlY2tQYXJ0aWNpcGFudHNCdXN5bmVzcygpO1xuICAgICAgfSlcbiAgICA7XG4gIH0pO1xufTtcblxuQ0VNb2RhbC5wcm90b3R5cGUucmVuZGVyUGFydGljaXBhbnRzID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IHtwYXJ0aWNpcGFudHN9ID0gdGhpcy5kYXRhO1xuICB0aGlzLnRwbENvbnRyb2xsZXIucGFydGljaXBhbnRzLnBsYWNlLmlubmVySFRNTCA9ICcnO1xuICBwYXJ0aWNpcGFudHMuZm9yRWFjaChwID0+IHtcbiAgICBjb25zdCBwVHBsQ29udHJvbGxlciA9IHBhcnRpY2lwYW50VGVtcGxhdGUocCk7XG4gICAgdGhpcy50cGxDb250cm9sbGVyLnBhcnRpY2lwYW50cy5wbGFjZS5hcHBlbmRDaGlsZChwVHBsQ29udHJvbGxlci5yb290KTtcbiAgICBpZiAocC5idXN5KSBwVHBsQ29udHJvbGxlci5yb290LmNsYXNzTGlzdC5hZGQoJ2J1c3knKTtcbiAgfSk7XG59O1xuXG5DRU1vZGFsLnByb3RvdHlwZS5jaGVja1BhcnRpY2lwYW50c0J1c3luZXNzID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IHtwYXJ0aWNpcGFudHN9ID0gdGhpcy5kYXRhO1xuICBjb25zdCBidXN5TGlzdCA9IHBhcnRpY2lwYW50cy5maWx0ZXIocCA9PiBwLmJ1c3kpO1xuXG4gIGlmIChidXN5TGlzdC5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgYnVzeVN0ciA9IGJ1c3lMaXN0LmpvaW4oJywgJyk7XG4gICAgdGhpcy50cGxDb250cm9sbGVyLnBhcnRpY2lwYW50cy5hbGVydC5wbGFjZS5pbm5lckhUTUwgPSBidXN5U3RyO1xuICAgIHRoaXMudHBsQ29udHJvbGxlci5wYXJ0aWNpcGFudHMuYWxlcnQucm9vdC5jbGFzc0xpc3QucmVtb3ZlKCduby1kaXNwbGF5Jyk7XG4gICAgdGhpcy5tb2RhbC5lbGVtZW50cy5zdWJtaXQuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuICB9XG4gIGVsc2Uge1xuICAgIHRoaXMudHBsQ29udHJvbGxlci5wYXJ0aWNpcGFudHMuYWxlcnQucm9vdC5jbGFzc0xpc3QuYWRkKCduby1kaXNwbGF5Jyk7XG4gICAgdGhpcy50cGxDb250cm9sbGVyLnBhcnRpY2lwYW50cy5hbGVydC5wbGFjZS5pbm5lckhUTUwgPSAnJztcbiAgICB0aGlzLm1vZGFsLmVsZW1lbnRzLnN1Ym1pdC5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gIH1cbn07XG5cbkNFTW9kYWwucHJvdG90eXBlLnByb2Nlc3NEYXRlQW5kVGltZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgY29uc3Qge2RhdGVSYXcsIHRpbWVGcm9tUmF3LCB0aW1lVG9SYXd9ID0gb3B0aW9ucztcblxuICBjb25zdCBbZGF5LCBtb250aCwgeWVhcl0gPSBkYXRlUmF3LnNwbGl0KCcvJykubWFwKG4gPT4gK24pO1xuICBjb25zdCBbdGltZUZyb21ISCwgdGltZUZyb21NTV0gPSB0aW1lRnJvbVJhdy5zcGxpdCgnOicpLm1hcChuID0+ICtuKTtcbiAgY29uc3QgW3RpbWVUb0hILCB0aW1lVG9NTV0gPSB0aW1lVG9SYXcuc3BsaXQoJzonKS5tYXAobiA9PiArbik7XG5cbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLTEsIGRheSk7XG4gIGNvbnN0IHRpbWVGcm9tID0gbmV3IERhdGUoeWVhciwgbW9udGgtMSwgZGF5LCB0aW1lRnJvbUhILCB0aW1lRnJvbU1NKTtcbiAgY29uc3QgdGltZVRvID0gbmV3IERhdGUoeWVhciwgbW9udGgtMSwgZGF5LCB0aW1lVG9ISCwgdGltZVRvTU0pO1xuXG4gIHJldHVybiB7XG4gICAgZGF0ZSxcbiAgICB0aW1lRnJvbSxcbiAgICB0aW1lVG9cbiAgfTtcbn07XG5cbkNFTW9kYWwucHJvdG90eXBlLmJpbmREYXRlQW5kVGltZUV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBkYXRlQ29udHJvbCA9IHRoaXMudHBsQ29udHJvbGxlci5kYXRlO1xuICBjb25zdCB0aW1lRnJvbUNvbnRyb2wgPSB0aGlzLnRwbENvbnRyb2xsZXIudGltZS5mcm9tO1xuICBjb25zdCB0aW1lVG9Db250cm9sID0gdGhpcy50cGxDb250cm9sbGVyLnRpbWUudG87XG5cbiAgW2RhdGVDb250cm9sLCB0aW1lRnJvbUNvbnRyb2wsIHRpbWVUb0NvbnRyb2xdLmZvckVhY2goY29udHJvbCA9PiB7XG4gICAgY29udHJvbC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICBjb25zdCBkYXRlUmF3ID0gdGhpcy50cGxDb250cm9sbGVyLmRhdGUudmFsdWU7XG4gICAgICBjb25zdCB0aW1lRnJvbVJhdyA9IHRoaXMudHBsQ29udHJvbGxlci50aW1lLmZyb20udmFsdWU7XG4gICAgICBjb25zdCB0aW1lVG9SYXcgPSB0aGlzLnRwbENvbnRyb2xsZXIudGltZS50by52YWx1ZTtcbiAgICAgIFxuICAgICAgaWYgKCFkYXRlUmF3IHx8ICF0aW1lRnJvbVJhdyB8fCAhdGltZVRvUmF3KSB7XG4gICAgICAgIHRoaXMuZGF0YS5kYXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5kYXRhLnRpbWUuZnJvbSA9IG51bGw7XG4gICAgICAgIHRoaXMuZGF0YS50aW1lLnRvID0gbnVsbDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjb25zdCB7cGFydGljaXBhbnRzfSA9IHRoaXMuZGF0YTtcbiAgICAgIGNvbnN0IHtkYXRlLCB0aW1lRnJvbSwgdGltZVRvfSA9IHRoaXMucHJvY2Vzc0RhdGVBbmRUaW1lKHsgZGF0ZVJhdywgdGltZUZyb21SYXcsIHRpbWVUb1JhdyB9KTtcbiAgICAgIFxuICAgICAgdGhpcy5kYXRhLmRhdGUgPSBkYXRlO1xuICAgICAgdGhpcy5kYXRhLnRpbWUuZnJvbSA9IHRpbWVGcm9tO1xuICAgICAgdGhpcy5kYXRhLnRpbWUudG8gPSB0aW1lVG87XG4gICAgICBcbiAgICAgIGlmIChwYXJ0aWNpcGFudHMubGVuZ3RoID09IDApIHJldHVybjtcblxuICAgICAgY29uc3QgcGFydGljaXBhbnRzSWRzID0gcGFydGljaXBhbnRzLm1hcChwID0+ICh7ICd1c2VyX2lkJzogcFsndXNlcl9pZCddIH0pKTtcbiAgICAgIGNvbnN0IHBvc3RCb2R5ID0ge1xuICAgICAgICBwYXJ0aWNpcGFudHNJZHMsXG4gICAgICAgIGRhdGUsXG4gICAgICAgIHRpbWVGcm9tLFxuICAgICAgICB0aW1lVG9cbiAgICAgIH07XG4gIFxuICAgICAgaHR0cC5wb3N0KCdzY2hlZHVsZXIvZ2V0UGFydGljaXBhbnRzQXZhaWxhYmlsaXR5JywgcG9zdEJvZHkpXG4gICAgICAgIC50aGVuKHBBdmFpbGFiaWxpdHkgPT4ge1xuICAgICAgICAgIHBBdmFpbGFiaWxpdHkuZm9yRWFjaChwYSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwRm91bmQgPSBwYXJ0aWNpcGFudHMuZmluZChwID0+IHBbJ3VzZXJfaWQnXSA9PSBwYVsndXNlcl9pZCddKTtcbiAgICAgICAgICAgIHBGb3VuZC5idXN5ID0gcGEuYnVzeTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLnJlbmRlclBhcnRpY2lwYW50cygpO1xuICAgICAgICAgIHRoaXMuY2hlY2tQYXJ0aWNpcGFudHNCdXN5bmVzcygpO1xuICAgICAgICB9KVxuICAgICAgO1xuICAgIH0pO1xuICB9KTtcbn07XG5cbkNFTW9kYWwucHJvdG90eXBlLmJpbmRTaW1wbGVDb250cm9scyA9IGZ1bmN0aW9uKCkge1xuICBsZXQgY29udHJvbHMgPSB7XG4gICAgdGl0bGU6IHRoaXMudHBsQ29udHJvbGxlci50aXRsZSxcbiAgICBkZXNjcmlwdGlvbjogdGhpcy50cGxDb250cm9sbGVyLmRlc2MsXG4gICAgbGluazogdGhpcy50cGxDb250cm9sbGVyLmxpbmssXG4gICAgdHlwZTogdGhpcy50cGxDb250cm9sbGVyLnR5cGUsXG4gICAgcHJvamVjdDogdGhpcy50cGxDb250cm9sbGVyLnByb2plY3RcbiAgfTtcbiAgXG4gIE9iamVjdC5rZXlzKGNvbnRyb2xzKS5mb3JFYWNoKGNOYW1lID0+IHtcbiAgICBjb250cm9sc1tjTmFtZV0uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgdGhpcy5kYXRhW2NOYW1lXSA9IGNvbnRyb2xzW2NOYW1lXS52YWx1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgY29uc3QgaW1wb3J0YW5jZU9wdGlvbnMgPSBbXG4gICAgdGhpcy50cGxDb250cm9sbGVyLmltcG9ydGFuY2Uubm9uZSxcbiAgICB0aGlzLnRwbENvbnRyb2xsZXIuaW1wb3J0YW5jZS5pbXBvcnRhbnQsXG4gICAgdGhpcy50cGxDb250cm9sbGVyLmltcG9ydGFuY2UuZGVzaXJhYmxlXG4gIF07XG5cbiAgaW1wb3J0YW5jZU9wdGlvbnMuZm9yRWFjaChvcHRpb24gPT4ge1xuICAgIG9wdGlvbi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLmRhdGEuaW1wb3J0YW5jZSA9IG9wdGlvbi52YWx1ZTtcbiAgICB9KTtcbiAgfSk7XG59O1xuXG5DRU1vZGFsLnByb3RvdHlwZS5iaW5kT0tCdXR0b24gPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5tb2RhbC5lbGVtZW50cy5zdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgY29uc3QgcG9zdEJvZHkgPSB7XG4gICAgICB0aXRsZTogdGhpcy5kYXRhLnRpdGxlLFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGF0YS5kZXNjcmlwdGlvbixcbiAgICAgIGxpbms6IHRoaXMuZGF0YS5saW5rLFxuICAgICAgdHlwZTogdGhpcy5kYXRhLnR5cGUsXG4gICAgICBwcm9qZWN0OiB0aGlzLmRhdGEucHJvamVjdCxcbiAgICAgIGltcG9ydGFuY2U6IHRoaXMuZGF0YS5pbXBvcnRhbmNlLFxuICAgICAgcGFydGljaXBhbnRzSWRzOiB0aGlzLmdldFBhcnRpY2lwYW50c0lkcygpLFxuICAgICAgZGF0ZTogSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhLmRhdGUudG9TdHJpbmcoKSksXG4gICAgICB0aW1lRnJvbTogSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhLnRpbWUuZnJvbS50b1N0cmluZygpKSxcbiAgICAgIHRpbWVUbzogSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhLnRpbWUudG8udG9TdHJpbmcoKSlcbiAgICB9O1xuICBcbiAgICBodHRwLnBvc3QoJ3NjaGVkdWxlci9jcmVhdGUtZXZlbnQnLCBwb3N0Qm9keSlcbiAgICAgIC50aGVuKGFuc3dlciA9PiB7XG4gICAgICAgIGlmICghYW5zd2VyLnN1Y2Nlc3MpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnbm8gc3VjY2VzcycpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfTtcbiAgXG4gICAgICAgIGNvbnN0IGV2ZW50Q3JlYXRlZCA9IG5ldyBDdXN0b21FdmVudCgnZXZlbnRDcmVhdGVkJywgeyBkZXRhaWw6IHRoaXMuZGF0YSB9KTtcbiAgICAgICAgdGhpcy5tb2RhbC5lbGVtZW50cy5yb290LmRpc3BhdGNoRXZlbnQoZXZlbnRDcmVhdGVkKTtcbiAgICAgICAgdGhpcy5tb2RhbC5jbG9zZSgpO1xuICAgICAgICBFQ01vZGFsLmNyZWF0ZSgpLm9wZW4oKTtcbiAgICAgIH0pXG4gICAgO1xuICB9KTtcbn07XG5cbkNFTW9kYWwucHJvdG90eXBlLmdldFBhcnRpY2lwYW50c0lkcyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5kYXRhLnBhcnRpY2lwYW50cy5tYXAocCA9PiAoeyd1c2VyX2lkJzogcFsndXNlcl9pZCddfSkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogKCkgPT4gbmV3IENFTW9kYWwoKVxufTtcbn0se1wiLi4vZXZlbnQtY3JlYXRlZC1tb2RhbFwiOjE2LFwiLi4vc2VsZWN0LXBhcnRpY2lwYW50cy1tb2RhbFwiOjI4LFwiLi90ZW1wbGF0ZXNcIjoxMyxcImNzcC1hcHAvY29tcG9uZW50cy9tb2RhbHNcIjo3LFwiY3NwLWFwcC9saWJzL2h0dHBcIjo1OH1dLDEzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IG1haW5UZW1wbGF0ZSA9IHJlcXVpcmUoJy4vbWFpbi50cGwnKTtcbmNvbnN0IHBhcnRpY2lwYW50VGVtcGxhdGUgPSByZXF1aXJlKCcuL3BhcnRpY2lwYW50LnRwbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWFpblRlbXBsYXRlLFxuICBwYXJ0aWNpcGFudFRlbXBsYXRlXG59O1xufSx7XCIuL21haW4udHBsXCI6MTQsXCIuL3BhcnRpY2lwYW50LnRwbFwiOjE1fV0sMTQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKCkge1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cImZvcm0gY2UtZm9ybVwiPlxuICAgICAgPGRpdiBjbGFzcz1cImZpZWxkIGZpZWxkLW9uZWxpbmUgZmllbGQtdGl0bGUgY2xlYXJmaXhcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWxhYmVsXCI+PGxhYmVsIGZvcj1cImNlLWZvcm0tdGl0bGVcIj5UaXRsZTwvbGFiZWw+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1pbnB1dFwiPjxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwiY2UtZm9ybS10aXRsZVwiIC8+PC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImZpZWxkIGZpZWxkLW9uZWxpbmUgZmllbGQtZGVzYyBjbGVhcmZpeFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWxcIj48bGFiZWwgZm9yPVwiY2UtZm9ybS1kZXNjXCI+RGVzY3JpcHRpb248L2xhYmVsPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtaW5wdXRcIj48dGV4dGFyZWEgaWQ9XCJjZS1mb3JtLWRlc2NcIj48L3RleHRhcmVhPjwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZCBmaWVsZC1vbmVsaW5lIGZpZWxkLWRhdGUgY2xlYXJmaXhcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWxhYmVsXCI+PGxhYmVsIGZvcj1cImNlLWZvcm0tZGF0ZVwiPkRhdGU8L2xhYmVsPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtaW5wdXRcIj5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cImNlLWZvcm0tZGF0ZVwiIHBsYWNlaG9sZGVyPVwiZGQvbW0veXl5eVwiIC8+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0bi1uby1zdHlsZVwiPjxpIGNsYXNzPVwiaSBpLWNhbGVuZGFyXCI+PC9pPjwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiZmllbGQgZmllbGQtb25lbGluZSBmaWVsZC10aW1lIGNsZWFyZml4XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPjxsYWJlbD5UaW1lPC9sYWJlbD48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWlucHV0XCI+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJoaDptbVwiIGNsYXNzPVwiZnJvbVwiIC8+XG4gICAgICAgICAgPHNwYW4+LTwvc3Bhbj5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cImhoOm1tXCIgY2xhc3M9XCJ0b1wiIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZCBmaWVsZC1wYXJ0aWNpcGFudHNcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWxhYmVsXCI+UGFydGljaXBhbnRzIDxidXR0b24gY2xhc3M9XCJidG4tcHJpbWFyeS1vdXRsaW5lZFwiPjxpIGNsYXNzPVwiaSBpLXBsdXNcIj48L2k+QWRkIHBhcnRpY2lwYW50PC9idXR0b24+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1pbnB1dFwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtYWxlcnQgbm8tZGlzcGxheVwiPlxuICAgICAgICAgIFRoZXNlIGNhbm5vdCBwYXJ0aWNpcGF0ZTogPHNwYW4gY2xhc3M9XCJwYXJ0aWNpcGFudHMtbGlzdFwiPjwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImZpZWxkIGZpZWxkLW9uZWxpbmUgZmllbGQtbGluayBjbGVhcmZpeFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWxcIj48bGFiZWwgZm9yPVwiY2UtZm9ybS1saW5rXCI+TGluazwvbGFiZWw+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1pbnB1dFwiPjxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwiY2UtZm9ybS1saW5rXCIgLz48L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiZmllbGQgZmllbGQtb25lbGluZSBmaWVsZC10eXBlIGNsZWFyZml4XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPjxsYWJlbCBmb3I9XCJjZS1mb3JtLWxpbmtcIj5UeXBlPC9sYWJlbD48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWlucHV0XCI+XG4gICAgICAgICAgPHNlbGVjdD48L3NlbGVjdD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImZpZWxkIGZpZWxkLW9uZWxpbmUgZmllbGQtcHJvamVjdCBjbGVhcmZpeFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWxcIj48bGFiZWwgZm9yPVwiY2UtZm9ybS1wcm9qZWN0XCI+UHJvamVjdDwvbGFiZWw+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1pbnB1dFwiPlxuICAgICAgICA8c2VsZWN0Pjwvc2VsZWN0PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiZmllbGQgZmllbGQtaW1wb3J0YW5jZVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWxcIj5JbXBvcnRhbmNlIG1hcms8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWlucHV0XCI+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBuYW1lPVwiaW1wb3J0YW5jZVwiIHZhbHVlPVwibm9uZVwiIGlkPVwiaW1wLW5vbmVcIiAvPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cImltcC1ub25lXCI+Tm9uZTwvbGFiZWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgXG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBuYW1lPVwiaW1wb3J0YW5jZVwiIHZhbHVlPVwiaW1wb3J0YW50XCIgaWQ9XCJpbXAtaW1wb3J0YW50XCIgLz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJpbXAtaW1wb3J0YW50XCI+SW1wb3J0YW50PC9sYWJlbD5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhZGlvXCIgbmFtZT1cImltcG9ydGFuY2VcIiB2YWx1ZT1cImRlc2lyYWJsZVwiIGlkPVwiaW1wLWRlc2lyYWJsZVwiIC8+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwiaW1wLWRlc2lyYWJsZVwiPkRlc2lyYWJsZTwvbGFiZWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZCBmaWVsZC1kb2NzXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkRvY3VtZW50cyA8YnV0dG9uIGNsYXNzPVwiYnRuLXByaW1hcnktb3V0bGluZWRcIj48aSBjbGFzcz1cImkgaS1wbHVzXCI+PC9pPkF0dGFjaCBkb2N1bWVudDwvYnV0dG9uPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtaW5wdXRcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xuXG4gIGNvbnN0IGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoaHRtbCk7XG4gIGNvbnN0IHRpdGxlID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZmllbGQtdGl0bGUgaW5wdXQnKTtcbiAgY29uc3QgZGVzYyA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkLWRlc2MgdGV4dGFyZWEnKTtcbiAgY29uc3QgZGF0ZSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkLWRhdGUgaW5wdXQnKTtcbiAgY29uc3QgZnJvbSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkLXRpbWUgLmZyb20nKTtcbiAgY29uc3QgdG8gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5maWVsZC10aW1lIC50bycpO1xuICBjb25zdCBhZGRQYXJ0aWNpcGFudEJ0biA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkLXBhcnRpY2lwYW50cyBidXR0b24nKTtcbiAgY29uc3QgYWRkUGFydGljaXBhbnRQbGFjZSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkLXBhcnRpY2lwYW50cyAuZmllbGQtaW5wdXQnKTtcbiAgY29uc3QgbGluayA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkLWxpbmsgaW5wdXQnKTtcbiAgY29uc3QgdHlwZVNlbGVjdCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkLXR5cGUgc2VsZWN0Jyk7XG4gIGNvbnN0IHByb2plY3RTZWxlY3QgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5maWVsZC1wcm9qZWN0IHNlbGVjdCcpO1xuICBjb25zdCBpbXBSYWRpb05vbmUgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbXAtbm9uZScpO1xuICBjb25zdCBpbXBSYWRpb0ltcG9ydGFudCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignI2ltcC1pbXBvcnRhbnQnKTtcbiAgY29uc3QgaW1wUmFkaW9EZXNpcmFibGUgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbXAtZGVzaXJhYmxlJyk7XG4gIGNvbnN0IGFkZERvY0J0biA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkLWRvY3MgYnV0dG9uJyk7XG4gIGNvbnN0IGFkZERvY1BsYWNlID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZmllbGQtZG9jcyAuZmllbGQtaW5wdXQnKTtcblxuICByZXR1cm4ge1xuICAgIHJvb3Q6IGVsZW1lbnQsXG4gICAgdGl0bGUsXG4gICAgZGVzYyxcbiAgICBkYXRlLFxuICAgIHRpbWU6IHtcbiAgICAgIGZyb20sXG4gICAgICB0b1xuICAgIH0sXG4gICAgcGFydGljaXBhbnRzOiB7XG4gICAgICBidG46IGFkZFBhcnRpY2lwYW50QnRuLFxuICAgICAgcGxhY2U6IGFkZFBhcnRpY2lwYW50UGxhY2UsXG4gICAgICBhbGVydDoge1xuICAgICAgICByb290OiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5maWVsZC1wYXJ0aWNpcGFudHMgLmZpZWxkLWFsZXJ0JyksXG4gICAgICAgIHBsYWNlOiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5maWVsZC1wYXJ0aWNpcGFudHMgLnBhcnRpY2lwYW50cy1saXN0JylcbiAgICAgIH1cbiAgICB9LFxuICAgIGxpbmssXG4gICAgdHlwZTogdHlwZVNlbGVjdCxcbiAgICBwcm9qZWN0OiBwcm9qZWN0U2VsZWN0LFxuICAgIGltcG9ydGFuY2U6IHtcbiAgICAgIG5vbmU6IGltcFJhZGlvTm9uZSxcbiAgICAgIGltcG9ydGFudDogaW1wUmFkaW9JbXBvcnRhbnQsXG4gICAgICBkZXNpcmFibGU6IGltcFJhZGlvRGVzaXJhYmxlXG4gICAgfSxcbiAgICBkb2NzOiB7XG4gICAgICBidG46IGFkZERvY0J0bixcbiAgICAgIHBsYWNlOiBhZGREb2NQbGFjZVxuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcbn0se1wiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjY3fV0sMTU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKHBhcnRpY2lwYW50KSB7XG4gIGNvbnN0IGh0bWwgPSAvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwicGFydGljaXBhbnRcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJ1c2VyLWluZm9cIiBkYXRhLWlkPVwiJHsgcGFydGljaXBhbnRbJ3VzZXJfaWQnXSB9XCI+XG4gICAgICAgICR7IHBhcnRpY2lwYW50Wyd1c2VybmFtZSddIH1cbiAgICAgIDwvZGl2PlxuICAgICAgXG4gICAgICA8ZGl2IGNsYXNzPVwiY2xvc2VcIj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0bi1jbG9zZVwiPjxpIGNsYXNzPVwiaSBpLWNsb3NlXCI+PC9pPjwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG4gIGNvbnN0IGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoaHRtbCk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBlbGVtZW50LFxuICAgIGNsb3NlQnRuOiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4tY2xvc2UnKVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xufSx7XCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6Njd9XSwxNjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBNb2RhbCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9tb2RhbHMnKTtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiBFQ01vZGFsKCkge1xuICBjb25zdCBFQ01vZGFsSW5zdGFuY2UgPSBNb2RhbC5jcmVhdGUoe1xuICAgIHR5cGU6ICdzdGFuZGFyZCcsXG4gICAgdGl0bGU6ICdTdWNjZXNzJyxcbiAgICB3aWR0aDogNDAwLFxuICAgIGRlZmF1bHRBY3Rpb25zOiBmYWxzZSxcbiAgICBhY3Rpb25zOiBbe1xuICAgICAgaWQ6ICdzdWJtaXQnLFxuICAgICAgdHlwZTogJ3ByaW1hcnknLFxuICAgICAgdGl0bGU6ICdPSydcbiAgICB9XSxcbiAgICBkZXN0cm95T25DbG9zZTogdHJ1ZVxuICB9KTtcblxuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPHAgc3R5bGU9XCJ0ZXh0LWFsaWduOiBjZW50ZXJcIj5UaGUgZXZlbnQgaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGNyZWF0ZWQhPC9wPlxuICBgO1xuICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKGh0bWwpO1xuXG4gIEVDTW9kYWxJbnN0YW5jZS5lbGVtZW50cy5yb290LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuXG4gIHJldHVybiBFQ01vZGFsSW5zdGFuY2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6ICgpID0+IG5ldyBFQ01vZGFsKClcbn07XG59LHtcImNzcC1hcHAvY29tcG9uZW50cy9tb2RhbHNcIjo3LFwiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjY3fV0sMTc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgU2NoZWR1bGVyQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9tYWluJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2NoZWR1bGVyQ29tcG9uZW50O1xufSx7XCIuL21haW5cIjoyNX1dLDE4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHRlbXBsYXRlID0gcmVxdWlyZSgnLi9pbmRleC50cGwnKTtcbmNvbnN0IENFTW9kYWwgPSByZXF1aXJlKCcuLi9jcmVhdGUtZXZlbnQtbW9kYWwnKTtcbmNvbnN0IHtcbiAgZGF5VGVtcGxhdGUsXG4gIHRpbWVsaW5lVGVtcGxhdGUsXG4gIGV2ZW50VGVtcGxhdGUsXG4gIHRvb2x0aXBUZW1wbGF0ZVxufSA9IHJlcXVpcmUoJy4vdGVtcGxhdGVzJyk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcblxuZnVuY3Rpb24gSVNNb2RhbChvcHRpb25zKSB7XG4gIGNvbnN0IHRwbENvbnRyb2xsZXIgPSB0ZW1wbGF0ZSgpO1xuICB0aGlzLl9pbnN0YW5jZUNvbnRyb2xsZXIgPSB0cGxDb250cm9sbGVyO1xuICB0aGlzLl90b2RheSA9IHRoaXMuZ2V0RGF5U3RhcnQobmV3IERhdGUoKSk7XG4gIHRoaXMuX3Rvb2x0aXAgPSBudWxsO1xuICB0aGlzLmxvYWRFdmVudHMoKTtcbiAgdGhpcy5iaW5kSVNNb2RhbEV2ZW50cygpO1xuICB0aGlzLmJpbmRUb29sdGlwcygpO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRwbENvbnRyb2xsZXIucm9vdCk7XG4gIHRoaXMuX2lzSW5pdCA9IGZhbHNlO1xuICB0aGlzLl9kZXN0cm95T25DbG9zZSA9IG9wdGlvbnMgJiYgb3B0aW9ucy5kZXN0cm95T25DbG9zZTtcblxuICByZXR1cm4ge1xuICAgIG9wZW46IHRoaXMub3Blbi5iaW5kKHRoaXMpLFxuICAgIGNsb3NlOiB0aGlzLmNsb3NlLmJpbmQodGhpcyksXG4gICAgZGVzdHJveTogdGhpcy5kZXN0cm95LmJpbmQodGhpcyksXG4gICAgcm9vdDogdGhpcy5faW5zdGFuY2VDb250cm9sbGVyLnJvb3RcbiAgfTtcbn1cblxuSVNNb2RhbC5wcm90b3R5cGUuZ2V0RGF5U3RhcnQgPSBmdW5jdGlvbih0aW1lc3RhbXApIHtcbiAgcmV0dXJuIG5ldyBEYXRlKHRpbWVzdGFtcC5nZXRGdWxsWWVhcigpLCB0aW1lc3RhbXAuZ2V0TW9udGgoKSwgdGltZXN0YW1wLmdldERhdGUoKSwgMCk7XG59O1xuXG5JU01vZGFsLnByb3RvdHlwZS5sb2FkRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IHRvZGF5ID0gdGhpcy5fdG9kYXk7XG4gIGNvbnN0IHBvc3RCb2R5ID0ge1xuICAgIHN0YXJ0QXQ6IHRvZGF5LFxuICAgIGVuZEF0OiBuZXcgRGF0ZSh0b2RheS5nZXRGdWxsWWVhcigpLCB0b2RheS5nZXRNb250aCgpLCB0b2RheS5nZXREYXRlKCkgKyA3LCAwKVxuICB9O1xuXG4gIGh0dHAucG9zdCgnc2NoZWR1bGVyL2dldEFsbE15RXZlbnRzQnlEYXlzJywgcG9zdEJvZHkpXG4gICAgLnRoZW4oZGF5cyA9PiB7XG4gICAgICB0aGlzLl9kYXlzID0gZGF5cztcbiAgICAgIHRoaXMucHJvY2Vzc0RheXMoKTtcbiAgICAgIHRoaXMucmVuZGVyRXZlbnRzKCk7XG4gICAgfSlcbiAgO1xufTtcblxuSVNNb2RhbC5wcm90b3R5cGUucHJvY2Vzc0RheXMgPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgZGF5cyA9IHRoaXMuX2RheXM7XG4gIGRheXMuZm9yRWFjaChkYXkgPT4ge1xuICAgIGRheS5kYXRlID0gbmV3IERhdGUoZGF5LmRhdGUpO1xuICAgIGRheS5ldmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICBldmVudC5kYXRlID0gbmV3IERhdGUoZXZlbnQuZGF0ZSk7XG4gICAgICBldmVudFsndGltZV9mcm9tJ10gPSBuZXcgRGF0ZShldmVudFsndGltZV9mcm9tJ10pO1xuICAgICAgZXZlbnRbJ3RpbWVfdG8nXSA9IG5ldyBEYXRlKGV2ZW50Wyd0aW1lX3RvJ10pO1xuICAgIH0pO1xuICB9KTtcbn07XG5cbklTTW9kYWwucHJvdG90eXBlLmJpbmRJU01vZGFsRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IHtjbG9zZUJ0biwgb3BlbkNFTW9kYWxCdG59ID0gdGhpcy5faW5zdGFuY2VDb250cm9sbGVyO1xuXG4gIGNsb3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgfSk7XG5cbiAgbGV0IENFTW9kYWxJbnN0YW5jZSA9IG51bGw7XG5cbiAgb3BlbkNFTW9kYWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgaWYgKCFDRU1vZGFsSW5zdGFuY2UpIHtcbiAgICAgIENFTW9kYWxJbnN0YW5jZSA9IENFTW9kYWwuY3JlYXRlKCk7XG4gICAgICBDRU1vZGFsSW5zdGFuY2UuZWxlbWVudHMucm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGV2dCA9PiB7XG4gICAgICAgIENFTW9kYWxJbnN0YW5jZSA9IG51bGw7XG4gICAgICB9KTtcbiAgICAgIENFTW9kYWxJbnN0YW5jZS5lbGVtZW50cy5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2V2ZW50Q3JlYXRlZCcsIGV2dCA9PiB7XG4gICAgICAgIENFTW9kYWxJbnN0YW5jZSA9IG51bGw7XG4gICAgICAgIHRoaXMuYWRkTmV3RXZlbnQoZXZ0LmRldGFpbCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBDRU1vZGFsSW5zdGFuY2Uub3BlbigpO1xuICB9KTtcbn07XG5cbklTTW9kYWwucHJvdG90eXBlLmNhbGNTaXplcyA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBjb250cm9sbGVyID0gdGhpcy5faW5zdGFuY2VDb250cm9sbGVyO1xuXG4gIGNvbnN0IHN0YXJ0SG91ciA9IDk7XG4gIGNvbnN0IGVuZEhvdXIgPSAyMTtcbiAgY29uc3QgbWFyZ2luID0gMzA7XG4gIGNvbnN0IHdpZHRoID0gY29udHJvbGxlci5zY2hlZHVsZXIudGltZWxpbmUub2Zmc2V0V2lkdGggLSBtYXJnaW4qMjtcbiAgY29uc3QgbWludXRlID0gKHdpZHRoKS8oKGVuZEhvdXIgLSBzdGFydEhvdXIpKjYwKTtcblxuICB0aGlzLnNpemVzID0ge1xuICAgIHN0YXJ0SG91cixcbiAgICBlbmRIb3VyLFxuICAgIHdpZHRoLFxuICAgIG1hcmdpbixcbiAgICBtaW51dGVcbiAgfTtcbn07XG5cbklTTW9kYWwucHJvdG90eXBlLmNhbGNPZmZzZXQgPSBmdW5jdGlvbih0aW1lU3RhcnQpIHtcbiAgY29uc3QgdGhpc0RheV85MDAgPSBuZXcgRGF0ZSh0aW1lU3RhcnQuZ2V0RnVsbFllYXIoKSwgdGltZVN0YXJ0LmdldE1vbnRoKCksIHRpbWVTdGFydC5nZXREYXRlKCksIHRoaXMuc2l6ZXMuc3RhcnRIb3VyKTtcbiAgY29uc3QgdGltZVN0YXJ0TWludXRlcyA9IG5ldyBEYXRlKFxuICAgIHRpbWVTdGFydC5nZXRGdWxsWWVhcigpLCB0aW1lU3RhcnQuZ2V0TW9udGgoKSwgdGltZVN0YXJ0LmdldERhdGUoKSxcbiAgICB0aW1lU3RhcnQuZ2V0SG91cnMoKSwgdGltZVN0YXJ0LmdldE1pbnV0ZXMoKVxuICApO1xuICBjb25zdCBtaW51dGVzRGlmZiA9ICh0aW1lU3RhcnRNaW51dGVzIC0gdGhpc0RheV85MDApLygxMDAwKjYwKTtcbiAgcmV0dXJuIG1pbnV0ZXNEaWZmICogdGhpcy5zaXplcy5taW51dGUgKyB0aGlzLnNpemVzLm1hcmdpbjtcbn07XG5cbklTTW9kYWwucHJvdG90eXBlLmNhbGNXaWR0aCA9IGZ1bmN0aW9uKHRpbWVTdGFydCwgdGltZUVuZCkge1xuICBjb25zdCB0aW1lU3RhcnRNaW51dGVzID0gbmV3IERhdGUoXG4gICAgdGltZVN0YXJ0LmdldEZ1bGxZZWFyKCksIHRpbWVTdGFydC5nZXRNb250aCgpLCB0aW1lU3RhcnQuZ2V0RGF0ZSgpLFxuICAgIHRpbWVTdGFydC5nZXRIb3VycygpLCB0aW1lU3RhcnQuZ2V0TWludXRlcygpXG4gICk7XG4gIGNvbnN0IHRpbWVFbmRNaW51dGVzID0gbmV3IERhdGUoXG4gICAgdGltZUVuZC5nZXRGdWxsWWVhcigpLCB0aW1lRW5kLmdldE1vbnRoKCksIHRpbWVFbmQuZ2V0RGF0ZSgpLFxuICAgIHRpbWVFbmQuZ2V0SG91cnMoKSwgdGltZUVuZC5nZXRNaW51dGVzKClcbiAgKTtcbiAgY29uc3QgbWludXRlc0RpZmYgPSAodGltZUVuZE1pbnV0ZXMgLSB0aW1lU3RhcnRNaW51dGVzKS8oMTAwMCo2MCk7XG4gIHJldHVybiBtaW51dGVzRGlmZiAqIHRoaXMuc2l6ZXMubWludXRlO1xufTtcblxuSVNNb2RhbC5wcm90b3R5cGUucmVuZGVyRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSB0aGlzLl9pbnN0YW5jZUNvbnRyb2xsZXI7XG4gIGNvbnN0IGRheXMgPSB0aGlzLl9kYXlzO1xuXG4gIGRheXMuZm9yRWFjaChkYXkgPT4ge1xuICAgIGNvbnN0IGRheVRwbENvbnRyb2xsZXIgPSBkYXlUZW1wbGF0ZSh7IHRpdGxlOiBkYXkudGl0bGUgfSk7XG4gICAgY29uc3QgdGltZWxpbmVUcGxDb250cm9sbGVyID0gdGltZWxpbmVUZW1wbGF0ZSgpO1xuICAgIGRheS5kYXlUcGxDb250cm9sbGVyID0gZGF5VHBsQ29udHJvbGxlcjtcbiAgICBkYXkudGltZWxpbmVUcGxDb250cm9sbGVyID0gdGltZWxpbmVUcGxDb250cm9sbGVyO1xuXG4gICAgZGF5LmV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgIGNvbnN0IGVsID0gdGhpcy5nZXRFdmVudEVsZW1lbnQoZXZlbnQpO1xuICAgICAgZXZlbnQuZWxlbWVudCA9IGVsO1xuICAgICAgdGltZWxpbmVUcGxDb250cm9sbGVyLnJvb3QuYXBwZW5kQ2hpbGQoZWwpO1xuICAgIH0pO1xuXG4gICAgY29udHJvbGxlci5zY2hlZHVsZXIuZGF0ZXMuYXBwZW5kQ2hpbGQoZGF5VHBsQ29udHJvbGxlci5yb290KTtcbiAgICBjb250cm9sbGVyLnNjaGVkdWxlci50aW1lbGluZS5hcHBlbmRDaGlsZCh0aW1lbGluZVRwbENvbnRyb2xsZXIucm9vdCk7XG4gIH0pO1xufTtcblxuSVNNb2RhbC5wcm90b3R5cGUuZ2V0RXZlbnRFbGVtZW50ID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgY29uc3QgZXZlbnRUcGxDb250cm9sbGVyID0gZXZlbnRUZW1wbGF0ZSh7IGlkOiBldmVudC5pZCB9KTtcbiAgY29uc3QgZWwgPSBldmVudFRwbENvbnRyb2xsZXIucm9vdDtcbiAgY29uc3Qgb2Zmc2V0ID0gdGhpcy5jYWxjT2Zmc2V0KGV2ZW50Wyd0aW1lX2Zyb20nXSk7XG4gIGNvbnN0IHdpZHRoID0gdGhpcy5jYWxjV2lkdGgoZXZlbnRbJ3RpbWVfZnJvbSddLCBldmVudFsndGltZV90byddKTtcbiAgZWwuc3R5bGUubGVmdCA9IG9mZnNldCArICdweCc7XG4gIGVsLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnO1xuICByZXR1cm4gZWw7XG59O1xuXG5JU01vZGFsLnByb3RvdHlwZS5iaW5kVG9vbHRpcHMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5faW5zdGFuY2VDb250cm9sbGVyLnJvb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgIGNvbnN0IGV2ZW50RWxlbWVudCA9IGV2dC50YXJnZXQuY2xvc2VzdCgnLmV2ZW50Jyk7XG4gICAgY29uc3QgdG9vbHRpcCA9IGV2dC50YXJnZXQuY2xvc2VzdCgnLnRvb2x0aXAnKTtcbiAgICBjb25zdCBjdXJyZW50RXZlbnRFbGVtZW50ID0gdGhpcy5fdG9vbHRpcCAmJiB0aGlzLl90b29sdGlwLmNsb3Nlc3QoJy5ldmVudCcpO1xuICAgIGNvbnN0IG5ld0V2ZW50RWxlbWVudENsaWNrZWQgPSBjdXJyZW50RXZlbnRFbGVtZW50IT09ZXZlbnRFbGVtZW50O1xuXG4gICAgaWYgKHRvb2x0aXApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRvb2x0aXAgJiYgdGhpcy5fdG9vbHRpcCkge1xuICAgICAgdGhpcy5fdG9vbHRpcC5jbGFzc0xpc3QuYWRkKCduby1kaXNwbGF5Jyk7XG4gICAgICB0aGlzLl90b29sdGlwLnJlbW92ZSgpO1xuICAgICAgdGhpcy5fdG9vbHRpcCA9IG51bGw7XG4gICAgICBjdXJyZW50RXZlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2NsaWNrZWQnKTtcbiAgICB9XG5cbiAgICBpZiAoIWV2ZW50RWxlbWVudCkgeyAgICAgXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFuZXdFdmVudEVsZW1lbnRDbGlja2VkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZXZlbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NsaWNrZWQnKTtcbiAgICBjb25zdCBpZCA9ICtldmVudEVsZW1lbnQuZGF0YXNldC5ldmVudElkO1xuICAgIGNvbnN0IGFsbEV2ZW50cyA9IHRoaXMuX2RheXMubWFwKGQ9PmQuZXZlbnRzKS5mbGF0KCk7XG4gICAgY29uc3QgZXZlbnREYXRhID0gYWxsRXZlbnRzLmZpbmQoZT0+ZS5pZD09PWlkKTtcbiAgICBjb25zdCB0b29sdGlwVHBsQ29udHJvbGxlciA9IHRvb2x0aXBUZW1wbGF0ZShldmVudERhdGEpO1xuICAgIGNvbnN0IGVsID0gdG9vbHRpcFRwbENvbnRyb2xsZXIucm9vdDtcbiAgICBldmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoZWwpO1xuICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ25vLWRpc3BsYXknKTtcbiAgICB0aGlzLl90b29sdGlwID0gZWw7XG4gIH0pO1xufTtcblxuSVNNb2RhbC5wcm90b3R5cGUuYWRkTmV3RXZlbnQgPSBmdW5jdGlvbihldmVudCkge1xuICBjb25zdCBkYXlGb3VuZCA9IHRoaXMuX2RheXMuZmluZChkYXkgPT4ge1xuICAgIGNvbnN0IGRheTFTdHIgPSBgJHtldmVudC5kYXRlLmdldEZ1bGxZZWFyKCktZXZlbnQuZGF0ZS5nZXRNb250aCgpLWV2ZW50LmRhdGUuZ2V0RGF0ZSgpfWA7XG4gICAgY29uc3QgZGF5MlN0ciA9IGAke2RheS5kYXRlLmdldEZ1bGxZZWFyKCktZGF5LmRhdGUuZ2V0TW9udGgoKS1kYXkuZGF0ZS5nZXREYXRlKCl9YDtcbiAgICByZXR1cm4gZGF5MVN0ciA9PT0gZGF5MlN0cjtcbiAgfSk7XG5cbiAgaWYgKCFkYXlGb3VuZCkgcmV0dXJuO1xuXG4gIGRheUZvdW5kLmV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgY29uc3QgZWwgPSB0aGlzLmdldEV2ZW50RWxlbWVudChldmVudCk7XG4gIGRheUZvdW5kLnRpbWVsaW5lVHBsQ29udHJvbGxlci5yb290LmFwcGVuZENoaWxkKGVsKTtcbn07XG5cbklTTW9kYWwucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgZWwgPSB0aGlzLl9pbnN0YW5jZUNvbnRyb2xsZXIucm9vdDtcbiAgaWYgKCFlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2Rpc3BsYXkteWVzJykpIHtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5LXllcycpO1xuICB9XG4gIGlmICghdGhpcy5faXNJbml0KSB7XG4gICAgdGhpcy5faW5zdGFuY2VDb250cm9sbGVyLnNjaGVkdWxlci5nZW5lcmF0ZUhvdXJzTWFya3MoKTtcbiAgICB0aGlzLl9pbnN0YW5jZUNvbnRyb2xsZXIuc2NoZWR1bGVyLmdlbmVyYXRlU3RyaXBzKCk7XG4gICAgdGhpcy5jYWxjU2l6ZXMoKTtcbiAgICB0aGlzLl9pc0luaXQgPSB0cnVlO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuSVNNb2RhbC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgZWwgPSB0aGlzLl9pbnN0YW5jZUNvbnRyb2xsZXIucm9vdDtcbiAgaWYgKGVsLmNsYXNzTGlzdC5jb250YWlucygnZGlzcGxheS15ZXMnKSkge1xuICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc3BsYXkteWVzJyk7XG4gIH1cbiAgaWYgKHRoaXMuX2Rlc3Ryb3lPbkNsb3NlKSB7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH1cbiAgY29uc3QgY2xvc2VFdmVudCA9IG5ldyBDdXN0b21FdmVudCgnY2xvc2UnKTtcbiAgZWwuZGlzcGF0Y2hFdmVudChjbG9zZUV2ZW50KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5JU01vZGFsLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2luc3RhbmNlQ29udHJvbGxlci5yb290LnJlbW92ZSgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogb3B0aW9ucyA9PiBuZXcgSVNNb2RhbChvcHRpb25zKVxufTtcbn0se1wiLi4vY3JlYXRlLWV2ZW50LW1vZGFsXCI6MTIsXCIuL2luZGV4LnRwbFwiOjE5LFwiLi90ZW1wbGF0ZXNcIjoyMixcImNzcC1hcHAvbGlicy9odHRwXCI6NTh9XSwxOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBtb2RhbFRlbXBsYXRlID0gcmVxdWlyZSgnLi4vbWFpbi9tb2RhbC50cGwnKTtcbmNvbnN0IHtyYW5nZSwgY3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuY29uc3Qgc2lkZWJhclRwbCA9IC8qaHRtbCovYFxuXG5gO1xuXG5jb25zdCBzY2hlZHVsZXJUcGwgPSAvKmh0bWwqL2BcbiAgPGRpdiBjbGFzcz1cImNtcF9pbmQtc2NoZWR1bGVyXCI+XG4gICAgPGRpdiBjbGFzcz1cInNjaGVkdWxlci1jb250YWluZXJcIj5cbiAgICAgIDxidXR0b24gaWQ9XCJvcGVuLUNFTW9kYWxcIj5PcGVuIG1vZGFsPC9idXR0b24+XG4gICAgICA8ZGl2IGNsYXNzPVwic2NoZWR1bGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJsZWZ0XCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImRhdGUtbW92ZSBkYXRlLXVwLXdyYXBwZXJcIj5cbiAgICAgICAgICAgIDxidXR0b24+PGkgY2xhc3M9XCJpIGktc29ydFwiPjwvaT48L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXRlc1wiPjwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImRhdGUtbW92ZSBkYXRlLWRvd24td3JhcHBlclwiPlxuICAgICAgICAgICAgPGJ1dHRvbj48aSBjbGFzcz1cImkgaS1zb3J0XCI+PC9pPjwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJyaWdodFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdHJpcHNcIj48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidGltZWxpbmUtaFwiPjwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lbGluZS1iXCI+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuYDtcblxuZnVuY3Rpb24gZ2VuZXJhdGVIb3Vyc01hcmtzKHRpbWVsaW5lSGVhZGVyKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBpbml0TWFyZ2luID0gMzA7XG4gICAgY29uc3Qgd2lkdGggPSB0aW1lbGluZUhlYWRlci5vZmZzZXRXaWR0aDtcbiAgICBjb25zdCBudW1zID0gcmFuZ2UoOSwgMjEpO1xuICAgIGNvbnN0IG9mZnNldCA9ICh3aWR0aCAtIGluaXRNYXJnaW4qMikvKG51bXMubGVuZ3RoLTEpO1xuICAgIGNvbnN0IGVsZW1lbnRzID0gbnVtcy5tYXAobnVtID0+IHtcbiAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoJ2hvdXInKTtcbiAgICAgIGRpdi50ZXh0Q29udGVudCA9IG51bTtcbiAgICAgIHJldHVybiBkaXY7XG4gICAgfSk7XG4gICAgbGV0IHN1bSA9IDA7XG5cbiAgICBzdW0gKz0gaW5pdE1hcmdpbjtcbiAgICB0aW1lbGluZUhlYWRlci5hcHBlbmRDaGlsZChlbGVtZW50c1swXSk7XG4gICAgZWxlbWVudHNbMF0udGV4dENvbnRlbnQgPSBudW1zWzBdO1xuICAgIGNvbnN0IHdpZHRoMCA9IGVsZW1lbnRzWzBdLm9mZnNldFdpZHRoO1xuICAgIFxuICAgIGVsZW1lbnRzWzBdLnN0eWxlLmxlZnQgPSAoc3VtLXdpZHRoMC8yKSArICdweCc7XG4gICAgZWxlbWVudHMuc2xpY2UoMSkuZm9yRWFjaChlbCA9PiB7XG4gICAgICBzdW0gKz0gb2Zmc2V0O1xuICAgICAgdGltZWxpbmVIZWFkZXIuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgY29uc3Qgd2lkdGggPSBlbC5vZmZzZXRXaWR0aDtcbiAgICAgIGVsLnN0eWxlLmxlZnQgPSAoc3VtIC0gd2lkdGgvMikgKyAncHgnO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlU3RyaXBzKHN0cmlwc1dyYXBwZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IGluaXRNYXJnaW4gPSAzMDtcbiAgICBjb25zdCB3aWR0aCA9IHN0cmlwc1dyYXBwZXIub2Zmc2V0V2lkdGg7XG4gICAgY29uc3QgbnVtcyA9IHJhbmdlKDksIDIxKTtcbiAgICBjb25zdCBvZmZzZXQgPSAod2lkdGggLSBpbml0TWFyZ2luKjIpLyhudW1zLmxlbmd0aC0xKTtcbiAgICBsZXQgc3VtID0gMDtcblxuICAgIGNvbnN0IHN0cmlwcyA9IG51bXMubWFwKG51bSA9PiB7XG4gICAgICBjb25zdCBzdHJpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgc3RyaXAuY2xhc3NMaXN0LmFkZCgnc3RyaXAnKTtcbiAgICAgIHJldHVybiBzdHJpcDtcbiAgICB9KTtcblxuICAgIHN1bSArPSBpbml0TWFyZ2luO1xuXG4gICAgc3RyaXBzLmZvckVhY2goc3RyaXAgPT4ge1xuICAgICAgc3RyaXAuc3R5bGUubGVmdCA9IHN1bSArICdweCc7XG4gICAgICBzdHJpcHNXcmFwcGVyLmFwcGVuZENoaWxkKHN0cmlwKTtcbiAgICAgIHN1bSArPSBvZmZzZXQ7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdGVtcGxhdGUoKSB7XG4gIGNvbnN0IG1vZGFsVHBsQ29udHJvbGxlciA9IG1vZGFsVGVtcGxhdGUoKTtcbiAgY29uc3Qgc2NoZWR1bGVyID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKHNjaGVkdWxlclRwbCk7XG5cbiAgY29uc3QgZGF0ZVVwID0gc2NoZWR1bGVyLnF1ZXJ5U2VsZWN0b3IoJy5kYXRlLXVwLXdyYXBwZXIgYnV0dG9uJyk7XG4gIGNvbnN0IGRhdGVEb3duID0gc2NoZWR1bGVyLnF1ZXJ5U2VsZWN0b3IoJy5kYXRlLWRvd24td3JhcHBlciBidXR0b24nKTtcbiAgY29uc3QgZGF0ZXMgPSBzY2hlZHVsZXIucXVlcnlTZWxlY3RvcignLmRhdGVzJyk7XG4gIGNvbnN0IHRpbWVsaW5lSGVhZGVyID0gc2NoZWR1bGVyLnF1ZXJ5U2VsZWN0b3IoJy50aW1lbGluZS1oJyk7XG4gIGNvbnN0IHRpbWVsaW5lQm9keSA9IHNjaGVkdWxlci5xdWVyeVNlbGVjdG9yKCcudGltZWxpbmUtYicpO1xuICBjb25zdCBzdHJpcHMgPSBzY2hlZHVsZXIucXVlcnlTZWxlY3RvcignLnN0cmlwcycpO1xuICBjb25zdCBvcGVuQ0VNb2RhbEJ0biA9IHNjaGVkdWxlci5xdWVyeVNlbGVjdG9yKCcjb3Blbi1DRU1vZGFsJyk7XG5cbiAgbW9kYWxUcGxDb250cm9sbGVyLmNvbnRlbnQuYXBwZW5kQ2hpbGQoc2NoZWR1bGVyKTtcblxuICByZXR1cm4ge1xuICAgIC4uLm1vZGFsVHBsQ29udHJvbGxlcixcbiAgICBvcGVuQ0VNb2RhbEJ0bixcbiAgICBzY2hlZHVsZXI6IHtcbiAgICAgIHJvb3Q6IHNjaGVkdWxlcixcbiAgICAgIGRhdGVVcCxcbiAgICAgIGRhdGVEb3duLFxuICAgICAgZGF0ZXMsICAgICAgXG4gICAgICB0aW1lbGluZTogdGltZWxpbmVCb2R5LFxuICAgICAgcmlnaHQ6IHNjaGVkdWxlci5xdWVyeVNlbGVjdG9yKCcucmlnaHQnKSxcbiAgICAgIGdlbmVyYXRlSG91cnNNYXJrczogZ2VuZXJhdGVIb3Vyc01hcmtzKHRpbWVsaW5lSGVhZGVyKSxcbiAgICAgIGdlbmVyYXRlU3RyaXBzOiBnZW5lcmF0ZVN0cmlwcyhzdHJpcHMpXG4gICAgfVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xufSx7XCIuLi9tYWluL21vZGFsLnRwbFwiOjI3LFwiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjY3fV0sMjA6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKGRhdGEpIHtcbiAgY29uc3QgaHRtbCA9IC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCJkYXRlXCI+JHsgZGF0YS50aXRsZSB9PC9kaXY+XG4gIGA7XG4gIGNvbnN0IGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoaHRtbCk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBlbGVtZW50XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo2N31dLDIxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiB0ZW1wbGF0ZShldmVudCkge1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cImV2ZW50XCIgZGF0YS1ldmVudC1pZD1cIiR7IGV2ZW50LmlkIH1cIj48L2Rpdj5cbiAgYDtcbiAgY29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcblxuICByZXR1cm4ge1xuICAgIHJvb3Q6IGVsZW1lbnRcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcbn0se1wiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjY3fV0sMjI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgZGF5VGVtcGxhdGUgPSByZXF1aXJlKCcuL2RheS50cGwnKTtcbmNvbnN0IHRpbWVsaW5lVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RpbWVsaW5lLnRwbCcpO1xuY29uc3QgZXZlbnRUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vZXZlbnQudHBsJyk7XG5jb25zdCB0b29sdGlwVGVtcGxhdGUgPSByZXF1aXJlKCcuL3Rvb2x0aXAudHBsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBkYXlUZW1wbGF0ZSxcbiAgdGltZWxpbmVUZW1wbGF0ZSxcbiAgZXZlbnRUZW1wbGF0ZSxcbiAgdG9vbHRpcFRlbXBsYXRlXG59O1xufSx7XCIuL2RheS50cGxcIjoyMCxcIi4vZXZlbnQudHBsXCI6MjEsXCIuL3RpbWVsaW5lLnRwbFwiOjIzLFwiLi90b29sdGlwLnRwbFwiOjI0fV0sMjM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKCkge1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cInRpbWVsaW5lXCI+PC9kaXY+XG4gIGA7XG4gIGNvbnN0IGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoaHRtbCk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBlbGVtZW50XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo2N31dLDI0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiB0ZW1wbGF0ZShldmVudCkge1xuICBjb25zb2xlLmxvZyhldmVudClcblxuICBsZXQgaW1wb3J0YW5jZTtcbiAgbGV0IGltcG9ydGFuY2VIaW50O1xuICBsZXQgZGVzY3JpcHRpb247XG5cbiAgc3dpdGNoKGV2ZW50LmltcG9ydGFuY2UpIHtcbiAgICBjYXNlICdub25lJzpcbiAgICAgIGltcG9ydGFuY2UgPSAncGVhY2UnO1xuICAgICAgaW1wb3J0YW5jZUhpbnQgPSAnVGhlIGV2ZW50IGlzIG5vdCBpbXBvcnRhbnQnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZGVzaXJhYmxlJzpcbiAgICAgIGltcG9ydGFuY2UgPSAncm9jayc7XG4gICAgICBpbXBvcnRhbmNlSGludCA9ICdUaGUgZXZlbnQgaXMgZGVzaXJhYmxlIHRvIHZpc2l0JztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2ltcG9ydGFudCc6XG4gICAgICBpbXBvcnRhbmNlID0gJ3BhcGVyJztcbiAgICAgIGltcG9ydGFuY2VIaW50ID0gJ1RoZSBldmVudCBpcyBvYmxpZ2F0b3J5IHRvIHZpc2l0JztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBpbXBvcnRhbmNlID0gJ3BlYWNlJztcbiAgICAgIGltcG9ydGFuY2VIaW50ID0gJ1RoZSBldmVudCBpcyBub3QgaW1wb3J0YW50JztcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgaWYgKGV2ZW50LmRlc2NyaXB0aW9uICYmIGV2ZW50LmRlc2NyaXB0aW9uLmxlbmd0aCA+IDE1MCkge1xuICAgIGRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24uc2xpY2UoMCwgMTQ2KSArICcuLi4nO1xuICB9XG4gIGVsc2UgaWYgKCFkZXNjcmlwdGlvbiB8fCBkZXNjcmlwdGlvbi5sZW5ndGggPT0gMCkge1xuICAgIGRlc2NyaXB0aW9uID0gJ05vIGRlc2NyaXB0aW9uIHN1cHBsaWVkJztcbiAgfVxuXG4gIGNvbnN0IGh0bWwgPSAvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwidG9vbHRpcCBuby1kaXNwbGF5XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiaGVhZGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0aXRsZVwiPjxoMz4keyBldmVudC50aXRsZSB9PC9oMz48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImltcG9ydGFuY2VcIiB0aXRsZT1cIiR7IGltcG9ydGFuY2VIaW50IH1cIj48aSBjbGFzcz1cImkgaS1oYW5kLSR7IGltcG9ydGFuY2UgfVwiPjwvaT48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImRlc2NyaXB0aW9uXCI+JHsgZGVzY3JpcHRpb24gfTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImZvb3RlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbSBkZXRhaWxzXCI+PGJ1dHRvbiB0aXRsZT1cIlNob3cgZGV0YWlsc1wiPjxpIGNsYXNzPVwiaSBpLWluZm9cIj48L2k+PC9idXR0b24+PC9kaXY+XG5cbiAgICAgICAgJHtcbiAgICAgICAgICBldmVudC5saW5rID9cbiAgICAgICAgICAvKmh0bWwqL2A8ZGl2IGNsYXNzPVwiaXRlbSBsaW5rXCIgdGl0bGU9XCIkeyBldmVudC5saW5rIH1cIj48YSBocmVmPVwiJHsgZXZlbnQubGluayB9XCI+PGkgY2xhc3M9XCJpIGktbGlua1wiPjwvaT48L2E+PC9kaXY+YCA6XG4gICAgICAgICAgJydcbiAgICAgICAgfVxuXG4gICAgICAgICR7XG4gICAgICAgICAgZXZlbnRbJ3Byb2plY3RfaWQnXSA/XG4gICAgICAgICAgLypodG1sKi9gPGRpdiBjbGFzcz1cIml0ZW0gcHJvamVjdFwiIHRpdGxlPVwiUHJvamVjdCdzIHBhZ2VcIj48YSBkYXRhLXJvdXRlPVwiJHsgZXZlbnRbJ3Byb2plY3RfaWQnXSB9XCI+PGkgY2xhc3M9XCJpIGktcHJvamVjdFwiPjwvaT48L2E+PC9kaXY+YCA6XG4gICAgICAgICAgJydcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgPGRpdiBjbGFzcz1cIml0ZW0gcGFydGljaXBhbnRzXCIgdGl0bGU9XCJOdW1iZXIgb2YgcGFydGljaXBhbnRzXCI+XG4gICAgICAgICAgPGkgY2xhc3M9XCJpIGktdXNlcnNcIj48L2k+IFxuICAgICAgICAgIDxzcGFuPiR7IGV2ZW50WydwYXJ0aWNpcGFudHNfbnVtJ10gfTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbiAgY29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcblxuICByZXR1cm4ge1xuICAgIHJvb3Q6IGVsZW1lbnRcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcbn0se1wiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjY3fV0sMjU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgdGVtcGxhdGUgPSByZXF1aXJlKCcuL2luZGV4LnRwbCcpO1xuY29uc3QgSVNNb2RhbCA9IHJlcXVpcmUoJy4uL2luZGl2aWR1YWwtc2NoZWR1bGVyJyk7XG5cbmNvbnN0IFNjaGVkdWxlckNvbXBvbmVudCA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCB0cGxDb250cm9sbGVyID0gdGVtcGxhdGUoKTtcbiAgbGV0IElTTW9kYWxJbnN0YW5jZSA9IG51bGw7XG5cbiAgdHBsQ29udHJvbGxlci5idG5PcGVuSW5kU2NoLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIGlmICghSVNNb2RhbEluc3RhbmNlKSB7XG4gICAgICBJU01vZGFsSW5zdGFuY2UgPSBJU01vZGFsLmNyZWF0ZSh7IGRlc3Ryb3lPbkNsb3NlOiB0cnVlIH0pO1xuICAgICAgSVNNb2RhbEluc3RhbmNlLnJvb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCAoKSA9PiB7XG4gICAgICAgIElTTW9kYWxJbnN0YW5jZSA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgSVNNb2RhbEluc3RhbmNlLm9wZW4oKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBzdWNjZXNzOiB0cnVlLFxuICAgIGNvbnRyb2xsZXI6IHtcbiAgICAgIGVsZW1lbnQ6IHRwbENvbnRyb2xsZXIucm9vdFxuICAgIH1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2NoZWR1bGVyQ29tcG9uZW50O1xufSx7XCIuLi9pbmRpdmlkdWFsLXNjaGVkdWxlclwiOjE4LFwiLi9pbmRleC50cGxcIjoyNn1dLDI2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiB0ZW1wbGF0ZSgpIHtcbiAgY29uc3QgaHRtbCA9IC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCJjbXBfc2NoZWR1bGVyLWRib2FyZFwiPlxuICAgICAgPGJ1dHRvbiBpZD1cImJ0bi1vcGVuLWluZFNjaFwiPk9wZW4gaW5kaXZpZHVhbCBzY2hlZHVsZXI8YnV0dG9uPlxuICAgIDwvZGl2PlxuICBgO1xuICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKGh0bWwpO1xuICBjb25zdCBidG5PcGVuSW5kU2NoID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcjYnRuLW9wZW4taW5kU2NoJyk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBlbGVtZW50LFxuICAgIGJ0bk9wZW5JbmRTY2g6IGJ0bk9wZW5JbmRTY2hcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcbn0se1wiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjY3fV0sMjc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKCkge1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cImNtcF9zY2hlZHVsZXJcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzaWRlYmFyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJiYWNrLXdyYXBwZXIgbW9kYWwtY2xvc2VcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYmFjay1pY29uXCI+PGkgY2xhc3M9XCJpIGktYXJyb3dcIj48L2k+PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImJhY2stbGFiZWxcIj5CYWNrIHRvIGRhc2hib2FyZDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnRcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbiAgY29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcbiAgY29uc3QgY2xvc2VCdG4gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tb2RhbC1jbG9zZScpO1xuICBjb25zdCBzaWRlYmFyID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2lkZWJhcicpO1xuICBjb25zdCBjb250ZW50ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudCcpO1xuICBcbiAgcmV0dXJuIHtcbiAgICByb290OiBlbGVtZW50LFxuICAgIGNsb3NlQnRuLFxuICAgIHNpZGViYXIsXG4gICAgY29udGVudFxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xufSx7XCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6Njd9XSwyODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBNb2RhbCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9tb2RhbHMnKTtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvaHR0cCcpO1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmZ1bmN0aW9uIGxpc3RUZW1wbGF0ZSgpIHtcbiAgY29uc3QgaHRtbCA9IC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCJjbXBfc2VsLXBzXCI+PC9kaXY+XG4gIGA7XG4gIGNvbnN0IGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoaHRtbCk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBlbGVtZW50XG4gIH07XG59XG5cbmZ1bmN0aW9uIHBhcnRpY2lwYW50VGVtcGxhdGUocGFydGljaXBhbnQpIHtcbiAgY29uc3Qgc2VsZWN0ZWQgPSBwYXJ0aWNpcGFudC5zZWxlY3RlZCA/ICdzZWxlY3RlZCcgOiAnJztcbiAgY29uc3QgdXNlcm5hbWUgPSBwYXJ0aWNpcGFudC55b3UgPyAnWW91JyA6IHBhcnRpY2lwYW50Wyd1c2VybmFtZSddO1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cInBhcnRpY2lwYW50ICR7IHNlbGVjdGVkIH1cIiBkYXRhLWlkPVwiJHsgcGFydGljaXBhbnRbJ3VzZXJfaWQnXSB9XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwic2VsZWN0LWJveFwiPjxpIGNsYXNzPVwiaSBpLWNoZWNrXCI+PC9pPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInVzZXItaW5mb1wiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1uYW1lXCI+JHsgdXNlcm5hbWUgfTwvZGl2PlxuICAgICAgICAke1xuICAgICAgICAgIHBhcnRpY2lwYW50WydidXN5J10gP1xuICAgICAgICAgIC8qaHRtbCovYDxkaXYgY2xhc3M9XCJidXN5XCI+PGkgY2xhc3M9XCJpIGktY2xvY2tcIj48L2k+IEJ1c3k8L2Rpdj5gXG4gICAgICAgICAgOiAnJ1xuICAgICAgICB9XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbiAgY29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcblxuICByZXR1cm4ge1xuICAgIHJvb3Q6IGVsZW1lbnRcbiAgfTtcbn1cblxuZnVuY3Rpb24gU1BNb2RhbChvcHRpb25zKSB7XG4gIGNvbnN0IHtcbiAgICBwYXJ0aWNpcGFudHM6IHBhcnRpY2lwYW50c1NlbGVjdGVkLFxuICAgIGRhdGUsXG4gICAgdGltZUZyb20sXG4gICAgdGltZVRvXG4gIH0gPSBvcHRpb25zO1xuXG4gIGNvbnN0IFNQTW9kYWxJbnN0YW5jZSA9IE1vZGFsLmNyZWF0ZSh7XG4gICAgdHlwZTogJ3N0YW5kYXJkJyxcbiAgICB0aXRsZTogJ1NlbGVjdCBwYXJ0aWNpcGFudHMnLFxuICAgIHdpZHRoOiAzMDAsXG4gICAgaGVpZ2h0OiAyMDAsXG4gICAgZGVmYXVsdEFjdGlvbnM6IHRydWUsXG4gICAgZGVzdHJveU9uQ2xvc2U6IHRydWVcbiAgfSk7XG5cbiAgY29uc3QgcGFyYW1zID0geyBkYXRlLCB0aW1lRnJvbSwgdGltZVRvIH07XG4gIGNvbnN0IHRwbENvbnRyb2xsZXIgPSBsaXN0VGVtcGxhdGUoKTtcbiAgY29uc3Qgc3VibWl0ID0gU1BNb2RhbEluc3RhbmNlLmVsZW1lbnRzLnN1Ym1pdDtcbiAgbGV0IHBhcnRpY2lwYW50cyA9IFtdO1xuICBcbiAgU1BNb2RhbEluc3RhbmNlLmVsZW1lbnRzLmJvZHkuYXBwZW5kQ2hpbGQodHBsQ29udHJvbGxlci5yb290KTtcblxuICBodHRwLnBvc3QoJ3NjaGVkdWxlci9nZXRBbGxGcmllbmRzQmFzZWRPbkF2YWlsYWJpbGl0eScsIHBhcmFtcylcbiAgICAudGhlbihmcmllbmRzID0+IHtcbiAgICAgIGZyaWVuZHMgPSBmcmllbmRzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgaWYgKGEueW91ID09IGZhbHNlKSByZXR1cm4gMTtcbiAgICAgICAgaWYgKGIueW91ID09IGZhbHNlKSByZXR1cm4gLTE7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfSk7XG5cbiAgICAgIGZyaWVuZHMuZm9yRWFjaChmcmllbmQgPT4ge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IHBhcnRpY2lwYW50c1NlbGVjdGVkLmZpbmRJbmRleChwID0+IHBbJ3VzZXJfaWQnXSA9PT0gZnJpZW5kWyd1c2VyX2lkJ10pO1xuICAgICAgICBmcmllbmQuc2VsZWN0ZWQgPSBzZWxlY3RlZCA+IC0xO1xuICAgICAgICBwYXJ0aWNpcGFudHMucHVzaChmcmllbmQpO1xuICAgICAgfSk7XG5cbiAgICAgIHBhcnRpY2lwYW50cy5mb3JFYWNoKHAgPT4ge1xuICAgICAgICBjb25zdCBQSXRlbVRwbENvbnRyb2xsZXIgPSBwYXJ0aWNpcGFudFRlbXBsYXRlKHApO1xuICAgICAgICB0cGxDb250cm9sbGVyLnJvb3QuYXBwZW5kQ2hpbGQoUEl0ZW1UcGxDb250cm9sbGVyLnJvb3QpO1xuICAgICAgfSk7XG5cbiAgICAgIHRwbENvbnRyb2xsZXIucm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2dCA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnRpY2lwYW50VHBsID0gZXZ0LnRhcmdldC5jbG9zZXN0KCcucGFydGljaXBhbnQnKTtcbiAgICAgICAgaWYgKCFwYXJ0aWNpcGFudFRwbCkgcmV0dXJuO1xuICAgICAgICBjb25zdCB1c2VySWQgPSArcGFydGljaXBhbnRUcGwuZGF0YXNldC5pZDtcbiAgICAgICAgY29uc3QgcGFydGljaXBhbnQgPSBwYXJ0aWNpcGFudHMuZmluZChwID0+IHBbJ3VzZXJfaWQnXSA9PT0gdXNlcklkKTtcbiAgICAgICAgcGFydGljaXBhbnQuc2VsZWN0ZWQgPSAhcGFydGljaXBhbnQuc2VsZWN0ZWQ7XG4gICAgICAgIHBhcnRpY2lwYW50VHBsLmNsYXNzTGlzdC50b2dnbGUoJ3NlbGVjdGVkJyk7XG4gICAgICAgIGRpc2FibGVPbkJ1c3lTZWxlY3RlZCgpO1xuICAgICAgfSk7XG5cbiAgICAgIHN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHBhcnRpY2lwYW50cy5maWx0ZXIocCA9PiBwLnNlbGVjdGVkKTtcbiAgICAgICAgY29uc3Qgc3VibWl0RXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ3BhcnRpY2lwYW50c1NlbGVjdGVkJywgeyBkZXRhaWw6IHtwYXJ0aWNpcGFudHM6IGRhdGF9IH0pO1xuICAgICAgICBTUE1vZGFsSW5zdGFuY2UuZWxlbWVudHMucm9vdC5kaXNwYXRjaEV2ZW50KHN1Ym1pdEV2ZW50KTtcbiAgICAgICAgU1BNb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgICB9KTtcblxuICAgICAgZGlzYWJsZU9uQnVzeVNlbGVjdGVkKCk7XG4gICAgfSlcbiAgO1xuXG4gIGZ1bmN0aW9uIGRpc2FibGVPbkJ1c3lTZWxlY3RlZCgpIHtcbiAgICBjb25zdCBidXN5U2VsZWN0ZWQgPSBwYXJ0aWNpcGFudHMuZmluZChwID0+IHAuc2VsZWN0ZWQgJiYgcFsnYnVzeSddKTtcblxuICAgIGlmIChidXN5U2VsZWN0ZWQgJiYgIXN1Ym1pdC5nZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJykpIHtcbiAgICAgIHN1Ym1pdC5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKCFidXN5U2VsZWN0ZWQgJiYgc3VibWl0LmdldEF0dHJpYnV0ZSgnZGlzYWJsZWQnKSkge1xuICAgICAgc3VibWl0LnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gU1BNb2RhbEluc3RhbmNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiBvcHRpb25zID0+IG5ldyBTUE1vZGFsKG9wdGlvbnMpXG59O1xufSx7XCJjc3AtYXBwL2NvbXBvbmVudHMvbW9kYWxzXCI6NyxcImNzcC1hcHAvbGlicy9odHRwXCI6NTgsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6Njd9XSwyOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBGb3JtID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2Zvcm1zJyk7XG5jb25zdCB7bWluTGVuZ3RoLCBtYXhMZW5ndGgsIHN0YXJ0c1dpdGhOdW1iZXJ9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2Zvcm1zL3ZhbGlkYXRvcnMnKTtcblxuY29uc3QgdXNlcm5hbWUgPSB7XG4gIGtleU5hbWU6ICd1c2VybmFtZScsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tdXNlcm5hbWUnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3RleHQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdVc2VybmFtZSd9XG4gIF0sXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ21heExlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtYXhMZW5ndGhcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdzdGFydHNXaXRoTnVtYmVyJyxcbiAgICAgIGhhbmRsZXI6IHN0YXJ0c1dpdGhOdW1iZXJcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IHBhc3N3b3JkID0ge1xuICBrZXlOYW1lOiAncGFzc3dvcmQnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICdwYXNzd29yZCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1Bhc3N3b3JkJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgY29uZmlybVBhc3N3b3JkID0ge1xuICBrZXlOYW1lOiAnY29uZmlybVBhc3N3b3JkJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1jb25maXJtUGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3Bhc3N3b3JkJ30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnQ29uZmlybSBwYXNzd29yZCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGVtYWlsID0ge1xuICBrZXlOYW1lOiAnZW1haWwnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICd0ZXh0J30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnRS1tYWlsJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgY2xpZW50Rm9ybSA9IG5ldyBGb3JtKHtcbiAgdmFsaWRhdG9yczogW10sXG4gIHN1Ym1pdDoge1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uKHZhbHVlcywgZXZ0KSB7XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3JtIGlzIGNsZWFuJyk7XG4gICAgfVxuICB9LFxuICBjb250cm9sczogW1xuICAgIHVzZXJuYW1lLFxuICAgIHBhc3N3b3JkLFxuICAgIGNvbmZpcm1QYXNzd29yZCxcbiAgICBlbWFpbFxuICBdXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjbGllbnRGb3JtO1xufSx7XCJjc3AtYXBwL2xpYnMvZm9ybXNcIjo1NixcImNzcC1hcHAvbGlicy9mb3Jtcy92YWxpZGF0b3JzXCI6NTd9XSwzMDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBGb3JtID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2Zvcm1zJyk7XG5jb25zdCB7bWluTGVuZ3RoLCBtYXhMZW5ndGgsIHN0YXJ0c1dpdGhOdW1iZXJ9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2Zvcm1zL3ZhbGlkYXRvcnMnKTtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvaHR0cCcpXG5cbmNvbnN0IHVzZXJuYW1lID0ge1xuICBrZXlOYW1lOiAndXNlcm5hbWUnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXVzZXJuYW1lJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICd0ZXh0J30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnVXNlcm5hbWUnfVxuICBdLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdtYXhMZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWF4TGVuZ3RoXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnc3RhcnRzV2l0aE51bWJlcicsXG4gICAgICBoYW5kbGVyOiBzdGFydHNXaXRoTnVtYmVyXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBwYXNzd29yZCA9IHtcbiAga2V5TmFtZTogJ3Bhc3N3b3JkJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1wYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAncGFzc3dvcmQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdQYXNzd29yZCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGNvbmZpcm1QYXNzd29yZCA9IHtcbiAga2V5TmFtZTogJ2NvbmZpcm1QYXNzd29yZCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tY29uZmlybVBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICdwYXNzd29yZCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ0NvbmZpcm0gcGFzc3dvcmQnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBlbWFpbCA9IHtcbiAga2V5TmFtZTogJ2VtYWlsJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1wYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAndGV4dCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ0UtbWFpbCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IG9yZyA9IHtcbiAga2V5TmFtZTogJ29yZycsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tcGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3RleHQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdZb3VyIG9yZ2FuaXphdGlvbid9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGV4ZWNGb3JtID0gbmV3IEZvcm0oe1xuICB2YWxpZGF0b3JzOiBbXSxcbiAgc3VibWl0OiB7XG4gICAgaGFuZGxlcjogZnVuY3Rpb24odmFsdWVzLCBldnQpIHtcbiAgICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICAgIHVzZXJuYW1lOiB2YWx1ZXMudXNlcm5hbWUsXG4gICAgICAgIGVtYWlsOiB2YWx1ZXMuZW1haWwsXG4gICAgICAgIHBhc3N3b3JkOiB2YWx1ZXMucGFzc3dvcmRcbiAgICAgIH07XG5cbiAgICAgIGh0dHAucG9zdCgnYXV0aC9zaWdudXAvZXhlYycsIGJvZHkpXG4gICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSlcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcilcbiAgICAgICAgfSlcbiAgICAgIDtcbiAgICB9XG4gIH0sXG4gIGNvbnRyb2xzOiBbXG4gICAgdXNlcm5hbWUsXG4gICAgcGFzc3dvcmQsXG4gICAgY29uZmlybVBhc3N3b3JkLFxuICAgIGVtYWlsLFxuICAgIG9yZ1xuICBdXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBleGVjRm9ybTtcbn0se1wiY3NwLWFwcC9saWJzL2Zvcm1zXCI6NTYsXCJjc3AtYXBwL2xpYnMvZm9ybXMvdmFsaWRhdG9yc1wiOjU3LFwiY3NwLWFwcC9saWJzL2h0dHBcIjo1OH1dLDMxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMnKTtcbmNvbnN0IHttaW5MZW5ndGgsIG1heExlbmd0aCwgc3RhcnRzV2l0aE51bWJlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMvdmFsaWRhdG9ycycpO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9odHRwJyk7XG5jb25zdCBNYWluQ29udHJvbGxlciA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9tYWluJyk7XG5jb25zdCBEYXNoYm9hcmQgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkJyk7XG5cbmNvbnN0IHVzZXJuYW1lID0ge1xuICBrZXlOYW1lOiAndXNlcm5hbWUnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXVzZXJuYW1lJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICd0ZXh0J30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnVXNlcm5hbWUnfVxuICBdLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdtYXhMZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWF4TGVuZ3RoXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnc3RhcnRzV2l0aE51bWJlcicsXG4gICAgICBoYW5kbGVyOiBzdGFydHNXaXRoTnVtYmVyXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBwYXNzd29yZCA9IHtcbiAga2V5TmFtZTogJ3Bhc3N3b3JkJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1wYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAncGFzc3dvcmQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdQYXNzd29yZCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGxvZ2luRm9ybSA9IG5ldyBGb3JtKHtcbiAgdmFsaWRhdG9yczogW10sXG4gIHN1Ym1pdDoge1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgY29uc3Qge3VzZXJuYW1lLCBwYXNzd29yZH0gPSB2YWx1ZXM7XG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgfTtcblxuICAgICAgaHR0cC5wb3N0KCdhdXRoL2xvZ2luJywgZGF0YSlcbiAgICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgICBpZiAoIXJlcy5zdWNjZXNzKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlcy5lcnJvci5tZXNzYWdlKTtcblxuICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYXV0aF90b2tlbicsIHJlcy5kYXRhLnRva2VuKTtcbiAgICAgICAgICBNYWluQ29udHJvbGxlci5yZW5kZXIoW0Rhc2hib2FyZF0pO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVyci5tZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBjb250cm9sczogW1xuICAgIHVzZXJuYW1lLFxuICAgIHBhc3N3b3JkXG4gIF1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvZ2luRm9ybTtcbn0se1wiY3NwLWFwcC9jb21wb25lbnRzL2Rhc2hib2FyZFwiOjEsXCJjc3AtYXBwL2NvbXBvbmVudHMvbWFpblwiOjUsXCJjc3AtYXBwL2xpYnMvZm9ybXNcIjo1NixcImNzcC1hcHAvbGlicy9mb3Jtcy92YWxpZGF0b3JzXCI6NTcsXCJjc3AtYXBwL2xpYnMvaHR0cFwiOjU4fV0sMzI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgbG9naW5Gb3JtID0gcmVxdWlyZSgnLi9Mb2dpbkZvcm0nKTtcbmNvbnN0IGNsaWVudEZvcm0gPSByZXF1aXJlKCcuL0NsaWVudEZvcm0nKTtcbmNvbnN0IGV4ZWNGb3JtID0gcmVxdWlyZSgnLi9FeGVjRm9ybScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9naW5Gb3JtLFxuICBjbGllbnRGb3JtLFxuICBleGVjRm9ybVxufTtcbn0se1wiLi9DbGllbnRGb3JtXCI6MjksXCIuL0V4ZWNGb3JtXCI6MzAsXCIuL0xvZ2luRm9ybVwiOjMxfV0sMzM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgdGVtcGxhdGUgPSByZXF1aXJlKCcuL3N0YXJ0LnRwbCcpO1xuY29uc3QgdGFicyA9IHJlcXVpcmUoJy4vdGFicycpO1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTCwgU2luZ2xldG9ufSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuY29uc3QgU3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCh0ZW1wbGF0ZSgpKTtcbiAgY29uc3QgdGFic1dyYXBwZXIgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zdGFydC10YWJzJyk7XG4gIHRhYnNXcmFwcGVyLmFwcGVuZENoaWxkKHRhYnMuaGVhZGVyLmVsZW1lbnQpO1xuICB0YWJzV3JhcHBlci5hcHBlbmRDaGlsZCh0YWJzLmNvbnRlbnQuZWxlbWVudCk7XG5cbiAgcmV0dXJuIHtcbiAgICBzdWNjZXNzOiB0cnVlLFxuICAgIGNvbnRyb2xsZXI6IHtcbiAgICAgIGVsZW1lbnQ6IGVsZW1lbnRcbiAgICB9ICAgIFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaW5nbGV0b24oU3RhcnQpO1xufSx7XCIuL3N0YXJ0LnRwbFwiOjM0LFwiLi90YWJzXCI6MzUsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6Njd9XSwzNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5mdW5jdGlvbiB0ZW1wbGF0ZShkYXRhKSB7XG4gIHJldHVybiAvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwiY21wX3N0YXJ0XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwid3JhcHBlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImxvZ28tYmxvY2tcIj5cbiAgICAgICAgICAgIDxoMT5XZWxjb21lIHRvIENvbnN1bHRpbmcgU2VydmljZXMgUGxhdGZvcm08L2gxPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIFxuICAgICAgICAgIDxhIGRhdGEtcm91dGU9XCIvXCI+SG9tZTwvYT5cbiAgICAgICAgICA8YSBkYXRhLXJvdXRlPVwiL2Rhc2hib2FyZFwiPkRhc2hib2FyZDwvYT5cblxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGFydC10YWJzXCI+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG59LHt9XSwzNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBUYWJzID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3RhYnMnKTtcbmNvbnN0IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKS5jcmVhdGVFbGVtZW50RnJvbUhUTUw7XG5jb25zdCBzaWdudXBUYWJzID0gcmVxdWlyZSgnLi9zaWdudXBUYWJzJyk7XG5jb25zdCBsb2dpbkZvcm0gPSByZXF1aXJlKCcuLi9mb3Jtcy9Mb2dpbkZvcm0nKTtcbmNvbnN0IHJhZGlhbEdyYWRpZW50T25Ib3ZlciA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9taXNjL2J1dHRvbi1lZmZlY3RzL3JhZGlhbEdyYWRpZW50T25Ib3ZlcicpO1xuXG5jb25zdCBsb2dpbkJsb2NrID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICA8ZGl2IGNsYXNzPVwibG9naW4tYmxvY2tcIj5cbiAgICA8ZGl2IGNsYXNzPVwiaGVhZGVyXCI+PGgyPkxvZyBpbjwvaDI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImZvcm1cIj48L2Rpdj5cbiAgPC9kaXY+XG5gKTtcblxuY29uc3Qgc2lnbnVwQmxvY2sgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJzaWdudXAtYmxvY2tcIj48L2Rpdj5cbmApO1xuXG5jb25zdCBzdGFydFRhYnMgPSBuZXcgVGFicyh7XG4gIGhlYWRlcjoge1xuICAgIGNsYXNzTmFtZTogJ21haW4tYWN0aW9ucycsXG4gICAgaXRlbXM6IFtcbiAgICAgIHt0aXRsZTogJ0xvZyBpbicsIHRhZzogJ2J1dHRvbid9LFxuICAgICAge3RpdGxlOiAnU2lnbiB1cCcsIHRhZzogJ2J1dHRvbid9XG4gICAgXVxuICB9LFxuICBjb250ZW50OiB7XG4gICAgaXRlbXM6IFtcbiAgICAgIGxvZ2luQmxvY2ssXG4gICAgICBzaWdudXBCbG9ja1xuICAgIF1cbiAgfSxcbiAgYW5pbWF0aW9uOiB7XG4gICAgbmFtZTogJ2xvZ2luU2lnbnVwU3dpdGNoJ1xuICB9XG59KTtcblxuY29uc3QgY29udGVudFdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbmNvbnRlbnRXcmFwcGVyLmNsYXNzTGlzdC5hZGQoJ2Zvcm1zJyk7XG5jb250ZW50V3JhcHBlci5hcHBlbmRDaGlsZChzaWdudXBUYWJzLmNvbnRlbnQuZWxlbWVudCk7XG5cbnN0YXJ0VGFicy5jb250ZW50Lml0ZW1zWzBdLnF1ZXJ5U2VsZWN0b3IoJy5sb2dpbi1ibG9jayAuZm9ybScpLmFwcGVuZENoaWxkKGxvZ2luRm9ybS5yZWYpO1xuc3RhcnRUYWJzLmNvbnRlbnQuaXRlbXNbMV0uYXBwZW5kQ2hpbGQoc2lnbnVwVGFicy5oZWFkZXIuZWxlbWVudCk7XG5zdGFydFRhYnMuY29udGVudC5pdGVtc1sxXS5hcHBlbmRDaGlsZChjb250ZW50V3JhcHBlcik7XG5cbnN0YXJ0VGFicy5oZWFkZXIuaXRlbXMuZm9yRWFjaChpdGVtID0+IHJhZGlhbEdyYWRpZW50T25Ib3ZlcihpdGVtLCB7cGFkZGluZzogWzEwLCAxNl19KSk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhcnRUYWJzO1xufSx7XCIuLi9mb3Jtcy9Mb2dpbkZvcm1cIjozMSxcIi4vc2lnbnVwVGFic1wiOjM2LFwiY3NwLWFwcC9saWJzL21pc2MvYnV0dG9uLWVmZmVjdHMvcmFkaWFsR3JhZGllbnRPbkhvdmVyXCI6NTksXCJjc3AtYXBwL2xpYnMvdGFic1wiOjY2LFwiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjY3fV0sMzY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgVGFicyA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy90YWJzJyk7XG5jb25zdCBjcmVhdGVFbGVtZW50RnJvbUhUTUwgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJykuY3JlYXRlRWxlbWVudEZyb21IVE1MO1xuY29uc3Qge2NsaWVudEZvcm0sIGV4ZWNGb3JtfSA9IHJlcXVpcmUoJy4uL2Zvcm1zJyk7XG5jb25zdCByYWRpYWxHcmFkaWVudE9uSG92ZXIgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvbWlzYy9idXR0b24tZWZmZWN0cy9yYWRpYWxHcmFkaWVudE9uSG92ZXInKTtcblxuY29uc3QgY2xpZW50Rm9ybUJsb2NrID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICA8ZGl2IGNsYXNzPVwiY2xpZW50LWZvcm0gZm9ybVwiPjwvZGl2PlxuYCk7XG5cbmNvbnN0IGV4ZWNGb3JtQmxvY2sgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJleGVjLWZvcm0gZm9ybVwiPjwvZGl2PlxuYCk7XG5cbmNvbnN0IGFjYWRlbWljRm9ybUJsb2NrID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICA8ZGl2IGNsYXNzPVwiZm9ybVwiPkFjYWRlbWljPC9kaXY+XG5gKTtcblxuY29uc3Qgc3R1ZGVudEZvcm1CbG9jayA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCgvKmh0bWwqL2BcbiAgPGRpdiBjbGFzcz1cImZvcm1cIj5TdHVkZW50PC9kaXY+XG5gKTtcblxuY29uc3Qgc2lnbnVwVGFicyA9IG5ldyBUYWJzKHtcbiAgaGVhZGVyOiB7XG4gICAgY2xhc3NOYW1lOiAnYWN0aW9ucyBjbGVhcmZpeCcsXG4gICAgaXRlbXM6IFtcbiAgICAgIHt0aXRsZTogJ1NpZ24gdXAgYXMgY2xpZW50JywgdGFnOiAnYnV0dG9uJ30sXG4gICAgICB7dGl0bGU6ICdTaWduIHVwIGFzIGV4ZWN1dG9yJywgdGFnOiAnYnV0dG9uJ30sXG4gICAgICB7dGl0bGU6ICdBcyBhY2FkZW1pYycsIHRhZzogJ2J1dHRvbid9LFxuICAgICAge3RpdGxlOiAnQXMgc3R1ZGVudCcsIHRhZzogJ2J1dHRvbid9XG4gICAgXVxuICB9LFxuICBjb250ZW50OiB7XG4gICAgaXRlbXM6IFtcbiAgICAgIGNsaWVudEZvcm1CbG9jayxcbiAgICAgIGV4ZWNGb3JtQmxvY2ssXG4gICAgICBhY2FkZW1pY0Zvcm1CbG9jayxcbiAgICAgIHN0dWRlbnRGb3JtQmxvY2tcbiAgICBdXG4gIH0sXG4gIGFuaW1hdGlvbjoge1xuICAgIG5hbWU6ICd0YWJzRmxvd0FuaW1hdGlvbicsXG4gICAgcGFyYW1zOiB7cGFkZGluZzogMTUsIHNwZWVkOiA4NTB9XG4gIH1cbn0pO1xuXG5zaWdudXBUYWJzLmNvbnRlbnQuaXRlbXNbMF0uYXBwZW5kQ2hpbGQoY2xpZW50Rm9ybS5yZWYpO1xuc2lnbnVwVGFicy5jb250ZW50Lml0ZW1zWzFdLmFwcGVuZENoaWxkKGV4ZWNGb3JtLnJlZik7XG5cbnNpZ251cFRhYnMuaGVhZGVyLml0ZW1zLmZvckVhY2goaXRlbSA9PiByYWRpYWxHcmFkaWVudE9uSG92ZXIoaXRlbSwge3BhZGRpbmc6IDE1fSkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNpZ251cFRhYnM7XG59LHtcIi4uL2Zvcm1zXCI6MzIsXCJjc3AtYXBwL2xpYnMvbWlzYy9idXR0b24tZWZmZWN0cy9yYWRpYWxHcmFkaWVudE9uSG92ZXJcIjo1OSxcImNzcC1hcHAvbGlicy90YWJzXCI6NjYsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6Njd9XSwzNzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBUZXN0ID0ge1xuICAgIGh0bWw6IGBcbiAgICAgICAgPGRpdiBpZD1cInRlc3RcIj5cbiAgICAgICAgICAgIDxoMT5UaGlzIGlzIFRlc3QgY29tcG9uZW50PC9oMT5cbiAgICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBpbnN0YW50aWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGVtcC5pbm5lckhUTUwgPSB0aGlzLmh0bWw7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0ZW1wLmZpcnN0RWxlbWVudENoaWxkXG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24oRE9NVHJlZSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChET01UcmVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGVzdC5pbnN0YW50aWF0ZSgpO1xufSx7fV0sMzg6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge1xuICBBbGxVc2Vyc1RhYkNvbXBvbmVudCxcbiAgRnJpZW5kc1RhYkNvbXBvbmVudCxcbiAgSW5jb21pbmdSZXF1ZXN0c1RhYkNvbXBvbmVudCxcbiAgT3V0Z29pbmdSZXF1ZXN0c1RhYkNvbXBvbmVudFxufSA9IHJlcXVpcmUoJy4vdGFicycpO1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5jb25zdCBUYWJzID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3RhYnMnKTtcblxuZnVuY3Rpb24gVXNlcnNDb21wb25lbnQoKSB7IFxuICByZXR1cm4gUHJvbWlzZVxuICAgIC5hbGwoW1xuICAgICAgQWxsVXNlcnNUYWJDb21wb25lbnQoKSxcbiAgICAgIEZyaWVuZHNUYWJDb21wb25lbnQoKSxcbiAgICAgIEluY29taW5nUmVxdWVzdHNUYWJDb21wb25lbnQoKSxcbiAgICAgIE91dGdvaW5nUmVxdWVzdHNUYWJDb21wb25lbnQoKVxuICAgIF0pXG4gICAgLnRoZW4oKFthbGxVc2Vyc1RhYiwgZnJpZW5kc1RhYiwgSVJUYWIsIE9SVGFiXSkgPT4ge1xuICAgICAgY29uc3QgdGFicyA9IG5ldyBUYWJzKHtcbiAgICAgICAgaGVhZGVyOiB7XG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHt0aXRsZTogJ0FsbCB1c2VycycsIHRhZzogJ2J1dHRvbid9LFxuICAgICAgICAgICAge3RpdGxlOiBgRnJpZW5kcyAoJHtmcmllbmRzVGFiLmZyaWVuZHNBbW91bnR9KWAsIHRhZzogJ2J1dHRvbid9LFxuICAgICAgICAgICAge3RpdGxlOiBgSW5jb21pbmcgcmVxdWVzdHMgKCR7SVJUYWIucmVxdWVzdHNBbW91bnR9KWAsIHRhZzogJ2J1dHRvbid9LFxuICAgICAgICAgICAge3RpdGxlOiBgT3V0Z29pbmcgcmVxdWVzdHMgKCR7T1JUYWIucmVxdWVzdHNBbW91bnR9KWAsIHRhZzogJ2J1dHRvbid9XG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIGFsbFVzZXJzVGFiLmVsZW1lbnQsXG4gICAgICAgICAgICBmcmllbmRzVGFiLmVsZW1lbnQsXG4gICAgICAgICAgICBJUlRhYi5lbGVtZW50LFxuICAgICAgICAgICAgT1JUYWIuZWxlbWVudFxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgbmFtZTogJ2RlZmF1bHRBbmltJ1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICBcbiAgICAgIGNvbnN0IHdyYXBwZXIgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoJzxkaXYgY2xhc3M9XCJjbXBfdXNlcnNcIj48L2Rpdj4nKTtcbiAgICBcbiAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQodGFicy5oZWFkZXIuZWxlbWVudCk7XG4gICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKHRhYnMuY29udGVudC5lbGVtZW50KTtcbiAgICBcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXI6IHtcbiAgICAgICAgICBlbGVtZW50OiB3cmFwcGVyXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSlcbiAgO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFVzZXJzQ29tcG9uZW50O1xufSx7XCIuL3RhYnNcIjo1MCxcImNzcC1hcHAvbGlicy90YWJzXCI6NjYsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6Njd9XSwzOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBVc2VyUGFnZUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vdXNlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVXNlclBhZ2VDb21wb25lbnRcbn07XG59LHtcIi4vdXNlclwiOjQwfV0sNDA6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9odHRwJyk7XG5jb25zdCB7bWFpblRlbXBsYXRlLCBibG9ja01vcmVUZW1wbGF0ZX0gPSByZXF1aXJlKCcuL3RlbXBsYXRlcycpO1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmNvbnN0IGZyaWVuZHNNc2cgPSAnWW91IGFyZSBmcmllbmRzJztcbmNvbnN0IGZyaWVuZFJlcVNlbnRNc2cgPSAnWW91IGhhdmUgc2VudCBhIHJlcXVlc3QgdG8gYmVjb21lIGEgZnJpZW5kJztcblxuZnVuY3Rpb24gaW5zZXJ0U2VuZEZyaWVuZFJlcUJ0bihvcHRpb25zKSB7XG4gIGNvbnN0IHRwbENvbnRyb2xsZXIgPSBvcHRpb25zLnRwbENvbnRyb2xsZXI7XG4gIGNvbnN0IHVzZXJJZCA9IG9wdGlvbnMudXNlcklkO1xuXG4gIGNvbnN0IHNlbmRGcmllbmRSZXFCdG4gPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gICAgPGJ1dHRvbiBjbGFzcz1cImJ0bi1wcmltYXJ5XCI+QWRkIHRvIGZyaWVuZHM8L2J1dHRvbj5cbiAgYCk7XG5cbiAgc2VuZEZyaWVuZFJlcUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBodHRwLmdldChgdXNlcnMvc2VuZC1mcmllbmQtcmVxLyR7dXNlcklkfWApXG4gICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICBpZiAocmVzLmFuc3dlcikge1xuICAgICAgICAgIHRwbENvbnRyb2xsZXIuYWRkaXRpb25hbC5pbm5lckhUTUwgPSBmcmllbmRSZXFTZW50TXNnO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIDtcbiAgfSk7XG5cbiAgdHBsQ29udHJvbGxlci5hY3Rpb25XcmFwcGVyLmFwcGVuZENoaWxkKHNlbmRGcmllbmRSZXFCdG4pO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRCbG9ja01vcmUob3B0aW9ucykge1xuICBjb25zdCB0cGxDb250cm9sbGVyID0gb3B0aW9ucy50cGxDb250cm9sbGVyO1xuICBjb25zdCB1c2VySWQgPSBvcHRpb25zLnVzZXJJZDtcbiAgQk1UcGxDb250cm9sbGVyID0gYmxvY2tNb3JlVGVtcGxhdGUoKTtcbiAgICAgICAgICBcbiAgQk1UcGxDb250cm9sbGVyLmJ0bk1vcmUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgQk1UcGxDb250cm9sbGVyLmxpc3QuY2xhc3NMaXN0LnRvZ2dsZSgnbm8tZGlzcGxheScpO1xuICB9KTtcblxuICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBjb25zdCBpc01vcmVCdG4gPSBldnQudGFyZ2V0LmNsb3Nlc3QoJy5idG4tbW9yZScpID09PSBCTVRwbENvbnRyb2xsZXIuYnRuTW9yZTtcbiAgICBjb25zdCBpc01vcmVCbG9jayA9IGV2dC50YXJnZXQuY2xvc2VzdCgnLm1vcmUtbGlzdCcpID09PSBCTVRwbENvbnRyb2xsZXIubGlzdDtcblxuICAgIGlmICghaXNNb3JlQnRuICYmICFpc01vcmVCbG9jaykge1xuICAgICAgQk1UcGxDb250cm9sbGVyLmxpc3QuY2xhc3NMaXN0LmFkZCgnbm8tZGlzcGxheScpO1xuICAgIH1cbiAgfSk7XG5cbiAgQk1UcGxDb250cm9sbGVyLmJ0blJlbW92ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBodHRwLmdldChgdXNlcnMvcmVtb3ZlLWZyb20tZnJpZW5kcy8ke3VzZXJJZH1gKVxuICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgaWYgKHJlcy5hbnN3ZXIpIHtcbiAgICAgICAgICB0cGxDb250cm9sbGVyLm1lc3NhZ2UuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgdHBsQ29udHJvbGxlci5tb3JlV3JhcHBlci5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICBpbnNlcnRTZW5kRnJpZW5kUmVxQnRuKHsgdHBsQ29udHJvbGxlciwgdXNlcklkIH0pO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIDtcbiAgfSk7XG5cbiAgdHBsQ29udHJvbGxlci5tb3JlV3JhcHBlci5hcHBlbmRDaGlsZChCTVRwbENvbnRyb2xsZXIucm9vdCk7XG59XG5cbmZ1bmN0aW9uIFVzZXJQYWdlQ29tcG9uZW50KHVzZXJJZCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGh0dHAuZ2V0KGB1c2Vycy9nZXRVc2VyQmFzZS8ke3VzZXJJZH1gKVxuICAgICAgLnRoZW4odXNlciA9PiB7XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyh1c2VyKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogJ1VzZXIgd2l0aCB0aGUgc3VwcGxpZWQgaWQgaGFzIG5vdCBiZWVuIGZvdW5kJ1xuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgICAgIHVzZXIsXG4gICAgICAgICAgaHR0cC5nZXQoYHVzZXJzL21lLWZyaWVuZC13aXRoLyR7dXNlcklkfWApLFxuICAgICAgICAgIGh0dHAuZ2V0KGB1c2Vycy9tZS1zZW50LWZyaWVuZC1yZXEvJHt1c2VySWR9YClcbiAgICAgICAgXSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKFt1c2VyLCBpc0ZyaWVuZE9iaiwgZnJpZW5kUmVxXSkgPT4ge1xuICAgICAgICBjb25zdCB0cGxDb250cm9sbGVyID0gbWFpblRlbXBsYXRlKHVzZXIpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGlzRnJpZW5kT2JqLmFuc3dlcikge1xuICAgICAgICAgIHRwbENvbnRyb2xsZXIubWVzc2FnZS50ZXh0Q29udGVudCA9IGZyaWVuZHNNc2c7XG4gICAgICAgICAgaW5zZXJ0QmxvY2tNb3JlKHsgdHBsQ29udHJvbGxlciwgdXNlcklkIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZyaWVuZFJlcS5yZXF1ZXN0ZWQgJiYgZnJpZW5kUmVxLmFtUmVxdWVzdGVyKSB7XG4gICAgICAgICAgdHBsQ29udHJvbGxlci5tZXNzYWdlLnRleHRDb250ZW50ID0gZnJpZW5kUmVxU2VudE1zZztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmcmllbmRSZXEucmVxdWVzdGVkICYmICFmcmllbmRSZXEuYW1SZXF1ZXN0ZXIpIHtcbiAgICAgICAgICBjb25zdCBjb25maXJtRnJpZW5kUmVxQnRuID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0bi1wcmltYXJ5XCI+Q29uZmlybSB5b3UgYXJlIGZyaWVuZHM8L2J1dHRvbj5cbiAgICAgICAgICBgKTtcblxuICAgICAgICAgIGNvbmZpcm1GcmllbmRSZXFCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICBodHRwLmdldChgdXNlcnMvY29uZmlybS1mcmllbmQtcmVxLyR7dXNlcklkfWApXG4gICAgICAgICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlcy5hbnN3ZXIpIHtcbiAgICAgICAgICAgICAgICAgIHRwbENvbnRyb2xsZXIuYWN0aW9uV3JhcHBlci5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICAgIHRwbENvbnRyb2xsZXIubWVzc2FnZS50ZXh0Q29udGVudCA9IGZyaWVuZHNNc2c7XG4gICAgICAgICAgICAgICAgICBpbnNlcnRCbG9ja01vcmUoeyB0cGxDb250cm9sbGVyLCB1c2VySWQgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdHBsQ29udHJvbGxlci5hY3Rpb25XcmFwcGVyLmFwcGVuZENoaWxkKGNvbmZpcm1GcmllbmRSZXFCdG4pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGluc2VydFNlbmRGcmllbmRSZXFCdG4oeyB0cGxDb250cm9sbGVyLCB1c2VySWQgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBjb250cm9sbGVyOiB7XG4gICAgICAgICAgICBlbGVtZW50OiB0cGxDb250cm9sbGVyLnJvb3RcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KVxuICAgIDtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBVc2VyUGFnZUNvbXBvbmVudDtcbn0se1wiLi90ZW1wbGF0ZXNcIjo0MixcImNzcC1hcHAvbGlicy9odHRwXCI6NTgsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6Njd9XSw0MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuZnVuY3Rpb24gYmxvY2tNb3JlKCkge1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cIm1vcmVcIj5cbiAgICAgIDxidXR0b24gY2xhc3M9XCJidG4tbW9yZVwiPjxpIGNsYXNzPVwiaSBpLW1vcmVcIj48L2k+PC9idXR0b24+XG4gICAgICA8ZGl2IGNsYXNzPVwibW9yZS1saXN0IGJsb2NrLXNoYWRvd2VkIG5vLWRpc3BsYXlcIj5cbiAgICAgICAgPHVsPlxuICAgICAgICAgIDxsaT48YnV0dG9uIGNsYXNzPVwicmVtb3ZlXCI+UmVtb3ZlIHVzZXIgZnJvbSBmcmllbmRzPC9idXR0b24+PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xuICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKGh0bWwpO1xuXG4gIHJldHVybiB7XG4gICAgcm9vdDogZWxlbWVudCxcbiAgICBsaXN0OiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tb3JlLWxpc3QnKSxcbiAgICBidG5Nb3JlOiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4tbW9yZScpLFxuICAgIGJ0blJlbW92ZTogZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcucmVtb3ZlJylcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBibG9ja01vcmU7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo2N31dLDQyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IG1haW5UZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdHBsJyk7XG5jb25zdCBibG9ja01vcmVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vYmxvY2stbW9yZS50cGwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1haW5UZW1wbGF0ZSxcbiAgYmxvY2tNb3JlVGVtcGxhdGVcbn07XG59LHtcIi4vYmxvY2stbW9yZS50cGxcIjo0MSxcIi4vdHBsXCI6NDN9XSw0MzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuZnVuY3Rpb24gdGVtcGxhdGUodXNlcikge1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cImNtcF91c2VyLXBhZ2UgYmxvY2stc2hhZG93ZWRcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJoZWFkZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInRpdGxlXCI+PGgxPiR7dXNlci5maXJzdF9uYW1lfSAke3VzZXIubGFzdF9uYW1lfTwvaDE+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJhZGRpdGlvbmFsXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm1lc3NhZ2VcIj48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnRuLWFjdGlvbi13cmFwcGVyXCI+PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm1vcmUtd3JhcHBlclwiPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgXG4gICAgICA8ZGl2IGNsYXNzPVwiYm9keVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbVwiPkZpcnN0IG5hbWU6ICR7dXNlci5maXJzdF9uYW1lfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbVwiPlNlY29uZCBuYW1lOiAke3VzZXIubGFzdF9uYW1lfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbVwiPlBhdHJvbnltaWM6ICR7dXNlci5wYXRyb255bWljfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbVwiPlVzZXJuYW1lOiAke3VzZXIudXNlcm5hbWV9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpdGVtXCI+RW1haWw6ICR7dXNlci5lbWFpbH08L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xuICBjb25zdCBlbCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcblxuICByZXR1cm4ge1xuICAgIHJvb3Q6IGVsLFxuICAgIGFkZGl0aW9uYWw6IGVsLnF1ZXJ5U2VsZWN0b3IoJy5hZGRpdGlvbmFsJyksXG4gICAgYm9keTogZWwucXVlcnlTZWxlY3RvcignLmJvZHknKSxcbiAgICBtZXNzYWdlOiBlbC5xdWVyeVNlbGVjdG9yKCcubWVzc2FnZScpLFxuICAgIGFjdGlvbldyYXBwZXI6IGVsLnF1ZXJ5U2VsZWN0b3IoJy5idG4tYWN0aW9uLXdyYXBwZXInKSxcbiAgICBtb3JlV3JhcHBlcjogZWwucXVlcnlTZWxlY3RvcignLm1vcmUtd3JhcHBlcicpXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo2N31dLDQ0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvaHR0cCcpO1xuY29uc3QgdGFiVGVtcGxhdGUgPSByZXF1aXJlKCcuLi9jb21tb24vdGFiLnRwbCcpO1xuY29uc3QgY3JlYXRlVXNlcnNMaXN0ID0gcmVxdWlyZSgnLi4vY29tbW9uL2NyZWF0ZVVzZXJzTGlzdCcpO1xuXG5mdW5jdGlvbiBGcmllbmRzVGFiQ29tcG9uZW50KCkge1xuICByZXR1cm4gaHR0cC5nZXQoJ3VzZXJzL2dldEFsbEZyaWVuZHNCYXNlJylcbiAgICAudGhlbihmcmllbmRzID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0YWJUZW1wbGF0ZSh7XG4gICAgICAgIGNsYXNzTmFtZTogJ3RhYi1hbGxmcmllbmRzJyxcbiAgICAgICAgb25MaXN0RW1wdHk6IHtcbiAgICAgICAgICBlbXB0eTogZnJpZW5kcy5sZW5ndGggPT0gMCxcbiAgICAgICAgICBtZXNzYWdlOiAnWW91IGhhdmUgbm8gZnJpZW5kcyB5ZXQnXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoZnJpZW5kcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGZyaWVuZHNFbGVtZW50cyA9IGNyZWF0ZVVzZXJzTGlzdChmcmllbmRzKTtcbiAgICAgICAgZnJpZW5kc0VsZW1lbnRzLmZvckVhY2goZWwgPT4gZWxlbWVudC5yb290LmFwcGVuZENoaWxkKGVsLnJvb3QpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZWxlbWVudDogZWxlbWVudC5yb290LFxuICAgICAgICBmcmllbmRzQW1vdW50OiBmcmllbmRzLmxlbmd0aFxuICAgICAgfTtcbiAgICB9KVxuICA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRnJpZW5kc1RhYkNvbXBvbmVudDtcbn0se1wiLi4vY29tbW9uL2NyZWF0ZVVzZXJzTGlzdFwiOjQ2LFwiLi4vY29tbW9uL3RhYi50cGxcIjo0NyxcImNzcC1hcHAvbGlicy9odHRwXCI6NTh9XSw0NTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IHRhYlRlbXBsYXRlID0gcmVxdWlyZSgnLi4vY29tbW9uL3RhYi50cGwnKTtcbmNvbnN0IGNyZWF0ZVVzZXJzTGlzdCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9jcmVhdGVVc2Vyc0xpc3QnKTtcblxuZnVuY3Rpb24gQWxsVXNlcnNUYWJDb21wb25lbnQoKSB7XG4gIHJldHVybiBodHRwLmdldCgndXNlcnMvZ2V0QWxsT3RoZXJVc2Vyc0Jhc2UnKVxuICAgIC50aGVuKHVzZXJzID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0YWJUZW1wbGF0ZSh7XG4gICAgICAgIGNsYXNzTmFtZTogJ3RhYi1hbGx1c2VycycsXG4gICAgICAgIG9uTGlzdEVtcHR5OiB7XG4gICAgICAgICAgZW1wdHk6IHVzZXJzLmxlbmd0aCA9PSAwLFxuICAgICAgICAgIG1lc3NhZ2U6ICdObyBvbmUgYXBhcnQgZnJvbSB5b3UgaGFzIHJlZ2lzdGVyZWQgb24gdGhlIHNpdGUnXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAodXNlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICB1c2Vyc0VsZW1lbnRzID0gY3JlYXRlVXNlcnNMaXN0KHVzZXJzKTtcbiAgICAgICAgdXNlcnNFbGVtZW50cy5mb3JFYWNoKGVsID0+IGVsZW1lbnQucm9vdC5hcHBlbmRDaGlsZChlbC5yb290KSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQucm9vdFxuICAgICAgfTtcbiAgICB9KVxuICA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQWxsVXNlcnNUYWJDb21wb25lbnQ7XG59LHtcIi4uL2NvbW1vbi9jcmVhdGVVc2Vyc0xpc3RcIjo0NixcIi4uL2NvbW1vbi90YWIudHBsXCI6NDcsXCJjc3AtYXBwL2xpYnMvaHR0cFwiOjU4fV0sNDY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5jb25zdCB1c2VySXRlbVRlbXBsYXRlID0gcmVxdWlyZSgnLi91c2VySXRlbS50cGwnKTtcblxuZnVuY3Rpb24gY3JlYXRlVXNlcnNMaXN0KHVzZXJzKSB7XG4gIHJldHVybiB1c2Vycy5tYXAodXNlciA9PiB7XG4gICAgY29uc3QgdXNlckFjY291bnRMaW5rID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICAgICAgPGEgZGF0YS1yb3V0ZT1cInVzZXJzLyR7dXNlci5pZH1cIj4ke3VzZXIudXNlcm5hbWV9PC9hPlxuICAgIGApO1xuICAgIGNvbnN0IHVzZXJJdGVtID0gdXNlckl0ZW1UZW1wbGF0ZSgpO1xuICAgIHVzZXJJdGVtLnVzZXJuYW1lLmFwcGVuZENoaWxkKHVzZXJBY2NvdW50TGluayk7XG4gICAgcmV0dXJuIHVzZXJJdGVtO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVVc2Vyc0xpc3Q7XG59LHtcIi4vdXNlckl0ZW0udHBsXCI6NDgsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6Njd9XSw0NzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuZnVuY3Rpb24gYWxlcnRPbkVtcHR5KG1lc3NhZ2UpIHtcbiAgcmV0dXJuIC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCJlbXB0eVwiPiR7IG1lc3NhZ2UgfTwvZGl2PlxuICBgO1xufVxuXG5mdW5jdGlvbiB0YWJUZW1wbGF0ZShvcHRpb25zKSB7XG4gIGNvbnN0IGh0bWwgPSAvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwiJHsgb3B0aW9ucy5jbGFzc05hbWUgfVwiPlxuICAgICAgJHtcbiAgICAgICAgb3B0aW9ucy5vbkxpc3RFbXB0eSAmJiBvcHRpb25zLm9uTGlzdEVtcHR5LmVtcHR5ID9cbiAgICAgICAgYWxlcnRPbkVtcHR5KG9wdGlvbnMub25MaXN0RW1wdHkubWVzc2FnZSkgOlxuICAgICAgICAnJ1xuICAgICAgfVxuICAgIDwvZGl2PlxuICBgO1xuICBjb25zdCBlbCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcblxuICByZXR1cm4ge1xuICAgIHJvb3Q6IGVsXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGFiVGVtcGxhdGU7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo2N31dLDQ4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiB1c2VySXRlbVRlbXBsYXRlKCkge1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cInVzZXItaXRlbVwiPlxuICAgICAgPGRpdiBjbGFzcz1cImF2YXRhclwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInVzZXJuYW1lXCI+PC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG4gIGNvbnN0IGVsID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKGh0bWwpO1xuXG4gIHJldHVybiB7XG4gICAgcm9vdDogZWwsXG4gICAgYXZhdGFyOiBlbC5xdWVyeVNlbGVjdG9yKCcuYXZhdGFyJyksXG4gICAgdXNlcm5hbWU6IGVsLnF1ZXJ5U2VsZWN0b3IoJy51c2VybmFtZScpXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdXNlckl0ZW1UZW1wbGF0ZTtcbn0se1wiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjY3fV0sNDk6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9odHRwJyk7XG5jb25zdCB0YWJUZW1wbGF0ZSA9IHJlcXVpcmUoJy4uL2NvbW1vbi90YWIudHBsJyk7XG5jb25zdCBjcmVhdGVVc2Vyc0xpc3QgPSByZXF1aXJlKCcuLi9jb21tb24vY3JlYXRlVXNlcnNMaXN0Jyk7XG5cbmZ1bmN0aW9uIEluY29taW5nUmVxdWVzdHNUYWJDb21wb25lbnQoKSB7XG4gIHJldHVybiBodHRwLmdldCgndXNlcnMvZ2V0QWxsSW5jb21pbmdSZXF1ZXN0cycpXG4gICAgLnRoZW4ocmVxdWVzdGVycyA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGFiVGVtcGxhdGUoe1xuICAgICAgICBjbGFzc05hbWU6ICd0YWItYWxsSW5jUmVxcycsXG4gICAgICAgIG9uTGlzdEVtcHR5OiB7XG4gICAgICAgICAgZW1wdHk6IHJlcXVlc3RlcnMubGVuZ3RoID09IDAsXG4gICAgICAgICAgbWVzc2FnZTogJ05vIGluY29taW5nIHJlcXVlc3RzIHNlbnQgeWV0J1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKHJlcXVlc3RlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICByZXF1ZXN0ZXJzRWxlbWVudHMgPSBjcmVhdGVVc2Vyc0xpc3QocmVxdWVzdGVycyk7XG4gICAgICAgIHJlcXVlc3RlcnNFbGVtZW50cy5mb3JFYWNoKGVsID0+IGVsZW1lbnQucm9vdC5hcHBlbmRDaGlsZChlbC5yb290KSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQucm9vdCxcbiAgICAgICAgcmVxdWVzdHNBbW91bnQ6IHJlcXVlc3RlcnMubGVuZ3RoXG4gICAgICB9O1xuICAgIH0pXG4gIDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbmNvbWluZ1JlcXVlc3RzVGFiQ29tcG9uZW50O1xufSx7XCIuLi9jb21tb24vY3JlYXRlVXNlcnNMaXN0XCI6NDYsXCIuLi9jb21tb24vdGFiLnRwbFwiOjQ3LFwiY3NwLWFwcC9saWJzL2h0dHBcIjo1OH1dLDUwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEFsbFVzZXJzVGFiQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9hbGwtdXNlcnMnKTtcbmNvbnN0IEZyaWVuZHNUYWJDb21wb25lbnQgPSByZXF1aXJlKCcuL2FsbC1mcmllbmRzJylcbmNvbnN0IEluY29taW5nUmVxdWVzdHNUYWJDb21wb25lbnQgPSByZXF1aXJlKCcuL2luY29taW5nLXJlcXVlc3RzJyk7XG5jb25zdCBPdXRnb2luZ1JlcXVlc3RzVGFiQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9vdXRnb2luZy1yZXF1ZXN0cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQWxsVXNlcnNUYWJDb21wb25lbnQsXG4gIEZyaWVuZHNUYWJDb21wb25lbnQsXG4gIEluY29taW5nUmVxdWVzdHNUYWJDb21wb25lbnQsXG4gIE91dGdvaW5nUmVxdWVzdHNUYWJDb21wb25lbnRcbn07XG59LHtcIi4vYWxsLWZyaWVuZHNcIjo0NCxcIi4vYWxsLXVzZXJzXCI6NDUsXCIuL2luY29taW5nLXJlcXVlc3RzXCI6NDksXCIuL291dGdvaW5nLXJlcXVlc3RzXCI6NTF9XSw1MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IHRhYlRlbXBsYXRlID0gcmVxdWlyZSgnLi4vY29tbW9uL3RhYi50cGwnKTtcbmNvbnN0IGNyZWF0ZVVzZXJzTGlzdCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9jcmVhdGVVc2Vyc0xpc3QnKTtcblxuZnVuY3Rpb24gT3V0Z29pbmdSZXF1ZXN0c1RhYkNvbXBvbmVudCgpIHtcbiAgcmV0dXJuIGh0dHAuZ2V0KCd1c2Vycy9nZXRBbGxPdXRnb2luZ1JlcXVlc3RzJylcbiAgICAudGhlbihyZXF1ZXN0ZWVzID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0YWJUZW1wbGF0ZSh7XG4gICAgICAgIGNsYXNzTmFtZTogJ3RhYi1hbGxJbmNSZXFzJyxcbiAgICAgICAgb25MaXN0RW1wdHk6IHtcbiAgICAgICAgICBlbXB0eTogcmVxdWVzdGVlcy5sZW5ndGggPT0gMCxcbiAgICAgICAgICBtZXNzYWdlOiAnTm8gb3V0Z29pbmcgcmVxdWVzdHMgc2VudCB5ZXQnXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAocmVxdWVzdGVlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJlcXVlc3RlZXNFbGVtZW50cyA9IGNyZWF0ZVVzZXJzTGlzdChyZXF1ZXN0ZWVzKTtcbiAgICAgICAgcmVxdWVzdGVlc0VsZW1lbnRzLmZvckVhY2goZWwgPT4gZWxlbWVudC5yb290LmFwcGVuZENoaWxkKGVsLnJvb3QpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZWxlbWVudDogZWxlbWVudC5yb290LFxuICAgICAgICByZXF1ZXN0c0Ftb3VudDogcmVxdWVzdGVlcy5sZW5ndGhcbiAgICAgIH07XG4gICAgfSlcbiAgO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE91dGdvaW5nUmVxdWVzdHNUYWJDb21wb25lbnQ7XG59LHtcIi4uL2NvbW1vbi9jcmVhdGVVc2Vyc0xpc3RcIjo0NixcIi4uL2NvbW1vbi90YWIudHBsXCI6NDcsXCJjc3AtYXBwL2xpYnMvaHR0cFwiOjU4fV0sNTI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9odHRwJyk7XG5jb25zdCB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdHBsJyk7XG5cbmNvbnN0IFZlcmlmaWNhdGlvbkNvbXBvbmVudCA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBxdWVyeVBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG4gIGNvbnN0IHVzZXJJZCA9IHF1ZXJ5UGFyYW1zLmdldCgnaWQnKTtcbiAgY29uc3QgdG9rZW4gPSBxdWVyeVBhcmFtcy5nZXQoJ3Rva2VuJyk7XG4gIGNvbnN0IHRwbENvbnRyb2xsZXIgPSB0ZW1wbGF0ZSgpO1xuICBsZXQgZXJyb3JzID0gW107XG5cbiAgaWYgKCF1c2VySWQpIHtcbiAgICBlcnJvcnMucHVzaCgndXNlciBpZCcpO1xuICB9XG5cbiAgaWYgKCF0b2tlbikge1xuICAgIGVycm9ycy5wdXNoKCd0b2tlbicpO1xuICB9XG5cbiAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGBZb3UgZGlkIG5vdCBzdXBwbHkgJHsgZXJyb3JzLmpvaW4oJyBhbmQgJykgfWA7XG4gICAgdHBsQ29udHJvbGxlci5wYXJ0cy5pbmZvV3JhcHBlci50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gIH1cblxuICB0cGxDb250cm9sbGVyLnBhcnRzLnNwaW5uZXJXcmFwcGVyLnRleHRDb250ZW50ID0gJ0xvYWRpbmcuLi4nO1xuXG4gIGNvbnN0IGh0dHBHZXQgPSBodHRwLmdldCgnYXV0aC92ZXJpZnknICsgd2luZG93LmxvY2F0aW9uLnNlYXJjaClcbiAgY29uc3Qgc3Bpbm5lclByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0cGxDb250cm9sbGVyLnBhcnRzLnNwaW5uZXJXcmFwcGVyLmlubmVySFRNTCA9ICcnO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0sIDMwMDApO1xuICB9KTtcblxuICBQcm9taXNlLmFsbChbaHR0cEdldCwgc3Bpbm5lclByb21pc2VdKVxuICAgIC50aGVuKGFyciA9PiBhcnJbMF0pXG4gICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgbGV0IG1lc3NhZ2U7XG5cbiAgICAgIGlmIChyZXMuc3VjY2Vzcykge1xuICAgICAgICBtZXNzYWdlID0gJ1lvdXIgYWNjb3VudCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgdmVyaWZpZWQuIFlvdSB3aWxsIGJlIHJlZGlyZWN0ZWQgdG8gdGhlIGRhc2hib2FyZCBpbiAzIHNlY29uZHMnO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHN3aXRjaChyZXMuZXJyb3IudHlwZSkge1xuICAgICAgICAgIGNhc2UgJ25vX3VzZXInOlxuICAgICAgICAgICAgbWVzc2FnZSA9ICdVc2VyIHdpdGggdGhlIHNwZWNpZmllZCBpZCBkb2VzIG5vdCBleGlzdCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd2ZXJpZmllZCc6XG4gICAgICAgICAgICBtZXNzYWdlID0gJ1VzZXIgaGFzIGFscmVhZHkgYmVlbiB2ZXJpZmllZCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdub3RfZm91bmQnOlxuICAgICAgICAgICAgbWVzc2FnZSA9ICdObyB2ZXJpZmljYXRpb24gdG9rZW4gd2FzIGZvdW5kIGZvciB0aGlzIHVzZXJuYW1lIG9yIHVzZXIgd2l0aCB0aGUgc3VwcGxpZWQgdXNlcm5hbWUgZG9lcyBub3QgZXhpc3QnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnbm9fbWF0Y2gnOlxuICAgICAgICAgICAgbWVzc2FnZSA9ICdUb2tlbnMgZG8gbm90IG1hdGNoJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2V4cGlyZWQnOlxuICAgICAgICAgICAgbWVzc2FnZSA9ICdUb2tlbiBoYXMgYmVlbiBleHBpcmVkJztcbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ1NlbmQgdmVyaWZpY2F0aW9uIHRva2VuJztcbiAgICAgICAgICAgIHRwbENvbnRyb2xsZXIucGFydHMuc2VuZFRva2VuQnV0dG9uV3JhcHBlci5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICBodHRwLmdldChgYXV0aC92ZXJpZnkvc2VuZC12ZXJpZmljYXRpb24tdG9rZW4/aWQ9JHt1c2VySWR9YClcbiAgICAgICAgICAgICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZTtcblxuICAgICAgICAgICAgICAgICAgaWYgKHJlcy5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSAnWW91IGhhdmUgYmVlbiBzdWNjZXNzZnVsbHkgc2VudCBuZXcgdmVyaWZpY2F0aW9uIHRva2VuJztcbiAgICAgICAgICAgICAgICAgICAgdHBsQ29udHJvbGxlci5wYXJ0cy5zZW5kVG9rZW5JbmZvV3JhcHBlci50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdHBsQ29udHJvbGxlci5wYXJ0cy5zZW5kVG9rZW5JbmZvV3JhcHBlci50ZXh0Q29udGVudCA9IHJlcy5lcnJvci5tZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSByZXMuZXJyb3IubWVzc2FnZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRwbENvbnRyb2xsZXIucGFydHMuaW5mb1dyYXBwZXIudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xuICAgIH0pXG4gIDtcblxuICByZXR1cm4ge1xuICAgIGVsZW1lbnQ6IHRwbENvbnRyb2xsZXIuZWxlbWVudFxuICB9O1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZlcmlmaWNhdGlvbkNvbXBvbmVudDtcbn0se1wiLi90cGxcIjo1MyxcImNzcC1hcHAvbGlicy9odHRwXCI6NTh9XSw1MzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuZnVuY3Rpb24gdGVtcGxhdGUoZGF0YSkge1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cImNtcF92ZXJpZlwiPlxuICAgICAgPGRpdiBjbGFzcz1cInNwaW5uZXItd3JcIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJpbmZvLXdyXCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic2VuZHRva2VuLXdyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZW5kdG9rZW4taW5mb1wiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwic2VuZHRva2VuLWJ1dHRvbi13clwiPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG5cbiAgY29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcblxuICByZXR1cm4ge1xuICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgcGFydHM6IHtcbiAgICAgIHNwaW5uZXJXcmFwcGVyOiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zcGlubmVyLXdyJyksXG4gICAgICBpbmZvV3JhcHBlcjogZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuaW5mby13cicpLFxuICAgICAgc2VuZFRva2VuSW5mb1dyYXBwZXI6IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNlbmR0b2tlbi1pbmZvJyksXG4gICAgICBzZW5kVG9rZW5CdXR0b25XcmFwcGVyOiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZW5kdG9rZW4tYnV0dG9uLXdyJylcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo2N31dLDU0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm1Db250cm9sID0gcmVxdWlyZSgnLi9Gb3JtQ29udHJvbCcpO1xuXG5jb25zdCB2YWxpZGF0ZSA9IGZ1bmN0aW9uKHZhbGlkYXRvciwgZm9ybSkge1xuICBsZXQgaXRlbXMgPSBmb3JtLmVycm9ycy5pdGVtcztcbiAgbGV0IHZhbHVlcyA9IHZhbGlkYXRvci5jb250cm9scy5tYXAoY3RybCA9PiBjdHJsLnZhbHVlKTtcbiAgbGV0IHJlc3VsdCA9IHZhbGlkYXRvci5oYW5kbGVyKHZhbHVlcyk7XG4gIGlmICghcmVzdWx0LnZhbGlkICYmICFpdGVtc1t2YWxpZGF0b3IubmFtZV0pIHtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSByZXN1bHQubWVzc2FnZTtcbiAgICBpdGVtc1t2YWxpZGF0b3IubmFtZV0gPSB7XG4gICAgICByZWY6IGVsZW1lbnRcbiAgICB9O1xuICAgIGZvcm0uZXJyb3JzLnJlZi5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHJlc3VsdC52YWxpZCAmJiBpdGVtc1t2YWxpZGF0b3IubmFtZV0pIHtcbiAgICBpdGVtc1t2YWxpZGF0b3IubmFtZV0ucmVmLnJlbW92ZSgpO1xuICAgIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSA9IG51bGw7XG4gIH1cbn07XG5cbmNvbnN0IEZvcm0gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIGNvbnN0IGZvcm1Db250cm9scyA9IG9wdGlvbnMuY29udHJvbHMubWFwKGN0cmwgPT4gbmV3IEZvcm1Db250cm9sKGN0cmwpKTtcbiAgbGV0IHZhbGlkYXRvcnMgPSBvcHRpb25zLnZhbGlkYXRvcnMgfHwgW107XG4gIGxldCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO1xuICBsZXQgZXJyb3JzV3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBsZXQgc3VibWl0V3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBsZXQgZm9ybUNvbnRyb2xzUmVmcyA9IGZvcm1Db250cm9scy5tYXAoY3RybCA9PiBjdHJsLnJlZik7XG4gIGVycm9yc1dyYXBwZXIuY2xhc3NOYW1lID0gJ2Vycm9ycyc7XG4gIHN1Ym1pdFdyYXBwZXIuY2xhc3NOYW1lID0gJ2FjdGlvbnMnO1xuICBzdWJtaXRXcmFwcGVyLmlubmVySFRNTCA9ICc8aW5wdXQgdHlwZT1cInN1Ym1pdFwiIHZhbHVlPVwiU3VibWl0XCIgLz4nO1xuICBzdWJtaXRSZWYgPSBzdWJtaXRXcmFwcGVyLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJzdWJtaXRcIl0nKTtcblxuICBbXG4gICAgZXJyb3JzV3JhcHBlcixcbiAgICAuLi5mb3JtQ29udHJvbHNSZWZzLFxuICAgIHN1Ym1pdFdyYXBwZXJcbiAgXS5mb3JFYWNoKGl0ZW0gPT4gd3JhcHBlci5hcHBlbmRDaGlsZChpdGVtKSk7XG4gIFxuICBsZXQgZm9ybSA9IHtcbiAgICByZWY6IHdyYXBwZXIsXG4gICAgZXJyb3JzOiB7XG4gICAgICByZWY6IGVycm9yc1dyYXBwZXIsXG4gICAgICBpdGVtczoge31cbiAgICB9LFxuICAgIGNvbnRyb2xzOiBmb3JtQ29udHJvbHMsXG4gICAgc3VibWl0OiB7XG4gICAgICBoYW5kbGVyOiBvcHRpb25zLnN1Ym1pdC5oYW5kbGVyXG4gICAgfVxuICB9O1xuXG4gIG9wdGlvbnMudmFsaWRhdG9ycy5mb3JFYWNoKHZhbGlkYXRvciA9PiB7XG4gICAgdmFsaWRhdG9yLmNvbnRyb2xzLmZvckVhY2goY29udHJvbCA9PiB7XG4gICAgICBjb250cm9sLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICB2YWxpZGF0ZSh2YWxpZGF0b3IsIGZvcm0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHN1Ym1pdFJlZi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2dCA9PiB7XG4gICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgbGV0IGVycm9yc0Ftb3VudCA9IDA7XG4gICAgdmFsaWRhdG9ycy5mb3JFYWNoKHZhbGlkYXRvciA9PiB2YWxpZGF0ZSh2YWxpZGF0b3IsIGZvcm0pKTtcbiAgICBmb3JtLmNvbnRyb2xzLmZvckVhY2goY3RybCA9PiBjdHJsLnZhbGlkYXRlKCkpO1xuICAgIE9iamVjdC52YWx1ZXMoZm9ybS5lcnJvcnMuaXRlbXMpLmZvckVhY2godmFsID0+IHtcbiAgICAgIGlmICghIXZhbCkge1xuICAgICAgICBlcnJvcnNBbW91bnQrKztcbiAgICAgIH1cbiAgICB9KTtcbiAgICBmb3JtLmNvbnRyb2xzLmZvckVhY2goY3RybCA9PiB7XG4gICAgICBPYmplY3QudmFsdWVzKGN0cmwuZXJyb3JzLml0ZW1zKS5mb3JFYWNoKHZhbCA9PiB7XG4gICAgICAgIGlmICghIXZhbCkge1xuICAgICAgICAgIGVycm9yc0Ftb3VudCsrO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBpZiAoZXJyb3JzQW1vdW50ID4gMCkge1xuICAgICAgY29uc29sZS5sb2coJ0Zvcm0gaXMgbm90IHZhbGlkJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCB2YWx1ZXMgPSB7fTtcbiAgICBmb3JtLmNvbnRyb2xzLmZvckVhY2goY3RybCA9PiB7XG4gICAgICB2YWx1ZXNbY3RybC5rZXlOYW1lXSA9IGN0cmwudmFsdWU7XG4gICAgfSk7XG4gICAgZm9ybS5zdWJtaXQuaGFuZGxlcih2YWx1ZXMsIGV2dCk7XG4gIH0pO1xuXG4gIHJldHVybiBmb3JtO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtO1xufSx7XCIuL0Zvcm1Db250cm9sXCI6NTV9XSw1NTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB2YWxpZGF0ZSA9IGZ1bmN0aW9uKGNvbnRyb2wpIHtcbiAgY29udHJvbCA9IGNvbnRyb2wgfHwgdGhpcztcbiAgbGV0IGFkZCA9IHt9O1xuICBsZXQgcmVtb3ZlID0ge307XG4gIGxldCBpdGVtcyA9IGNvbnRyb2wuZXJyb3JzLml0ZW1zO1xuICBsZXQgdmFsaWRhdG9ycyA9IGNvbnRyb2wudmFsaWRhdG9ycztcblxuICBpZiAoIWNvbnRyb2wucmVxdWlyZWQgJiYgY29udHJvbC52YWx1ZSA9PT0gJycpIHtcbiAgICBPYmplY3Qua2V5cyhpdGVtcykuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGlmICghIWl0ZW1zW2l0ZW1dKSByZW1vdmVbaXRlbV0gPSB0cnVlO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKGNvbnRyb2wucmVxdWlyZWQgJiYgY29udHJvbC52YWx1ZSA9PT0gJycpIHtcbiAgICBpZiAoIWl0ZW1zWydyZXF1aXJlZCddKSB7XG4gICAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICBlbGVtZW50LmlubmVySFRNTCA9ICdUaGlzIGZpZWxkIGlzIHJlcXVpcmVkJztcbiAgICAgIGl0ZW1zWydyZXF1aXJlZCddID0ge1xuICAgICAgICByZWY6IGVsZW1lbnRcbiAgICAgIH1cbiAgICAgIGNvbnRyb2wuZXJyb3JzLnJlZi5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICBpZiAoY29udHJvbC52YWx1ZS5sZW5ndGggPiAwICYmICEhaXRlbXNbJ3JlcXVpcmVkJ10pIHtcbiAgICByZW1vdmVbJ3JlcXVpcmVkJ10gPSB0cnVlO1xuICB9XG5cbiAgaWYgKGNvbnRyb2wudmFsdWUgIT09ICcnKSB7XG4gICAgdmFsaWRhdG9ycy5mb3JFYWNoKHZhbGlkYXRvciA9PiB7XG4gICAgICBsZXQgcmVzdWx0ID0gdmFsaWRhdG9yLmhhbmRsZXIoY29udHJvbC52YWx1ZSwgY29udHJvbCk7XG4gICAgICBpZiAoIXJlc3VsdC52YWxpZCAmJiAhaXRlbXNbdmFsaWRhdG9yLm5hbWVdKSB7XG4gICAgICAgIGFkZFt2YWxpZGF0b3IubmFtZV0gPSByZXN1bHQ7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChyZXN1bHQudmFsaWQgJiYgaXRlbXNbdmFsaWRhdG9yLm5hbWVdKSB7XG4gICAgICAgIHJlbW92ZVt2YWxpZGF0b3IubmFtZV0gPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgT2JqZWN0LmtleXMoYWRkKS5mb3JFYWNoKGVycm9yID0+IHtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSBhZGRbZXJyb3JdLm1lc3NhZ2U7XG4gICAgaXRlbXNbZXJyb3JdID0ge1xuICAgICAgcmVmOiBlbGVtZW50XG4gICAgfTtcbiAgICBjb250cm9sLmVycm9ycy5yZWYuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gIH0pO1xuXG4gIE9iamVjdC5rZXlzKHJlbW92ZSkuZm9yRWFjaChlcnJvciA9PiB7XG4gICAgaXRlbXNbZXJyb3JdLnJlZi5yZW1vdmUoKTtcbiAgICBpdGVtc1tlcnJvcl0gPSBudWxsO1xuICB9KTtcbn07XG5cbmNvbnN0IGJpbmRFcnJvckhhbmRsaW5nID0gZnVuY3Rpb24oY29udHJvbCkge1xuICBjb250cm9sLmNvbnRyb2xSZWYuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgdmFsaWRhdGUoY29udHJvbCk7XG4gIH0pO1xufTtcblxuY29uc3QgdGFnSW5wdXQgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIGxldCBwcmVwZW5kID0gb3B0aW9ucy5wcmVwZW5kIHx8ICcnO1xuICBsZXQgYXBwZW5kID0gb3B0aW9ucy5hcHBlbmQgfHwgJyc7XG4gIGxldCBsYWJlbCA9XG4gICAgb3B0aW9ucy5sYWJlbCA/XG4gICAgYDxsYWJlbCBmb3I9XCIke29wdGlvbnMuaWR9XCI+JHtvcHRpb25zLmxhYmVsfTwvbGFiZWw+YCA6XG4gICAgJyc7XG4gIGxldCBlcnJvcnMgPSBvcHRpb25zLmVycm9ycztcbiAgbGV0IGVycm9yc1Bvc2l0aW9uID1cbiAgICBlcnJvcnMgJiYgZXJyb3JzLnBvc2l0aW9uID9cbiAgICBlcnJvcnMgJiYgZXJyb3JzLnBvc2l0aW9uIDpcbiAgICAnYmVmb3JlQXBwZW5kJztcbiAgbGV0IGVycm9yc0NsYXNzID1cbiAgICBlcnJvcnMgJiYgZXJyb3JzLmNsYXNzID9cbiAgICBlcnJvcnMgJiYgZXJyb3JzLmNsYXNzIDpcbiAgICAnZXJyb3JzJ1xuICBsZXQgZXJyb3JzSFRNTCA9IGA8ZGl2IGNsYXNzPVwiJHtlcnJvcnNDbGFzc31cIj48L2Rpdj5gO1xuICBsZXQgY29udHJvbEhUTUwgPSAnPGlucHV0Pic7XG4gIGxldCBodG1sO1xuICBcbiAgc3dpdGNoIChlcnJvcnNQb3NpdGlvbikge1xuICAgIGNhc2UgJ2JlZm9yZVByZXBlbmQnOlxuICAgICAgaHRtbCA9IGVycm9yc0hUTUwgKyBwcmVwZW5kICsgbGFiZWwgKyBjb250cm9sSFRNTCArIGFwcGVuZDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JlZm9yZUxhYmVsJzpcbiAgICAgIGh0bWwgPSBwcmVwZW5kICsgZXJyb3JzSFRNTCArIGxhYmVsICsgY29udHJvbEhUTUwgKyBhcHBlbmQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdiZWZvcmVDb250cm9sJzpcbiAgICAgIGh0bWwgPSBwcmVwZW5kICsgbGFiZWwgKyBlcnJvcnNIVE1MICsgY29udHJvbEhUTUwgKyBhcHBlbmQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdiZWZvcmVBcHBlbmQnOlxuICAgICAgaHRtbCA9IHByZXBlbmQgKyBsYWJlbCArIGNvbnRyb2xIVE1MICsgZXJyb3JzSFRNTCArIGFwcGVuZDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2FmdGVyQXBwZW5kJzpcbiAgICAgIGh0bWwgPSBwcmVwZW5kICsgbGFiZWwgKyBjb250cm9sSFRNTCArIGFwcGVuZCArIGVycm9yc0hUTUw7XG4gICAgICBicmVhaztcbiAgfVxuXG4gIGxldCBjb250cm9sSWQgPSAnaW5wdXQnOyAvLyB0byBpZGVudGlmeSBpdCBpbiB0aGUgRE9NIHdoZW4gaXQncyByZW5kZXJlZFxuICBsZXQgZXJyb3JzSWQgPSBlcnJvcnNDbGFzczsgLy8gZm9yIHRoaXMgdG9vXG5cbiAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgd3JhcHBlci5jbGFzc05hbWUgPSAob3B0aW9ucy53cmFwcGVyICYmIG9wdGlvbnMud3JhcHBlci5jbGFzcykgfHwgJyc7XG4gIHdyYXBwZXIuaW5uZXJIVE1MID0gaHRtbDtcbiAgbGV0IGNvbnRyb2xSZWYgPSB3cmFwcGVyLnF1ZXJ5U2VsZWN0b3IoY29udHJvbElkKTtcbiAgbGV0IGVycm9yc1JlZiA9IHdyYXBwZXIucXVlcnlTZWxlY3RvcignLicrZXJyb3JzSWQpO1xuXG4gIGlmIChvcHRpb25zLmF0dHJpYnV0ZXMpIHtcbiAgICBvcHRpb25zLmF0dHJpYnV0ZXMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgIGNvbnRyb2xSZWYuc2V0QXR0cmlidXRlKGF0dHIubmFtZSwgYXR0ci52YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBsZXQgY29udHJvbCA9IHtcbiAgICBrZXlOYW1lOiBvcHRpb25zLmtleU5hbWUgfHwgJycsXG4gICAgcmVmOiB3cmFwcGVyLFxuICAgIGNvbnRyb2xSZWY6IGNvbnRyb2xSZWYsXG4gICAgZXJyb3JzOiB7XG4gICAgICByZWY6IGVycm9yc1JlZixcbiAgICAgIGl0ZW1zOiB7fVxuICAgIH0sXG4gICAgcmVxdWlyZWQ6IG9wdGlvbnMucmVxdWlyZWQgfHwgZmFsc2UsXG4gICAgdmFsaWQ6IG51bGwsXG4gICAgdmFsaWRhdG9yczogb3B0aW9ucy52YWxpZGF0b3JzIHx8IFtdLFxuICAgIHZhbGlkYXRlOiB2YWxpZGF0ZVxuICB9O1xuXG4gIGJpbmRFcnJvckhhbmRsaW5nKGNvbnRyb2wpO1xuXG4gIGlmIChvcHRpb25zLmhhbmRsZXJzT2Jqcykge1xuICAgIGxldCBldmVudHMgPSB7fTtcbiAgICBsZXQgaGFuZGxlcnNPYmpzID0gb3B0aW9ucy5oYW5kbGVycztcbiAgICBoYW5kbGVyc09ianMuZm9yRWFjaChvYmogPT4ge1xuICAgICAgaWYgKCFldmVudHNbb2JqLmV2ZW50XSkge1xuICAgICAgICBldmVudHNbb2JqLmV2ZW50XSA9IFtdO1xuICAgICAgfVxuICAgICAgZXZlbnRzW29iai5ldmVudF0ucHVzaChvYmouaGFuZGxlcik7XG4gICAgfSk7XG4gICAgT2JqZWN0LmtleXMoZXZlbnRzKS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XG4gICAgICBjb250cm9sLmNvbnRyb2xSZWYuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGV2dCA9PiB7XG4gICAgICAgIGV2ZW50c1tldmVudE5hbWVdLmZvckVhY2goaGFuZGxlciA9PiBoYW5kbGVyKGV2dCkpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29udHJvbCwgJ3ZhbHVlJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7cmV0dXJuIHRoaXMuY29udHJvbFJlZi52YWx1ZX0sXG4gICAgc2V0OiBmdW5jdGlvbihuZXdWYWx1ZSkge3RoaXMuY29udHJvbFJlZi52YWx1ZSA9IG5ld1ZhbHVlfVxuICB9KVxuXG4gIHJldHVybiBjb250cm9sO1xufTtcblxuY29uc3QgZ2V0SGFuZGxlciA9IGZ1bmN0aW9uKHRhZykge1xuICBsZXQgZm47XG4gIC8vIFN3aXRjaCBzZWVtcyB0byBiZSBmYXN0ZXIgdGhhbiBvYmplY3QgbG9vayB1cFxuICAvLyBTZWFyY2ggZm9yICdqcyBzd2l0Y2ggdnMgb2JqZWN0J1xuICBzd2l0Y2godGFnKSB7XG4gICAgY2FzZSAnaW5wdXQnOlxuICAgICAgZm4gPSB0YWdJbnB1dDtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiBmbjtcbn07XG5cbmNvbnN0IEZvcm1Db250cm9sID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICByZXR1cm4gZ2V0SGFuZGxlcihvcHRpb25zLnRhZykob3B0aW9ucylcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybUNvbnRyb2w7XG59LHt9XSw1NjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBGb3JtID0gcmVxdWlyZSgnLi9Gb3JtJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybTtcbn0se1wiLi9Gb3JtXCI6NTR9XSw1NzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBtaW5MZW5ndGggPSBmdW5jdGlvbih2YWx1ZSwgY29udHJvbCkge1xuICByZXR1cm4ge1xuICAgIHZhbGlkOiB2YWx1ZS5sZW5ndGggPj0gNSxcbiAgICBtZXNzYWdlOiAnVGhpcyBmaWVsZHNcXCdzIGxlbmd0aCBpcyBsZXNzIHRoYW4gNSBjaGFycydcbiAgfVxufTtcblxuY29uc3QgbWF4TGVuZ3RoID0gZnVuY3Rpb24odmFsdWUsIGNvbnRyb2wpIHtcbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogdmFsdWUubGVuZ3RoIDw9IDEwLFxuICAgIG1lc3NhZ2U6ICdUaGlzIGZpZWxkc1xcJ3MgbGVuZ3RoIGlzIGdyZWF0ZXIgdGhhbiAxMCBjaGFycydcbiAgfVxufTtcblxuY29uc3Qgc3RhcnRzV2l0aE51bWJlciA9IGZ1bmN0aW9uKHZhbHVlLCBjb250cm9sKSB7XG4gIHJldHVybiB7XG4gICAgdmFsaWQ6ICEvXlxcZCsvaS50ZXN0KHZhbHVlKSxcbiAgICBtZXNzYWdlOiAnVXNlcm5hbWUgbXVzdCBub3Qgc3RhcnQgd2l0aCBudW1iZXJzJ1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWluTGVuZ3RoLFxuICBtYXhMZW5ndGgsXG4gIHN0YXJ0c1dpdGhOdW1iZXJcbn07XG59LHt9XSw1ODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5mdW5jdGlvbiBjb25maWd1cmUob3B0aW9ucykge1xuICBsZXQgbG9jYXRpb24gPSBvcHRpb25zLmxvY2F0aW9uO1xuICBsb2NhdGlvbiA9IGxvY2F0aW9uW2xvY2F0aW9uLmxlbmd0aC0xXSA9PT0gJy8nID9cbiAgICBsb2NhdGlvbiA6XG4gICAgbG9jYXRpb24gKyAnLyc7XG4gIFxuICB0aGlzLmxvY2F0aW9uID0gbG9jYXRpb247XG59XG5cbmZ1bmN0aW9uIGdldENvcnJlY3RVcmwodXJsKSB7XG4gIHVybCA9IHVybFswXSA9PT0gJy8nID9cbiAgICB1cmwuc2xpY2UoMSkgOlxuICAgIHVybDtcblxuICByZXR1cm4gdXJsO1xufVxuXG5mdW5jdGlvbiBzZXRBdXRob3JpemF0aW9uSGVhZGVyKHhocikge1xuICBjb25zdCB0b2tlbiA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYXV0aF90b2tlbicpO1xuXG4gIGlmICh0b2tlbikge1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdhdXRob3JpemF0aW9uJywgYEJlYXJlciAke3Rva2VufWApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldCh1cmwsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHRoaXMubWFrZVJlcXVlc3QoJ0dFVCcsIHVybCwgbnVsbCwgb3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIHBvc3QodXJsLCBib2R5LCBvcHRpb25zKSB7XG4gIHJldHVybiB0aGlzLm1ha2VSZXF1ZXN0KCdQT1NUJywgdXJsLCBib2R5LCBvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gbWFrZVJlcXVlc3QobWV0aG9kLCB1cmwsIGJvZHksIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB1cmwgPSB0aGlzLmdldENvcnJlY3RVcmwodXJsKTtcblxuICAgIHhoci5vcGVuKG1ldGhvZCwgdGhpcy5sb2NhdGlvbiArIHVybCk7XG5cbiAgICBpZiAobWV0aG9kID09ICdQT1NUJykge1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXG4gICAgICAgICdDb250ZW50LVR5cGUnLFxuICAgICAgICAob3B0aW9ucyAmJiBvcHRpb25zLmNvbnRlbnRUeXBlKSB8fCB0aGlzLmNvbnRlbnRUeXBlcy5qc29uXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIEVhY2ggdGltZSBhbG9uZyB3aXRoIHRoZSByZXF1ZXN0IHdlIHNlbmQgYXV0aF90b2tlbiBpZiBpdCBleGlzdHNcbiAgICB0aGlzLnNldEF1dGhvcml6YXRpb25IZWFkZXIoeGhyKTtcblxuICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAgICAgY29uc3QgaXNKc29uID0geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdDb250ZW50LVR5cGUnKS5tYXRjaCh0aGlzLmNvbnRlbnRUeXBlcy5qc29uKTtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gaXNKc29uID9cbiAgICAgICAgSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KSA6XG4gICAgICAgIHhoci5yZXNwb25zZVRleHQ7XG5cbiAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgIH0pO1xuXG4gICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24oKSB7XG4gICAgICByZWplY3QoJ05ldHdvcmsgZXJyb3Igb2NjdXJlZCcpO1xuICAgIH0pO1xuXG4gICAgaWYgKG1ldGhvZCA9PSAnR0VUJykge1xuICAgICAgeGhyLnNlbmQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobWV0aG9kID09ICdQT1NUJykge1xuICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkoYm9keSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBsb2NhdGlvbjogbnVsbCxcbiAgZ2V0Q29ycmVjdFVybDogZ2V0Q29ycmVjdFVybCxcbiAgY29uZmlndXJlOiBjb25maWd1cmUsXG4gIHNldEF1dGhvcml6YXRpb25IZWFkZXI6IHNldEF1dGhvcml6YXRpb25IZWFkZXIsXG4gIGNvbnRlbnRUeXBlczoge1xuICAgIGpzb246ICdhcHBsaWNhdGlvbi9qc29uJ1xuICB9LFxuICBtYWtlUmVxdWVzdDogbWFrZVJlcXVlc3QsXG4gIGdldDogZ2V0LFxuICBwb3N0OiBwb3N0XG59O1xufSx7fV0sNTk6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmNvbnN0IHJhZGlhbEdyYWRpZW50T25Ib3ZlciA9IGZ1bmN0aW9uKGJ0biwgb3B0cykge1xuICBjb25zdCB0ZXh0ID0gYnRuLmlubmVySFRNTDtcbiAgY29uc3Qgd3JhcHBlciA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCgvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwicmctYnRuXCI+XG4gICAgICA8c3Bhbj4ke3RleHR9PC9zcGFuPlxuICAgIDwvZGl2PlxuICBgKTtcbiAgYnRuLmlubmVySFRNTCA9ICcnO1xuICBidG4uc3R5bGUucGFkZGluZyA9IDA7XG5cbiAgaWYgKE51bWJlci5pc0ludGVnZXIob3B0cy5wYWRkaW5nKSkge1xuICAgIHdyYXBwZXIuc3R5bGUucGFkZGluZyA9IG9wdHMucGFkZGluZyArICdweCc7XG4gIH1cbiAgZWxzZSBpZiAob3B0cy5wYWRkaW5nIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBpZiAob3B0cy5wYWRkaW5nLmxlbmd0aCA9PSAyKSB7XG4gICAgICB3cmFwcGVyLnN0eWxlLnBhZGRpbmdUb3AgPSB3cmFwcGVyLnN0eWxlLnBhZGRpbmdCb3R0b20gPSBvcHRzLnBhZGRpbmdbMF0gKyAncHgnO1xuICAgICAgd3JhcHBlci5zdHlsZS5wYWRkaW5nTGVmdCA9IHdyYXBwZXIuc3R5bGUucGFkZGluZ1JpZ2h0ID0gb3B0cy5wYWRkaW5nWzFdICsgJ3B4JztcbiAgICB9XG4gIH1cblxuICBidG4uYXBwZW5kQ2hpbGQod3JhcHBlcik7XG5cbiAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGV2dCA9PiB7XG4gICAgY29uc3QgY29vcmRpbmF0ZXMgPSBldnQudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHggPSBldnQuY2xpZW50WCAtIGNvb3JkaW5hdGVzLmxlZnQ7XG4gICAgY29uc3QgeSA9IGV2dC5jbGllbnRZIC0gY29vcmRpbmF0ZXMudG9wO1xuICAgIGV2dC50YXJnZXQuc3R5bGUuc2V0UHJvcGVydHkoJy0teCcsIGAkeyB4IH1weGApO1xuICAgIGV2dC50YXJnZXQuc3R5bGUuc2V0UHJvcGVydHkoJy0teScsIGAkeyB5IH1weGApO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcmFkaWFsR3JhZGllbnRPbkhvdmVyO1xufSx7XCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6Njd9XSw2MDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBSb3V0ZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yb3V0ZXMgPSBbXTtcbn07XG5cblJvdXRlci5wcm90b3R5cGUucmVnZXhwUGFyYW1zID0gLyhcXCg6KFtcXHdcXGRcXC1fXSspXFwpKS9naTtcblxuUm91dGVyLnByb3RvdHlwZS50cmltUm91dGUgPSBmdW5jdGlvbihyb3V0ZSkge1xuICByb3V0ZSA9IHJvdXRlWzBdID09PSAnLydcbiAgICA/IHJvdXRlLnN1YnN0cigxKVxuICAgIDogcm91dGU7XG5cbiAgcm91dGUgPSByb3V0ZVtyb3V0ZS5sZW5ndGggLSAxXSA9PT0gJy8nXG4gICAgPyByb3V0ZS5zdWJzdHIoMCwgcm91dGUubGVuZ3RoIC0gMSlcbiAgICA6IHJvdXRlO1xuXG4gIHJldHVybiByb3V0ZTtcbn0sXG5cblJvdXRlci5wcm90b3R5cGUuZ2V0UGFyYW1zTmFtZXMgPSBmdW5jdGlvbihyb3V0ZSkge1xuICBsZXQgcmVzdWx0O1xuICBsZXQgcGFyYW1zTmFtZXMgPSBbXTtcbiAgd2hpbGUgKChyZXN1bHQgPSB0aGlzLnJlZ2V4cFBhcmFtcy5leGVjKHJvdXRlKSkgIT09IG51bGwpIHtcbiAgICBwYXJhbXNOYW1lcy5wdXNoKHJlc3VsdFsyXSk7XG4gIH1cbiAgcmV0dXJuIHBhcmFtc05hbWVzO1xufVxuXG5Sb3V0ZXIucHJvdG90eXBlLmFkZFJvdXRlID0gZnVuY3Rpb24ocm91dGUsIG9iaikge1xuICByb3V0ZSA9IHRoaXMudHJpbVJvdXRlKHJvdXRlKTtcbiAgbGV0IHBhcmFtc05hbWVzID0gdGhpcy5nZXRQYXJhbXNOYW1lcyhyb3V0ZSk7XG4gIGxldCByZWdleHBTdHIgPSByb3V0ZS5yZXBsYWNlKHRoaXMucmVnZXhwUGFyYW1zLCAnKFtcXFxcd1xcXFxkXFwtX10rKScpO1xuICBsZXQgcmVnZXhwID0gUmVnRXhwKGBeJHtyZWdleHBTdHJ9KFxcXFwvfCQpYCwgJ2dpJyk7XG5cbiAgbGV0IHJvdXRlT2JqID0ge1xuICAgIHR5cGU6ICdyb3V0ZScsXG4gICAgcmVnZXhwOiByZWdleHAsXG4gICAgcGFyYW1zTmFtZXM6IHBhcmFtc05hbWVzXG4gIH07XG5cbiAgaWYgKHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbicpIHtcbiAgICAvKipcbiAgICAgKiBSb3V0ZSBoYW5kbGVyIHdpbGwgYmUgaW52b2tlZCB3aGVuIHVzZXIgZ29lcyB0byB0aGUgY29ycmVzcG9uZGluZ1xuICAgICAqIHJvdXRlIGFuZCBub3QgdGVybWluYXRlZCBieSBtaWRkbGV3YXJlcyB1bmRlcndheVxuICAgICAqIEBmdW5jdGlvbiBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGhhbmRsZXJQYXJhbXMgLSBwYXJhbXMgbWF5IGJlIGdpdmVuIHdoZW4gUm91dGVyLm5hdmlnYXRlIGlzIGludm9rZWRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcm91dGVQYXJhbXMgLSBwYXJhbXMgZXhpc3Rpbmcgb24gdGhlIHJvdXRlIGlmIGFueVxuICAgICAqIEBwYXJhbSB7YW55fSBhcmcgLSB0aGlzIGlzIGdpdmVuIGJ5IHRoZSBsYXN0IG1pZGRsZXdhcmUgaWYgYW55XG4gICAgICovXG4gICAgcm91dGVPYmouaGFuZGxlciA9IG9iajtcbiAgfVxuXG4gIGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgcm91dGVPYmouY2hpbGRyZW4gPSBvYmo7XG4gIH1cblxuICBlbHNlIHtcbiAgICBjb25zb2xlLmxvZygnRXJyb3Igb2NjdXJlZCB3aGlsZSBhZGRpbmcgcm91dGUnKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JvdXRlIGVycm9yJyk7XG4gIH1cblxuICB0aGlzLnJvdXRlcy5wdXNoKHJvdXRlT2JqKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLmdldFJvdXRlID0gZnVuY3Rpb24obGluaywgcm91dGVzID0gdGhpcy5yb3V0ZXMpIHtcbiAgbGluayA9IGxpbmsgPT09ICcnID8gJy8nIDogbGluaztcbiAgbGV0IG1pZGRsZXdhcmVzID0gW107XG4gIGxldCBwYXJhbXMgPSB7fTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJvdXRlcy5sZW5ndGgsIHJvdXRlID0gcm91dGVzW2ldOyBpKyspIHtcbiAgICBpZiAocm91dGUudHlwZSA9PSAnbWlkZGxld2FyZScpIHtcbiAgICAgIG1pZGRsZXdhcmVzLnB1c2gocm91dGUuZm4pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHJvdXRlLnR5cGUgPT0gJ3JvdXRlcycpIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuQ2hlY2sgPSB0aGlzLmdldFJvdXRlKGxpbmssIHJvdXRlLnJvdXRlcyk7XG4gICAgICBpZiAoY2hpbGRyZW5DaGVjayAhPT0gbnVsbCkge1xuICAgICAgICBjaGlsZHJlbkNoZWNrLm1pZGRsZXdhcmVzID0gbWlkZGxld2FyZXMuY29uY2F0KGNoaWxkcmVuQ2hlY2subWlkZGxld2FyZXMpO1xuICAgICAgICBjaGlsZHJlbkNoZWNrLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24ocGFyYW1zLCBjaGlsZHJlbkNoZWNrLnBhcmFtcyk7XG4gICAgICAgIHJldHVybiBjaGlsZHJlbkNoZWNrO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgbGV0IHJlZ2V4cCA9IHJvdXRlLnJlZ2V4cDtcbiAgICBsZXQgcmVzdWx0ID0gcmVnZXhwLmV4ZWMobGluayk7XG4gICAgbGV0IG5ld0xpbms7XG5cbiAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggPiAxKSB7XG4gICAgICBwYXJhbXMgPSB7fTtcbiAgICAgIGZvciAobGV0IGlkeCA9IDE7IGlkeCA8IHJlc3VsdC5sZW5ndGggLSAxOyBpZHgrKykge1xuICAgICAgICBwYXJhbXNbcm91dGUucGFyYW1zTmFtZXNbaWR4LTFdXSA9IHJlc3VsdFtpZHhdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZWdleHAubGFzdEluZGV4ID4gMCkge1xuICAgICAgbmV3TGluayA9IGxpbmsuc3Vic3RyKHJlZ2V4cC5sYXN0SW5kZXgpO1xuICAgIH1cblxuICAgIGlmIChyZWdleHAubGFzdEluZGV4ID4gMCAmJiBuZXdMaW5rLmxlbmd0aCA+IDApIHtcbiAgICAgIHJlZ2V4cC5sYXN0SW5kZXggPSAwO1xuICAgICAgaWYgKHJvdXRlLmNoaWxkcmVuICYmIHJvdXRlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGV0IGNoaWxkcmVuQ2hlY2sgPSB0aGlzLmdldFJvdXRlKG5ld0xpbmssIHJvdXRlLmNoaWxkcmVuKTtcbiAgICAgICAgaWYgKGNoaWxkcmVuQ2hlY2sgIT09IG51bGwpIHtcbiAgICAgICAgICBjaGlsZHJlbkNoZWNrLm1pZGRsZXdhcmVzID0gbWlkZGxld2FyZXMuY29uY2F0KGNoaWxkcmVuQ2hlY2subWlkZGxld2FyZXMpO1xuICAgICAgICAgIGNoaWxkcmVuQ2hlY2sucGFyYW1zID0gT2JqZWN0LmFzc2lnbihwYXJhbXMsIGNoaWxkcmVuQ2hlY2sucGFyYW1zKTtcbiAgICAgICAgICByZXR1cm4gY2hpbGRyZW5DaGVjaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBJbiBjYXNlIGl0J3MgdGVybWluYWwgcm91dGVcbiAgICBlbHNlIGlmIChyZWdleHAubGFzdEluZGV4ID4gMCkge1xuICAgICAgcmVnZXhwLmxhc3RJbmRleCA9IDA7XG4gICAgICBpZiAocm91dGUuaGFuZGxlcikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhhbmRsZXI6IHJvdXRlLmhhbmRsZXIsXG4gICAgICAgICAgcGFyYW1zOiBwYXJhbXMsXG4gICAgICAgICAgbWlkZGxld2FyZXM6IG1pZGRsZXdhcmVzXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFNpbmNlIGl0J3MgZG9uZSBhbmQgbGluayBpcyAoYWN0dWFsbHksIHdpbGwgYmUgd2hlbiB3ZVxuICAgICAgLy8gZ2V0IGludG8gcmVjdXJzaW9uKSAnLycsIHNvIHdlIGxvb2sgdXAgY2hpbGRyZW4gdG9cbiAgICAgIC8vIHRvIG1hdGNoIHRoZSByb290ICcvJyB3aGljaCBtdXN0IGV4aXN0IHRoZXJlXG4gICAgICBpZiAocm91dGUuY2hpbGRyZW4pIHtcbiAgICAgICAgcmVnZXhwLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIGxldCBjaGlsZHJlbkNoZWNrID0gdGhpcy5nZXRSb3V0ZShuZXdMaW5rLCByb3V0ZS5jaGlsZHJlbik7XG4gICAgICAgIGlmIChjaGlsZHJlbkNoZWNrICE9PSBudWxsKSB7XG4gICAgICAgICAgY2hpbGRyZW5DaGVjay5taWRkbGV3YXJlcyA9IG1pZGRsZXdhcmVzLmNvbmNhdChjaGlsZHJlbkNoZWNrLm1pZGRsZXdhcmVzKTtcbiAgICAgICAgICBjaGlsZHJlbkNoZWNrLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24ocGFyYW1zLCBjaGlsZHJlbkNoZWNrLnBhcmFtcyk7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkcmVuQ2hlY2s7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLmFkZFJvdXRlcyA9IGZ1bmN0aW9uKHJvdXRlcykge1xuICB0aGlzLnJvdXRlcy5wdXNoKHtcbiAgICB0eXBlOiAncm91dGVzJyxcbiAgICByb3V0ZXM6IHJvdXRlc1xuICB9KTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cblJvdXRlci5wcm90b3R5cGUuYWRkTWlkZGxld2FyZSA9IGZ1bmN0aW9uKGZuKSB7XG4gIHRoaXMucm91dGVzLnB1c2goe1xuICAgIHR5cGU6ICdtaWRkbGV3YXJlJyxcbiAgICBmbjogZm5cbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLm5hdmlnYXRlID0gZnVuY3Rpb24obGluaywgaGFuZGxlclBhcmFtcykge1xuICBsaW5rID0gdGhpcy50cmltUm91dGUobGluayk7XG4gIGxldCByb3V0ZSA9IHRoaXMuZ2V0Um91dGUobGluayk7XG4gIGlmICghcm91dGUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdObyBzdWl0YWJsZSByb3V0ZSBoYXMgYmVlbiBmb3VuZCEnKTtcbiAgICByZXR1cm47XG4gIH1cbiAgXG4gIGZucyA9IHJvdXRlLm1pZGRsZXdhcmVzLmNvbmNhdChbcm91dGUuaGFuZGxlci5iaW5kKG51bGwsIGhhbmRsZXJQYXJhbXMpXSk7XG4gIGZvciAobGV0IGkgPSBmbnMubGVuZ3RoIC0gMTsgaSA+IDAsIGZuID0gZm5zW2ldOyBpLS0pIHtcbiAgICBpZiAoaSAhPT0gZm5zLmxlbmd0aCAtIDEpIHtcbiAgICAgIGZuc1tpXSA9IGZuLmJpbmQobnVsbCwgZm5zW2krMV0sIHJvdXRlLnBhcmFtcyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZm5zW2ldID0gZm4uYmluZChudWxsLCByb3V0ZS5wYXJhbXMpO1xuICAgIH1cbiAgfVxuICBmbnNbMF0oKTtcbiAgaGlzdG9yeS5wdXNoU3RhdGUoJycsICcnLCAnLycgKyBsaW5rKTtcbn07XG5cblJvdXRlci5wcm90b3R5cGUudGVzdE5hdiA9IGZ1bmN0aW9uKGxpbmssIGhhbmRsZXJQYXJhbXMpIHtcbiAgbGluayA9IHRoaXMudHJpbVJvdXRlKGxpbmspO1xuICBsZXQgcm91dGUgPSB0aGlzLmdldFJvdXRlKGxpbmspO1xuICBpZiAoIXJvdXRlKSB7XG4gICAgY29uc29sZS5sb2coJ05vIHN1aXRhYmxlIHJvdXRlIGhhcyBiZWVuIGZvdW5kJylcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gY29uc29sZS5sb2cocm91dGUpO1xuICBmbnMgPSByb3V0ZS5taWRkbGV3YXJlcy5jb25jYXQoW3JvdXRlLmhhbmRsZXIuYmluZChudWxsLCBoYW5kbGVyUGFyYW1zKV0pO1xuICBmb3IgKGxldCBpID0gZm5zLmxlbmd0aCAtIDE7IGkgPiAwLCBmbiA9IGZuc1tpXTsgaS0tKSB7XG4gICAgaWYgKGkgIT09IGZucy5sZW5ndGggLSAxKSB7XG4gICAgICBmbnNbaV0gPSBmbi5iaW5kKG51bGwsIGZuc1tpKzFdLCByb3V0ZS5wYXJhbXMpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGZuc1tpXSA9IGZuLmJpbmQobnVsbCwgcm91dGUucGFyYW1zKTtcbiAgICB9XG4gIH1cbiAgLy8gY29uc29sZS5sb2coZm5zKVxuICBmbnNbMF0oKTtcbn07XG5cbmNvbnN0IFN1YnJvdXRlciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJvdXRlcyA9IFtdO1xufTtcblN1YnJvdXRlci5wcm90b3R5cGUgPSBSb3V0ZXIucHJvdG90eXBlO1xuUm91dGVyLlN1YnJvdXRlciA9IFN1YnJvdXRlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBSb3V0ZXI7XG59LHt9XSw2MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB0YWdzID0gWydkaXYnLCAnc3BhbicsICdidXR0b24nXTtcblxuY29uc3QgSGVhZGVySXRlbSA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgY29uc3QgdGl0bGUgPSBvcHRzLnRpdGxlIHx8ICcnO1xuICBjb25zdCBjbGFzc05hbWUgPSBvcHRzLmNsYXNzTmFtZSB8fCAnJztcbiAgY29uc3QgdGFnID0gdGFncy5maW5kKHRhZyA9PiB0YWcgPT09IG9wdHMudGFnKSA/XG4gICAgb3B0cy50YWcgOlxuICAgICdzcGFuJztcblxuICBjb25zdCBoZWFkZXJJdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICBoZWFkZXJJdGVtLmNsYXNzTmFtZSA9ICd0YWJzLWhlYWRlci1pdGVtICcgKyBjbGFzc05hbWU7XG4gIGhlYWRlckl0ZW0uaW5uZXJIVE1MID0gdGl0bGU7XG5cbiAgaWYgKG9wdHMuYXR0cmlidXRlcykge1xuICAgIG9wdHMuYXR0cmlidXRlcy5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgaGVhZGVySXRlbS5zZXRBdHRyaWJ1dGUoYXR0ci5uYW1lLCBhdHRyLnZhbHVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudDogaGVhZGVySXRlbVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJJdGVtO1xufSx7fV0sNjI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgZGVmYXVsdEFuaW0gPSBmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gaGFuZGxlcihldnQpIHtcbiAgICBjb25zdCB0YWIgPSBldnQudGFyZ2V0LmNsb3Nlc3QoJy50YWJzLWhlYWRlci1pdGVtJykuZGF0YXNldC5vcmRlcjtcbiAgICB0aGlzLmdvdG9UYWIodGFiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdvdG9UYWIodGFiKSB7XG4gICAgdGFiLS07XG4gICAgY29uc3QgbmV3SGVhZGVySXRlbSA9IHRoaXMuaGVhZGVyLml0ZW1zW3RhYl07XG4gICAgY29uc3QgbmV3Q29udGVudEl0ZW0gPSB0aGlzLmNvbnRlbnQuaXRlbXNbdGFiXTtcblxuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG5cbiAgICBuZXdIZWFkZXJJdGVtLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgIG5ld0NvbnRlbnRJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgIG5ld0NvbnRlbnRJdGVtLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IG5ld0hlYWRlckl0ZW07XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSBuZXdDb250ZW50SXRlbTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUodGFiKSB7XG4gICAgdGFiO1xuICAgIGNvbnN0IGFjdGl2ZUhlYWRlckl0ZW0gPSB0aGlzLmhlYWRlci5pdGVtc1t0YWJdO1xuICAgIGNvbnN0IGFjdGl2ZUNvbnRlbnRJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW3RhYl07XG4gICAgY29uc3Qgbm9uQWN0aXZlQ29udGVudEl0ZW1zID0gdGhpcy5jb250ZW50Lml0ZW1zLmZpbHRlcihpdGVtID0+IGl0ZW0gIT09IGFjdGl2ZUNvbnRlbnRJdGVtKTtcblxuICAgIGFjdGl2ZUhlYWRlckl0ZW0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgYWN0aXZlQ29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cbiAgICBub25BY3RpdmVDb250ZW50SXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJykpO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IGFjdGl2ZUhlYWRlckl0ZW07XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSBhY3RpdmVDb250ZW50SXRlbTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlcixcbiAgICBnb3RvVGFiLFxuICAgIGluaXRpYWxpemVcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdEFuaW07XG59LHt9XSw2MzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBzZXRDb250ZW50SXRlbXNXaWR0aHMgPSBmdW5jdGlvbihvcHRpb25zLCBhbmltUGFyYW1zKSB7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBvcHRpb25zLmNvbnRyb2xsZXIgfHwge307XG4gIGNvbnN0IG5ld09yZGVyID0gb3B0aW9ucy5uZXdPcmRlcjtcbiAgY29uc3Qgc2V0Rm9yTmV3T3JkZXIgPSBvcHRpb25zLnNldEZvck5ld09yZGVyIHx8IGZhbHNlO1xuICBjb25zdCBpdGVtcyA9IGNvbnRyb2xsZXIuY29udGVudC5pdGVtcztcbiAgY29uc3QgbGVuID0gaXRlbXMubGVuZ3RoO1xuICBjb25zdCB3aWR0aCA9IGNvbnRyb2xsZXIuY29udGVudC5lbGVtZW50LmNsaWVudFdpZHRoO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuLCBpdGVtID0gaXRlbXNbaV07IGkrKykge1xuICAgIGlmIChzZXRGb3JOZXdPcmRlciB8fCBpdGVtICE9PSBpdGVtc1tuZXdPcmRlcl0pIHtcbiAgICAgIGl0ZW0uc3R5bGUud2lkdGggPSAod2lkdGggLSAyKmFuaW1QYXJhbXMucGFkZGluZykgKyAncHgnO1xuICAgIH1cbiAgfVxufTtcblxuY29uc3Qgc2V0Q29udGVudEl0ZW1zUG9zaXRpb25zID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBjb25zdCBjb250cm9sbGVyID0gb3B0aW9ucy5jb250cm9sbGVyIHx8IHt9O1xuICBjb25zdCBuZXdPcmRlciA9IG9wdGlvbnMubmV3T3JkZXI7XG4gIGNvbnN0IHNldEZvck5ld09yZGVyID0gb3B0aW9ucy5zZXRGb3JOZXdPcmRlciB8fCBmYWxzZTtcbiAgY29uc3QgaXRlbXMgPSBjb250cm9sbGVyLmNvbnRlbnQuaXRlbXM7XG4gIGNvbnN0IGxlbiA9IGl0ZW1zLmxlbmd0aDtcbiAgY29uc3Qgd2lkdGggPSBjb250cm9sbGVyLmNvbnRlbnQuZWxlbWVudC5jbGllbnRXaWR0aDtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbiwgaXRlbSA9IGl0ZW1zW2ldOyBpKyspIHtcbiAgICBpZiAoc2V0Rm9yTmV3T3JkZXIgfHwgaXRlbSAhPT0gaXRlbXNbbmV3T3JkZXJdKSB7XG4gICAgICBpdGVtLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGVYKCR7KGktbmV3T3JkZXIpKndpZHRofXB4KWA7XG4gICAgfVxuICB9XG59O1xuXG5jb25zdCBzZXRDb250ZW50SXRlbXNEaXNwbGF5ID0gZnVuY3Rpb24ob3B0cykge1xuICBjb25zdCBjb250ZW50SXRlbXMgPSBvcHRzLmNvbnRyb2xsZXIuY29udGVudC5pdGVtcztcbiAgY29uc3QgZGlzcGxheSA9IG9wdHMuZGlzcGxheTtcbiAgY29uc3QgbmV3T3JkZXIgPSBvcHRzLm5ld09yZGVyO1xuICBjb25zdCBzZXRGb3JOZXdPcmRlciA9IG9wdHMuc2V0Rm9yTmV3T3JkZXI7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb250ZW50SXRlbXMubGVuZ3RoLCBjaSA9IGNvbnRlbnRJdGVtc1tpXTsgaSsrKSB7XG4gICAgaWYgKHNldEZvck5ld09yZGVyIHx8IGNpICE9PSBjb250ZW50SXRlbXNbbmV3T3JkZXJdKSB7XG4gICAgICBjaS5zdHlsZS5kaXNwbGF5ID0gZGlzcGxheTtcbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0IFRhYnNGbG93QW5pbWF0aW9uID0gZnVuY3Rpb24oKSB7XG4gIGxldCBwYXJhbXM7XG5cbiAgZnVuY3Rpb24gaGFuZGxlcihldnQpIHtcbiAgICBpZiAodGhpcy5hY3RpdmUud29ya2luZykgcmV0dXJuO1xuICAgIHRoaXMuYWN0aXZlLndvcmtpbmcgPSB0cnVlO1xuICAgIC8vIEhJIHN0YW5kcyBmb3IgSGVhZGVyIEl0ZW1cbiAgICAvLyBDSSBzdGFuZHMgZm9yIENvbnRlbnQgSXRlbVxuICAgIGNvbnN0IG5ld0hJID0gZXZ0LnRhcmdldC5jbG9zZXN0KCcudGFicy1oZWFkZXItaXRlbScpO1xuICAgIGNvbnN0IG9yZGVyID0gK25ld0hJLmRhdGFzZXQub3JkZXIgLSAxO1xuICAgIGNvbnN0IG5ld0NJID0gdGhpcy5jb250ZW50Lml0ZW1zW29yZGVyXTtcbiAgICBjb25zdCBzcGVlZCA9IHBhcmFtcy5zcGVlZDtcbiAgICBjb25zdCBvbGRPcmRlciA9ICt0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtLmRhdGFzZXQub3JkZXIgLSAxO1xuXG4gICAgc2V0Q29udGVudEl0ZW1zUG9zaXRpb25zKHtjb250cm9sbGVyOiB0aGlzLCBuZXdPcmRlcjogb2xkT3JkZXIsIHNldEZvck5ld09yZGVyOiBmYWxzZX0pO1xuICAgIHNldENvbnRlbnRJdGVtc0Rpc3BsYXkoe2NvbnRyb2xsZXI6IHRoaXMsIG5ld09yZGVyOiBvcmRlciwgc2V0Rm9yTmV3T3JkZXI6IHRydWUsIGRpc3BsYXk6ICdibG9jayd9KTtcbiAgICBuZXdISS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIHRoaXMuY29udGVudC5lbGVtZW50LnN0eWxlLmhlaWdodCA9IHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLmNsaWVudEhlaWdodCArICdweCc7XG4gICAgdGhpcy5jb250ZW50LmVsZW1lbnQuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gc3BlZWQgKyAnbXMnO1xuICAgIHRoaXMuY29udGVudC5lbGVtZW50LnN0eWxlLmhlaWdodCA9IG5ld0NJLmNsaWVudEhlaWdodCArICdweCc7XG5cbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uc3R5bGUudG9wID0gcGFyYW1zLnBhZGRpbmcgKyAncHgnO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLnN0eWxlLmxlZnQgPSBwYXJhbXMucGFkZGluZyArICdweCc7XG5cbiAgICB0aGlzLmNvbnRlbnQuaXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gc3BlZWQgKyAnbXMnKTtcblxuICAgIHNldENvbnRlbnRJdGVtc1dpZHRocyh7Y29udHJvbGxlcjogdGhpcywgbmV3T3JkZXI6IG9yZGVyLCBzZXRGb3JOZXdPcmRlcjogdHJ1ZX0sIHBhcmFtcyk7XG4gICAgc2V0Q29udGVudEl0ZW1zUG9zaXRpb25zKHtjb250cm9sbGVyOiB0aGlzLCBuZXdPcmRlcjogb3JkZXIsIHNldEZvck5ld09yZGVyOiB0cnVlfSk7XG4gICAgXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBuZXdDSS5zdHlsZS5wb3NpdGlvbiA9ICdzdGF0aWMnO1xuICAgICAgbmV3Q0kuc3R5bGUud2lkdGggPSAnYXV0byc7XG4gICAgICB0aGlzLmNvbnRlbnQuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XG4gICAgICB0aGlzLmNvbnRlbnQuaXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gJzBtcycpO1xuICAgICAgdGhpcy5jb250ZW50LmVsZW1lbnQuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gJzBtcyc7XG4gICAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtID0gbmV3SEk7XG4gICAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbSA9IG5ld0NJO1xuICAgICAgdGhpcy5hY3RpdmUud29ya2luZyA9IGZhbHNlO1xuICAgICAgc2V0Q29udGVudEl0ZW1zRGlzcGxheSh7XG4gICAgICAgIGNvbnRyb2xsZXI6IHRoaXMsXG4gICAgICAgIG5ld09yZGVyOiBvcmRlcixcbiAgICAgICAgc2V0Rm9yTmV3T3JkZXI6IGZhbHNlLFxuICAgICAgICBkaXNwbGF5OiAnbm9uZSdcbiAgICAgIH0pO1xuICAgIH0sIHNwZWVkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdvdG9UYWIodGFiKSB7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUodGFiLCBhbmltT3B0aW9ucykge1xuICAgIHBhcmFtcyA9IGFuaW1PcHRpb25zIHx8IHt9O1xuICAgIC8vIEFkZCBjbGFzc2VzXG4gICAgdGhpcy5jb250ZW50LmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgndGFicy1mbG93LWNvbnRlbnQnKTtcbiAgICB0aGlzLmNvbnRlbnQuaXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgndGFicy1mbG93LUNJJykpO1xuICAgIFxuICAgIC8vIFNldCBpbmRpdmlkdWFsIENTU1xuICAgIGNvbnN0IENJcyA9IHRoaXMuY29udGVudC5pdGVtcztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IENJcy5sZW5ndGgsIGl0ZW0gPSBDSXNbaV07IGkrKykge1xuICAgICAgaWYgKGkgIT09IHRhYikge1xuICAgICAgICBDSXNbaV0uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnOyAgICBcbiAgICAgICAgQ0lzW2ldLnN0eWxlLnRvcCA9IHBhcmFtcy5wYWRkaW5nICsgJ3B4JztcbiAgICAgICAgQ0lzW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuaGVhZGVyLml0ZW1zW3RhYl0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cbiAgICAvLyBTZXQgYWN0aXZlIG9iamVjdFxuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0gPSB0aGlzLmhlYWRlci5pdGVtc1t0YWJdO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW3RhYl07XG5cbiAgICAvLyBBZGQgb24gcmVzaXppbmcgZXZlbnQgaGFuZGxlclxuICAgIGNvbnN0IG5ld09yZGVyID0gK3RoaXMuYWN0aXZlLmhlYWRlckl0ZW0uZGF0YXNldC5vcmRlciAtIDE7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgIGNvbnN0IG5ld09yZGVyID0gK2NvbnRyb2xsZXIuYWN0aXZlLmhlYWRlckl0ZW0uZGF0YXNldC5vcmRlciAtIDE7XG4gICAgICBjb25zdCBvcHRpb25zID0ge2NvbnRyb2xsZXI6IHRoaXMsIG5ld09yZGVyOiBuZXdPcmRlcn07XG4gICAgICBpZiAodGhpcy5hY3RpdmUud29ya2luZykge1xuICAgICAgICBzZXRDb250ZW50SXRlbXNXaWR0aHMob3B0aW9ucywgcGFyYW1zKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBzZXRDb250ZW50SXRlbXNXaWR0aHMob3B0aW9ucywgcGFyYW1zKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgc2V0Q29udGVudEl0ZW1zUG9zaXRpb25zKG9wdGlvbnMpXG4gICAgfSk7XG5cbiAgICBzZXRDb250ZW50SXRlbXNEaXNwbGF5KHtcbiAgICAgIGNvbnRyb2xsZXI6IHRoaXMsXG4gICAgICBuZXdPcmRlcjogbmV3T3JkZXIsXG4gICAgICBzZXRGb3JOZXdPcmRlcjogZmFsc2UsXG4gICAgICBkaXNwbGF5OiAnbm9uZSdcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlcixcbiAgICBnb3RvVGFiLFxuICAgIGluaXRpYWxpemVcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGFic0Zsb3dBbmltYXRpb247XG59LHt9XSw2NDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBkZWZhdWx0QW5pbSA9IHJlcXVpcmUoJy4vZGVmYXVsdCcpO1xuY29uc3QgbG9naW5TaWdudXBTd2l0Y2ggPSByZXF1aXJlKCcuL2xvZ2luU2lnbnVwU3dpdGNoJyk7XG5jb25zdCB0YWJzRmxvd0FuaW1hdGlvbiA9IHJlcXVpcmUoJy4vZmxvdycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZGVmYXVsdEFuaW0sXG4gIGxvZ2luU2lnbnVwU3dpdGNoLFxuICB0YWJzRmxvd0FuaW1hdGlvblxufTtcbn0se1wiLi9kZWZhdWx0XCI6NjIsXCIuL2Zsb3dcIjo2MyxcIi4vbG9naW5TaWdudXBTd2l0Y2hcIjo2NX1dLDY1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGxvZ2luU2lnbnVwU3dpdGNoID0gZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIGhhbmRsZXIoZXZ0KSB7XG4gICAgaWYgKHRoaXMuYmVpbmdBbmltYXRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmJlaW5nQW5pbWF0ZWQgPSB0cnVlO1xuXG4gICAgY29uc3Qgb2xkSEl0ZW0gPSB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtO1xuICAgIGNvbnN0IG9sZENJdGVtID0gdGhpcy5hY3RpdmUuY29udGVudEl0ZW07XG4gICAgY29uc3QgbmV3SEl0ZW0gPSBldnQudGFyZ2V0LmNsb3Nlc3QoJy50YWJzLWhlYWRlci1pdGVtJyk7XG4gICAgY29uc3Qgb3JkZXIgPSBuZXdISXRlbS5kYXRhc2V0Lm9yZGVyO1xuICAgIGNvbnN0IG5ld0NJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW29yZGVyLTFdO1xuXG4gICAgb2xkSEl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnbG9naW5TaWdudXAtSEktYWN0aXZlJyk7XG4gICAgbmV3SEl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtSEktYWN0aXZlJyk7XG5cbiAgICBvbGRDSXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1DSS1hY3RpdmUnKTtcbiAgICBvbGRDSXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1oaWRpbmcnKTtcbiAgICBuZXdDSXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1DSS1oaWRkZW4nKTtcbiAgICBuZXdDSXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1hY3RpdmF0aW5nJyk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIG9sZENJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnVwLUNJLWhpZGluZycpO1xuICAgICAgb2xkQ0l0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktaGlkZGVuJyk7XG5cbiAgICAgIG5ld0NJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnVwLUNJLWFjdGl2YXRpbmcnKTtcbiAgICAgIG5ld0NJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJLWFjdGl2ZScpO1xuXG4gICAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtID0gbmV3SEl0ZW07XG4gICAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbSA9IG5ld0NJdGVtO1xuXG4gICAgICB0aGlzLmJlaW5nQW5pbWF0ZWQgPSBmYWxzZTtcbiAgICB9LCA1MDApO1xuICB9XG5cbiAgZnVuY3Rpb24gZ290b1RhYih0YWIpIHtcbiAgICBjb25zdCBuZXdIZWFkZXJJdGVtID0gdGhpcy5oZWFkZXIuaXRlbXNbdGFiXTtcbiAgICBjb25zdCBuZXdDb250ZW50SXRlbSA9IHRoaXMuY29udGVudC5pdGVtc1t0YWJdO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1ISS1hY3RpdmUnKTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251LUNJLWFjdGl2ZScpO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJLWhpZGRlbicpO1xuXG4gICAgbmV3SGVhZGVySXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1ISS1hY3RpdmUnKTtcbiAgICBuZXdDb250ZW50SXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1DSS1oaWRkZW4nKTtcbiAgICBuZXdDb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1hY3RpdmUnKTtcblxuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0gPSBuZXdIZWFkZXJJdGVtO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtID0gbmV3Q29udGVudEl0ZW07XG4gIH1cblxuICBmdW5jdGlvbiBpbml0aWFsaXplKHRhYikge1xuICAgIHRoaXMuaGVhZGVyLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtaGVhZGVyJyk7XG4gICAgdGhpcy5jb250ZW50LmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtY29udGVudCcpO1xuICAgIHRoaXMuaGVhZGVyLml0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUhJJykpO1xuICAgIHRoaXMuY29udGVudC5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSScpKTtcblxuICAgIGNvbnN0IGFjdGl2ZUhlYWRlckl0ZW0gPSB0aGlzLmhlYWRlci5pdGVtc1t0YWJdO1xuICAgIGNvbnN0IGFjdGl2ZUNvbnRlbnRJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW3RhYl07XG4gICAgY29uc3Qgbm9uQWN0aXZlQ29udGVudEl0ZW1zID0gdGhpcy5jb250ZW50Lml0ZW1zLmZpbHRlcihpdGVtID0+IGl0ZW0gIT09IGFjdGl2ZUNvbnRlbnRJdGVtKTtcblxuICAgIGFjdGl2ZUhlYWRlckl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtSEktYWN0aXZlJyk7XG4gICAgYWN0aXZlQ29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktYWN0aXZlJyk7XG5cbiAgICBub25BY3RpdmVDb250ZW50SXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktaGlkZGVuJykpO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IGFjdGl2ZUhlYWRlckl0ZW07XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSBhY3RpdmVDb250ZW50SXRlbTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlcixcbiAgICBnb3RvVGFiLFxuICAgIGluaXRpYWxpemVcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbG9naW5TaWdudXBTd2l0Y2g7XG59LHt9XSw2NjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBIZWFkZXJJdGVtID0gcmVxdWlyZSgnLi9IZWFkZXJJdGVtJyk7XG5jb25zdCBhbmltcyA9IHJlcXVpcmUoJy4vYW5pbWF0aW9ucycpO1xuXG5jb25zdCBUYWJzID0gZnVuY3Rpb24ob3B0cykge1xuICBjb25zdCBoZWFkZXJJdGVtcyA9XG4gICAgb3B0cy5oZWFkZXIuaXRlbXMubWFwKGl0ZW0gPT4gbmV3IEhlYWRlckl0ZW0oaXRlbSkuZWxlbWVudCkgfHwgW107XG4gIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBoZWFkZXIuY2xhc3NOYW1lID0gJ3RhYnMtaGVhZGVyICcgKyBvcHRzLmhlYWRlci5jbGFzc05hbWU7XG4gIGhlYWRlckl0ZW1zLmZvckVhY2goaXRlbSA9PiBoZWFkZXIuYXBwZW5kQ2hpbGQoaXRlbSkpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaGVhZGVySXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBoZWFkZXJJdGVtc1tpXS5kYXRhc2V0Lm9yZGVyID0gaSsxO1xuICB9XG5cbiAgY29uc3QgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBjb250ZW50LmNsYXNzTmFtZSA9ICd0YWJzLWNvbnRlbnQgJyArIChvcHRzLmNvbnRlbnQuY2xhc3NOYW1lIHx8ICcnKTtcbiAgY29uc3QgY29udGVudEl0ZW1zID0gb3B0cy5jb250ZW50Lml0ZW1zIHx8IFtdO1xuICBjb250ZW50SXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ3RhYnMtY29udGVudC1pdGVtJyk7XG4gICAgY29udGVudC5hcHBlbmRDaGlsZChpdGVtKTtcbiAgfSk7XG5cbiAgY29uc3QgYWN0aXZlID0ge1xuICAgIGhlYWRlckl0ZW06IG51bGwsXG4gICAgY29udGVudEl0ZW06IG51bGxcbiAgfTtcblxuICBjb25zdCBhbmltID0gYW5pbXNbb3B0cy5hbmltYXRpb24ubmFtZV0gP1xuICAgIG5ldyBhbmltc1tvcHRzLmFuaW1hdGlvbi5uYW1lXSA6XG4gICAgbmV3IGFuaW1zWydkZWZhdWx0QW5pbSddO1xuXG4gIGNvbnN0IHRhYnMgPSB7XG4gICAgaGVhZGVyOiB7XG4gICAgICBlbGVtZW50OiBoZWFkZXIsXG4gICAgICBpdGVtczogaGVhZGVySXRlbXNcbiAgICB9LFxuICAgIGNvbnRlbnQ6IHtcbiAgICAgIGVsZW1lbnQ6IGNvbnRlbnQsXG4gICAgICBpdGVtczogY29udGVudEl0ZW1zXG4gICAgfSxcbiAgICBhY3RpdmU6IGFjdGl2ZSxcbiAgICBnb3RvVGFiOiBhbmltLmdvdG9UYWIsXG4gICAgaW1pdGF0ZUNsaWNrT25UYWI6IGZ1bmN0aW9uKHRhYikge1xuICAgICAgdGhpcy5oZWFkZXIuaXRlbXNbdGFiXS5jbGljaygpO1xuICAgIH1cbiAgfTtcbiAgICBcbiAgaGVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBjb25zdCBsaW5rID0gZXZ0LnRhcmdldDtcbiAgICBjb25zdCByZXN1bHQgPSBoZWFkZXJJdGVtcy5maW5kKGl0ZW0gPT4gaXRlbSA9PT0gbGluay5jbG9zZXN0KCcudGFicy1oZWFkZXItaXRlbScpKTtcblxuICAgIGlmICghcmVzdWx0IHx8IHJlc3VsdCA9PT0gdGFicy5hY3RpdmUuaGVhZGVySXRlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGFuaW0uaGFuZGxlci5jYWxsKHRhYnMsIGV2dCk7XG4gICAgfVxuICB9KTtcblxuICBjb25zdCBpbml0aWFsaXplciA9XG4gICAgb3B0cy5hbmltYXRpb24uaW5pdGlhbGl6ZXIgP1xuICAgIG9wdHMuYW5pbWF0aW9uLmluaXRpYWxpemVyIC0gMSA6XG4gICAgMDtcbiAgXG4gIGFuaW0uaW5pdGlhbGl6ZS5jYWxsKHRhYnMsIGluaXRpYWxpemVyLCBvcHRzLmFuaW1hdGlvbi5wYXJhbXMpO1xuXG4gIHJldHVybiB0YWJzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYWJzO1xufSx7XCIuL0hlYWRlckl0ZW1cIjo2MSxcIi4vYW5pbWF0aW9uc1wiOjY0fV0sNjc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgY3JlYXRlRWxlbWVudEZyb21IVE1MID0gZnVuY3Rpb24oaHRtbCkge1xuICBjb25zdCB0ZW1wUGFyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHRlbXBQYXJlbnQuaW5uZXJIVE1MID0gaHRtbDtcbiAgcmV0dXJuIHRlbXBQYXJlbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG59O1xuXG5mdW5jdGlvbiBTaW5nbGV0b24oZm4pIHtcbiAgZnVuY3Rpb24gQ2xhc3MoKSB7XG4gICAgaWYgKENsYXNzLmluc3RhbmNlKSB7XG4gICAgICByZXR1cm4gQ2xhc3MuaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIENsYXNzLmluc3RhbmNlID0gZm4oKTtcbiAgfVxuXG4gIENsYXNzLmdldEluc3RhbmNlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIENsYXNzLmluc3RhbmNlIHx8IG5ldyBDbGFzcygpO1xuICB9O1xuXG4gIENsYXNzLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBDbGFzcy5pbnN0YW5jZSA9IG51bGw7XG4gIH07XG5cbiAgcmV0dXJuIENsYXNzO1xufVxuXG5mdW5jdGlvbiByYW5nZShzdGFydCwgZW5kKSB7XG4gIGxldCBhcnIgPSBbXTtcbiAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDw9IGVuZDsgaSsrKSBhcnIucHVzaChpKTtcbiAgcmV0dXJuIGFycjtcbn1cblxuZnVuY3Rpb24gc29ydE51bWJlcnMoYSwgYikge1xuICBpZiAoYSA+IGIpIHJldHVybiAxO1xuICBpZiAoYSA8IGIpIHJldHVybiAtMTtcbiAgcmV0dXJuIDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGVFbGVtZW50RnJvbUhUTUwsXG4gIFNpbmdsZXRvbixcbiAgcmFuZ2UsXG4gIHNvcnROdW1iZXJzXG59O1xufSx7fV0sNjg6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgUm9vdCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9tYWluL3Jvb3RDb21wb25lbnQnKTtcbmNvbnN0IERhc2hib2FyZCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmQnKTtcbmNvbnN0IE1haW5Db250cm9sbGVyID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL21haW4nKTtcbmNvbnN0IHtyb3V0ZXJ9ID0gTWFpbkNvbnRyb2xsZXI7XG5cbmNvbnN0IFJvdXRlciA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9yb3V0ZXInKTtcbmNvbnN0IFN0YXJ0ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3N0YXJ0Jyk7XG5jb25zdCBUZXN0ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3Rlc3QnKVxuXG4vLyBjb25zdCByb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG4vLyBNYWluQ29udHJvbGxlci5yb3V0ZXIgPSByb3V0ZXI7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcblxuaHR0cC5jb25maWd1cmUoeyBsb2NhdGlvbjogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcgfSk7XG5cbmNvbnN0IHZlcmlmaWNhdGlvblJvdXRlID0gcmVxdWlyZSgnY3NwLWFwcC9yb3V0ZXMvYXV0aC92ZXJpZmljYXRpb24nKTtcbmNvbnN0IHJvb3RIYW5kbGVyID0gcmVxdWlyZSgnY3NwLWFwcC9yb3V0ZXMvcm9vdCcpO1xuY29uc3Qge3NjaGVkdWxlckhhbmRsZXIsIHVzZXJzSGFuZGxlciwgdXNlckhhbmRsZXJ9ID0gcmVxdWlyZSgnY3NwLWFwcC9yb3V0ZXMvZGFzaGJvYXJkJyk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBjb25zdCBsaW5rID0gZXZ0LnRhcmdldC5jbG9zZXN0KCdhJyk7XG5cbiAgICBpZiAobGluayAmJiBsaW5rLmRhdGFzZXQucm91dGUpIHtcbiAgICAgICAgcm91dGVyLm5hdmlnYXRlKGxpbmsuZGF0YXNldC5yb3V0ZSk7XG4gICAgfVxufSk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIGV2dCA9PiB7XG4gICAgY29uc29sZS5sb2coJ3BhZ2UgY2hhbmdlZDogJywgZG9jdW1lbnQubG9jYXRpb24pO1xuICAgIGNvbnNvbGUubG9nKGV2dCk7XG4gICAgcm91dGVyLm5hdmlnYXRlKGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lKTtcbn0pO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oZXZ0KSB7XG4gICAgbGV0IHBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgY29uc3Qgcm9vdEluc3RhbmNlID0gUm9vdC5jcmVhdGUoKTtcbiAgICBNYWluQ29udHJvbGxlci5pbml0aWFsaXplKHJvb3RJbnN0YW5jZSk7XG5cbiAgICByb3V0ZXJcbiAgICAgICAgLy8gLmFkZFJvdXRlKCcvJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICAgICBNYWluQ29udHJvbGxlci5yZW5kZXJDaGFpbihbU3RhcnRdKVxuICAgICAgICAvLyB9KVxuICAgICAgICAuYWRkUm91dGUoJy8nLCByb290SGFuZGxlcilcbiAgICAgICAgLmFkZFJvdXRlKCdkYXNoYm9hcmQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIE1haW5Db250cm9sbGVyLnJlbmRlckNoYWluKFtUZXN0XSlcbiAgICAgICAgfSlcbiAgICAgICAgLmFkZFJvdXRlKCdsb2dpbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgIH0pXG4gICAgICAgIC5hZGRSb3V0ZSgnc2lnbnVwL3ZlcmlmeScsIHZlcmlmaWNhdGlvblJvdXRlKVxuICAgICAgICAuYWRkUm91dGUoJ3NjaGVkdWxlcicsIHNjaGVkdWxlckhhbmRsZXIpXG4gICAgICAgIC5hZGRSb3V0ZSgndXNlcnMnLCB1c2Vyc0hhbmRsZXIpXG4gICAgICAgIC5hZGRSb3V0ZSgndXNlcnMvKDppZCknLCB1c2VySGFuZGxlcilcbiAgICBcbiAgICByb3V0ZXIubmF2aWdhdGUocGF0aClcbn0pO1xufSx7XCJjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkXCI6MSxcImNzcC1hcHAvY29tcG9uZW50cy9tYWluXCI6NSxcImNzcC1hcHAvY29tcG9uZW50cy9tYWluL3Jvb3RDb21wb25lbnRcIjo2LFwiY3NwLWFwcC9jb21wb25lbnRzL3N0YXJ0XCI6MzMsXCJjc3AtYXBwL2NvbXBvbmVudHMvdGVzdFwiOjM3LFwiY3NwLWFwcC9saWJzL2h0dHBcIjo1OCxcImNzcC1hcHAvbGlicy9yb3V0ZXJcIjo2MCxcImNzcC1hcHAvcm91dGVzL2F1dGgvdmVyaWZpY2F0aW9uXCI6NjksXCJjc3AtYXBwL3JvdXRlcy9kYXNoYm9hcmRcIjo3MCxcImNzcC1hcHAvcm91dGVzL3Jvb3RcIjo3NH1dLDY5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtyZW5kZXJ9ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL21haW4nKTtcbmNvbnN0IFZlcmlmaWNhdGlvbkNvbXBvbmVudCA9IHJlcXVpcmUoJ2NzcC1hcHAvZ3JvdXBzL2F1dGgvdmVyaWZpY2F0aW9uJyk7XG5cbmZ1bmN0aW9uIHZlcmlmaWNhdGlvbigpIHtcbiAgcmVuZGVyKFtuZXcgVmVyaWZpY2F0aW9uQ29tcG9uZW50KCldKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB2ZXJpZmljYXRpb247XG59LHtcImNzcC1hcHAvY29tcG9uZW50cy9tYWluXCI6NSxcImNzcC1hcHAvZ3JvdXBzL2F1dGgvdmVyaWZpY2F0aW9uXCI6NTJ9XSw3MDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBzY2hlZHVsZXJIYW5kbGVyID0gcmVxdWlyZSgnLi9zY2hlZHVsZXInKTsgXG5jb25zdCB1c2Vyc0hhbmRsZXIgPSByZXF1aXJlKCcuL3VzZXJzJyk7XG5jb25zdCB1c2VySGFuZGxlciA9IHJlcXVpcmUoJy4vdXNlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2NoZWR1bGVySGFuZGxlcixcbiAgdXNlcnNIYW5kbGVyLFxuICB1c2VySGFuZGxlclxufTtcbn0se1wiLi9zY2hlZHVsZXJcIjo3MSxcIi4vdXNlclwiOjcyLFwiLi91c2Vyc1wiOjczfV0sNzE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge3JlbmRlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvbWFpbicpO1xuY29uc3QgRGFzaGJvYXJkID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL2Rhc2hib2FyZCcpO1xuY29uc3QgU2NoZWR1bGVyQ29tcG9uZW50ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3NjaGVkdWxlcicpO1xuXG5jb25zdCBTY2hlZHVsZXJIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gIHJlbmRlcihbRGFzaGJvYXJkLCBTY2hlZHVsZXJDb21wb25lbnRdKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2NoZWR1bGVySGFuZGxlcjtcbn0se1wiY3NwLWFwcC9jb21wb25lbnRzL2Rhc2hib2FyZFwiOjEsXCJjc3AtYXBwL2NvbXBvbmVudHMvbWFpblwiOjUsXCJjc3AtYXBwL2NvbXBvbmVudHMvc2NoZWR1bGVyXCI6MTd9XSw3MjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7cmVuZGVyfSA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9tYWluJyk7XG5jb25zdCBEYXNoYm9hcmQgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkJyk7XG5jb25zdCB7VXNlclBhZ2VDb21wb25lbnR9ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3VzZXJzL3N0YW5kYWxvbmVzJyk7XG5cbmNvbnN0IFVzZXJIYW5kbGVyID0gZnVuY3Rpb24obm9uZSwgcGFyYW1zKSB7XG4gIHJlbmRlcihbRGFzaGJvYXJkLCBVc2VyUGFnZUNvbXBvbmVudChwYXJhbXMuaWQpXSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVzZXJIYW5kbGVyO1xufSx7XCJjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkXCI6MSxcImNzcC1hcHAvY29tcG9uZW50cy9tYWluXCI6NSxcImNzcC1hcHAvY29tcG9uZW50cy91c2Vycy9zdGFuZGFsb25lc1wiOjM5fV0sNzM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge3JlbmRlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvbWFpbicpO1xuY29uc3QgRGFzaGJvYXJkID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL2Rhc2hib2FyZCcpO1xuY29uc3QgVXNlcnNDb21wb25lbnQgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvdXNlcnMnKTtcblxuY29uc3QgVXNlcnNIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gIHJlbmRlcihbRGFzaGJvYXJkLCBVc2Vyc0NvbXBvbmVudF0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBVc2Vyc0hhbmRsZXI7XG59LHtcImNzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmRcIjoxLFwiY3NwLWFwcC9jb21wb25lbnRzL21haW5cIjo1LFwiY3NwLWFwcC9jb21wb25lbnRzL3VzZXJzXCI6Mzh9XSw3NDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IHtyZW5kZXJ9ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL21haW4nKTtcbmNvbnN0IFN0YXJ0ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3N0YXJ0Jyk7XG5jb25zdCBEYXNoYm9hcmQgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkJyk7XG5cbmNvbnN0IGNoZWNrQXV0aCA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gIHJldHVybiBodHRwXG4gICAgLnBvc3QoJ2F1dGgvYXV0aGVudGljYXRlJywge3Rva2VuOiB0b2tlbn0pXG4gIDtcbn07XG5cbmNvbnN0IHJvb3RIYW5kbGVyID0gYXN5bmMgZnVuY3Rpb24oKSB7XG4gIGNvbnN0IHRva2VuID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhdXRoX3Rva2VuJykgfHwgbnVsbDtcbiAgY29uc3QgaXNBdXRoZW50aWNhdGVkID0gdG9rZW4gPyAoYXdhaXQgY2hlY2tBdXRoKHRva2VuKSkuc3VjY2VzcyA6IGZhbHNlO1xuXG4gIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICByZW5kZXIoW0Rhc2hib2FyZF0pO1xuICB9XG4gIGVsc2Uge1xuICAgIHJlbmRlcihbU3RhcnRdKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSByb290SGFuZGxlcjtcbn0se1wiY3NwLWFwcC9jb21wb25lbnRzL2Rhc2hib2FyZFwiOjEsXCJjc3AtYXBwL2NvbXBvbmVudHMvbWFpblwiOjUsXCJjc3AtYXBwL2NvbXBvbmVudHMvc3RhcnRcIjozMyxcImNzcC1hcHAvbGlicy9odHRwXCI6NTh9XX0se30sWzY4XSk7XG4iXSwiZmlsZSI6InNvdXJjZS5qcyJ9
