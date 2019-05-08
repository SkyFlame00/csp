(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const http = require('csp-app/libs/http');
const template = require('./tpl');
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

      templateData.user['avatar_url'] =
        templateData.user['avatar_url'] ?
        templateData.user['avatar_url'] :
        'files/avatars/no-avatar.png';

      const tplController = template(templateData);
      tplController.userPanel.actions.logOutBtn.addEventListener('click', () => {
        window.localStorage.removeItem('auth_token');
        router.navigate('/');
      });
      tplController.userPanel.hello.root.addEventListener('click', () => {
        tplController.userPanel.actions.root.classList.toggle('no-display');
      });
      document.body.addEventListener('click', evt => {
        const isHelloBtn = evt.target.closest('.hello') === tplController.userPanel.hello.root;
        const isActionsBlock = evt.target.closest('.actions') === tplController.userPanel.actions.root;

        if (!isHelloBtn && !isActionsBlock) {
          tplController.userPanel.actions.root.classList.add('no-display');
        }
      });

      const routerOutler = tplController.root.querySelector('.router-outlet');

      return {
        success: true,
        controller: {
          element: tplController.root
        },
        render: function(element) {
          routerOutler.innerHTML = '';
          routerOutler.append(element);
        }
      };
    });
};

module.exports = Dashboard;
},{"./tpl":4,"csp-app/components/main":5,"csp-app/libs/http":73}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
module.exports = /*html*/`
  <div class="menu">
    <ul>
      <li><a data-route=""><i class="i i-project"></i><span>Projects</span></a></li>
      <li><a data-route="scheduler"><i class="i i-calendar"></i><span>Scheduler</span></a></li>
      <li><a data-route="brainstorm"><i class="i i-bulb"></i><span>Brainstorm</span></a></li>
      <li><a data-route="users"><i class="i i-users"></i><span>Users</span></a></li>
    </ul>
  </div>
`;
},{}],4:[function(require,module,exports){
const sidebarExec = require('./templates/sidebar_exec.tpl');
const sidebarClient = require('./templates/sidebar_client.tpl');
const {createElementFromHTML} = require('csp-app/libs/utilities');

module.exports = data => {
  const group = data.user.group;
  let groups = ['academic', 'student', 'ext_exec', null, undefined];
  let sidebar;

  if (groups.includes(group)) {
    sidebar = sidebarExec;
  }

  if (group == 'client') {
    sidebar = sidebarClient;
  }

  const html = /*html*/`
    <div class="cmp_dashboard">
      <div class="sidebar">
        <div class="logo-block">
          <a class="logo" data-route="/">{ CSP }</a>
        </div>

        ${ sidebar }
      </div>
      <div class="main">
        <div class="dboard-header">
          <div class="user-panel">
            <div class="hello">
              <div class="avatar-wrapper">
                <img src="${ data.user['avatar_url'] }" />
              </div>

              <div class="username-wrapper">
                <span>${ data.user.username }</span>
              </div>

              <div class="more-wrapper">
                <i class="i i-sort"></i>
              </div>
            </div>

            <div class="actions block-shadowed no-display">
              <ul>
                <li><a class="profile" data-route="my-profile">My profile</a></li>
                <li><button class="log-out">Log out</button></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="content">
          <div class="router-outlet"></div>
        </div>
      </div>
    </div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element,
    routerOutlet: element.querySelector('.router-outlet'),
    userPanel: {
      hello: {
        root: element.querySelector('.user-panel .hello')
      },
      actions: {
        root: element.querySelector('.user-panel .actions'),
        myProfileBtn: element.querySelector('.user-panel .actions .profile'),
        logOutBtn: element.querySelector('.user-panel .actions .log-out')
      }
    }
  };
};
},{"./templates/sidebar_client.tpl":2,"./templates/sidebar_exec.tpl":3,"csp-app/libs/utilities":82}],5:[function(require,module,exports){
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
},{"csp-app/libs/router":75}],6:[function(require,module,exports){
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
},{"../modals-controller":11,"./actions":8,"./tpl":10,"csp-app/libs/utilities":82}],10:[function(require,module,exports){
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
},{"csp-app/libs/utilities":82}],11:[function(require,module,exports){
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
const {mainTemplate} = require('./templates');
const {participantPillTemplate} = require('../main/templates');
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
    const pIdx = participants.findIndex(p => p['user_id'] == userId);
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
    const pTplController = participantPillTemplate(p);
    this.tplController.participants.place.appendChild(pTplController.root);
    if (p.busy) pTplController.root.classList.add('busy');
  });
};

CEModal.prototype.checkParticipantsBusyness = function() {
  const {participants} = this.data;
  const busyList = participants.filter(p => p.busy).map(p => p.username);

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
        date: date.toString(),
        timeFrom: timeFrom.toString(),
        timeTo: timeTo.toString()
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
},{"../event-created-modal":15,"../main/templates":33,"../select-participants-modal":38,"./templates":13,"csp-app/components/modals":7,"csp-app/libs/http":73}],13:[function(require,module,exports){
const mainTemplate = require('./main.tpl');

module.exports = {
  mainTemplate
};
},{"./main.tpl":14}],14:[function(require,module,exports){
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
        <div class="field-label">Participants <button class="btn-primary-outlined"><i class="i i-plus"></i>Select participants</button></div>
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
},{"csp-app/libs/utilities":82}],15:[function(require,module,exports){
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

  ECModalInstance.elements.body.appendChild(element);

  return ECModalInstance;
}

module.exports = {
  create: () => new ECModal()
};
},{"csp-app/components/modals":7,"csp-app/libs/utilities":82}],16:[function(require,module,exports){
const http = require('csp-app/libs/http');
const Modal = require('csp-app/components/modals');
const mainTemplate = require('./tpl');

function EDModal(options) {
  const EDModalInstance = Modal.create({
    type: 'standard',
    title: '',
    width: 300,
    destroyOnClose: true,
    actions: [{
      id: 'cancel',
      type: 'primary',
      title: 'OK'
    }]
  });

  const {eventId} = options;

  http.get(`scheduler/getEventInfo/${ eventId }`)
    .then(event => {
      event.date = new Date(event.date);
      event['time_from'] = new Date(event['time_from']);
      event['time_to'] = new Date(event['time_to']);
      const tplController = mainTemplate(event);
      EDModalInstance.elements.title.textContent = event.title;
      EDModalInstance.elements.body.appendChild(tplController.root);
    })
  ;

  return EDModalInstance;
}

module.exports = {
  create: options => new EDModal(options)
};
},{"./tpl":17,"csp-app/components/modals":7,"csp-app/libs/http":73}],17:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(e) {
  const date = `${e.date.getDate()}/${e.date.getMonth()}/${e.date.getFullYear()}`;
  const timeFromHH = e['time_from'].getHours().toString().length == 1 ? '0' + e['time_from'].getHours() : e['time_from'].getHours();
  const timeFromMM = e['time_from'].getMinutes().toString().length == 1 ? '0' + e['time_from'].getMinutes() : e['time_from'].getMinutes();
  const timeToHH = e['time_to'].getHours().toString().length == 1 ? '0' + e['time_to'].getHours() : e['time_to'].getHours();
  const timeToMM = e['time_to'].getMinutes().toString().length == 1 ? '0' + e['time_to'].getMinutes() : e['time_to'].getMinutes();
  const time = `${timeFromHH}:${timeFromMM}-${timeToHH}:${timeToMM}`;
  const linkShortened = e.link && e.link.length > 20 ? e.link.length.slice(0, 17) + '...' : e.link;
  let importance;

  switch(e.importance) {
    case 'none':
      importance = 'peace';
      importanceText = 'Free to decide';
      importanceHint = 'The event is not important';
      break;
    case 'desirable':
      importance = 'rock';
      importanceText = 'Desirable';
      importanceHint = 'The event is desirable to visit';
      break;
    case 'important':
      importance = 'paper';
      importanceText = 'Important';
      importanceHint = 'The event is obligatory to visit';
      break;
    default:
      importance = 'peace';
      importanceText = 'Free to decide';
      importanceHint = 'The event is not important';
      break;
  }

  const html = /*html*/`
    <div class="cmp_event-details">
      <div class="top">
        <div class="item date item-simple">
          <i class="i i-calendar"></i>
          <span>${ date }</span>
        </div>

        <div class="item time item-simple">
          <i class="i i-clock"></i>
          <span>${ time }</span>
        </div>

        ${
          e.link ?
          /*html*/`<a class="item link item-bullet" href="${ e.link }"><i class="i i-link"></i><span>${ linkShortened }</span></a>` :
          ''
        }

        ${
          e['category_id'] ?
          /*html*/`<div class="item category item-simple"><i class="i"></i><span>${ e['category_name'] }</span></div>` :
          ''
        }

        <div class="item importance item-bullet ${ importance }">
          <i class="i i-hand-${ importance }"></i>
          <span>${ importanceText }</span>
        </div>
      </div>

      <div class="description">
        ${ e.description ? e.description : 'No description provided' }
      </div>

      <div class="participants">
        <div class="participants-header">Participants</div>
        <div class="participants-body">
          ${
            e.participants.map(p => {
              return /*html*/`
                <div class="participant ${ p.you ? 'you' : '' }">
                  ${ p.you ? 'You' : p.username }
                </div>
              `;
            }).join('')
          }
        </div>
      </div>

      <div class="files">

      </div>
    </div>
  `;

  const element = createElementFromHTML(html);

  return {
    root: element
  };
}

module.exports = template;
},{"csp-app/libs/utilities":82}],18:[function(require,module,exports){
const SchedulerComponent = require('./main');

module.exports = SchedulerComponent;
},{"./main":29}],19:[function(require,module,exports){
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
},{"../create-event-modal":12,"../event-details-modal":16,"../main/functions":27,"../main/templates":33,"./index.tpl":20,"./templates":21,"csp-app/libs/http":73}],20:[function(require,module,exports){
const modalTemplate = require('../main/modal.tpl');
const {createElementFromHTML} = require('csp-app/libs/utilities');
const {generateHoursMarks, generateStrips} = require('../main/grid');

const sidebarTpl = /*html*/`

`;

const schedulerTpl = /*html*/`
  <div class="cmp_ind-scheduler">
    <div class="scheduler-container">
      <div class="open-CEModal-wrapper">
        Click <button id="open-CEModal" class="btn-primary">here</button> to open create event window
      </div>
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
},{"../main/grid":28,"../main/modal.tpl":31,"csp-app/libs/utilities":82}],21:[function(require,module,exports){
const timestripTemplate = require('./timestrip.tpl');

module.exports = {
  timestripTemplate
};
},{"./timestrip.tpl":22}],22:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(data) {
  const html = /*html*/`
    <div class="timestrip">
      <div class="time">${ data.time }</div>
      <div class="line"></div>
    </div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element,
    time: element.querySelector('.time'),
    line: element.querySelector('.line')
  };
}

module.exports = template;
},{"csp-app/libs/utilities":82}],23:[function(require,module,exports){
function calcOffset(timeStart) {
  const thisDay_900 = new Date(timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(), this.sizes.startHour);
  const timeStartMinutes = new Date(
    timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(),
    timeStart.getHours(), timeStart.getMinutes()
  );
  const minutesDiff = (timeStartMinutes - thisDay_900)/(1000*60);
  return minutesDiff * this.sizes.minute + this.sizes.margin;
}

module.exports = calcOffset;
},{}],24:[function(require,module,exports){
function calcSizes(controllerName) {
  return function() {
    const controller = this[controllerName];

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
  }
}

module.exports = calcSizes;
},{}],25:[function(require,module,exports){
function calcWidth(timeStart, timeEnd) {
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
}

module.exports = calcWidth;
},{}],26:[function(require,module,exports){
const {eventTemplate} = require('../templates');

function getEventElement(event) {
  const eventTplController = eventTemplate({ id: event.id });
  const el = eventTplController.root;
  const timeFrom = event['time_from'] ? event['time_from'] : event.time.from;
  const timeTo = event['time_to'] ? event['time_to'] : event.time.to;
  const offset = this.calcOffset(timeFrom);
  const width = this.calcWidth(timeFrom, timeTo);
  el.style.left = offset + 'px';
  el.style.width = width + 'px';
  return el;
}

module.exports = getEventElement;
},{"../templates":33}],27:[function(require,module,exports){
const calcSizes = require('./calcSizes');
const calcOffset = require('./calcOffset');
const calcWidth = require('./calcWidth');
const getEventElement = require('./getEventElement');

module.exports = {
  calcSizes,
  calcOffset,
  calcWidth,
  getEventElement
};
},{"./calcOffset":23,"./calcSizes":24,"./calcWidth":25,"./getEventElement":26}],28:[function(require,module,exports){
const {range} = require('csp-app/libs/utilities');

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

module.exports = {
  generateHoursMarks,
  generateStrips
};
},{"csp-app/libs/utilities":82}],29:[function(require,module,exports){
const template = require('./index.tpl');
const ISModal = require('../individual-scheduler');
const SSModal = require('../shared-scheduler');

const SchedulerComponent = function() {
  const tplController = template();
  let ISModalInstance = null;
  let SSModalInstance = null;

  tplController.btnOpenIndSch.addEventListener('click', () => {
    if (!ISModalInstance) {
      ISModalInstance = ISModal.create({ destroyOnClose: true });
      ISModalInstance.root.addEventListener('close', () => {
        ISModalInstance = null;
      });
    }
    
    ISModalInstance.open();
  });

  tplController.btnOpenShSch.addEventListener('click', () => {
    if (!SSModalInstance) {
      SSModalInstance = SSModal.create({ destroyOnClose: true });
      SSModalInstance.elements.root.addEventListener('close', () => {
        SSModalInstance = null;
      });
    }
    
    SSModalInstance.open();
  });

  return {
    success: true,
    controller: {
      element: tplController.root
    }
  };
};

module.exports = SchedulerComponent;
},{"../individual-scheduler":19,"../shared-scheduler":39,"./index.tpl":30}],30:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template() {
  const html = /*html*/`
    <div class="cmp_scheduler-dboard">
      <button id="btn-open-indSch">Open individual scheduler<button>
      <button id="btn-open-shSch">Open shared scheduler</button>
    </div>
  `;
  const element = createElementFromHTML(html);
  const btnOpenIndSch = element.querySelector('#btn-open-indSch');
  const btnOpenShSch = element.querySelector('#btn-open-shSch');

  return {
    root: element,
    btnOpenIndSch: btnOpenIndSch,
    btnOpenShSch: btnOpenShSch
  };
}

module.exports = template;
},{"csp-app/libs/utilities":82}],31:[function(require,module,exports){
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
},{"csp-app/libs/utilities":82}],32:[function(require,module,exports){
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
},{"csp-app/libs/utilities":82}],33:[function(require,module,exports){
const participantPillTemplate = require('./participant-pill.tpl');
const eventTemplate = require('./event.tpl');
const timelineTitleTemplate = require('./timeline-title.tpl');
const timelineTemplate = require('./timeline.tpl');
const tooltipTemplate = require('./tooltip.tpl');

module.exports = {
  participantPillTemplate,
  eventTemplate,
  timelineTitleTemplate,
  timelineTemplate,
  tooltipTemplate
};
},{"./event.tpl":32,"./participant-pill.tpl":34,"./timeline-title.tpl":35,"./timeline.tpl":36,"./tooltip.tpl":37}],34:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(participant) {
  const html = /*html*/`
    <div class="participant btn-primary" data-id="${ participant['user_id'] }">
      <div class="user-info">
        ${ participant['username'] }
      </div>
      
      <div class="btn-close-wr">
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
},{"csp-app/libs/utilities":82}],35:[function(require,module,exports){
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
},{"csp-app/libs/utilities":82}],36:[function(require,module,exports){
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
},{"csp-app/libs/utilities":82}],37:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(event) {
  const timeFrom = event['time_from'] ? event['time_from'] : event.time.from;
  const timeTo = event['time_to'] ? event['time_to'] : event.time.to;
  const startsAtHH = timeFrom.getHours().toString().length == 1 ? '0' + timeFrom.getHours() : timeFrom.getHours();
  const startsAtMM = timeFrom.getMinutes().toString().length == 1 ? '0' + timeFrom.getMinutes() : timeFrom.getMinutes();
  const endsAtHH = timeTo.getHours().toString().length == 1 ? '0' + timeTo.getHours() : timeTo.getHours();
  const endsAtMM = timeTo.getMinutes().toString().length == 1 ? '0' + timeTo.getMinutes() : timeTo.getMinutes();
  const timePeriod = `${ startsAtHH }:${ startsAtMM }-${ endsAtHH }:${ endsAtMM }`;
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
      importanceHint = 'The event is desirable to attend';
      break;
    case 'important':
      importance = 'paper';
      importanceHint = 'The event is obligatory to attend';
      break;
    default:
      importance = 'peace';
      importanceHint = 'The event is not important';
      break;
  }

  if (event.description && event.description.length > 150) {
    description = event.description.slice(0, 146) + '...';
  }
  else if (!event.description || event.description.length == 0) {
    description = 'No description provided';
  }
  else {
    description = event.description;
  }

  const html = /*html*/`
    <div class="tooltip no-display">
      <div class="header">
        <div class="title"><h3>${ event.title }</h3></div>
        <div class="importance" title="${ importanceHint }"><i class="i i-hand-${ importance }"></i></div>
      </div>
      <div class="description">${ description }</div>
      <div class="footer">
        <div class="time">${ timePeriod }</div>
        <div class="items">
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
          
          <div class="item participants" title="Number of participants (including you)">
            <i class="i i-users"></i> 
            <span>${ event['participants_num'] }</span>
          </div>
        </div>
      </div>
    </div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element,
    details: element.querySelector('.details button')
  };
}

module.exports = template;
},{"csp-app/libs/utilities":82}],38:[function(require,module,exports){
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
          /*html*/`<div class="busy"><i class="i i-clock"></i><span>Busy</span></div>`
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

  const tplController = listTemplate();
  const submit = SPModalInstance.elements.submit;
  const isAllFriends = date && timeFrom && timeTo;
  let participants = [];
  let params;
  let apiURL = '';
  
  SPModalInstance.elements.body.appendChild(tplController.root);

  if (isAllFriends) {
    params = {
      date: date.toString(),
      timeFrom: timeFrom.toString(),
      timeTo: timeTo.toString()
    };
    apiURL = 'scheduler/getAllFriendsBasedOnAvailability';
  }
  else {
    apiURL = 'scheduler/getAllFriendsAndMe';
  }

  http.post(apiURL, params || {})
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
},{"csp-app/components/modals":7,"csp-app/libs/http":73,"csp-app/libs/utilities":82}],39:[function(require,module,exports){
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
},{"../event-details-modal":16,"../main/functions":27,"../main/templates":33,"../select-participants-modal":38,"./templates":42,"csp-app/libs/http":73,"csp-app/libs/utilities":82}],40:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');
const {generateHoursMarks, generateStrips} = require('../../main/grid');

const sidebarTpl = /*html*/`
  <div class="sidebar-ss">
    <div class="participants">
      <div class="header">
        <h2>Participants</h2>
        <button class="btn-open-sp">Select</button>
      </div>

      <div class="body clearfix"></div>
    </div>

    <div class="days clearfix">
      <div class="header"><span>Specify days</span></div>
      <div class="body">
        <div class="input-block">
          <label for="days-from">from</label>
          <input type="text" placeholder="mm/dd/yyyy" id="days-from" />
        </div>

        <div class="input-block">
          <label for="days-to">to</label>
          <input type="text" placeholder="mm/dd/yyyy" id="days-to" />
        </div>
      </div>
    </div>

    <div class="time">
      <div class="checkbox">
        <div class="input-block">
          <input type="checkbox" name="time-checked" id="time" />
          <label for="time">Select time span</label>
        </div>
      </div>

      <div class="time-span no-display">
        <div class="options">
          <div class="input-block">
            <input type="radio" name="time" value="floating" id="time-floating" checked="checked" />
            <label for="time-floating">Floating</label>
          </div>
        
          <div class="input-block">
            <input type="radio" name="time" value="fixed" id="time-fixed" />
            <label for="time-fixed">Fixed (duration)</label>
          </div>
        </div>

        <div class="inputs">
          <div class="floating">
            <div class="input-block">
              <label for="time-fl-from">from</label>
              <input type="text" placeholder="hh:mm" id="time-fl-from" />
            </div>

            <div class="input-block">
              <label for="time-fl-to">to</label>
              <input type="text" placeholder="hh:mm" id="time-fl-to" />
            </div>
          </div>

          <div class="fixed no-display">
            <label for="time-fi">time</label>
            <input type="text" placeholder="hh:mm" id="time-fi" />
          </div>
        </div>
      </div>
    </div>

    <div class="submit-wrapper">
      <button class="btn-primary">Search</button>
    </div>

    <div class="results no-display">
      <div class="header"><h2>Results</h2></div>
      <div class="body"></div>
    </div>
  </div>
`;

const mainTpl = /*html*/`
  <div class="ss-main-wrapper">
    <div class="initial"><p>Specify parameters for search in the sidebar</p></div>
    <div class="loading no-display"><p>Loading. Please wait...</p></div>
    <div class="scheduler-container no-display">
      <div class="panel">
        <div class="panel-date"></div>
        <div class="open-CEModal-wrapper">
          Click <button id="open-CEModal" class="btn-primary">here</button> to open create event window
        </div>
      </div>
      <div class="scheduler">
        <div class="left">
          <div class="participants"></div>
        </div>
        
        <div class="right">
          <div class="strips"></div>
          <div class="timeline-h"></div>
          <div class="timeline-b"></div>
          <div class="common-fis"></div>
        </div>
      </div>
    </div>
  </div>
`;

function template() {
  const sidebarTplController = createElementFromHTML(sidebarTpl);
  const mainTplController = createElementFromHTML(mainTpl);

  const timelineHeader = mainTplController.querySelector('.scheduler .timeline-h');
  const timelineBody = mainTplController.querySelector('.scheduler .timeline-b');
  const strips = mainTplController.querySelector('.scheduler .strips');

  let controller = {
    sidebar: {
      root: sidebarTplController,
      participants: {
        root: sidebarTplController.querySelector('.participants'),
        button: sidebarTplController.querySelector('.btn-open-sp'),
        body: sidebarTplController.querySelector('.participants .body')
      },
      days: {
        root: sidebarTplController.querySelector('.days'),
        from: sidebarTplController.querySelector('#days-from'),
        to: sidebarTplController.querySelector('#days-to')
      },
      time: {
        root: sidebarTplController.querySelector('.time'),
        isTimeChecked: sidebarTplController.querySelector('.time #time'),
        timeSpan: sidebarTplController.querySelector('.time .time-span'),
        options: {
          floating: sidebarTplController.querySelector('#time-floating'),
          fixed: sidebarTplController.querySelector('#time-fixed')
        },
        inputs: {
          floating: {
            root: sidebarTplController.querySelector('.time .inputs .floating'),
            from: sidebarTplController.querySelector('#time-fl-from'),
            to: sidebarTplController.querySelector('#time-fl-to')
          },
          fixed: {
            root: sidebarTplController.querySelector('.time .inputs .fixed'),
            value: sidebarTplController.querySelector('#time-fi')
          }
        }
      },
      searchBtn: sidebarTplController.querySelector('.submit-wrapper button'),
      results: {
        root: sidebarTplController.querySelector('.results'),
        body: sidebarTplController.querySelector('.results .body')
      }
    },
    main: {
      root: mainTplController,
      initial: mainTplController.querySelector('.initial'),
      loading: mainTplController.querySelector('.loading'),
      schedulerContainer: mainTplController.querySelector('.scheduler-container'),
      scheduler: {
        root: mainTplController.querySelector('.scheduler'),
        left: mainTplController.querySelector('.scheduler .left'),
        right: mainTplController.querySelector('.scheduler .right'),
        participants: mainTplController.querySelector('.scheduler .participants'),
        commonFIs: mainTplController.querySelector('.scheduler .common-fis'),
        date: mainTplController.querySelector('.scheduler-container .panel .panel-date'),
        timelineHeader,
        timeline: timelineBody,
        strips,
        generateHoursMarks: generateHoursMarks(timelineHeader),
        generateStrips: generateStrips(strips)
      }
    }
  };

  controller.scheduler = controller.main.scheduler;

  return controller;
}

module.exports = template;
},{"../../main/grid":28,"csp-app/libs/utilities":82}],41:[function(require,module,exports){
const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(data) {
  const fromHHStr = data.from.getHours().toString();
  const fromMMStr = data.from.getMinutes().toString();
  const fromHH = fromHHStr.length == 1 ? '0' + fromHHStr : fromHHStr;
  const fromMM = fromMMStr.length == 1 ? '0' + fromMMStr : fromMMStr;

  const toHHStr = data.to.getHours().toString();
  const toMMStr = data.to.getMinutes().toString();
  const toHH = toHHStr.length == 1 ? '0' + toHHStr : toHHStr;
  const toMM = toMMStr.length == 1 ? '0' + toMMStr : toMMStr;

  const from = `${fromHH}:${fromMM}`;
  const to = `${toHH}:${toMM}`;
  const hint = `Free in ${from}-${to}`;

  const html = /*html*/`
    <div class="common-fi" title="${hint}"></div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element
  };
}

module.exports = template;
},{"csp-app/libs/utilities":82}],42:[function(require,module,exports){
const modalTemplate = require('../../main/modal.tpl');
const baseTemplate = require('./base');
const resultsButtonTemplate = require('./results-button');
const commonFITemplate = require('./common-free-interval');

function schedulerTemplate() {
  const modalTplController = modalTemplate();
  const baseTplController = baseTemplate();

  modalTplController.sidebar.appendChild(baseTplController.sidebar.root);
  modalTplController.content.appendChild(baseTplController.main.root);
  
  return {
    root: modalTplController.root,
    closeBtn: modalTplController.closeBtn,
    ...baseTplController
  };
}

module.exports = {
  schedulerTemplate,
  resultsButtonTemplate,
  commonFITemplate
};
},{"../../main/modal.tpl":31,"./base":40,"./common-free-interval":41,"./results-button":43}],43:[function(require,module,exports){
const {createElementFromHTML, getMonthName} = require('csp-app/libs/utilities');

function template(options) {
  const className = options.hasFreeIntevals ? 'btn-primary' : '';
  const monthName = getMonthName(options.date.getMonth());
  const title = `${monthName}, ${options.date.getDate()}`;
  const html = /*html*/`
    <button class="results-btn ${className}" data-day-id="${options.id}">${title}</button>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element
  };
}

module.exports = template;
},{"csp-app/libs/utilities":82}],44:[function(require,module,exports){
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
},{"csp-app/libs/forms":71,"csp-app/libs/forms/validators":72}],45:[function(require,module,exports){
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
},{"csp-app/libs/forms":71,"csp-app/libs/forms/validators":72,"csp-app/libs/http":73}],46:[function(require,module,exports){
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
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/libs/forms":71,"csp-app/libs/forms/validators":72,"csp-app/libs/http":73}],47:[function(require,module,exports){
const loginForm = require('./LoginForm');
const clientForm = require('./ClientForm');
const execForm = require('./ExecForm');

module.exports = {
  loginForm,
  clientForm,
  execForm
};
},{"./ClientForm":44,"./ExecForm":45,"./LoginForm":46}],48:[function(require,module,exports){
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
},{"./start.tpl":49,"./tabs":50,"csp-app/libs/utilities":82}],49:[function(require,module,exports){
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
},{}],50:[function(require,module,exports){
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
},{"../forms/LoginForm":46,"./signupTabs":51,"csp-app/libs/misc/button-effects/radialGradientOnHover":74,"csp-app/libs/tabs":81,"csp-app/libs/utilities":82}],51:[function(require,module,exports){
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

// const signupTabs = new Tabs({
//   header: {
//     className: 'actions clearfix',
//     items: [
//       {title: 'Sign up as client', tag: 'button'},
//       {title: 'Sign up as executor', tag: 'button'},
//       {title: 'As academic', tag: 'button'},
//       {title: 'As student', tag: 'button'}
//     ]
//   },
//   content: {
//     items: [
//       clientFormBlock,
//       execFormBlock,
//       academicFormBlock,
//       studentFormBlock
//     ]
//   },
//   animation: {
//     name: 'tabsFlowAnimation',
//     params: {padding: 15, speed: 850}
//   }
// });

const signupTabs = new Tabs({
  header: {
    className: 'actions clearfix',
    items: [
      {title: 'Sign up as client', tag: 'button'},
      {title: 'Sign up as executor', tag: 'button'}
    ]
  },
  content: {
    items: [
      clientFormBlock,
      execFormBlock
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
},{"../forms":47,"csp-app/libs/misc/button-effects/radialGradientOnHover":74,"csp-app/libs/tabs":81,"csp-app/libs/utilities":82}],52:[function(require,module,exports){
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
},{}],53:[function(require,module,exports){
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
},{"./tabs":65,"csp-app/libs/tabs":81,"csp-app/libs/utilities":82}],54:[function(require,module,exports){
const UserPageComponent = require('./user');

module.exports = {
  UserPageComponent
};
},{"./user":55}],55:[function(require,module,exports){
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
},{"./templates":57,"csp-app/libs/http":73,"csp-app/libs/utilities":82}],56:[function(require,module,exports){
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
},{"csp-app/libs/utilities":82}],57:[function(require,module,exports){
const mainTemplate = require('./tpl');
const blockMoreTemplate = require('./block-more.tpl');

module.exports = {
  mainTemplate,
  blockMoreTemplate
};
},{"./block-more.tpl":56,"./tpl":58}],58:[function(require,module,exports){
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
},{"csp-app/libs/utilities":82}],59:[function(require,module,exports){
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
},{"../common/createUsersList":61,"../common/tab.tpl":62,"csp-app/libs/http":73}],60:[function(require,module,exports){
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
},{"../common/createUsersList":61,"../common/tab.tpl":62,"csp-app/libs/http":73}],61:[function(require,module,exports){
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
},{"./userItem.tpl":63,"csp-app/libs/utilities":82}],62:[function(require,module,exports){
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
},{"csp-app/libs/utilities":82}],63:[function(require,module,exports){
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
},{"csp-app/libs/utilities":82}],64:[function(require,module,exports){
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
},{"../common/createUsersList":61,"../common/tab.tpl":62,"csp-app/libs/http":73}],65:[function(require,module,exports){
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
},{"./all-friends":59,"./all-users":60,"./incoming-requests":64,"./outgoing-requests":66}],66:[function(require,module,exports){
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
},{"../common/createUsersList":61,"../common/tab.tpl":62,"csp-app/libs/http":73}],67:[function(require,module,exports){
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
        // message = 'Your account has been successfully verified. You will be redirected to the dashboard in 3 seconds';
        message = 'Your account has been successfully verified';
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
    success: true,
    controller: {
      element: tplController.element
    }
  };
};


module.exports = VerificationComponent;
},{"./tpl":68,"csp-app/libs/http":73}],68:[function(require,module,exports){
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
},{"csp-app/libs/utilities":82}],69:[function(require,module,exports){
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
  errorsWrapper.className = 'errors no-display';
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
},{"./FormControl":70}],70:[function(require,module,exports){
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

  const errorsBool = Object.keys(items).map(item => !!items[item]);
  const errorsNum = errorsBool.filter(e => e).length;
  
  if (errorsNum > 0) {
    control.errors.ref.classList.remove('no-display');
  }
  else {
    control.errors.ref.classList.add('no-display');
  }
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
  errorsRef.classList.add('no-display');

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
},{}],71:[function(require,module,exports){
const Form = require('./Form');

module.exports = Form;
},{"./Form":69}],72:[function(require,module,exports){
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
},{}],73:[function(require,module,exports){
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
},{}],74:[function(require,module,exports){
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
},{"csp-app/libs/utilities":82}],75:[function(require,module,exports){
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
  history.pushState('', '', '/' + window.location.search);
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
},{}],76:[function(require,module,exports){
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
},{}],77:[function(require,module,exports){
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
},{}],78:[function(require,module,exports){
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
},{}],79:[function(require,module,exports){
const defaultAnim = require('./default');
const loginSignupSwitch = require('./loginSignupSwitch');
const tabsFlowAnimation = require('./flow');

module.exports = {
  defaultAnim,
  loginSignupSwitch,
  tabsFlowAnimation
};
},{"./default":77,"./flow":78,"./loginSignupSwitch":80}],80:[function(require,module,exports){
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
},{}],81:[function(require,module,exports){
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
},{"./HeaderItem":76,"./animations":79}],82:[function(require,module,exports){
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

function getMonthName(monthNum) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthNum];
}

function getCoords(elem) {
  var box = elem.getBoundingClientRect();

  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };
}

module.exports = {
  createElementFromHTML,
  Singleton,
  range,
  sortNumbers,
  getMonthName,
  getCoords
};
},{}],83:[function(require,module,exports){
const Root = require('csp-app/components/main/rootComponent');
const Dashboard = require('csp-app/components/dashboard');
const MainController = require('csp-app/components/main');
const {router} = MainController;
const http = require('csp-app/libs/http');

const Router = require('csp-app/libs/router');
const Start = require('csp-app/components/start');
const Test = require('csp-app/components/test')

http.configure({ location: 'http://localhost:3000' });

const verificationRoute = require('csp-app/routes/auth/verification');
const rootHandler = require('csp-app/routes/root');
const {schedulerHandler, usersHandler, userHandler} = require('csp-app/routes/dashboard');

document.addEventListener('click', evt => {
  const link = evt.target.closest('a');

  if (link && link.dataset && link.dataset.route) {
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
    .addRoute('/', rootHandler)
    .addRoute('signup/verify', verificationRoute)
    .addRoute('scheduler', schedulerHandler)
    .addRoute('users', usersHandler)
    .addRoute('users/(:id)', userHandler)
  ;

  router.navigate(path)
});
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/components/main/rootComponent":6,"csp-app/components/start":48,"csp-app/components/test":52,"csp-app/libs/http":73,"csp-app/libs/router":75,"csp-app/routes/auth/verification":84,"csp-app/routes/dashboard":85,"csp-app/routes/root":89}],84:[function(require,module,exports){
const {render} = require('csp-app/components/main');
const VerificationComponent = require('csp-app/groups/auth/verification');

function verification() {
  render([ VerificationComponent ]);
}

module.exports = verification;
},{"csp-app/components/main":5,"csp-app/groups/auth/verification":67}],85:[function(require,module,exports){
const schedulerHandler = require('./scheduler'); 
const usersHandler = require('./users');
const userHandler = require('./user');

module.exports = {
  schedulerHandler,
  usersHandler,
  userHandler
};
},{"./scheduler":86,"./user":87,"./users":88}],86:[function(require,module,exports){
const {render} = require('csp-app/components/main');
const Dashboard = require('csp-app/components/dashboard');
const SchedulerComponent = require('csp-app/components/scheduler');

const SchedulerHandler = function() {
  render([Dashboard, SchedulerComponent]);
};

module.exports = SchedulerHandler;
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/components/scheduler":18}],87:[function(require,module,exports){
const {render} = require('csp-app/components/main');
const Dashboard = require('csp-app/components/dashboard');
const {UserPageComponent} = require('csp-app/components/users/standalones');

const UserHandler = function(none, params) {
  render([Dashboard, UserPageComponent(params.id)]);
};

module.exports = UserHandler;
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/components/users/standalones":54}],88:[function(require,module,exports){
const {render} = require('csp-app/components/main');
const Dashboard = require('csp-app/components/dashboard');
const UsersComponent = require('csp-app/components/users');

const UsersHandler = function() {
  render([Dashboard, UsersComponent]);
};

module.exports = UsersHandler;
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/components/users":53}],89:[function(require,module,exports){
const http = require('csp-app/libs/http');
const {render} = require('csp-app/components/main');
const Start = require('csp-app/components/start');
const Dashboard = require('csp-app/components/dashboard');

const checkAuth = token => {
  return http
    .post('auth/authenticate', {token: token})
  ;
};

const rootHandler = async () => {
  const token = window.localStorage.getItem('auth_token') || null;
  const isAuthenticated = token ? (await checkAuth(token)).success : false;

  if (isAuthenticated) {
    render([ Dashboard ]);
  }
  else {
    render([ Start ]);
  }
};

module.exports = rootHandler;
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/components/start":48,"csp-app/libs/http":73}]},{},[83]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzb3VyY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IHRlbXBsYXRlID0gcmVxdWlyZSgnLi90cGwnKTtcbmNvbnN0IHtyb3V0ZXJ9ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL21haW4nKTtcblxuY29uc3QgRGFzaGJvYXJkID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBodHRwLmdldCgnL3VzZXJzL2dldFVzZXJEYXRhJylcbiAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICBjb25zdCBpZCA9IHJlcy5kYXRhLnVzZXIuaWQ7XG4gICAgICBjb25zb2xlLmxvZyhyZXMuZGF0YSlcblxuICAgICAgaWYgKCFyZXMuc3VjY2VzcykgdGhyb3cgbmV3IEVycm9yKHJlcy5lcnJvcik7XG5cbiAgICAgIGNvbnN0IHRlbXBsYXRlRGF0YSA9IHtcbiAgICAgICAgdXNlcjogcmVzLmRhdGEudXNlclxuICAgICAgfTtcblxuICAgICAgdGVtcGxhdGVEYXRhLnVzZXJbJ2F2YXRhcl91cmwnXSA9XG4gICAgICAgIHRlbXBsYXRlRGF0YS51c2VyWydhdmF0YXJfdXJsJ10gP1xuICAgICAgICB0ZW1wbGF0ZURhdGEudXNlclsnYXZhdGFyX3VybCddIDpcbiAgICAgICAgJ2ZpbGVzL2F2YXRhcnMvbm8tYXZhdGFyLnBuZyc7XG5cbiAgICAgIGNvbnN0IHRwbENvbnRyb2xsZXIgPSB0ZW1wbGF0ZSh0ZW1wbGF0ZURhdGEpO1xuICAgICAgdHBsQ29udHJvbGxlci51c2VyUGFuZWwuYWN0aW9ucy5sb2dPdXRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnYXV0aF90b2tlbicpO1xuICAgICAgICByb3V0ZXIubmF2aWdhdGUoJy8nKTtcbiAgICAgIH0pO1xuICAgICAgdHBsQ29udHJvbGxlci51c2VyUGFuZWwuaGVsbG8ucm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgdHBsQ29udHJvbGxlci51c2VyUGFuZWwuYWN0aW9ucy5yb290LmNsYXNzTGlzdC50b2dnbGUoJ25vLWRpc3BsYXknKTtcbiAgICAgIH0pO1xuICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2dCA9PiB7XG4gICAgICAgIGNvbnN0IGlzSGVsbG9CdG4gPSBldnQudGFyZ2V0LmNsb3Nlc3QoJy5oZWxsbycpID09PSB0cGxDb250cm9sbGVyLnVzZXJQYW5lbC5oZWxsby5yb290O1xuICAgICAgICBjb25zdCBpc0FjdGlvbnNCbG9jayA9IGV2dC50YXJnZXQuY2xvc2VzdCgnLmFjdGlvbnMnKSA9PT0gdHBsQ29udHJvbGxlci51c2VyUGFuZWwuYWN0aW9ucy5yb290O1xuXG4gICAgICAgIGlmICghaXNIZWxsb0J0biAmJiAhaXNBY3Rpb25zQmxvY2spIHtcbiAgICAgICAgICB0cGxDb250cm9sbGVyLnVzZXJQYW5lbC5hY3Rpb25zLnJvb3QuY2xhc3NMaXN0LmFkZCgnbm8tZGlzcGxheScpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY29uc3Qgcm91dGVyT3V0bGVyID0gdHBsQ29udHJvbGxlci5yb290LnF1ZXJ5U2VsZWN0b3IoJy5yb3V0ZXItb3V0bGV0Jyk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXI6IHtcbiAgICAgICAgICBlbGVtZW50OiB0cGxDb250cm9sbGVyLnJvb3RcbiAgICAgICAgfSxcbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgcm91dGVyT3V0bGVyLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgIHJvdXRlck91dGxlci5hcHBlbmQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhc2hib2FyZDtcbn0se1wiLi90cGxcIjo0LFwiY3NwLWFwcC9jb21wb25lbnRzL21haW5cIjo1LFwiY3NwLWFwcC9saWJzL2h0dHBcIjo3M31dLDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuXG59LHt9XSwzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbm1vZHVsZS5leHBvcnRzID0gLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJtZW51XCI+XG4gICAgPHVsPlxuICAgICAgPGxpPjxhIGRhdGEtcm91dGU9XCJcIj48aSBjbGFzcz1cImkgaS1wcm9qZWN0XCI+PC9pPjxzcGFuPlByb2plY3RzPC9zcGFuPjwvYT48L2xpPlxuICAgICAgPGxpPjxhIGRhdGEtcm91dGU9XCJzY2hlZHVsZXJcIj48aSBjbGFzcz1cImkgaS1jYWxlbmRhclwiPjwvaT48c3Bhbj5TY2hlZHVsZXI8L3NwYW4+PC9hPjwvbGk+XG4gICAgICA8bGk+PGEgZGF0YS1yb3V0ZT1cImJyYWluc3Rvcm1cIj48aSBjbGFzcz1cImkgaS1idWxiXCI+PC9pPjxzcGFuPkJyYWluc3Rvcm08L3NwYW4+PC9hPjwvbGk+XG4gICAgICA8bGk+PGEgZGF0YS1yb3V0ZT1cInVzZXJzXCI+PGkgY2xhc3M9XCJpIGktdXNlcnNcIj48L2k+PHNwYW4+VXNlcnM8L3NwYW4+PC9hPjwvbGk+XG4gICAgPC91bD5cbiAgPC9kaXY+XG5gO1xufSx7fV0sNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBzaWRlYmFyRXhlYyA9IHJlcXVpcmUoJy4vdGVtcGxhdGVzL3NpZGViYXJfZXhlYy50cGwnKTtcbmNvbnN0IHNpZGViYXJDbGllbnQgPSByZXF1aXJlKCcuL3RlbXBsYXRlcy9zaWRlYmFyX2NsaWVudC50cGwnKTtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRhdGEgPT4ge1xuICBjb25zdCBncm91cCA9IGRhdGEudXNlci5ncm91cDtcbiAgbGV0IGdyb3VwcyA9IFsnYWNhZGVtaWMnLCAnc3R1ZGVudCcsICdleHRfZXhlYycsIG51bGwsIHVuZGVmaW5lZF07XG4gIGxldCBzaWRlYmFyO1xuXG4gIGlmIChncm91cHMuaW5jbHVkZXMoZ3JvdXApKSB7XG4gICAgc2lkZWJhciA9IHNpZGViYXJFeGVjO1xuICB9XG5cbiAgaWYgKGdyb3VwID09ICdjbGllbnQnKSB7XG4gICAgc2lkZWJhciA9IHNpZGViYXJDbGllbnQ7XG4gIH1cblxuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cImNtcF9kYXNoYm9hcmRcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzaWRlYmFyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJsb2dvLWJsb2NrXCI+XG4gICAgICAgICAgPGEgY2xhc3M9XCJsb2dvXCIgZGF0YS1yb3V0ZT1cIi9cIj57IENTUCB9PC9hPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICAkeyBzaWRlYmFyIH1cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIm1haW5cIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImRib2FyZC1oZWFkZXJcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1wYW5lbFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImhlbGxvXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhdmF0YXItd3JhcHBlclwiPlxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHsgZGF0YS51c2VyWydhdmF0YXJfdXJsJ10gfVwiIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1c2VybmFtZS13cmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4+JHsgZGF0YS51c2VyLnVzZXJuYW1lIH08L3NwYW4+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb3JlLXdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICA8aSBjbGFzcz1cImkgaS1zb3J0XCI+PC9pPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWN0aW9ucyBibG9jay1zaGFkb3dlZCBuby1kaXNwbGF5XCI+XG4gICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+PGEgY2xhc3M9XCJwcm9maWxlXCIgZGF0YS1yb3V0ZT1cIm15LXByb2ZpbGVcIj5NeSBwcm9maWxlPC9hPjwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPjxidXR0b24gY2xhc3M9XCJsb2ctb3V0XCI+TG9nIG91dDwvYnV0dG9uPjwvbGk+XG4gICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb250ZW50XCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJvdXRlci1vdXRsZXRcIj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbiAgY29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcblxuICByZXR1cm4ge1xuICAgIHJvb3Q6IGVsZW1lbnQsXG4gICAgcm91dGVyT3V0bGV0OiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yb3V0ZXItb3V0bGV0JyksXG4gICAgdXNlclBhbmVsOiB7XG4gICAgICBoZWxsbzoge1xuICAgICAgICByb290OiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy51c2VyLXBhbmVsIC5oZWxsbycpXG4gICAgICB9LFxuICAgICAgYWN0aW9uczoge1xuICAgICAgICByb290OiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy51c2VyLXBhbmVsIC5hY3Rpb25zJyksXG4gICAgICAgIG15UHJvZmlsZUJ0bjogZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcudXNlci1wYW5lbCAuYWN0aW9ucyAucHJvZmlsZScpLFxuICAgICAgICBsb2dPdXRCdG46IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnVzZXItcGFuZWwgLmFjdGlvbnMgLmxvZy1vdXQnKVxuICAgICAgfVxuICAgIH1cbiAgfTtcbn07XG59LHtcIi4vdGVtcGxhdGVzL3NpZGViYXJfY2xpZW50LnRwbFwiOjIsXCIuL3RlbXBsYXRlcy9zaWRlYmFyX2V4ZWMudHBsXCI6MyxcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo4Mn1dLDU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgUm91dGVyID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3JvdXRlcicpXG5cbmNvbnN0IGFwcCA9IHNlbGYgPSB7XG4gIHJvb3Q6IG51bGwsXG4gIHJvdXRlcjogbmV3IFJvdXRlcigpLFxuICBwYXRoOiBbXSxcbiAgcmVuZGVyQ2hhaW46IGZ1bmN0aW9uKGNvbXBvbmVudHMpIHtcbiAgICAvLyBQcm9taXNlIGlzIHJldHVybmVkXG4gICAgcmV0dXJuIGNvbXBvbmVudHMucmVkdWNlKChhY2N1bXVsYXRvciwgY29tcG9uZW50KSA9PiB7XG4gICAgICAvLyBBY2N1bXVsYXRvciBtYXkgbm90IG9ubHkgYmUgYSBQcm9taXNlIGJ1dCBpdCBjYW5cbiAgICAgIC8vIGFsc28gYmUgYSBwbGFpbiBqcyBvYmplY3QgKGFzIGlzIHdpdGggc2VsZi5yb290KVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhY2N1bXVsYXRvcilcbiAgICAgICAgLy8gQmVmb3JlIHdlIG1ha2Ugc3VyZSB0aGUgcHJldmlvdXMgY29tcG9uZW50IChpdCBpcyBub3cgYWNjdW11bGF0b3IpXG4gICAgICAgIC8vIGhhcyByZXNvbHZlZCwgd2UgZG8gbm90IGNyZWF0ZSB0aGUgY29tcG9uZW50IHRoYXQgZm9sbG93c1xuICAgICAgICAudGhlbihhY2N1bXVsYXRvciA9PiBQcm9taXNlLmFsbChbYWNjdW11bGF0b3IsIG5ldyBjb21wb25lbnQoKV0pKVxuICAgICAgICAudGhlbigoW2FjY3VtdWxhdG9yLCBjb21wb25lbnRdKSA9PiB7XG4gICAgICAgICAgaWYgKCFjb21wb25lbnQuc3VjY2VzcylcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh7Y29tcG9uZW50OiBjb21wb25lbnQuZXJyb3IsIGFjY3VtdWxhdG9yOiBhY2N1bXVsYXRvcn0pO1xuXG4gICAgICAgICAgYWNjdW11bGF0b3IucmVuZGVyKGNvbXBvbmVudC5jb250cm9sbGVyLmVsZW1lbnQpO1xuICAgICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgICAgIH0pXG4gICAgICA7XG4gICAgfSwgc2VsZi5yb290KVxuICAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcbiAgfSxcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ocm9vdEluc3RhbmNlKSB7XG4gICAgc2VsZi5yb290ID0gcm9vdEluc3RhbmNlO1xuICAgIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gJyc7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChyb290SW5zdGFuY2UucmVmZXJlbmNlKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbihjb21wb25lbnRzKSB7XG4gICAgcmV0dXJuIHNlbGYucmVuZGVyQ2hhaW4oY29tcG9uZW50cyk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXBwO1xufSx7XCJjc3AtYXBwL2xpYnMvcm91dGVyXCI6NzV9XSw2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IFJvb3QgPSB7XG4gICAgY29tcG9uZW50TmFtZTogJ2FwcCcsXG4gICAgaHRtbDogYDxkaXYgaWQ9XCJhcHBcIj48L2Rpdj5gLFxuICAgIGlkZW50aWZpZXI6ICcjYXBwJyxcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBDb25zaWRlciByZWltcGxlbWVudGluZyB3aXRoIEhUTUw1IHRlbXBsYXRlIGZlYXR1cmUgaW5zdGVhZCBqdXN0IHV0aWxpemluZyBkaXZcbiAgICAgICAgY29uc3QgdG1wRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0bXBFbGVtLmlubmVySFRNTCA9IHRoaXMuaHRtbDtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRtcEVsZW0uZmlyc3RDaGlsZDtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVmZXJlbmNlOiBlbGVtZW50LFxuICAgICAgICAgICAgcm91dGVyT3V0bGV0OiBlbGVtZW50LFxuICAgICAgICAgICAgY29tcG9uZW50TmFtZTogdGhpcy5jb21wb25lbnROYW1lLFxuICAgICAgICAgICAgc3RhdGU6IHt9LFxuICAgICAgICAgICAgYWN0aW9uczogKGZ1bmN0aW9uKHJvdXRlck91dGxldCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWQ6IGZ1bmN0aW9uKGZyYWdtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKGVsZW1lbnQpLFxuICAgICAgICAgICAgcmVuZGVyOiAoZnVuY3Rpb24ocm91dGVyT3V0bGV0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKERPTVRyZWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcm91dGVyT3V0bGV0LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuYXBwZW5kQ2hpbGQoRE9NVHJlZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoZWxlbWVudClcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUm9vdDtcbn0se31dLDc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgbW9kYWxTdGFuZGFyZCA9IHJlcXVpcmUoJy4vbW9kYWwtc3RhbmRhcmQnKTtcblxuZnVuY3Rpb24gTW9kYWwoKSB7XG4gIFxufVxuXG5Nb2RhbC5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBsZXQgbW9kYWxDbGFzcztcbiAgc3dpdGNoIChvcHRpb25zLnR5cGUpIHtcbiAgICBjYXNlICdzdGFuZGFyZCc6XG4gICAgICBtb2RhbENsYXNzID0gbW9kYWxTdGFuZGFyZDtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBtb2RhbENsYXNzID0gbW9kYWxTdGFuZGFyZDtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiBuZXcgbW9kYWxDbGFzcyhvcHRpb25zKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZGFsKCk7XG59LHtcIi4vbW9kYWwtc3RhbmRhcmRcIjo5fV0sODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBjYW5jZWwgPSB7XG4gIGlkOiAnY2FuY2VsJyxcbiAgdHlwZTogJ3NlY29uZGFyeScsXG4gIG9yZGVyOiAwLFxuICB0aXRsZTogJ0NhbmNlbCdcbn07XG5cbmNvbnN0IHN1Ym1pdCA9IHtcbiAgaWQ6ICdzdWJtaXQnLFxuICB0eXBlOiAncHJpbWFyeScsXG4gIG9yZGVyOiAxLFxuICB0aXRsZTogJ09LJ1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNhbmNlbCxcbiAgc3VibWl0XG59O1xufSx7fV0sOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdHBsJyk7XG5jb25zdCB7Y2FuY2VsLCBzdWJtaXR9ID0gcmVxdWlyZSgnLi9hY3Rpb25zJyk7IFxuY29uc3Qge3NvcnROdW1iZXJzfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcbmNvbnN0IE1vZGFsc0NvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9tb2RhbHMtY29udHJvbGxlcicpO1xuXG4vKipcbiAqIFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy50aXRsZSAtIHRoZSB0aXRsZSBvZiB0aGUgbW9kYWxcbiAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLndpZHRoIC0gdGhlIHdpZHRoIG9mIHRoZSBtb2RhbFxuICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMuaGVpZ2h0IC0gdGhlIGhlaWdodCBvZiB0aGUgbW9kYWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5kZWZhdWx0QWN0aW9ucyAtIGluZGljYXRlcyBpZiBhY3Rpb25zIGF0IHRoZSBib3R0b20gb2YgdGhlIG1vZGFsIGFyZSBkZWZhdWx0LiBJZiBmYWxzZSwgdGhlbiBuZWVkZWQgcGFyYW1zIGFyZSBzcGVjaWZpZWQgaW4gJ2FjdGlvbnMnXG4gKiBAcGFyYW0ge0FycmF5Ljx7aWQ6IFN0cmluZywgdGl0bGU6IFN0cmluZywgdHlwZTogU3RyaW5nLCBvcmRlcjogTnVtYmVyfT59IG9wdGlvbnMuYWN0aW9ucyAtIGlmIG5vbi1kZWZhdWx0IGFjdGlvbnNcbiAqL1xuXG5mdW5jdGlvbiBNb2RhbChvcHRpb25zKSB7XG4gIGNvbnN0IHRwbENvbnRyb2xsZXIgPSB0ZW1wbGF0ZSgpO1xuXG4gIHRwbENvbnRyb2xsZXIucm9vdC5jbGFzc0xpc3QuYWRkKCduby1kaXNwbGF5Jyk7XG4gIHRwbENvbnRyb2xsZXIudGl0bGUudGV4dENvbnRlbnQgPSBvcHRpb25zLnRpdGxlIHx8ICcnO1xuICB0cGxDb250cm9sbGVyLmJvZHkuc3R5bGUud2lkdGggPSAob3B0aW9ucy53aWR0aCB8fCAnMzAwJykgKyAncHgnO1xuICB0cGxDb250cm9sbGVyLmJvZHkuc3R5bGUuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgPyBvcHRpb25zLmhlaWdodCArICdweCcgOiAnYXV0byc7XG5cbiAgdHBsQ29udHJvbGxlci5jbG9zZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICB0aGlzLmNsb3NlKCk7XG4gIH0pO1xuXG4gIGxldCBhY3Rpb25zUGFyYW1zID1cbiAgICBvcHRpb25zLmRlZmF1bHRBY3Rpb25zID9cbiAgICBbY2FuY2VsLCBzdWJtaXRdIDpcbiAgICBvcHRpb25zLmFjdGlvbnM7XG5cbiAgY29uc3QgYWN0aW9ucyA9IGFjdGlvbnNQYXJhbXMuc29ydChzb3J0TnVtYmVycylcbiAgICAubWFwKGl0ZW0gPT4ge1xuICAgICAgY29uc3QgYWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICBhY3Rpb24udGV4dENvbnRlbnQgPSBpdGVtLnRpdGxlO1xuICAgICAgYWN0aW9uLmNsYXNzTGlzdC5hZGQoJ2J0bi0nICsgaXRlbS50eXBlKTtcbiAgICAgIHJldHVybiB7IGlkOiBpdGVtLmlkLCBlbGVtZW50OiBhY3Rpb24gfTtcbiAgICB9KTtcbiAgXG4gIGxldCBhY3Rpb25zT2JqID0ge307XG5cbiAgYWN0aW9ucy5mb3JFYWNoKGFjdGlvbiA9PiB7XG4gICAgdHBsQ29udHJvbGxlci5mb290ZXIuYXBwZW5kQ2hpbGQoYWN0aW9uLmVsZW1lbnQpO1xuICAgIGFjdGlvbnNPYmpbYWN0aW9uLmlkXSA9IGFjdGlvbi5lbGVtZW50O1xuICB9KTtcblxuICBpZiAoYWN0aW9uc09ialsnY2FuY2VsJ10pIHtcbiAgICBhY3Rpb25zT2JqWydjYW5jZWwnXS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuZWxlbWVudHMgPSB7XG4gICAgLi4udHBsQ29udHJvbGxlcixcbiAgICAuLi5hY3Rpb25zT2JqXG4gIH07XG4gIHRoaXMuZGVzdHJveU9uQ2xvc2UgPSBvcHRpb25zLmRlc3Ryb3lPbkNsb3NlO1xuXG4gIE1vZGFsc0NvbnRyb2xsZXIuYWRkKHRoaXMpO1xufVxuXG5Nb2RhbC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKCkge1xuICBNb2RhbHNDb250cm9sbGVyLm9wZW4odGhpcyk7XG59O1xuXG5Nb2RhbC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgY2xvc2VFdmVudCA9IG5ldyBDdXN0b21FdmVudCgnY2xvc2UnKTtcbiAgdGhpcy5lbGVtZW50cy5yb290LmRpc3BhdGNoRXZlbnQoY2xvc2VFdmVudCk7XG4gIFxuICBNb2RhbHNDb250cm9sbGVyLmNsb3NlTGFzdCgpO1xuXG4gIGlmICh0aGlzLmRlc3Ryb3lPbkNsb3NlKSB7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH1cbn07XG5cbk1vZGFsLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZWxlbWVudHMucm9vdC5yZW1vdmUoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kYWw7XG59LHtcIi4uL21vZGFscy1jb250cm9sbGVyXCI6MTEsXCIuL2FjdGlvbnNcIjo4LFwiLi90cGxcIjoxMCxcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo4Mn1dLDEwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiB0ZW1wbGF0ZSgpIHtcbiAgY29uc3QgaHRtbCA9IC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCJtb2RhbCBtb2RhbC1zdGFuZGFyZFwiPlxuICAgICAgPGRpdiBjbGFzcz1cImhlYWRlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidGl0bGVcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNsb3NlXCI+XG4gICAgICAgICAgPGJ1dHRvbj48aSBjbGFzcz1cImkgaS1jbG9zZVwiPjwvaT48L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImJvZHlcIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJmb290ZXJcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBjb25zdCBtb2RhbCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcbiAgY29uc3QgdGl0bGUgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcudGl0bGUnKTtcbiAgY29uc3QgY2xvc2VCdG4gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuY2xvc2UgYnV0dG9uJyk7XG4gIGNvbnN0IGJvZHkgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuYm9keScpO1xuICBjb25zdCBmb290ZXIgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuZm9vdGVyJyk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBtb2RhbCxcbiAgICB0aXRsZSxcbiAgICBjbG9zZUJ0bixcbiAgICBib2R5LFxuICAgIGZvb3RlclxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xufSx7XCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6ODJ9XSwxMTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5mdW5jdGlvbiBNb2RhbHNDb250cm9sbGVyKCkge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFscycpXG5cbiAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnbW9kYWxzJyk7XG4gICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnbm8tZGlzcGxheScpO1xuICAgICAgY29udGFpbmVyLmlkID0gJ21vZGFscyc7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICB9XG5cbiAgICBsZXQgY292ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWxzLWNvdmVyJylcblxuICAgIGlmICghY292ZXIpIHtcbiAgICAgIGNvdmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBjb3Zlci5jbGFzc0xpc3QuYWRkKCdtb2RhbHMtY292ZXInKTtcbiAgICAgIGNvdmVyLmlkID0gJ21vZGFscy1jb3Zlcic7XG4gICAgICB0aGlzLmNvdmVyID0gY292ZXI7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5jb3ZlciA9IGNvdmVyO1xuICAgIH1cblxuICAgIHRoaXMubW9kYWxzT3BlbiA9IFtdO1xuICB9KTtcbn1cblxuTW9kYWxzQ29udHJvbGxlci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24obW9kYWwpIHtcbiAgY29uc3QgZWxlbWVudCA9IG1vZGFsLmVsZW1lbnRzLnJvb3Q7XG4gIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICB0aGlzLmNvbnRhaW5lci5pbnNlcnRCZWZvcmUodGhpcy5jb3ZlciwgZWxlbWVudCk7XG59O1xuXG5Nb2RhbHNDb250cm9sbGVyLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24obW9kYWwpIHtcbiAgaWYgKHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5jb250YWlucygnbm8tZGlzcGxheScpKSB7XG4gICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnbm8tZGlzcGxheScpO1xuICB9XG5cbiAgaWYgKHRoaXMubW9kYWxzT3Blbi5sZW5ndGggPiAwKSB7XG4gICAgdGhpcy5nZXRMYXN0KCkuZWxlbWVudHMucm9vdC5jbGFzc0xpc3QuYWRkKCduby1kaXNwbGF5Jyk7XG4gIH1cblxuICBjb25zdCBlbGVtZW50ID0gbW9kYWwuZWxlbWVudHMucm9vdDtcbiAgdGhpcy5jb250YWluZXIuaW5zZXJ0QmVmb3JlKHRoaXMuY292ZXIsIGVsZW1lbnQpO1xuICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ25vLWRpc3BsYXknKTtcbiAgdGhpcy5tb2RhbHNPcGVuLnB1c2gobW9kYWwpO1xufTtcblxuTW9kYWxzQ29udHJvbGxlci5wcm90b3R5cGUuY2xvc2VMYXN0ID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLm1vZGFsc09wZW4ubGVuZ3RoID09IDApIHRocm93IG5ldyBFcnJvcignTm8gbW9kYWxzIHRvIGNsb3NlJyk7XG5cbiAgdGhpcy5nZXRMYXN0KCkuZWxlbWVudHMucm9vdC5jbGFzc0xpc3QuYWRkKCduby1kaXNwbGF5Jyk7XG4gIHRoaXMubW9kYWxzT3Blbi5wb3AoKTtcblxuICBpZiAodGhpcy5tb2RhbHNPcGVuLmxlbmd0aCA+IDApIHtcbiAgICB0aGlzLmdldExhc3QoKS5lbGVtZW50cy5yb290LmNsYXNzTGlzdC5yZW1vdmUoJ25vLWRpc3BsYXknKTtcbiAgfVxuICBlbHNlIHtcbiAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCduby1kaXNwbGF5Jyk7XG4gIH1cbn07XG5cbk1vZGFsc0NvbnRyb2xsZXIucHJvdG90eXBlLmdldExhc3QgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMubW9kYWxzT3Blblt0aGlzLm1vZGFsc09wZW4ubGVuZ3RoIC0gMV07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RhbHNDb250cm9sbGVyKCk7XG59LHt9XSwxMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBNb2RhbCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9tb2RhbHMnKTtcbmNvbnN0IHttYWluVGVtcGxhdGV9ID0gcmVxdWlyZSgnLi90ZW1wbGF0ZXMnKTtcbmNvbnN0IHtwYXJ0aWNpcGFudFBpbGxUZW1wbGF0ZX0gPSByZXF1aXJlKCcuLi9tYWluL3RlbXBsYXRlcycpO1xuY29uc3QgU1BNb2RhbCA9IHJlcXVpcmUoJy4uL3NlbGVjdC1wYXJ0aWNpcGFudHMtbW9kYWwnKTtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvaHR0cCcpO1xuY29uc3QgRUNNb2RhbCA9IHJlcXVpcmUoJy4uL2V2ZW50LWNyZWF0ZWQtbW9kYWwnKTtcblxuZnVuY3Rpb24gQ0VNb2RhbCgpIHtcbiAgY29uc3QgQ0VNb2RhbEluc3RhbmNlID0gTW9kYWwuY3JlYXRlKHtcbiAgICB0eXBlOiAnc3RhbmRhcmQnLFxuICAgIHRpdGxlOiAnQ3JlYXRlIGV2ZW50JyxcbiAgICB3aWR0aDogNDAwLFxuICAgIGRlZmF1bHRBY3Rpb25zOiB0cnVlLFxuICAgIGRlc3Ryb3lPbkNsb3NlOiB0cnVlXG4gIH0pO1xuXG4gIGNvbnN0IHRwbENvbnRyb2xsZXIgPSBtYWluVGVtcGxhdGUoKTtcbiAgdGhpcy5tb2RhbCA9IENFTW9kYWxJbnN0YW5jZTtcbiAgdGhpcy50cGxDb250cm9sbGVyID0gdHBsQ29udHJvbGxlcjtcbiAgdGhpcy5kYXRhID0ge1xuICAgIHRpdGxlOiBudWxsLFxuICAgIGRlc2NyaXB0aW9uOiBudWxsLFxuICAgIGRhdGU6IG51bGwsXG4gICAgcGFydGljaXBhbnRzOiBbXSxcbiAgICBmaWxlczogW10sXG4gICAgdGltZTogeyBmcm9tOiBudWxsLCB0bzogbnVsbCB9LFxuICAgIHByb2plY3Q6IG51bGwsXG4gICAgbGluazogbnVsbCxcbiAgICBpbXBvcnRhbmNlOiBudWxsXG4gIH07XG4gIENFTW9kYWxJbnN0YW5jZS5lbGVtZW50cy5ib2R5LmFwcGVuZENoaWxkKHRwbENvbnRyb2xsZXIucm9vdCk7XG4gIHRoaXMuYmluZFNQTW9kYWwoKTtcbiAgdGhpcy5iaW5kUGFydGljaXBhbnRzRXZlbnRzKCk7XG4gIHRoaXMuYmluZERhdGVBbmRUaW1lRXZlbnRzKCk7XG4gIHRoaXMuYmluZFNpbXBsZUNvbnRyb2xzKCk7XG4gIHRoaXMuYmluZE9LQnV0dG9uKCk7XG4gIFxuICByZXR1cm4gQ0VNb2RhbEluc3RhbmNlO1xufVxuXG5DRU1vZGFsLnByb3RvdHlwZS5iaW5kU1BNb2RhbCA9IGZ1bmN0aW9uKCkge1xuICBsZXQgU1BNb2RhbEluc3RhbmNlID0gbnVsbDtcbiAgY29uc3Qgb3Blbk1vZGFsQnRuID0gdGhpcy50cGxDb250cm9sbGVyLnBhcnRpY2lwYW50cy5idG47XG4gIFxuICBvcGVuTW9kYWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgU1BNb2RhbEluc3RhbmNlID0gU1BNb2RhbC5jcmVhdGUoe1xuICAgICAgcGFydGljaXBhbnRzOiB0aGlzLmRhdGEucGFydGljaXBhbnRzLFxuICAgICAgZGF0ZTogdGhpcy5kYXRhLmRhdGUsXG4gICAgICB0aW1lRnJvbTogdGhpcy5kYXRhLnRpbWUuZnJvbSxcbiAgICAgIHRpbWVUbzogdGhpcy5kYXRhLnRpbWUudG9cbiAgICB9KTtcblxuICAgIFNQTW9kYWxJbnN0YW5jZS5lbGVtZW50cy5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgZXZ0ID0+IHtcbiAgICAgIFNQTW9kYWxJbnN0YW5jZSA9IG51bGw7XG4gICAgfSk7XG5cbiAgICBTUE1vZGFsSW5zdGFuY2UuZWxlbWVudHMucm9vdC5hZGRFdmVudExpc3RlbmVyKCdwYXJ0aWNpcGFudHNTZWxlY3RlZCcsIGV2dCA9PiB7XG4gICAgICBTUE1vZGFsSW5zdGFuY2UgPSBudWxsO1xuICAgICAgdGhpcy5kYXRhLnBhcnRpY2lwYW50cyA9IGV2dC5kZXRhaWwucGFydGljaXBhbnRzO1xuICAgICAgdGhpcy5yZW5kZXJQYXJ0aWNpcGFudHMoKTtcbiAgICB9KTtcblxuICAgIFNQTW9kYWxJbnN0YW5jZS5vcGVuKCk7XG4gIH0pO1xufTtcblxuQ0VNb2RhbC5wcm90b3R5cGUuYmluZFBhcnRpY2lwYW50c0V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnRwbENvbnRyb2xsZXIucGFydGljaXBhbnRzLnBsYWNlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBjb25zdCBjbG9zZUJ0biA9IGV2dC50YXJnZXQuY2xvc2VzdCgnLmJ0bi1jbG9zZScpO1xuICAgIGlmICghY2xvc2VCdG4pIHJldHVybjtcbiAgICBjb25zdCB7cGFydGljaXBhbnRzfSA9IHRoaXMuZGF0YTtcbiAgICBjb25zdCBwUGlsbCA9IGV2dC50YXJnZXQuY2xvc2VzdCgnLnBhcnRpY2lwYW50Jyk7XG4gICAgY29uc3QgdXNlcklkID0gK3BQaWxsLmRhdGFzZXQuaWQ7XG4gICAgY29uc3QgcElkeCA9IHBhcnRpY2lwYW50cy5maW5kSW5kZXgocCA9PiBwWyd1c2VyX2lkJ10gPT0gdXNlcklkKTtcbiAgICBwUGlsbC5yZW1vdmUoKTtcbiAgICBwYXJ0aWNpcGFudHMuc3BsaWNlKHBJZHgsIDEpO1xuXG4gICAgY29uc3QgcG9zdEJvZHkgPSB7XG4gICAgICBwYXJ0aWNpcGFudHNJZHM6IHBhcnRpY2lwYW50cy5tYXAocCA9PiAoeyd1c2VyX2lkJzogcFsndXNlcl9pZCddfSkpLFxuICAgICAgZGF0ZTogdGhpcy5kYXRhLmRhdGUsXG4gICAgICB0aW1lRnJvbTogdGhpcy5kYXRhLnRpbWUuZnJvbSxcbiAgICAgIHRpbWVUbzogdGhpcy5kYXRhLnRpbWUudG9cbiAgICB9O1xuXG4gICAgaHR0cC5wb3N0KCdzY2hlZHVsZXIvZ2V0UGFydGljaXBhbnRzQXZhaWxhYmlsaXR5JywgcG9zdEJvZHkpXG4gICAgICAudGhlbihwQXZhaWxhYmlsaXR5ID0+IHtcbiAgICAgICAgcEF2YWlsYWJpbGl0eS5mb3JFYWNoKHBhID0+IHtcbiAgICAgICAgICBjb25zdCBwRm91bmQgPSBwYXJ0aWNpcGFudHMuZmluZChwID0+IHBbJ3VzZXJfaWQnXSA9PSBwYVsndXNlcl9pZCddKTtcbiAgICAgICAgICBwRm91bmQuYnVzeSA9IHBhLmJ1c3k7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJlbmRlclBhcnRpY2lwYW50cygpO1xuICAgICAgICB0aGlzLmNoZWNrUGFydGljaXBhbnRzQnVzeW5lc3MoKTtcbiAgICAgIH0pXG4gICAgO1xuICB9KTtcbn07XG5cbkNFTW9kYWwucHJvdG90eXBlLnJlbmRlclBhcnRpY2lwYW50cyA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCB7cGFydGljaXBhbnRzfSA9IHRoaXMuZGF0YTtcbiAgdGhpcy50cGxDb250cm9sbGVyLnBhcnRpY2lwYW50cy5wbGFjZS5pbm5lckhUTUwgPSAnJztcbiAgcGFydGljaXBhbnRzLmZvckVhY2gocCA9PiB7XG4gICAgY29uc3QgcFRwbENvbnRyb2xsZXIgPSBwYXJ0aWNpcGFudFBpbGxUZW1wbGF0ZShwKTtcbiAgICB0aGlzLnRwbENvbnRyb2xsZXIucGFydGljaXBhbnRzLnBsYWNlLmFwcGVuZENoaWxkKHBUcGxDb250cm9sbGVyLnJvb3QpO1xuICAgIGlmIChwLmJ1c3kpIHBUcGxDb250cm9sbGVyLnJvb3QuY2xhc3NMaXN0LmFkZCgnYnVzeScpO1xuICB9KTtcbn07XG5cbkNFTW9kYWwucHJvdG90eXBlLmNoZWNrUGFydGljaXBhbnRzQnVzeW5lc3MgPSBmdW5jdGlvbigpIHtcbiAgY29uc3Qge3BhcnRpY2lwYW50c30gPSB0aGlzLmRhdGE7XG4gIGNvbnN0IGJ1c3lMaXN0ID0gcGFydGljaXBhbnRzLmZpbHRlcihwID0+IHAuYnVzeSkubWFwKHAgPT4gcC51c2VybmFtZSk7XG5cbiAgaWYgKGJ1c3lMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBidXN5U3RyID0gYnVzeUxpc3Quam9pbignLCAnKTtcbiAgICB0aGlzLnRwbENvbnRyb2xsZXIucGFydGljaXBhbnRzLmFsZXJ0LnBsYWNlLmlubmVySFRNTCA9IGJ1c3lTdHI7XG4gICAgdGhpcy50cGxDb250cm9sbGVyLnBhcnRpY2lwYW50cy5hbGVydC5yb290LmNsYXNzTGlzdC5yZW1vdmUoJ25vLWRpc3BsYXknKTtcbiAgICB0aGlzLm1vZGFsLmVsZW1lbnRzLnN1Ym1pdC5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhpcy50cGxDb250cm9sbGVyLnBhcnRpY2lwYW50cy5hbGVydC5yb290LmNsYXNzTGlzdC5hZGQoJ25vLWRpc3BsYXknKTtcbiAgICB0aGlzLnRwbENvbnRyb2xsZXIucGFydGljaXBhbnRzLmFsZXJ0LnBsYWNlLmlubmVySFRNTCA9ICcnO1xuICAgIHRoaXMubW9kYWwuZWxlbWVudHMuc3VibWl0LnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgfVxufTtcblxuQ0VNb2RhbC5wcm90b3R5cGUucHJvY2Vzc0RhdGVBbmRUaW1lID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBjb25zdCB7ZGF0ZVJhdywgdGltZUZyb21SYXcsIHRpbWVUb1Jhd30gPSBvcHRpb25zO1xuXG4gIGNvbnN0IFtkYXksIG1vbnRoLCB5ZWFyXSA9IGRhdGVSYXcuc3BsaXQoJy8nKS5tYXAobiA9PiArbik7XG4gIGNvbnN0IFt0aW1lRnJvbUhILCB0aW1lRnJvbU1NXSA9IHRpbWVGcm9tUmF3LnNwbGl0KCc6JykubWFwKG4gPT4gK24pO1xuICBjb25zdCBbdGltZVRvSEgsIHRpbWVUb01NXSA9IHRpbWVUb1Jhdy5zcGxpdCgnOicpLm1hcChuID0+ICtuKTtcblxuICBjb25zdCBkYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGgtMSwgZGF5KTtcbiAgY29uc3QgdGltZUZyb20gPSBuZXcgRGF0ZSh5ZWFyLCBtb250aC0xLCBkYXksIHRpbWVGcm9tSEgsIHRpbWVGcm9tTU0pO1xuICBjb25zdCB0aW1lVG8gPSBuZXcgRGF0ZSh5ZWFyLCBtb250aC0xLCBkYXksIHRpbWVUb0hILCB0aW1lVG9NTSk7XG5cbiAgcmV0dXJuIHtcbiAgICBkYXRlLFxuICAgIHRpbWVGcm9tLFxuICAgIHRpbWVUb1xuICB9O1xufTtcblxuQ0VNb2RhbC5wcm90b3R5cGUuYmluZERhdGVBbmRUaW1lRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IGRhdGVDb250cm9sID0gdGhpcy50cGxDb250cm9sbGVyLmRhdGU7XG4gIGNvbnN0IHRpbWVGcm9tQ29udHJvbCA9IHRoaXMudHBsQ29udHJvbGxlci50aW1lLmZyb207XG4gIGNvbnN0IHRpbWVUb0NvbnRyb2wgPSB0aGlzLnRwbENvbnRyb2xsZXIudGltZS50bztcblxuICBbZGF0ZUNvbnRyb2wsIHRpbWVGcm9tQ29udHJvbCwgdGltZVRvQ29udHJvbF0uZm9yRWFjaChjb250cm9sID0+IHtcbiAgICBjb250cm9sLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIGNvbnN0IGRhdGVSYXcgPSB0aGlzLnRwbENvbnRyb2xsZXIuZGF0ZS52YWx1ZTtcbiAgICAgIGNvbnN0IHRpbWVGcm9tUmF3ID0gdGhpcy50cGxDb250cm9sbGVyLnRpbWUuZnJvbS52YWx1ZTtcbiAgICAgIGNvbnN0IHRpbWVUb1JhdyA9IHRoaXMudHBsQ29udHJvbGxlci50aW1lLnRvLnZhbHVlO1xuICAgICAgXG4gICAgICBpZiAoIWRhdGVSYXcgfHwgIXRpbWVGcm9tUmF3IHx8ICF0aW1lVG9SYXcpIHtcbiAgICAgICAgdGhpcy5kYXRhLmRhdGUgPSBudWxsO1xuICAgICAgICB0aGlzLmRhdGEudGltZS5mcm9tID0gbnVsbDtcbiAgICAgICAgdGhpcy5kYXRhLnRpbWUudG8gPSBudWxsO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBcbiAgICAgIGNvbnN0IHtwYXJ0aWNpcGFudHN9ID0gdGhpcy5kYXRhO1xuICAgICAgY29uc3Qge2RhdGUsIHRpbWVGcm9tLCB0aW1lVG99ID0gdGhpcy5wcm9jZXNzRGF0ZUFuZFRpbWUoeyBkYXRlUmF3LCB0aW1lRnJvbVJhdywgdGltZVRvUmF3IH0pO1xuICAgICAgXG4gICAgICB0aGlzLmRhdGEuZGF0ZSA9IGRhdGU7XG4gICAgICB0aGlzLmRhdGEudGltZS5mcm9tID0gdGltZUZyb207XG4gICAgICB0aGlzLmRhdGEudGltZS50byA9IHRpbWVUbztcbiAgICAgIFxuICAgICAgaWYgKHBhcnRpY2lwYW50cy5sZW5ndGggPT0gMCkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBwYXJ0aWNpcGFudHNJZHMgPSBwYXJ0aWNpcGFudHMubWFwKHAgPT4gKHsgJ3VzZXJfaWQnOiBwWyd1c2VyX2lkJ10gfSkpO1xuICAgICAgY29uc3QgcG9zdEJvZHkgPSB7XG4gICAgICAgIHBhcnRpY2lwYW50c0lkcyxcbiAgICAgICAgZGF0ZTogZGF0ZS50b1N0cmluZygpLFxuICAgICAgICB0aW1lRnJvbTogdGltZUZyb20udG9TdHJpbmcoKSxcbiAgICAgICAgdGltZVRvOiB0aW1lVG8udG9TdHJpbmcoKVxuICAgICAgfTtcbiAgXG4gICAgICBodHRwLnBvc3QoJ3NjaGVkdWxlci9nZXRQYXJ0aWNpcGFudHNBdmFpbGFiaWxpdHknLCBwb3N0Qm9keSlcbiAgICAgICAgLnRoZW4ocEF2YWlsYWJpbGl0eSA9PiB7XG4gICAgICAgICAgcEF2YWlsYWJpbGl0eS5mb3JFYWNoKHBhID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBGb3VuZCA9IHBhcnRpY2lwYW50cy5maW5kKHAgPT4gcFsndXNlcl9pZCddID09IHBhWyd1c2VyX2lkJ10pO1xuICAgICAgICAgICAgcEZvdW5kLmJ1c3kgPSBwYS5idXN5O1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMucmVuZGVyUGFydGljaXBhbnRzKCk7XG4gICAgICAgICAgdGhpcy5jaGVja1BhcnRpY2lwYW50c0J1c3luZXNzKCk7XG4gICAgICAgIH0pXG4gICAgICA7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuQ0VNb2RhbC5wcm90b3R5cGUuYmluZFNpbXBsZUNvbnRyb2xzID0gZnVuY3Rpb24oKSB7XG4gIGxldCBjb250cm9scyA9IHtcbiAgICB0aXRsZTogdGhpcy50cGxDb250cm9sbGVyLnRpdGxlLFxuICAgIGRlc2NyaXB0aW9uOiB0aGlzLnRwbENvbnRyb2xsZXIuZGVzYyxcbiAgICBsaW5rOiB0aGlzLnRwbENvbnRyb2xsZXIubGluayxcbiAgICB0eXBlOiB0aGlzLnRwbENvbnRyb2xsZXIudHlwZSxcbiAgICBwcm9qZWN0OiB0aGlzLnRwbENvbnRyb2xsZXIucHJvamVjdFxuICB9O1xuICBcbiAgT2JqZWN0LmtleXMoY29udHJvbHMpLmZvckVhY2goY05hbWUgPT4ge1xuICAgIGNvbnRyb2xzW2NOYW1lXS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLmRhdGFbY05hbWVdID0gY29udHJvbHNbY05hbWVdLnZhbHVlO1xuICAgIH0pO1xuICB9KTtcblxuICBjb25zdCBpbXBvcnRhbmNlT3B0aW9ucyA9IFtcbiAgICB0aGlzLnRwbENvbnRyb2xsZXIuaW1wb3J0YW5jZS5ub25lLFxuICAgIHRoaXMudHBsQ29udHJvbGxlci5pbXBvcnRhbmNlLmltcG9ydGFudCxcbiAgICB0aGlzLnRwbENvbnRyb2xsZXIuaW1wb3J0YW5jZS5kZXNpcmFibGVcbiAgXTtcblxuICBpbXBvcnRhbmNlT3B0aW9ucy5mb3JFYWNoKG9wdGlvbiA9PiB7XG4gICAgb3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIHRoaXMuZGF0YS5pbXBvcnRhbmNlID0gb3B0aW9uLnZhbHVlO1xuICAgIH0pO1xuICB9KTtcbn07XG5cbkNFTW9kYWwucHJvdG90eXBlLmJpbmRPS0J1dHRvbiA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm1vZGFsLmVsZW1lbnRzLnN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBjb25zdCBwb3N0Qm9keSA9IHtcbiAgICAgIHRpdGxlOiB0aGlzLmRhdGEudGl0bGUsXG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kYXRhLmRlc2NyaXB0aW9uLFxuICAgICAgbGluazogdGhpcy5kYXRhLmxpbmssXG4gICAgICB0eXBlOiB0aGlzLmRhdGEudHlwZSxcbiAgICAgIHByb2plY3Q6IHRoaXMuZGF0YS5wcm9qZWN0LFxuICAgICAgaW1wb3J0YW5jZTogdGhpcy5kYXRhLmltcG9ydGFuY2UsXG4gICAgICBwYXJ0aWNpcGFudHNJZHM6IHRoaXMuZ2V0UGFydGljaXBhbnRzSWRzKCksXG4gICAgICBkYXRlOiBKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGEuZGF0ZS50b1N0cmluZygpKSxcbiAgICAgIHRpbWVGcm9tOiBKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGEudGltZS5mcm9tLnRvU3RyaW5nKCkpLFxuICAgICAgdGltZVRvOiBKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGEudGltZS50by50b1N0cmluZygpKVxuICAgIH07XG4gIFxuICAgIGh0dHAucG9zdCgnc2NoZWR1bGVyL2NyZWF0ZS1ldmVudCcsIHBvc3RCb2R5KVxuICAgICAgLnRoZW4oYW5zd2VyID0+IHtcbiAgICAgICAgaWYgKCFhbnN3ZXIuc3VjY2Vzcykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdubyBzdWNjZXNzJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9O1xuICBcbiAgICAgICAgY29uc3QgdXNlclBhcnRpY2lwYXRlcyA9IHRoaXMuZGF0YS5wYXJ0aWNpcGFudHMuc29tZShwID0+IHAueW91KTtcblxuICAgICAgICBpZiAodXNlclBhcnRpY2lwYXRlcykge1xuICAgICAgICAgIHRoaXMuZGF0YS5pZCA9ICthbnN3ZXIuZGF0YS5ldmVudElkO1xuICAgICAgICAgIHRoaXMuZGF0YVsncGFydGljaXBhbnRzX251bSddID0gdGhpcy5kYXRhLnBhcnRpY2lwYW50cy5sZW5ndGg7XG4gICAgICAgICAgY29uc3QgZXZlbnRDcmVhdGVkID0gbmV3IEN1c3RvbUV2ZW50KCdldmVudENyZWF0ZWQnLCB7IGRldGFpbDogdGhpcy5kYXRhIH0pO1xuICAgICAgICAgIHRoaXMubW9kYWwuZWxlbWVudHMucm9vdC5kaXNwYXRjaEV2ZW50KGV2ZW50Q3JlYXRlZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1vZGFsLmNsb3NlKCk7XG4gICAgICAgIEVDTW9kYWwuY3JlYXRlKCkub3BlbigpO1xuICAgICAgfSlcbiAgICA7XG4gIH0pO1xufTtcblxuQ0VNb2RhbC5wcm90b3R5cGUuZ2V0UGFydGljaXBhbnRzSWRzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmRhdGEucGFydGljaXBhbnRzLm1hcChwID0+ICh7J3VzZXJfaWQnOiBwWyd1c2VyX2lkJ119KSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiAoKSA9PiBuZXcgQ0VNb2RhbCgpXG59O1xufSx7XCIuLi9ldmVudC1jcmVhdGVkLW1vZGFsXCI6MTUsXCIuLi9tYWluL3RlbXBsYXRlc1wiOjMzLFwiLi4vc2VsZWN0LXBhcnRpY2lwYW50cy1tb2RhbFwiOjM4LFwiLi90ZW1wbGF0ZXNcIjoxMyxcImNzcC1hcHAvY29tcG9uZW50cy9tb2RhbHNcIjo3LFwiY3NwLWFwcC9saWJzL2h0dHBcIjo3M31dLDEzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IG1haW5UZW1wbGF0ZSA9IHJlcXVpcmUoJy4vbWFpbi50cGwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1haW5UZW1wbGF0ZVxufTtcbn0se1wiLi9tYWluLnRwbFwiOjE0fV0sMTQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKCkge1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cImZvcm0gY2UtZm9ybVwiPlxuICAgICAgPGRpdiBjbGFzcz1cImZpZWxkIGZpZWxkLW9uZWxpbmUgZmllbGQtdGl0bGUgY2xlYXJmaXhcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWxhYmVsXCI+PGxhYmVsIGZvcj1cImNlLWZvcm0tdGl0bGVcIj5UaXRsZTwvbGFiZWw+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1pbnB1dFwiPjxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwiY2UtZm9ybS10aXRsZVwiIC8+PC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImZpZWxkIGZpZWxkLW9uZWxpbmUgZmllbGQtZGVzYyBjbGVhcmZpeFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWxcIj48bGFiZWwgZm9yPVwiY2UtZm9ybS1kZXNjXCI+RGVzY3JpcHRpb248L2xhYmVsPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtaW5wdXRcIj48dGV4dGFyZWEgaWQ9XCJjZS1mb3JtLWRlc2NcIj48L3RleHRhcmVhPjwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZCBmaWVsZC1vbmVsaW5lIGZpZWxkLWRhdGUgY2xlYXJmaXhcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWxhYmVsXCI+PGxhYmVsIGZvcj1cImNlLWZvcm0tZGF0ZVwiPkRhdGU8L2xhYmVsPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtaW5wdXRcIj5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cImNlLWZvcm0tZGF0ZVwiIHBsYWNlaG9sZGVyPVwiZGQvbW0veXl5eVwiIC8+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0bi1uby1zdHlsZVwiPjxpIGNsYXNzPVwiaSBpLWNhbGVuZGFyXCI+PC9pPjwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiZmllbGQgZmllbGQtb25lbGluZSBmaWVsZC10aW1lIGNsZWFyZml4XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPjxsYWJlbD5UaW1lPC9sYWJlbD48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWlucHV0XCI+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJoaDptbVwiIGNsYXNzPVwiZnJvbVwiIC8+XG4gICAgICAgICAgPHNwYW4+LTwvc3Bhbj5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cImhoOm1tXCIgY2xhc3M9XCJ0b1wiIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZCBmaWVsZC1wYXJ0aWNpcGFudHNcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWxhYmVsXCI+UGFydGljaXBhbnRzIDxidXR0b24gY2xhc3M9XCJidG4tcHJpbWFyeS1vdXRsaW5lZFwiPjxpIGNsYXNzPVwiaSBpLXBsdXNcIj48L2k+U2VsZWN0IHBhcnRpY2lwYW50czwvYnV0dG9uPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtaW5wdXRcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWFsZXJ0IG5vLWRpc3BsYXlcIj5cbiAgICAgICAgICBUaGVzZSBjYW5ub3QgcGFydGljaXBhdGU6IDxzcGFuIGNsYXNzPVwicGFydGljaXBhbnRzLWxpc3RcIj48L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZCBmaWVsZC1vbmVsaW5lIGZpZWxkLWxpbmsgY2xlYXJmaXhcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWxhYmVsXCI+PGxhYmVsIGZvcj1cImNlLWZvcm0tbGlua1wiPkxpbms8L2xhYmVsPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtaW5wdXRcIj48aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cImNlLWZvcm0tbGlua1wiIC8+PC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImZpZWxkIGZpZWxkLW9uZWxpbmUgZmllbGQtdHlwZSBjbGVhcmZpeFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWxcIj48bGFiZWwgZm9yPVwiY2UtZm9ybS1saW5rXCI+VHlwZTwvbGFiZWw+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1pbnB1dFwiPlxuICAgICAgICAgIDxzZWxlY3Q+PC9zZWxlY3Q+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZCBmaWVsZC1vbmVsaW5lIGZpZWxkLXByb2plY3QgY2xlYXJmaXhcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWxhYmVsXCI+PGxhYmVsIGZvcj1cImNlLWZvcm0tcHJvamVjdFwiPlByb2plY3Q8L2xhYmVsPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtaW5wdXRcIj5cbiAgICAgICAgPHNlbGVjdD48L3NlbGVjdD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImZpZWxkIGZpZWxkLWltcG9ydGFuY2VcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWxhYmVsXCI+SW1wb3J0YW5jZSBtYXJrPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1pbnB1dFwiPlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhZGlvXCIgbmFtZT1cImltcG9ydGFuY2VcIiB2YWx1ZT1cIm5vbmVcIiBpZD1cImltcC1ub25lXCIgLz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJpbXAtbm9uZVwiPk5vbmU8L2xhYmVsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIFxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhZGlvXCIgbmFtZT1cImltcG9ydGFuY2VcIiB2YWx1ZT1cImltcG9ydGFudFwiIGlkPVwiaW1wLWltcG9ydGFudFwiIC8+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwiaW1wLWltcG9ydGFudFwiPkltcG9ydGFudDwvbGFiZWw+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYWRpb1wiIG5hbWU9XCJpbXBvcnRhbmNlXCIgdmFsdWU9XCJkZXNpcmFibGVcIiBpZD1cImltcC1kZXNpcmFibGVcIiAvPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cImltcC1kZXNpcmFibGVcIj5EZXNpcmFibGU8L2xhYmVsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiZmllbGQgZmllbGQtZG9jc1wiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWxcIj5Eb2N1bWVudHMgPGJ1dHRvbiBjbGFzcz1cImJ0bi1wcmltYXJ5LW91dGxpbmVkXCI+PGkgY2xhc3M9XCJpIGktcGx1c1wiPjwvaT5BdHRhY2ggZG9jdW1lbnQ8L2J1dHRvbj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWlucHV0XCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKGh0bWwpO1xuICBjb25zdCB0aXRsZSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkLXRpdGxlIGlucHV0Jyk7XG4gIGNvbnN0IGRlc2MgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5maWVsZC1kZXNjIHRleHRhcmVhJyk7XG4gIGNvbnN0IGRhdGUgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5maWVsZC1kYXRlIGlucHV0Jyk7XG4gIGNvbnN0IGZyb20gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5maWVsZC10aW1lIC5mcm9tJyk7XG4gIGNvbnN0IHRvID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZmllbGQtdGltZSAudG8nKTtcbiAgY29uc3QgYWRkUGFydGljaXBhbnRCdG4gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5maWVsZC1wYXJ0aWNpcGFudHMgYnV0dG9uJyk7XG4gIGNvbnN0IGFkZFBhcnRpY2lwYW50UGxhY2UgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5maWVsZC1wYXJ0aWNpcGFudHMgLmZpZWxkLWlucHV0Jyk7XG4gIGNvbnN0IGxpbmsgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5maWVsZC1saW5rIGlucHV0Jyk7XG4gIGNvbnN0IHR5cGVTZWxlY3QgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5maWVsZC10eXBlIHNlbGVjdCcpO1xuICBjb25zdCBwcm9qZWN0U2VsZWN0ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZmllbGQtcHJvamVjdCBzZWxlY3QnKTtcbiAgY29uc3QgaW1wUmFkaW9Ob25lID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcjaW1wLW5vbmUnKTtcbiAgY29uc3QgaW1wUmFkaW9JbXBvcnRhbnQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbXAtaW1wb3J0YW50Jyk7XG4gIGNvbnN0IGltcFJhZGlvRGVzaXJhYmxlID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcjaW1wLWRlc2lyYWJsZScpO1xuICBjb25zdCBhZGREb2NCdG4gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5maWVsZC1kb2NzIGJ1dHRvbicpO1xuICBjb25zdCBhZGREb2NQbGFjZSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkLWRvY3MgLmZpZWxkLWlucHV0Jyk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBlbGVtZW50LFxuICAgIHRpdGxlLFxuICAgIGRlc2MsXG4gICAgZGF0ZSxcbiAgICB0aW1lOiB7XG4gICAgICBmcm9tLFxuICAgICAgdG9cbiAgICB9LFxuICAgIHBhcnRpY2lwYW50czoge1xuICAgICAgYnRuOiBhZGRQYXJ0aWNpcGFudEJ0bixcbiAgICAgIHBsYWNlOiBhZGRQYXJ0aWNpcGFudFBsYWNlLFxuICAgICAgYWxlcnQ6IHtcbiAgICAgICAgcm9vdDogZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZmllbGQtcGFydGljaXBhbnRzIC5maWVsZC1hbGVydCcpLFxuICAgICAgICBwbGFjZTogZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZmllbGQtcGFydGljaXBhbnRzIC5wYXJ0aWNpcGFudHMtbGlzdCcpXG4gICAgICB9XG4gICAgfSxcbiAgICBsaW5rLFxuICAgIHR5cGU6IHR5cGVTZWxlY3QsXG4gICAgcHJvamVjdDogcHJvamVjdFNlbGVjdCxcbiAgICBpbXBvcnRhbmNlOiB7XG4gICAgICBub25lOiBpbXBSYWRpb05vbmUsXG4gICAgICBpbXBvcnRhbnQ6IGltcFJhZGlvSW1wb3J0YW50LFxuICAgICAgZGVzaXJhYmxlOiBpbXBSYWRpb0Rlc2lyYWJsZVxuICAgIH0sXG4gICAgZG9jczoge1xuICAgICAgYnRuOiBhZGREb2NCdG4sXG4gICAgICBwbGFjZTogYWRkRG9jUGxhY2VcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo4Mn1dLDE1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IE1vZGFsID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL21vZGFscycpO1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmZ1bmN0aW9uIEVDTW9kYWwoKSB7XG4gIGNvbnN0IEVDTW9kYWxJbnN0YW5jZSA9IE1vZGFsLmNyZWF0ZSh7XG4gICAgdHlwZTogJ3N0YW5kYXJkJyxcbiAgICB0aXRsZTogJ1N1Y2Nlc3MnLFxuICAgIHdpZHRoOiA0MDAsXG4gICAgZGVmYXVsdEFjdGlvbnM6IGZhbHNlLFxuICAgIGFjdGlvbnM6IFt7XG4gICAgICBpZDogJ3N1Ym1pdCcsXG4gICAgICB0eXBlOiAncHJpbWFyeScsXG4gICAgICB0aXRsZTogJ09LJ1xuICAgIH1dLFxuICAgIGRlc3Ryb3lPbkNsb3NlOiB0cnVlXG4gIH0pO1xuXG4gIGNvbnN0IGh0bWwgPSAvKmh0bWwqL2BcbiAgICA8cCBzdHlsZT1cInRleHQtYWxpZ246IGNlbnRlclwiPlRoZSBldmVudCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgY3JlYXRlZCE8L3A+XG4gIGA7XG4gIGNvbnN0IGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoaHRtbCk7XG5cbiAgRUNNb2RhbEluc3RhbmNlLmVsZW1lbnRzLmJvZHkuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG5cbiAgcmV0dXJuIEVDTW9kYWxJbnN0YW5jZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogKCkgPT4gbmV3IEVDTW9kYWwoKVxufTtcbn0se1wiY3NwLWFwcC9jb21wb25lbnRzL21vZGFsc1wiOjcsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6ODJ9XSwxNjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IE1vZGFsID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL21vZGFscycpO1xuY29uc3QgbWFpblRlbXBsYXRlID0gcmVxdWlyZSgnLi90cGwnKTtcblxuZnVuY3Rpb24gRURNb2RhbChvcHRpb25zKSB7XG4gIGNvbnN0IEVETW9kYWxJbnN0YW5jZSA9IE1vZGFsLmNyZWF0ZSh7XG4gICAgdHlwZTogJ3N0YW5kYXJkJyxcbiAgICB0aXRsZTogJycsXG4gICAgd2lkdGg6IDMwMCxcbiAgICBkZXN0cm95T25DbG9zZTogdHJ1ZSxcbiAgICBhY3Rpb25zOiBbe1xuICAgICAgaWQ6ICdjYW5jZWwnLFxuICAgICAgdHlwZTogJ3ByaW1hcnknLFxuICAgICAgdGl0bGU6ICdPSydcbiAgICB9XVxuICB9KTtcblxuICBjb25zdCB7ZXZlbnRJZH0gPSBvcHRpb25zO1xuXG4gIGh0dHAuZ2V0KGBzY2hlZHVsZXIvZ2V0RXZlbnRJbmZvLyR7IGV2ZW50SWQgfWApXG4gICAgLnRoZW4oZXZlbnQgPT4ge1xuICAgICAgZXZlbnQuZGF0ZSA9IG5ldyBEYXRlKGV2ZW50LmRhdGUpO1xuICAgICAgZXZlbnRbJ3RpbWVfZnJvbSddID0gbmV3IERhdGUoZXZlbnRbJ3RpbWVfZnJvbSddKTtcbiAgICAgIGV2ZW50Wyd0aW1lX3RvJ10gPSBuZXcgRGF0ZShldmVudFsndGltZV90byddKTtcbiAgICAgIGNvbnN0IHRwbENvbnRyb2xsZXIgPSBtYWluVGVtcGxhdGUoZXZlbnQpO1xuICAgICAgRURNb2RhbEluc3RhbmNlLmVsZW1lbnRzLnRpdGxlLnRleHRDb250ZW50ID0gZXZlbnQudGl0bGU7XG4gICAgICBFRE1vZGFsSW5zdGFuY2UuZWxlbWVudHMuYm9keS5hcHBlbmRDaGlsZCh0cGxDb250cm9sbGVyLnJvb3QpO1xuICAgIH0pXG4gIDtcblxuICByZXR1cm4gRURNb2RhbEluc3RhbmNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiBvcHRpb25zID0+IG5ldyBFRE1vZGFsKG9wdGlvbnMpXG59O1xufSx7XCIuL3RwbFwiOjE3LFwiY3NwLWFwcC9jb21wb25lbnRzL21vZGFsc1wiOjcsXCJjc3AtYXBwL2xpYnMvaHR0cFwiOjczfV0sMTc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKGUpIHtcbiAgY29uc3QgZGF0ZSA9IGAke2UuZGF0ZS5nZXREYXRlKCl9LyR7ZS5kYXRlLmdldE1vbnRoKCl9LyR7ZS5kYXRlLmdldEZ1bGxZZWFyKCl9YDtcbiAgY29uc3QgdGltZUZyb21ISCA9IGVbJ3RpbWVfZnJvbSddLmdldEhvdXJzKCkudG9TdHJpbmcoKS5sZW5ndGggPT0gMSA/ICcwJyArIGVbJ3RpbWVfZnJvbSddLmdldEhvdXJzKCkgOiBlWyd0aW1lX2Zyb20nXS5nZXRIb3VycygpO1xuICBjb25zdCB0aW1lRnJvbU1NID0gZVsndGltZV9mcm9tJ10uZ2V0TWludXRlcygpLnRvU3RyaW5nKCkubGVuZ3RoID09IDEgPyAnMCcgKyBlWyd0aW1lX2Zyb20nXS5nZXRNaW51dGVzKCkgOiBlWyd0aW1lX2Zyb20nXS5nZXRNaW51dGVzKCk7XG4gIGNvbnN0IHRpbWVUb0hIID0gZVsndGltZV90byddLmdldEhvdXJzKCkudG9TdHJpbmcoKS5sZW5ndGggPT0gMSA/ICcwJyArIGVbJ3RpbWVfdG8nXS5nZXRIb3VycygpIDogZVsndGltZV90byddLmdldEhvdXJzKCk7XG4gIGNvbnN0IHRpbWVUb01NID0gZVsndGltZV90byddLmdldE1pbnV0ZXMoKS50b1N0cmluZygpLmxlbmd0aCA9PSAxID8gJzAnICsgZVsndGltZV90byddLmdldE1pbnV0ZXMoKSA6IGVbJ3RpbWVfdG8nXS5nZXRNaW51dGVzKCk7XG4gIGNvbnN0IHRpbWUgPSBgJHt0aW1lRnJvbUhIfToke3RpbWVGcm9tTU19LSR7dGltZVRvSEh9OiR7dGltZVRvTU19YDtcbiAgY29uc3QgbGlua1Nob3J0ZW5lZCA9IGUubGluayAmJiBlLmxpbmsubGVuZ3RoID4gMjAgPyBlLmxpbmsubGVuZ3RoLnNsaWNlKDAsIDE3KSArICcuLi4nIDogZS5saW5rO1xuICBsZXQgaW1wb3J0YW5jZTtcblxuICBzd2l0Y2goZS5pbXBvcnRhbmNlKSB7XG4gICAgY2FzZSAnbm9uZSc6XG4gICAgICBpbXBvcnRhbmNlID0gJ3BlYWNlJztcbiAgICAgIGltcG9ydGFuY2VUZXh0ID0gJ0ZyZWUgdG8gZGVjaWRlJztcbiAgICAgIGltcG9ydGFuY2VIaW50ID0gJ1RoZSBldmVudCBpcyBub3QgaW1wb3J0YW50JztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Rlc2lyYWJsZSc6XG4gICAgICBpbXBvcnRhbmNlID0gJ3JvY2snO1xuICAgICAgaW1wb3J0YW5jZVRleHQgPSAnRGVzaXJhYmxlJztcbiAgICAgIGltcG9ydGFuY2VIaW50ID0gJ1RoZSBldmVudCBpcyBkZXNpcmFibGUgdG8gdmlzaXQnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaW1wb3J0YW50JzpcbiAgICAgIGltcG9ydGFuY2UgPSAncGFwZXInO1xuICAgICAgaW1wb3J0YW5jZVRleHQgPSAnSW1wb3J0YW50JztcbiAgICAgIGltcG9ydGFuY2VIaW50ID0gJ1RoZSBldmVudCBpcyBvYmxpZ2F0b3J5IHRvIHZpc2l0JztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBpbXBvcnRhbmNlID0gJ3BlYWNlJztcbiAgICAgIGltcG9ydGFuY2VUZXh0ID0gJ0ZyZWUgdG8gZGVjaWRlJztcbiAgICAgIGltcG9ydGFuY2VIaW50ID0gJ1RoZSBldmVudCBpcyBub3QgaW1wb3J0YW50JztcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgY29uc3QgaHRtbCA9IC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCJjbXBfZXZlbnQtZGV0YWlsc1wiPlxuICAgICAgPGRpdiBjbGFzcz1cInRvcFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbSBkYXRlIGl0ZW0tc2ltcGxlXCI+XG4gICAgICAgICAgPGkgY2xhc3M9XCJpIGktY2FsZW5kYXJcIj48L2k+XG4gICAgICAgICAgPHNwYW4+JHsgZGF0ZSB9PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbSB0aW1lIGl0ZW0tc2ltcGxlXCI+XG4gICAgICAgICAgPGkgY2xhc3M9XCJpIGktY2xvY2tcIj48L2k+XG4gICAgICAgICAgPHNwYW4+JHsgdGltZSB9PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICAke1xuICAgICAgICAgIGUubGluayA/XG4gICAgICAgICAgLypodG1sKi9gPGEgY2xhc3M9XCJpdGVtIGxpbmsgaXRlbS1idWxsZXRcIiBocmVmPVwiJHsgZS5saW5rIH1cIj48aSBjbGFzcz1cImkgaS1saW5rXCI+PC9pPjxzcGFuPiR7IGxpbmtTaG9ydGVuZWQgfTwvc3Bhbj48L2E+YCA6XG4gICAgICAgICAgJydcbiAgICAgICAgfVxuXG4gICAgICAgICR7XG4gICAgICAgICAgZVsnY2F0ZWdvcnlfaWQnXSA/XG4gICAgICAgICAgLypodG1sKi9gPGRpdiBjbGFzcz1cIml0ZW0gY2F0ZWdvcnkgaXRlbS1zaW1wbGVcIj48aSBjbGFzcz1cImlcIj48L2k+PHNwYW4+JHsgZVsnY2F0ZWdvcnlfbmFtZSddIH08L3NwYW4+PC9kaXY+YCA6XG4gICAgICAgICAgJydcbiAgICAgICAgfVxuXG4gICAgICAgIDxkaXYgY2xhc3M9XCJpdGVtIGltcG9ydGFuY2UgaXRlbS1idWxsZXQgJHsgaW1wb3J0YW5jZSB9XCI+XG4gICAgICAgICAgPGkgY2xhc3M9XCJpIGktaGFuZC0keyBpbXBvcnRhbmNlIH1cIj48L2k+XG4gICAgICAgICAgPHNwYW4+JHsgaW1wb3J0YW5jZVRleHQgfTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImRlc2NyaXB0aW9uXCI+XG4gICAgICAgICR7IGUuZGVzY3JpcHRpb24gPyBlLmRlc2NyaXB0aW9uIDogJ05vIGRlc2NyaXB0aW9uIHByb3ZpZGVkJyB9XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cInBhcnRpY2lwYW50c1wiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwicGFydGljaXBhbnRzLWhlYWRlclwiPlBhcnRpY2lwYW50czwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwicGFydGljaXBhbnRzLWJvZHlcIj5cbiAgICAgICAgICAke1xuICAgICAgICAgICAgZS5wYXJ0aWNpcGFudHMubWFwKHAgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gLypodG1sKi9gXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBhcnRpY2lwYW50ICR7IHAueW91ID8gJ3lvdScgOiAnJyB9XCI+XG4gICAgICAgICAgICAgICAgICAkeyBwLnlvdSA/ICdZb3UnIDogcC51c2VybmFtZSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICB9KS5qb2luKCcnKVxuICAgICAgICAgIH1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImZpbGVzXCI+XG5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xuXG4gIGNvbnN0IGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoaHRtbCk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBlbGVtZW50XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo4Mn1dLDE4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IFNjaGVkdWxlckNvbXBvbmVudCA9IHJlcXVpcmUoJy4vbWFpbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNjaGVkdWxlckNvbXBvbmVudDtcbn0se1wiLi9tYWluXCI6Mjl9XSwxOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vaW5kZXgudHBsJyk7XG5jb25zdCBDRU1vZGFsID0gcmVxdWlyZSgnLi4vY3JlYXRlLWV2ZW50LW1vZGFsJyk7XG5jb25zdCB7XG4gIHRpbWVzdHJpcFRlbXBsYXRlXG59ID0gcmVxdWlyZSgnLi90ZW1wbGF0ZXMnKTtcbmNvbnN0IHtcbiAgdGltZWxpbmVUaXRsZVRlbXBsYXRlOiBkYXlUZW1wbGF0ZSxcbiAgdGltZWxpbmVUZW1wbGF0ZSxcbiAgdG9vbHRpcFRlbXBsYXRlXG59ID0gcmVxdWlyZSgnLi4vbWFpbi90ZW1wbGF0ZXMnKTtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvaHR0cCcpO1xuY29uc3QgRURNb2RhbCA9IHJlcXVpcmUoJy4uL2V2ZW50LWRldGFpbHMtbW9kYWwnKTtcbmNvbnN0IHtcbiAgY2FsY1NpemVzLFxuICBjYWxjT2Zmc2V0LFxuICBjYWxjV2lkdGgsXG4gIGdldEV2ZW50RWxlbWVudFxufSA9IHJlcXVpcmUoJy4uL21haW4vZnVuY3Rpb25zJyk7XG5cbmZ1bmN0aW9uIElTTW9kYWwob3B0aW9ucykge1xuICBjb25zdCB0cGxDb250cm9sbGVyID0gdGVtcGxhdGUoKTtcbiAgdGhpcy5faW5zdGFuY2VDb250cm9sbGVyID0gdHBsQ29udHJvbGxlcjtcbiAgdGhpcy5fdG9kYXkgPSB0aGlzLmdldERheVN0YXJ0KG5ldyBEYXRlKCkpO1xuICB0aGlzLl90b29sdGlwID0gbnVsbDtcbiAgdGhpcy5sb2FkRXZlbnRzKCk7XG4gIHRoaXMuYmluZElTTW9kYWxFdmVudHMoKTtcbiAgdGhpcy5iaW5kVG9vbHRpcHMoKTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0cGxDb250cm9sbGVyLnJvb3QpO1xuICB0aGlzLl9pc0luaXQgPSBmYWxzZTtcbiAgdGhpcy5fZGVzdHJveU9uQ2xvc2UgPSBvcHRpb25zICYmIG9wdGlvbnMuZGVzdHJveU9uQ2xvc2U7XG5cbiAgcmV0dXJuIHtcbiAgICBvcGVuOiB0aGlzLm9wZW4uYmluZCh0aGlzKSxcbiAgICBjbG9zZTogdGhpcy5jbG9zZS5iaW5kKHRoaXMpLFxuICAgIGRlc3Ryb3k6IHRoaXMuZGVzdHJveS5iaW5kKHRoaXMpLFxuICAgIHJvb3Q6IHRoaXMuX2luc3RhbmNlQ29udHJvbGxlci5yb290XG4gIH07XG59XG5cbklTTW9kYWwucHJvdG90eXBlLmNhbGNTaXplcyA9IGNhbGNTaXplcygnX2luc3RhbmNlQ29udHJvbGxlcicpO1xuSVNNb2RhbC5wcm90b3R5cGUuY2FsY09mZnNldCA9IGNhbGNPZmZzZXQ7XG5JU01vZGFsLnByb3RvdHlwZS5jYWxjV2lkdGggPSBjYWxjV2lkdGg7XG5JU01vZGFsLnByb3RvdHlwZS5nZXRFdmVudEVsZW1lbnQgPSBnZXRFdmVudEVsZW1lbnQ7XG5cbklTTW9kYWwucHJvdG90eXBlLmdldERheVN0YXJ0ID0gZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gIHJldHVybiBuZXcgRGF0ZSh0aW1lc3RhbXAuZ2V0RnVsbFllYXIoKSwgdGltZXN0YW1wLmdldE1vbnRoKCksIHRpbWVzdGFtcC5nZXREYXRlKCksIDApO1xufTtcblxuSVNNb2RhbC5wcm90b3R5cGUubG9hZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCB0b2RheSA9IHRoaXMuX3RvZGF5O1xuICBjb25zdCBwb3N0Qm9keSA9IHtcbiAgICBzdGFydEF0OiB0b2RheS50b1N0cmluZygpLFxuICAgIGVuZEF0OiBuZXcgRGF0ZSh0b2RheS5nZXRGdWxsWWVhcigpLCB0b2RheS5nZXRNb250aCgpLCB0b2RheS5nZXREYXRlKCkgKyA3LCAwKS50b1N0cmluZygpXG4gIH07XG5cbiAgaHR0cC5wb3N0KCdzY2hlZHVsZXIvZ2V0QWxsTXlFdmVudHNCeURheXMnLCBwb3N0Qm9keSlcbiAgICAudGhlbihkYXlzID0+IHtcbiAgICAgIHRoaXMuX2RheXMgPSBkYXlzO1xuICAgICAgZGF5cy5mb3JFYWNoKGRheSA9PiB0aGlzLnByb2Nlc3NEYXkoZGF5KSk7XG4gICAgICB0aGlzLnJlbmRlckV2ZW50cygpO1xuICAgICAgdGhpcy5iaW5kRGF0ZXNNb3ZlbWVudCgpO1xuICAgICAgcmV0dXJuIGh0dHAuZ2V0KCdzY2hlZHVsZXIvZ2V0TXlMb2NhbFRpbWUnKTtcbiAgICB9KVxuICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgdGhpcy5fdGltZXN0cmlwID0ge307XG4gICAgICB0aGlzLmluaXRUaW1lc3RyaXAobmV3IERhdGUoZGF0YS50aW1lc3RhbXApKTtcbiAgICB9KVxuICA7XG59O1xuXG5JU01vZGFsLnByb3RvdHlwZS5pbml0VGltZXN0cmlwID0gZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gIGNvbnN0IHRpbWVzdHJpcCA9IHRoaXMuX3RpbWVzdHJpcDtcbiAgdGltZXN0cmlwLmVsID0gbnVsbDtcbiAgdGltZXN0cmlwLnRpbWVEaWZmID0gdGltZXN0YW1wIC0gbmV3IERhdGUoKTtcbiAgdGltZXN0cmlwLmN1ckRheSA9IG5ldyBEYXRlKG5ldyBEYXRlKCkuc2V0TWlsbGlzZWNvbmRzKHRpbWVzdHJpcC50aW1lRGlmZikpO1xuICB0aW1lc3RyaXAuY3VyRGF5XzloID0gbmV3IERhdGUodGltZXN0cmlwLmN1ckRheS5nZXRGdWxsWWVhcigpLCB0aW1lc3RyaXAuY3VyRGF5LmdldE1vbnRoKCksIHRpbWVzdHJpcC5jdXJEYXkuZ2V0RGF0ZSgpLCA5KTtcbiAgdGltZXN0cmlwLmN1ckRheV8yMWggPSBuZXcgRGF0ZSh0aW1lc3RyaXAuY3VyRGF5LmdldEZ1bGxZZWFyKCksIHRpbWVzdHJpcC5jdXJEYXkuZ2V0TW9udGgoKSwgdGltZXN0cmlwLmN1ckRheS5nZXREYXRlKCksIDIxKTtcbiAgdGltZXN0cmlwLmRheSA9IHRoaXMuZmluZERheSh0aW1lc3RyaXAuY3VyRGF5KTtcbiAgLy8gbGV0IGMgPSB0aW1lc3RyaXAuY3VyRGF5O1xuICAvLyBsZXQgc3QgPSBuZXcgRGF0ZShjLmdldEZ1bGxZZWFyKCksIGMuZ2V0TW9udGgoKSwgYy5nZXREYXRlKCksIDIwLCA1OSk7XG4gIC8vIGxldCBkZCA9IG5ldyBEYXRlKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3QpO1xuICB0aGlzLnJ1bigpO1xuICBzZXRJbnRlcnZhbCh0aGlzLnJ1bi5iaW5kKHRoaXMpLCAxMDAwKjYwKTtcbn07XG5cbklTTW9kYWwucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uKCkge1xuICBsZXQgdGltZXN0cmlwID0gdGhpcy5fdGltZXN0cmlwO1xuICBsZXQgbW9tZW50ID0gbmV3IERhdGUobmV3IERhdGUoKS5nZXRUaW1lKCkgKyB0aW1lc3RyaXAudGltZURpZmYpO1xuICAvLyBsZXQgbW9tZW50ID0gbmV3IERhdGUobmV3IERhdGUoKS5nZXRUaW1lKCkgLSAxMDAwKjYwKjYwKjE1KTtcbiAgLy8gbGV0IG1vbWVudCA9IG5ldyBEYXRlKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gZGQpO1xuICBpZiAodGltZXN0cmlwLmN1ckRheV8yMWggPCBtb21lbnQpIHtcbiAgICB0aW1lc3RyaXAuY3VyRGF5ID0gbmV3IERhdGUodGltZXN0cmlwLmN1ckRheS5nZXRGdWxsWWVhcigpLCB0aW1lc3RyaXAuY3VyRGF5LmdldE1vbnRoKCksIHRpbWVzdHJpcC5jdXJEYXkuZ2V0RGF0ZSgpICsgMSwgMCk7XG4gICAgdGltZXN0cmlwLmN1ckRheV85aCA9IG5ldyBEYXRlKHRpbWVzdHJpcC5jdXJEYXkuZ2V0RnVsbFllYXIoKSwgdGltZXN0cmlwLmN1ckRheS5nZXRNb250aCgpLCB0aW1lc3RyaXAuY3VyRGF5LmdldERhdGUoKSwgOSk7XG4gICAgdGltZXN0cmlwLmN1ckRheV8yMWggPSBuZXcgRGF0ZSh0aW1lc3RyaXAuY3VyRGF5LmdldEZ1bGxZZWFyKCksIHRpbWVzdHJpcC5jdXJEYXkuZ2V0TW9udGgoKSwgdGltZXN0cmlwLmN1ckRheS5nZXREYXRlKCksIDIxKTtcbiAgICB0aW1lc3RyaXAuZGF5ID0gdGhpcy5maW5kRGF5KHRpbWVzdHJpcC5jdXJEYXkpO1xuICAgIGlmICh0aW1lc3RyaXAuZWwpIHtcbiAgICAgIHRpbWVzdHJpcC5lbC5yb290LmNsYXNzTGlzdC5hZGQoJ25vLWRpc3BsYXknKTtcbiAgICAgIHRpbWVzdHJpcC5lbC5yb290LnJlbW92ZSgpO1xuICAgICAgdGltZXN0cmlwLmVsID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBpZiAoIXRpbWVzdHJpcC5kYXkpIHtcbiAgICB0aW1lc3RyaXAuZGF5ID0gdGhpcy5maW5kRGF5KHRpbWVzdHJpcC5jdXJEYXkpO1xuICB9O1xuXG4gIGlmIChtb21lbnQgPj0gdGltZXN0cmlwLmN1ckRheV85aCAmJiBtb21lbnQgPD0gdGltZXN0cmlwLmN1ckRheV8yMWggJiYgdGltZXN0cmlwLmRheSkge1xuICAgIGNvbnN0IGhoID0gbW9tZW50LmdldEhvdXJzKCkudG9TdHJpbmcoKS5sZW5ndGggPT0gMSA/ICcwJyArIG1vbWVudC5nZXRIb3VycygpIDogbW9tZW50LmdldEhvdXJzKCk7XG4gICAgY29uc3QgbW0gPSBtb21lbnQuZ2V0TWludXRlcygpLnRvU3RyaW5nKCkubGVuZ3RoID09IDEgPyAnMCcgKyBtb21lbnQuZ2V0TWludXRlcygpIDogbW9tZW50LmdldE1pbnV0ZXMoKTtcbiAgICBjb25zdCBvZmZzZXQgPSBNYXRoLmZsb29yKChtb21lbnQgLSB0aW1lc3RyaXAuY3VyRGF5XzloKS8oMTAwMCo2MCkpICogdGhpcy5zaXplcy5taW51dGU7XG5cbiAgICBpZiAoIXRpbWVzdHJpcC5lbCkge1xuICAgICAgdGltZXN0cmlwLmVsID0gdGltZXN0cmlwVGVtcGxhdGUoeyB0aW1lOiBgJHtoaH06JHttbX1gIH0pO1xuICAgICAgdGltZXN0cmlwLmRheS50aW1lbGluZVRwbENvbnRyb2xsZXIucm9vdC5hcHBlbmRDaGlsZCh0aW1lc3RyaXAuZWwucm9vdCk7XG4gICAgICB0aW1lc3RyaXAuZWwudGltZS5zdHlsZS5tYXJnaW5MZWZ0ID0gLSh0aW1lc3RyaXAuZWwudGltZS5vZmZzZXRXaWR0aCAvIDIpICsgJ3B4JztcbiAgICAgIGNvbnN0IGhlaWdodCA9IHRpbWVzdHJpcC5lbC50aW1lLm9mZnNldEhlaWdodDtcbiAgICAgIGNvbnN0IGRlbHRhSGVpZ2h0ID0gK2dldENvbXB1dGVkU3R5bGUodGltZXN0cmlwLmVsLnJvb3QpLmdldFByb3BlcnR5VmFsdWUoJy0taGVpZ2h0LWRlbHRhJyk7XG4gICAgICB0aW1lc3RyaXAuZWwucm9vdC5zdHlsZS50b3AgPSAtKGhlaWdodCtkZWx0YUhlaWdodCkgKyAncHgnO1xuICAgIH1cblxuICAgIHRpbWVzdHJpcC5lbC5yb290LnN0eWxlLmxlZnQgPSAob2Zmc2V0ICsgdGhpcy5zaXplcy5tYXJnaW4pICsgJ3B4JztcbiAgICB0aW1lc3RyaXAuZWwudGltZS50ZXh0Q29udGVudCA9IGAke2hofToke21tfWA7XG4gIH1cbn07XG5cbklTTW9kYWwucHJvdG90eXBlLmZpbmREYXkgPSBmdW5jdGlvbihkYXkpIHtcbiAgcmV0dXJuIHRoaXMuX2RheXMuZmluZChkID0+IHtcbiAgICBjb25zdCBkYXkxU3RyID0gYCR7ZC5kYXRlLmdldEZ1bGxZZWFyKCktZC5kYXRlLmdldE1vbnRoKCktZC5kYXRlLmdldERhdGUoKX1gO1xuICAgIGNvbnN0IGRheTJTdHIgPSBgJHtkYXkuZ2V0RnVsbFllYXIoKS1kYXkuZ2V0TW9udGgoKS1kYXkuZ2V0RGF0ZSgpfWA7XG4gICAgcmV0dXJuIGRheTFTdHIgPT09IGRheTJTdHI7XG4gIH0pO1xufTtcblxuSVNNb2RhbC5wcm90b3R5cGUucHJvY2Vzc0RheSA9IGZ1bmN0aW9uKGRheSkge1xuICBkYXkuZGF0ZSA9IG5ldyBEYXRlKGRheS5kYXRlKTtcbiAgZGF5LmV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICBldmVudC5kYXRlID0gbmV3IERhdGUoZXZlbnQuZGF0ZSk7XG4gICAgZXZlbnRbJ3RpbWVfZnJvbSddID0gbmV3IERhdGUoZXZlbnRbJ3RpbWVfZnJvbSddKTtcbiAgICBldmVudFsndGltZV90byddID0gbmV3IERhdGUoZXZlbnRbJ3RpbWVfdG8nXSk7XG4gIH0pO1xufTtcblxuSVNNb2RhbC5wcm90b3R5cGUuYmluZElTTW9kYWxFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgY29uc3Qge2Nsb3NlQnRuLCBvcGVuQ0VNb2RhbEJ0bn0gPSB0aGlzLl9pbnN0YW5jZUNvbnRyb2xsZXI7XG5cbiAgY2xvc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgdGhpcy5jbG9zZSgpO1xuICB9KTtcblxuICBsZXQgQ0VNb2RhbEluc3RhbmNlID0gbnVsbDtcblxuICBvcGVuQ0VNb2RhbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBpZiAoIUNFTW9kYWxJbnN0YW5jZSkge1xuICAgICAgQ0VNb2RhbEluc3RhbmNlID0gQ0VNb2RhbC5jcmVhdGUoKTtcbiAgICAgIENFTW9kYWxJbnN0YW5jZS5lbGVtZW50cy5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgZXZ0ID0+IHtcbiAgICAgICAgQ0VNb2RhbEluc3RhbmNlID0gbnVsbDtcbiAgICAgIH0pO1xuICAgICAgQ0VNb2RhbEluc3RhbmNlLmVsZW1lbnRzLnJvb3QuYWRkRXZlbnRMaXN0ZW5lcignZXZlbnRDcmVhdGVkJywgZXZ0ID0+IHtcbiAgICAgICAgQ0VNb2RhbEluc3RhbmNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5hZGROZXdFdmVudChldnQuZGV0YWlsKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIENFTW9kYWxJbnN0YW5jZS5vcGVuKCk7XG4gIH0pO1xufTtcblxuSVNNb2RhbC5wcm90b3R5cGUucmVuZGVyRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSB0aGlzLl9pbnN0YW5jZUNvbnRyb2xsZXI7XG4gIGNvbnN0IGRheXMgPSB0aGlzLl9kYXlzO1xuXG4gIGRheXMuZm9yRWFjaChkYXkgPT4ge1xuICAgIGNvbnN0IGRheVRwbENvbnRyb2xsZXIgPSBkYXlUZW1wbGF0ZSh7IHRpdGxlOiBkYXkudGl0bGUgfSk7XG4gICAgY29uc3QgdGltZWxpbmVUcGxDb250cm9sbGVyID0gdGltZWxpbmVUZW1wbGF0ZSgpO1xuICAgIGRheS5kYXlUcGxDb250cm9sbGVyID0gZGF5VHBsQ29udHJvbGxlcjtcbiAgICBkYXkudGltZWxpbmVUcGxDb250cm9sbGVyID0gdGltZWxpbmVUcGxDb250cm9sbGVyO1xuXG4gICAgZGF5LmV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgIGNvbnN0IGVsID0gdGhpcy5nZXRFdmVudEVsZW1lbnQoZXZlbnQpO1xuICAgICAgZXZlbnQuZWxlbWVudCA9IGVsO1xuICAgICAgdGltZWxpbmVUcGxDb250cm9sbGVyLnJvb3QuYXBwZW5kQ2hpbGQoZWwpO1xuICAgIH0pO1xuXG4gICAgY29udHJvbGxlci5zY2hlZHVsZXIuZGF0ZXMuYXBwZW5kQ2hpbGQoZGF5VHBsQ29udHJvbGxlci5yb290KTtcbiAgICBjb250cm9sbGVyLnNjaGVkdWxlci50aW1lbGluZS5hcHBlbmRDaGlsZCh0aW1lbGluZVRwbENvbnRyb2xsZXIucm9vdCk7XG4gIH0pO1xufTtcblxuSVNNb2RhbC5wcm90b3R5cGUucmVuZGVyRGF5RXZlbnRzID0gZnVuY3Rpb24oZGF5TnVtKSB7XG4gIGNvbnN0IGRheXMgPSB0aGlzLl9kYXlzO1xuICBjb25zdCBkYXkgPSBkYXlzW2RheU51bV07XG4gIGNvbnN0IGRheUFmdGVyID0gZGF5c1tkYXlOdW0rMV0gPyBkYXlzW2RheU51bSsxXSA6IG51bGw7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSB0aGlzLl9pbnN0YW5jZUNvbnRyb2xsZXI7XG5cbiAgY29uc3QgZGF5VHBsQ29udHJvbGxlciA9IGRheVRlbXBsYXRlKHsgdGl0bGU6IGRheS50aXRsZSB9KTtcbiAgY29uc3QgdGltZWxpbmVUcGxDb250cm9sbGVyID0gdGltZWxpbmVUZW1wbGF0ZSgpO1xuICBkYXkuZGF5VHBsQ29udHJvbGxlciA9IGRheVRwbENvbnRyb2xsZXI7XG4gIGRheS50aW1lbGluZVRwbENvbnRyb2xsZXIgPSB0aW1lbGluZVRwbENvbnRyb2xsZXI7XG5cbiAgZGF5LmV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICBjb25zdCBlbCA9IHRoaXMuZ2V0RXZlbnRFbGVtZW50KGV2ZW50KTtcbiAgICBldmVudC5lbGVtZW50ID0gZWw7XG4gICAgdGltZWxpbmVUcGxDb250cm9sbGVyLnJvb3QuYXBwZW5kQ2hpbGQoZWwpO1xuICB9KTtcblxuICBjb250cm9sbGVyLnNjaGVkdWxlci5kYXRlcy5pbnNlcnRCZWZvcmUoZGF5VHBsQ29udHJvbGxlci5yb290LCBkYXlBZnRlciAmJiBkYXlBZnRlci5kYXlUcGxDb250cm9sbGVyLnJvb3QpO1xuICBjb250cm9sbGVyLnNjaGVkdWxlci50aW1lbGluZS5pbnNlcnRCZWZvcmUodGltZWxpbmVUcGxDb250cm9sbGVyLnJvb3QsIGRheUFmdGVyICYmIGRheUFmdGVyLnRpbWVsaW5lVHBsQ29udHJvbGxlci5yb290KTtcbn07XG5cbklTTW9kYWwucHJvdG90eXBlLmJpbmRUb29sdGlwcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9pbnN0YW5jZUNvbnRyb2xsZXIucm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2dCA9PiB7XG4gICAgY29uc3QgZXZlbnRFbGVtZW50ID0gZXZ0LnRhcmdldC5jbG9zZXN0KCcuZXZlbnQnKTtcbiAgICBjb25zdCB0b29sdGlwID0gZXZ0LnRhcmdldC5jbG9zZXN0KCcudG9vbHRpcCcpO1xuICAgIGNvbnN0IGN1cnJlbnRFdmVudEVsZW1lbnQgPSB0aGlzLl90b29sdGlwICYmIHRoaXMuX3Rvb2x0aXAuY2xvc2VzdCgnLmV2ZW50Jyk7XG4gICAgY29uc3QgbmV3RXZlbnRFbGVtZW50Q2xpY2tlZCA9IGN1cnJlbnRFdmVudEVsZW1lbnQhPT1ldmVudEVsZW1lbnQ7XG5cbiAgICBpZiAodG9vbHRpcCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdG9vbHRpcCAmJiB0aGlzLl90b29sdGlwKSB7XG4gICAgICB0aGlzLl90b29sdGlwLmNsYXNzTGlzdC5hZGQoJ25vLWRpc3BsYXknKTtcbiAgICAgIHRoaXMuX3Rvb2x0aXAucmVtb3ZlKCk7XG4gICAgICB0aGlzLl90b29sdGlwID0gbnVsbDtcbiAgICAgIGN1cnJlbnRFdmVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY2xpY2tlZCcpO1xuICAgIH1cblxuICAgIGlmICghZXZlbnRFbGVtZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFuZXdFdmVudEVsZW1lbnRDbGlja2VkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZXZlbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NsaWNrZWQnKTtcbiAgICBjb25zdCBpZCA9ICtldmVudEVsZW1lbnQuZGF0YXNldC5ldmVudElkO1xuICAgIGNvbnN0IGFsbEV2ZW50cyA9IHRoaXMuX2RheXMubWFwKGQ9PmQuZXZlbnRzKS5mbGF0KCk7XG4gICAgY29uc3QgZXZlbnREYXRhID0gYWxsRXZlbnRzLmZpbmQoZT0+ZS5pZD09PWlkKTtcbiAgICBjb25zdCB0b29sdGlwVHBsQ29udHJvbGxlciA9IHRvb2x0aXBUZW1wbGF0ZShldmVudERhdGEpO1xuICAgIGNvbnN0IGVsID0gdG9vbHRpcFRwbENvbnRyb2xsZXIucm9vdDtcbiAgICBldmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoZWwpO1xuICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ25vLWRpc3BsYXknKTtcbiAgICB0aGlzLl90b29sdGlwID0gZWw7XG5cbiAgICB0b29sdGlwVHBsQ29udHJvbGxlci5kZXRhaWxzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgRURNb2RhbC5jcmVhdGUoeyBldmVudElkOiBpZCB9KS5vcGVuKCk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuSVNNb2RhbC5wcm90b3R5cGUuYWRkTmV3RXZlbnQgPSBmdW5jdGlvbihldmVudCkge1xuICBjb25zdCBkYXlGb3VuZCA9IHRoaXMuX2RheXMuZmluZChkYXkgPT4ge1xuICAgIGNvbnN0IGRheTFTdHIgPSBgJHtldmVudC5kYXRlLmdldEZ1bGxZZWFyKCktZXZlbnQuZGF0ZS5nZXRNb250aCgpLWV2ZW50LmRhdGUuZ2V0RGF0ZSgpfWA7XG4gICAgY29uc3QgZGF5MlN0ciA9IGAke2RheS5kYXRlLmdldEZ1bGxZZWFyKCktZGF5LmRhdGUuZ2V0TW9udGgoKS1kYXkuZGF0ZS5nZXREYXRlKCl9YDtcbiAgICByZXR1cm4gZGF5MVN0ciA9PT0gZGF5MlN0cjtcbiAgfSk7XG5cbiAgaWYgKCFkYXlGb3VuZCkgcmV0dXJuO1xuXG4gIGRheUZvdW5kLmV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgY29uc3QgZWwgPSB0aGlzLmdldEV2ZW50RWxlbWVudChldmVudCk7XG4gIGRheUZvdW5kLnRpbWVsaW5lVHBsQ29udHJvbGxlci5yb290LmFwcGVuZENoaWxkKGVsKTtcbn07XG5cbklTTW9kYWwucHJvdG90eXBlLmJpbmREYXRlc01vdmVtZW50ID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSB0aGlzLl9pbnN0YW5jZUNvbnRyb2xsZXI7XG4gIGNvbnN0IGRhdGVVcCA9IGNvbnRyb2xsZXIuc2NoZWR1bGVyLmRhdGVVcDtcbiAgY29uc3QgZGF0ZURvd24gPSBjb250cm9sbGVyLnNjaGVkdWxlci5kYXRlRG93bjtcbiAgY29uc3QgZGF5cyA9IHRoaXMuX2RheXM7XG5cbiAgZGF0ZVVwLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gZGF0ZU1vdmUuY2FsbCh0aGlzLCAndXAnKSk7XG4gIGRhdGVEb3duLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gZGF0ZU1vdmUuY2FsbCh0aGlzLCAnZG93bicpKTtcblxuICBmdW5jdGlvbiBkYXRlTW92ZShkaXJlY3Rpb24pIHtcbiAgICBpZiAoZGlyZWN0aW9uID09ICd1cCcpIHtcbiAgICAgIGNvbnN0IGZpcnN0RGF5ID0gZGF5c1swXS5kYXRlO1xuICAgICAgY29uc3QgcHJldkRheSA9IG5ldyBEYXRlKGZpcnN0RGF5LmdldEZ1bGxZZWFyKCksIGZpcnN0RGF5LmdldE1vbnRoKCksIGZpcnN0RGF5LmdldERhdGUoKSAtIDEsIDApO1xuICAgICAgY29uc3QgcG9zdEJvZHkgPSB7IHN0YXJ0QXQ6IHByZXZEYXksIGVuZEF0OiBmaXJzdERheSB9O1xuXG4gICAgICBodHRwLnBvc3QoJ3NjaGVkdWxlci9nZXRBbGxNeUV2ZW50c0J5RGF5cycsIHBvc3RCb2R5KVxuICAgICAgICAudGhlbigoW2RheV0pID0+IHtcbiAgICAgICAgICBjb25zdCBsYXN0RGF5ID0gZGF5cy5zcGxpY2UoZGF5cy5sZW5ndGggLSAxLCAxKVswXTtcbiAgICAgICAgICBkYXlzLnVuc2hpZnQoZGF5KTtcbiAgICAgICAgICB0aGlzLnByb2Nlc3NEYXkoZGF5KTtcbiAgICAgICAgICB0aGlzLnJlbmRlckRheUV2ZW50cygwKTtcbiAgICAgICAgICBcbiAgICAgICAgICBjb25zdCB0aW1lc3RyaXAgPSBsYXN0RGF5LnRpbWVsaW5lVHBsQ29udHJvbGxlci5yb290LnF1ZXJ5U2VsZWN0b3IoJy50aW1lc3RyaXAnKTtcblxuICAgICAgICAgIGlmICh0aW1lc3RyaXApIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVzdHJpcC5lbCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl90aW1lc3RyaXAuZGF5ID0gbnVsbDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsYXN0RGF5LmRheVRwbENvbnRyb2xsZXIucm9vdC5yZW1vdmUoKTtcbiAgICAgICAgICBsYXN0RGF5LnRpbWVsaW5lVHBsQ29udHJvbGxlci5yb290LnJlbW92ZSgpO1xuXG4gICAgICAgICAgZGF0ZVVwLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICAgICAgICBkYXRlRG93bi5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG5cbiAgICAgICAgICB0aGlzLnJ1bigpO1xuICAgICAgICB9KVxuICAgICAgO1xuXG4gICAgICBkYXRlVXAuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuICAgICAgZGF0ZURvd24uc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuICAgIH1cblxuICAgIGlmIChkaXJlY3Rpb24gPT0gJ2Rvd24nKSB7XG4gICAgICBjb25zdCBsYXN0RGF5ID0gZGF5c1tkYXlzLmxlbmd0aC0xXS5kYXRlO1xuICAgICAgY29uc3QgbmV4dERheSA9IG5ldyBEYXRlKGxhc3REYXkuZ2V0RnVsbFllYXIoKSwgbGFzdERheS5nZXRNb250aCgpLCBsYXN0RGF5LmdldERhdGUoKSArIDEsIDApO1xuICAgICAgY29uc3Qgbk5leHREYXkgPSBuZXcgRGF0ZShsYXN0RGF5LmdldEZ1bGxZZWFyKCksIGxhc3REYXkuZ2V0TW9udGgoKSwgbGFzdERheS5nZXREYXRlKCkgKyAyLCAwKTtcbiAgICAgIGNvbnN0IHBvc3RCb2R5ID0geyBzdGFydEF0OiBuZXh0RGF5LCBlbmRBdDogbk5leHREYXkgfTtcblxuICAgICAgaHR0cC5wb3N0KCdzY2hlZHVsZXIvZ2V0QWxsTXlFdmVudHNCeURheXMnLCBwb3N0Qm9keSlcbiAgICAgICAgLnRoZW4oKFtkYXldKSA9PiB7XG4gICAgICAgICAgY29uc3QgZmlyc3REYXkgPSBkYXlzLnNwbGljZSgwLCAxKVswXTtcbiAgICAgICAgICBkYXlzLnB1c2goZGF5KTtcbiAgICAgICAgICB0aGlzLnByb2Nlc3NEYXkoZGF5KTtcbiAgICAgICAgICB0aGlzLnJlbmRlckRheUV2ZW50cyhkYXlzLmxlbmd0aC0xKTtcblxuICAgICAgICAgIGNvbnN0IHRpbWVzdHJpcCA9IGZpcnN0RGF5LnRpbWVsaW5lVHBsQ29udHJvbGxlci5yb290LnF1ZXJ5U2VsZWN0b3IoJy50aW1lc3RyaXAnKTtcblxuICAgICAgICAgIGlmICh0aW1lc3RyaXApIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVzdHJpcC5lbCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl90aW1lc3RyaXAuZGF5ID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgZmlyc3REYXkuZGF5VHBsQ29udHJvbGxlci5yb290LnJlbW92ZSgpO1xuICAgICAgICAgIGZpcnN0RGF5LnRpbWVsaW5lVHBsQ29udHJvbGxlci5yb290LnJlbW92ZSgpO1xuXG4gICAgICAgICAgZGF0ZVVwLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICAgICAgICBkYXRlRG93bi5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgdGhpcy5ydW4oKTtcbiAgICAgICAgfSlcbiAgICAgIDtcblxuICAgICAgZGF0ZVVwLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgICAgIGRhdGVEb3duLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgICB9XG4gIH1cbn07XG5cbklTTW9kYWwucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgZWwgPSB0aGlzLl9pbnN0YW5jZUNvbnRyb2xsZXIucm9vdDtcbiAgaWYgKCFlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2Rpc3BsYXkteWVzJykpIHtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5LXllcycpO1xuICB9XG4gIGlmICghdGhpcy5faXNJbml0KSB7XG4gICAgdGhpcy5faW5zdGFuY2VDb250cm9sbGVyLnNjaGVkdWxlci5nZW5lcmF0ZUhvdXJzTWFya3MoKTtcbiAgICB0aGlzLl9pbnN0YW5jZUNvbnRyb2xsZXIuc2NoZWR1bGVyLmdlbmVyYXRlU3RyaXBzKCk7XG4gICAgdGhpcy5jYWxjU2l6ZXMoKTtcbiAgICB0aGlzLl9pc0luaXQgPSB0cnVlO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuSVNNb2RhbC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgZWwgPSB0aGlzLl9pbnN0YW5jZUNvbnRyb2xsZXIucm9vdDtcbiAgaWYgKGVsLmNsYXNzTGlzdC5jb250YWlucygnZGlzcGxheS15ZXMnKSkge1xuICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc3BsYXkteWVzJyk7XG4gIH1cbiAgaWYgKHRoaXMuX2Rlc3Ryb3lPbkNsb3NlKSB7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH1cbiAgY29uc3QgY2xvc2VFdmVudCA9IG5ldyBDdXN0b21FdmVudCgnY2xvc2UnKTtcbiAgZWwuZGlzcGF0Y2hFdmVudChjbG9zZUV2ZW50KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5JU01vZGFsLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2luc3RhbmNlQ29udHJvbGxlci5yb290LnJlbW92ZSgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogb3B0aW9ucyA9PiBuZXcgSVNNb2RhbChvcHRpb25zKVxufTtcbn0se1wiLi4vY3JlYXRlLWV2ZW50LW1vZGFsXCI6MTIsXCIuLi9ldmVudC1kZXRhaWxzLW1vZGFsXCI6MTYsXCIuLi9tYWluL2Z1bmN0aW9uc1wiOjI3LFwiLi4vbWFpbi90ZW1wbGF0ZXNcIjozMyxcIi4vaW5kZXgudHBsXCI6MjAsXCIuL3RlbXBsYXRlc1wiOjIxLFwiY3NwLWFwcC9saWJzL2h0dHBcIjo3M31dLDIwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IG1vZGFsVGVtcGxhdGUgPSByZXF1aXJlKCcuLi9tYWluL21vZGFsLnRwbCcpO1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5jb25zdCB7Z2VuZXJhdGVIb3Vyc01hcmtzLCBnZW5lcmF0ZVN0cmlwc30gPSByZXF1aXJlKCcuLi9tYWluL2dyaWQnKTtcblxuY29uc3Qgc2lkZWJhclRwbCA9IC8qaHRtbCovYFxuXG5gO1xuXG5jb25zdCBzY2hlZHVsZXJUcGwgPSAvKmh0bWwqL2BcbiAgPGRpdiBjbGFzcz1cImNtcF9pbmQtc2NoZWR1bGVyXCI+XG4gICAgPGRpdiBjbGFzcz1cInNjaGVkdWxlci1jb250YWluZXJcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJvcGVuLUNFTW9kYWwtd3JhcHBlclwiPlxuICAgICAgICBDbGljayA8YnV0dG9uIGlkPVwib3Blbi1DRU1vZGFsXCIgY2xhc3M9XCJidG4tcHJpbWFyeVwiPmhlcmU8L2J1dHRvbj4gdG8gb3BlbiBjcmVhdGUgZXZlbnQgd2luZG93XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzY2hlZHVsZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImxlZnRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF0ZS1tb3ZlIGRhdGUtdXAtd3JhcHBlclwiPlxuICAgICAgICAgICAgPGJ1dHRvbj48aSBjbGFzcz1cImkgaS1zb3J0XCI+PC9pPjwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImRhdGVzXCI+PC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF0ZS1tb3ZlIGRhdGUtZG93bi13cmFwcGVyXCI+XG4gICAgICAgICAgICA8YnV0dG9uPjxpIGNsYXNzPVwiaSBpLXNvcnRcIj48L2k+PC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBcbiAgICAgICAgPGRpdiBjbGFzcz1cInJpZ2h0XCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInN0cmlwc1wiPjwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lbGluZS1oXCI+PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInRpbWVsaW5lLWJcIj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG5gO1xuXG5mdW5jdGlvbiB0ZW1wbGF0ZSgpIHtcbiAgY29uc3QgbW9kYWxUcGxDb250cm9sbGVyID0gbW9kYWxUZW1wbGF0ZSgpO1xuICBjb25zdCBzY2hlZHVsZXIgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoc2NoZWR1bGVyVHBsKTtcblxuICBjb25zdCBkYXRlVXAgPSBzY2hlZHVsZXIucXVlcnlTZWxlY3RvcignLmRhdGUtdXAtd3JhcHBlciBidXR0b24nKTtcbiAgY29uc3QgZGF0ZURvd24gPSBzY2hlZHVsZXIucXVlcnlTZWxlY3RvcignLmRhdGUtZG93bi13cmFwcGVyIGJ1dHRvbicpO1xuICBjb25zdCBkYXRlcyA9IHNjaGVkdWxlci5xdWVyeVNlbGVjdG9yKCcuZGF0ZXMnKTtcbiAgY29uc3QgdGltZWxpbmVIZWFkZXIgPSBzY2hlZHVsZXIucXVlcnlTZWxlY3RvcignLnRpbWVsaW5lLWgnKTtcbiAgY29uc3QgdGltZWxpbmVCb2R5ID0gc2NoZWR1bGVyLnF1ZXJ5U2VsZWN0b3IoJy50aW1lbGluZS1iJyk7XG4gIGNvbnN0IHN0cmlwcyA9IHNjaGVkdWxlci5xdWVyeVNlbGVjdG9yKCcuc3RyaXBzJyk7XG4gIGNvbnN0IG9wZW5DRU1vZGFsQnRuID0gc2NoZWR1bGVyLnF1ZXJ5U2VsZWN0b3IoJyNvcGVuLUNFTW9kYWwnKTtcblxuICBtb2RhbFRwbENvbnRyb2xsZXIuY29udGVudC5hcHBlbmRDaGlsZChzY2hlZHVsZXIpO1xuXG4gIHJldHVybiB7XG4gICAgLi4ubW9kYWxUcGxDb250cm9sbGVyLFxuICAgIG9wZW5DRU1vZGFsQnRuLFxuICAgIHNjaGVkdWxlcjoge1xuICAgICAgcm9vdDogc2NoZWR1bGVyLFxuICAgICAgZGF0ZVVwLFxuICAgICAgZGF0ZURvd24sXG4gICAgICBkYXRlcywgICAgICBcbiAgICAgIHRpbWVsaW5lOiB0aW1lbGluZUJvZHksXG4gICAgICByaWdodDogc2NoZWR1bGVyLnF1ZXJ5U2VsZWN0b3IoJy5yaWdodCcpLFxuICAgICAgZ2VuZXJhdGVIb3Vyc01hcmtzOiBnZW5lcmF0ZUhvdXJzTWFya3ModGltZWxpbmVIZWFkZXIpLFxuICAgICAgZ2VuZXJhdGVTdHJpcHM6IGdlbmVyYXRlU3RyaXBzKHN0cmlwcylcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG59LHtcIi4uL21haW4vZ3JpZFwiOjI4LFwiLi4vbWFpbi9tb2RhbC50cGxcIjozMSxcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo4Mn1dLDIxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHRpbWVzdHJpcFRlbXBsYXRlID0gcmVxdWlyZSgnLi90aW1lc3RyaXAudHBsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB0aW1lc3RyaXBUZW1wbGF0ZVxufTtcbn0se1wiLi90aW1lc3RyaXAudHBsXCI6MjJ9XSwyMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuZnVuY3Rpb24gdGVtcGxhdGUoZGF0YSkge1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cInRpbWVzdHJpcFwiPlxuICAgICAgPGRpdiBjbGFzcz1cInRpbWVcIj4keyBkYXRhLnRpbWUgfTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImxpbmVcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbiAgY29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcblxuICByZXR1cm4ge1xuICAgIHJvb3Q6IGVsZW1lbnQsXG4gICAgdGltZTogZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcudGltZScpLFxuICAgIGxpbmU6IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmxpbmUnKVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xufSx7XCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6ODJ9XSwyMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5mdW5jdGlvbiBjYWxjT2Zmc2V0KHRpbWVTdGFydCkge1xuICBjb25zdCB0aGlzRGF5XzkwMCA9IG5ldyBEYXRlKHRpbWVTdGFydC5nZXRGdWxsWWVhcigpLCB0aW1lU3RhcnQuZ2V0TW9udGgoKSwgdGltZVN0YXJ0LmdldERhdGUoKSwgdGhpcy5zaXplcy5zdGFydEhvdXIpO1xuICBjb25zdCB0aW1lU3RhcnRNaW51dGVzID0gbmV3IERhdGUoXG4gICAgdGltZVN0YXJ0LmdldEZ1bGxZZWFyKCksIHRpbWVTdGFydC5nZXRNb250aCgpLCB0aW1lU3RhcnQuZ2V0RGF0ZSgpLFxuICAgIHRpbWVTdGFydC5nZXRIb3VycygpLCB0aW1lU3RhcnQuZ2V0TWludXRlcygpXG4gICk7XG4gIGNvbnN0IG1pbnV0ZXNEaWZmID0gKHRpbWVTdGFydE1pbnV0ZXMgLSB0aGlzRGF5XzkwMCkvKDEwMDAqNjApO1xuICByZXR1cm4gbWludXRlc0RpZmYgKiB0aGlzLnNpemVzLm1pbnV0ZSArIHRoaXMuc2l6ZXMubWFyZ2luO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNhbGNPZmZzZXQ7XG59LHt9XSwyNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5mdW5jdGlvbiBjYWxjU2l6ZXMoY29udHJvbGxlck5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IGNvbnRyb2xsZXIgPSB0aGlzW2NvbnRyb2xsZXJOYW1lXTtcblxuICAgIGNvbnN0IHN0YXJ0SG91ciA9IDk7XG4gICAgY29uc3QgZW5kSG91ciA9IDIxO1xuICAgIGNvbnN0IG1hcmdpbiA9IDMwO1xuICAgIGNvbnN0IHdpZHRoID0gY29udHJvbGxlci5zY2hlZHVsZXIudGltZWxpbmUub2Zmc2V0V2lkdGggLSBtYXJnaW4qMjtcbiAgICBjb25zdCBtaW51dGUgPSAod2lkdGgpLygoZW5kSG91ciAtIHN0YXJ0SG91cikqNjApO1xuXG4gICAgdGhpcy5zaXplcyA9IHtcbiAgICAgIHN0YXJ0SG91cixcbiAgICAgIGVuZEhvdXIsXG4gICAgICB3aWR0aCxcbiAgICAgIG1hcmdpbixcbiAgICAgIG1pbnV0ZVxuICAgIH07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjYWxjU2l6ZXM7XG59LHt9XSwyNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5mdW5jdGlvbiBjYWxjV2lkdGgodGltZVN0YXJ0LCB0aW1lRW5kKSB7XG4gIGNvbnN0IHRpbWVTdGFydE1pbnV0ZXMgPSBuZXcgRGF0ZShcbiAgICB0aW1lU3RhcnQuZ2V0RnVsbFllYXIoKSwgdGltZVN0YXJ0LmdldE1vbnRoKCksIHRpbWVTdGFydC5nZXREYXRlKCksXG4gICAgdGltZVN0YXJ0LmdldEhvdXJzKCksIHRpbWVTdGFydC5nZXRNaW51dGVzKClcbiAgKTtcbiAgY29uc3QgdGltZUVuZE1pbnV0ZXMgPSBuZXcgRGF0ZShcbiAgICB0aW1lRW5kLmdldEZ1bGxZZWFyKCksIHRpbWVFbmQuZ2V0TW9udGgoKSwgdGltZUVuZC5nZXREYXRlKCksXG4gICAgdGltZUVuZC5nZXRIb3VycygpLCB0aW1lRW5kLmdldE1pbnV0ZXMoKVxuICApO1xuICBjb25zdCBtaW51dGVzRGlmZiA9ICh0aW1lRW5kTWludXRlcyAtIHRpbWVTdGFydE1pbnV0ZXMpLygxMDAwKjYwKTtcbiAgcmV0dXJuIG1pbnV0ZXNEaWZmICogdGhpcy5zaXplcy5taW51dGU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2FsY1dpZHRoO1xufSx7fV0sMjY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2V2ZW50VGVtcGxhdGV9ID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzJyk7XG5cbmZ1bmN0aW9uIGdldEV2ZW50RWxlbWVudChldmVudCkge1xuICBjb25zdCBldmVudFRwbENvbnRyb2xsZXIgPSBldmVudFRlbXBsYXRlKHsgaWQ6IGV2ZW50LmlkIH0pO1xuICBjb25zdCBlbCA9IGV2ZW50VHBsQ29udHJvbGxlci5yb290O1xuICBjb25zdCB0aW1lRnJvbSA9IGV2ZW50Wyd0aW1lX2Zyb20nXSA/IGV2ZW50Wyd0aW1lX2Zyb20nXSA6IGV2ZW50LnRpbWUuZnJvbTtcbiAgY29uc3QgdGltZVRvID0gZXZlbnRbJ3RpbWVfdG8nXSA/IGV2ZW50Wyd0aW1lX3RvJ10gOiBldmVudC50aW1lLnRvO1xuICBjb25zdCBvZmZzZXQgPSB0aGlzLmNhbGNPZmZzZXQodGltZUZyb20pO1xuICBjb25zdCB3aWR0aCA9IHRoaXMuY2FsY1dpZHRoKHRpbWVGcm9tLCB0aW1lVG8pO1xuICBlbC5zdHlsZS5sZWZ0ID0gb2Zmc2V0ICsgJ3B4JztcbiAgZWwuc3R5bGUud2lkdGggPSB3aWR0aCArICdweCc7XG4gIHJldHVybiBlbDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRFdmVudEVsZW1lbnQ7XG59LHtcIi4uL3RlbXBsYXRlc1wiOjMzfV0sMjc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgY2FsY1NpemVzID0gcmVxdWlyZSgnLi9jYWxjU2l6ZXMnKTtcbmNvbnN0IGNhbGNPZmZzZXQgPSByZXF1aXJlKCcuL2NhbGNPZmZzZXQnKTtcbmNvbnN0IGNhbGNXaWR0aCA9IHJlcXVpcmUoJy4vY2FsY1dpZHRoJyk7XG5jb25zdCBnZXRFdmVudEVsZW1lbnQgPSByZXF1aXJlKCcuL2dldEV2ZW50RWxlbWVudCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY2FsY1NpemVzLFxuICBjYWxjT2Zmc2V0LFxuICBjYWxjV2lkdGgsXG4gIGdldEV2ZW50RWxlbWVudFxufTtcbn0se1wiLi9jYWxjT2Zmc2V0XCI6MjMsXCIuL2NhbGNTaXplc1wiOjI0LFwiLi9jYWxjV2lkdGhcIjoyNSxcIi4vZ2V0RXZlbnRFbGVtZW50XCI6MjZ9XSwyODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7cmFuZ2V9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiBnZW5lcmF0ZUhvdXJzTWFya3ModGltZWxpbmVIZWFkZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IGluaXRNYXJnaW4gPSAzMDtcbiAgICBjb25zdCB3aWR0aCA9IHRpbWVsaW5lSGVhZGVyLm9mZnNldFdpZHRoO1xuICAgIGNvbnN0IG51bXMgPSByYW5nZSg5LCAyMSk7XG4gICAgY29uc3Qgb2Zmc2V0ID0gKHdpZHRoIC0gaW5pdE1hcmdpbioyKS8obnVtcy5sZW5ndGgtMSk7XG4gICAgY29uc3QgZWxlbWVudHMgPSBudW1zLm1hcChudW0gPT4ge1xuICAgICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBkaXYuY2xhc3NMaXN0LmFkZCgnaG91cicpO1xuICAgICAgZGl2LnRleHRDb250ZW50ID0gbnVtO1xuICAgICAgcmV0dXJuIGRpdjtcbiAgICB9KTtcbiAgICBsZXQgc3VtID0gMDtcblxuICAgIHN1bSArPSBpbml0TWFyZ2luO1xuICAgIHRpbWVsaW5lSGVhZGVyLmFwcGVuZENoaWxkKGVsZW1lbnRzWzBdKTtcbiAgICBlbGVtZW50c1swXS50ZXh0Q29udGVudCA9IG51bXNbMF07XG4gICAgY29uc3Qgd2lkdGgwID0gZWxlbWVudHNbMF0ub2Zmc2V0V2lkdGg7XG4gICAgXG4gICAgZWxlbWVudHNbMF0uc3R5bGUubGVmdCA9IChzdW0td2lkdGgwLzIpICsgJ3B4JztcbiAgICBlbGVtZW50cy5zbGljZSgxKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgIHN1bSArPSBvZmZzZXQ7XG4gICAgICB0aW1lbGluZUhlYWRlci5hcHBlbmRDaGlsZChlbCk7XG4gICAgICBjb25zdCB3aWR0aCA9IGVsLm9mZnNldFdpZHRoO1xuICAgICAgZWwuc3R5bGUubGVmdCA9IChzdW0gLSB3aWR0aC8yKSArICdweCc7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVTdHJpcHMoc3RyaXBzV3JhcHBlcikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgaW5pdE1hcmdpbiA9IDMwO1xuICAgIGNvbnN0IHdpZHRoID0gc3RyaXBzV3JhcHBlci5vZmZzZXRXaWR0aDtcbiAgICBjb25zdCBudW1zID0gcmFuZ2UoOSwgMjEpO1xuICAgIGNvbnN0IG9mZnNldCA9ICh3aWR0aCAtIGluaXRNYXJnaW4qMikvKG51bXMubGVuZ3RoLTEpO1xuICAgIGxldCBzdW0gPSAwO1xuXG4gICAgY29uc3Qgc3RyaXBzID0gbnVtcy5tYXAobnVtID0+IHtcbiAgICAgIGNvbnN0IHN0cmlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBzdHJpcC5jbGFzc0xpc3QuYWRkKCdzdHJpcCcpO1xuICAgICAgcmV0dXJuIHN0cmlwO1xuICAgIH0pO1xuXG4gICAgc3VtICs9IGluaXRNYXJnaW47XG5cbiAgICBzdHJpcHMuZm9yRWFjaChzdHJpcCA9PiB7XG4gICAgICBzdHJpcC5zdHlsZS5sZWZ0ID0gc3VtICsgJ3B4JztcbiAgICAgIHN0cmlwc1dyYXBwZXIuYXBwZW5kQ2hpbGQoc3RyaXApO1xuICAgICAgc3VtICs9IG9mZnNldDtcbiAgICB9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2VuZXJhdGVIb3Vyc01hcmtzLFxuICBnZW5lcmF0ZVN0cmlwc1xufTtcbn0se1wiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjgyfV0sMjk6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgdGVtcGxhdGUgPSByZXF1aXJlKCcuL2luZGV4LnRwbCcpO1xuY29uc3QgSVNNb2RhbCA9IHJlcXVpcmUoJy4uL2luZGl2aWR1YWwtc2NoZWR1bGVyJyk7XG5jb25zdCBTU01vZGFsID0gcmVxdWlyZSgnLi4vc2hhcmVkLXNjaGVkdWxlcicpO1xuXG5jb25zdCBTY2hlZHVsZXJDb21wb25lbnQgPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgdHBsQ29udHJvbGxlciA9IHRlbXBsYXRlKCk7XG4gIGxldCBJU01vZGFsSW5zdGFuY2UgPSBudWxsO1xuICBsZXQgU1NNb2RhbEluc3RhbmNlID0gbnVsbDtcblxuICB0cGxDb250cm9sbGVyLmJ0bk9wZW5JbmRTY2guYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgaWYgKCFJU01vZGFsSW5zdGFuY2UpIHtcbiAgICAgIElTTW9kYWxJbnN0YW5jZSA9IElTTW9kYWwuY3JlYXRlKHsgZGVzdHJveU9uQ2xvc2U6IHRydWUgfSk7XG4gICAgICBJU01vZGFsSW5zdGFuY2Uucm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsICgpID0+IHtcbiAgICAgICAgSVNNb2RhbEluc3RhbmNlID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBJU01vZGFsSW5zdGFuY2Uub3BlbigpO1xuICB9KTtcblxuICB0cGxDb250cm9sbGVyLmJ0bk9wZW5TaFNjaC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBpZiAoIVNTTW9kYWxJbnN0YW5jZSkge1xuICAgICAgU1NNb2RhbEluc3RhbmNlID0gU1NNb2RhbC5jcmVhdGUoeyBkZXN0cm95T25DbG9zZTogdHJ1ZSB9KTtcbiAgICAgIFNTTW9kYWxJbnN0YW5jZS5lbGVtZW50cy5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICBTU01vZGFsSW5zdGFuY2UgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIFNTTW9kYWxJbnN0YW5jZS5vcGVuKCk7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgc3VjY2VzczogdHJ1ZSxcbiAgICBjb250cm9sbGVyOiB7XG4gICAgICBlbGVtZW50OiB0cGxDb250cm9sbGVyLnJvb3RcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNjaGVkdWxlckNvbXBvbmVudDtcbn0se1wiLi4vaW5kaXZpZHVhbC1zY2hlZHVsZXJcIjoxOSxcIi4uL3NoYXJlZC1zY2hlZHVsZXJcIjozOSxcIi4vaW5kZXgudHBsXCI6MzB9XSwzMDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuZnVuY3Rpb24gdGVtcGxhdGUoKSB7XG4gIGNvbnN0IGh0bWwgPSAvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwiY21wX3NjaGVkdWxlci1kYm9hcmRcIj5cbiAgICAgIDxidXR0b24gaWQ9XCJidG4tb3Blbi1pbmRTY2hcIj5PcGVuIGluZGl2aWR1YWwgc2NoZWR1bGVyPGJ1dHRvbj5cbiAgICAgIDxidXR0b24gaWQ9XCJidG4tb3Blbi1zaFNjaFwiPk9wZW4gc2hhcmVkIHNjaGVkdWxlcjwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICBgO1xuICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKGh0bWwpO1xuICBjb25zdCBidG5PcGVuSW5kU2NoID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcjYnRuLW9wZW4taW5kU2NoJyk7XG4gIGNvbnN0IGJ0bk9wZW5TaFNjaCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignI2J0bi1vcGVuLXNoU2NoJyk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBlbGVtZW50LFxuICAgIGJ0bk9wZW5JbmRTY2g6IGJ0bk9wZW5JbmRTY2gsXG4gICAgYnRuT3BlblNoU2NoOiBidG5PcGVuU2hTY2hcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcbn0se1wiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjgyfV0sMzE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKCkge1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cImNtcF9zY2hlZHVsZXJcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzaWRlYmFyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJiYWNrLXdyYXBwZXIgbW9kYWwtY2xvc2VcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYmFjay1pY29uXCI+PGkgY2xhc3M9XCJpIGktYXJyb3dcIj48L2k+PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImJhY2stbGFiZWxcIj5CYWNrIHRvIGRhc2hib2FyZDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnRcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbiAgY29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcbiAgY29uc3QgY2xvc2VCdG4gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tb2RhbC1jbG9zZScpO1xuICBjb25zdCBzaWRlYmFyID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2lkZWJhcicpO1xuICBjb25zdCBjb250ZW50ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudCcpO1xuICBcbiAgcmV0dXJuIHtcbiAgICByb290OiBlbGVtZW50LFxuICAgIGNsb3NlQnRuLFxuICAgIHNpZGViYXIsXG4gICAgY29udGVudFxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xufSx7XCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6ODJ9XSwzMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuZnVuY3Rpb24gdGVtcGxhdGUoZXZlbnQpIHtcbiAgY29uc3QgaHRtbCA9IC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCJldmVudFwiIGRhdGEtZXZlbnQtaWQ9XCIkeyBldmVudC5pZCB9XCI+PC9kaXY+XG4gIGA7XG4gIGNvbnN0IGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoaHRtbCk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBlbGVtZW50XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo4Mn1dLDMzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHBhcnRpY2lwYW50UGlsbFRlbXBsYXRlID0gcmVxdWlyZSgnLi9wYXJ0aWNpcGFudC1waWxsLnRwbCcpO1xuY29uc3QgZXZlbnRUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vZXZlbnQudHBsJyk7XG5jb25zdCB0aW1lbGluZVRpdGxlVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RpbWVsaW5lLXRpdGxlLnRwbCcpO1xuY29uc3QgdGltZWxpbmVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGltZWxpbmUudHBsJyk7XG5jb25zdCB0b29sdGlwVGVtcGxhdGUgPSByZXF1aXJlKCcuL3Rvb2x0aXAudHBsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBwYXJ0aWNpcGFudFBpbGxUZW1wbGF0ZSxcbiAgZXZlbnRUZW1wbGF0ZSxcbiAgdGltZWxpbmVUaXRsZVRlbXBsYXRlLFxuICB0aW1lbGluZVRlbXBsYXRlLFxuICB0b29sdGlwVGVtcGxhdGVcbn07XG59LHtcIi4vZXZlbnQudHBsXCI6MzIsXCIuL3BhcnRpY2lwYW50LXBpbGwudHBsXCI6MzQsXCIuL3RpbWVsaW5lLXRpdGxlLnRwbFwiOjM1LFwiLi90aW1lbGluZS50cGxcIjozNixcIi4vdG9vbHRpcC50cGxcIjozN31dLDM0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiB0ZW1wbGF0ZShwYXJ0aWNpcGFudCkge1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cInBhcnRpY2lwYW50IGJ0bi1wcmltYXJ5XCIgZGF0YS1pZD1cIiR7IHBhcnRpY2lwYW50Wyd1c2VyX2lkJ10gfVwiPlxuICAgICAgPGRpdiBjbGFzcz1cInVzZXItaW5mb1wiPlxuICAgICAgICAkeyBwYXJ0aWNpcGFudFsndXNlcm5hbWUnXSB9XG4gICAgICA8L2Rpdj5cbiAgICAgIFxuICAgICAgPGRpdiBjbGFzcz1cImJ0bi1jbG9zZS13clwiPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuLWNsb3NlXCI+PGkgY2xhc3M9XCJpIGktY2xvc2VcIj48L2k+PC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbiAgY29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcblxuICByZXR1cm4ge1xuICAgIHJvb3Q6IGVsZW1lbnQsXG4gICAgY2xvc2VCdG46IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi1jbG9zZScpXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo4Mn1dLDM1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiB0ZW1wbGF0ZShkYXRhKSB7XG4gIGNvbnN0IGh0bWwgPSAvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwiZGF0ZVwiPiR7IGRhdGEudGl0bGUgfTwvZGl2PlxuICBgO1xuICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKGh0bWwpO1xuXG4gIHJldHVybiB7XG4gICAgcm9vdDogZWxlbWVudFxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xufSx7XCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6ODJ9XSwzNjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuZnVuY3Rpb24gdGVtcGxhdGUoKSB7XG4gIGNvbnN0IGh0bWwgPSAvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwidGltZWxpbmVcIj48L2Rpdj5cbiAgYDtcbiAgY29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcblxuICByZXR1cm4ge1xuICAgIHJvb3Q6IGVsZW1lbnRcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcbn0se1wiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjgyfV0sMzc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKGV2ZW50KSB7XG4gIGNvbnN0IHRpbWVGcm9tID0gZXZlbnRbJ3RpbWVfZnJvbSddID8gZXZlbnRbJ3RpbWVfZnJvbSddIDogZXZlbnQudGltZS5mcm9tO1xuICBjb25zdCB0aW1lVG8gPSBldmVudFsndGltZV90byddID8gZXZlbnRbJ3RpbWVfdG8nXSA6IGV2ZW50LnRpbWUudG87XG4gIGNvbnN0IHN0YXJ0c0F0SEggPSB0aW1lRnJvbS5nZXRIb3VycygpLnRvU3RyaW5nKCkubGVuZ3RoID09IDEgPyAnMCcgKyB0aW1lRnJvbS5nZXRIb3VycygpIDogdGltZUZyb20uZ2V0SG91cnMoKTtcbiAgY29uc3Qgc3RhcnRzQXRNTSA9IHRpbWVGcm9tLmdldE1pbnV0ZXMoKS50b1N0cmluZygpLmxlbmd0aCA9PSAxID8gJzAnICsgdGltZUZyb20uZ2V0TWludXRlcygpIDogdGltZUZyb20uZ2V0TWludXRlcygpO1xuICBjb25zdCBlbmRzQXRISCA9IHRpbWVUby5nZXRIb3VycygpLnRvU3RyaW5nKCkubGVuZ3RoID09IDEgPyAnMCcgKyB0aW1lVG8uZ2V0SG91cnMoKSA6IHRpbWVUby5nZXRIb3VycygpO1xuICBjb25zdCBlbmRzQXRNTSA9IHRpbWVUby5nZXRNaW51dGVzKCkudG9TdHJpbmcoKS5sZW5ndGggPT0gMSA/ICcwJyArIHRpbWVUby5nZXRNaW51dGVzKCkgOiB0aW1lVG8uZ2V0TWludXRlcygpO1xuICBjb25zdCB0aW1lUGVyaW9kID0gYCR7IHN0YXJ0c0F0SEggfTokeyBzdGFydHNBdE1NIH0tJHsgZW5kc0F0SEggfTokeyBlbmRzQXRNTSB9YDtcbiAgbGV0IGltcG9ydGFuY2U7XG4gIGxldCBpbXBvcnRhbmNlSGludDtcbiAgbGV0IGRlc2NyaXB0aW9uO1xuXG4gIHN3aXRjaChldmVudC5pbXBvcnRhbmNlKSB7XG4gICAgY2FzZSAnbm9uZSc6XG4gICAgICBpbXBvcnRhbmNlID0gJ3BlYWNlJztcbiAgICAgIGltcG9ydGFuY2VIaW50ID0gJ1RoZSBldmVudCBpcyBub3QgaW1wb3J0YW50JztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Rlc2lyYWJsZSc6XG4gICAgICBpbXBvcnRhbmNlID0gJ3JvY2snO1xuICAgICAgaW1wb3J0YW5jZUhpbnQgPSAnVGhlIGV2ZW50IGlzIGRlc2lyYWJsZSB0byBhdHRlbmQnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaW1wb3J0YW50JzpcbiAgICAgIGltcG9ydGFuY2UgPSAncGFwZXInO1xuICAgICAgaW1wb3J0YW5jZUhpbnQgPSAnVGhlIGV2ZW50IGlzIG9ibGlnYXRvcnkgdG8gYXR0ZW5kJztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBpbXBvcnRhbmNlID0gJ3BlYWNlJztcbiAgICAgIGltcG9ydGFuY2VIaW50ID0gJ1RoZSBldmVudCBpcyBub3QgaW1wb3J0YW50JztcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgaWYgKGV2ZW50LmRlc2NyaXB0aW9uICYmIGV2ZW50LmRlc2NyaXB0aW9uLmxlbmd0aCA+IDE1MCkge1xuICAgIGRlc2NyaXB0aW9uID0gZXZlbnQuZGVzY3JpcHRpb24uc2xpY2UoMCwgMTQ2KSArICcuLi4nO1xuICB9XG4gIGVsc2UgaWYgKCFldmVudC5kZXNjcmlwdGlvbiB8fCBldmVudC5kZXNjcmlwdGlvbi5sZW5ndGggPT0gMCkge1xuICAgIGRlc2NyaXB0aW9uID0gJ05vIGRlc2NyaXB0aW9uIHByb3ZpZGVkJztcbiAgfVxuICBlbHNlIHtcbiAgICBkZXNjcmlwdGlvbiA9IGV2ZW50LmRlc2NyaXB0aW9uO1xuICB9XG5cbiAgY29uc3QgaHRtbCA9IC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCJ0b29sdGlwIG5vLWRpc3BsYXlcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJoZWFkZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInRpdGxlXCI+PGgzPiR7IGV2ZW50LnRpdGxlIH08L2gzPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW1wb3J0YW5jZVwiIHRpdGxlPVwiJHsgaW1wb3J0YW5jZUhpbnQgfVwiPjxpIGNsYXNzPVwiaSBpLWhhbmQtJHsgaW1wb3J0YW5jZSB9XCI+PC9pPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiZGVzY3JpcHRpb25cIj4keyBkZXNjcmlwdGlvbiB9PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiZm9vdGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lXCI+JHsgdGltZVBlcmlvZCB9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpdGVtc1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJpdGVtIGRldGFpbHNcIj48YnV0dG9uIHRpdGxlPVwiU2hvdyBkZXRhaWxzXCI+PGkgY2xhc3M9XCJpIGktaW5mb1wiPjwvaT48L2J1dHRvbj48L2Rpdj5cblxuICAgICAgICAgICR7XG4gICAgICAgICAgICBldmVudC5saW5rID9cbiAgICAgICAgICAgIC8qaHRtbCovYDxkaXYgY2xhc3M9XCJpdGVtIGxpbmtcIiB0aXRsZT1cIiR7IGV2ZW50LmxpbmsgfVwiPjxhIGhyZWY9XCIkeyBldmVudC5saW5rIH1cIj48aSBjbGFzcz1cImkgaS1saW5rXCI+PC9pPjwvYT48L2Rpdj5gIDpcbiAgICAgICAgICAgICcnXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgJHtcbiAgICAgICAgICAgIGV2ZW50Wydwcm9qZWN0X2lkJ10gP1xuICAgICAgICAgICAgLypodG1sKi9gPGRpdiBjbGFzcz1cIml0ZW0gcHJvamVjdFwiIHRpdGxlPVwiUHJvamVjdCdzIHBhZ2VcIj48YSBkYXRhLXJvdXRlPVwiJHsgZXZlbnRbJ3Byb2plY3RfaWQnXSB9XCI+PGkgY2xhc3M9XCJpIGktcHJvamVjdFwiPjwvaT48L2E+PC9kaXY+YCA6XG4gICAgICAgICAgICAnJ1xuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbSBwYXJ0aWNpcGFudHNcIiB0aXRsZT1cIk51bWJlciBvZiBwYXJ0aWNpcGFudHMgKGluY2x1ZGluZyB5b3UpXCI+XG4gICAgICAgICAgICA8aSBjbGFzcz1cImkgaS11c2Vyc1wiPjwvaT4gXG4gICAgICAgICAgICA8c3Bhbj4keyBldmVudFsncGFydGljaXBhbnRzX251bSddIH08L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG4gIGNvbnN0IGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoaHRtbCk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBlbGVtZW50LFxuICAgIGRldGFpbHM6IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmRldGFpbHMgYnV0dG9uJylcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcbn0se1wiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjgyfV0sMzg6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgTW9kYWwgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvbW9kYWxzJyk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiBsaXN0VGVtcGxhdGUoKSB7XG4gIGNvbnN0IGh0bWwgPSAvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwiY21wX3NlbC1wc1wiPjwvZGl2PlxuICBgO1xuICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKGh0bWwpO1xuXG4gIHJldHVybiB7XG4gICAgcm9vdDogZWxlbWVudFxuICB9O1xufVxuXG5mdW5jdGlvbiBwYXJ0aWNpcGFudFRlbXBsYXRlKHBhcnRpY2lwYW50KSB7XG4gIGNvbnN0IHNlbGVjdGVkID0gcGFydGljaXBhbnQuc2VsZWN0ZWQgPyAnc2VsZWN0ZWQnIDogJyc7XG4gIGNvbnN0IHVzZXJuYW1lID0gcGFydGljaXBhbnQueW91ID8gJ1lvdScgOiBwYXJ0aWNpcGFudFsndXNlcm5hbWUnXTtcbiAgY29uc3QgaHRtbCA9IC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCJwYXJ0aWNpcGFudCAkeyBzZWxlY3RlZCB9XCIgZGF0YS1pZD1cIiR7IHBhcnRpY2lwYW50Wyd1c2VyX2lkJ10gfVwiPlxuICAgICAgPGRpdiBjbGFzcz1cInNlbGVjdC1ib3hcIj48aSBjbGFzcz1cImkgaS1jaGVja1wiPjwvaT48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJ1c2VyLWluZm9cIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInVzZXItbmFtZVwiPiR7IHVzZXJuYW1lIH08L2Rpdj5cbiAgICAgICAgJHtcbiAgICAgICAgICBwYXJ0aWNpcGFudFsnYnVzeSddID9cbiAgICAgICAgICAvKmh0bWwqL2A8ZGl2IGNsYXNzPVwiYnVzeVwiPjxpIGNsYXNzPVwiaSBpLWNsb2NrXCI+PC9pPjxzcGFuPkJ1c3k8L3NwYW4+PC9kaXY+YFxuICAgICAgICAgIDogJydcbiAgICAgICAgfVxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG4gIGNvbnN0IGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoaHRtbCk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBlbGVtZW50XG4gIH07XG59XG5cbmZ1bmN0aW9uIFNQTW9kYWwob3B0aW9ucykge1xuICBjb25zdCB7XG4gICAgcGFydGljaXBhbnRzOiBwYXJ0aWNpcGFudHNTZWxlY3RlZCxcbiAgICBkYXRlLFxuICAgIHRpbWVGcm9tLFxuICAgIHRpbWVUb1xuICB9ID0gb3B0aW9ucztcblxuICBjb25zdCBTUE1vZGFsSW5zdGFuY2UgPSBNb2RhbC5jcmVhdGUoe1xuICAgIHR5cGU6ICdzdGFuZGFyZCcsXG4gICAgdGl0bGU6ICdTZWxlY3QgcGFydGljaXBhbnRzJyxcbiAgICB3aWR0aDogMzAwLFxuICAgIGhlaWdodDogMjAwLFxuICAgIGRlZmF1bHRBY3Rpb25zOiB0cnVlLFxuICAgIGRlc3Ryb3lPbkNsb3NlOiB0cnVlXG4gIH0pO1xuXG4gIGNvbnN0IHRwbENvbnRyb2xsZXIgPSBsaXN0VGVtcGxhdGUoKTtcbiAgY29uc3Qgc3VibWl0ID0gU1BNb2RhbEluc3RhbmNlLmVsZW1lbnRzLnN1Ym1pdDtcbiAgY29uc3QgaXNBbGxGcmllbmRzID0gZGF0ZSAmJiB0aW1lRnJvbSAmJiB0aW1lVG87XG4gIGxldCBwYXJ0aWNpcGFudHMgPSBbXTtcbiAgbGV0IHBhcmFtcztcbiAgbGV0IGFwaVVSTCA9ICcnO1xuICBcbiAgU1BNb2RhbEluc3RhbmNlLmVsZW1lbnRzLmJvZHkuYXBwZW5kQ2hpbGQodHBsQ29udHJvbGxlci5yb290KTtcblxuICBpZiAoaXNBbGxGcmllbmRzKSB7XG4gICAgcGFyYW1zID0ge1xuICAgICAgZGF0ZTogZGF0ZS50b1N0cmluZygpLFxuICAgICAgdGltZUZyb206IHRpbWVGcm9tLnRvU3RyaW5nKCksXG4gICAgICB0aW1lVG86IHRpbWVUby50b1N0cmluZygpXG4gICAgfTtcbiAgICBhcGlVUkwgPSAnc2NoZWR1bGVyL2dldEFsbEZyaWVuZHNCYXNlZE9uQXZhaWxhYmlsaXR5JztcbiAgfVxuICBlbHNlIHtcbiAgICBhcGlVUkwgPSAnc2NoZWR1bGVyL2dldEFsbEZyaWVuZHNBbmRNZSc7XG4gIH1cblxuICBodHRwLnBvc3QoYXBpVVJMLCBwYXJhbXMgfHwge30pXG4gICAgLnRoZW4oZnJpZW5kcyA9PiB7XG4gICAgICBmcmllbmRzID0gZnJpZW5kcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIGlmIChhLnlvdSA9PSBmYWxzZSkgcmV0dXJuIDE7XG4gICAgICAgIGlmIChiLnlvdSA9PSBmYWxzZSkgcmV0dXJuIC0xO1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH0pO1xuXG4gICAgICBmcmllbmRzLmZvckVhY2goZnJpZW5kID0+IHtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBwYXJ0aWNpcGFudHNTZWxlY3RlZC5maW5kSW5kZXgocCA9PiBwWyd1c2VyX2lkJ10gPT09IGZyaWVuZFsndXNlcl9pZCddKTtcbiAgICAgICAgZnJpZW5kLnNlbGVjdGVkID0gc2VsZWN0ZWQgPiAtMTtcbiAgICAgICAgcGFydGljaXBhbnRzLnB1c2goZnJpZW5kKTtcbiAgICAgIH0pO1xuXG4gICAgICBwYXJ0aWNpcGFudHMuZm9yRWFjaChwID0+IHtcbiAgICAgICAgY29uc3QgUEl0ZW1UcGxDb250cm9sbGVyID0gcGFydGljaXBhbnRUZW1wbGF0ZShwKTtcbiAgICAgICAgdHBsQ29udHJvbGxlci5yb290LmFwcGVuZENoaWxkKFBJdGVtVHBsQ29udHJvbGxlci5yb290KTtcbiAgICAgIH0pO1xuXG4gICAgICB0cGxDb250cm9sbGVyLnJvb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgICAgICBjb25zdCBwYXJ0aWNpcGFudFRwbCA9IGV2dC50YXJnZXQuY2xvc2VzdCgnLnBhcnRpY2lwYW50Jyk7XG4gICAgICAgIGlmICghcGFydGljaXBhbnRUcGwpIHJldHVybjtcbiAgICAgICAgY29uc3QgdXNlcklkID0gK3BhcnRpY2lwYW50VHBsLmRhdGFzZXQuaWQ7XG4gICAgICAgIGNvbnN0IHBhcnRpY2lwYW50ID0gcGFydGljaXBhbnRzLmZpbmQocCA9PiBwWyd1c2VyX2lkJ10gPT09IHVzZXJJZCk7XG4gICAgICAgIHBhcnRpY2lwYW50LnNlbGVjdGVkID0gIXBhcnRpY2lwYW50LnNlbGVjdGVkO1xuICAgICAgICBwYXJ0aWNpcGFudFRwbC5jbGFzc0xpc3QudG9nZ2xlKCdzZWxlY3RlZCcpO1xuICAgICAgICBkaXNhYmxlT25CdXN5U2VsZWN0ZWQoKTtcbiAgICAgIH0pO1xuXG4gICAgICBzdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBwYXJ0aWNpcGFudHMuZmlsdGVyKHAgPT4gcC5zZWxlY3RlZCk7XG4gICAgICAgIGNvbnN0IHN1Ym1pdEV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCdwYXJ0aWNpcGFudHNTZWxlY3RlZCcsIHsgZGV0YWlsOiB7cGFydGljaXBhbnRzOiBkYXRhfSB9KTtcbiAgICAgICAgU1BNb2RhbEluc3RhbmNlLmVsZW1lbnRzLnJvb3QuZGlzcGF0Y2hFdmVudChzdWJtaXRFdmVudCk7XG4gICAgICAgIFNQTW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIGRpc2FibGVPbkJ1c3lTZWxlY3RlZCgpO1xuICAgIH0pXG4gIDtcblxuICBmdW5jdGlvbiBkaXNhYmxlT25CdXN5U2VsZWN0ZWQoKSB7XG4gICAgY29uc3QgYnVzeVNlbGVjdGVkID0gcGFydGljaXBhbnRzLmZpbmQocCA9PiBwLnNlbGVjdGVkICYmIHBbJ2J1c3knXSk7XG5cbiAgICBpZiAoYnVzeVNlbGVjdGVkICYmICFzdWJtaXQuZ2V0QXR0cmlidXRlKCdkaXNhYmxlZCcpKSB7XG4gICAgICBzdWJtaXQuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuICAgIH1cblxuICAgIGlmICghYnVzeVNlbGVjdGVkICYmIHN1Ym1pdC5nZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJykpIHtcbiAgICAgIHN1Ym1pdC5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFNQTW9kYWxJbnN0YW5jZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogb3B0aW9ucyA9PiBuZXcgU1BNb2RhbChvcHRpb25zKVxufTtcbn0se1wiY3NwLWFwcC9jb21wb25lbnRzL21vZGFsc1wiOjcsXCJjc3AtYXBwL2xpYnMvaHR0cFwiOjczLFwiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjgyfV0sMzk6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge3NjaGVkdWxlclRlbXBsYXRlLCByZXN1bHRzQnV0dG9uVGVtcGxhdGUsIGNvbW1vbkZJVGVtcGxhdGV9ID0gcmVxdWlyZSgnLi90ZW1wbGF0ZXMnKTtcbmNvbnN0IFNQTW9kYWwgPSByZXF1aXJlKCcuLi9zZWxlY3QtcGFydGljaXBhbnRzLW1vZGFsJyk7XG5jb25zdCB7cGFydGljaXBhbnRQaWxsVGVtcGxhdGV9ID0gcmVxdWlyZSgnLi4vbWFpbi90ZW1wbGF0ZXMnKTtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvaHR0cCcpO1xuY29uc3Qge1xuICBjYWxjU2l6ZXMsXG4gIGNhbGNPZmZzZXQsXG4gIGNhbGNXaWR0aCxcbiAgZ2V0RXZlbnRFbGVtZW50XG59ID0gcmVxdWlyZSgnLi4vbWFpbi9mdW5jdGlvbnMnKTtcbmNvbnN0IHtcbiAgdGltZWxpbmVUaXRsZVRlbXBsYXRlLFxuICB0aW1lbGluZVRlbXBsYXRlLFxuICB0b29sdGlwVGVtcGxhdGVcbn0gPSByZXF1aXJlKCcuLi9tYWluL3RlbXBsYXRlcycpO1xuY29uc3QgRURNb2RhbCA9IHJlcXVpcmUoJy4uL2V2ZW50LWRldGFpbHMtbW9kYWwnKTtcbmNvbnN0IHtnZXRDb29yZHMsIGdldE1vbnRoTmFtZX0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmZ1bmN0aW9uIFNTTW9kYWwob3B0aW9ucykge1xuICBjb25zdCB0cGxDb250cm9sbGVyID0gc2NoZWR1bGVyVGVtcGxhdGUoKTtcbiAgdGhpcy5fdHBsQ29udHJvbGxlciA9IHRwbENvbnRyb2xsZXI7XG4gIHRoaXMuX2lzSW5pdCA9IGZhbHNlO1xuICB0aGlzLl9kZXN0cm95T25DbG9zZSA9IG9wdGlvbnMgJiYgb3B0aW9ucy5kZXN0cm95T25DbG9zZTtcbiAgdGhpcy5iaW5kU2ltcGxlRXZlbnRzKCk7XG4gIHRoaXMuYmluZFNQTW9kYWwoKTtcbiAgdGhpcy5iaW5kUGFydGljaXBhbnRzRXZlbnRzKCk7XG4gIHRoaXMuYmluZFNlYXJjaEJ0bigpO1xuICB0aGlzLmJpbmRSZXN1bHRzKCk7XG4gIHRoaXMuYmluZFRvb2x0aXBzKCk7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodHBsQ29udHJvbGxlci5yb290KTtcbiAgdGhpcy5kYXRhID0ge1xuICAgIHBhcnRpY2lwYW50czogW10sXG4gICAgZGF5czogeyBmcm9tOiBudWxsLCB0bzogbnVsbCB9LFxuICAgIHRpbWU6IHtcbiAgICAgIHR5cGU6IG51bGwsXG4gICAgICBmcm9tOiBudWxsLFxuICAgICAgdG86IG51bGwsXG4gICAgICBkdXJhdGlvbjogbnVsbCxcbiAgICAgIGlzVGltZUNoZWNrZWQ6IGZhbHNlXG4gICAgfVxuICB9O1xuICB0aGlzLnJlc3VsdHMgPSBbXTtcbiAgdGhpcy5fdG9vbHRpcCA9IG51bGw7XG5cbiAgcmV0dXJuIHtcbiAgICBvcGVuOiB0aGlzLm9wZW4uYmluZCh0aGlzKSxcbiAgICBjbG9zZTogdGhpcy5jbG9zZS5iaW5kKHRoaXMpLFxuICAgIGRlc3Ryb3k6IHRoaXMuZGVzdHJveS5iaW5kKHRoaXMpLFxuICAgIGVsZW1lbnRzOiB0cGxDb250cm9sbGVyXG4gIH07XG59XG5cblNTTW9kYWwucHJvdG90eXBlLmNhbGNTaXplcyA9IGNhbGNTaXplcygnX3RwbENvbnRyb2xsZXInKTtcblNTTW9kYWwucHJvdG90eXBlLmNhbGNPZmZzZXQgPSBjYWxjT2Zmc2V0O1xuU1NNb2RhbC5wcm90b3R5cGUuY2FsY1dpZHRoPSBjYWxjV2lkdGg7XG5TU01vZGFsLnByb3RvdHlwZS5nZXRFdmVudEVsZW1lbnQgPSBnZXRFdmVudEVsZW1lbnQ7XG5cblNTTW9kYWwucHJvdG90eXBlLmJpbmRTaW1wbGVFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgdHBsQ29udHJvbGxlciA9IHRoaXMuX3RwbENvbnRyb2xsZXI7XG4gIGNvbnN0IHtjbG9zZUJ0bn0gPSB0cGxDb250cm9sbGVyO1xuXG4gIGNsb3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgfSk7XG5cbiAgLy8gbGV0IENFTW9kYWxJbnN0YW5jZSA9IG51bGw7XG5cbiAgLy8gb3BlbkNFTW9kYWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gIC8vICAgaWYgKCFDRU1vZGFsSW5zdGFuY2UpIHtcbiAgLy8gICAgIENFTW9kYWxJbnN0YW5jZSA9IENFTW9kYWwuY3JlYXRlKCk7XG4gIC8vICAgICBDRU1vZGFsSW5zdGFuY2UuZWxlbWVudHMucm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGV2dCA9PiB7XG4gIC8vICAgICAgIENFTW9kYWxJbnN0YW5jZSA9IG51bGw7XG4gIC8vICAgICB9KTtcbiAgLy8gICAgIENFTW9kYWxJbnN0YW5jZS5lbGVtZW50cy5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2V2ZW50Q3JlYXRlZCcsIGV2dCA9PiB7XG4gIC8vICAgICAgIENFTW9kYWxJbnN0YW5jZSA9IG51bGw7XG4gIC8vICAgICAgIHRoaXMuYWRkTmV3RXZlbnQoZXZ0LmRldGFpbCk7XG4gIC8vICAgICB9KTtcbiAgLy8gICB9XG5cbiAgLy8gICBDRU1vZGFsSW5zdGFuY2Uub3BlbigpO1xuICAvLyB9KTtcblxuICBjb25zdCB0aW1lT3B0aW9ucyA9IHRwbENvbnRyb2xsZXIuc2lkZWJhci50aW1lLm9wdGlvbnM7XG4gIGNvbnN0IHRpbWVJbnB1dHMgPSB0cGxDb250cm9sbGVyLnNpZGViYXIudGltZS5pbnB1dHM7XG4gIGNvbnN0IGZpeGVkT3B0aW9uID0gdGltZU9wdGlvbnMuZml4ZWQ7XG4gIGNvbnN0IGZsb2F0aW5nT3B0aW9uID0gdGltZU9wdGlvbnMuZmxvYXRpbmc7XG5cbiAgW2ZpeGVkT3B0aW9uLCBmbG9hdGluZ09wdGlvbl0uZm9yRWFjaChvcHRpb24gPT4ge1xuICAgIG9wdGlvbi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICBjb25zdCB0eXBlID0gb3B0aW9uLnZhbHVlO1xuICAgICAgY29uc3Qgb3Bwb3NpdGVUeXBlID0gT2JqZWN0LmtleXModGltZU9wdGlvbnMpLmZpbmQob3B0PT5vcHQhPXR5cGUpO1xuICAgICAgdGhpcy5kYXRhLnRpbWUudHlwZSA9IHR5cGU7XG4gICAgICB0aW1lSW5wdXRzW3R5cGVdLnJvb3QuY2xhc3NMaXN0LnJlbW92ZSgnbm8tZGlzcGxheScpO1xuICAgICAgdGltZUlucHV0c1tvcHBvc2l0ZVR5cGVdLnJvb3QuY2xhc3NMaXN0LmFkZCgnbm8tZGlzcGxheScpO1xuICAgIH0pO1xuICB9KTtcblxuICBjb25zdCBkYXlzRnJvbSA9IHRwbENvbnRyb2xsZXIuc2lkZWJhci5kYXlzLmZyb207XG4gIGNvbnN0IGRheXNUbyA9IHRwbENvbnRyb2xsZXIuc2lkZWJhci5kYXlzLnRvO1xuICBjb25zdCB0aW1lRnJvbSA9IHRpbWVJbnB1dHMuZmxvYXRpbmcuZnJvbTtcbiAgY29uc3QgdGltZVRvID0gdGltZUlucHV0cy5mbG9hdGluZy50bztcbiAgY29uc3QgdGltZUR1cmF0aW9uID0gdGltZUlucHV0cy5maXhlZC52YWx1ZTtcbiAgY29uc3QgaXNUaW1lQ2hlY2tlZCA9IHRwbENvbnRyb2xsZXIuc2lkZWJhci50aW1lLmlzVGltZUNoZWNrZWQ7XG4gIGNvbnN0IHRpbWVTcGFuID0gdHBsQ29udHJvbGxlci5zaWRlYmFyLnRpbWUudGltZVNwYW47XG5cbiAgZGF5c0Zyb20uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgY29uc3QgW2RheSwgbW9udGgsIHllYXJdID0gZGF5c0Zyb20udmFsdWUuc3BsaXQoJy8nKTtcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGggLSAxLCBkYXkpO1xuICAgIHRoaXMuZGF0YS5kYXlzLmZyb20gPSBkYXRlO1xuICB9KTtcblxuICBkYXlzVG8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgY29uc3QgW2RheSwgbW9udGgsIHllYXJdID0gZGF5c1RvLnZhbHVlLnNwbGl0KCcvJyk7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoIC0gMSwgZGF5KTtcbiAgICB0aGlzLmRhdGEuZGF5cy50byA9IGRhdGU7XG4gIH0pO1xuXG4gIHRpbWVGcm9tLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgIHRoaXMuZGF0YS50aW1lLmZyb20gPSB0aW1lRnJvbS52YWx1ZTtcbiAgfSk7XG5cbiAgdGltZVRvLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgIHRoaXMuZGF0YS50aW1lLnRvID0gdGltZVRvLnZhbHVlO1xuICB9KTtcblxuICB0aW1lRHVyYXRpb24uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgdGhpcy5kYXRhLnRpbWUuZHVyYXRpb24gPSB0aW1lRHVyYXRpb24udmFsdWU7XG4gIH0pO1xuXG4gIGlzVGltZUNoZWNrZWQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgY29uc3QgY2hlY2tlZCA9IGlzVGltZUNoZWNrZWQuY2hlY2tlZDtcbiAgICB0aGlzLmRhdGEudGltZS5pc1RpbWVDaGVja2VkID0gY2hlY2tlZDtcbiAgICBpZiAoY2hlY2tlZCkgdGltZVNwYW4uY2xhc3NMaXN0LnJlbW92ZSgnbm8tZGlzcGxheScpO1xuICAgIGVsc2UgdGltZVNwYW4uY2xhc3NMaXN0LmFkZCgnbm8tZGlzcGxheScpO1xuICB9KTtcbn07XG5cblNTTW9kYWwucHJvdG90eXBlLnJlbmRlclBhcnRpY2lwYW50cyA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCB7cGFydGljaXBhbnRzfSA9IHRoaXMuZGF0YTtcbiAgY29uc3QgcGxhY2UgPSB0aGlzLl90cGxDb250cm9sbGVyLnNpZGViYXIucGFydGljaXBhbnRzLmJvZHk7XG4gIHBsYWNlLmlubmVySFRNTCA9ICcnO1xuICBwYXJ0aWNpcGFudHMuZm9yRWFjaChwID0+IHtcbiAgICBjb25zdCBwVHBsQ29udHJvbGxlciA9IHBhcnRpY2lwYW50UGlsbFRlbXBsYXRlKHApO1xuICAgIHBsYWNlLmFwcGVuZENoaWxkKHBUcGxDb250cm9sbGVyLnJvb3QpO1xuICB9KTtcbn07XG5cblNTTW9kYWwucHJvdG90eXBlLmJpbmRTUE1vZGFsID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IG9wZW5Nb2RhbEJ0biA9IHRoaXMuX3RwbENvbnRyb2xsZXIuc2lkZWJhci5wYXJ0aWNpcGFudHMuYnV0dG9uO1xuICBsZXQgU1BNb2RhbEluc3RhbmNlID0gbnVsbDtcbiAgXG4gIG9wZW5Nb2RhbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBTUE1vZGFsSW5zdGFuY2UgPSBTUE1vZGFsLmNyZWF0ZSh7XG4gICAgICBwYXJ0aWNpcGFudHM6IHRoaXMuZGF0YS5wYXJ0aWNpcGFudHNcbiAgICB9KTtcblxuICAgIFNQTW9kYWxJbnN0YW5jZS5lbGVtZW50cy5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgZXZ0ID0+IHtcbiAgICAgIFNQTW9kYWxJbnN0YW5jZSA9IG51bGw7XG4gICAgfSk7XG5cbiAgICBTUE1vZGFsSW5zdGFuY2UuZWxlbWVudHMucm9vdC5hZGRFdmVudExpc3RlbmVyKCdwYXJ0aWNpcGFudHNTZWxlY3RlZCcsIGV2dCA9PiB7XG4gICAgICBTUE1vZGFsSW5zdGFuY2UgPSBudWxsO1xuICAgICAgdGhpcy5kYXRhLnBhcnRpY2lwYW50cyA9IGV2dC5kZXRhaWwucGFydGljaXBhbnRzO1xuICAgICAgdGhpcy5yZW5kZXJQYXJ0aWNpcGFudHMoKTtcbiAgICB9KTtcblxuICAgIFNQTW9kYWxJbnN0YW5jZS5vcGVuKCk7XG4gIH0pO1xufTtcblxuU1NNb2RhbC5wcm90b3R5cGUuYmluZFBhcnRpY2lwYW50c0V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl90cGxDb250cm9sbGVyLnNpZGViYXIucGFydGljaXBhbnRzLmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgIGNvbnN0IGNsb3NlQnRuID0gZXZ0LnRhcmdldC5jbG9zZXN0KCcuYnRuLWNsb3NlJyk7XG4gICAgaWYgKCFjbG9zZUJ0bikgcmV0dXJuO1xuICAgIGNvbnN0IHtwYXJ0aWNpcGFudHN9ID0gdGhpcy5kYXRhO1xuICAgIGNvbnN0IHBQaWxsID0gZXZ0LnRhcmdldC5jbG9zZXN0KCcucGFydGljaXBhbnQnKTtcbiAgICBjb25zdCB1c2VySWQgPSArcFBpbGwuZGF0YXNldC5pZDtcbiAgICBjb25zdCBwSWR4ID0gcGFydGljaXBhbnRzLmZpbmRJbmRleChwID0+IHBbJ3VzZXJfaWQnXSA9PSB1c2VySWQpO1xuICAgIHBQaWxsLnJlbW92ZSgpO1xuICAgIHBhcnRpY2lwYW50cy5zcGxpY2UocElkeCwgMSk7XG4gIH0pO1xufTtcblxuU1NNb2RhbC5wcm90b3R5cGUuYmluZFNlYXJjaEJ0biA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBjb250cm9sbGVyID0gdGhpcy5fdHBsQ29udHJvbGxlcjtcbiAgY29udHJvbGxlci5zaWRlYmFyLnNlYXJjaEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmRhdGEpO1xuICAgIGNvbnN0IHBvc3RCb2R5ID0ge1xuICAgICAgcGFydGljaXBhbnRzOiB0aGlzLmRhdGEucGFydGljaXBhbnRzLm1hcChwPT5wWyd1c2VyX2lkJ10pLFxuICAgICAgZGF5czoge1xuICAgICAgICBmcm9tOiB0aGlzLmRhdGEuZGF5cy5mcm9tLFxuICAgICAgICB0bzogdGhpcy5kYXRhLmRheXMudG9cbiAgICAgIH0sXG4gICAgICB0aW1lOiB7XG4gICAgICAgIHR5cGU6IHRoaXMuZGF0YS50aW1lLnR5cGUsXG4gICAgICAgIGZyb206IHRoaXMuZGF0YS50aW1lLmZyb20sXG4gICAgICAgIHRvOiB0aGlzLmRhdGEudGltZS50byxcbiAgICAgICAgZHVyYXRpb246IHRoaXMuZGF0YS50aW1lLmR1cmF0aW9uXG4gICAgICB9XG4gICAgfTtcblxuICAgIGh0dHAucG9zdCgnc2NoZWR1bGVyL2dldFNoYXJlZFNjaGVkdWxlck9iamVjdHMnLCBwb3N0Qm9keSlcbiAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHJlcylcbiAgICAgICAgdGhpcy5yZXN1bHRzID0gcmVzO1xuICAgICAgICB0aGlzLnByb2Nlc3NSZXN1bHRzKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMucmVzdWx0cyk7XG5cbiAgICAgICAgY29udHJvbGxlci5zaWRlYmFyLnJlc3VsdHMuYm9keS5pbm5lckhUTUwgPSAnJztcblxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCB0aGlzLnJlc3VsdHMubGVuZ3RoOyBpZHgrKykge1xuICAgICAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgICAgICBpZDogaWR4LFxuICAgICAgICAgICAgZGF0ZTogdGhpcy5yZXN1bHRzW2lkeF0uZGF0ZSxcbiAgICAgICAgICAgIGhhc0ZyZWVJbnRldmFsczogdGhpcy5yZXN1bHRzW2lkeF0uY29tbW9uRnJlZUludGVydmFscy5sZW5ndGggPiAwXG4gICAgICAgICAgfTtcbiAgICAgICAgICBjb25zdCBidG5UcGxDb250cm9sbGVyID0gcmVzdWx0c0J1dHRvblRlbXBsYXRlKGRhdGEpO1xuICAgICAgICAgIGNvbnRyb2xsZXIuc2lkZWJhci5yZXN1bHRzLmJvZHkuYXBwZW5kQ2hpbGQoYnRuVHBsQ29udHJvbGxlci5yb290KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRyb2xsZXIuc2lkZWJhci5yZXN1bHRzLnJvb3QuY2xhc3NMaXN0LnJlbW92ZSgnbm8tZGlzcGxheScpO1xuICAgICAgfSlcbiAgICA7XG4gIH0pO1xufTtcblxuU1NNb2RhbC5wcm90b3R5cGUucHJvY2Vzc1Jlc3VsdHMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yZXN1bHRzLmZvckVhY2goZGF5ID0+IHtcbiAgICBkYXkuZGF0ZSA9IG5ldyBEYXRlKGRheS5kYXRlKTtcbiAgICBkYXkucGFydGljaXBhbnRzLmZvckVhY2gocCA9PiB7XG4gICAgICBwLmV2ZW50cy5mb3JFYWNoKGUgPT4ge1xuICAgICAgICBlLmRhdGUgPSBuZXcgRGF0ZShlLmRhdGUpO1xuICAgICAgICBlWyd0aW1lX2Zyb20nXSA9IG5ldyBEYXRlKGVbJ3RpbWVfZnJvbSddKTtcbiAgICAgICAgZVsndGltZV90byddID0gbmV3IERhdGUoZVsndGltZV90byddKTtcbiAgICAgIH0pXG4gICAgfSk7XG4gICAgZGF5LmNvbW1vbkZyZWVJbnRlcnZhbHMuZm9yRWFjaChmaSA9PiB7XG4gICAgICBmaS5mcm9tID0gbmV3IERhdGUoZmkuZnJvbSk7XG4gICAgICBmaS50byA9IG5ldyBEYXRlKGZpLnRvKTtcbiAgICB9KTtcbiAgfSk7XG59O1xuXG5TU01vZGFsLnByb3RvdHlwZS5iaW5kUmVzdWx0cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl90cGxDb250cm9sbGVyLnNpZGViYXIucmVzdWx0cy5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBjb25zdCBidG4gPSBldnQudGFyZ2V0LmNsb3Nlc3QoJy5yZXN1bHRzLWJ0bicpO1xuXG4gICAgaWYgKCFidG4pIHJldHVybjtcblxuICAgIGNvbnN0IGlkID0gK2J0bi5kYXRhc2V0LmRheUlkO1xuICAgIGNvbnN0IHNjaGVkdWxlcklkID0gK3RoaXMuX3RwbENvbnRyb2xsZXIubWFpbi5zY2hlZHVsZXIucm9vdC5kYXRhc2V0LmRheUlkO1xuXG4gICAgaWYgKGlkID09IHNjaGVkdWxlcklkKSByZXR1cm47XG5cbiAgICB0aGlzLl90cGxDb250cm9sbGVyLm1haW4uc2NoZWR1bGVyLnJvb3QuZGF0YXNldC5kYXlJZCA9IGlkO1xuICAgIHRoaXMucmVuZGVyU2NoZWR1bGVyKHRoaXMucmVzdWx0c1tpZF0pO1xuICB9KTtcbn07XG5cblNTTW9kYWwucHJvdG90eXBlLnJlbmRlclNjaGVkdWxlciA9IGZ1bmN0aW9uKGRheSkge1xuICBjb25zdCBtYWluID0gdGhpcy5fdHBsQ29udHJvbGxlci5tYWluO1xuICBjb25zdCBzY2hlZHVsZXIgPSBtYWluLnNjaGVkdWxlcjtcbiAgbWFpbi5pbml0aWFsLmNsYXNzTGlzdC5hZGQoJ25vLWRpc3BsYXknKTtcbiAgbWFpbi5sb2FkaW5nLmNsYXNzTGlzdC5hZGQoJ25vLWRpc3BsYXknKTtcbiAgbWFpbi5zY2hlZHVsZXJDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnbm8tZGlzcGxheScpO1xuICBzY2hlZHVsZXIucGFydGljaXBhbnRzLmlubmVySFRNTCA9ICcnO1xuICBzY2hlZHVsZXIudGltZWxpbmVIZWFkZXIuaW5uZXJIVE1MID0gJyc7XG4gIHNjaGVkdWxlci5zdHJpcHMuaW5uZXJIVE1MID0gJyc7XG4gIHNjaGVkdWxlci50aW1lbGluZS5pbm5lckhUTUwgPSAnJztcbiAgc2NoZWR1bGVyLmNvbW1vbkZJcy5pbm5lckhUTUwgPSAnJztcbiAgc2NoZWR1bGVyLmdlbmVyYXRlSG91cnNNYXJrcygpO1xuICBzY2hlZHVsZXIuZ2VuZXJhdGVTdHJpcHMoKTtcbiAgc2NoZWR1bGVyLmRhdGUuaW5uZXJIVE1MID0gYCR7Z2V0TW9udGhOYW1lKGRheS5kYXRlLmdldE1vbnRoKCkpfSwgJHtkYXkuZGF0ZS5nZXREYXRlKCl9YDtcbiAgdGhpcy5jYWxjU2l6ZXMoKTtcbiAgdGhpcy5yZW5kZXJFdmVudHMoZGF5KTtcbiAgdGhpcy5yZW5kZXJGcmVlSW50ZXJ2YWxzKGRheSk7XG59O1xuXG5TU01vZGFsLnByb3RvdHlwZS5yZW5kZXJFdmVudHMgPSBmdW5jdGlvbihkYXkpIHtcbiAgY29uc3QgY29udHJvbGxlciA9IHRoaXMuX3RwbENvbnRyb2xsZXI7XG5cbiAgZGF5LnBhcnRpY2lwYW50cy5mb3JFYWNoKHAgPT4ge1xuICAgIGNvbnN0IHR0VHBsQ29udHJvbGxlciA9IHRpbWVsaW5lVGl0bGVUZW1wbGF0ZSh7IHRpdGxlOiBwLnVzZXJuYW1lIH0pO1xuICAgIGNvbnN0IHRpbWVsaW5lVHBsQ29udHJvbGxlciA9IHRpbWVsaW5lVGVtcGxhdGUoKTtcbiAgICBwLnR0VHBsQ29udHJvbGxlciA9IHR0VHBsQ29udHJvbGxlcjtcbiAgICBwLnRpbWVsaW5lVHBsQ29udHJvbGxlciA9IHRpbWVsaW5lVHBsQ29udHJvbGxlcjtcblxuICAgIHAuZXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgY29uc3QgZWwgPSB0aGlzLmdldEV2ZW50RWxlbWVudChldmVudCk7XG4gICAgICBldmVudC5lbGVtZW50ID0gZWw7XG4gICAgICB0aW1lbGluZVRwbENvbnRyb2xsZXIucm9vdC5hcHBlbmRDaGlsZChlbCk7XG4gICAgfSk7XG5cbiAgICBjb250cm9sbGVyLnNjaGVkdWxlci5wYXJ0aWNpcGFudHMuYXBwZW5kQ2hpbGQodHRUcGxDb250cm9sbGVyLnJvb3QpO1xuICAgIGNvbnRyb2xsZXIuc2NoZWR1bGVyLnRpbWVsaW5lLmFwcGVuZENoaWxkKHRpbWVsaW5lVHBsQ29udHJvbGxlci5yb290KTtcbiAgfSk7XG59O1xuXG5TU01vZGFsLnByb3RvdHlwZS5iaW5kVG9vbHRpcHMgPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgY29udHJvbGxlciA9IHRoaXMuX3RwbENvbnRyb2xsZXI7XG5cbiAgY29udHJvbGxlci5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBjb25zdCBldmVudEVsZW1lbnQgPSBldnQudGFyZ2V0LmNsb3Nlc3QoJy5ldmVudCcpO1xuICAgIGNvbnN0IHRvb2x0aXAgPSBldnQudGFyZ2V0LmNsb3Nlc3QoJy50b29sdGlwJyk7XG4gICAgY29uc3QgY3VycmVudEV2ZW50RWxlbWVudCA9IHRoaXMuX3Rvb2x0aXAgJiYgdGhpcy5fdG9vbHRpcC5jbG9zZXN0KCcuZXZlbnQnKTtcbiAgICBjb25zdCBuZXdFdmVudEVsZW1lbnRDbGlja2VkID0gY3VycmVudEV2ZW50RWxlbWVudCE9PWV2ZW50RWxlbWVudDtcblxuICAgIGlmICh0b29sdGlwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0b29sdGlwICYmIHRoaXMuX3Rvb2x0aXApIHtcbiAgICAgIHRoaXMuX3Rvb2x0aXAuY2xhc3NMaXN0LmFkZCgnbm8tZGlzcGxheScpO1xuICAgICAgdGhpcy5fdG9vbHRpcC5yZW1vdmUoKTtcbiAgICAgIHRoaXMuX3Rvb2x0aXAgPSBudWxsO1xuICAgICAgY3VycmVudEV2ZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdjbGlja2VkJyk7XG4gICAgfVxuXG4gICAgaWYgKCFldmVudEVsZW1lbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIW5ld0V2ZW50RWxlbWVudENsaWNrZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgXG4gICAgZXZlbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NsaWNrZWQnKTtcbiAgICBjb25zdCBkYXlJZCA9ICtjb250cm9sbGVyLm1haW4uc2NoZWR1bGVyLnJvb3QuZGF0YXNldC5kYXlJZDtcbiAgICBjb25zdCBkYXkgPSB0aGlzLnJlc3VsdHNbZGF5SWRdO1xuICAgIGNvbnN0IGlkID0gK2V2ZW50RWxlbWVudC5kYXRhc2V0LmV2ZW50SWQ7XG4gICAgY29uc3QgYWxsRXZlbnRzID0gZGF5LnBhcnRpY2lwYW50cy5tYXAocCA9PiBwLmV2ZW50cykuZmxhdCgpO1xuICAgIGNvbnN0IGV2ZW50RGF0YSA9IGFsbEV2ZW50cy5maW5kKGU9PmUuaWQ9PT1pZCk7XG4gICAgY29uc3QgdG9vbHRpcFRwbENvbnRyb2xsZXIgPSB0b29sdGlwVGVtcGxhdGUoZXZlbnREYXRhKTtcbiAgICBjb25zdCBlbCA9IHRvb2x0aXBUcGxDb250cm9sbGVyLnJvb3Q7XG4gICAgZXZlbnRFbGVtZW50LmFwcGVuZENoaWxkKGVsKTtcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCduby1kaXNwbGF5Jyk7XG4gICAgdGhpcy5fdG9vbHRpcCA9IGVsO1xuXG4gICAgdG9vbHRpcFRwbENvbnRyb2xsZXIuZGV0YWlscy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIEVETW9kYWwuY3JlYXRlKHsgZXZlbnRJZDogaWQgfSkub3BlbigpO1xuICAgIH0pO1xuICB9KTtcbn07XG5cblNTTW9kYWwucHJvdG90eXBlLnJlbmRlckZyZWVJbnRlcnZhbHMgPSBmdW5jdGlvbihkYXkpIHtcbiAgY29uc3QgY29udHJvbGxlciA9IHRoaXMuX3RwbENvbnRyb2xsZXJcbiAgY29uc3QgdGltZWxpbmUgPSBjb250cm9sbGVyLm1haW4uc2NoZWR1bGVyLnRpbWVsaW5lO1xuICBjb25zdCBmaXJzdFRpbWVsaW5lID0gdGltZWxpbmUuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gIGNvbnN0IGxhc3RUaW1lbGluZSA9IHRpbWVsaW5lLmxhc3RFbGVtZW50Q2hpbGQ7XG4gIGNvbnN0IGhlaWdodCA9IGdldENvb3JkcyhsYXN0VGltZWxpbmUpLnRvcCAtIGdldENvb3JkcyhmaXJzdFRpbWVsaW5lKS50b3AgKyBsYXN0VGltZWxpbmUub2Zmc2V0SGVpZ2h0O1xuICBkYXkuY29tbW9uRnJlZUludGVydmFscy5mb3JFYWNoKGZpID0+IHtcbiAgICBjb25zdCBmaVRwbENvbnRyb2xsZXIgPSBjb21tb25GSVRlbXBsYXRlKGZpKTtcbiAgICBjb250cm9sbGVyLm1haW4uc2NoZWR1bGVyLmNvbW1vbkZJcy5hcHBlbmRDaGlsZChmaVRwbENvbnRyb2xsZXIucm9vdCk7XG4gICAgLy8gdGltZWxpbmUuYXBwZW5kQ2hpbGQoZmlUcGxDb250cm9sbGVyLnJvb3QpO1xuICAgIGZpVHBsQ29udHJvbGxlci5yb290LnN0eWxlLndpZHRoID0gdGhpcy5jYWxjV2lkdGgoZmkuZnJvbSwgZmkudG8pICsgJ3B4JztcbiAgICBmaVRwbENvbnRyb2xsZXIucm9vdC5zdHlsZS5sZWZ0ID0gdGhpcy5jYWxjT2Zmc2V0KGZpLmZyb20pICsgJ3B4JztcbiAgICBmaVRwbENvbnRyb2xsZXIucm9vdC5zdHlsZS50b3AgPSAoZ2V0Q29vcmRzKGZpcnN0VGltZWxpbmUpLnRvcCAtIGdldENvb3JkcyhmaVRwbENvbnRyb2xsZXIucm9vdCkudG9wKSArICdweCc7XG4gICAgZmlUcGxDb250cm9sbGVyLnJvb3Quc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4JztcbiAgfSk7XG59O1xuXG5TU01vZGFsLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IGVsID0gdGhpcy5fdHBsQ29udHJvbGxlci5yb290O1xuICBpZiAoIWVsLmNsYXNzTGlzdC5jb250YWlucygnZGlzcGxheS15ZXMnKSkge1xuICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2Rpc3BsYXkteWVzJyk7XG4gIH1cbiAgaWYgKCF0aGlzLl9pc0luaXQpIHtcbiAgICB0aGlzLl9pc0luaXQgPSB0cnVlO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuU1NNb2RhbC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgZWwgPSB0aGlzLl90cGxDb250cm9sbGVyLnJvb3Q7XG4gIGlmIChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2Rpc3BsYXkteWVzJykpIHtcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdkaXNwbGF5LXllcycpO1xuICB9XG4gIGlmICh0aGlzLl9kZXN0cm95T25DbG9zZSkge1xuICAgIHRoaXMuZGVzdHJveSgpO1xuICB9XG4gIGNvbnN0IGNsb3NlRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ2Nsb3NlJyk7XG4gIGVsLmRpc3BhdGNoRXZlbnQoY2xvc2VFdmVudCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuU1NNb2RhbC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl90cGxDb250cm9sbGVyLnJvb3QucmVtb3ZlKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiBvcHRpb25zID0+IG5ldyBTU01vZGFsKG9wdGlvbnMpXG59O1xufSx7XCIuLi9ldmVudC1kZXRhaWxzLW1vZGFsXCI6MTYsXCIuLi9tYWluL2Z1bmN0aW9uc1wiOjI3LFwiLi4vbWFpbi90ZW1wbGF0ZXNcIjozMyxcIi4uL3NlbGVjdC1wYXJ0aWNpcGFudHMtbW9kYWxcIjozOCxcIi4vdGVtcGxhdGVzXCI6NDIsXCJjc3AtYXBwL2xpYnMvaHR0cFwiOjczLFwiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjgyfV0sNDA6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5jb25zdCB7Z2VuZXJhdGVIb3Vyc01hcmtzLCBnZW5lcmF0ZVN0cmlwc30gPSByZXF1aXJlKCcuLi8uLi9tYWluL2dyaWQnKTtcblxuY29uc3Qgc2lkZWJhclRwbCA9IC8qaHRtbCovYFxuICA8ZGl2IGNsYXNzPVwic2lkZWJhci1zc1wiPlxuICAgIDxkaXYgY2xhc3M9XCJwYXJ0aWNpcGFudHNcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJoZWFkZXJcIj5cbiAgICAgICAgPGgyPlBhcnRpY2lwYW50czwvaDI+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4tb3Blbi1zcFwiPlNlbGVjdDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJib2R5IGNsZWFyZml4XCI+PC9kaXY+XG4gICAgPC9kaXY+XG5cbiAgICA8ZGl2IGNsYXNzPVwiZGF5cyBjbGVhcmZpeFwiPlxuICAgICAgPGRpdiBjbGFzcz1cImhlYWRlclwiPjxzcGFuPlNwZWNpZnkgZGF5czwvc3Bhbj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJib2R5XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ibG9ja1wiPlxuICAgICAgICAgIDxsYWJlbCBmb3I9XCJkYXlzLWZyb21cIj5mcm9tPC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIm1tL2RkL3l5eXlcIiBpZD1cImRheXMtZnJvbVwiIC8+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ibG9ja1wiPlxuICAgICAgICAgIDxsYWJlbCBmb3I9XCJkYXlzLXRvXCI+dG88L2xhYmVsPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwibW0vZGQveXl5eVwiIGlkPVwiZGF5cy10b1wiIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG5cbiAgICA8ZGl2IGNsYXNzPVwidGltZVwiPlxuICAgICAgPGRpdiBjbGFzcz1cImNoZWNrYm94XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ibG9ja1wiPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwidGltZS1jaGVja2VkXCIgaWQ9XCJ0aW1lXCIgLz5cbiAgICAgICAgICA8bGFiZWwgZm9yPVwidGltZVwiPlNlbGVjdCB0aW1lIHNwYW48L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPVwidGltZS1zcGFuIG5vLWRpc3BsYXlcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm9wdGlvbnNcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiaW5wdXQtYmxvY2tcIj5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBuYW1lPVwidGltZVwiIHZhbHVlPVwiZmxvYXRpbmdcIiBpZD1cInRpbWUtZmxvYXRpbmdcIiBjaGVja2VkPVwiY2hlY2tlZFwiIC8+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwidGltZS1mbG9hdGluZ1wiPkZsb2F0aW5nPC9sYWJlbD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWJsb2NrXCI+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhZGlvXCIgbmFtZT1cInRpbWVcIiB2YWx1ZT1cImZpeGVkXCIgaWQ9XCJ0aW1lLWZpeGVkXCIgLz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJ0aW1lLWZpeGVkXCI+Rml4ZWQgKGR1cmF0aW9uKTwvbGFiZWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dHNcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxvYXRpbmdcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ibG9ja1wiPlxuICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwidGltZS1mbC1mcm9tXCI+ZnJvbTwvbGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiaGg6bW1cIiBpZD1cInRpbWUtZmwtZnJvbVwiIC8+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWJsb2NrXCI+XG4gICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJ0aW1lLWZsLXRvXCI+dG88L2xhYmVsPlxuICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cImhoOm1tXCIgaWQ9XCJ0aW1lLWZsLXRvXCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZpeGVkIG5vLWRpc3BsYXlcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJ0aW1lLWZpXCI+dGltZTwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cImhoOm1tXCIgaWQ9XCJ0aW1lLWZpXCIgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cblxuICAgIDxkaXYgY2xhc3M9XCJzdWJtaXQtd3JhcHBlclwiPlxuICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0bi1wcmltYXJ5XCI+U2VhcmNoPC9idXR0b24+XG4gICAgPC9kaXY+XG5cbiAgICA8ZGl2IGNsYXNzPVwicmVzdWx0cyBuby1kaXNwbGF5XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiaGVhZGVyXCI+PGgyPlJlc3VsdHM8L2gyPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImJvZHlcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG5gO1xuXG5jb25zdCBtYWluVHBsID0gLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJzcy1tYWluLXdyYXBwZXJcIj5cbiAgICA8ZGl2IGNsYXNzPVwiaW5pdGlhbFwiPjxwPlNwZWNpZnkgcGFyYW1ldGVycyBmb3Igc2VhcmNoIGluIHRoZSBzaWRlYmFyPC9wPjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJsb2FkaW5nIG5vLWRpc3BsYXlcIj48cD5Mb2FkaW5nLiBQbGVhc2Ugd2FpdC4uLjwvcD48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2NoZWR1bGVyLWNvbnRhaW5lciBuby1kaXNwbGF5XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwicGFuZWxcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInBhbmVsLWRhdGVcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm9wZW4tQ0VNb2RhbC13cmFwcGVyXCI+XG4gICAgICAgICAgQ2xpY2sgPGJ1dHRvbiBpZD1cIm9wZW4tQ0VNb2RhbFwiIGNsYXNzPVwiYnRuLXByaW1hcnlcIj5oZXJlPC9idXR0b24+IHRvIG9wZW4gY3JlYXRlIGV2ZW50IHdpbmRvd1xuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInNjaGVkdWxlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibGVmdFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYXJ0aWNpcGFudHNcIj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIFxuICAgICAgICA8ZGl2IGNsYXNzPVwicmlnaHRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RyaXBzXCI+PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInRpbWVsaW5lLWhcIj48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidGltZWxpbmUtYlwiPjwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb21tb24tZmlzXCI+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuYDtcblxuZnVuY3Rpb24gdGVtcGxhdGUoKSB7XG4gIGNvbnN0IHNpZGViYXJUcGxDb250cm9sbGVyID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKHNpZGViYXJUcGwpO1xuICBjb25zdCBtYWluVHBsQ29udHJvbGxlciA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChtYWluVHBsKTtcblxuICBjb25zdCB0aW1lbGluZUhlYWRlciA9IG1haW5UcGxDb250cm9sbGVyLnF1ZXJ5U2VsZWN0b3IoJy5zY2hlZHVsZXIgLnRpbWVsaW5lLWgnKTtcbiAgY29uc3QgdGltZWxpbmVCb2R5ID0gbWFpblRwbENvbnRyb2xsZXIucXVlcnlTZWxlY3RvcignLnNjaGVkdWxlciAudGltZWxpbmUtYicpO1xuICBjb25zdCBzdHJpcHMgPSBtYWluVHBsQ29udHJvbGxlci5xdWVyeVNlbGVjdG9yKCcuc2NoZWR1bGVyIC5zdHJpcHMnKTtcblxuICBsZXQgY29udHJvbGxlciA9IHtcbiAgICBzaWRlYmFyOiB7XG4gICAgICByb290OiBzaWRlYmFyVHBsQ29udHJvbGxlcixcbiAgICAgIHBhcnRpY2lwYW50czoge1xuICAgICAgICByb290OiBzaWRlYmFyVHBsQ29udHJvbGxlci5xdWVyeVNlbGVjdG9yKCcucGFydGljaXBhbnRzJyksXG4gICAgICAgIGJ1dHRvbjogc2lkZWJhclRwbENvbnRyb2xsZXIucXVlcnlTZWxlY3RvcignLmJ0bi1vcGVuLXNwJyksXG4gICAgICAgIGJvZHk6IHNpZGViYXJUcGxDb250cm9sbGVyLnF1ZXJ5U2VsZWN0b3IoJy5wYXJ0aWNpcGFudHMgLmJvZHknKVxuICAgICAgfSxcbiAgICAgIGRheXM6IHtcbiAgICAgICAgcm9vdDogc2lkZWJhclRwbENvbnRyb2xsZXIucXVlcnlTZWxlY3RvcignLmRheXMnKSxcbiAgICAgICAgZnJvbTogc2lkZWJhclRwbENvbnRyb2xsZXIucXVlcnlTZWxlY3RvcignI2RheXMtZnJvbScpLFxuICAgICAgICB0bzogc2lkZWJhclRwbENvbnRyb2xsZXIucXVlcnlTZWxlY3RvcignI2RheXMtdG8nKVxuICAgICAgfSxcbiAgICAgIHRpbWU6IHtcbiAgICAgICAgcm9vdDogc2lkZWJhclRwbENvbnRyb2xsZXIucXVlcnlTZWxlY3RvcignLnRpbWUnKSxcbiAgICAgICAgaXNUaW1lQ2hlY2tlZDogc2lkZWJhclRwbENvbnRyb2xsZXIucXVlcnlTZWxlY3RvcignLnRpbWUgI3RpbWUnKSxcbiAgICAgICAgdGltZVNwYW46IHNpZGViYXJUcGxDb250cm9sbGVyLnF1ZXJ5U2VsZWN0b3IoJy50aW1lIC50aW1lLXNwYW4nKSxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgIGZsb2F0aW5nOiBzaWRlYmFyVHBsQ29udHJvbGxlci5xdWVyeVNlbGVjdG9yKCcjdGltZS1mbG9hdGluZycpLFxuICAgICAgICAgIGZpeGVkOiBzaWRlYmFyVHBsQ29udHJvbGxlci5xdWVyeVNlbGVjdG9yKCcjdGltZS1maXhlZCcpXG4gICAgICAgIH0sXG4gICAgICAgIGlucHV0czoge1xuICAgICAgICAgIGZsb2F0aW5nOiB7XG4gICAgICAgICAgICByb290OiBzaWRlYmFyVHBsQ29udHJvbGxlci5xdWVyeVNlbGVjdG9yKCcudGltZSAuaW5wdXRzIC5mbG9hdGluZycpLFxuICAgICAgICAgICAgZnJvbTogc2lkZWJhclRwbENvbnRyb2xsZXIucXVlcnlTZWxlY3RvcignI3RpbWUtZmwtZnJvbScpLFxuICAgICAgICAgICAgdG86IHNpZGViYXJUcGxDb250cm9sbGVyLnF1ZXJ5U2VsZWN0b3IoJyN0aW1lLWZsLXRvJylcbiAgICAgICAgICB9LFxuICAgICAgICAgIGZpeGVkOiB7XG4gICAgICAgICAgICByb290OiBzaWRlYmFyVHBsQ29udHJvbGxlci5xdWVyeVNlbGVjdG9yKCcudGltZSAuaW5wdXRzIC5maXhlZCcpLFxuICAgICAgICAgICAgdmFsdWU6IHNpZGViYXJUcGxDb250cm9sbGVyLnF1ZXJ5U2VsZWN0b3IoJyN0aW1lLWZpJylcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzZWFyY2hCdG46IHNpZGViYXJUcGxDb250cm9sbGVyLnF1ZXJ5U2VsZWN0b3IoJy5zdWJtaXQtd3JhcHBlciBidXR0b24nKSxcbiAgICAgIHJlc3VsdHM6IHtcbiAgICAgICAgcm9vdDogc2lkZWJhclRwbENvbnRyb2xsZXIucXVlcnlTZWxlY3RvcignLnJlc3VsdHMnKSxcbiAgICAgICAgYm9keTogc2lkZWJhclRwbENvbnRyb2xsZXIucXVlcnlTZWxlY3RvcignLnJlc3VsdHMgLmJvZHknKVxuICAgICAgfVxuICAgIH0sXG4gICAgbWFpbjoge1xuICAgICAgcm9vdDogbWFpblRwbENvbnRyb2xsZXIsXG4gICAgICBpbml0aWFsOiBtYWluVHBsQ29udHJvbGxlci5xdWVyeVNlbGVjdG9yKCcuaW5pdGlhbCcpLFxuICAgICAgbG9hZGluZzogbWFpblRwbENvbnRyb2xsZXIucXVlcnlTZWxlY3RvcignLmxvYWRpbmcnKSxcbiAgICAgIHNjaGVkdWxlckNvbnRhaW5lcjogbWFpblRwbENvbnRyb2xsZXIucXVlcnlTZWxlY3RvcignLnNjaGVkdWxlci1jb250YWluZXInKSxcbiAgICAgIHNjaGVkdWxlcjoge1xuICAgICAgICByb290OiBtYWluVHBsQ29udHJvbGxlci5xdWVyeVNlbGVjdG9yKCcuc2NoZWR1bGVyJyksXG4gICAgICAgIGxlZnQ6IG1haW5UcGxDb250cm9sbGVyLnF1ZXJ5U2VsZWN0b3IoJy5zY2hlZHVsZXIgLmxlZnQnKSxcbiAgICAgICAgcmlnaHQ6IG1haW5UcGxDb250cm9sbGVyLnF1ZXJ5U2VsZWN0b3IoJy5zY2hlZHVsZXIgLnJpZ2h0JyksXG4gICAgICAgIHBhcnRpY2lwYW50czogbWFpblRwbENvbnRyb2xsZXIucXVlcnlTZWxlY3RvcignLnNjaGVkdWxlciAucGFydGljaXBhbnRzJyksXG4gICAgICAgIGNvbW1vbkZJczogbWFpblRwbENvbnRyb2xsZXIucXVlcnlTZWxlY3RvcignLnNjaGVkdWxlciAuY29tbW9uLWZpcycpLFxuICAgICAgICBkYXRlOiBtYWluVHBsQ29udHJvbGxlci5xdWVyeVNlbGVjdG9yKCcuc2NoZWR1bGVyLWNvbnRhaW5lciAucGFuZWwgLnBhbmVsLWRhdGUnKSxcbiAgICAgICAgdGltZWxpbmVIZWFkZXIsXG4gICAgICAgIHRpbWVsaW5lOiB0aW1lbGluZUJvZHksXG4gICAgICAgIHN0cmlwcyxcbiAgICAgICAgZ2VuZXJhdGVIb3Vyc01hcmtzOiBnZW5lcmF0ZUhvdXJzTWFya3ModGltZWxpbmVIZWFkZXIpLFxuICAgICAgICBnZW5lcmF0ZVN0cmlwczogZ2VuZXJhdGVTdHJpcHMoc3RyaXBzKVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBjb250cm9sbGVyLnNjaGVkdWxlciA9IGNvbnRyb2xsZXIubWFpbi5zY2hlZHVsZXI7XG5cbiAgcmV0dXJuIGNvbnRyb2xsZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG59LHtcIi4uLy4uL21haW4vZ3JpZFwiOjI4LFwiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjgyfV0sNDE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKGRhdGEpIHtcbiAgY29uc3QgZnJvbUhIU3RyID0gZGF0YS5mcm9tLmdldEhvdXJzKCkudG9TdHJpbmcoKTtcbiAgY29uc3QgZnJvbU1NU3RyID0gZGF0YS5mcm9tLmdldE1pbnV0ZXMoKS50b1N0cmluZygpO1xuICBjb25zdCBmcm9tSEggPSBmcm9tSEhTdHIubGVuZ3RoID09IDEgPyAnMCcgKyBmcm9tSEhTdHIgOiBmcm9tSEhTdHI7XG4gIGNvbnN0IGZyb21NTSA9IGZyb21NTVN0ci5sZW5ndGggPT0gMSA/ICcwJyArIGZyb21NTVN0ciA6IGZyb21NTVN0cjtcblxuICBjb25zdCB0b0hIU3RyID0gZGF0YS50by5nZXRIb3VycygpLnRvU3RyaW5nKCk7XG4gIGNvbnN0IHRvTU1TdHIgPSBkYXRhLnRvLmdldE1pbnV0ZXMoKS50b1N0cmluZygpO1xuICBjb25zdCB0b0hIID0gdG9ISFN0ci5sZW5ndGggPT0gMSA/ICcwJyArIHRvSEhTdHIgOiB0b0hIU3RyO1xuICBjb25zdCB0b01NID0gdG9NTVN0ci5sZW5ndGggPT0gMSA/ICcwJyArIHRvTU1TdHIgOiB0b01NU3RyO1xuXG4gIGNvbnN0IGZyb20gPSBgJHtmcm9tSEh9OiR7ZnJvbU1NfWA7XG4gIGNvbnN0IHRvID0gYCR7dG9ISH06JHt0b01NfWA7XG4gIGNvbnN0IGhpbnQgPSBgRnJlZSBpbiAke2Zyb219LSR7dG99YDtcblxuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cImNvbW1vbi1maVwiIHRpdGxlPVwiJHtoaW50fVwiPjwvZGl2PlxuICBgO1xuICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKGh0bWwpO1xuXG4gIHJldHVybiB7XG4gICAgcm9vdDogZWxlbWVudFxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xufSx7XCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6ODJ9XSw0MjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBtb2RhbFRlbXBsYXRlID0gcmVxdWlyZSgnLi4vLi4vbWFpbi9tb2RhbC50cGwnKTtcbmNvbnN0IGJhc2VUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xuY29uc3QgcmVzdWx0c0J1dHRvblRlbXBsYXRlID0gcmVxdWlyZSgnLi9yZXN1bHRzLWJ1dHRvbicpO1xuY29uc3QgY29tbW9uRklUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vY29tbW9uLWZyZWUtaW50ZXJ2YWwnKTtcblxuZnVuY3Rpb24gc2NoZWR1bGVyVGVtcGxhdGUoKSB7XG4gIGNvbnN0IG1vZGFsVHBsQ29udHJvbGxlciA9IG1vZGFsVGVtcGxhdGUoKTtcbiAgY29uc3QgYmFzZVRwbENvbnRyb2xsZXIgPSBiYXNlVGVtcGxhdGUoKTtcblxuICBtb2RhbFRwbENvbnRyb2xsZXIuc2lkZWJhci5hcHBlbmRDaGlsZChiYXNlVHBsQ29udHJvbGxlci5zaWRlYmFyLnJvb3QpO1xuICBtb2RhbFRwbENvbnRyb2xsZXIuY29udGVudC5hcHBlbmRDaGlsZChiYXNlVHBsQ29udHJvbGxlci5tYWluLnJvb3QpO1xuICBcbiAgcmV0dXJuIHtcbiAgICByb290OiBtb2RhbFRwbENvbnRyb2xsZXIucm9vdCxcbiAgICBjbG9zZUJ0bjogbW9kYWxUcGxDb250cm9sbGVyLmNsb3NlQnRuLFxuICAgIC4uLmJhc2VUcGxDb250cm9sbGVyXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzY2hlZHVsZXJUZW1wbGF0ZSxcbiAgcmVzdWx0c0J1dHRvblRlbXBsYXRlLFxuICBjb21tb25GSVRlbXBsYXRlXG59O1xufSx7XCIuLi8uLi9tYWluL21vZGFsLnRwbFwiOjMxLFwiLi9iYXNlXCI6NDAsXCIuL2NvbW1vbi1mcmVlLWludGVydmFsXCI6NDEsXCIuL3Jlc3VsdHMtYnV0dG9uXCI6NDN9XSw0MzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MLCBnZXRNb250aE5hbWV9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiB0ZW1wbGF0ZShvcHRpb25zKSB7XG4gIGNvbnN0IGNsYXNzTmFtZSA9IG9wdGlvbnMuaGFzRnJlZUludGV2YWxzID8gJ2J0bi1wcmltYXJ5JyA6ICcnO1xuICBjb25zdCBtb250aE5hbWUgPSBnZXRNb250aE5hbWUob3B0aW9ucy5kYXRlLmdldE1vbnRoKCkpO1xuICBjb25zdCB0aXRsZSA9IGAke21vbnRoTmFtZX0sICR7b3B0aW9ucy5kYXRlLmdldERhdGUoKX1gO1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGJ1dHRvbiBjbGFzcz1cInJlc3VsdHMtYnRuICR7Y2xhc3NOYW1lfVwiIGRhdGEtZGF5LWlkPVwiJHtvcHRpb25zLmlkfVwiPiR7dGl0bGV9PC9idXR0b24+XG4gIGA7XG4gIGNvbnN0IGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoaHRtbCk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBlbGVtZW50XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo4Mn1dLDQ0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMnKTtcbmNvbnN0IHttaW5MZW5ndGgsIG1heExlbmd0aCwgc3RhcnRzV2l0aE51bWJlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMvdmFsaWRhdG9ycycpO1xuXG5jb25zdCB1c2VybmFtZSA9IHtcbiAga2V5TmFtZTogJ3VzZXJuYW1lJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS11c2VybmFtZScsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAndGV4dCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1VzZXJuYW1lJ31cbiAgXSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnbWF4TGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1heExlbmd0aFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3N0YXJ0c1dpdGhOdW1iZXInLFxuICAgICAgaGFuZGxlcjogc3RhcnRzV2l0aE51bWJlclxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgcGFzc3dvcmQgPSB7XG4gIGtleU5hbWU6ICdwYXNzd29yZCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tcGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3Bhc3N3b3JkJ30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnUGFzc3dvcmQnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBjb25maXJtUGFzc3dvcmQgPSB7XG4gIGtleU5hbWU6ICdjb25maXJtUGFzc3dvcmQnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLWNvbmZpcm1QYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAncGFzc3dvcmQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdDb25maXJtIHBhc3N3b3JkJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgZW1haWwgPSB7XG4gIGtleU5hbWU6ICdlbWFpbCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tcGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3RleHQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdFLW1haWwnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBjbGllbnRGb3JtID0gbmV3IEZvcm0oe1xuICB2YWxpZGF0b3JzOiBbXSxcbiAgc3VibWl0OiB7XG4gICAgaGFuZGxlcjogZnVuY3Rpb24odmFsdWVzLCBldnQpIHtcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY29uc29sZS5sb2coJ0Zvcm0gaXMgY2xlYW4nKTtcbiAgICB9XG4gIH0sXG4gIGNvbnRyb2xzOiBbXG4gICAgdXNlcm5hbWUsXG4gICAgcGFzc3dvcmQsXG4gICAgY29uZmlybVBhc3N3b3JkLFxuICAgIGVtYWlsXG4gIF1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsaWVudEZvcm07XG59LHtcImNzcC1hcHAvbGlicy9mb3Jtc1wiOjcxLFwiY3NwLWFwcC9saWJzL2Zvcm1zL3ZhbGlkYXRvcnNcIjo3Mn1dLDQ1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMnKTtcbmNvbnN0IHttaW5MZW5ndGgsIG1heExlbmd0aCwgc3RhcnRzV2l0aE51bWJlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMvdmFsaWRhdG9ycycpO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9odHRwJylcblxuY29uc3QgdXNlcm5hbWUgPSB7XG4gIGtleU5hbWU6ICd1c2VybmFtZScsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tdXNlcm5hbWUnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3RleHQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdVc2VybmFtZSd9XG4gIF0sXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ21heExlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtYXhMZW5ndGhcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdzdGFydHNXaXRoTnVtYmVyJyxcbiAgICAgIGhhbmRsZXI6IHN0YXJ0c1dpdGhOdW1iZXJcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IHBhc3N3b3JkID0ge1xuICBrZXlOYW1lOiAncGFzc3dvcmQnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICdwYXNzd29yZCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1Bhc3N3b3JkJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgY29uZmlybVBhc3N3b3JkID0ge1xuICBrZXlOYW1lOiAnY29uZmlybVBhc3N3b3JkJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1jb25maXJtUGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3Bhc3N3b3JkJ30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnQ29uZmlybSBwYXNzd29yZCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGVtYWlsID0ge1xuICBrZXlOYW1lOiAnZW1haWwnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICd0ZXh0J30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnRS1tYWlsJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3Qgb3JnID0ge1xuICBrZXlOYW1lOiAnb3JnJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1wYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAndGV4dCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1lvdXIgb3JnYW5pemF0aW9uJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgZXhlY0Zvcm0gPSBuZXcgRm9ybSh7XG4gIHZhbGlkYXRvcnM6IFtdLFxuICBzdWJtaXQ6IHtcbiAgICBoYW5kbGVyOiBmdW5jdGlvbih2YWx1ZXMsIGV2dCkge1xuICAgICAgY29uc3QgYm9keSA9IHtcbiAgICAgICAgdXNlcm5hbWU6IHZhbHVlcy51c2VybmFtZSxcbiAgICAgICAgZW1haWw6IHZhbHVlcy5lbWFpbCxcbiAgICAgICAgcGFzc3dvcmQ6IHZhbHVlcy5wYXNzd29yZFxuICAgICAgfTtcblxuICAgICAgaHR0cC5wb3N0KCdhdXRoL3NpZ251cC9leGVjJywgYm9keSlcbiAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKVxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKVxuICAgICAgICB9KVxuICAgICAgO1xuICAgIH1cbiAgfSxcbiAgY29udHJvbHM6IFtcbiAgICB1c2VybmFtZSxcbiAgICBwYXNzd29yZCxcbiAgICBjb25maXJtUGFzc3dvcmQsXG4gICAgZW1haWwsXG4gICAgb3JnXG4gIF1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4ZWNGb3JtO1xufSx7XCJjc3AtYXBwL2xpYnMvZm9ybXNcIjo3MSxcImNzcC1hcHAvbGlicy9mb3Jtcy92YWxpZGF0b3JzXCI6NzIsXCJjc3AtYXBwL2xpYnMvaHR0cFwiOjczfV0sNDY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgRm9ybSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3JtcycpO1xuY29uc3Qge21pbkxlbmd0aCwgbWF4TGVuZ3RoLCBzdGFydHNXaXRoTnVtYmVyfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3Jtcy92YWxpZGF0b3JzJyk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IE1haW5Db250cm9sbGVyID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL21haW4nKTtcbmNvbnN0IERhc2hib2FyZCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmQnKTtcblxuY29uc3QgdXNlcm5hbWUgPSB7XG4gIGtleU5hbWU6ICd1c2VybmFtZScsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tdXNlcm5hbWUnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3RleHQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdVc2VybmFtZSd9XG4gIF0sXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ21heExlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtYXhMZW5ndGhcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdzdGFydHNXaXRoTnVtYmVyJyxcbiAgICAgIGhhbmRsZXI6IHN0YXJ0c1dpdGhOdW1iZXJcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IHBhc3N3b3JkID0ge1xuICBrZXlOYW1lOiAncGFzc3dvcmQnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICdwYXNzd29yZCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1Bhc3N3b3JkJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgbG9naW5Gb3JtID0gbmV3IEZvcm0oe1xuICB2YWxpZGF0b3JzOiBbXSxcbiAgc3VibWl0OiB7XG4gICAgaGFuZGxlcjogZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICBjb25zdCB7dXNlcm5hbWUsIHBhc3N3b3JkfSA9IHZhbHVlcztcbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICB9O1xuXG4gICAgICBodHRwLnBvc3QoJ2F1dGgvbG9naW4nLCBkYXRhKVxuICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgIGlmICghcmVzLnN1Y2Nlc3MpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzLmVycm9yLm1lc3NhZ2UpO1xuXG4gICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhdXRoX3Rva2VuJywgcmVzLmRhdGEudG9rZW4pO1xuICAgICAgICAgIE1haW5Db250cm9sbGVyLnJlbmRlcihbRGFzaGJvYXJkXSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyLm1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIGNvbnRyb2xzOiBbXG4gICAgdXNlcm5hbWUsXG4gICAgcGFzc3dvcmRcbiAgXVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbG9naW5Gb3JtO1xufSx7XCJjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkXCI6MSxcImNzcC1hcHAvY29tcG9uZW50cy9tYWluXCI6NSxcImNzcC1hcHAvbGlicy9mb3Jtc1wiOjcxLFwiY3NwLWFwcC9saWJzL2Zvcm1zL3ZhbGlkYXRvcnNcIjo3MixcImNzcC1hcHAvbGlicy9odHRwXCI6NzN9XSw0NzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBsb2dpbkZvcm0gPSByZXF1aXJlKCcuL0xvZ2luRm9ybScpO1xuY29uc3QgY2xpZW50Rm9ybSA9IHJlcXVpcmUoJy4vQ2xpZW50Rm9ybScpO1xuY29uc3QgZXhlY0Zvcm0gPSByZXF1aXJlKCcuL0V4ZWNGb3JtJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBsb2dpbkZvcm0sXG4gIGNsaWVudEZvcm0sXG4gIGV4ZWNGb3JtXG59O1xufSx7XCIuL0NsaWVudEZvcm1cIjo0NCxcIi4vRXhlY0Zvcm1cIjo0NSxcIi4vTG9naW5Gb3JtXCI6NDZ9XSw0ODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vc3RhcnQudHBsJyk7XG5jb25zdCB0YWJzID0gcmVxdWlyZSgnLi90YWJzJyk7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MLCBTaW5nbGV0b259ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5jb25zdCBTdGFydCA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKHRlbXBsYXRlKCkpO1xuICBjb25zdCB0YWJzV3JhcHBlciA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnN0YXJ0LXRhYnMnKTtcbiAgdGFic1dyYXBwZXIuYXBwZW5kQ2hpbGQodGFicy5oZWFkZXIuZWxlbWVudCk7XG4gIHRhYnNXcmFwcGVyLmFwcGVuZENoaWxkKHRhYnMuY29udGVudC5lbGVtZW50KTtcblxuICByZXR1cm4ge1xuICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgY29udHJvbGxlcjoge1xuICAgICAgZWxlbWVudDogZWxlbWVudFxuICAgIH0gICAgXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbmdsZXRvbihTdGFydCk7XG59LHtcIi4vc3RhcnQudHBsXCI6NDksXCIuL3RhYnNcIjo1MCxcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo4Mn1dLDQ5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmZ1bmN0aW9uIHRlbXBsYXRlKGRhdGEpIHtcbiAgcmV0dXJuIC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCJjbXBfc3RhcnRcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJ3cmFwcGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXJcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibG9nby1ibG9ja1wiPlxuICAgICAgICAgICAgPGgxPldlbGNvbWUgdG8gQ29uc3VsdGluZyBTZXJ2aWNlcyBQbGF0Zm9ybTwvaDE+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgXG4gICAgICAgICAgPGEgZGF0YS1yb3V0ZT1cIi9cIj5Ib21lPC9hPlxuICAgICAgICAgIDxhIGRhdGEtcm91dGU9XCIvZGFzaGJvYXJkXCI+RGFzaGJvYXJkPC9hPlxuXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXJ0LXRhYnNcIj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcbn0se31dLDUwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IFRhYnMgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdGFicycpO1xuY29uc3QgY3JlYXRlRWxlbWVudEZyb21IVE1MID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpLmNyZWF0ZUVsZW1lbnRGcm9tSFRNTDtcbmNvbnN0IHNpZ251cFRhYnMgPSByZXF1aXJlKCcuL3NpZ251cFRhYnMnKTtcbmNvbnN0IGxvZ2luRm9ybSA9IHJlcXVpcmUoJy4uL2Zvcm1zL0xvZ2luRm9ybScpO1xuY29uc3QgcmFkaWFsR3JhZGllbnRPbkhvdmVyID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL21pc2MvYnV0dG9uLWVmZmVjdHMvcmFkaWFsR3JhZGllbnRPbkhvdmVyJyk7XG5cbmNvbnN0IGxvZ2luQmxvY2sgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJsb2dpbi1ibG9ja1wiPlxuICAgIDxkaXYgY2xhc3M9XCJoZWFkZXJcIj48aDI+TG9nIGluPC9oMj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwiZm9ybVwiPjwvZGl2PlxuICA8L2Rpdj5cbmApO1xuXG5jb25zdCBzaWdudXBCbG9jayA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCgvKmh0bWwqL2BcbiAgPGRpdiBjbGFzcz1cInNpZ251cC1ibG9ja1wiPjwvZGl2PlxuYCk7XG5cbmNvbnN0IHN0YXJ0VGFicyA9IG5ldyBUYWJzKHtcbiAgaGVhZGVyOiB7XG4gICAgY2xhc3NOYW1lOiAnbWFpbi1hY3Rpb25zJyxcbiAgICBpdGVtczogW1xuICAgICAge3RpdGxlOiAnTG9nIGluJywgdGFnOiAnYnV0dG9uJ30sXG4gICAgICB7dGl0bGU6ICdTaWduIHVwJywgdGFnOiAnYnV0dG9uJ31cbiAgICBdXG4gIH0sXG4gIGNvbnRlbnQ6IHtcbiAgICBpdGVtczogW1xuICAgICAgbG9naW5CbG9jayxcbiAgICAgIHNpZ251cEJsb2NrXG4gICAgXVxuICB9LFxuICBhbmltYXRpb246IHtcbiAgICBuYW1lOiAnbG9naW5TaWdudXBTd2l0Y2gnXG4gIH1cbn0pO1xuXG5jb25zdCBjb250ZW50V3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuY29udGVudFdyYXBwZXIuY2xhc3NMaXN0LmFkZCgnZm9ybXMnKTtcbmNvbnRlbnRXcmFwcGVyLmFwcGVuZENoaWxkKHNpZ251cFRhYnMuY29udGVudC5lbGVtZW50KTtcblxuc3RhcnRUYWJzLmNvbnRlbnQuaXRlbXNbMF0ucXVlcnlTZWxlY3RvcignLmxvZ2luLWJsb2NrIC5mb3JtJykuYXBwZW5kQ2hpbGQobG9naW5Gb3JtLnJlZik7XG5zdGFydFRhYnMuY29udGVudC5pdGVtc1sxXS5hcHBlbmRDaGlsZChzaWdudXBUYWJzLmhlYWRlci5lbGVtZW50KTtcbnN0YXJ0VGFicy5jb250ZW50Lml0ZW1zWzFdLmFwcGVuZENoaWxkKGNvbnRlbnRXcmFwcGVyKTtcblxuc3RhcnRUYWJzLmhlYWRlci5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gcmFkaWFsR3JhZGllbnRPbkhvdmVyKGl0ZW0sIHtwYWRkaW5nOiBbMTAsIDE2XX0pKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzdGFydFRhYnM7XG59LHtcIi4uL2Zvcm1zL0xvZ2luRm9ybVwiOjQ2LFwiLi9zaWdudXBUYWJzXCI6NTEsXCJjc3AtYXBwL2xpYnMvbWlzYy9idXR0b24tZWZmZWN0cy9yYWRpYWxHcmFkaWVudE9uSG92ZXJcIjo3NCxcImNzcC1hcHAvbGlicy90YWJzXCI6ODEsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6ODJ9XSw1MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBUYWJzID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3RhYnMnKTtcbmNvbnN0IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKS5jcmVhdGVFbGVtZW50RnJvbUhUTUw7XG5jb25zdCB7Y2xpZW50Rm9ybSwgZXhlY0Zvcm19ID0gcmVxdWlyZSgnLi4vZm9ybXMnKTtcbmNvbnN0IHJhZGlhbEdyYWRpZW50T25Ib3ZlciA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9taXNjL2J1dHRvbi1lZmZlY3RzL3JhZGlhbEdyYWRpZW50T25Ib3ZlcicpO1xuXG5jb25zdCBjbGllbnRGb3JtQmxvY2sgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJjbGllbnQtZm9ybSBmb3JtXCI+PC9kaXY+XG5gKTtcblxuY29uc3QgZXhlY0Zvcm1CbG9jayA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCgvKmh0bWwqL2BcbiAgPGRpdiBjbGFzcz1cImV4ZWMtZm9ybSBmb3JtXCI+PC9kaXY+XG5gKTtcblxuY29uc3QgYWNhZGVtaWNGb3JtQmxvY2sgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJmb3JtXCI+QWNhZGVtaWM8L2Rpdj5cbmApO1xuXG5jb25zdCBzdHVkZW50Rm9ybUJsb2NrID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICA8ZGl2IGNsYXNzPVwiZm9ybVwiPlN0dWRlbnQ8L2Rpdj5cbmApO1xuXG4vLyBjb25zdCBzaWdudXBUYWJzID0gbmV3IFRhYnMoe1xuLy8gICBoZWFkZXI6IHtcbi8vICAgICBjbGFzc05hbWU6ICdhY3Rpb25zIGNsZWFyZml4Jyxcbi8vICAgICBpdGVtczogW1xuLy8gICAgICAge3RpdGxlOiAnU2lnbiB1cCBhcyBjbGllbnQnLCB0YWc6ICdidXR0b24nfSxcbi8vICAgICAgIHt0aXRsZTogJ1NpZ24gdXAgYXMgZXhlY3V0b3InLCB0YWc6ICdidXR0b24nfSxcbi8vICAgICAgIHt0aXRsZTogJ0FzIGFjYWRlbWljJywgdGFnOiAnYnV0dG9uJ30sXG4vLyAgICAgICB7dGl0bGU6ICdBcyBzdHVkZW50JywgdGFnOiAnYnV0dG9uJ31cbi8vICAgICBdXG4vLyAgIH0sXG4vLyAgIGNvbnRlbnQ6IHtcbi8vICAgICBpdGVtczogW1xuLy8gICAgICAgY2xpZW50Rm9ybUJsb2NrLFxuLy8gICAgICAgZXhlY0Zvcm1CbG9jayxcbi8vICAgICAgIGFjYWRlbWljRm9ybUJsb2NrLFxuLy8gICAgICAgc3R1ZGVudEZvcm1CbG9ja1xuLy8gICAgIF1cbi8vICAgfSxcbi8vICAgYW5pbWF0aW9uOiB7XG4vLyAgICAgbmFtZTogJ3RhYnNGbG93QW5pbWF0aW9uJyxcbi8vICAgICBwYXJhbXM6IHtwYWRkaW5nOiAxNSwgc3BlZWQ6IDg1MH1cbi8vICAgfVxuLy8gfSk7XG5cbmNvbnN0IHNpZ251cFRhYnMgPSBuZXcgVGFicyh7XG4gIGhlYWRlcjoge1xuICAgIGNsYXNzTmFtZTogJ2FjdGlvbnMgY2xlYXJmaXgnLFxuICAgIGl0ZW1zOiBbXG4gICAgICB7dGl0bGU6ICdTaWduIHVwIGFzIGNsaWVudCcsIHRhZzogJ2J1dHRvbid9LFxuICAgICAge3RpdGxlOiAnU2lnbiB1cCBhcyBleGVjdXRvcicsIHRhZzogJ2J1dHRvbid9XG4gICAgXVxuICB9LFxuICBjb250ZW50OiB7XG4gICAgaXRlbXM6IFtcbiAgICAgIGNsaWVudEZvcm1CbG9jayxcbiAgICAgIGV4ZWNGb3JtQmxvY2tcbiAgICBdXG4gIH0sXG4gIGFuaW1hdGlvbjoge1xuICAgIG5hbWU6ICd0YWJzRmxvd0FuaW1hdGlvbicsXG4gICAgcGFyYW1zOiB7cGFkZGluZzogMTUsIHNwZWVkOiA4NTB9XG4gIH1cbn0pO1xuXG5zaWdudXBUYWJzLmNvbnRlbnQuaXRlbXNbMF0uYXBwZW5kQ2hpbGQoY2xpZW50Rm9ybS5yZWYpO1xuc2lnbnVwVGFicy5jb250ZW50Lml0ZW1zWzFdLmFwcGVuZENoaWxkKGV4ZWNGb3JtLnJlZik7XG5cbnNpZ251cFRhYnMuaGVhZGVyLml0ZW1zLmZvckVhY2goaXRlbSA9PiByYWRpYWxHcmFkaWVudE9uSG92ZXIoaXRlbSwge3BhZGRpbmc6IDE1fSkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNpZ251cFRhYnM7XG59LHtcIi4uL2Zvcm1zXCI6NDcsXCJjc3AtYXBwL2xpYnMvbWlzYy9idXR0b24tZWZmZWN0cy9yYWRpYWxHcmFkaWVudE9uSG92ZXJcIjo3NCxcImNzcC1hcHAvbGlicy90YWJzXCI6ODEsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6ODJ9XSw1MjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBUZXN0ID0ge1xuICAgIGh0bWw6IGBcbiAgICAgICAgPGRpdiBpZD1cInRlc3RcIj5cbiAgICAgICAgICAgIDxoMT5UaGlzIGlzIFRlc3QgY29tcG9uZW50PC9oMT5cbiAgICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBpbnN0YW50aWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGVtcC5pbm5lckhUTUwgPSB0aGlzLmh0bWw7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0ZW1wLmZpcnN0RWxlbWVudENoaWxkXG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24oRE9NVHJlZSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChET01UcmVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGVzdC5pbnN0YW50aWF0ZSgpO1xufSx7fV0sNTM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge1xuICBBbGxVc2Vyc1RhYkNvbXBvbmVudCxcbiAgRnJpZW5kc1RhYkNvbXBvbmVudCxcbiAgSW5jb21pbmdSZXF1ZXN0c1RhYkNvbXBvbmVudCxcbiAgT3V0Z29pbmdSZXF1ZXN0c1RhYkNvbXBvbmVudFxufSA9IHJlcXVpcmUoJy4vdGFicycpO1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5jb25zdCBUYWJzID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3RhYnMnKTtcblxuZnVuY3Rpb24gVXNlcnNDb21wb25lbnQoKSB7IFxuICByZXR1cm4gUHJvbWlzZVxuICAgIC5hbGwoW1xuICAgICAgQWxsVXNlcnNUYWJDb21wb25lbnQoKSxcbiAgICAgIEZyaWVuZHNUYWJDb21wb25lbnQoKSxcbiAgICAgIEluY29taW5nUmVxdWVzdHNUYWJDb21wb25lbnQoKSxcbiAgICAgIE91dGdvaW5nUmVxdWVzdHNUYWJDb21wb25lbnQoKVxuICAgIF0pXG4gICAgLnRoZW4oKFthbGxVc2Vyc1RhYiwgZnJpZW5kc1RhYiwgSVJUYWIsIE9SVGFiXSkgPT4ge1xuICAgICAgY29uc3QgdGFicyA9IG5ldyBUYWJzKHtcbiAgICAgICAgaGVhZGVyOiB7XG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHt0aXRsZTogJ0FsbCB1c2VycycsIHRhZzogJ2J1dHRvbid9LFxuICAgICAgICAgICAge3RpdGxlOiBgRnJpZW5kcyAoJHtmcmllbmRzVGFiLmZyaWVuZHNBbW91bnR9KWAsIHRhZzogJ2J1dHRvbid9LFxuICAgICAgICAgICAge3RpdGxlOiBgSW5jb21pbmcgcmVxdWVzdHMgKCR7SVJUYWIucmVxdWVzdHNBbW91bnR9KWAsIHRhZzogJ2J1dHRvbid9LFxuICAgICAgICAgICAge3RpdGxlOiBgT3V0Z29pbmcgcmVxdWVzdHMgKCR7T1JUYWIucmVxdWVzdHNBbW91bnR9KWAsIHRhZzogJ2J1dHRvbid9XG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIGFsbFVzZXJzVGFiLmVsZW1lbnQsXG4gICAgICAgICAgICBmcmllbmRzVGFiLmVsZW1lbnQsXG4gICAgICAgICAgICBJUlRhYi5lbGVtZW50LFxuICAgICAgICAgICAgT1JUYWIuZWxlbWVudFxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgbmFtZTogJ2RlZmF1bHRBbmltJ1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICBcbiAgICAgIGNvbnN0IHdyYXBwZXIgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoJzxkaXYgY2xhc3M9XCJjbXBfdXNlcnNcIj48L2Rpdj4nKTtcbiAgICBcbiAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQodGFicy5oZWFkZXIuZWxlbWVudCk7XG4gICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKHRhYnMuY29udGVudC5lbGVtZW50KTtcbiAgICBcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXI6IHtcbiAgICAgICAgICBlbGVtZW50OiB3cmFwcGVyXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSlcbiAgO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFVzZXJzQ29tcG9uZW50O1xufSx7XCIuL3RhYnNcIjo2NSxcImNzcC1hcHAvbGlicy90YWJzXCI6ODEsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6ODJ9XSw1NDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBVc2VyUGFnZUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vdXNlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVXNlclBhZ2VDb21wb25lbnRcbn07XG59LHtcIi4vdXNlclwiOjU1fV0sNTU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9odHRwJyk7XG5jb25zdCB7bWFpblRlbXBsYXRlLCBibG9ja01vcmVUZW1wbGF0ZX0gPSByZXF1aXJlKCcuL3RlbXBsYXRlcycpO1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmNvbnN0IGZyaWVuZHNNc2cgPSAnWW91IGFyZSBmcmllbmRzJztcbmNvbnN0IGZyaWVuZFJlcVNlbnRNc2cgPSAnWW91IGhhdmUgc2VudCBhIHJlcXVlc3QgdG8gYmVjb21lIGEgZnJpZW5kJztcblxuZnVuY3Rpb24gaW5zZXJ0U2VuZEZyaWVuZFJlcUJ0bihvcHRpb25zKSB7XG4gIGNvbnN0IHRwbENvbnRyb2xsZXIgPSBvcHRpb25zLnRwbENvbnRyb2xsZXI7XG4gIGNvbnN0IHVzZXJJZCA9IG9wdGlvbnMudXNlcklkO1xuXG4gIGNvbnN0IHNlbmRGcmllbmRSZXFCdG4gPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gICAgPGJ1dHRvbiBjbGFzcz1cImJ0bi1wcmltYXJ5XCI+QWRkIHRvIGZyaWVuZHM8L2J1dHRvbj5cbiAgYCk7XG5cbiAgc2VuZEZyaWVuZFJlcUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBodHRwLmdldChgdXNlcnMvc2VuZC1mcmllbmQtcmVxLyR7dXNlcklkfWApXG4gICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICBpZiAocmVzLmFuc3dlcikge1xuICAgICAgICAgIHRwbENvbnRyb2xsZXIuYWRkaXRpb25hbC5pbm5lckhUTUwgPSBmcmllbmRSZXFTZW50TXNnO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIDtcbiAgfSk7XG5cbiAgdHBsQ29udHJvbGxlci5hY3Rpb25XcmFwcGVyLmFwcGVuZENoaWxkKHNlbmRGcmllbmRSZXFCdG4pO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRCbG9ja01vcmUob3B0aW9ucykge1xuICBjb25zdCB0cGxDb250cm9sbGVyID0gb3B0aW9ucy50cGxDb250cm9sbGVyO1xuICBjb25zdCB1c2VySWQgPSBvcHRpb25zLnVzZXJJZDtcbiAgQk1UcGxDb250cm9sbGVyID0gYmxvY2tNb3JlVGVtcGxhdGUoKTtcbiAgICAgICAgICBcbiAgQk1UcGxDb250cm9sbGVyLmJ0bk1vcmUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgQk1UcGxDb250cm9sbGVyLmxpc3QuY2xhc3NMaXN0LnRvZ2dsZSgnbm8tZGlzcGxheScpO1xuICB9KTtcblxuICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBjb25zdCBpc01vcmVCdG4gPSBldnQudGFyZ2V0LmNsb3Nlc3QoJy5idG4tbW9yZScpID09PSBCTVRwbENvbnRyb2xsZXIuYnRuTW9yZTtcbiAgICBjb25zdCBpc01vcmVCbG9jayA9IGV2dC50YXJnZXQuY2xvc2VzdCgnLm1vcmUtbGlzdCcpID09PSBCTVRwbENvbnRyb2xsZXIubGlzdDtcblxuICAgIGlmICghaXNNb3JlQnRuICYmICFpc01vcmVCbG9jaykge1xuICAgICAgQk1UcGxDb250cm9sbGVyLmxpc3QuY2xhc3NMaXN0LmFkZCgnbm8tZGlzcGxheScpO1xuICAgIH1cbiAgfSk7XG5cbiAgQk1UcGxDb250cm9sbGVyLmJ0blJlbW92ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBodHRwLmdldChgdXNlcnMvcmVtb3ZlLWZyb20tZnJpZW5kcy8ke3VzZXJJZH1gKVxuICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgaWYgKHJlcy5hbnN3ZXIpIHtcbiAgICAgICAgICB0cGxDb250cm9sbGVyLm1lc3NhZ2UuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgdHBsQ29udHJvbGxlci5tb3JlV3JhcHBlci5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICBpbnNlcnRTZW5kRnJpZW5kUmVxQnRuKHsgdHBsQ29udHJvbGxlciwgdXNlcklkIH0pO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIDtcbiAgfSk7XG5cbiAgdHBsQ29udHJvbGxlci5tb3JlV3JhcHBlci5hcHBlbmRDaGlsZChCTVRwbENvbnRyb2xsZXIucm9vdCk7XG59XG5cbmZ1bmN0aW9uIFVzZXJQYWdlQ29tcG9uZW50KHVzZXJJZCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGh0dHAuZ2V0KGB1c2Vycy9nZXRVc2VyQmFzZS8ke3VzZXJJZH1gKVxuICAgICAgLnRoZW4odXNlciA9PiB7XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyh1c2VyKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogJ1VzZXIgd2l0aCB0aGUgc3VwcGxpZWQgaWQgaGFzIG5vdCBiZWVuIGZvdW5kJ1xuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgICAgIHVzZXIsXG4gICAgICAgICAgaHR0cC5nZXQoYHVzZXJzL21lLWZyaWVuZC13aXRoLyR7dXNlcklkfWApLFxuICAgICAgICAgIGh0dHAuZ2V0KGB1c2Vycy9tZS1zZW50LWZyaWVuZC1yZXEvJHt1c2VySWR9YClcbiAgICAgICAgXSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKFt1c2VyLCBpc0ZyaWVuZE9iaiwgZnJpZW5kUmVxXSkgPT4ge1xuICAgICAgICBjb25zdCB0cGxDb250cm9sbGVyID0gbWFpblRlbXBsYXRlKHVzZXIpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGlzRnJpZW5kT2JqLmFuc3dlcikge1xuICAgICAgICAgIHRwbENvbnRyb2xsZXIubWVzc2FnZS50ZXh0Q29udGVudCA9IGZyaWVuZHNNc2c7XG4gICAgICAgICAgaW5zZXJ0QmxvY2tNb3JlKHsgdHBsQ29udHJvbGxlciwgdXNlcklkIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZyaWVuZFJlcS5yZXF1ZXN0ZWQgJiYgZnJpZW5kUmVxLmFtUmVxdWVzdGVyKSB7XG4gICAgICAgICAgdHBsQ29udHJvbGxlci5tZXNzYWdlLnRleHRDb250ZW50ID0gZnJpZW5kUmVxU2VudE1zZztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmcmllbmRSZXEucmVxdWVzdGVkICYmICFmcmllbmRSZXEuYW1SZXF1ZXN0ZXIpIHtcbiAgICAgICAgICBjb25zdCBjb25maXJtRnJpZW5kUmVxQnRuID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0bi1wcmltYXJ5XCI+Q29uZmlybSB5b3UgYXJlIGZyaWVuZHM8L2J1dHRvbj5cbiAgICAgICAgICBgKTtcblxuICAgICAgICAgIGNvbmZpcm1GcmllbmRSZXFCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICBodHRwLmdldChgdXNlcnMvY29uZmlybS1mcmllbmQtcmVxLyR7dXNlcklkfWApXG4gICAgICAgICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlcy5hbnN3ZXIpIHtcbiAgICAgICAgICAgICAgICAgIHRwbENvbnRyb2xsZXIuYWN0aW9uV3JhcHBlci5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICAgIHRwbENvbnRyb2xsZXIubWVzc2FnZS50ZXh0Q29udGVudCA9IGZyaWVuZHNNc2c7XG4gICAgICAgICAgICAgICAgICBpbnNlcnRCbG9ja01vcmUoeyB0cGxDb250cm9sbGVyLCB1c2VySWQgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdHBsQ29udHJvbGxlci5hY3Rpb25XcmFwcGVyLmFwcGVuZENoaWxkKGNvbmZpcm1GcmllbmRSZXFCdG4pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGluc2VydFNlbmRGcmllbmRSZXFCdG4oeyB0cGxDb250cm9sbGVyLCB1c2VySWQgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBjb250cm9sbGVyOiB7XG4gICAgICAgICAgICBlbGVtZW50OiB0cGxDb250cm9sbGVyLnJvb3RcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KVxuICAgIDtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBVc2VyUGFnZUNvbXBvbmVudDtcbn0se1wiLi90ZW1wbGF0ZXNcIjo1NyxcImNzcC1hcHAvbGlicy9odHRwXCI6NzMsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6ODJ9XSw1NjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuZnVuY3Rpb24gYmxvY2tNb3JlKCkge1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cIm1vcmVcIj5cbiAgICAgIDxidXR0b24gY2xhc3M9XCJidG4tbW9yZVwiPjxpIGNsYXNzPVwiaSBpLW1vcmVcIj48L2k+PC9idXR0b24+XG4gICAgICA8ZGl2IGNsYXNzPVwibW9yZS1saXN0IGJsb2NrLXNoYWRvd2VkIG5vLWRpc3BsYXlcIj5cbiAgICAgICAgPHVsPlxuICAgICAgICAgIDxsaT48YnV0dG9uIGNsYXNzPVwicmVtb3ZlXCI+UmVtb3ZlIHVzZXIgZnJvbSBmcmllbmRzPC9idXR0b24+PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xuICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKGh0bWwpO1xuXG4gIHJldHVybiB7XG4gICAgcm9vdDogZWxlbWVudCxcbiAgICBsaXN0OiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tb3JlLWxpc3QnKSxcbiAgICBidG5Nb3JlOiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4tbW9yZScpLFxuICAgIGJ0blJlbW92ZTogZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcucmVtb3ZlJylcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBibG9ja01vcmU7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo4Mn1dLDU3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IG1haW5UZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdHBsJyk7XG5jb25zdCBibG9ja01vcmVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vYmxvY2stbW9yZS50cGwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1haW5UZW1wbGF0ZSxcbiAgYmxvY2tNb3JlVGVtcGxhdGVcbn07XG59LHtcIi4vYmxvY2stbW9yZS50cGxcIjo1NixcIi4vdHBsXCI6NTh9XSw1ODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuZnVuY3Rpb24gdGVtcGxhdGUodXNlcikge1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cImNtcF91c2VyLXBhZ2UgYmxvY2stc2hhZG93ZWRcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJoZWFkZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInRpdGxlXCI+PGgxPiR7dXNlci5maXJzdF9uYW1lfSAke3VzZXIubGFzdF9uYW1lfTwvaDE+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJhZGRpdGlvbmFsXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm1lc3NhZ2VcIj48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnRuLWFjdGlvbi13cmFwcGVyXCI+PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm1vcmUtd3JhcHBlclwiPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgXG4gICAgICA8ZGl2IGNsYXNzPVwiYm9keVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbVwiPkZpcnN0IG5hbWU6ICR7dXNlci5maXJzdF9uYW1lfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbVwiPlNlY29uZCBuYW1lOiAke3VzZXIubGFzdF9uYW1lfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbVwiPlBhdHJvbnltaWM6ICR7dXNlci5wYXRyb255bWljfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbVwiPlVzZXJuYW1lOiAke3VzZXIudXNlcm5hbWV9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpdGVtXCI+RW1haWw6ICR7dXNlci5lbWFpbH08L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xuICBjb25zdCBlbCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcblxuICByZXR1cm4ge1xuICAgIHJvb3Q6IGVsLFxuICAgIGFkZGl0aW9uYWw6IGVsLnF1ZXJ5U2VsZWN0b3IoJy5hZGRpdGlvbmFsJyksXG4gICAgYm9keTogZWwucXVlcnlTZWxlY3RvcignLmJvZHknKSxcbiAgICBtZXNzYWdlOiBlbC5xdWVyeVNlbGVjdG9yKCcubWVzc2FnZScpLFxuICAgIGFjdGlvbldyYXBwZXI6IGVsLnF1ZXJ5U2VsZWN0b3IoJy5idG4tYWN0aW9uLXdyYXBwZXInKSxcbiAgICBtb3JlV3JhcHBlcjogZWwucXVlcnlTZWxlY3RvcignLm1vcmUtd3JhcHBlcicpXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo4Mn1dLDU5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvaHR0cCcpO1xuY29uc3QgdGFiVGVtcGxhdGUgPSByZXF1aXJlKCcuLi9jb21tb24vdGFiLnRwbCcpO1xuY29uc3QgY3JlYXRlVXNlcnNMaXN0ID0gcmVxdWlyZSgnLi4vY29tbW9uL2NyZWF0ZVVzZXJzTGlzdCcpO1xuXG5mdW5jdGlvbiBGcmllbmRzVGFiQ29tcG9uZW50KCkge1xuICByZXR1cm4gaHR0cC5nZXQoJ3VzZXJzL2dldEFsbEZyaWVuZHNCYXNlJylcbiAgICAudGhlbihmcmllbmRzID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0YWJUZW1wbGF0ZSh7XG4gICAgICAgIGNsYXNzTmFtZTogJ3RhYi1hbGxmcmllbmRzJyxcbiAgICAgICAgb25MaXN0RW1wdHk6IHtcbiAgICAgICAgICBlbXB0eTogZnJpZW5kcy5sZW5ndGggPT0gMCxcbiAgICAgICAgICBtZXNzYWdlOiAnWW91IGhhdmUgbm8gZnJpZW5kcyB5ZXQnXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoZnJpZW5kcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGZyaWVuZHNFbGVtZW50cyA9IGNyZWF0ZVVzZXJzTGlzdChmcmllbmRzKTtcbiAgICAgICAgZnJpZW5kc0VsZW1lbnRzLmZvckVhY2goZWwgPT4gZWxlbWVudC5yb290LmFwcGVuZENoaWxkKGVsLnJvb3QpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZWxlbWVudDogZWxlbWVudC5yb290LFxuICAgICAgICBmcmllbmRzQW1vdW50OiBmcmllbmRzLmxlbmd0aFxuICAgICAgfTtcbiAgICB9KVxuICA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRnJpZW5kc1RhYkNvbXBvbmVudDtcbn0se1wiLi4vY29tbW9uL2NyZWF0ZVVzZXJzTGlzdFwiOjYxLFwiLi4vY29tbW9uL3RhYi50cGxcIjo2MixcImNzcC1hcHAvbGlicy9odHRwXCI6NzN9XSw2MDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IHRhYlRlbXBsYXRlID0gcmVxdWlyZSgnLi4vY29tbW9uL3RhYi50cGwnKTtcbmNvbnN0IGNyZWF0ZVVzZXJzTGlzdCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9jcmVhdGVVc2Vyc0xpc3QnKTtcblxuZnVuY3Rpb24gQWxsVXNlcnNUYWJDb21wb25lbnQoKSB7XG4gIHJldHVybiBodHRwLmdldCgndXNlcnMvZ2V0QWxsT3RoZXJVc2Vyc0Jhc2UnKVxuICAgIC50aGVuKHVzZXJzID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0YWJUZW1wbGF0ZSh7XG4gICAgICAgIGNsYXNzTmFtZTogJ3RhYi1hbGx1c2VycycsXG4gICAgICAgIG9uTGlzdEVtcHR5OiB7XG4gICAgICAgICAgZW1wdHk6IHVzZXJzLmxlbmd0aCA9PSAwLFxuICAgICAgICAgIG1lc3NhZ2U6ICdObyBvbmUgYXBhcnQgZnJvbSB5b3UgaGFzIHJlZ2lzdGVyZWQgb24gdGhlIHNpdGUnXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAodXNlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICB1c2Vyc0VsZW1lbnRzID0gY3JlYXRlVXNlcnNMaXN0KHVzZXJzKTtcbiAgICAgICAgdXNlcnNFbGVtZW50cy5mb3JFYWNoKGVsID0+IGVsZW1lbnQucm9vdC5hcHBlbmRDaGlsZChlbC5yb290KSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQucm9vdFxuICAgICAgfTtcbiAgICB9KVxuICA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQWxsVXNlcnNUYWJDb21wb25lbnQ7XG59LHtcIi4uL2NvbW1vbi9jcmVhdGVVc2Vyc0xpc3RcIjo2MSxcIi4uL2NvbW1vbi90YWIudHBsXCI6NjIsXCJjc3AtYXBwL2xpYnMvaHR0cFwiOjczfV0sNjE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5jb25zdCB1c2VySXRlbVRlbXBsYXRlID0gcmVxdWlyZSgnLi91c2VySXRlbS50cGwnKTtcblxuZnVuY3Rpb24gY3JlYXRlVXNlcnNMaXN0KHVzZXJzKSB7XG4gIHJldHVybiB1c2Vycy5tYXAodXNlciA9PiB7XG4gICAgY29uc3QgdXNlckFjY291bnRMaW5rID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICAgICAgPGEgZGF0YS1yb3V0ZT1cInVzZXJzLyR7dXNlci5pZH1cIj4ke3VzZXIudXNlcm5hbWV9PC9hPlxuICAgIGApO1xuICAgIGNvbnN0IHVzZXJJdGVtID0gdXNlckl0ZW1UZW1wbGF0ZSgpO1xuICAgIHVzZXJJdGVtLnVzZXJuYW1lLmFwcGVuZENoaWxkKHVzZXJBY2NvdW50TGluayk7XG4gICAgcmV0dXJuIHVzZXJJdGVtO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVVc2Vyc0xpc3Q7XG59LHtcIi4vdXNlckl0ZW0udHBsXCI6NjMsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6ODJ9XSw2MjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuZnVuY3Rpb24gYWxlcnRPbkVtcHR5KG1lc3NhZ2UpIHtcbiAgcmV0dXJuIC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCJlbXB0eVwiPiR7IG1lc3NhZ2UgfTwvZGl2PlxuICBgO1xufVxuXG5mdW5jdGlvbiB0YWJUZW1wbGF0ZShvcHRpb25zKSB7XG4gIGNvbnN0IGh0bWwgPSAvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwiJHsgb3B0aW9ucy5jbGFzc05hbWUgfVwiPlxuICAgICAgJHtcbiAgICAgICAgb3B0aW9ucy5vbkxpc3RFbXB0eSAmJiBvcHRpb25zLm9uTGlzdEVtcHR5LmVtcHR5ID9cbiAgICAgICAgYWxlcnRPbkVtcHR5KG9wdGlvbnMub25MaXN0RW1wdHkubWVzc2FnZSkgOlxuICAgICAgICAnJ1xuICAgICAgfVxuICAgIDwvZGl2PlxuICBgO1xuICBjb25zdCBlbCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcblxuICByZXR1cm4ge1xuICAgIHJvb3Q6IGVsXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGFiVGVtcGxhdGU7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo4Mn1dLDYzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiB1c2VySXRlbVRlbXBsYXRlKCkge1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cInVzZXItaXRlbVwiPlxuICAgICAgPGRpdiBjbGFzcz1cImF2YXRhclwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInVzZXJuYW1lXCI+PC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG4gIGNvbnN0IGVsID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKGh0bWwpO1xuXG4gIHJldHVybiB7XG4gICAgcm9vdDogZWwsXG4gICAgYXZhdGFyOiBlbC5xdWVyeVNlbGVjdG9yKCcuYXZhdGFyJyksXG4gICAgdXNlcm5hbWU6IGVsLnF1ZXJ5U2VsZWN0b3IoJy51c2VybmFtZScpXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdXNlckl0ZW1UZW1wbGF0ZTtcbn0se1wiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjgyfV0sNjQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9odHRwJyk7XG5jb25zdCB0YWJUZW1wbGF0ZSA9IHJlcXVpcmUoJy4uL2NvbW1vbi90YWIudHBsJyk7XG5jb25zdCBjcmVhdGVVc2Vyc0xpc3QgPSByZXF1aXJlKCcuLi9jb21tb24vY3JlYXRlVXNlcnNMaXN0Jyk7XG5cbmZ1bmN0aW9uIEluY29taW5nUmVxdWVzdHNUYWJDb21wb25lbnQoKSB7XG4gIHJldHVybiBodHRwLmdldCgndXNlcnMvZ2V0QWxsSW5jb21pbmdSZXF1ZXN0cycpXG4gICAgLnRoZW4ocmVxdWVzdGVycyA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGFiVGVtcGxhdGUoe1xuICAgICAgICBjbGFzc05hbWU6ICd0YWItYWxsSW5jUmVxcycsXG4gICAgICAgIG9uTGlzdEVtcHR5OiB7XG4gICAgICAgICAgZW1wdHk6IHJlcXVlc3RlcnMubGVuZ3RoID09IDAsXG4gICAgICAgICAgbWVzc2FnZTogJ05vIGluY29taW5nIHJlcXVlc3RzIHNlbnQgeWV0J1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKHJlcXVlc3RlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICByZXF1ZXN0ZXJzRWxlbWVudHMgPSBjcmVhdGVVc2Vyc0xpc3QocmVxdWVzdGVycyk7XG4gICAgICAgIHJlcXVlc3RlcnNFbGVtZW50cy5mb3JFYWNoKGVsID0+IGVsZW1lbnQucm9vdC5hcHBlbmRDaGlsZChlbC5yb290KSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQucm9vdCxcbiAgICAgICAgcmVxdWVzdHNBbW91bnQ6IHJlcXVlc3RlcnMubGVuZ3RoXG4gICAgICB9O1xuICAgIH0pXG4gIDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbmNvbWluZ1JlcXVlc3RzVGFiQ29tcG9uZW50O1xufSx7XCIuLi9jb21tb24vY3JlYXRlVXNlcnNMaXN0XCI6NjEsXCIuLi9jb21tb24vdGFiLnRwbFwiOjYyLFwiY3NwLWFwcC9saWJzL2h0dHBcIjo3M31dLDY1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEFsbFVzZXJzVGFiQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9hbGwtdXNlcnMnKTtcbmNvbnN0IEZyaWVuZHNUYWJDb21wb25lbnQgPSByZXF1aXJlKCcuL2FsbC1mcmllbmRzJylcbmNvbnN0IEluY29taW5nUmVxdWVzdHNUYWJDb21wb25lbnQgPSByZXF1aXJlKCcuL2luY29taW5nLXJlcXVlc3RzJyk7XG5jb25zdCBPdXRnb2luZ1JlcXVlc3RzVGFiQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9vdXRnb2luZy1yZXF1ZXN0cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQWxsVXNlcnNUYWJDb21wb25lbnQsXG4gIEZyaWVuZHNUYWJDb21wb25lbnQsXG4gIEluY29taW5nUmVxdWVzdHNUYWJDb21wb25lbnQsXG4gIE91dGdvaW5nUmVxdWVzdHNUYWJDb21wb25lbnRcbn07XG59LHtcIi4vYWxsLWZyaWVuZHNcIjo1OSxcIi4vYWxsLXVzZXJzXCI6NjAsXCIuL2luY29taW5nLXJlcXVlc3RzXCI6NjQsXCIuL291dGdvaW5nLXJlcXVlc3RzXCI6NjZ9XSw2NjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IHRhYlRlbXBsYXRlID0gcmVxdWlyZSgnLi4vY29tbW9uL3RhYi50cGwnKTtcbmNvbnN0IGNyZWF0ZVVzZXJzTGlzdCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9jcmVhdGVVc2Vyc0xpc3QnKTtcblxuZnVuY3Rpb24gT3V0Z29pbmdSZXF1ZXN0c1RhYkNvbXBvbmVudCgpIHtcbiAgcmV0dXJuIGh0dHAuZ2V0KCd1c2Vycy9nZXRBbGxPdXRnb2luZ1JlcXVlc3RzJylcbiAgICAudGhlbihyZXF1ZXN0ZWVzID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0YWJUZW1wbGF0ZSh7XG4gICAgICAgIGNsYXNzTmFtZTogJ3RhYi1hbGxJbmNSZXFzJyxcbiAgICAgICAgb25MaXN0RW1wdHk6IHtcbiAgICAgICAgICBlbXB0eTogcmVxdWVzdGVlcy5sZW5ndGggPT0gMCxcbiAgICAgICAgICBtZXNzYWdlOiAnTm8gb3V0Z29pbmcgcmVxdWVzdHMgc2VudCB5ZXQnXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAocmVxdWVzdGVlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJlcXVlc3RlZXNFbGVtZW50cyA9IGNyZWF0ZVVzZXJzTGlzdChyZXF1ZXN0ZWVzKTtcbiAgICAgICAgcmVxdWVzdGVlc0VsZW1lbnRzLmZvckVhY2goZWwgPT4gZWxlbWVudC5yb290LmFwcGVuZENoaWxkKGVsLnJvb3QpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZWxlbWVudDogZWxlbWVudC5yb290LFxuICAgICAgICByZXF1ZXN0c0Ftb3VudDogcmVxdWVzdGVlcy5sZW5ndGhcbiAgICAgIH07XG4gICAgfSlcbiAgO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE91dGdvaW5nUmVxdWVzdHNUYWJDb21wb25lbnQ7XG59LHtcIi4uL2NvbW1vbi9jcmVhdGVVc2Vyc0xpc3RcIjo2MSxcIi4uL2NvbW1vbi90YWIudHBsXCI6NjIsXCJjc3AtYXBwL2xpYnMvaHR0cFwiOjczfV0sNjc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9odHRwJyk7XG5jb25zdCB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdHBsJyk7XG5cbmNvbnN0IFZlcmlmaWNhdGlvbkNvbXBvbmVudCA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBxdWVyeVBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG4gIGNvbnN0IHVzZXJJZCA9IHF1ZXJ5UGFyYW1zLmdldCgnaWQnKTtcbiAgY29uc3QgdG9rZW4gPSBxdWVyeVBhcmFtcy5nZXQoJ3Rva2VuJyk7XG4gIGNvbnN0IHRwbENvbnRyb2xsZXIgPSB0ZW1wbGF0ZSgpO1xuICBsZXQgZXJyb3JzID0gW107XG5cbiAgaWYgKCF1c2VySWQpIHtcbiAgICBlcnJvcnMucHVzaCgndXNlciBpZCcpO1xuICB9XG5cbiAgaWYgKCF0b2tlbikge1xuICAgIGVycm9ycy5wdXNoKCd0b2tlbicpO1xuICB9XG5cbiAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGBZb3UgZGlkIG5vdCBzdXBwbHkgJHsgZXJyb3JzLmpvaW4oJyBhbmQgJykgfWA7XG4gICAgdHBsQ29udHJvbGxlci5wYXJ0cy5pbmZvV3JhcHBlci50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gIH1cblxuICB0cGxDb250cm9sbGVyLnBhcnRzLnNwaW5uZXJXcmFwcGVyLnRleHRDb250ZW50ID0gJ0xvYWRpbmcuLi4nO1xuXG4gIGNvbnN0IGh0dHBHZXQgPSBodHRwLmdldCgnYXV0aC92ZXJpZnknICsgd2luZG93LmxvY2F0aW9uLnNlYXJjaClcbiAgY29uc3Qgc3Bpbm5lclByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0cGxDb250cm9sbGVyLnBhcnRzLnNwaW5uZXJXcmFwcGVyLmlubmVySFRNTCA9ICcnO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0sIDMwMDApO1xuICB9KTtcblxuICBQcm9taXNlLmFsbChbaHR0cEdldCwgc3Bpbm5lclByb21pc2VdKVxuICAgIC50aGVuKGFyciA9PiBhcnJbMF0pXG4gICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgbGV0IG1lc3NhZ2U7XG5cbiAgICAgIGlmIChyZXMuc3VjY2Vzcykge1xuICAgICAgICAvLyBtZXNzYWdlID0gJ1lvdXIgYWNjb3VudCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgdmVyaWZpZWQuIFlvdSB3aWxsIGJlIHJlZGlyZWN0ZWQgdG8gdGhlIGRhc2hib2FyZCBpbiAzIHNlY29uZHMnO1xuICAgICAgICBtZXNzYWdlID0gJ1lvdXIgYWNjb3VudCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgdmVyaWZpZWQnO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHN3aXRjaChyZXMuZXJyb3IudHlwZSkge1xuICAgICAgICAgIGNhc2UgJ25vX3VzZXInOlxuICAgICAgICAgICAgbWVzc2FnZSA9ICdVc2VyIHdpdGggdGhlIHNwZWNpZmllZCBpZCBkb2VzIG5vdCBleGlzdCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd2ZXJpZmllZCc6XG4gICAgICAgICAgICBtZXNzYWdlID0gJ1VzZXIgaGFzIGFscmVhZHkgYmVlbiB2ZXJpZmllZCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdub3RfZm91bmQnOlxuICAgICAgICAgICAgbWVzc2FnZSA9ICdObyB2ZXJpZmljYXRpb24gdG9rZW4gd2FzIGZvdW5kIGZvciB0aGlzIHVzZXJuYW1lIG9yIHVzZXIgd2l0aCB0aGUgc3VwcGxpZWQgdXNlcm5hbWUgZG9lcyBub3QgZXhpc3QnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnbm9fbWF0Y2gnOlxuICAgICAgICAgICAgbWVzc2FnZSA9ICdUb2tlbnMgZG8gbm90IG1hdGNoJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2V4cGlyZWQnOlxuICAgICAgICAgICAgbWVzc2FnZSA9ICdUb2tlbiBoYXMgYmVlbiBleHBpcmVkJztcbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ1NlbmQgdmVyaWZpY2F0aW9uIHRva2VuJztcbiAgICAgICAgICAgIHRwbENvbnRyb2xsZXIucGFydHMuc2VuZFRva2VuQnV0dG9uV3JhcHBlci5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICBodHRwLmdldChgYXV0aC92ZXJpZnkvc2VuZC12ZXJpZmljYXRpb24tdG9rZW4/aWQ9JHt1c2VySWR9YClcbiAgICAgICAgICAgICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZTtcblxuICAgICAgICAgICAgICAgICAgaWYgKHJlcy5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSAnWW91IGhhdmUgYmVlbiBzdWNjZXNzZnVsbHkgc2VudCBuZXcgdmVyaWZpY2F0aW9uIHRva2VuJztcbiAgICAgICAgICAgICAgICAgICAgdHBsQ29udHJvbGxlci5wYXJ0cy5zZW5kVG9rZW5JbmZvV3JhcHBlci50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdHBsQ29udHJvbGxlci5wYXJ0cy5zZW5kVG9rZW5JbmZvV3JhcHBlci50ZXh0Q29udGVudCA9IHJlcy5lcnJvci5tZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSByZXMuZXJyb3IubWVzc2FnZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRwbENvbnRyb2xsZXIucGFydHMuaW5mb1dyYXBwZXIudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xuICAgIH0pXG4gIDtcblxuICByZXR1cm4ge1xuICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgY29udHJvbGxlcjoge1xuICAgICAgZWxlbWVudDogdHBsQ29udHJvbGxlci5lbGVtZW50XG4gICAgfVxuICB9O1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZlcmlmaWNhdGlvbkNvbXBvbmVudDtcbn0se1wiLi90cGxcIjo2OCxcImNzcC1hcHAvbGlicy9odHRwXCI6NzN9XSw2ODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuZnVuY3Rpb24gdGVtcGxhdGUoZGF0YSkge1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cImNtcF92ZXJpZlwiPlxuICAgICAgPGRpdiBjbGFzcz1cInNwaW5uZXItd3JcIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJpbmZvLXdyXCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic2VuZHRva2VuLXdyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZW5kdG9rZW4taW5mb1wiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwic2VuZHRva2VuLWJ1dHRvbi13clwiPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG5cbiAgY29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcblxuICByZXR1cm4ge1xuICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgcGFydHM6IHtcbiAgICAgIHNwaW5uZXJXcmFwcGVyOiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zcGlubmVyLXdyJyksXG4gICAgICBpbmZvV3JhcHBlcjogZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuaW5mby13cicpLFxuICAgICAgc2VuZFRva2VuSW5mb1dyYXBwZXI6IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNlbmR0b2tlbi1pbmZvJyksXG4gICAgICBzZW5kVG9rZW5CdXR0b25XcmFwcGVyOiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZW5kdG9rZW4tYnV0dG9uLXdyJylcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo4Mn1dLDY5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm1Db250cm9sID0gcmVxdWlyZSgnLi9Gb3JtQ29udHJvbCcpO1xuXG5jb25zdCB2YWxpZGF0ZSA9IGZ1bmN0aW9uKHZhbGlkYXRvciwgZm9ybSkge1xuICBsZXQgaXRlbXMgPSBmb3JtLmVycm9ycy5pdGVtcztcbiAgbGV0IHZhbHVlcyA9IHZhbGlkYXRvci5jb250cm9scy5tYXAoY3RybCA9PiBjdHJsLnZhbHVlKTtcbiAgbGV0IHJlc3VsdCA9IHZhbGlkYXRvci5oYW5kbGVyKHZhbHVlcyk7XG4gIGlmICghcmVzdWx0LnZhbGlkICYmICFpdGVtc1t2YWxpZGF0b3IubmFtZV0pIHtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSByZXN1bHQubWVzc2FnZTtcbiAgICBpdGVtc1t2YWxpZGF0b3IubmFtZV0gPSB7XG4gICAgICByZWY6IGVsZW1lbnRcbiAgICB9O1xuICAgIGZvcm0uZXJyb3JzLnJlZi5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHJlc3VsdC52YWxpZCAmJiBpdGVtc1t2YWxpZGF0b3IubmFtZV0pIHtcbiAgICBpdGVtc1t2YWxpZGF0b3IubmFtZV0ucmVmLnJlbW92ZSgpO1xuICAgIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSA9IG51bGw7XG4gIH1cbn07XG5cbmNvbnN0IEZvcm0gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIGNvbnN0IGZvcm1Db250cm9scyA9IG9wdGlvbnMuY29udHJvbHMubWFwKGN0cmwgPT4gbmV3IEZvcm1Db250cm9sKGN0cmwpKTtcbiAgbGV0IHZhbGlkYXRvcnMgPSBvcHRpb25zLnZhbGlkYXRvcnMgfHwgW107XG4gIGxldCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO1xuICBsZXQgZXJyb3JzV3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBsZXQgc3VibWl0V3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBsZXQgZm9ybUNvbnRyb2xzUmVmcyA9IGZvcm1Db250cm9scy5tYXAoY3RybCA9PiBjdHJsLnJlZik7XG4gIGVycm9yc1dyYXBwZXIuY2xhc3NOYW1lID0gJ2Vycm9ycyBuby1kaXNwbGF5JztcbiAgc3VibWl0V3JhcHBlci5jbGFzc05hbWUgPSAnYWN0aW9ucyc7XG4gIHN1Ym1pdFdyYXBwZXIuaW5uZXJIVE1MID0gJzxpbnB1dCB0eXBlPVwic3VibWl0XCIgdmFsdWU9XCJTdWJtaXRcIiAvPic7XG4gIHN1Ym1pdFJlZiA9IHN1Ym1pdFdyYXBwZXIucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInN1Ym1pdFwiXScpO1xuXG4gIFtcbiAgICBlcnJvcnNXcmFwcGVyLFxuICAgIC4uLmZvcm1Db250cm9sc1JlZnMsXG4gICAgc3VibWl0V3JhcHBlclxuICBdLmZvckVhY2goaXRlbSA9PiB3cmFwcGVyLmFwcGVuZENoaWxkKGl0ZW0pKTtcbiAgXG4gIGxldCBmb3JtID0ge1xuICAgIHJlZjogd3JhcHBlcixcbiAgICBlcnJvcnM6IHtcbiAgICAgIHJlZjogZXJyb3JzV3JhcHBlcixcbiAgICAgIGl0ZW1zOiB7fVxuICAgIH0sXG4gICAgY29udHJvbHM6IGZvcm1Db250cm9scyxcbiAgICBzdWJtaXQ6IHtcbiAgICAgIGhhbmRsZXI6IG9wdGlvbnMuc3VibWl0LmhhbmRsZXJcbiAgICB9XG4gIH07XG5cbiAgb3B0aW9ucy52YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHtcbiAgICB2YWxpZGF0b3IuY29udHJvbHMuZm9yRWFjaChjb250cm9sID0+IHtcbiAgICAgIGNvbnRyb2wuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICAgIHZhbGlkYXRlKHZhbGlkYXRvciwgZm9ybSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgc3VibWl0UmVmLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICBsZXQgZXJyb3JzQW1vdW50ID0gMDtcbiAgICB2YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHZhbGlkYXRlKHZhbGlkYXRvciwgZm9ybSkpO1xuICAgIGZvcm0uY29udHJvbHMuZm9yRWFjaChjdHJsID0+IGN0cmwudmFsaWRhdGUoKSk7XG4gICAgT2JqZWN0LnZhbHVlcyhmb3JtLmVycm9ycy5pdGVtcykuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgaWYgKCEhdmFsKSB7XG4gICAgICAgIGVycm9yc0Ftb3VudCsrO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGZvcm0uY29udHJvbHMuZm9yRWFjaChjdHJsID0+IHtcbiAgICAgIE9iamVjdC52YWx1ZXMoY3RybC5lcnJvcnMuaXRlbXMpLmZvckVhY2godmFsID0+IHtcbiAgICAgICAgaWYgKCEhdmFsKSB7XG4gICAgICAgICAgZXJyb3JzQW1vdW50Kys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmIChlcnJvcnNBbW91bnQgPiAwKSB7XG4gICAgICBjb25zb2xlLmxvZygnRm9ybSBpcyBub3QgdmFsaWQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IHZhbHVlcyA9IHt9O1xuICAgIGZvcm0uY29udHJvbHMuZm9yRWFjaChjdHJsID0+IHtcbiAgICAgIHZhbHVlc1tjdHJsLmtleU5hbWVdID0gY3RybC52YWx1ZTtcbiAgICB9KTtcbiAgICBmb3JtLnN1Ym1pdC5oYW5kbGVyKHZhbHVlcywgZXZ0KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZvcm07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvcm07XG59LHtcIi4vRm9ybUNvbnRyb2xcIjo3MH1dLDcwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHZhbGlkYXRlID0gZnVuY3Rpb24oY29udHJvbCkge1xuICBjb250cm9sID0gY29udHJvbCB8fCB0aGlzO1xuICBsZXQgYWRkID0ge307XG4gIGxldCByZW1vdmUgPSB7fTtcbiAgbGV0IGl0ZW1zID0gY29udHJvbC5lcnJvcnMuaXRlbXM7XG4gIGxldCB2YWxpZGF0b3JzID0gY29udHJvbC52YWxpZGF0b3JzO1xuXG4gIGlmICghY29udHJvbC5yZXF1aXJlZCAmJiBjb250cm9sLnZhbHVlID09PSAnJykge1xuICAgIE9iamVjdC5rZXlzKGl0ZW1zKS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgaWYgKCEhaXRlbXNbaXRlbV0pIHJlbW92ZVtpdGVtXSA9IHRydWU7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoY29udHJvbC5yZXF1aXJlZCAmJiBjb250cm9sLnZhbHVlID09PSAnJykge1xuICAgIGlmICghaXRlbXNbJ3JlcXVpcmVkJ10pIHtcbiAgICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJ1RoaXMgZmllbGQgaXMgcmVxdWlyZWQnO1xuICAgICAgaXRlbXNbJ3JlcXVpcmVkJ10gPSB7XG4gICAgICAgIHJlZjogZWxlbWVudFxuICAgICAgfVxuICAgICAgY29udHJvbC5lcnJvcnMucmVmLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChjb250cm9sLnZhbHVlLmxlbmd0aCA+IDAgJiYgISFpdGVtc1sncmVxdWlyZWQnXSkge1xuICAgIHJlbW92ZVsncmVxdWlyZWQnXSA9IHRydWU7XG4gIH1cblxuICBpZiAoY29udHJvbC52YWx1ZSAhPT0gJycpIHtcbiAgICB2YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHtcbiAgICAgIGxldCByZXN1bHQgPSB2YWxpZGF0b3IuaGFuZGxlcihjb250cm9sLnZhbHVlLCBjb250cm9sKTtcbiAgICAgIGlmICghcmVzdWx0LnZhbGlkICYmICFpdGVtc1t2YWxpZGF0b3IubmFtZV0pIHtcbiAgICAgICAgYWRkW3ZhbGlkYXRvci5uYW1lXSA9IHJlc3VsdDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHJlc3VsdC52YWxpZCAmJiBpdGVtc1t2YWxpZGF0b3IubmFtZV0pIHtcbiAgICAgICAgcmVtb3ZlW3ZhbGlkYXRvci5uYW1lXSA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBPYmplY3Qua2V5cyhhZGQpLmZvckVhY2goZXJyb3IgPT4ge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGFkZFtlcnJvcl0ubWVzc2FnZTtcbiAgICBpdGVtc1tlcnJvcl0gPSB7XG4gICAgICByZWY6IGVsZW1lbnRcbiAgICB9O1xuICAgIGNvbnRyb2wuZXJyb3JzLnJlZi5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgfSk7XG5cbiAgT2JqZWN0LmtleXMocmVtb3ZlKS5mb3JFYWNoKGVycm9yID0+IHtcbiAgICBpdGVtc1tlcnJvcl0ucmVmLnJlbW92ZSgpO1xuICAgIGl0ZW1zW2Vycm9yXSA9IG51bGw7XG4gIH0pO1xuXG4gIGNvbnN0IGVycm9yc0Jvb2wgPSBPYmplY3Qua2V5cyhpdGVtcykubWFwKGl0ZW0gPT4gISFpdGVtc1tpdGVtXSk7XG4gIGNvbnN0IGVycm9yc051bSA9IGVycm9yc0Jvb2wuZmlsdGVyKGUgPT4gZSkubGVuZ3RoO1xuICBcbiAgaWYgKGVycm9yc051bSA+IDApIHtcbiAgICBjb250cm9sLmVycm9ycy5yZWYuY2xhc3NMaXN0LnJlbW92ZSgnbm8tZGlzcGxheScpO1xuICB9XG4gIGVsc2Uge1xuICAgIGNvbnRyb2wuZXJyb3JzLnJlZi5jbGFzc0xpc3QuYWRkKCduby1kaXNwbGF5Jyk7XG4gIH1cbn07XG5cbmNvbnN0IGJpbmRFcnJvckhhbmRsaW5nID0gZnVuY3Rpb24oY29udHJvbCkge1xuICBjb250cm9sLmNvbnRyb2xSZWYuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgdmFsaWRhdGUoY29udHJvbCk7XG4gIH0pO1xufTtcblxuY29uc3QgdGFnSW5wdXQgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIGxldCBwcmVwZW5kID0gb3B0aW9ucy5wcmVwZW5kIHx8ICcnO1xuICBsZXQgYXBwZW5kID0gb3B0aW9ucy5hcHBlbmQgfHwgJyc7XG4gIGxldCBsYWJlbCA9XG4gICAgb3B0aW9ucy5sYWJlbCA/XG4gICAgYDxsYWJlbCBmb3I9XCIke29wdGlvbnMuaWR9XCI+JHtvcHRpb25zLmxhYmVsfTwvbGFiZWw+YCA6XG4gICAgJyc7XG4gIGxldCBlcnJvcnMgPSBvcHRpb25zLmVycm9ycztcbiAgbGV0IGVycm9yc1Bvc2l0aW9uID1cbiAgICBlcnJvcnMgJiYgZXJyb3JzLnBvc2l0aW9uID9cbiAgICBlcnJvcnMgJiYgZXJyb3JzLnBvc2l0aW9uIDpcbiAgICAnYmVmb3JlQXBwZW5kJztcbiAgbGV0IGVycm9yc0NsYXNzID1cbiAgICBlcnJvcnMgJiYgZXJyb3JzLmNsYXNzID9cbiAgICBlcnJvcnMgJiYgZXJyb3JzLmNsYXNzIDpcbiAgICAnZXJyb3JzJ1xuICBsZXQgZXJyb3JzSFRNTCA9IGA8ZGl2IGNsYXNzPVwiJHtlcnJvcnNDbGFzc31cIj48L2Rpdj5gO1xuICBsZXQgY29udHJvbEhUTUwgPSAnPGlucHV0Pic7XG4gIGxldCBodG1sO1xuICBcbiAgc3dpdGNoIChlcnJvcnNQb3NpdGlvbikge1xuICAgIGNhc2UgJ2JlZm9yZVByZXBlbmQnOlxuICAgICAgaHRtbCA9IGVycm9yc0hUTUwgKyBwcmVwZW5kICsgbGFiZWwgKyBjb250cm9sSFRNTCArIGFwcGVuZDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JlZm9yZUxhYmVsJzpcbiAgICAgIGh0bWwgPSBwcmVwZW5kICsgZXJyb3JzSFRNTCArIGxhYmVsICsgY29udHJvbEhUTUwgKyBhcHBlbmQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdiZWZvcmVDb250cm9sJzpcbiAgICAgIGh0bWwgPSBwcmVwZW5kICsgbGFiZWwgKyBlcnJvcnNIVE1MICsgY29udHJvbEhUTUwgKyBhcHBlbmQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdiZWZvcmVBcHBlbmQnOlxuICAgICAgaHRtbCA9IHByZXBlbmQgKyBsYWJlbCArIGNvbnRyb2xIVE1MICsgZXJyb3JzSFRNTCArIGFwcGVuZDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2FmdGVyQXBwZW5kJzpcbiAgICAgIGh0bWwgPSBwcmVwZW5kICsgbGFiZWwgKyBjb250cm9sSFRNTCArIGFwcGVuZCArIGVycm9yc0hUTUw7XG4gICAgICBicmVhaztcbiAgfVxuXG4gIGxldCBjb250cm9sSWQgPSAnaW5wdXQnOyAvLyB0byBpZGVudGlmeSBpdCBpbiB0aGUgRE9NIHdoZW4gaXQncyByZW5kZXJlZFxuICBsZXQgZXJyb3JzSWQgPSBlcnJvcnNDbGFzczsgLy8gZm9yIHRoaXMgdG9vXG5cbiAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgd3JhcHBlci5jbGFzc05hbWUgPSAob3B0aW9ucy53cmFwcGVyICYmIG9wdGlvbnMud3JhcHBlci5jbGFzcykgfHwgJyc7XG4gIHdyYXBwZXIuaW5uZXJIVE1MID0gaHRtbDtcbiAgbGV0IGNvbnRyb2xSZWYgPSB3cmFwcGVyLnF1ZXJ5U2VsZWN0b3IoY29udHJvbElkKTtcbiAgbGV0IGVycm9yc1JlZiA9IHdyYXBwZXIucXVlcnlTZWxlY3RvcignLicrZXJyb3JzSWQpO1xuICBlcnJvcnNSZWYuY2xhc3NMaXN0LmFkZCgnbm8tZGlzcGxheScpO1xuXG4gIGlmIChvcHRpb25zLmF0dHJpYnV0ZXMpIHtcbiAgICBvcHRpb25zLmF0dHJpYnV0ZXMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgIGNvbnRyb2xSZWYuc2V0QXR0cmlidXRlKGF0dHIubmFtZSwgYXR0ci52YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBsZXQgY29udHJvbCA9IHtcbiAgICBrZXlOYW1lOiBvcHRpb25zLmtleU5hbWUgfHwgJycsXG4gICAgcmVmOiB3cmFwcGVyLFxuICAgIGNvbnRyb2xSZWY6IGNvbnRyb2xSZWYsXG4gICAgZXJyb3JzOiB7XG4gICAgICByZWY6IGVycm9yc1JlZixcbiAgICAgIGl0ZW1zOiB7fVxuICAgIH0sXG4gICAgcmVxdWlyZWQ6IG9wdGlvbnMucmVxdWlyZWQgfHwgZmFsc2UsXG4gICAgdmFsaWQ6IG51bGwsXG4gICAgdmFsaWRhdG9yczogb3B0aW9ucy52YWxpZGF0b3JzIHx8IFtdLFxuICAgIHZhbGlkYXRlOiB2YWxpZGF0ZVxuICB9O1xuXG4gIGJpbmRFcnJvckhhbmRsaW5nKGNvbnRyb2wpO1xuXG4gIGlmIChvcHRpb25zLmhhbmRsZXJzT2Jqcykge1xuICAgIGxldCBldmVudHMgPSB7fTtcbiAgICBsZXQgaGFuZGxlcnNPYmpzID0gb3B0aW9ucy5oYW5kbGVycztcbiAgICBoYW5kbGVyc09ianMuZm9yRWFjaChvYmogPT4ge1xuICAgICAgaWYgKCFldmVudHNbb2JqLmV2ZW50XSkge1xuICAgICAgICBldmVudHNbb2JqLmV2ZW50XSA9IFtdO1xuICAgICAgfVxuICAgICAgZXZlbnRzW29iai5ldmVudF0ucHVzaChvYmouaGFuZGxlcik7XG4gICAgfSk7XG4gICAgT2JqZWN0LmtleXMoZXZlbnRzKS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XG4gICAgICBjb250cm9sLmNvbnRyb2xSZWYuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGV2dCA9PiB7XG4gICAgICAgIGV2ZW50c1tldmVudE5hbWVdLmZvckVhY2goaGFuZGxlciA9PiBoYW5kbGVyKGV2dCkpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29udHJvbCwgJ3ZhbHVlJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7cmV0dXJuIHRoaXMuY29udHJvbFJlZi52YWx1ZX0sXG4gICAgc2V0OiBmdW5jdGlvbihuZXdWYWx1ZSkge3RoaXMuY29udHJvbFJlZi52YWx1ZSA9IG5ld1ZhbHVlfVxuICB9KVxuXG4gIHJldHVybiBjb250cm9sO1xufTtcblxuY29uc3QgZ2V0SGFuZGxlciA9IGZ1bmN0aW9uKHRhZykge1xuICBsZXQgZm47XG4gIC8vIFN3aXRjaCBzZWVtcyB0byBiZSBmYXN0ZXIgdGhhbiBvYmplY3QgbG9vayB1cFxuICAvLyBTZWFyY2ggZm9yICdqcyBzd2l0Y2ggdnMgb2JqZWN0J1xuICBzd2l0Y2godGFnKSB7XG4gICAgY2FzZSAnaW5wdXQnOlxuICAgICAgZm4gPSB0YWdJbnB1dDtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiBmbjtcbn07XG5cbmNvbnN0IEZvcm1Db250cm9sID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICByZXR1cm4gZ2V0SGFuZGxlcihvcHRpb25zLnRhZykob3B0aW9ucylcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybUNvbnRyb2w7XG59LHt9XSw3MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBGb3JtID0gcmVxdWlyZSgnLi9Gb3JtJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybTtcbn0se1wiLi9Gb3JtXCI6Njl9XSw3MjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBtaW5MZW5ndGggPSBmdW5jdGlvbih2YWx1ZSwgY29udHJvbCkge1xuICByZXR1cm4ge1xuICAgIHZhbGlkOiB2YWx1ZS5sZW5ndGggPj0gNSxcbiAgICBtZXNzYWdlOiAnVGhpcyBmaWVsZHNcXCdzIGxlbmd0aCBpcyBsZXNzIHRoYW4gNSBjaGFycydcbiAgfVxufTtcblxuY29uc3QgbWF4TGVuZ3RoID0gZnVuY3Rpb24odmFsdWUsIGNvbnRyb2wpIHtcbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogdmFsdWUubGVuZ3RoIDw9IDEwLFxuICAgIG1lc3NhZ2U6ICdUaGlzIGZpZWxkc1xcJ3MgbGVuZ3RoIGlzIGdyZWF0ZXIgdGhhbiAxMCBjaGFycydcbiAgfVxufTtcblxuY29uc3Qgc3RhcnRzV2l0aE51bWJlciA9IGZ1bmN0aW9uKHZhbHVlLCBjb250cm9sKSB7XG4gIHJldHVybiB7XG4gICAgdmFsaWQ6ICEvXlxcZCsvaS50ZXN0KHZhbHVlKSxcbiAgICBtZXNzYWdlOiAnVXNlcm5hbWUgbXVzdCBub3Qgc3RhcnQgd2l0aCBudW1iZXJzJ1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWluTGVuZ3RoLFxuICBtYXhMZW5ndGgsXG4gIHN0YXJ0c1dpdGhOdW1iZXJcbn07XG59LHt9XSw3MzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5mdW5jdGlvbiBjb25maWd1cmUob3B0aW9ucykge1xuICBsZXQgbG9jYXRpb24gPSBvcHRpb25zLmxvY2F0aW9uO1xuICBsb2NhdGlvbiA9IGxvY2F0aW9uW2xvY2F0aW9uLmxlbmd0aC0xXSA9PT0gJy8nID9cbiAgICBsb2NhdGlvbiA6XG4gICAgbG9jYXRpb24gKyAnLyc7XG4gIFxuICB0aGlzLmxvY2F0aW9uID0gbG9jYXRpb247XG59XG5cbmZ1bmN0aW9uIGdldENvcnJlY3RVcmwodXJsKSB7XG4gIHVybCA9IHVybFswXSA9PT0gJy8nID9cbiAgICB1cmwuc2xpY2UoMSkgOlxuICAgIHVybDtcblxuICByZXR1cm4gdXJsO1xufVxuXG5mdW5jdGlvbiBzZXRBdXRob3JpemF0aW9uSGVhZGVyKHhocikge1xuICBjb25zdCB0b2tlbiA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYXV0aF90b2tlbicpO1xuXG4gIGlmICh0b2tlbikge1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdhdXRob3JpemF0aW9uJywgYEJlYXJlciAke3Rva2VufWApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldCh1cmwsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHRoaXMubWFrZVJlcXVlc3QoJ0dFVCcsIHVybCwgbnVsbCwgb3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIHBvc3QodXJsLCBib2R5LCBvcHRpb25zKSB7XG4gIHJldHVybiB0aGlzLm1ha2VSZXF1ZXN0KCdQT1NUJywgdXJsLCBib2R5LCBvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gbWFrZVJlcXVlc3QobWV0aG9kLCB1cmwsIGJvZHksIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB1cmwgPSB0aGlzLmdldENvcnJlY3RVcmwodXJsKTtcblxuICAgIHhoci5vcGVuKG1ldGhvZCwgdGhpcy5sb2NhdGlvbiArIHVybCk7XG5cbiAgICBpZiAobWV0aG9kID09ICdQT1NUJykge1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXG4gICAgICAgICdDb250ZW50LVR5cGUnLFxuICAgICAgICAob3B0aW9ucyAmJiBvcHRpb25zLmNvbnRlbnRUeXBlKSB8fCB0aGlzLmNvbnRlbnRUeXBlcy5qc29uXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIEVhY2ggdGltZSBhbG9uZyB3aXRoIHRoZSByZXF1ZXN0IHdlIHNlbmQgYXV0aF90b2tlbiBpZiBpdCBleGlzdHNcbiAgICB0aGlzLnNldEF1dGhvcml6YXRpb25IZWFkZXIoeGhyKTtcblxuICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAgICAgY29uc3QgaXNKc29uID0geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdDb250ZW50LVR5cGUnKS5tYXRjaCh0aGlzLmNvbnRlbnRUeXBlcy5qc29uKTtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gaXNKc29uID9cbiAgICAgICAgSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KSA6XG4gICAgICAgIHhoci5yZXNwb25zZVRleHQ7XG5cbiAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgIH0pO1xuXG4gICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24oKSB7XG4gICAgICByZWplY3QoJ05ldHdvcmsgZXJyb3Igb2NjdXJlZCcpO1xuICAgIH0pO1xuXG4gICAgaWYgKG1ldGhvZCA9PSAnR0VUJykge1xuICAgICAgeGhyLnNlbmQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobWV0aG9kID09ICdQT1NUJykge1xuICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkoYm9keSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBsb2NhdGlvbjogbnVsbCxcbiAgZ2V0Q29ycmVjdFVybDogZ2V0Q29ycmVjdFVybCxcbiAgY29uZmlndXJlOiBjb25maWd1cmUsXG4gIHNldEF1dGhvcml6YXRpb25IZWFkZXI6IHNldEF1dGhvcml6YXRpb25IZWFkZXIsXG4gIGNvbnRlbnRUeXBlczoge1xuICAgIGpzb246ICdhcHBsaWNhdGlvbi9qc29uJ1xuICB9LFxuICBtYWtlUmVxdWVzdDogbWFrZVJlcXVlc3QsXG4gIGdldDogZ2V0LFxuICBwb3N0OiBwb3N0XG59O1xufSx7fV0sNzQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmNvbnN0IHJhZGlhbEdyYWRpZW50T25Ib3ZlciA9IGZ1bmN0aW9uKGJ0biwgb3B0cykge1xuICBjb25zdCB0ZXh0ID0gYnRuLmlubmVySFRNTDtcbiAgY29uc3Qgd3JhcHBlciA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCgvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwicmctYnRuXCI+XG4gICAgICA8c3Bhbj4ke3RleHR9PC9zcGFuPlxuICAgIDwvZGl2PlxuICBgKTtcbiAgYnRuLmlubmVySFRNTCA9ICcnO1xuICBidG4uc3R5bGUucGFkZGluZyA9IDA7XG5cbiAgaWYgKE51bWJlci5pc0ludGVnZXIob3B0cy5wYWRkaW5nKSkge1xuICAgIHdyYXBwZXIuc3R5bGUucGFkZGluZyA9IG9wdHMucGFkZGluZyArICdweCc7XG4gIH1cbiAgZWxzZSBpZiAob3B0cy5wYWRkaW5nIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBpZiAob3B0cy5wYWRkaW5nLmxlbmd0aCA9PSAyKSB7XG4gICAgICB3cmFwcGVyLnN0eWxlLnBhZGRpbmdUb3AgPSB3cmFwcGVyLnN0eWxlLnBhZGRpbmdCb3R0b20gPSBvcHRzLnBhZGRpbmdbMF0gKyAncHgnO1xuICAgICAgd3JhcHBlci5zdHlsZS5wYWRkaW5nTGVmdCA9IHdyYXBwZXIuc3R5bGUucGFkZGluZ1JpZ2h0ID0gb3B0cy5wYWRkaW5nWzFdICsgJ3B4JztcbiAgICB9XG4gIH1cblxuICBidG4uYXBwZW5kQ2hpbGQod3JhcHBlcik7XG5cbiAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGV2dCA9PiB7XG4gICAgY29uc3QgY29vcmRpbmF0ZXMgPSBldnQudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHggPSBldnQuY2xpZW50WCAtIGNvb3JkaW5hdGVzLmxlZnQ7XG4gICAgY29uc3QgeSA9IGV2dC5jbGllbnRZIC0gY29vcmRpbmF0ZXMudG9wO1xuICAgIGV2dC50YXJnZXQuc3R5bGUuc2V0UHJvcGVydHkoJy0teCcsIGAkeyB4IH1weGApO1xuICAgIGV2dC50YXJnZXQuc3R5bGUuc2V0UHJvcGVydHkoJy0teScsIGAkeyB5IH1weGApO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcmFkaWFsR3JhZGllbnRPbkhvdmVyO1xufSx7XCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6ODJ9XSw3NTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBSb3V0ZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yb3V0ZXMgPSBbXTtcbn07XG5cblJvdXRlci5wcm90b3R5cGUucmVnZXhwUGFyYW1zID0gLyhcXCg6KFtcXHdcXGRcXC1fXSspXFwpKS9naTtcblxuUm91dGVyLnByb3RvdHlwZS50cmltUm91dGUgPSBmdW5jdGlvbihyb3V0ZSkge1xuICByb3V0ZSA9IHJvdXRlWzBdID09PSAnLydcbiAgICA/IHJvdXRlLnN1YnN0cigxKVxuICAgIDogcm91dGU7XG5cbiAgcm91dGUgPSByb3V0ZVtyb3V0ZS5sZW5ndGggLSAxXSA9PT0gJy8nXG4gICAgPyByb3V0ZS5zdWJzdHIoMCwgcm91dGUubGVuZ3RoIC0gMSlcbiAgICA6IHJvdXRlO1xuXG4gIHJldHVybiByb3V0ZTtcbn0sXG5cblJvdXRlci5wcm90b3R5cGUuZ2V0UGFyYW1zTmFtZXMgPSBmdW5jdGlvbihyb3V0ZSkge1xuICBsZXQgcmVzdWx0O1xuICBsZXQgcGFyYW1zTmFtZXMgPSBbXTtcbiAgd2hpbGUgKChyZXN1bHQgPSB0aGlzLnJlZ2V4cFBhcmFtcy5leGVjKHJvdXRlKSkgIT09IG51bGwpIHtcbiAgICBwYXJhbXNOYW1lcy5wdXNoKHJlc3VsdFsyXSk7XG4gIH1cbiAgcmV0dXJuIHBhcmFtc05hbWVzO1xufVxuXG5Sb3V0ZXIucHJvdG90eXBlLmFkZFJvdXRlID0gZnVuY3Rpb24ocm91dGUsIG9iaikge1xuICByb3V0ZSA9IHRoaXMudHJpbVJvdXRlKHJvdXRlKTtcbiAgbGV0IHBhcmFtc05hbWVzID0gdGhpcy5nZXRQYXJhbXNOYW1lcyhyb3V0ZSk7XG4gIGxldCByZWdleHBTdHIgPSByb3V0ZS5yZXBsYWNlKHRoaXMucmVnZXhwUGFyYW1zLCAnKFtcXFxcd1xcXFxkXFwtX10rKScpO1xuICBsZXQgcmVnZXhwID0gUmVnRXhwKGBeJHtyZWdleHBTdHJ9KFxcXFwvfCQpYCwgJ2dpJyk7XG5cbiAgbGV0IHJvdXRlT2JqID0ge1xuICAgIHR5cGU6ICdyb3V0ZScsXG4gICAgcmVnZXhwOiByZWdleHAsXG4gICAgcGFyYW1zTmFtZXM6IHBhcmFtc05hbWVzXG4gIH07XG5cbiAgaWYgKHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbicpIHtcbiAgICAvKipcbiAgICAgKiBSb3V0ZSBoYW5kbGVyIHdpbGwgYmUgaW52b2tlZCB3aGVuIHVzZXIgZ29lcyB0byB0aGUgY29ycmVzcG9uZGluZ1xuICAgICAqIHJvdXRlIGFuZCBub3QgdGVybWluYXRlZCBieSBtaWRkbGV3YXJlcyB1bmRlcndheVxuICAgICAqIEBmdW5jdGlvbiBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGhhbmRsZXJQYXJhbXMgLSBwYXJhbXMgbWF5IGJlIGdpdmVuIHdoZW4gUm91dGVyLm5hdmlnYXRlIGlzIGludm9rZWRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcm91dGVQYXJhbXMgLSBwYXJhbXMgZXhpc3Rpbmcgb24gdGhlIHJvdXRlIGlmIGFueVxuICAgICAqIEBwYXJhbSB7YW55fSBhcmcgLSB0aGlzIGlzIGdpdmVuIGJ5IHRoZSBsYXN0IG1pZGRsZXdhcmUgaWYgYW55XG4gICAgICovXG4gICAgcm91dGVPYmouaGFuZGxlciA9IG9iajtcbiAgfVxuXG4gIGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgcm91dGVPYmouY2hpbGRyZW4gPSBvYmo7XG4gIH1cblxuICBlbHNlIHtcbiAgICBjb25zb2xlLmxvZygnRXJyb3Igb2NjdXJlZCB3aGlsZSBhZGRpbmcgcm91dGUnKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JvdXRlIGVycm9yJyk7XG4gIH1cblxuICB0aGlzLnJvdXRlcy5wdXNoKHJvdXRlT2JqKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLmdldFJvdXRlID0gZnVuY3Rpb24obGluaywgcm91dGVzID0gdGhpcy5yb3V0ZXMpIHtcbiAgbGluayA9IGxpbmsgPT09ICcnID8gJy8nIDogbGluaztcbiAgbGV0IG1pZGRsZXdhcmVzID0gW107XG4gIGxldCBwYXJhbXMgPSB7fTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJvdXRlcy5sZW5ndGgsIHJvdXRlID0gcm91dGVzW2ldOyBpKyspIHtcbiAgICBpZiAocm91dGUudHlwZSA9PSAnbWlkZGxld2FyZScpIHtcbiAgICAgIG1pZGRsZXdhcmVzLnB1c2gocm91dGUuZm4pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHJvdXRlLnR5cGUgPT0gJ3JvdXRlcycpIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuQ2hlY2sgPSB0aGlzLmdldFJvdXRlKGxpbmssIHJvdXRlLnJvdXRlcyk7XG4gICAgICBpZiAoY2hpbGRyZW5DaGVjayAhPT0gbnVsbCkge1xuICAgICAgICBjaGlsZHJlbkNoZWNrLm1pZGRsZXdhcmVzID0gbWlkZGxld2FyZXMuY29uY2F0KGNoaWxkcmVuQ2hlY2subWlkZGxld2FyZXMpO1xuICAgICAgICBjaGlsZHJlbkNoZWNrLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24ocGFyYW1zLCBjaGlsZHJlbkNoZWNrLnBhcmFtcyk7XG4gICAgICAgIHJldHVybiBjaGlsZHJlbkNoZWNrO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgbGV0IHJlZ2V4cCA9IHJvdXRlLnJlZ2V4cDtcbiAgICBsZXQgcmVzdWx0ID0gcmVnZXhwLmV4ZWMobGluayk7XG4gICAgbGV0IG5ld0xpbms7XG5cbiAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggPiAxKSB7XG4gICAgICBwYXJhbXMgPSB7fTtcbiAgICAgIGZvciAobGV0IGlkeCA9IDE7IGlkeCA8IHJlc3VsdC5sZW5ndGggLSAxOyBpZHgrKykge1xuICAgICAgICBwYXJhbXNbcm91dGUucGFyYW1zTmFtZXNbaWR4LTFdXSA9IHJlc3VsdFtpZHhdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZWdleHAubGFzdEluZGV4ID4gMCkge1xuICAgICAgbmV3TGluayA9IGxpbmsuc3Vic3RyKHJlZ2V4cC5sYXN0SW5kZXgpO1xuICAgIH1cblxuICAgIGlmIChyZWdleHAubGFzdEluZGV4ID4gMCAmJiBuZXdMaW5rLmxlbmd0aCA+IDApIHtcbiAgICAgIHJlZ2V4cC5sYXN0SW5kZXggPSAwO1xuICAgICAgaWYgKHJvdXRlLmNoaWxkcmVuICYmIHJvdXRlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGV0IGNoaWxkcmVuQ2hlY2sgPSB0aGlzLmdldFJvdXRlKG5ld0xpbmssIHJvdXRlLmNoaWxkcmVuKTtcbiAgICAgICAgaWYgKGNoaWxkcmVuQ2hlY2sgIT09IG51bGwpIHtcbiAgICAgICAgICBjaGlsZHJlbkNoZWNrLm1pZGRsZXdhcmVzID0gbWlkZGxld2FyZXMuY29uY2F0KGNoaWxkcmVuQ2hlY2subWlkZGxld2FyZXMpO1xuICAgICAgICAgIGNoaWxkcmVuQ2hlY2sucGFyYW1zID0gT2JqZWN0LmFzc2lnbihwYXJhbXMsIGNoaWxkcmVuQ2hlY2sucGFyYW1zKTtcbiAgICAgICAgICByZXR1cm4gY2hpbGRyZW5DaGVjaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBJbiBjYXNlIGl0J3MgdGVybWluYWwgcm91dGVcbiAgICBlbHNlIGlmIChyZWdleHAubGFzdEluZGV4ID4gMCkge1xuICAgICAgcmVnZXhwLmxhc3RJbmRleCA9IDA7XG4gICAgICBpZiAocm91dGUuaGFuZGxlcikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhhbmRsZXI6IHJvdXRlLmhhbmRsZXIsXG4gICAgICAgICAgcGFyYW1zOiBwYXJhbXMsXG4gICAgICAgICAgbWlkZGxld2FyZXM6IG1pZGRsZXdhcmVzXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFNpbmNlIGl0J3MgZG9uZSBhbmQgbGluayBpcyAoYWN0dWFsbHksIHdpbGwgYmUgd2hlbiB3ZVxuICAgICAgLy8gZ2V0IGludG8gcmVjdXJzaW9uKSAnLycsIHNvIHdlIGxvb2sgdXAgY2hpbGRyZW4gdG9cbiAgICAgIC8vIHRvIG1hdGNoIHRoZSByb290ICcvJyB3aGljaCBtdXN0IGV4aXN0IHRoZXJlXG4gICAgICBpZiAocm91dGUuY2hpbGRyZW4pIHtcbiAgICAgICAgcmVnZXhwLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIGxldCBjaGlsZHJlbkNoZWNrID0gdGhpcy5nZXRSb3V0ZShuZXdMaW5rLCByb3V0ZS5jaGlsZHJlbik7XG4gICAgICAgIGlmIChjaGlsZHJlbkNoZWNrICE9PSBudWxsKSB7XG4gICAgICAgICAgY2hpbGRyZW5DaGVjay5taWRkbGV3YXJlcyA9IG1pZGRsZXdhcmVzLmNvbmNhdChjaGlsZHJlbkNoZWNrLm1pZGRsZXdhcmVzKTtcbiAgICAgICAgICBjaGlsZHJlbkNoZWNrLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24ocGFyYW1zLCBjaGlsZHJlbkNoZWNrLnBhcmFtcyk7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkcmVuQ2hlY2s7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLmFkZFJvdXRlcyA9IGZ1bmN0aW9uKHJvdXRlcykge1xuICB0aGlzLnJvdXRlcy5wdXNoKHtcbiAgICB0eXBlOiAncm91dGVzJyxcbiAgICByb3V0ZXM6IHJvdXRlc1xuICB9KTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cblJvdXRlci5wcm90b3R5cGUuYWRkTWlkZGxld2FyZSA9IGZ1bmN0aW9uKGZuKSB7XG4gIHRoaXMucm91dGVzLnB1c2goe1xuICAgIHR5cGU6ICdtaWRkbGV3YXJlJyxcbiAgICBmbjogZm5cbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLm5hdmlnYXRlID0gZnVuY3Rpb24obGluaywgaGFuZGxlclBhcmFtcykge1xuICBsaW5rID0gdGhpcy50cmltUm91dGUobGluayk7XG4gIGxldCByb3V0ZSA9IHRoaXMuZ2V0Um91dGUobGluayk7XG4gIGlmICghcm91dGUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdObyBzdWl0YWJsZSByb3V0ZSBoYXMgYmVlbiBmb3VuZCEnKTtcbiAgICByZXR1cm47XG4gIH1cbiAgXG4gIGZucyA9IHJvdXRlLm1pZGRsZXdhcmVzLmNvbmNhdChbcm91dGUuaGFuZGxlci5iaW5kKG51bGwsIGhhbmRsZXJQYXJhbXMpXSk7XG4gIGZvciAobGV0IGkgPSBmbnMubGVuZ3RoIC0gMTsgaSA+IDAsIGZuID0gZm5zW2ldOyBpLS0pIHtcbiAgICBpZiAoaSAhPT0gZm5zLmxlbmd0aCAtIDEpIHtcbiAgICAgIGZuc1tpXSA9IGZuLmJpbmQobnVsbCwgZm5zW2krMV0sIHJvdXRlLnBhcmFtcyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZm5zW2ldID0gZm4uYmluZChudWxsLCByb3V0ZS5wYXJhbXMpO1xuICAgIH1cbiAgfVxuICBmbnNbMF0oKTtcbiAgaGlzdG9yeS5wdXNoU3RhdGUoJycsICcnLCAnLycgKyB3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbn07XG5cblJvdXRlci5wcm90b3R5cGUudGVzdE5hdiA9IGZ1bmN0aW9uKGxpbmssIGhhbmRsZXJQYXJhbXMpIHtcbiAgbGluayA9IHRoaXMudHJpbVJvdXRlKGxpbmspO1xuICBsZXQgcm91dGUgPSB0aGlzLmdldFJvdXRlKGxpbmspO1xuICBpZiAoIXJvdXRlKSB7XG4gICAgY29uc29sZS5sb2coJ05vIHN1aXRhYmxlIHJvdXRlIGhhcyBiZWVuIGZvdW5kJylcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gY29uc29sZS5sb2cocm91dGUpO1xuICBmbnMgPSByb3V0ZS5taWRkbGV3YXJlcy5jb25jYXQoW3JvdXRlLmhhbmRsZXIuYmluZChudWxsLCBoYW5kbGVyUGFyYW1zKV0pO1xuICBmb3IgKGxldCBpID0gZm5zLmxlbmd0aCAtIDE7IGkgPiAwLCBmbiA9IGZuc1tpXTsgaS0tKSB7XG4gICAgaWYgKGkgIT09IGZucy5sZW5ndGggLSAxKSB7XG4gICAgICBmbnNbaV0gPSBmbi5iaW5kKG51bGwsIGZuc1tpKzFdLCByb3V0ZS5wYXJhbXMpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGZuc1tpXSA9IGZuLmJpbmQobnVsbCwgcm91dGUucGFyYW1zKTtcbiAgICB9XG4gIH1cbiAgLy8gY29uc29sZS5sb2coZm5zKVxuICBmbnNbMF0oKTtcbn07XG5cbmNvbnN0IFN1YnJvdXRlciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJvdXRlcyA9IFtdO1xufTtcblN1YnJvdXRlci5wcm90b3R5cGUgPSBSb3V0ZXIucHJvdG90eXBlO1xuUm91dGVyLlN1YnJvdXRlciA9IFN1YnJvdXRlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBSb3V0ZXI7XG59LHt9XSw3NjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB0YWdzID0gWydkaXYnLCAnc3BhbicsICdidXR0b24nXTtcblxuY29uc3QgSGVhZGVySXRlbSA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgY29uc3QgdGl0bGUgPSBvcHRzLnRpdGxlIHx8ICcnO1xuICBjb25zdCBjbGFzc05hbWUgPSBvcHRzLmNsYXNzTmFtZSB8fCAnJztcbiAgY29uc3QgdGFnID0gdGFncy5maW5kKHRhZyA9PiB0YWcgPT09IG9wdHMudGFnKSA/XG4gICAgb3B0cy50YWcgOlxuICAgICdzcGFuJztcblxuICBjb25zdCBoZWFkZXJJdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICBoZWFkZXJJdGVtLmNsYXNzTmFtZSA9ICd0YWJzLWhlYWRlci1pdGVtICcgKyBjbGFzc05hbWU7XG4gIGhlYWRlckl0ZW0uaW5uZXJIVE1MID0gdGl0bGU7XG5cbiAgaWYgKG9wdHMuYXR0cmlidXRlcykge1xuICAgIG9wdHMuYXR0cmlidXRlcy5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgaGVhZGVySXRlbS5zZXRBdHRyaWJ1dGUoYXR0ci5uYW1lLCBhdHRyLnZhbHVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudDogaGVhZGVySXRlbVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJJdGVtO1xufSx7fV0sNzc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgZGVmYXVsdEFuaW0gPSBmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gaGFuZGxlcihldnQpIHtcbiAgICBjb25zdCB0YWIgPSBldnQudGFyZ2V0LmNsb3Nlc3QoJy50YWJzLWhlYWRlci1pdGVtJykuZGF0YXNldC5vcmRlcjtcbiAgICB0aGlzLmdvdG9UYWIodGFiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdvdG9UYWIodGFiKSB7XG4gICAgdGFiLS07XG4gICAgY29uc3QgbmV3SGVhZGVySXRlbSA9IHRoaXMuaGVhZGVyLml0ZW1zW3RhYl07XG4gICAgY29uc3QgbmV3Q29udGVudEl0ZW0gPSB0aGlzLmNvbnRlbnQuaXRlbXNbdGFiXTtcblxuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG5cbiAgICBuZXdIZWFkZXJJdGVtLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgIG5ld0NvbnRlbnRJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgIG5ld0NvbnRlbnRJdGVtLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IG5ld0hlYWRlckl0ZW07XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSBuZXdDb250ZW50SXRlbTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUodGFiKSB7XG4gICAgdGFiO1xuICAgIGNvbnN0IGFjdGl2ZUhlYWRlckl0ZW0gPSB0aGlzLmhlYWRlci5pdGVtc1t0YWJdO1xuICAgIGNvbnN0IGFjdGl2ZUNvbnRlbnRJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW3RhYl07XG4gICAgY29uc3Qgbm9uQWN0aXZlQ29udGVudEl0ZW1zID0gdGhpcy5jb250ZW50Lml0ZW1zLmZpbHRlcihpdGVtID0+IGl0ZW0gIT09IGFjdGl2ZUNvbnRlbnRJdGVtKTtcblxuICAgIGFjdGl2ZUhlYWRlckl0ZW0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgYWN0aXZlQ29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cbiAgICBub25BY3RpdmVDb250ZW50SXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJykpO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IGFjdGl2ZUhlYWRlckl0ZW07XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSBhY3RpdmVDb250ZW50SXRlbTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlcixcbiAgICBnb3RvVGFiLFxuICAgIGluaXRpYWxpemVcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdEFuaW07XG59LHt9XSw3ODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBzZXRDb250ZW50SXRlbXNXaWR0aHMgPSBmdW5jdGlvbihvcHRpb25zLCBhbmltUGFyYW1zKSB7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBvcHRpb25zLmNvbnRyb2xsZXIgfHwge307XG4gIGNvbnN0IG5ld09yZGVyID0gb3B0aW9ucy5uZXdPcmRlcjtcbiAgY29uc3Qgc2V0Rm9yTmV3T3JkZXIgPSBvcHRpb25zLnNldEZvck5ld09yZGVyIHx8IGZhbHNlO1xuICBjb25zdCBpdGVtcyA9IGNvbnRyb2xsZXIuY29udGVudC5pdGVtcztcbiAgY29uc3QgbGVuID0gaXRlbXMubGVuZ3RoO1xuICBjb25zdCB3aWR0aCA9IGNvbnRyb2xsZXIuY29udGVudC5lbGVtZW50LmNsaWVudFdpZHRoO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuLCBpdGVtID0gaXRlbXNbaV07IGkrKykge1xuICAgIGlmIChzZXRGb3JOZXdPcmRlciB8fCBpdGVtICE9PSBpdGVtc1tuZXdPcmRlcl0pIHtcbiAgICAgIGl0ZW0uc3R5bGUud2lkdGggPSAod2lkdGggLSAyKmFuaW1QYXJhbXMucGFkZGluZykgKyAncHgnO1xuICAgIH1cbiAgfVxufTtcblxuY29uc3Qgc2V0Q29udGVudEl0ZW1zUG9zaXRpb25zID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBjb25zdCBjb250cm9sbGVyID0gb3B0aW9ucy5jb250cm9sbGVyIHx8IHt9O1xuICBjb25zdCBuZXdPcmRlciA9IG9wdGlvbnMubmV3T3JkZXI7XG4gIGNvbnN0IHNldEZvck5ld09yZGVyID0gb3B0aW9ucy5zZXRGb3JOZXdPcmRlciB8fCBmYWxzZTtcbiAgY29uc3QgaXRlbXMgPSBjb250cm9sbGVyLmNvbnRlbnQuaXRlbXM7XG4gIGNvbnN0IGxlbiA9IGl0ZW1zLmxlbmd0aDtcbiAgY29uc3Qgd2lkdGggPSBjb250cm9sbGVyLmNvbnRlbnQuZWxlbWVudC5jbGllbnRXaWR0aDtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbiwgaXRlbSA9IGl0ZW1zW2ldOyBpKyspIHtcbiAgICBpZiAoc2V0Rm9yTmV3T3JkZXIgfHwgaXRlbSAhPT0gaXRlbXNbbmV3T3JkZXJdKSB7XG4gICAgICBpdGVtLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGVYKCR7KGktbmV3T3JkZXIpKndpZHRofXB4KWA7XG4gICAgfVxuICB9XG59O1xuXG5jb25zdCBzZXRDb250ZW50SXRlbXNEaXNwbGF5ID0gZnVuY3Rpb24ob3B0cykge1xuICBjb25zdCBjb250ZW50SXRlbXMgPSBvcHRzLmNvbnRyb2xsZXIuY29udGVudC5pdGVtcztcbiAgY29uc3QgZGlzcGxheSA9IG9wdHMuZGlzcGxheTtcbiAgY29uc3QgbmV3T3JkZXIgPSBvcHRzLm5ld09yZGVyO1xuICBjb25zdCBzZXRGb3JOZXdPcmRlciA9IG9wdHMuc2V0Rm9yTmV3T3JkZXI7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb250ZW50SXRlbXMubGVuZ3RoLCBjaSA9IGNvbnRlbnRJdGVtc1tpXTsgaSsrKSB7XG4gICAgaWYgKHNldEZvck5ld09yZGVyIHx8IGNpICE9PSBjb250ZW50SXRlbXNbbmV3T3JkZXJdKSB7XG4gICAgICBjaS5zdHlsZS5kaXNwbGF5ID0gZGlzcGxheTtcbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0IFRhYnNGbG93QW5pbWF0aW9uID0gZnVuY3Rpb24oKSB7XG4gIGxldCBwYXJhbXM7XG5cbiAgZnVuY3Rpb24gaGFuZGxlcihldnQpIHtcbiAgICBpZiAodGhpcy5hY3RpdmUud29ya2luZykgcmV0dXJuO1xuICAgIHRoaXMuYWN0aXZlLndvcmtpbmcgPSB0cnVlO1xuICAgIC8vIEhJIHN0YW5kcyBmb3IgSGVhZGVyIEl0ZW1cbiAgICAvLyBDSSBzdGFuZHMgZm9yIENvbnRlbnQgSXRlbVxuICAgIGNvbnN0IG5ld0hJID0gZXZ0LnRhcmdldC5jbG9zZXN0KCcudGFicy1oZWFkZXItaXRlbScpO1xuICAgIGNvbnN0IG9yZGVyID0gK25ld0hJLmRhdGFzZXQub3JkZXIgLSAxO1xuICAgIGNvbnN0IG5ld0NJID0gdGhpcy5jb250ZW50Lml0ZW1zW29yZGVyXTtcbiAgICBjb25zdCBzcGVlZCA9IHBhcmFtcy5zcGVlZDtcbiAgICBjb25zdCBvbGRPcmRlciA9ICt0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtLmRhdGFzZXQub3JkZXIgLSAxO1xuXG4gICAgc2V0Q29udGVudEl0ZW1zUG9zaXRpb25zKHtjb250cm9sbGVyOiB0aGlzLCBuZXdPcmRlcjogb2xkT3JkZXIsIHNldEZvck5ld09yZGVyOiBmYWxzZX0pO1xuICAgIHNldENvbnRlbnRJdGVtc0Rpc3BsYXkoe2NvbnRyb2xsZXI6IHRoaXMsIG5ld09yZGVyOiBvcmRlciwgc2V0Rm9yTmV3T3JkZXI6IHRydWUsIGRpc3BsYXk6ICdibG9jayd9KTtcbiAgICBuZXdISS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIHRoaXMuY29udGVudC5lbGVtZW50LnN0eWxlLmhlaWdodCA9IHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLmNsaWVudEhlaWdodCArICdweCc7XG4gICAgdGhpcy5jb250ZW50LmVsZW1lbnQuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gc3BlZWQgKyAnbXMnO1xuICAgIHRoaXMuY29udGVudC5lbGVtZW50LnN0eWxlLmhlaWdodCA9IG5ld0NJLmNsaWVudEhlaWdodCArICdweCc7XG5cbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uc3R5bGUudG9wID0gcGFyYW1zLnBhZGRpbmcgKyAncHgnO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLnN0eWxlLmxlZnQgPSBwYXJhbXMucGFkZGluZyArICdweCc7XG5cbiAgICB0aGlzLmNvbnRlbnQuaXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gc3BlZWQgKyAnbXMnKTtcblxuICAgIHNldENvbnRlbnRJdGVtc1dpZHRocyh7Y29udHJvbGxlcjogdGhpcywgbmV3T3JkZXI6IG9yZGVyLCBzZXRGb3JOZXdPcmRlcjogdHJ1ZX0sIHBhcmFtcyk7XG4gICAgc2V0Q29udGVudEl0ZW1zUG9zaXRpb25zKHtjb250cm9sbGVyOiB0aGlzLCBuZXdPcmRlcjogb3JkZXIsIHNldEZvck5ld09yZGVyOiB0cnVlfSk7XG4gICAgXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBuZXdDSS5zdHlsZS5wb3NpdGlvbiA9ICdzdGF0aWMnO1xuICAgICAgbmV3Q0kuc3R5bGUud2lkdGggPSAnYXV0byc7XG4gICAgICB0aGlzLmNvbnRlbnQuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XG4gICAgICB0aGlzLmNvbnRlbnQuaXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gJzBtcycpO1xuICAgICAgdGhpcy5jb250ZW50LmVsZW1lbnQuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gJzBtcyc7XG4gICAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtID0gbmV3SEk7XG4gICAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbSA9IG5ld0NJO1xuICAgICAgdGhpcy5hY3RpdmUud29ya2luZyA9IGZhbHNlO1xuICAgICAgc2V0Q29udGVudEl0ZW1zRGlzcGxheSh7XG4gICAgICAgIGNvbnRyb2xsZXI6IHRoaXMsXG4gICAgICAgIG5ld09yZGVyOiBvcmRlcixcbiAgICAgICAgc2V0Rm9yTmV3T3JkZXI6IGZhbHNlLFxuICAgICAgICBkaXNwbGF5OiAnbm9uZSdcbiAgICAgIH0pO1xuICAgIH0sIHNwZWVkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdvdG9UYWIodGFiKSB7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUodGFiLCBhbmltT3B0aW9ucykge1xuICAgIHBhcmFtcyA9IGFuaW1PcHRpb25zIHx8IHt9O1xuICAgIC8vIEFkZCBjbGFzc2VzXG4gICAgdGhpcy5jb250ZW50LmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgndGFicy1mbG93LWNvbnRlbnQnKTtcbiAgICB0aGlzLmNvbnRlbnQuaXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgndGFicy1mbG93LUNJJykpO1xuICAgIFxuICAgIC8vIFNldCBpbmRpdmlkdWFsIENTU1xuICAgIGNvbnN0IENJcyA9IHRoaXMuY29udGVudC5pdGVtcztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IENJcy5sZW5ndGgsIGl0ZW0gPSBDSXNbaV07IGkrKykge1xuICAgICAgaWYgKGkgIT09IHRhYikge1xuICAgICAgICBDSXNbaV0uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnOyAgICBcbiAgICAgICAgQ0lzW2ldLnN0eWxlLnRvcCA9IHBhcmFtcy5wYWRkaW5nICsgJ3B4JztcbiAgICAgICAgQ0lzW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuaGVhZGVyLml0ZW1zW3RhYl0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cbiAgICAvLyBTZXQgYWN0aXZlIG9iamVjdFxuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0gPSB0aGlzLmhlYWRlci5pdGVtc1t0YWJdO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW3RhYl07XG5cbiAgICAvLyBBZGQgb24gcmVzaXppbmcgZXZlbnQgaGFuZGxlclxuICAgIGNvbnN0IG5ld09yZGVyID0gK3RoaXMuYWN0aXZlLmhlYWRlckl0ZW0uZGF0YXNldC5vcmRlciAtIDE7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgIGNvbnN0IG5ld09yZGVyID0gK2NvbnRyb2xsZXIuYWN0aXZlLmhlYWRlckl0ZW0uZGF0YXNldC5vcmRlciAtIDE7XG4gICAgICBjb25zdCBvcHRpb25zID0ge2NvbnRyb2xsZXI6IHRoaXMsIG5ld09yZGVyOiBuZXdPcmRlcn07XG4gICAgICBpZiAodGhpcy5hY3RpdmUud29ya2luZykge1xuICAgICAgICBzZXRDb250ZW50SXRlbXNXaWR0aHMob3B0aW9ucywgcGFyYW1zKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBzZXRDb250ZW50SXRlbXNXaWR0aHMob3B0aW9ucywgcGFyYW1zKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgc2V0Q29udGVudEl0ZW1zUG9zaXRpb25zKG9wdGlvbnMpXG4gICAgfSk7XG5cbiAgICBzZXRDb250ZW50SXRlbXNEaXNwbGF5KHtcbiAgICAgIGNvbnRyb2xsZXI6IHRoaXMsXG4gICAgICBuZXdPcmRlcjogbmV3T3JkZXIsXG4gICAgICBzZXRGb3JOZXdPcmRlcjogZmFsc2UsXG4gICAgICBkaXNwbGF5OiAnbm9uZSdcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlcixcbiAgICBnb3RvVGFiLFxuICAgIGluaXRpYWxpemVcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGFic0Zsb3dBbmltYXRpb247XG59LHt9XSw3OTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBkZWZhdWx0QW5pbSA9IHJlcXVpcmUoJy4vZGVmYXVsdCcpO1xuY29uc3QgbG9naW5TaWdudXBTd2l0Y2ggPSByZXF1aXJlKCcuL2xvZ2luU2lnbnVwU3dpdGNoJyk7XG5jb25zdCB0YWJzRmxvd0FuaW1hdGlvbiA9IHJlcXVpcmUoJy4vZmxvdycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZGVmYXVsdEFuaW0sXG4gIGxvZ2luU2lnbnVwU3dpdGNoLFxuICB0YWJzRmxvd0FuaW1hdGlvblxufTtcbn0se1wiLi9kZWZhdWx0XCI6NzcsXCIuL2Zsb3dcIjo3OCxcIi4vbG9naW5TaWdudXBTd2l0Y2hcIjo4MH1dLDgwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGxvZ2luU2lnbnVwU3dpdGNoID0gZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIGhhbmRsZXIoZXZ0KSB7XG4gICAgaWYgKHRoaXMuYmVpbmdBbmltYXRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmJlaW5nQW5pbWF0ZWQgPSB0cnVlO1xuXG4gICAgY29uc3Qgb2xkSEl0ZW0gPSB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtO1xuICAgIGNvbnN0IG9sZENJdGVtID0gdGhpcy5hY3RpdmUuY29udGVudEl0ZW07XG4gICAgY29uc3QgbmV3SEl0ZW0gPSBldnQudGFyZ2V0LmNsb3Nlc3QoJy50YWJzLWhlYWRlci1pdGVtJyk7XG4gICAgY29uc3Qgb3JkZXIgPSBuZXdISXRlbS5kYXRhc2V0Lm9yZGVyO1xuICAgIGNvbnN0IG5ld0NJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW29yZGVyLTFdO1xuXG4gICAgb2xkSEl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnbG9naW5TaWdudXAtSEktYWN0aXZlJyk7XG4gICAgbmV3SEl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtSEktYWN0aXZlJyk7XG5cbiAgICBvbGRDSXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1DSS1hY3RpdmUnKTtcbiAgICBvbGRDSXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1oaWRpbmcnKTtcbiAgICBuZXdDSXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1DSS1oaWRkZW4nKTtcbiAgICBuZXdDSXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1hY3RpdmF0aW5nJyk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIG9sZENJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnVwLUNJLWhpZGluZycpO1xuICAgICAgb2xkQ0l0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktaGlkZGVuJyk7XG5cbiAgICAgIG5ld0NJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnVwLUNJLWFjdGl2YXRpbmcnKTtcbiAgICAgIG5ld0NJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJLWFjdGl2ZScpO1xuXG4gICAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtID0gbmV3SEl0ZW07XG4gICAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbSA9IG5ld0NJdGVtO1xuXG4gICAgICB0aGlzLmJlaW5nQW5pbWF0ZWQgPSBmYWxzZTtcbiAgICB9LCA1MDApO1xuICB9XG5cbiAgZnVuY3Rpb24gZ290b1RhYih0YWIpIHtcbiAgICBjb25zdCBuZXdIZWFkZXJJdGVtID0gdGhpcy5oZWFkZXIuaXRlbXNbdGFiXTtcbiAgICBjb25zdCBuZXdDb250ZW50SXRlbSA9IHRoaXMuY29udGVudC5pdGVtc1t0YWJdO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1ISS1hY3RpdmUnKTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251LUNJLWFjdGl2ZScpO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJLWhpZGRlbicpO1xuXG4gICAgbmV3SGVhZGVySXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1ISS1hY3RpdmUnKTtcbiAgICBuZXdDb250ZW50SXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1DSS1oaWRkZW4nKTtcbiAgICBuZXdDb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1hY3RpdmUnKTtcblxuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0gPSBuZXdIZWFkZXJJdGVtO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtID0gbmV3Q29udGVudEl0ZW07XG4gIH1cblxuICBmdW5jdGlvbiBpbml0aWFsaXplKHRhYikge1xuICAgIHRoaXMuaGVhZGVyLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtaGVhZGVyJyk7XG4gICAgdGhpcy5jb250ZW50LmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtY29udGVudCcpO1xuICAgIHRoaXMuaGVhZGVyLml0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUhJJykpO1xuICAgIHRoaXMuY29udGVudC5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSScpKTtcblxuICAgIGNvbnN0IGFjdGl2ZUhlYWRlckl0ZW0gPSB0aGlzLmhlYWRlci5pdGVtc1t0YWJdO1xuICAgIGNvbnN0IGFjdGl2ZUNvbnRlbnRJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW3RhYl07XG4gICAgY29uc3Qgbm9uQWN0aXZlQ29udGVudEl0ZW1zID0gdGhpcy5jb250ZW50Lml0ZW1zLmZpbHRlcihpdGVtID0+IGl0ZW0gIT09IGFjdGl2ZUNvbnRlbnRJdGVtKTtcblxuICAgIGFjdGl2ZUhlYWRlckl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtSEktYWN0aXZlJyk7XG4gICAgYWN0aXZlQ29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktYWN0aXZlJyk7XG5cbiAgICBub25BY3RpdmVDb250ZW50SXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktaGlkZGVuJykpO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IGFjdGl2ZUhlYWRlckl0ZW07XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSBhY3RpdmVDb250ZW50SXRlbTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlcixcbiAgICBnb3RvVGFiLFxuICAgIGluaXRpYWxpemVcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbG9naW5TaWdudXBTd2l0Y2g7XG59LHt9XSw4MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBIZWFkZXJJdGVtID0gcmVxdWlyZSgnLi9IZWFkZXJJdGVtJyk7XG5jb25zdCBhbmltcyA9IHJlcXVpcmUoJy4vYW5pbWF0aW9ucycpO1xuXG5jb25zdCBUYWJzID0gZnVuY3Rpb24ob3B0cykge1xuICBjb25zdCBoZWFkZXJJdGVtcyA9XG4gICAgb3B0cy5oZWFkZXIuaXRlbXMubWFwKGl0ZW0gPT4gbmV3IEhlYWRlckl0ZW0oaXRlbSkuZWxlbWVudCkgfHwgW107XG4gIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBoZWFkZXIuY2xhc3NOYW1lID0gJ3RhYnMtaGVhZGVyICcgKyBvcHRzLmhlYWRlci5jbGFzc05hbWU7XG4gIGhlYWRlckl0ZW1zLmZvckVhY2goaXRlbSA9PiBoZWFkZXIuYXBwZW5kQ2hpbGQoaXRlbSkpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaGVhZGVySXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBoZWFkZXJJdGVtc1tpXS5kYXRhc2V0Lm9yZGVyID0gaSsxO1xuICB9XG5cbiAgY29uc3QgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBjb250ZW50LmNsYXNzTmFtZSA9ICd0YWJzLWNvbnRlbnQgJyArIChvcHRzLmNvbnRlbnQuY2xhc3NOYW1lIHx8ICcnKTtcbiAgY29uc3QgY29udGVudEl0ZW1zID0gb3B0cy5jb250ZW50Lml0ZW1zIHx8IFtdO1xuICBjb250ZW50SXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ3RhYnMtY29udGVudC1pdGVtJyk7XG4gICAgY29udGVudC5hcHBlbmRDaGlsZChpdGVtKTtcbiAgfSk7XG5cbiAgY29uc3QgYWN0aXZlID0ge1xuICAgIGhlYWRlckl0ZW06IG51bGwsXG4gICAgY29udGVudEl0ZW06IG51bGxcbiAgfTtcblxuICBjb25zdCBhbmltID0gYW5pbXNbb3B0cy5hbmltYXRpb24ubmFtZV0gP1xuICAgIG5ldyBhbmltc1tvcHRzLmFuaW1hdGlvbi5uYW1lXSA6XG4gICAgbmV3IGFuaW1zWydkZWZhdWx0QW5pbSddO1xuXG4gIGNvbnN0IHRhYnMgPSB7XG4gICAgaGVhZGVyOiB7XG4gICAgICBlbGVtZW50OiBoZWFkZXIsXG4gICAgICBpdGVtczogaGVhZGVySXRlbXNcbiAgICB9LFxuICAgIGNvbnRlbnQ6IHtcbiAgICAgIGVsZW1lbnQ6IGNvbnRlbnQsXG4gICAgICBpdGVtczogY29udGVudEl0ZW1zXG4gICAgfSxcbiAgICBhY3RpdmU6IGFjdGl2ZSxcbiAgICBnb3RvVGFiOiBhbmltLmdvdG9UYWIsXG4gICAgaW1pdGF0ZUNsaWNrT25UYWI6IGZ1bmN0aW9uKHRhYikge1xuICAgICAgdGhpcy5oZWFkZXIuaXRlbXNbdGFiXS5jbGljaygpO1xuICAgIH1cbiAgfTtcbiAgICBcbiAgaGVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBjb25zdCBsaW5rID0gZXZ0LnRhcmdldDtcbiAgICBjb25zdCByZXN1bHQgPSBoZWFkZXJJdGVtcy5maW5kKGl0ZW0gPT4gaXRlbSA9PT0gbGluay5jbG9zZXN0KCcudGFicy1oZWFkZXItaXRlbScpKTtcblxuICAgIGlmICghcmVzdWx0IHx8IHJlc3VsdCA9PT0gdGFicy5hY3RpdmUuaGVhZGVySXRlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGFuaW0uaGFuZGxlci5jYWxsKHRhYnMsIGV2dCk7XG4gICAgfVxuICB9KTtcblxuICBjb25zdCBpbml0aWFsaXplciA9XG4gICAgb3B0cy5hbmltYXRpb24uaW5pdGlhbGl6ZXIgP1xuICAgIG9wdHMuYW5pbWF0aW9uLmluaXRpYWxpemVyIC0gMSA6XG4gICAgMDtcbiAgXG4gIGFuaW0uaW5pdGlhbGl6ZS5jYWxsKHRhYnMsIGluaXRpYWxpemVyLCBvcHRzLmFuaW1hdGlvbi5wYXJhbXMpO1xuXG4gIHJldHVybiB0YWJzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYWJzO1xufSx7XCIuL0hlYWRlckl0ZW1cIjo3NixcIi4vYW5pbWF0aW9uc1wiOjc5fV0sODI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgY3JlYXRlRWxlbWVudEZyb21IVE1MID0gZnVuY3Rpb24oaHRtbCkge1xuICBjb25zdCB0ZW1wUGFyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHRlbXBQYXJlbnQuaW5uZXJIVE1MID0gaHRtbDtcbiAgcmV0dXJuIHRlbXBQYXJlbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG59O1xuXG5mdW5jdGlvbiBTaW5nbGV0b24oZm4pIHtcbiAgZnVuY3Rpb24gQ2xhc3MoKSB7XG4gICAgaWYgKENsYXNzLmluc3RhbmNlKSB7XG4gICAgICByZXR1cm4gQ2xhc3MuaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIENsYXNzLmluc3RhbmNlID0gZm4oKTtcbiAgfVxuXG4gIENsYXNzLmdldEluc3RhbmNlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIENsYXNzLmluc3RhbmNlIHx8IG5ldyBDbGFzcygpO1xuICB9O1xuXG4gIENsYXNzLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBDbGFzcy5pbnN0YW5jZSA9IG51bGw7XG4gIH07XG5cbiAgcmV0dXJuIENsYXNzO1xufVxuXG5mdW5jdGlvbiByYW5nZShzdGFydCwgZW5kKSB7XG4gIGxldCBhcnIgPSBbXTtcbiAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDw9IGVuZDsgaSsrKSBhcnIucHVzaChpKTtcbiAgcmV0dXJuIGFycjtcbn1cblxuZnVuY3Rpb24gc29ydE51bWJlcnMoYSwgYikge1xuICBpZiAoYSA+IGIpIHJldHVybiAxO1xuICBpZiAoYSA8IGIpIHJldHVybiAtMTtcbiAgcmV0dXJuIDA7XG59XG5cbmZ1bmN0aW9uIGdldE1vbnRoTmFtZShtb250aE51bSkge1xuICBjb25zdCBtb250aHMgPSBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXTtcbiAgcmV0dXJuIG1vbnRoc1ttb250aE51bV07XG59XG5cbmZ1bmN0aW9uIGdldENvb3JkcyhlbGVtKSB7XG4gIHZhciBib3ggPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gIHJldHVybiB7XG4gICAgdG9wOiBib3gudG9wICsgcGFnZVlPZmZzZXQsXG4gICAgbGVmdDogYm94LmxlZnQgKyBwYWdlWE9mZnNldFxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlRWxlbWVudEZyb21IVE1MLFxuICBTaW5nbGV0b24sXG4gIHJhbmdlLFxuICBzb3J0TnVtYmVycyxcbiAgZ2V0TW9udGhOYW1lLFxuICBnZXRDb29yZHNcbn07XG59LHt9XSw4MzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBSb290ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL21haW4vcm9vdENvbXBvbmVudCcpO1xuY29uc3QgRGFzaGJvYXJkID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL2Rhc2hib2FyZCcpO1xuY29uc3QgTWFpbkNvbnRyb2xsZXIgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvbWFpbicpO1xuY29uc3Qge3JvdXRlcn0gPSBNYWluQ29udHJvbGxlcjtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvaHR0cCcpO1xuXG5jb25zdCBSb3V0ZXIgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvcm91dGVyJyk7XG5jb25zdCBTdGFydCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9zdGFydCcpO1xuY29uc3QgVGVzdCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy90ZXN0JylcblxuaHR0cC5jb25maWd1cmUoeyBsb2NhdGlvbjogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcgfSk7XG5cbmNvbnN0IHZlcmlmaWNhdGlvblJvdXRlID0gcmVxdWlyZSgnY3NwLWFwcC9yb3V0ZXMvYXV0aC92ZXJpZmljYXRpb24nKTtcbmNvbnN0IHJvb3RIYW5kbGVyID0gcmVxdWlyZSgnY3NwLWFwcC9yb3V0ZXMvcm9vdCcpO1xuY29uc3Qge3NjaGVkdWxlckhhbmRsZXIsIHVzZXJzSGFuZGxlciwgdXNlckhhbmRsZXJ9ID0gcmVxdWlyZSgnY3NwLWFwcC9yb3V0ZXMvZGFzaGJvYXJkJyk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgY29uc3QgbGluayA9IGV2dC50YXJnZXQuY2xvc2VzdCgnYScpO1xuXG4gIGlmIChsaW5rICYmIGxpbmsuZGF0YXNldCAmJiBsaW5rLmRhdGFzZXQucm91dGUpIHtcbiAgICByb3V0ZXIubmF2aWdhdGUobGluay5kYXRhc2V0LnJvdXRlKTtcbiAgfVxufSk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIGV2dCA9PiB7XG4gIGNvbnNvbGUubG9nKCdwYWdlIGNoYW5nZWQ6ICcsIGRvY3VtZW50LmxvY2F0aW9uKTtcbiAgY29uc29sZS5sb2coZXZ0KTtcbiAgcm91dGVyLm5hdmlnYXRlKGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lKTtcbn0pO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oZXZ0KSB7XG4gIGxldCBwYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuICBjb25zdCByb290SW5zdGFuY2UgPSBSb290LmNyZWF0ZSgpO1xuICBNYWluQ29udHJvbGxlci5pbml0aWFsaXplKHJvb3RJbnN0YW5jZSk7XG5cbiAgcm91dGVyXG4gICAgLmFkZFJvdXRlKCcvJywgcm9vdEhhbmRsZXIpXG4gICAgLmFkZFJvdXRlKCdzaWdudXAvdmVyaWZ5JywgdmVyaWZpY2F0aW9uUm91dGUpXG4gICAgLmFkZFJvdXRlKCdzY2hlZHVsZXInLCBzY2hlZHVsZXJIYW5kbGVyKVxuICAgIC5hZGRSb3V0ZSgndXNlcnMnLCB1c2Vyc0hhbmRsZXIpXG4gICAgLmFkZFJvdXRlKCd1c2Vycy8oOmlkKScsIHVzZXJIYW5kbGVyKVxuICA7XG5cbiAgcm91dGVyLm5hdmlnYXRlKHBhdGgpXG59KTtcbn0se1wiY3NwLWFwcC9jb21wb25lbnRzL2Rhc2hib2FyZFwiOjEsXCJjc3AtYXBwL2NvbXBvbmVudHMvbWFpblwiOjUsXCJjc3AtYXBwL2NvbXBvbmVudHMvbWFpbi9yb290Q29tcG9uZW50XCI6NixcImNzcC1hcHAvY29tcG9uZW50cy9zdGFydFwiOjQ4LFwiY3NwLWFwcC9jb21wb25lbnRzL3Rlc3RcIjo1MixcImNzcC1hcHAvbGlicy9odHRwXCI6NzMsXCJjc3AtYXBwL2xpYnMvcm91dGVyXCI6NzUsXCJjc3AtYXBwL3JvdXRlcy9hdXRoL3ZlcmlmaWNhdGlvblwiOjg0LFwiY3NwLWFwcC9yb3V0ZXMvZGFzaGJvYXJkXCI6ODUsXCJjc3AtYXBwL3JvdXRlcy9yb290XCI6ODl9XSw4NDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7cmVuZGVyfSA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9tYWluJyk7XG5jb25zdCBWZXJpZmljYXRpb25Db21wb25lbnQgPSByZXF1aXJlKCdjc3AtYXBwL2dyb3Vwcy9hdXRoL3ZlcmlmaWNhdGlvbicpO1xuXG5mdW5jdGlvbiB2ZXJpZmljYXRpb24oKSB7XG4gIHJlbmRlcihbIFZlcmlmaWNhdGlvbkNvbXBvbmVudCBdKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB2ZXJpZmljYXRpb247XG59LHtcImNzcC1hcHAvY29tcG9uZW50cy9tYWluXCI6NSxcImNzcC1hcHAvZ3JvdXBzL2F1dGgvdmVyaWZpY2F0aW9uXCI6Njd9XSw4NTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBzY2hlZHVsZXJIYW5kbGVyID0gcmVxdWlyZSgnLi9zY2hlZHVsZXInKTsgXG5jb25zdCB1c2Vyc0hhbmRsZXIgPSByZXF1aXJlKCcuL3VzZXJzJyk7XG5jb25zdCB1c2VySGFuZGxlciA9IHJlcXVpcmUoJy4vdXNlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2NoZWR1bGVySGFuZGxlcixcbiAgdXNlcnNIYW5kbGVyLFxuICB1c2VySGFuZGxlclxufTtcbn0se1wiLi9zY2hlZHVsZXJcIjo4NixcIi4vdXNlclwiOjg3LFwiLi91c2Vyc1wiOjg4fV0sODY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge3JlbmRlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvbWFpbicpO1xuY29uc3QgRGFzaGJvYXJkID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL2Rhc2hib2FyZCcpO1xuY29uc3QgU2NoZWR1bGVyQ29tcG9uZW50ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3NjaGVkdWxlcicpO1xuXG5jb25zdCBTY2hlZHVsZXJIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gIHJlbmRlcihbRGFzaGJvYXJkLCBTY2hlZHVsZXJDb21wb25lbnRdKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2NoZWR1bGVySGFuZGxlcjtcbn0se1wiY3NwLWFwcC9jb21wb25lbnRzL2Rhc2hib2FyZFwiOjEsXCJjc3AtYXBwL2NvbXBvbmVudHMvbWFpblwiOjUsXCJjc3AtYXBwL2NvbXBvbmVudHMvc2NoZWR1bGVyXCI6MTh9XSw4NzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7cmVuZGVyfSA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9tYWluJyk7XG5jb25zdCBEYXNoYm9hcmQgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkJyk7XG5jb25zdCB7VXNlclBhZ2VDb21wb25lbnR9ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3VzZXJzL3N0YW5kYWxvbmVzJyk7XG5cbmNvbnN0IFVzZXJIYW5kbGVyID0gZnVuY3Rpb24obm9uZSwgcGFyYW1zKSB7XG4gIHJlbmRlcihbRGFzaGJvYXJkLCBVc2VyUGFnZUNvbXBvbmVudChwYXJhbXMuaWQpXSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVzZXJIYW5kbGVyO1xufSx7XCJjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkXCI6MSxcImNzcC1hcHAvY29tcG9uZW50cy9tYWluXCI6NSxcImNzcC1hcHAvY29tcG9uZW50cy91c2Vycy9zdGFuZGFsb25lc1wiOjU0fV0sODg6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge3JlbmRlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvbWFpbicpO1xuY29uc3QgRGFzaGJvYXJkID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL2Rhc2hib2FyZCcpO1xuY29uc3QgVXNlcnNDb21wb25lbnQgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvdXNlcnMnKTtcblxuY29uc3QgVXNlcnNIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gIHJlbmRlcihbRGFzaGJvYXJkLCBVc2Vyc0NvbXBvbmVudF0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBVc2Vyc0hhbmRsZXI7XG59LHtcImNzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmRcIjoxLFwiY3NwLWFwcC9jb21wb25lbnRzL21haW5cIjo1LFwiY3NwLWFwcC9jb21wb25lbnRzL3VzZXJzXCI6NTN9XSw4OTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IHtyZW5kZXJ9ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL21haW4nKTtcbmNvbnN0IFN0YXJ0ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL3N0YXJ0Jyk7XG5jb25zdCBEYXNoYm9hcmQgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkJyk7XG5cbmNvbnN0IGNoZWNrQXV0aCA9IHRva2VuID0+IHtcbiAgcmV0dXJuIGh0dHBcbiAgICAucG9zdCgnYXV0aC9hdXRoZW50aWNhdGUnLCB7dG9rZW46IHRva2VufSlcbiAgO1xufTtcblxuY29uc3Qgcm9vdEhhbmRsZXIgPSBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHRva2VuID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhdXRoX3Rva2VuJykgfHwgbnVsbDtcbiAgY29uc3QgaXNBdXRoZW50aWNhdGVkID0gdG9rZW4gPyAoYXdhaXQgY2hlY2tBdXRoKHRva2VuKSkuc3VjY2VzcyA6IGZhbHNlO1xuXG4gIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICByZW5kZXIoWyBEYXNoYm9hcmQgXSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmVuZGVyKFsgU3RhcnQgXSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcm9vdEhhbmRsZXI7XG59LHtcImNzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmRcIjoxLFwiY3NwLWFwcC9jb21wb25lbnRzL21haW5cIjo1LFwiY3NwLWFwcC9jb21wb25lbnRzL3N0YXJ0XCI6NDgsXCJjc3AtYXBwL2xpYnMvaHR0cFwiOjczfV19LHt9LFs4M10pO1xuIl0sImZpbGUiOiJzb3VyY2UuanMifQ==
