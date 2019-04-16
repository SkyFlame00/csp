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
},{"./tpl":4,"csp-app/components/main":5,"csp-app/libs/http":50,"csp-app/libs/utilities":59}],2:[function(require,module,exports){

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
},{"csp-app/libs/router":52}],6:[function(require,module,exports){
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

  actionsObj['cancel'].addEventListener('click', () => {
    this.close();
  });

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
},{"../modals-controller":11,"./actions":8,"./tpl":10,"csp-app/libs/utilities":59}],10:[function(require,module,exports){
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
},{"csp-app/libs/utilities":59}],11:[function(require,module,exports){
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
  const typeInput = element.querySelector('.field-type input');
  const typeBtn = element.querySelector('.field-type button');
  const projectInput = element.querySelector('.field-project input');
  const projectBtn = element.querySelector('.field-project button');
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
      place: addParticipantPlace
    },
    link,
    type: {
      input: typeInput,
      btn: typeBtn
    },
    project: {
      input: projectInput,
      btn: projectBtn
    },
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
},{"csp-app/libs/utilities":59}],13:[function(require,module,exports){
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
  CEModalInstance.elements.body.appendChild(tplController.root);

  this.modal = CEModalInstance;
  this.tplController = tplController;
  this.data = { participants: [], files: [] };
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
      from: this.tplController.time.from,
      to: this.tplController.time.to
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
},{"../select-participants-modal":20,"./form.tpl":12,"csp-app/components/modals":7}],14:[function(require,module,exports){
const SchedulerComponent = require('./main');

module.exports = SchedulerComponent;
},{"./main":17}],15:[function(require,module,exports){
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
},{"../create-event-modal":13,"./index.tpl":16,"csp-app/components/modals":7}],16:[function(require,module,exports){
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

          <div class="dates">
            <div class="date">April, 8</div>
            <div class="date">April, 9</div>
            <div class="date">April, 10</div>
            <div class="date">April, 11</div>
            <div class="date">April, 12</div>
            <div class="date">April, 13</div>
            <div class="date">April, 14</div>
          </div>

          <div class="date-move date-down-wrapper">
            <button><i class="i i-sort"></i></button>
          </div>
        </div>
        
        <div class="right">
          <div class="strips"></div>
          <div class="timeline-h"></div>
          <div class="timeline-b">
            <div class="timeline"></div>
            <div class="timeline"></div>
            <div class="timeline"></div>
            <div class="timeline"></div>
            <div class="timeline"></div>
            <div class="timeline"></div>
            <div class="timeline"></div>
          </div>
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
      generateHoursMarks: generateHoursMarks(timelineHeader),
      generateStrips: generateStrips(strips)
    }
  };
}

module.exports = template;
},{"../main/modal.tpl":19,"csp-app/libs/utilities":59}],17:[function(require,module,exports){
const template = require('./index.tpl');
const ISModal = require('../individual-scheduler');

const SchedulerComponent = function() {
  const tplController = template();
  let ISModalInstance = null;

  tplController.btnOpenIndSch.addEventListener('click', () => {
    if (!ISModalInstance) {
      ISModalInstance = ISModal.create();
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
},{"../individual-scheduler":15,"./index.tpl":18}],18:[function(require,module,exports){
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
},{"csp-app/libs/utilities":59}],19:[function(require,module,exports){
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
},{"csp-app/libs/utilities":59}],20:[function(require,module,exports){
const Modal = require('csp-app/components/modals');
const http = require('csp-app/libs/http');

function SPModal(options) {
  const participantsSelected = options.participants;

  const SPModalInstance = Modal.create({
    type: 'standard',
    title: 'Select participants',
    width: 250,
    defaultActions: true,
    destroyOnClose: true
  });

  http.post('scheduler/getFriendsAvailability')
    .then(friends => {

    })
  ;

  return SPModalInstance;
}



module.exports = {
  create: () => new SPModal()
};
},{"csp-app/components/modals":7,"csp-app/libs/http":50}],21:[function(require,module,exports){
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
},{"csp-app/libs/forms":48,"csp-app/libs/forms/validators":49}],22:[function(require,module,exports){
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
},{"csp-app/libs/forms":48,"csp-app/libs/forms/validators":49,"csp-app/libs/http":50}],23:[function(require,module,exports){
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
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/libs/forms":48,"csp-app/libs/forms/validators":49,"csp-app/libs/http":50}],24:[function(require,module,exports){
const loginForm = require('./LoginForm');
const clientForm = require('./ClientForm');
const execForm = require('./ExecForm');

module.exports = {
  loginForm,
  clientForm,
  execForm
};
},{"./ClientForm":21,"./ExecForm":22,"./LoginForm":23}],25:[function(require,module,exports){
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
},{"./start.tpl":26,"./tabs":27,"csp-app/libs/utilities":59}],26:[function(require,module,exports){
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
},{}],27:[function(require,module,exports){
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
},{"../forms/LoginForm":23,"./signupTabs":28,"csp-app/libs/misc/button-effects/radialGradientOnHover":51,"csp-app/libs/tabs":58,"csp-app/libs/utilities":59}],28:[function(require,module,exports){
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
},{"../forms":24,"csp-app/libs/misc/button-effects/radialGradientOnHover":51,"csp-app/libs/tabs":58,"csp-app/libs/utilities":59}],29:[function(require,module,exports){
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
},{}],30:[function(require,module,exports){
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
},{"./tabs":42,"csp-app/libs/tabs":58,"csp-app/libs/utilities":59}],31:[function(require,module,exports){
const UserPageComponent = require('./user');

module.exports = {
  UserPageComponent
};
},{"./user":32}],32:[function(require,module,exports){
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
},{"./templates":34,"csp-app/libs/http":50,"csp-app/libs/utilities":59}],33:[function(require,module,exports){
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
},{"csp-app/libs/utilities":59}],34:[function(require,module,exports){
const mainTemplate = require('./tpl');
const blockMoreTemplate = require('./block-more.tpl');

module.exports = {
  mainTemplate,
  blockMoreTemplate
};
},{"./block-more.tpl":33,"./tpl":35}],35:[function(require,module,exports){
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
},{"csp-app/libs/utilities":59}],36:[function(require,module,exports){
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
},{"../common/createUsersList":38,"../common/tab.tpl":39,"csp-app/libs/http":50}],37:[function(require,module,exports){
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
},{"../common/createUsersList":38,"../common/tab.tpl":39,"csp-app/libs/http":50}],38:[function(require,module,exports){
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
},{"./userItem.tpl":40,"csp-app/libs/utilities":59}],39:[function(require,module,exports){
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
},{"csp-app/libs/utilities":59}],40:[function(require,module,exports){
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
},{"csp-app/libs/utilities":59}],41:[function(require,module,exports){
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
},{"../common/createUsersList":38,"../common/tab.tpl":39,"csp-app/libs/http":50}],42:[function(require,module,exports){
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
},{"./all-friends":36,"./all-users":37,"./incoming-requests":41,"./outgoing-requests":43}],43:[function(require,module,exports){
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
},{"../common/createUsersList":38,"../common/tab.tpl":39,"csp-app/libs/http":50}],44:[function(require,module,exports){
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
},{"./tpl":45,"csp-app/libs/http":50}],45:[function(require,module,exports){
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
},{"csp-app/libs/utilities":59}],46:[function(require,module,exports){
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
},{"./FormControl":47}],47:[function(require,module,exports){
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
},{}],48:[function(require,module,exports){
const Form = require('./Form');

module.exports = Form;
},{"./Form":46}],49:[function(require,module,exports){
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
},{}],50:[function(require,module,exports){
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
},{}],51:[function(require,module,exports){
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
},{"csp-app/libs/utilities":59}],52:[function(require,module,exports){
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
},{}],53:[function(require,module,exports){
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
},{}],54:[function(require,module,exports){
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
},{}],55:[function(require,module,exports){
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
},{}],56:[function(require,module,exports){
const defaultAnim = require('./default');
const loginSignupSwitch = require('./loginSignupSwitch');
const tabsFlowAnimation = require('./flow');

module.exports = {
  defaultAnim,
  loginSignupSwitch,
  tabsFlowAnimation
};
},{"./default":54,"./flow":55,"./loginSignupSwitch":57}],57:[function(require,module,exports){
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
},{}],58:[function(require,module,exports){
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
},{"./HeaderItem":53,"./animations":56}],59:[function(require,module,exports){
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
},{}],60:[function(require,module,exports){
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
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/components/main/rootComponent":6,"csp-app/components/start":25,"csp-app/components/test":29,"csp-app/libs/http":50,"csp-app/libs/router":52,"csp-app/routes/auth/verification":61,"csp-app/routes/dashboard":62,"csp-app/routes/root":66}],61:[function(require,module,exports){
const {render} = require('csp-app/components/main');
const VerificationComponent = require('csp-app/groups/auth/verification');

function verification() {
  render([new VerificationComponent()]);
}

module.exports = verification;
},{"csp-app/components/main":5,"csp-app/groups/auth/verification":44}],62:[function(require,module,exports){
const schedulerHandler = require('./scheduler'); 
const usersHandler = require('./users');
const userHandler = require('./user');

module.exports = {
  schedulerHandler,
  usersHandler,
  userHandler
};
},{"./scheduler":63,"./user":64,"./users":65}],63:[function(require,module,exports){
const {render} = require('csp-app/components/main');
const Dashboard = require('csp-app/components/dashboard');
const SchedulerComponent = require('csp-app/components/scheduler');

const SchedulerHandler = function() {
  render([Dashboard, SchedulerComponent]);
};

module.exports = SchedulerHandler;
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/components/scheduler":14}],64:[function(require,module,exports){
const {render} = require('csp-app/components/main');
const Dashboard = require('csp-app/components/dashboard');
const {UserPageComponent} = require('csp-app/components/users/standalones');

const UserHandler = function(none, params) {
  render([Dashboard, UserPageComponent(params.id)]);
};

module.exports = UserHandler;
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/components/users/standalones":31}],65:[function(require,module,exports){
const {render} = require('csp-app/components/main');
const Dashboard = require('csp-app/components/dashboard');
const UsersComponent = require('csp-app/components/users');

const UsersHandler = function() {
  render([Dashboard, UsersComponent]);
};

module.exports = UsersHandler;
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/components/users":30}],66:[function(require,module,exports){
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
},{"csp-app/components/dashboard":1,"csp-app/components/main":5,"csp-app/components/start":25,"csp-app/libs/http":50}]},{},[60]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzb3VyY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IHRlbXBsYXRlID0gcmVxdWlyZSgnLi90cGwnKTtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuY29uc3Qge3JvdXRlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvbWFpbicpO1xuXG5jb25zdCBEYXNoYm9hcmQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGh0dHAuZ2V0KCcvdXNlcnMvZ2V0VXNlckRhdGEnKVxuICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgIGNvbnN0IGlkID0gcmVzLmRhdGEudXNlci5pZDtcbiAgICAgIGNvbnNvbGUubG9nKHJlcy5kYXRhKVxuXG4gICAgICBpZiAoIXJlcy5zdWNjZXNzKSB0aHJvdyBuZXcgRXJyb3IocmVzLmVycm9yKTtcblxuICAgICAgY29uc3QgdGVtcGxhdGVEYXRhID0ge1xuICAgICAgICB1c2VyOiByZXMuZGF0YS51c2VyXG4gICAgICB9O1xuXG4gICAgICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKHRlbXBsYXRlKHRlbXBsYXRlRGF0YSkpO1xuICAgICAgY29uc3QgYnRuID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcjbG9nLW91dCcpO1xuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2F1dGhfdG9rZW4nKTtcbiAgICAgICAgcm91dGVyLm5hdmlnYXRlKCcvJyk7XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHJvdXRlck91dGxlciA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnJvdXRlci1vdXRsZXQnKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjoge1xuICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnRcbiAgICAgICAgfSxcbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgcm91dGVyT3V0bGVyLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgIHJvdXRlck91dGxlci5hcHBlbmQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhc2hib2FyZDtcbn0se1wiLi90cGxcIjo0LFwiY3NwLWFwcC9jb21wb25lbnRzL21haW5cIjo1LFwiY3NwLWFwcC9saWJzL2h0dHBcIjo1MCxcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo1OX1dLDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuXG59LHt9XSwzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbm1vZHVsZS5leHBvcnRzID0gLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJtZW51XCI+XG4gICAgPHVsPlxuICAgICAgPGxpPjxhIGRhdGEtcm91dGU9XCJcIj48aSBjbGFzcz1cImkgaS1zdXJ2ZXlcIj48L2k+PHNwYW4+U3VydmV5czwvc3Bhbj48L2E+PC9saT5cbiAgICAgIDxsaT48YSBkYXRhLXJvdXRlPVwidXNlcnNcIj48aSBjbGFzcz1cImkgaS11c2Vyc1wiPjwvaT48c3Bhbj5Vc2Vyczwvc3Bhbj48L2E+PC9saT5cbiAgICAgIDxsaT48YSBkYXRhLXJvdXRlPVwiXCI+PGkgY2xhc3M9XCJpIGktcHJvamVjdFwiPjwvaT48c3Bhbj5Qcm9qZWN0czwvc3Bhbj48L2E+PC9saT5cbiAgICAgIDxsaT48YSBkYXRhLXJvdXRlPVwic2NoZWR1bGVyXCI+PHNwYW4+U2NoZWR1bGVyPC9zcGFuPjwvYT48L2xpPlxuICAgIDwvdWw+XG4gIDwvZGl2PlxuYDtcbn0se31dLDQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qgc2lkZWJhckV4ZWMgPSByZXF1aXJlKCcuL3RlbXBsYXRlcy9zaWRlYmFyX2V4ZWMudHBsJyk7XG5jb25zdCBzaWRlYmFyQ2xpZW50ID0gcmVxdWlyZSgnLi90ZW1wbGF0ZXMvc2lkZWJhcl9jbGllbnQudHBsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGF0YSA9PiB7XG4gIGNvbnN0IGdyb3VwID0gZGF0YS51c2VyLmdyb3VwO1xuICBsZXQgc2lkZWJhcjtcblxuICBpZiAoWydhY2FkZW1pYycsICdzdHVkZW50JywgJ2V4dF9leGVjJywgbnVsbCwgdW5kZWZpbmVkXS5pbmNsdWRlcyhncm91cCkpIHtcbiAgICBzaWRlYmFyID0gc2lkZWJhckV4ZWM7XG4gIH1cblxuICBpZiAoZ3JvdXAgPT0gJ2NsaWVudCcpIHtcbiAgICBzaWRlYmFyID0gc2lkZWJhckNsaWVudDtcbiAgfVxuXG4gIHJldHVybiAvKmh0bWwqL2BcbiAgPGRpdiBjbGFzcz1cImNtcF9kYXNoYm9hcmRcIj5cbiAgICA8ZGl2IGNsYXNzPVwic2lkZWJhclwiPlxuICAgICAgPGRpdiBjbGFzcz1cImxvZ28tYmxvY2tcIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJsb2dvXCI+eyBDU1AgfTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICAkeyBzaWRlYmFyIH1cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwibWFpblwiPlxuICAgICAgPGRpdiBjbGFzcz1cImRib2FyZC1oZWFkZXJcIj48YnV0dG9uIGlkPVwibG9nLW91dFwiPkxvZyBvdXQ8L2J1dHRvbj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjb250ZW50XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJyb3V0ZXItb3V0bGV0XCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+YDtcbn07XG59LHtcIi4vdGVtcGxhdGVzL3NpZGViYXJfY2xpZW50LnRwbFwiOjIsXCIuL3RlbXBsYXRlcy9zaWRlYmFyX2V4ZWMudHBsXCI6M31dLDU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgUm91dGVyID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3JvdXRlcicpXG5cbmNvbnN0IGFwcCA9IHNlbGYgPSB7XG4gIHJvb3Q6IG51bGwsXG4gIHJvdXRlcjogbmV3IFJvdXRlcigpLFxuICBwYXRoOiBbXSxcbiAgcmVuZGVyQ2hhaW46IGZ1bmN0aW9uKGNvbXBvbmVudHMpIHtcbiAgICAvLyBQcm9taXNlIGlzIHJldHVybmVkXG4gICAgcmV0dXJuIGNvbXBvbmVudHMucmVkdWNlKChhY2N1bXVsYXRvciwgY29tcG9uZW50KSA9PiB7XG4gICAgICAvLyBBY2N1bXVsYXRvciBtYXkgbm90IG9ubHkgYmUgYSBQcm9taXNlIGJ1dCBpdCBjYW5cbiAgICAgIC8vIGFsc28gYmUgYSBwbGFpbiBqcyBvYmplY3QgKGFzIGlzIHdpdGggc2VsZi5yb290KVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhY2N1bXVsYXRvcilcbiAgICAgICAgLy8gQmVmb3JlIHdlIG1ha2Ugc3VyZSB0aGUgcHJldmlvdXMgY29tcG9uZW50IChpdCBpcyBub3cgYWNjdW11bGF0b3IpXG4gICAgICAgIC8vIGhhcyByZXNvbHZlZCwgd2UgZG8gbm90IGNyZWF0ZSB0aGUgY29tcG9uZW50IHRoYXQgZm9sbG93c1xuICAgICAgICAudGhlbihhY2N1bXVsYXRvciA9PiBQcm9taXNlLmFsbChbYWNjdW11bGF0b3IsIG5ldyBjb21wb25lbnQoKV0pKVxuICAgICAgICAudGhlbigoW2FjY3VtdWxhdG9yLCBjb21wb25lbnRdKSA9PiB7XG4gICAgICAgICAgaWYgKCFjb21wb25lbnQuc3VjY2VzcylcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh7Y29tcG9uZW50OiBjb21wb25lbnQuZXJyb3IsIGFjY3VtdWxhdG9yOiBhY2N1bXVsYXRvcn0pO1xuXG4gICAgICAgICAgYWNjdW11bGF0b3IucmVuZGVyKGNvbXBvbmVudC5jb250cm9sbGVyLmVsZW1lbnQpO1xuICAgICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgICAgIH0pXG4gICAgICA7XG4gICAgfSwgc2VsZi5yb290KVxuICAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcbiAgfSxcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ocm9vdEluc3RhbmNlKSB7XG4gICAgc2VsZi5yb290ID0gcm9vdEluc3RhbmNlO1xuICAgIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gJyc7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChyb290SW5zdGFuY2UucmVmZXJlbmNlKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbihjb21wb25lbnRzKSB7XG4gICAgcmV0dXJuIHNlbGYucmVuZGVyQ2hhaW4oY29tcG9uZW50cyk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXBwO1xufSx7XCJjc3AtYXBwL2xpYnMvcm91dGVyXCI6NTJ9XSw2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IFJvb3QgPSB7XG4gICAgY29tcG9uZW50TmFtZTogJ2FwcCcsXG4gICAgaHRtbDogYDxkaXYgaWQ9XCJhcHBcIj48L2Rpdj5gLFxuICAgIGlkZW50aWZpZXI6ICcjYXBwJyxcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBDb25zaWRlciByZWltcGxlbWVudGluZyB3aXRoIEhUTUw1IHRlbXBsYXRlIGZlYXR1cmUgaW5zdGVhZCBqdXN0IHV0aWxpemluZyBkaXZcbiAgICAgICAgY29uc3QgdG1wRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0bXBFbGVtLmlubmVySFRNTCA9IHRoaXMuaHRtbDtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRtcEVsZW0uZmlyc3RDaGlsZDtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVmZXJlbmNlOiBlbGVtZW50LFxuICAgICAgICAgICAgcm91dGVyT3V0bGV0OiBlbGVtZW50LFxuICAgICAgICAgICAgY29tcG9uZW50TmFtZTogdGhpcy5jb21wb25lbnROYW1lLFxuICAgICAgICAgICAgc3RhdGU6IHt9LFxuICAgICAgICAgICAgYWN0aW9uczogKGZ1bmN0aW9uKHJvdXRlck91dGxldCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWQ6IGZ1bmN0aW9uKGZyYWdtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKGVsZW1lbnQpLFxuICAgICAgICAgICAgcmVuZGVyOiAoZnVuY3Rpb24ocm91dGVyT3V0bGV0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKERPTVRyZWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcm91dGVyT3V0bGV0LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICByb3V0ZXJPdXRsZXQuYXBwZW5kQ2hpbGQoRE9NVHJlZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoZWxlbWVudClcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUm9vdDtcbn0se31dLDc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgbW9kYWxTdGFuZGFyZCA9IHJlcXVpcmUoJy4vbW9kYWwtc3RhbmRhcmQnKTtcblxuZnVuY3Rpb24gTW9kYWwoKSB7XG4gIFxufVxuXG5Nb2RhbC5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBsZXQgbW9kYWxDbGFzcztcbiAgc3dpdGNoIChvcHRpb25zLnR5cGUpIHtcbiAgICBjYXNlICdzdGFuZGFyZCc6XG4gICAgICBtb2RhbENsYXNzID0gbW9kYWxTdGFuZGFyZDtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBtb2RhbENsYXNzID0gbW9kYWxTdGFuZGFyZDtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiBuZXcgbW9kYWxDbGFzcyhvcHRpb25zKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZGFsKCk7XG59LHtcIi4vbW9kYWwtc3RhbmRhcmRcIjo5fV0sODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBjYW5jZWwgPSB7XG4gIGlkOiAnY2FuY2VsJyxcbiAgdHlwZTogJ3NlY29uZGFyeScsXG4gIG9yZGVyOiAwLFxuICB0aXRsZTogJ0NhbmNlbCdcbn07XG5cbmNvbnN0IHN1Ym1pdCA9IHtcbiAgaWQ6ICdzdWJtaXQnLFxuICB0eXBlOiAncHJpbWFyeScsXG4gIG9yZGVyOiAxLFxuICB0aXRsZTogJ09LJ1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNhbmNlbCxcbiAgc3VibWl0XG59O1xufSx7fV0sOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdHBsJyk7XG5jb25zdCB7Y2FuY2VsLCBzdWJtaXR9ID0gcmVxdWlyZSgnLi9hY3Rpb25zJyk7IFxuY29uc3Qge3NvcnROdW1iZXJzfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcbmNvbnN0IE1vZGFsc0NvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9tb2RhbHMtY29udHJvbGxlcicpO1xuXG4vKipcbiAqIFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy50aXRsZSAtIHRoZSB0aXRsZSBvZiB0aGUgbW9kYWxcbiAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLndpZHRoIC0gdGhlIHdpZHRoIG9mIHRoZSBtb2RhbFxuICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMuaGVpZ2h0IC0gdGhlIGhlaWdodCBvZiB0aGUgbW9kYWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5kZWZhdWx0QWN0aW9ucyAtIGluZGljYXRlcyBpZiBhY3Rpb25zIGF0IHRoZSBib3R0b20gb2YgdGhlIG1vZGFsIGFyZSBkZWZhdWx0LiBJZiBmYWxzZSwgdGhlbiBuZWVkZWQgcGFyYW1zIGFyZSBzcGVjaWZpZWQgaW4gJ2FjdGlvbnMnXG4gKiBAcGFyYW0ge0FycmF5Ljx7aWQ6IFN0cmluZywgdGl0bGU6IFN0cmluZywgdHlwZTogU3RyaW5nLCBvcmRlcjogTnVtYmVyfT59IG9wdGlvbnMuYWN0aW9ucyAtIGlmIG5vbi1kZWZhdWx0IGFjdGlvbnNcbiAqL1xuXG5mdW5jdGlvbiBNb2RhbChvcHRpb25zKSB7XG4gIGNvbnN0IHRwbENvbnRyb2xsZXIgPSB0ZW1wbGF0ZSgpO1xuXG4gIHRwbENvbnRyb2xsZXIucm9vdC5jbGFzc0xpc3QuYWRkKCduby1kaXNwbGF5Jyk7XG4gIHRwbENvbnRyb2xsZXIudGl0bGUudGV4dENvbnRlbnQgPSBvcHRpb25zLnRpdGxlIHx8ICcnO1xuICB0cGxDb250cm9sbGVyLmJvZHkuc3R5bGUud2lkdGggPSAob3B0aW9ucy53aWR0aCB8fCAnMzAwJykgKyAncHgnO1xuICB0cGxDb250cm9sbGVyLmJvZHkuc3R5bGUuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgPyBvcHRpb25zLmhlaWdodCArICdweCcgOiAnYXV0byc7XG5cbiAgdHBsQ29udHJvbGxlci5jbG9zZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICB0aGlzLmNsb3NlKCk7XG4gIH0pO1xuXG4gIGxldCBhY3Rpb25zUGFyYW1zID1cbiAgICBvcHRpb25zLmRlZmF1bHRBY3Rpb25zID9cbiAgICBbY2FuY2VsLCBzdWJtaXRdIDpcbiAgICBvcHRpb25zLmFjdGlvbnM7XG5cbiAgY29uc3QgYWN0aW9ucyA9IGFjdGlvbnNQYXJhbXMuc29ydChzb3J0TnVtYmVycylcbiAgICAubWFwKGl0ZW0gPT4ge1xuICAgICAgY29uc3QgYWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICBhY3Rpb24udGV4dENvbnRlbnQgPSBpdGVtLnRpdGxlO1xuICAgICAgYWN0aW9uLmNsYXNzTGlzdC5hZGQoJ2J0bi0nICsgaXRlbS50eXBlKTtcbiAgICAgIHJldHVybiB7IGlkOiBpdGVtLmlkLCBlbGVtZW50OiBhY3Rpb24gfTtcbiAgICB9KTtcbiAgXG4gIGxldCBhY3Rpb25zT2JqID0ge307XG5cbiAgYWN0aW9ucy5mb3JFYWNoKGFjdGlvbiA9PiB7XG4gICAgdHBsQ29udHJvbGxlci5mb290ZXIuYXBwZW5kQ2hpbGQoYWN0aW9uLmVsZW1lbnQpO1xuICAgIGFjdGlvbnNPYmpbYWN0aW9uLmlkXSA9IGFjdGlvbi5lbGVtZW50O1xuICB9KTtcblxuICBhY3Rpb25zT2JqWydjYW5jZWwnXS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICB0aGlzLmNsb3NlKCk7XG4gIH0pO1xuXG4gIHRoaXMuZWxlbWVudHMgPSB7XG4gICAgLi4udHBsQ29udHJvbGxlcixcbiAgICAuLi5hY3Rpb25zT2JqXG4gIH07XG4gIHRoaXMuZGVzdHJveU9uQ2xvc2UgPSBvcHRpb25zLmRlc3Ryb3lPbkNsb3NlO1xuXG4gIE1vZGFsc0NvbnRyb2xsZXIuYWRkKHRoaXMpO1xufVxuXG5Nb2RhbC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKCkge1xuICBNb2RhbHNDb250cm9sbGVyLm9wZW4odGhpcyk7XG59O1xuXG5Nb2RhbC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgY2xvc2VFdmVudCA9IG5ldyBDdXN0b21FdmVudCgnY2xvc2UnKTtcbiAgdGhpcy5lbGVtZW50cy5yb290LmRpc3BhdGNoRXZlbnQoY2xvc2VFdmVudCk7XG4gIFxuICBNb2RhbHNDb250cm9sbGVyLmNsb3NlTGFzdCgpO1xuXG4gIGlmICh0aGlzLmRlc3Ryb3lPbkNsb3NlKSB7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH1cbn07XG5cbk1vZGFsLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZWxlbWVudHMucm9vdC5yZW1vdmUoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kYWw7XG59LHtcIi4uL21vZGFscy1jb250cm9sbGVyXCI6MTEsXCIuL2FjdGlvbnNcIjo4LFwiLi90cGxcIjoxMCxcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo1OX1dLDEwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiB0ZW1wbGF0ZSgpIHtcbiAgY29uc3QgaHRtbCA9IC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCJtb2RhbCBtb2RhbC1zdGFuZGFyZFwiPlxuICAgICAgPGRpdiBjbGFzcz1cImhlYWRlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidGl0bGVcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNsb3NlXCI+XG4gICAgICAgICAgPGJ1dHRvbj48aSBjbGFzcz1cImkgaS1jbG9zZVwiPjwvaT48L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImJvZHlcIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJmb290ZXJcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBjb25zdCBtb2RhbCA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChodG1sKTtcbiAgY29uc3QgdGl0bGUgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcudGl0bGUnKTtcbiAgY29uc3QgY2xvc2VCdG4gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuY2xvc2UgYnV0dG9uJyk7XG4gIGNvbnN0IGJvZHkgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuYm9keScpO1xuICBjb25zdCBmb290ZXIgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuZm9vdGVyJyk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBtb2RhbCxcbiAgICB0aXRsZSxcbiAgICBjbG9zZUJ0bixcbiAgICBib2R5LFxuICAgIGZvb3RlclxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xufSx7XCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6NTl9XSwxMTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5mdW5jdGlvbiBNb2RhbHNDb250cm9sbGVyKCkge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFscycpXG5cbiAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnbW9kYWxzJyk7XG4gICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnbm8tZGlzcGxheScpO1xuICAgICAgY29udGFpbmVyLmlkID0gJ21vZGFscyc7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICB9XG5cbiAgICBsZXQgY292ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWxzLWNvdmVyJylcblxuICAgIGlmICghY292ZXIpIHtcbiAgICAgIGNvdmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBjb3Zlci5jbGFzc0xpc3QuYWRkKCdtb2RhbHMtY292ZXInKTtcbiAgICAgIGNvdmVyLmlkID0gJ21vZGFscy1jb3Zlcic7XG4gICAgICB0aGlzLmNvdmVyID0gY292ZXI7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5jb3ZlciA9IGNvdmVyO1xuICAgIH1cblxuICAgIHRoaXMubW9kYWxzT3BlbiA9IFtdO1xuICB9KTtcbn1cblxuTW9kYWxzQ29udHJvbGxlci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24obW9kYWwpIHtcbiAgY29uc3QgZWxlbWVudCA9IG1vZGFsLmVsZW1lbnRzLnJvb3Q7XG4gIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICB0aGlzLmNvbnRhaW5lci5pbnNlcnRCZWZvcmUodGhpcy5jb3ZlciwgZWxlbWVudCk7XG59O1xuXG5Nb2RhbHNDb250cm9sbGVyLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24obW9kYWwpIHtcbiAgaWYgKHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5jb250YWlucygnbm8tZGlzcGxheScpKSB7XG4gICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnbm8tZGlzcGxheScpO1xuICB9XG5cbiAgaWYgKHRoaXMubW9kYWxzT3Blbi5sZW5ndGggPiAwKSB7XG4gICAgdGhpcy5nZXRMYXN0KCkuZWxlbWVudHMucm9vdC5jbGFzc0xpc3QuYWRkKCduby1kaXNwbGF5Jyk7XG4gIH1cblxuICBjb25zdCBlbGVtZW50ID0gbW9kYWwuZWxlbWVudHMucm9vdDtcbiAgdGhpcy5jb250YWluZXIuaW5zZXJ0QmVmb3JlKHRoaXMuY292ZXIsIGVsZW1lbnQpO1xuICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ25vLWRpc3BsYXknKTtcbiAgdGhpcy5tb2RhbHNPcGVuLnB1c2gobW9kYWwpO1xufTtcblxuTW9kYWxzQ29udHJvbGxlci5wcm90b3R5cGUuY2xvc2VMYXN0ID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLm1vZGFsc09wZW4ubGVuZ3RoID09IDApIHRocm93IG5ldyBFcnJvcignTm8gbW9kYWxzIHRvIGNsb3NlJyk7XG5cbiAgdGhpcy5nZXRMYXN0KCkuZWxlbWVudHMucm9vdC5jbGFzc0xpc3QuYWRkKCduby1kaXNwbGF5Jyk7XG4gIHRoaXMubW9kYWxzT3Blbi5wb3AoKTtcblxuICBpZiAodGhpcy5tb2RhbHNPcGVuLmxlbmd0aCA+IDApIHtcbiAgICB0aGlzLmdldExhc3QoKS5lbGVtZW50cy5yb290LmNsYXNzTGlzdC5yZW1vdmUoJ25vLWRpc3BsYXknKTtcbiAgfVxuICBlbHNlIHtcbiAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCduby1kaXNwbGF5Jyk7XG4gIH1cbn07XG5cbk1vZGFsc0NvbnRyb2xsZXIucHJvdG90eXBlLmdldExhc3QgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMubW9kYWxzT3Blblt0aGlzLm1vZGFsc09wZW4ubGVuZ3RoIC0gMV07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RhbHNDb250cm9sbGVyKCk7XG59LHt9XSwxMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuZnVuY3Rpb24gdGVtcGxhdGUoKSB7XG4gIGNvbnN0IGh0bWwgPSAvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwiZm9ybSBjZS1mb3JtXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiZmllbGQgZmllbGQtb25lbGluZSBmaWVsZC10aXRsZSBjbGVhcmZpeFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWxcIj48bGFiZWwgZm9yPVwiY2UtZm9ybS10aXRsZVwiPlRpdGxlPC9sYWJlbD48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWlucHV0XCI+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgaWQ9XCJjZS1mb3JtLXRpdGxlXCIgLz48L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiZmllbGQgZmllbGQtb25lbGluZSBmaWVsZC1kZXNjIGNsZWFyZml4XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPjxsYWJlbCBmb3I9XCJjZS1mb3JtLWRlc2NcIj5EZXNjcmlwdGlvbjwvbGFiZWw+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1pbnB1dFwiPjx0ZXh0YXJlYSBpZD1cImNlLWZvcm0tZGVzY1wiPjwvdGV4dGFyZWE+PC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImZpZWxkIGZpZWxkLW9uZWxpbmUgZmllbGQtZGF0ZSBjbGVhcmZpeFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWxcIj48bGFiZWwgZm9yPVwiY2UtZm9ybS1kYXRlXCI+RGF0ZTwvbGFiZWw+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1pbnB1dFwiPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwiY2UtZm9ybS1kYXRlXCIgcGxhY2Vob2xkZXI9XCJkZC9tbS95eXl5XCIgLz5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuLW5vLXN0eWxlXCI+PGkgY2xhc3M9XCJpIGktY2FsZW5kYXJcIj48L2k+PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZCBmaWVsZC1vbmVsaW5lIGZpZWxkLXRpbWUgY2xlYXJmaXhcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWxhYmVsXCI+PGxhYmVsPlRpbWU8L2xhYmVsPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtaW5wdXRcIj5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cImhoOm1tXCIgY2xhc3M9XCJmcm9tXCIgLz5cbiAgICAgICAgICA8c3Bhbj4tPC9zcGFuPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiaGg6bW1cIiBjbGFzcz1cInRvXCIgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImZpZWxkIGZpZWxkLXBhcnRpY2lwYW50c1wiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWxcIj5QYXJ0aWNpcGFudHMgPGJ1dHRvbiBjbGFzcz1cImJ0bi1wcmltYXJ5LW91dGxpbmVkXCI+PGkgY2xhc3M9XCJpIGktcGx1c1wiPjwvaT5BZGQgcGFydGljaXBhbnQ8L2J1dHRvbj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWlucHV0XCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImZpZWxkIGZpZWxkLW9uZWxpbmUgZmllbGQtbGluayBjbGVhcmZpeFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWxcIj48bGFiZWwgZm9yPVwiY2UtZm9ybS1saW5rXCI+TGluazwvbGFiZWw+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1pbnB1dFwiPjxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwiY2UtZm9ybS1saW5rXCIgLz48L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiZmllbGQgZmllbGQtb25lbGluZSBmaWVsZC10eXBlIGNsZWFyZml4XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPjxsYWJlbCBmb3I9XCJjZS1mb3JtLWxpbmtcIj5UeXBlPC9sYWJlbD48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWlucHV0XCI+XG4gICAgICAgICAgPHNlbGVjdD48L3NlbGVjdD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImZpZWxkIGZpZWxkLW9uZWxpbmUgZmllbGQtcHJvamVjdCBjbGVhcmZpeFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWxcIj48bGFiZWwgZm9yPVwiY2UtZm9ybS1wcm9qZWN0XCI+UHJvamVjdDwvbGFiZWw+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1pbnB1dFwiPlxuICAgICAgICA8c2VsZWN0Pjwvc2VsZWN0PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiZmllbGQgZmllbGQtaW1wb3J0YW5jZVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWxcIj5JbXBvcnRhbmNlIG1hcms8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWlucHV0XCI+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBuYW1lPVwiaW1wb3J0YW5jZVwiIHZhbHVlPVwibm9uZVwiIGlkPVwiaW1wLW5vbmVcIiAvPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cImltcC1ub25lXCI+Tm9uZTwvbGFiZWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgXG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBuYW1lPVwiaW1wb3J0YW5jZVwiIHZhbHVlPVwiaW1wb3J0YW50XCIgaWQ9XCJpbXAtaW1wb3J0YW50XCIgLz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJpbXAtaW1wb3J0YW50XCI+SW1wb3J0YW50PC9sYWJlbD5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhZGlvXCIgbmFtZT1cImltcG9ydGFuY2VcIiB2YWx1ZT1cImRlc2lyYWJsZVwiIGlkPVwiaW1wLWRlc2lyYWJsZVwiIC8+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwiaW1wLWRlc2lyYWJsZVwiPkRlc2lyYWJsZTwvbGFiZWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZCBmaWVsZC1kb2NzXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkRvY3VtZW50cyA8YnV0dG9uIGNsYXNzPVwiYnRuLXByaW1hcnktb3V0bGluZWRcIj48aSBjbGFzcz1cImkgaS1wbHVzXCI+PC9pPkF0dGFjaCBkb2N1bWVudDwvYnV0dG9uPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtaW5wdXRcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xuXG4gIGNvbnN0IGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoaHRtbCk7XG4gIGNvbnN0IHRpdGxlID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZmllbGQtdGl0bGUgaW5wdXQnKTtcbiAgY29uc3QgZGVzYyA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkLWRlc2MgdGV4dGFyZWEnKTtcbiAgY29uc3QgZGF0ZSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkLWRhdGUgaW5wdXQnKTtcbiAgY29uc3QgZnJvbSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkLXRpbWUgLmZyb20nKTtcbiAgY29uc3QgdG8gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5maWVsZC10aW1lIC50bycpO1xuICBjb25zdCBhZGRQYXJ0aWNpcGFudEJ0biA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkLXBhcnRpY2lwYW50cyBidXR0b24nKTtcbiAgY29uc3QgYWRkUGFydGljaXBhbnRQbGFjZSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkLXBhcnRpY2lwYW50cyAuZmllbGQtaW5wdXQnKTtcbiAgY29uc3QgbGluayA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkLWxpbmsgaW5wdXQnKTtcbiAgY29uc3QgdHlwZUlucHV0ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZmllbGQtdHlwZSBpbnB1dCcpO1xuICBjb25zdCB0eXBlQnRuID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZmllbGQtdHlwZSBidXR0b24nKTtcbiAgY29uc3QgcHJvamVjdElucHV0ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZmllbGQtcHJvamVjdCBpbnB1dCcpO1xuICBjb25zdCBwcm9qZWN0QnRuID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZmllbGQtcHJvamVjdCBidXR0b24nKTtcbiAgY29uc3QgaW1wUmFkaW9Ob25lID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcjaW1wLW5vbmUnKTtcbiAgY29uc3QgaW1wUmFkaW9JbXBvcnRhbnQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbXAtaW1wb3J0YW50Jyk7XG4gIGNvbnN0IGltcFJhZGlvRGVzaXJhYmxlID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcjaW1wLWRlc2lyYWJsZScpO1xuICBjb25zdCBhZGREb2NCdG4gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5maWVsZC1kb2NzIGJ1dHRvbicpO1xuICBjb25zdCBhZGREb2NQbGFjZSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkLWRvY3MgLmZpZWxkLWlucHV0Jyk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBlbGVtZW50LFxuICAgIHRpdGxlLFxuICAgIGRlc2MsXG4gICAgZGF0ZSxcbiAgICB0aW1lOiB7XG4gICAgICBmcm9tLFxuICAgICAgdG9cbiAgICB9LFxuICAgIHBhcnRpY2lwYW50czoge1xuICAgICAgYnRuOiBhZGRQYXJ0aWNpcGFudEJ0bixcbiAgICAgIHBsYWNlOiBhZGRQYXJ0aWNpcGFudFBsYWNlXG4gICAgfSxcbiAgICBsaW5rLFxuICAgIHR5cGU6IHtcbiAgICAgIGlucHV0OiB0eXBlSW5wdXQsXG4gICAgICBidG46IHR5cGVCdG5cbiAgICB9LFxuICAgIHByb2plY3Q6IHtcbiAgICAgIGlucHV0OiBwcm9qZWN0SW5wdXQsXG4gICAgICBidG46IHByb2plY3RCdG5cbiAgICB9LFxuICAgIGltcG9ydGFuY2U6IHtcbiAgICAgIG5vbmU6IGltcFJhZGlvTm9uZSxcbiAgICAgIGltcG9ydGFudDogaW1wUmFkaW9JbXBvcnRhbnQsXG4gICAgICBkZXNpcmFibGU6IGltcFJhZGlvRGVzaXJhYmxlXG4gICAgfSxcbiAgICBkb2NzOiB7XG4gICAgICBidG46IGFkZERvY0J0bixcbiAgICAgIHBsYWNlOiBhZGREb2NQbGFjZVxuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcbn0se1wiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjU5fV0sMTM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgTW9kYWwgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvbW9kYWxzJyk7XG5jb25zdCB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vZm9ybS50cGwnKTtcbmNvbnN0IFNQTW9kYWwgPSByZXF1aXJlKCcuLi9zZWxlY3QtcGFydGljaXBhbnRzLW1vZGFsJyk7XG5cbi8vIC8vIFNQIHN0YW5kcyBmb3Igc2VsZWN0IHBhcnRpY2lwYW50c1xuLy8gZnVuY3Rpb24gYmluZFNQTW9kYWwob3Blbk1vZGFsQnRuKSB7XG4vLyAgIGxldCBTUE1vZGFsSW5zdGFuY2UgPSBudWxsO1xuICBcbi8vICAgb3Blbk1vZGFsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuLy8gICAgIFNQTW9kYWxJbnN0YW5jZSA9IFNQTW9kYWwuY3JlYXRlKHRoaXMucGFydGljaXBhbnRzKTtcbi8vICAgICBTUE1vZGFsSW5zdGFuY2UuZWxlbWVudHMucm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGV2dCA9PiB7XG4vLyAgICAgICBTUE1vZGFsSW5zdGFuY2UgPSBudWxsO1xuXG4vLyAgICAgICBjb25zdCBwYXJ0aWNpcGFudHMgPSBldnQuZGV0YWlsLnBhcnRpY2lwYW50cztcbi8vICAgICB9KTtcblxuLy8gICAgIFNQTW9kYWxJbnN0YW5jZS5vcGVuKCk7XG4vLyAgIH0pO1xuLy8gfVxuXG4vLyBmdW5jdGlvbiByZW5kZXJQYXJ0aWNpcGFudHMoKSB7XG4gIFxuLy8gfVxuXG4vLyBjb25zdCBDRU1vZGFsID0ge1xuLy8gICBjcmVhdGUoKSB7XG4vLyAgICAgY29uc3QgQ0VNb2RhbEluc3RhbmNlID0gTW9kYWwuY3JlYXRlKHtcbi8vICAgICAgIHR5cGU6ICdzdGFuZGFyZCcsXG4vLyAgICAgICB0aXRsZTogJ0NyZWF0ZSBldmVudCcsXG4vLyAgICAgICB3aWR0aDogNDAwLFxuLy8gICAgICAgZGVmYXVsdEFjdGlvbnM6IHRydWUsXG4vLyAgICAgICBkZXN0cm95T25DbG9zZTogdHJ1ZVxuLy8gICAgIH0pO1xuXG4vLyAgICAgY29uc3QgdHBsQ29udHJvbGxlciA9IHRlbXBsYXRlKCk7XG4vLyAgICAgQ0VNb2RhbEluc3RhbmNlLmVsZW1lbnRzLmJvZHkuYXBwZW5kQ2hpbGQodHBsQ29udHJvbGxlci5yb290KTtcblxuLy8gICAgIHRoaXMucGFydGljaXBhbnRzID0gW107XG4vLyAgICAgdGhpcy5iaW5kU1BNb2RhbCh0cGxDb250cm9sbGVyLnBhcnRpY2lwYW50cy5idG4pO1xuXG4gICAgXG5cbi8vICAgICByZXR1cm4gQ0VNb2RhbEluc3RhbmNlO1xuLy8gICB9XG4vLyB9O1xuXG5cblxuZnVuY3Rpb24gQ0VNb2RhbCgpIHtcbiAgY29uc3QgQ0VNb2RhbEluc3RhbmNlID0gTW9kYWwuY3JlYXRlKHtcbiAgICB0eXBlOiAnc3RhbmRhcmQnLFxuICAgIHRpdGxlOiAnQ3JlYXRlIGV2ZW50JyxcbiAgICB3aWR0aDogNDAwLFxuICAgIGRlZmF1bHRBY3Rpb25zOiB0cnVlLFxuICAgIGRlc3Ryb3lPbkNsb3NlOiB0cnVlXG4gIH0pO1xuXG4gIGNvbnN0IHRwbENvbnRyb2xsZXIgPSB0ZW1wbGF0ZSgpO1xuICBDRU1vZGFsSW5zdGFuY2UuZWxlbWVudHMuYm9keS5hcHBlbmRDaGlsZCh0cGxDb250cm9sbGVyLnJvb3QpO1xuXG4gIHRoaXMubW9kYWwgPSBDRU1vZGFsSW5zdGFuY2U7XG4gIHRoaXMudHBsQ29udHJvbGxlciA9IHRwbENvbnRyb2xsZXI7XG4gIHRoaXMuZGF0YSA9IHsgcGFydGljaXBhbnRzOiBbXSwgZmlsZXM6IFtdIH07XG4gIHRoaXMuYmluZFNQTW9kYWwoKTtcblxuICBcbiAgcmV0dXJuIENFTW9kYWxJbnN0YW5jZTtcbn1cblxuQ0VNb2RhbC5wcm90b3R5cGUuYmluZFNQTW9kYWwgPSBmdW5jdGlvbigpIHtcbiAgbGV0IFNQTW9kYWxJbnN0YW5jZSA9IG51bGw7XG4gIGNvbnN0IG9wZW5Nb2RhbEJ0biA9IHRoaXMudHBsQ29udHJvbGxlci5wYXJ0aWNpcGFudHMuYnRuO1xuICBcbiAgb3Blbk1vZGFsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIFNQTW9kYWxJbnN0YW5jZSA9IFNQTW9kYWwuY3JlYXRlKHtcbiAgICAgIHBhcnRpY2lwYW50czogdGhpcy5kYXRhLnBhcnRpY2lwYW50cyxcbiAgICAgIGRhdGU6IHRoaXMudHBsQ29udHJvbGxlci5kYXRlLFxuICAgICAgZnJvbTogdGhpcy50cGxDb250cm9sbGVyLnRpbWUuZnJvbSxcbiAgICAgIHRvOiB0aGlzLnRwbENvbnRyb2xsZXIudGltZS50b1xuICAgIH0pO1xuICAgIFNQTW9kYWxJbnN0YW5jZS5lbGVtZW50cy5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgZXZ0ID0+IHtcbiAgICAgIFNQTW9kYWxJbnN0YW5jZSA9IG51bGw7XG4gICAgICB0aGlzLmRhdGEucGFydGljaXBhbnRzID0gZXZ0LmRldGFpbC5wYXJ0aWNpcGFudHM7XG4gICAgICB0aGlzLnJlbmRlclBhcnRpY2lwYW50cygpO1xuICAgIH0pO1xuXG4gICAgU1BNb2RhbEluc3RhbmNlLm9wZW4oKTtcbiAgfSk7XG59O1xuXG5DRU1vZGFsLnByb3RvdHlwZS5yZW5kZXJQYXJ0aWNpcGFudHMgPSBmdW5jdGlvbigpIHtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogKCkgPT4gbmV3IENFTW9kYWwoKVxufTtcbn0se1wiLi4vc2VsZWN0LXBhcnRpY2lwYW50cy1tb2RhbFwiOjIwLFwiLi9mb3JtLnRwbFwiOjEyLFwiY3NwLWFwcC9jb21wb25lbnRzL21vZGFsc1wiOjd9XSwxNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBTY2hlZHVsZXJDb21wb25lbnQgPSByZXF1aXJlKCcuL21haW4nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTY2hlZHVsZXJDb21wb25lbnQ7XG59LHtcIi4vbWFpblwiOjE3fV0sMTU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgdGVtcGxhdGUgPSByZXF1aXJlKCcuL2luZGV4LnRwbCcpO1xuY29uc3QgTW9kYWwgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvbW9kYWxzJyk7XG5jb25zdCBDRU1vZGFsID0gcmVxdWlyZSgnLi4vY3JlYXRlLWV2ZW50LW1vZGFsJyk7XG5cbmZ1bmN0aW9uIGZpbGxXaXRoRXZlbnRzKHRwbENvbnRyb2xsZXIpIHtcbiAgY29uc3Qge2Nsb3NlQnRuLCBvcGVuQ0VNb2RhbEJ0bn0gPSB0cGxDb250cm9sbGVyO1xuXG4gIGNsb3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgfSk7XG5cbiAgbGV0IENFTW9kYWxJbnN0YW5jZSA9IG51bGw7XG5cbiAgb3BlbkNFTW9kYWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgaWYgKCFDRU1vZGFsSW5zdGFuY2UpIHtcbiAgICAgIENFTW9kYWxJbnN0YW5jZSA9IENFTW9kYWwuY3JlYXRlKCk7XG4gICAgICBDRU1vZGFsSW5zdGFuY2UuZWxlbWVudHMucm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGV2dCA9PiB7XG4gICAgICAgIENFTW9kYWxJbnN0YW5jZSA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBDRU1vZGFsSW5zdGFuY2Uub3BlbigpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlKCkge1xuICBjb25zdCB0cGxDb250cm9sbGVyID0gdGVtcGxhdGUoKTtcbiAgdGhpcy5faW5zdGFuY2VDb250cm9sbGVyID0gdHBsQ29udHJvbGxlcjtcbiAgZmlsbFdpdGhFdmVudHMuY2FsbCh0aGlzLCB0cGxDb250cm9sbGVyKTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0cGxDb250cm9sbGVyLnJvb3QpO1xuICB0aGlzLl9pc0luaXQgPSBmYWxzZTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbmZ1bmN0aW9uIG9wZW4oKSB7XG4gIGNvbnN0IGVsID0gdGhpcy5faW5zdGFuY2VDb250cm9sbGVyLnJvb3Q7XG4gIGlmICghZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdkaXNwbGF5LXllcycpKSB7XG4gICAgZWwuY2xhc3NMaXN0LmFkZCgnZGlzcGxheS15ZXMnKTtcbiAgfVxuICBpZiAoIXRoaXMuX2lzSW5pdCkge1xuICAgIHRoaXMuX2luc3RhbmNlQ29udHJvbGxlci5zY2hlZHVsZXIuZ2VuZXJhdGVIb3Vyc01hcmtzKCk7XG4gICAgdGhpcy5faW5zdGFuY2VDb250cm9sbGVyLnNjaGVkdWxlci5nZW5lcmF0ZVN0cmlwcygpO1xuICAgIHRoaXMuX2lzSW5pdCA9IHRydWU7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG5cbmZ1bmN0aW9uIGNsb3NlKCkge1xuICBjb25zdCBlbCA9IHRoaXMuX2luc3RhbmNlQ29udHJvbGxlci5yb290O1xuICBpZiAoZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdkaXNwbGF5LXllcycpKSB7XG4gICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZGlzcGxheS15ZXMnKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblxuZnVuY3Rpb24gZGVzdHJveSgpIHtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlLFxuICBvcGVuLFxuICBjbG9zZSxcbiAgZGVzdHJveVxufTtcbn0se1wiLi4vY3JlYXRlLWV2ZW50LW1vZGFsXCI6MTMsXCIuL2luZGV4LnRwbFwiOjE2LFwiY3NwLWFwcC9jb21wb25lbnRzL21vZGFsc1wiOjd9XSwxNjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBtb2RhbFRlbXBsYXRlID0gcmVxdWlyZSgnLi4vbWFpbi9tb2RhbC50cGwnKTtcbmNvbnN0IHtyYW5nZSwgY3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuY29uc3Qgc2lkZWJhclRwbCA9IC8qaHRtbCovYFxuXG5gO1xuXG5jb25zdCBzY2hlZHVsZXJUcGwgPSAvKmh0bWwqL2BcbiAgPGRpdiBjbGFzcz1cImNtcF9pbmQtc2NoZWR1bGVyXCI+XG4gICAgPGRpdiBjbGFzcz1cInNjaGVkdWxlci1jb250YWluZXJcIj5cbiAgICAgIDxidXR0b24gaWQ9XCJvcGVuLUNFTW9kYWxcIj5PcGVuIG1vZGFsPC9idXR0b24+XG4gICAgICA8ZGl2IGNsYXNzPVwic2NoZWR1bGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJsZWZ0XCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImRhdGUtbW92ZSBkYXRlLXVwLXdyYXBwZXJcIj5cbiAgICAgICAgICAgIDxidXR0b24+PGkgY2xhc3M9XCJpIGktc29ydFwiPjwvaT48L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXRlc1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhdGVcIj5BcHJpbCwgODwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhdGVcIj5BcHJpbCwgOTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhdGVcIj5BcHJpbCwgMTA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXRlXCI+QXByaWwsIDExPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF0ZVwiPkFwcmlsLCAxMjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhdGVcIj5BcHJpbCwgMTM8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXRlXCI+QXByaWwsIDE0PC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF0ZS1tb3ZlIGRhdGUtZG93bi13cmFwcGVyXCI+XG4gICAgICAgICAgICA8YnV0dG9uPjxpIGNsYXNzPVwiaSBpLXNvcnRcIj48L2k+PC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBcbiAgICAgICAgPGRpdiBjbGFzcz1cInJpZ2h0XCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInN0cmlwc1wiPjwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lbGluZS1oXCI+PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInRpbWVsaW5lLWJcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lbGluZVwiPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRpbWVsaW5lXCI+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGltZWxpbmVcIj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lbGluZVwiPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRpbWVsaW5lXCI+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGltZWxpbmVcIj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lbGluZVwiPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbmA7XG5cbmZ1bmN0aW9uIGdlbmVyYXRlSG91cnNNYXJrcyh0aW1lbGluZUhlYWRlcikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgaW5pdE1hcmdpbiA9IDMwO1xuICAgIGNvbnN0IHdpZHRoID0gdGltZWxpbmVIZWFkZXIub2Zmc2V0V2lkdGg7XG4gICAgY29uc3QgbnVtcyA9IHJhbmdlKDksIDIxKTtcbiAgICBjb25zdCBvZmZzZXQgPSAod2lkdGggLSBpbml0TWFyZ2luKjIpLyhudW1zLmxlbmd0aC0xKTtcbiAgICBjb25zdCBlbGVtZW50cyA9IG51bXMubWFwKG51bSA9PiB7XG4gICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKCdob3VyJyk7XG4gICAgICBkaXYudGV4dENvbnRlbnQgPSBudW07XG4gICAgICByZXR1cm4gZGl2O1xuICAgIH0pO1xuICAgIGxldCBzdW0gPSAwO1xuXG4gICAgc3VtICs9IGluaXRNYXJnaW47XG4gICAgdGltZWxpbmVIZWFkZXIuYXBwZW5kQ2hpbGQoZWxlbWVudHNbMF0pO1xuICAgIGVsZW1lbnRzWzBdLnRleHRDb250ZW50ID0gbnVtc1swXTtcbiAgICBjb25zdCB3aWR0aDAgPSBlbGVtZW50c1swXS5vZmZzZXRXaWR0aDtcbiAgICBcbiAgICBlbGVtZW50c1swXS5zdHlsZS5sZWZ0ID0gKHN1bS13aWR0aDAvMikgKyAncHgnO1xuICAgIGVsZW1lbnRzLnNsaWNlKDEpLmZvckVhY2goZWwgPT4ge1xuICAgICAgc3VtICs9IG9mZnNldDtcbiAgICAgIHRpbWVsaW5lSGVhZGVyLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgIGNvbnN0IHdpZHRoID0gZWwub2Zmc2V0V2lkdGg7XG4gICAgICBlbC5zdHlsZS5sZWZ0ID0gKHN1bSAtIHdpZHRoLzIpICsgJ3B4JztcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZVN0cmlwcyhzdHJpcHNXcmFwcGVyKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBpbml0TWFyZ2luID0gMzA7XG4gICAgY29uc3Qgd2lkdGggPSBzdHJpcHNXcmFwcGVyLm9mZnNldFdpZHRoO1xuICAgIGNvbnN0IG51bXMgPSByYW5nZSg5LCAyMSk7XG4gICAgY29uc3Qgb2Zmc2V0ID0gKHdpZHRoIC0gaW5pdE1hcmdpbioyKS8obnVtcy5sZW5ndGgtMSk7XG4gICAgbGV0IHN1bSA9IDA7XG5cbiAgICBjb25zdCBzdHJpcHMgPSBudW1zLm1hcChudW0gPT4ge1xuICAgICAgY29uc3Qgc3RyaXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHN0cmlwLmNsYXNzTGlzdC5hZGQoJ3N0cmlwJyk7XG4gICAgICByZXR1cm4gc3RyaXA7XG4gICAgfSk7XG5cbiAgICBzdW0gKz0gaW5pdE1hcmdpbjtcblxuICAgIHN0cmlwcy5mb3JFYWNoKHN0cmlwID0+IHtcbiAgICAgIHN0cmlwLnN0eWxlLmxlZnQgPSBzdW0gKyAncHgnO1xuICAgICAgc3RyaXBzV3JhcHBlci5hcHBlbmRDaGlsZChzdHJpcCk7XG4gICAgICBzdW0gKz0gb2Zmc2V0O1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKCkge1xuICBjb25zdCBtb2RhbFRwbENvbnRyb2xsZXIgPSBtb2RhbFRlbXBsYXRlKCk7XG4gIGNvbnN0IHNjaGVkdWxlciA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTChzY2hlZHVsZXJUcGwpO1xuXG4gIGNvbnN0IGRhdGVVcCA9IHNjaGVkdWxlci5xdWVyeVNlbGVjdG9yKCcuZGF0ZS11cC13cmFwcGVyIGJ1dHRvbicpO1xuICBjb25zdCBkYXRlRG93biA9IHNjaGVkdWxlci5xdWVyeVNlbGVjdG9yKCcuZGF0ZS1kb3duLXdyYXBwZXIgYnV0dG9uJyk7XG4gIGNvbnN0IGRhdGVzID0gc2NoZWR1bGVyLnF1ZXJ5U2VsZWN0b3IoJy5kYXRlcycpO1xuICBjb25zdCB0aW1lbGluZUhlYWRlciA9IHNjaGVkdWxlci5xdWVyeVNlbGVjdG9yKCcudGltZWxpbmUtaCcpO1xuICBjb25zdCB0aW1lbGluZUJvZHkgPSBzY2hlZHVsZXIucXVlcnlTZWxlY3RvcignLnRpbWVsaW5lLWInKTtcbiAgY29uc3Qgc3RyaXBzID0gc2NoZWR1bGVyLnF1ZXJ5U2VsZWN0b3IoJy5zdHJpcHMnKTtcbiAgY29uc3Qgb3BlbkNFTW9kYWxCdG4gPSBzY2hlZHVsZXIucXVlcnlTZWxlY3RvcignI29wZW4tQ0VNb2RhbCcpO1xuXG4gIG1vZGFsVHBsQ29udHJvbGxlci5jb250ZW50LmFwcGVuZENoaWxkKHNjaGVkdWxlcik7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5tb2RhbFRwbENvbnRyb2xsZXIsXG4gICAgb3BlbkNFTW9kYWxCdG4sXG4gICAgc2NoZWR1bGVyOiB7XG4gICAgICByb290OiBzY2hlZHVsZXIsXG4gICAgICBkYXRlVXAsXG4gICAgICBkYXRlRG93bixcbiAgICAgIGRhdGVzLCAgICAgIFxuICAgICAgdGltZWxpbmU6IHRpbWVsaW5lQm9keSxcbiAgICAgIGdlbmVyYXRlSG91cnNNYXJrczogZ2VuZXJhdGVIb3Vyc01hcmtzKHRpbWVsaW5lSGVhZGVyKSxcbiAgICAgIGdlbmVyYXRlU3RyaXBzOiBnZW5lcmF0ZVN0cmlwcyhzdHJpcHMpXG4gICAgfVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xufSx7XCIuLi9tYWluL21vZGFsLnRwbFwiOjE5LFwiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjU5fV0sMTc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgdGVtcGxhdGUgPSByZXF1aXJlKCcuL2luZGV4LnRwbCcpO1xuY29uc3QgSVNNb2RhbCA9IHJlcXVpcmUoJy4uL2luZGl2aWR1YWwtc2NoZWR1bGVyJyk7XG5cbmNvbnN0IFNjaGVkdWxlckNvbXBvbmVudCA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCB0cGxDb250cm9sbGVyID0gdGVtcGxhdGUoKTtcbiAgbGV0IElTTW9kYWxJbnN0YW5jZSA9IG51bGw7XG5cbiAgdHBsQ29udHJvbGxlci5idG5PcGVuSW5kU2NoLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIGlmICghSVNNb2RhbEluc3RhbmNlKSB7XG4gICAgICBJU01vZGFsSW5zdGFuY2UgPSBJU01vZGFsLmNyZWF0ZSgpO1xuICAgIH1cbiAgICBcbiAgICBJU01vZGFsSW5zdGFuY2Uub3BlbigpO1xuICB9KTtcblxuICByZXR1cm4ge1xuICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgY29udHJvbGxlcjoge1xuICAgICAgZWxlbWVudDogdHBsQ29udHJvbGxlci5yb290XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTY2hlZHVsZXJDb21wb25lbnQ7XG59LHtcIi4uL2luZGl2aWR1YWwtc2NoZWR1bGVyXCI6MTUsXCIuL2luZGV4LnRwbFwiOjE4fV0sMTg6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKCkge1xuICBjb25zdCBodG1sID0gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cImNtcF9zY2hlZHVsZXItZGJvYXJkXCI+XG4gICAgICA8YnV0dG9uIGlkPVwiYnRuLW9wZW4taW5kU2NoXCI+T3BlbiBpbmRpdmlkdWFsIHNjaGVkdWxlcjxidXR0b24+XG4gICAgPC9kaXY+XG4gIGA7XG4gIGNvbnN0IGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoaHRtbCk7XG4gIGNvbnN0IGJ0bk9wZW5JbmRTY2ggPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJyNidG4tb3Blbi1pbmRTY2gnKTtcblxuICByZXR1cm4ge1xuICAgIHJvb3Q6IGVsZW1lbnQsXG4gICAgYnRuT3BlbkluZFNjaDogYnRuT3BlbkluZFNjaFxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xufSx7XCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6NTl9XSwxOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuZnVuY3Rpb24gdGVtcGxhdGUoKSB7XG4gIGNvbnN0IGh0bWwgPSAvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwiY21wX3NjaGVkdWxlclwiPlxuICAgICAgPGRpdiBjbGFzcz1cInNpZGViYXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImJhY2std3JhcHBlciBtb2RhbC1jbG9zZVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJiYWNrLWljb25cIj48aSBjbGFzcz1cImkgaS1hcnJvd1wiPjwvaT48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYmFjay1sYWJlbFwiPkJhY2sgdG8gZGFzaGJvYXJkPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiY29udGVudFwiPjwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xuICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKGh0bWwpO1xuICBjb25zdCBjbG9zZUJ0biA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLm1vZGFsLWNsb3NlJyk7XG4gIGNvbnN0IHNpZGViYXIgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaWRlYmFyJyk7XG4gIGNvbnN0IGNvbnRlbnQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250ZW50Jyk7XG4gIFxuICByZXR1cm4ge1xuICAgIHJvb3Q6IGVsZW1lbnQsXG4gICAgY2xvc2VCdG4sXG4gICAgc2lkZWJhcixcbiAgICBjb250ZW50XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo1OX1dLDIwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IE1vZGFsID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL21vZGFscycpO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9odHRwJyk7XG5cbmZ1bmN0aW9uIFNQTW9kYWwob3B0aW9ucykge1xuICBjb25zdCBwYXJ0aWNpcGFudHNTZWxlY3RlZCA9IG9wdGlvbnMucGFydGljaXBhbnRzO1xuXG4gIGNvbnN0IFNQTW9kYWxJbnN0YW5jZSA9IE1vZGFsLmNyZWF0ZSh7XG4gICAgdHlwZTogJ3N0YW5kYXJkJyxcbiAgICB0aXRsZTogJ1NlbGVjdCBwYXJ0aWNpcGFudHMnLFxuICAgIHdpZHRoOiAyNTAsXG4gICAgZGVmYXVsdEFjdGlvbnM6IHRydWUsXG4gICAgZGVzdHJveU9uQ2xvc2U6IHRydWVcbiAgfSk7XG5cbiAgaHR0cC5wb3N0KCdzY2hlZHVsZXIvZ2V0RnJpZW5kc0F2YWlsYWJpbGl0eScpXG4gICAgLnRoZW4oZnJpZW5kcyA9PiB7XG5cbiAgICB9KVxuICA7XG5cbiAgcmV0dXJuIFNQTW9kYWxJbnN0YW5jZTtcbn1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6ICgpID0+IG5ldyBTUE1vZGFsKClcbn07XG59LHtcImNzcC1hcHAvY29tcG9uZW50cy9tb2RhbHNcIjo3LFwiY3NwLWFwcC9saWJzL2h0dHBcIjo1MH1dLDIxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMnKTtcbmNvbnN0IHttaW5MZW5ndGgsIG1heExlbmd0aCwgc3RhcnRzV2l0aE51bWJlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMvdmFsaWRhdG9ycycpO1xuXG5jb25zdCB1c2VybmFtZSA9IHtcbiAga2V5TmFtZTogJ3VzZXJuYW1lJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS11c2VybmFtZScsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAndGV4dCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1VzZXJuYW1lJ31cbiAgXSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnbWF4TGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1heExlbmd0aFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3N0YXJ0c1dpdGhOdW1iZXInLFxuICAgICAgaGFuZGxlcjogc3RhcnRzV2l0aE51bWJlclxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgcGFzc3dvcmQgPSB7XG4gIGtleU5hbWU6ICdwYXNzd29yZCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tcGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3Bhc3N3b3JkJ30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnUGFzc3dvcmQnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBjb25maXJtUGFzc3dvcmQgPSB7XG4gIGtleU5hbWU6ICdjb25maXJtUGFzc3dvcmQnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLWNvbmZpcm1QYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAncGFzc3dvcmQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdDb25maXJtIHBhc3N3b3JkJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgZW1haWwgPSB7XG4gIGtleU5hbWU6ICdlbWFpbCcsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tcGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3RleHQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdFLW1haWwnfVxuICBdLFxuICByZXF1aXJlZDogdHJ1ZSxcbiAgdmFsaWRhdG9yczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtaW5MZW5ndGgnLFxuICAgICAgaGFuZGxlcjogbWluTGVuZ3RoXG4gICAgfVxuICBdLFxuICB3cmFwcGVyOiB7Y2xhc3M6ICdpbnB1dC1ibG9jayd9XG59O1xuXG5jb25zdCBjbGllbnRGb3JtID0gbmV3IEZvcm0oe1xuICB2YWxpZGF0b3JzOiBbXSxcbiAgc3VibWl0OiB7XG4gICAgaGFuZGxlcjogZnVuY3Rpb24odmFsdWVzLCBldnQpIHtcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY29uc29sZS5sb2coJ0Zvcm0gaXMgY2xlYW4nKTtcbiAgICB9XG4gIH0sXG4gIGNvbnRyb2xzOiBbXG4gICAgdXNlcm5hbWUsXG4gICAgcGFzc3dvcmQsXG4gICAgY29uZmlybVBhc3N3b3JkLFxuICAgIGVtYWlsXG4gIF1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsaWVudEZvcm07XG59LHtcImNzcC1hcHAvbGlicy9mb3Jtc1wiOjQ4LFwiY3NwLWFwcC9saWJzL2Zvcm1zL3ZhbGlkYXRvcnNcIjo0OX1dLDIyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMnKTtcbmNvbnN0IHttaW5MZW5ndGgsIG1heExlbmd0aCwgc3RhcnRzV2l0aE51bWJlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvZm9ybXMvdmFsaWRhdG9ycycpO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9odHRwJylcblxuY29uc3QgdXNlcm5hbWUgPSB7XG4gIGtleU5hbWU6ICd1c2VybmFtZScsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tdXNlcm5hbWUnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3RleHQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdVc2VybmFtZSd9XG4gIF0sXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ21heExlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtYXhMZW5ndGhcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdzdGFydHNXaXRoTnVtYmVyJyxcbiAgICAgIGhhbmRsZXI6IHN0YXJ0c1dpdGhOdW1iZXJcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IHBhc3N3b3JkID0ge1xuICBrZXlOYW1lOiAncGFzc3dvcmQnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICdwYXNzd29yZCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1Bhc3N3b3JkJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgY29uZmlybVBhc3N3b3JkID0ge1xuICBrZXlOYW1lOiAnY29uZmlybVBhc3N3b3JkJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1jb25maXJtUGFzc3dvcmQnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3Bhc3N3b3JkJ30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnQ29uZmlybSBwYXNzd29yZCd9XG4gIF0sXG4gIHJlcXVpcmVkOiB0cnVlLFxuICB2YWxpZGF0b3JzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21pbkxlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtaW5MZW5ndGhcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IGVtYWlsID0ge1xuICBrZXlOYW1lOiAnZW1haWwnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICd0ZXh0J30sXG4gICAge25hbWU6ICdwbGFjZWhvbGRlcicsIHZhbHVlOiAnRS1tYWlsJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3Qgb3JnID0ge1xuICBrZXlOYW1lOiAnb3JnJyxcbiAgdGFnOiAnaW5wdXQnLFxuICBpZDogJ2xvZ2luZm9ybS1wYXNzd29yZCcsXG4gIGxhYmVsOiAnJyxcbiAgYXR0cmlidXRlczogW1xuICAgIHtuYW1lOiAndHlwZScsIHZhbHVlOiAndGV4dCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1lvdXIgb3JnYW5pemF0aW9uJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgZXhlY0Zvcm0gPSBuZXcgRm9ybSh7XG4gIHZhbGlkYXRvcnM6IFtdLFxuICBzdWJtaXQ6IHtcbiAgICBoYW5kbGVyOiBmdW5jdGlvbih2YWx1ZXMsIGV2dCkge1xuICAgICAgY29uc3QgYm9keSA9IHtcbiAgICAgICAgdXNlcm5hbWU6IHZhbHVlcy51c2VybmFtZSxcbiAgICAgICAgZW1haWw6IHZhbHVlcy5lbWFpbCxcbiAgICAgICAgcGFzc3dvcmQ6IHZhbHVlcy5wYXNzd29yZFxuICAgICAgfTtcblxuICAgICAgaHR0cC5wb3N0KCdhdXRoL3NpZ251cC9leGVjJywgYm9keSlcbiAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKVxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKVxuICAgICAgICB9KVxuICAgICAgO1xuICAgIH1cbiAgfSxcbiAgY29udHJvbHM6IFtcbiAgICB1c2VybmFtZSxcbiAgICBwYXNzd29yZCxcbiAgICBjb25maXJtUGFzc3dvcmQsXG4gICAgZW1haWwsXG4gICAgb3JnXG4gIF1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4ZWNGb3JtO1xufSx7XCJjc3AtYXBwL2xpYnMvZm9ybXNcIjo0OCxcImNzcC1hcHAvbGlicy9mb3Jtcy92YWxpZGF0b3JzXCI6NDksXCJjc3AtYXBwL2xpYnMvaHR0cFwiOjUwfV0sMjM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgRm9ybSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3JtcycpO1xuY29uc3Qge21pbkxlbmd0aCwgbWF4TGVuZ3RoLCBzdGFydHNXaXRoTnVtYmVyfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9mb3Jtcy92YWxpZGF0b3JzJyk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IE1haW5Db250cm9sbGVyID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL21haW4nKTtcbmNvbnN0IERhc2hib2FyZCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmQnKTtcblxuY29uc3QgdXNlcm5hbWUgPSB7XG4gIGtleU5hbWU6ICd1c2VybmFtZScsXG4gIHRhZzogJ2lucHV0JyxcbiAgaWQ6ICdsb2dpbmZvcm0tdXNlcm5hbWUnLFxuICBsYWJlbDogJycsXG4gIGF0dHJpYnV0ZXM6IFtcbiAgICB7bmFtZTogJ3R5cGUnLCB2YWx1ZTogJ3RleHQnfSxcbiAgICB7bmFtZTogJ3BsYWNlaG9sZGVyJywgdmFsdWU6ICdVc2VybmFtZSd9XG4gIF0sXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ21heExlbmd0aCcsXG4gICAgICBoYW5kbGVyOiBtYXhMZW5ndGhcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdzdGFydHNXaXRoTnVtYmVyJyxcbiAgICAgIGhhbmRsZXI6IHN0YXJ0c1dpdGhOdW1iZXJcbiAgICB9XG4gIF0sXG4gIHdyYXBwZXI6IHtjbGFzczogJ2lucHV0LWJsb2NrJ31cbn07XG5cbmNvbnN0IHBhc3N3b3JkID0ge1xuICBrZXlOYW1lOiAncGFzc3dvcmQnLFxuICB0YWc6ICdpbnB1dCcsXG4gIGlkOiAnbG9naW5mb3JtLXBhc3N3b3JkJyxcbiAgbGFiZWw6ICcnLFxuICBhdHRyaWJ1dGVzOiBbXG4gICAge25hbWU6ICd0eXBlJywgdmFsdWU6ICdwYXNzd29yZCd9LFxuICAgIHtuYW1lOiAncGxhY2Vob2xkZXInLCB2YWx1ZTogJ1Bhc3N3b3JkJ31cbiAgXSxcbiAgcmVxdWlyZWQ6IHRydWUsXG4gIHZhbGlkYXRvcnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnbWluTGVuZ3RoJyxcbiAgICAgIGhhbmRsZXI6IG1pbkxlbmd0aFxuICAgIH1cbiAgXSxcbiAgd3JhcHBlcjoge2NsYXNzOiAnaW5wdXQtYmxvY2snfVxufTtcblxuY29uc3QgbG9naW5Gb3JtID0gbmV3IEZvcm0oe1xuICB2YWxpZGF0b3JzOiBbXSxcbiAgc3VibWl0OiB7XG4gICAgaGFuZGxlcjogZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICBjb25zdCB7dXNlcm5hbWUsIHBhc3N3b3JkfSA9IHZhbHVlcztcbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICB9O1xuXG4gICAgICBodHRwLnBvc3QoJ2F1dGgvbG9naW4nLCBkYXRhKVxuICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgIGlmICghcmVzLnN1Y2Nlc3MpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzLmVycm9yLm1lc3NhZ2UpO1xuXG4gICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhdXRoX3Rva2VuJywgcmVzLmRhdGEudG9rZW4pO1xuICAgICAgICAgIE1haW5Db250cm9sbGVyLnJlbmRlcihbRGFzaGJvYXJkXSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyLm1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIGNvbnRyb2xzOiBbXG4gICAgdXNlcm5hbWUsXG4gICAgcGFzc3dvcmRcbiAgXVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbG9naW5Gb3JtO1xufSx7XCJjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkXCI6MSxcImNzcC1hcHAvY29tcG9uZW50cy9tYWluXCI6NSxcImNzcC1hcHAvbGlicy9mb3Jtc1wiOjQ4LFwiY3NwLWFwcC9saWJzL2Zvcm1zL3ZhbGlkYXRvcnNcIjo0OSxcImNzcC1hcHAvbGlicy9odHRwXCI6NTB9XSwyNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBsb2dpbkZvcm0gPSByZXF1aXJlKCcuL0xvZ2luRm9ybScpO1xuY29uc3QgY2xpZW50Rm9ybSA9IHJlcXVpcmUoJy4vQ2xpZW50Rm9ybScpO1xuY29uc3QgZXhlY0Zvcm0gPSByZXF1aXJlKCcuL0V4ZWNGb3JtJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBsb2dpbkZvcm0sXG4gIGNsaWVudEZvcm0sXG4gIGV4ZWNGb3JtXG59O1xufSx7XCIuL0NsaWVudEZvcm1cIjoyMSxcIi4vRXhlY0Zvcm1cIjoyMixcIi4vTG9naW5Gb3JtXCI6MjN9XSwyNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vc3RhcnQudHBsJyk7XG5jb25zdCB0YWJzID0gcmVxdWlyZSgnLi90YWJzJyk7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MLCBTaW5nbGV0b259ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5jb25zdCBTdGFydCA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKHRlbXBsYXRlKCkpO1xuICBjb25zdCB0YWJzV3JhcHBlciA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnN0YXJ0LXRhYnMnKTtcbiAgdGFic1dyYXBwZXIuYXBwZW5kQ2hpbGQodGFicy5oZWFkZXIuZWxlbWVudCk7XG4gIHRhYnNXcmFwcGVyLmFwcGVuZENoaWxkKHRhYnMuY29udGVudC5lbGVtZW50KTtcblxuICByZXR1cm4ge1xuICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgY29udHJvbGxlcjoge1xuICAgICAgZWxlbWVudDogZWxlbWVudFxuICAgIH0gICAgXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbmdsZXRvbihTdGFydCk7XG59LHtcIi4vc3RhcnQudHBsXCI6MjYsXCIuL3RhYnNcIjoyNyxcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo1OX1dLDI2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmZ1bmN0aW9uIHRlbXBsYXRlKGRhdGEpIHtcbiAgcmV0dXJuIC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCJjbXBfc3RhcnRcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJ3cmFwcGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXJcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibG9nby1ibG9ja1wiPlxuICAgICAgICAgICAgPGgxPldlbGNvbWUgdG8gQ29uc3VsdGluZyBTZXJ2aWNlcyBQbGF0Zm9ybTwvaDE+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgXG4gICAgICAgICAgPGEgZGF0YS1yb3V0ZT1cIi9cIj5Ib21lPC9hPlxuICAgICAgICAgIDxhIGRhdGEtcm91dGU9XCIvZGFzaGJvYXJkXCI+RGFzaGJvYXJkPC9hPlxuXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXJ0LXRhYnNcIj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcbn0se31dLDI3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IFRhYnMgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdGFicycpO1xuY29uc3QgY3JlYXRlRWxlbWVudEZyb21IVE1MID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpLmNyZWF0ZUVsZW1lbnRGcm9tSFRNTDtcbmNvbnN0IHNpZ251cFRhYnMgPSByZXF1aXJlKCcuL3NpZ251cFRhYnMnKTtcbmNvbnN0IGxvZ2luRm9ybSA9IHJlcXVpcmUoJy4uL2Zvcm1zL0xvZ2luRm9ybScpO1xuY29uc3QgcmFkaWFsR3JhZGllbnRPbkhvdmVyID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL21pc2MvYnV0dG9uLWVmZmVjdHMvcmFkaWFsR3JhZGllbnRPbkhvdmVyJyk7XG5cbmNvbnN0IGxvZ2luQmxvY2sgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJsb2dpbi1ibG9ja1wiPlxuICAgIDxkaXYgY2xhc3M9XCJoZWFkZXJcIj48aDI+TG9nIGluPC9oMj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwiZm9ybVwiPjwvZGl2PlxuICA8L2Rpdj5cbmApO1xuXG5jb25zdCBzaWdudXBCbG9jayA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCgvKmh0bWwqL2BcbiAgPGRpdiBjbGFzcz1cInNpZ251cC1ibG9ja1wiPjwvZGl2PlxuYCk7XG5cbmNvbnN0IHN0YXJ0VGFicyA9IG5ldyBUYWJzKHtcbiAgaGVhZGVyOiB7XG4gICAgY2xhc3NOYW1lOiAnbWFpbi1hY3Rpb25zJyxcbiAgICBpdGVtczogW1xuICAgICAge3RpdGxlOiAnTG9nIGluJywgdGFnOiAnYnV0dG9uJ30sXG4gICAgICB7dGl0bGU6ICdTaWduIHVwJywgdGFnOiAnYnV0dG9uJ31cbiAgICBdXG4gIH0sXG4gIGNvbnRlbnQ6IHtcbiAgICBpdGVtczogW1xuICAgICAgbG9naW5CbG9jayxcbiAgICAgIHNpZ251cEJsb2NrXG4gICAgXVxuICB9LFxuICBhbmltYXRpb246IHtcbiAgICBuYW1lOiAnbG9naW5TaWdudXBTd2l0Y2gnXG4gIH1cbn0pO1xuXG5jb25zdCBjb250ZW50V3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuY29udGVudFdyYXBwZXIuY2xhc3NMaXN0LmFkZCgnZm9ybXMnKTtcbmNvbnRlbnRXcmFwcGVyLmFwcGVuZENoaWxkKHNpZ251cFRhYnMuY29udGVudC5lbGVtZW50KTtcblxuc3RhcnRUYWJzLmNvbnRlbnQuaXRlbXNbMF0ucXVlcnlTZWxlY3RvcignLmxvZ2luLWJsb2NrIC5mb3JtJykuYXBwZW5kQ2hpbGQobG9naW5Gb3JtLnJlZik7XG5zdGFydFRhYnMuY29udGVudC5pdGVtc1sxXS5hcHBlbmRDaGlsZChzaWdudXBUYWJzLmhlYWRlci5lbGVtZW50KTtcbnN0YXJ0VGFicy5jb250ZW50Lml0ZW1zWzFdLmFwcGVuZENoaWxkKGNvbnRlbnRXcmFwcGVyKTtcblxuc3RhcnRUYWJzLmhlYWRlci5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gcmFkaWFsR3JhZGllbnRPbkhvdmVyKGl0ZW0sIHtwYWRkaW5nOiBbMTAsIDE2XX0pKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzdGFydFRhYnM7XG59LHtcIi4uL2Zvcm1zL0xvZ2luRm9ybVwiOjIzLFwiLi9zaWdudXBUYWJzXCI6MjgsXCJjc3AtYXBwL2xpYnMvbWlzYy9idXR0b24tZWZmZWN0cy9yYWRpYWxHcmFkaWVudE9uSG92ZXJcIjo1MSxcImNzcC1hcHAvbGlicy90YWJzXCI6NTgsXCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6NTl9XSwyODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBUYWJzID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3RhYnMnKTtcbmNvbnN0IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKS5jcmVhdGVFbGVtZW50RnJvbUhUTUw7XG5jb25zdCB7Y2xpZW50Rm9ybSwgZXhlY0Zvcm19ID0gcmVxdWlyZSgnLi4vZm9ybXMnKTtcbmNvbnN0IHJhZGlhbEdyYWRpZW50T25Ib3ZlciA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9taXNjL2J1dHRvbi1lZmZlY3RzL3JhZGlhbEdyYWRpZW50T25Ib3ZlcicpO1xuXG5jb25zdCBjbGllbnRGb3JtQmxvY2sgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJjbGllbnQtZm9ybSBmb3JtXCI+PC9kaXY+XG5gKTtcblxuY29uc3QgZXhlY0Zvcm1CbG9jayA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCgvKmh0bWwqL2BcbiAgPGRpdiBjbGFzcz1cImV4ZWMtZm9ybSBmb3JtXCI+PC9kaXY+XG5gKTtcblxuY29uc3QgYWNhZGVtaWNGb3JtQmxvY2sgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gIDxkaXYgY2xhc3M9XCJmb3JtXCI+QWNhZGVtaWM8L2Rpdj5cbmApO1xuXG5jb25zdCBzdHVkZW50Rm9ybUJsb2NrID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICA8ZGl2IGNsYXNzPVwiZm9ybVwiPlN0dWRlbnQ8L2Rpdj5cbmApO1xuXG5jb25zdCBzaWdudXBUYWJzID0gbmV3IFRhYnMoe1xuICBoZWFkZXI6IHtcbiAgICBjbGFzc05hbWU6ICdhY3Rpb25zIGNsZWFyZml4JyxcbiAgICBpdGVtczogW1xuICAgICAge3RpdGxlOiAnU2lnbiB1cCBhcyBjbGllbnQnLCB0YWc6ICdidXR0b24nfSxcbiAgICAgIHt0aXRsZTogJ1NpZ24gdXAgYXMgZXhlY3V0b3InLCB0YWc6ICdidXR0b24nfSxcbiAgICAgIHt0aXRsZTogJ0FzIGFjYWRlbWljJywgdGFnOiAnYnV0dG9uJ30sXG4gICAgICB7dGl0bGU6ICdBcyBzdHVkZW50JywgdGFnOiAnYnV0dG9uJ31cbiAgICBdXG4gIH0sXG4gIGNvbnRlbnQ6IHtcbiAgICBpdGVtczogW1xuICAgICAgY2xpZW50Rm9ybUJsb2NrLFxuICAgICAgZXhlY0Zvcm1CbG9jayxcbiAgICAgIGFjYWRlbWljRm9ybUJsb2NrLFxuICAgICAgc3R1ZGVudEZvcm1CbG9ja1xuICAgIF1cbiAgfSxcbiAgYW5pbWF0aW9uOiB7XG4gICAgbmFtZTogJ3RhYnNGbG93QW5pbWF0aW9uJyxcbiAgICBwYXJhbXM6IHtwYWRkaW5nOiAxNSwgc3BlZWQ6IDg1MH1cbiAgfVxufSk7XG5cbnNpZ251cFRhYnMuY29udGVudC5pdGVtc1swXS5hcHBlbmRDaGlsZChjbGllbnRGb3JtLnJlZik7XG5zaWdudXBUYWJzLmNvbnRlbnQuaXRlbXNbMV0uYXBwZW5kQ2hpbGQoZXhlY0Zvcm0ucmVmKTtcblxuc2lnbnVwVGFicy5oZWFkZXIuaXRlbXMuZm9yRWFjaChpdGVtID0+IHJhZGlhbEdyYWRpZW50T25Ib3ZlcihpdGVtLCB7cGFkZGluZzogMTV9KSk7XG5cbm1vZHVsZS5leHBvcnRzID0gc2lnbnVwVGFicztcbn0se1wiLi4vZm9ybXNcIjoyNCxcImNzcC1hcHAvbGlicy9taXNjL2J1dHRvbi1lZmZlY3RzL3JhZGlhbEdyYWRpZW50T25Ib3ZlclwiOjUxLFwiY3NwLWFwcC9saWJzL3RhYnNcIjo1OCxcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo1OX1dLDI5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IFRlc3QgPSB7XG4gICAgaHRtbDogYFxuICAgICAgICA8ZGl2IGlkPVwidGVzdFwiPlxuICAgICAgICAgICAgPGgxPlRoaXMgaXMgVGVzdCBjb21wb25lbnQ8L2gxPlxuICAgICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGluc3RhbnRpYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgdGVtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0ZW1wLmlubmVySFRNTCA9IHRoaXMuaHRtbDtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRlbXAuZmlyc3RFbGVtZW50Q2hpbGRcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbihET01UcmVlKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKERPTVRyZWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUZXN0Lmluc3RhbnRpYXRlKCk7XG59LHt9XSwzMDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7XG4gIEFsbFVzZXJzVGFiQ29tcG9uZW50LFxuICBGcmllbmRzVGFiQ29tcG9uZW50LFxuICBJbmNvbWluZ1JlcXVlc3RzVGFiQ29tcG9uZW50LFxuICBPdXRnb2luZ1JlcXVlc3RzVGFiQ29tcG9uZW50XG59ID0gcmVxdWlyZSgnLi90YWJzJyk7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcbmNvbnN0IFRhYnMgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdGFicycpO1xuXG5mdW5jdGlvbiBVc2Vyc0NvbXBvbmVudCgpIHsgXG4gIHJldHVybiBQcm9taXNlXG4gICAgLmFsbChbXG4gICAgICBBbGxVc2Vyc1RhYkNvbXBvbmVudCgpLFxuICAgICAgRnJpZW5kc1RhYkNvbXBvbmVudCgpLFxuICAgICAgSW5jb21pbmdSZXF1ZXN0c1RhYkNvbXBvbmVudCgpLFxuICAgICAgT3V0Z29pbmdSZXF1ZXN0c1RhYkNvbXBvbmVudCgpXG4gICAgXSlcbiAgICAudGhlbigoW2FsbFVzZXJzVGFiLCBmcmllbmRzVGFiLCBJUlRhYiwgT1JUYWJdKSA9PiB7XG4gICAgICBjb25zdCB0YWJzID0gbmV3IFRhYnMoe1xuICAgICAgICBoZWFkZXI6IHtcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge3RpdGxlOiAnQWxsIHVzZXJzJywgdGFnOiAnYnV0dG9uJ30sXG4gICAgICAgICAgICB7dGl0bGU6IGBGcmllbmRzICgke2ZyaWVuZHNUYWIuZnJpZW5kc0Ftb3VudH0pYCwgdGFnOiAnYnV0dG9uJ30sXG4gICAgICAgICAgICB7dGl0bGU6IGBJbmNvbWluZyByZXF1ZXN0cyAoJHtJUlRhYi5yZXF1ZXN0c0Ftb3VudH0pYCwgdGFnOiAnYnV0dG9uJ30sXG4gICAgICAgICAgICB7dGl0bGU6IGBPdXRnb2luZyByZXF1ZXN0cyAoJHtPUlRhYi5yZXF1ZXN0c0Ftb3VudH0pYCwgdGFnOiAnYnV0dG9uJ31cbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRlbnQ6IHtcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgYWxsVXNlcnNUYWIuZWxlbWVudCxcbiAgICAgICAgICAgIGZyaWVuZHNUYWIuZWxlbWVudCxcbiAgICAgICAgICAgIElSVGFiLmVsZW1lbnQsXG4gICAgICAgICAgICBPUlRhYi5lbGVtZW50XG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBhbmltYXRpb246IHtcbiAgICAgICAgICBuYW1lOiAnZGVmYXVsdEFuaW0nXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIFxuICAgICAgY29uc3Qgd3JhcHBlciA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCgnPGRpdiBjbGFzcz1cImNtcF91c2Vyc1wiPjwvZGl2PicpO1xuICAgIFxuICAgICAgd3JhcHBlci5hcHBlbmRDaGlsZCh0YWJzLmhlYWRlci5lbGVtZW50KTtcbiAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQodGFicy5jb250ZW50LmVsZW1lbnQpO1xuICAgIFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjoge1xuICAgICAgICAgIGVsZW1lbnQ6IHdyYXBwZXJcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KVxuICA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVXNlcnNDb21wb25lbnQ7XG59LHtcIi4vdGFic1wiOjQyLFwiY3NwLWFwcC9saWJzL3RhYnNcIjo1OCxcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo1OX1dLDMxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IFVzZXJQYWdlQ29tcG9uZW50ID0gcmVxdWlyZSgnLi91c2VyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBVc2VyUGFnZUNvbXBvbmVudFxufTtcbn0se1wiLi91c2VyXCI6MzJ9XSwzMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IHttYWluVGVtcGxhdGUsIGJsb2NrTW9yZVRlbXBsYXRlfSA9IHJlcXVpcmUoJy4vdGVtcGxhdGVzJyk7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuY29uc3QgZnJpZW5kc01zZyA9ICdZb3UgYXJlIGZyaWVuZHMnO1xuY29uc3QgZnJpZW5kUmVxU2VudE1zZyA9ICdZb3UgaGF2ZSBzZW50IGEgcmVxdWVzdCB0byBiZWNvbWUgYSBmcmllbmQnO1xuXG5mdW5jdGlvbiBpbnNlcnRTZW5kRnJpZW5kUmVxQnRuKG9wdGlvbnMpIHtcbiAgY29uc3QgdHBsQ29udHJvbGxlciA9IG9wdGlvbnMudHBsQ29udHJvbGxlcjtcbiAgY29uc3QgdXNlcklkID0gb3B0aW9ucy51c2VySWQ7XG5cbiAgY29uc3Qgc2VuZEZyaWVuZFJlcUJ0biA9IGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCgvKmh0bWwqL2BcbiAgICA8YnV0dG9uIGNsYXNzPVwiYnRuLXByaW1hcnlcIj5BZGQgdG8gZnJpZW5kczwvYnV0dG9uPlxuICBgKTtcblxuICBzZW5kRnJpZW5kUmVxQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIGh0dHAuZ2V0KGB1c2Vycy9zZW5kLWZyaWVuZC1yZXEvJHt1c2VySWR9YClcbiAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgIGlmIChyZXMuYW5zd2VyKSB7XG4gICAgICAgICAgdHBsQ29udHJvbGxlci5hZGRpdGlvbmFsLmlubmVySFRNTCA9IGZyaWVuZFJlcVNlbnRNc2c7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgO1xuICB9KTtcblxuICB0cGxDb250cm9sbGVyLmFjdGlvbldyYXBwZXIuYXBwZW5kQ2hpbGQoc2VuZEZyaWVuZFJlcUJ0bik7XG59XG5cbmZ1bmN0aW9uIGluc2VydEJsb2NrTW9yZShvcHRpb25zKSB7XG4gIGNvbnN0IHRwbENvbnRyb2xsZXIgPSBvcHRpb25zLnRwbENvbnRyb2xsZXI7XG4gIGNvbnN0IHVzZXJJZCA9IG9wdGlvbnMudXNlcklkO1xuICBCTVRwbENvbnRyb2xsZXIgPSBibG9ja01vcmVUZW1wbGF0ZSgpO1xuICAgICAgICAgIFxuICBCTVRwbENvbnRyb2xsZXIuYnRuTW9yZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBCTVRwbENvbnRyb2xsZXIubGlzdC5jbGFzc0xpc3QudG9nZ2xlKCduby1kaXNwbGF5Jyk7XG4gIH0pO1xuXG4gIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgIGNvbnN0IGlzTW9yZUJ0biA9IGV2dC50YXJnZXQuY2xvc2VzdCgnLmJ0bi1tb3JlJykgPT09IEJNVHBsQ29udHJvbGxlci5idG5Nb3JlO1xuICAgIGNvbnN0IGlzTW9yZUJsb2NrID0gZXZ0LnRhcmdldC5jbG9zZXN0KCcubW9yZS1saXN0JykgPT09IEJNVHBsQ29udHJvbGxlci5saXN0O1xuXG4gICAgaWYgKCFpc01vcmVCdG4gJiYgIWlzTW9yZUJsb2NrKSB7XG4gICAgICBCTVRwbENvbnRyb2xsZXIubGlzdC5jbGFzc0xpc3QuYWRkKCduby1kaXNwbGF5Jyk7XG4gICAgfVxuICB9KTtcblxuICBCTVRwbENvbnRyb2xsZXIuYnRuUmVtb3ZlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIGh0dHAuZ2V0KGB1c2Vycy9yZW1vdmUtZnJvbS1mcmllbmRzLyR7dXNlcklkfWApXG4gICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICBpZiAocmVzLmFuc3dlcikge1xuICAgICAgICAgIHRwbENvbnRyb2xsZXIubWVzc2FnZS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICB0cGxDb250cm9sbGVyLm1vcmVXcmFwcGVyLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgIGluc2VydFNlbmRGcmllbmRSZXFCdG4oeyB0cGxDb250cm9sbGVyLCB1c2VySWQgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgO1xuICB9KTtcblxuICB0cGxDb250cm9sbGVyLm1vcmVXcmFwcGVyLmFwcGVuZENoaWxkKEJNVHBsQ29udHJvbGxlci5yb290KTtcbn1cblxuZnVuY3Rpb24gVXNlclBhZ2VDb21wb25lbnQodXNlcklkKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gaHR0cC5nZXQoYHVzZXJzL2dldFVzZXJCYXNlLyR7dXNlcklkfWApXG4gICAgICAudGhlbih1c2VyID0+IHtcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKHVzZXIpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiAnVXNlciB3aXRoIHRoZSBzdXBwbGllZCBpZCBoYXMgbm90IGJlZW4gZm91bmQnXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICAgICAgdXNlcixcbiAgICAgICAgICBodHRwLmdldChgdXNlcnMvbWUtZnJpZW5kLXdpdGgvJHt1c2VySWR9YCksXG4gICAgICAgICAgaHR0cC5nZXQoYHVzZXJzL21lLXNlbnQtZnJpZW5kLXJlcS8ke3VzZXJJZH1gKVxuICAgICAgICBdKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoW3VzZXIsIGlzRnJpZW5kT2JqLCBmcmllbmRSZXFdKSA9PiB7XG4gICAgICAgIGNvbnN0IHRwbENvbnRyb2xsZXIgPSBtYWluVGVtcGxhdGUodXNlcik7XG4gICAgICAgIFxuICAgICAgICBpZiAoaXNGcmllbmRPYmouYW5zd2VyKSB7XG4gICAgICAgICAgdHBsQ29udHJvbGxlci5tZXNzYWdlLnRleHRDb250ZW50ID0gZnJpZW5kc01zZztcbiAgICAgICAgICBpbnNlcnRCbG9ja01vcmUoeyB0cGxDb250cm9sbGVyLCB1c2VySWQgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZnJpZW5kUmVxLnJlcXVlc3RlZCAmJiBmcmllbmRSZXEuYW1SZXF1ZXN0ZXIpIHtcbiAgICAgICAgICB0cGxDb250cm9sbGVyLm1lc3NhZ2UudGV4dENvbnRlbnQgPSBmcmllbmRSZXFTZW50TXNnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZyaWVuZFJlcS5yZXF1ZXN0ZWQgJiYgIWZyaWVuZFJlcS5hbVJlcXVlc3Rlcikge1xuICAgICAgICAgIGNvbnN0IGNvbmZpcm1GcmllbmRSZXFCdG4gPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuLXByaW1hcnlcIj5Db25maXJtIHlvdSBhcmUgZnJpZW5kczwvYnV0dG9uPlxuICAgICAgICAgIGApO1xuXG4gICAgICAgICAgY29uZmlybUZyaWVuZFJlcUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIGh0dHAuZ2V0KGB1c2Vycy9jb25maXJtLWZyaWVuZC1yZXEvJHt1c2VySWR9YClcbiAgICAgICAgICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzLmFuc3dlcikge1xuICAgICAgICAgICAgICAgICAgdHBsQ29udHJvbGxlci5hY3Rpb25XcmFwcGVyLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgdHBsQ29udHJvbGxlci5tZXNzYWdlLnRleHRDb250ZW50ID0gZnJpZW5kc01zZztcbiAgICAgICAgICAgICAgICAgIGluc2VydEJsb2NrTW9yZSh7IHRwbENvbnRyb2xsZXIsIHVzZXJJZCB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICA7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB0cGxDb250cm9sbGVyLmFjdGlvbldyYXBwZXIuYXBwZW5kQ2hpbGQoY29uZmlybUZyaWVuZFJlcUJ0bik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaW5zZXJ0U2VuZEZyaWVuZFJlcUJ0bih7IHRwbENvbnRyb2xsZXIsIHVzZXJJZCB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIGNvbnRyb2xsZXI6IHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IHRwbENvbnRyb2xsZXIucm9vdFxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pXG4gICAgO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFVzZXJQYWdlQ29tcG9uZW50O1xufSx7XCIuL3RlbXBsYXRlc1wiOjM0LFwiY3NwLWFwcC9saWJzL2h0dHBcIjo1MCxcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo1OX1dLDMzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiBibG9ja01vcmUoKSB7XG4gIGNvbnN0IGh0bWwgPSAvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwibW9yZVwiPlxuICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0bi1tb3JlXCI+PGkgY2xhc3M9XCJpIGktbW9yZVwiPjwvaT48L2J1dHRvbj5cbiAgICAgIDxkaXYgY2xhc3M9XCJtb3JlLWxpc3QgYmxvY2stc2hhZG93ZWQgbm8tZGlzcGxheVwiPlxuICAgICAgICA8dWw+XG4gICAgICAgICAgPGxpPjxidXR0b24gY2xhc3M9XCJyZW1vdmVcIj5SZW1vdmUgdXNlciBmcm9tIGZyaWVuZHM8L2J1dHRvbj48L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG4gIGNvbnN0IGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoaHRtbCk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBlbGVtZW50LFxuICAgIGxpc3Q6IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLm1vcmUtbGlzdCcpLFxuICAgIGJ0bk1vcmU6IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi1tb3JlJyksXG4gICAgYnRuUmVtb3ZlOiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW1vdmUnKVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJsb2NrTW9yZTtcbn0se1wiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjU5fV0sMzQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgbWFpblRlbXBsYXRlID0gcmVxdWlyZSgnLi90cGwnKTtcbmNvbnN0IGJsb2NrTW9yZVRlbXBsYXRlID0gcmVxdWlyZSgnLi9ibG9jay1tb3JlLnRwbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWFpblRlbXBsYXRlLFxuICBibG9ja01vcmVUZW1wbGF0ZVxufTtcbn0se1wiLi9ibG9jay1tb3JlLnRwbFwiOjMzLFwiLi90cGxcIjozNX1dLDM1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiB0ZW1wbGF0ZSh1c2VyKSB7XG4gIGNvbnN0IGh0bWwgPSAvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwiY21wX3VzZXItcGFnZSBibG9jay1zaGFkb3dlZFwiPlxuICAgICAgPGRpdiBjbGFzcz1cImhlYWRlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidGl0bGVcIj48aDE+JHt1c2VyLmZpcnN0X25hbWV9ICR7dXNlci5sYXN0X25hbWV9PC9oMT48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFkZGl0aW9uYWxcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVzc2FnZVwiPjwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJidG4tYWN0aW9uLXdyYXBwZXJcIj48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9yZS13cmFwcGVyXCI+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICBcbiAgICAgIDxkaXYgY2xhc3M9XCJib2R5XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpdGVtXCI+Rmlyc3QgbmFtZTogJHt1c2VyLmZpcnN0X25hbWV9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpdGVtXCI+U2Vjb25kIG5hbWU6ICR7dXNlci5sYXN0X25hbWV9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpdGVtXCI+UGF0cm9ueW1pYzogJHt1c2VyLnBhdHJvbnltaWN9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpdGVtXCI+VXNlcm5hbWU6ICR7dXNlci51c2VybmFtZX08L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIml0ZW1cIj5FbWFpbDogJHt1c2VyLmVtYWlsfTwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG4gIGNvbnN0IGVsID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKGh0bWwpO1xuXG4gIHJldHVybiB7XG4gICAgcm9vdDogZWwsXG4gICAgYWRkaXRpb25hbDogZWwucXVlcnlTZWxlY3RvcignLmFkZGl0aW9uYWwnKSxcbiAgICBib2R5OiBlbC5xdWVyeVNlbGVjdG9yKCcuYm9keScpLFxuICAgIG1lc3NhZ2U6IGVsLnF1ZXJ5U2VsZWN0b3IoJy5tZXNzYWdlJyksXG4gICAgYWN0aW9uV3JhcHBlcjogZWwucXVlcnlTZWxlY3RvcignLmJ0bi1hY3Rpb24td3JhcHBlcicpLFxuICAgIG1vcmVXcmFwcGVyOiBlbC5xdWVyeVNlbGVjdG9yKCcubW9yZS13cmFwcGVyJylcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcbn0se1wiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjU5fV0sMzY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy9odHRwJyk7XG5jb25zdCB0YWJUZW1wbGF0ZSA9IHJlcXVpcmUoJy4uL2NvbW1vbi90YWIudHBsJyk7XG5jb25zdCBjcmVhdGVVc2Vyc0xpc3QgPSByZXF1aXJlKCcuLi9jb21tb24vY3JlYXRlVXNlcnNMaXN0Jyk7XG5cbmZ1bmN0aW9uIEZyaWVuZHNUYWJDb21wb25lbnQoKSB7XG4gIHJldHVybiBodHRwLmdldCgndXNlcnMvZ2V0QWxsRnJpZW5kc0Jhc2UnKVxuICAgIC50aGVuKGZyaWVuZHMgPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRhYlRlbXBsYXRlKHtcbiAgICAgICAgY2xhc3NOYW1lOiAndGFiLWFsbGZyaWVuZHMnLFxuICAgICAgICBvbkxpc3RFbXB0eToge1xuICAgICAgICAgIGVtcHR5OiBmcmllbmRzLmxlbmd0aCA9PSAwLFxuICAgICAgICAgIG1lc3NhZ2U6ICdZb3UgaGF2ZSBubyBmcmllbmRzIHlldCdcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChmcmllbmRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZnJpZW5kc0VsZW1lbnRzID0gY3JlYXRlVXNlcnNMaXN0KGZyaWVuZHMpO1xuICAgICAgICBmcmllbmRzRWxlbWVudHMuZm9yRWFjaChlbCA9PiBlbGVtZW50LnJvb3QuYXBwZW5kQ2hpbGQoZWwucm9vdCkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBlbGVtZW50OiBlbGVtZW50LnJvb3QsXG4gICAgICAgIGZyaWVuZHNBbW91bnQ6IGZyaWVuZHMubGVuZ3RoXG4gICAgICB9O1xuICAgIH0pXG4gIDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGcmllbmRzVGFiQ29tcG9uZW50O1xufSx7XCIuLi9jb21tb24vY3JlYXRlVXNlcnNMaXN0XCI6MzgsXCIuLi9jb21tb24vdGFiLnRwbFwiOjM5LFwiY3NwLWFwcC9saWJzL2h0dHBcIjo1MH1dLDM3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvaHR0cCcpO1xuY29uc3QgdGFiVGVtcGxhdGUgPSByZXF1aXJlKCcuLi9jb21tb24vdGFiLnRwbCcpO1xuY29uc3QgY3JlYXRlVXNlcnNMaXN0ID0gcmVxdWlyZSgnLi4vY29tbW9uL2NyZWF0ZVVzZXJzTGlzdCcpO1xuXG5mdW5jdGlvbiBBbGxVc2Vyc1RhYkNvbXBvbmVudCgpIHtcbiAgcmV0dXJuIGh0dHAuZ2V0KCd1c2Vycy9nZXRBbGxPdGhlclVzZXJzQmFzZScpXG4gICAgLnRoZW4odXNlcnMgPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRhYlRlbXBsYXRlKHtcbiAgICAgICAgY2xhc3NOYW1lOiAndGFiLWFsbHVzZXJzJyxcbiAgICAgICAgb25MaXN0RW1wdHk6IHtcbiAgICAgICAgICBlbXB0eTogdXNlcnMubGVuZ3RoID09IDAsXG4gICAgICAgICAgbWVzc2FnZTogJ05vIG9uZSBhcGFydCBmcm9tIHlvdSBoYXMgcmVnaXN0ZXJlZCBvbiB0aGUgc2l0ZSdcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmICh1c2Vycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHVzZXJzRWxlbWVudHMgPSBjcmVhdGVVc2Vyc0xpc3QodXNlcnMpO1xuICAgICAgICB1c2Vyc0VsZW1lbnRzLmZvckVhY2goZWwgPT4gZWxlbWVudC5yb290LmFwcGVuZENoaWxkKGVsLnJvb3QpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZWxlbWVudDogZWxlbWVudC5yb290XG4gICAgICB9O1xuICAgIH0pXG4gIDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBbGxVc2Vyc1RhYkNvbXBvbmVudDtcbn0se1wiLi4vY29tbW9uL2NyZWF0ZVVzZXJzTGlzdFwiOjM4LFwiLi4vY29tbW9uL3RhYi50cGxcIjozOSxcImNzcC1hcHAvbGlicy9odHRwXCI6NTB9XSwzODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcbmNvbnN0IHVzZXJJdGVtVGVtcGxhdGUgPSByZXF1aXJlKCcuL3VzZXJJdGVtLnRwbCcpO1xuXG5mdW5jdGlvbiBjcmVhdGVVc2Vyc0xpc3QodXNlcnMpIHtcbiAgcmV0dXJuIHVzZXJzLm1hcCh1c2VyID0+IHtcbiAgICBjb25zdCB1c2VyQWNjb3VudExpbmsgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoLypodG1sKi9gXG4gICAgICA8YSBkYXRhLXJvdXRlPVwidXNlcnMvJHt1c2VyLmlkfVwiPiR7dXNlci51c2VybmFtZX08L2E+XG4gICAgYCk7XG4gICAgY29uc3QgdXNlckl0ZW0gPSB1c2VySXRlbVRlbXBsYXRlKCk7XG4gICAgdXNlckl0ZW0udXNlcm5hbWUuYXBwZW5kQ2hpbGQodXNlckFjY291bnRMaW5rKTtcbiAgICByZXR1cm4gdXNlckl0ZW07XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVVzZXJzTGlzdDtcbn0se1wiLi91c2VySXRlbS50cGxcIjo0MCxcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo1OX1dLDM5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiBhbGVydE9uRW1wdHkobWVzc2FnZSkge1xuICByZXR1cm4gLypodG1sKi9gXG4gICAgPGRpdiBjbGFzcz1cImVtcHR5XCI+JHsgbWVzc2FnZSB9PC9kaXY+XG4gIGA7XG59XG5cbmZ1bmN0aW9uIHRhYlRlbXBsYXRlKG9wdGlvbnMpIHtcbiAgY29uc3QgaHRtbCA9IC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCIkeyBvcHRpb25zLmNsYXNzTmFtZSB9XCI+XG4gICAgICAke1xuICAgICAgICBvcHRpb25zLm9uTGlzdEVtcHR5ICYmIG9wdGlvbnMub25MaXN0RW1wdHkuZW1wdHkgP1xuICAgICAgICBhbGVydE9uRW1wdHkob3B0aW9ucy5vbkxpc3RFbXB0eS5tZXNzYWdlKSA6XG4gICAgICAgICcnXG4gICAgICB9XG4gICAgPC9kaXY+XG4gIGA7XG4gIGNvbnN0IGVsID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKGh0bWwpO1xuXG4gIHJldHVybiB7XG4gICAgcm9vdDogZWxcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0YWJUZW1wbGF0ZTtcbn0se1wiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjU5fV0sNDA6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge2NyZWF0ZUVsZW1lbnRGcm9tSFRNTH0gPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvdXRpbGl0aWVzJyk7XG5cbmZ1bmN0aW9uIHVzZXJJdGVtVGVtcGxhdGUoKSB7XG4gIGNvbnN0IGh0bWwgPSAvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwidXNlci1pdGVtXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiYXZhdGFyXCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwidXNlcm5hbWVcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbiAgY29uc3QgZWwgPSBjcmVhdGVFbGVtZW50RnJvbUhUTUwoaHRtbCk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBlbCxcbiAgICBhdmF0YXI6IGVsLnF1ZXJ5U2VsZWN0b3IoJy5hdmF0YXInKSxcbiAgICB1c2VybmFtZTogZWwucXVlcnlTZWxlY3RvcignLnVzZXJuYW1lJylcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB1c2VySXRlbVRlbXBsYXRlO1xufSx7XCJjc3AtYXBwL2xpYnMvdXRpbGl0aWVzXCI6NTl9XSw0MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IHRhYlRlbXBsYXRlID0gcmVxdWlyZSgnLi4vY29tbW9uL3RhYi50cGwnKTtcbmNvbnN0IGNyZWF0ZVVzZXJzTGlzdCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9jcmVhdGVVc2Vyc0xpc3QnKTtcblxuZnVuY3Rpb24gSW5jb21pbmdSZXF1ZXN0c1RhYkNvbXBvbmVudCgpIHtcbiAgcmV0dXJuIGh0dHAuZ2V0KCd1c2Vycy9nZXRBbGxJbmNvbWluZ1JlcXVlc3RzJylcbiAgICAudGhlbihyZXF1ZXN0ZXJzID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0YWJUZW1wbGF0ZSh7XG4gICAgICAgIGNsYXNzTmFtZTogJ3RhYi1hbGxJbmNSZXFzJyxcbiAgICAgICAgb25MaXN0RW1wdHk6IHtcbiAgICAgICAgICBlbXB0eTogcmVxdWVzdGVycy5sZW5ndGggPT0gMCxcbiAgICAgICAgICBtZXNzYWdlOiAnTm8gaW5jb21pbmcgcmVxdWVzdHMgc2VudCB5ZXQnXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAocmVxdWVzdGVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJlcXVlc3RlcnNFbGVtZW50cyA9IGNyZWF0ZVVzZXJzTGlzdChyZXF1ZXN0ZXJzKTtcbiAgICAgICAgcmVxdWVzdGVyc0VsZW1lbnRzLmZvckVhY2goZWwgPT4gZWxlbWVudC5yb290LmFwcGVuZENoaWxkKGVsLnJvb3QpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZWxlbWVudDogZWxlbWVudC5yb290LFxuICAgICAgICByZXF1ZXN0c0Ftb3VudDogcmVxdWVzdGVycy5sZW5ndGhcbiAgICAgIH07XG4gICAgfSlcbiAgO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEluY29taW5nUmVxdWVzdHNUYWJDb21wb25lbnQ7XG59LHtcIi4uL2NvbW1vbi9jcmVhdGVVc2Vyc0xpc3RcIjozOCxcIi4uL2NvbW1vbi90YWIudHBsXCI6MzksXCJjc3AtYXBwL2xpYnMvaHR0cFwiOjUwfV0sNDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgQWxsVXNlcnNUYWJDb21wb25lbnQgPSByZXF1aXJlKCcuL2FsbC11c2VycycpO1xuY29uc3QgRnJpZW5kc1RhYkNvbXBvbmVudCA9IHJlcXVpcmUoJy4vYWxsLWZyaWVuZHMnKVxuY29uc3QgSW5jb21pbmdSZXF1ZXN0c1RhYkNvbXBvbmVudCA9IHJlcXVpcmUoJy4vaW5jb21pbmctcmVxdWVzdHMnKTtcbmNvbnN0IE91dGdvaW5nUmVxdWVzdHNUYWJDb21wb25lbnQgPSByZXF1aXJlKCcuL291dGdvaW5nLXJlcXVlc3RzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBBbGxVc2Vyc1RhYkNvbXBvbmVudCxcbiAgRnJpZW5kc1RhYkNvbXBvbmVudCxcbiAgSW5jb21pbmdSZXF1ZXN0c1RhYkNvbXBvbmVudCxcbiAgT3V0Z29pbmdSZXF1ZXN0c1RhYkNvbXBvbmVudFxufTtcbn0se1wiLi9hbGwtZnJpZW5kc1wiOjM2LFwiLi9hbGwtdXNlcnNcIjozNyxcIi4vaW5jb21pbmctcmVxdWVzdHNcIjo0MSxcIi4vb3V0Z29pbmctcmVxdWVzdHNcIjo0M31dLDQzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvaHR0cCcpO1xuY29uc3QgdGFiVGVtcGxhdGUgPSByZXF1aXJlKCcuLi9jb21tb24vdGFiLnRwbCcpO1xuY29uc3QgY3JlYXRlVXNlcnNMaXN0ID0gcmVxdWlyZSgnLi4vY29tbW9uL2NyZWF0ZVVzZXJzTGlzdCcpO1xuXG5mdW5jdGlvbiBPdXRnb2luZ1JlcXVlc3RzVGFiQ29tcG9uZW50KCkge1xuICByZXR1cm4gaHR0cC5nZXQoJ3VzZXJzL2dldEFsbE91dGdvaW5nUmVxdWVzdHMnKVxuICAgIC50aGVuKHJlcXVlc3RlZXMgPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRhYlRlbXBsYXRlKHtcbiAgICAgICAgY2xhc3NOYW1lOiAndGFiLWFsbEluY1JlcXMnLFxuICAgICAgICBvbkxpc3RFbXB0eToge1xuICAgICAgICAgIGVtcHR5OiByZXF1ZXN0ZWVzLmxlbmd0aCA9PSAwLFxuICAgICAgICAgIG1lc3NhZ2U6ICdObyBvdXRnb2luZyByZXF1ZXN0cyBzZW50IHlldCdcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChyZXF1ZXN0ZWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmVxdWVzdGVlc0VsZW1lbnRzID0gY3JlYXRlVXNlcnNMaXN0KHJlcXVlc3RlZXMpO1xuICAgICAgICByZXF1ZXN0ZWVzRWxlbWVudHMuZm9yRWFjaChlbCA9PiBlbGVtZW50LnJvb3QuYXBwZW5kQ2hpbGQoZWwucm9vdCkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBlbGVtZW50OiBlbGVtZW50LnJvb3QsXG4gICAgICAgIHJlcXVlc3RzQW1vdW50OiByZXF1ZXN0ZWVzLmxlbmd0aFxuICAgICAgfTtcbiAgICB9KVxuICA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT3V0Z29pbmdSZXF1ZXN0c1RhYkNvbXBvbmVudDtcbn0se1wiLi4vY29tbW9uL2NyZWF0ZVVzZXJzTGlzdFwiOjM4LFwiLi4vY29tbW9uL3RhYi50cGxcIjozOSxcImNzcC1hcHAvbGlicy9odHRwXCI6NTB9XSw0NDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL2h0dHAnKTtcbmNvbnN0IHRlbXBsYXRlID0gcmVxdWlyZSgnLi90cGwnKTtcblxuY29uc3QgVmVyaWZpY2F0aW9uQ29tcG9uZW50ID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IHF1ZXJ5UGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgY29uc3QgdXNlcklkID0gcXVlcnlQYXJhbXMuZ2V0KCdpZCcpO1xuICBjb25zdCB0b2tlbiA9IHF1ZXJ5UGFyYW1zLmdldCgndG9rZW4nKTtcbiAgY29uc3QgdHBsQ29udHJvbGxlciA9IHRlbXBsYXRlKCk7XG4gIGxldCBlcnJvcnMgPSBbXTtcblxuICBpZiAoIXVzZXJJZCkge1xuICAgIGVycm9ycy5wdXNoKCd1c2VyIGlkJyk7XG4gIH1cblxuICBpZiAoIXRva2VuKSB7XG4gICAgZXJyb3JzLnB1c2goJ3Rva2VuJyk7XG4gIH1cblxuICBpZiAoZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBtZXNzYWdlID0gYFlvdSBkaWQgbm90IHN1cHBseSAkeyBlcnJvcnMuam9pbignIGFuZCAnKSB9YDtcbiAgICB0cGxDb250cm9sbGVyLnBhcnRzLmluZm9XcmFwcGVyLnRleHRDb250ZW50ID0gbWVzc2FnZTtcbiAgfVxuXG4gIHRwbENvbnRyb2xsZXIucGFydHMuc3Bpbm5lcldyYXBwZXIudGV4dENvbnRlbnQgPSAnTG9hZGluZy4uLic7XG5cbiAgY29uc3QgaHR0cEdldCA9IGh0dHAuZ2V0KCdhdXRoL3ZlcmlmeScgKyB3aW5kb3cubG9jYXRpb24uc2VhcmNoKVxuICBjb25zdCBzcGlubmVyUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRwbENvbnRyb2xsZXIucGFydHMuc3Bpbm5lcldyYXBwZXIuaW5uZXJIVE1MID0gJyc7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSwgMzAwMCk7XG4gIH0pO1xuXG4gIFByb21pc2UuYWxsKFtodHRwR2V0LCBzcGlubmVyUHJvbWlzZV0pXG4gICAgLnRoZW4oYXJyID0+IGFyclswXSlcbiAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICBsZXQgbWVzc2FnZTtcblxuICAgICAgaWYgKHJlcy5zdWNjZXNzKSB7XG4gICAgICAgIG1lc3NhZ2UgPSAnWW91ciBhY2NvdW50IGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSB2ZXJpZmllZC4gWW91IHdpbGwgYmUgcmVkaXJlY3RlZCB0byB0aGUgZGFzaGJvYXJkIGluIDMgc2Vjb25kcyc7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc3dpdGNoKHJlcy5lcnJvci50eXBlKSB7XG4gICAgICAgICAgY2FzZSAnbm9fdXNlcic6XG4gICAgICAgICAgICBtZXNzYWdlID0gJ1VzZXIgd2l0aCB0aGUgc3BlY2lmaWVkIGlkIGRvZXMgbm90IGV4aXN0JztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3ZlcmlmaWVkJzpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSAnVXNlciBoYXMgYWxyZWFkeSBiZWVuIHZlcmlmaWVkJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ25vdF9mb3VuZCc6XG4gICAgICAgICAgICBtZXNzYWdlID0gJ05vIHZlcmlmaWNhdGlvbiB0b2tlbiB3YXMgZm91bmQgZm9yIHRoaXMgdXNlcm5hbWUgb3IgdXNlciB3aXRoIHRoZSBzdXBwbGllZCB1c2VybmFtZSBkb2VzIG5vdCBleGlzdCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdub19tYXRjaCc6XG4gICAgICAgICAgICBtZXNzYWdlID0gJ1Rva2VucyBkbyBub3QgbWF0Y2gnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZXhwaXJlZCc6XG4gICAgICAgICAgICBtZXNzYWdlID0gJ1Rva2VuIGhhcyBiZWVuIGV4cGlyZWQnO1xuICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAnU2VuZCB2ZXJpZmljYXRpb24gdG9rZW4nO1xuICAgICAgICAgICAgdHBsQ29udHJvbGxlci5wYXJ0cy5zZW5kVG9rZW5CdXR0b25XcmFwcGVyLmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGh0dHAuZ2V0KGBhdXRoL3ZlcmlmeS9zZW5kLXZlcmlmaWNhdGlvbi10b2tlbj9pZD0ke3VzZXJJZH1gKVxuICAgICAgICAgICAgICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlO1xuXG4gICAgICAgICAgICAgICAgICBpZiAocmVzLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9ICdZb3UgaGF2ZSBiZWVuIHN1Y2Nlc3NmdWxseSBzZW50IG5ldyB2ZXJpZmljYXRpb24gdG9rZW4nO1xuICAgICAgICAgICAgICAgICAgICB0cGxDb250cm9sbGVyLnBhcnRzLnNlbmRUb2tlbkluZm9XcmFwcGVyLnRleHRDb250ZW50ID0gbWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0cGxDb250cm9sbGVyLnBhcnRzLnNlbmRUb2tlbkluZm9XcmFwcGVyLnRleHRDb250ZW50ID0gcmVzLmVycm9yLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbWVzc2FnZSA9IHJlcy5lcnJvci5tZXNzYWdlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdHBsQ29udHJvbGxlci5wYXJ0cy5pbmZvV3JhcHBlci50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gICAgfSlcbiAgO1xuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudDogdHBsQ29udHJvbGxlci5lbGVtZW50XG4gIH07XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVmVyaWZpY2F0aW9uQ29tcG9uZW50O1xufSx7XCIuL3RwbFwiOjQ1LFwiY3NwLWFwcC9saWJzL2h0dHBcIjo1MH1dLDQ1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtjcmVhdGVFbGVtZW50RnJvbUhUTUx9ID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiB0ZW1wbGF0ZShkYXRhKSB7XG4gIGNvbnN0IGh0bWwgPSAvKmh0bWwqL2BcbiAgICA8ZGl2IGNsYXNzPVwiY21wX3ZlcmlmXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwic3Bpbm5lci13clwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImluZm8td3JcIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzZW5kdG9rZW4td3JcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNlbmR0b2tlbi1pbmZvXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZW5kdG9rZW4tYnV0dG9uLXdyXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKGh0bWwpO1xuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudDogZWxlbWVudCxcbiAgICBwYXJ0czoge1xuICAgICAgc3Bpbm5lcldyYXBwZXI6IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNwaW5uZXItd3InKSxcbiAgICAgIGluZm9XcmFwcGVyOiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbmZvLXdyJyksXG4gICAgICBzZW5kVG9rZW5JbmZvV3JhcHBlcjogZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2VuZHRva2VuLWluZm8nKSxcbiAgICAgIHNlbmRUb2tlbkJ1dHRvbldyYXBwZXI6IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNlbmR0b2tlbi1idXR0b24td3InKVxuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcbn0se1wiY3NwLWFwcC9saWJzL3V0aWxpdGllc1wiOjU5fV0sNDY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgRm9ybUNvbnRyb2wgPSByZXF1aXJlKCcuL0Zvcm1Db250cm9sJyk7XG5cbmNvbnN0IHZhbGlkYXRlID0gZnVuY3Rpb24odmFsaWRhdG9yLCBmb3JtKSB7XG4gIGxldCBpdGVtcyA9IGZvcm0uZXJyb3JzLml0ZW1zO1xuICBsZXQgdmFsdWVzID0gdmFsaWRhdG9yLmNvbnRyb2xzLm1hcChjdHJsID0+IGN0cmwudmFsdWUpO1xuICBsZXQgcmVzdWx0ID0gdmFsaWRhdG9yLmhhbmRsZXIodmFsdWVzKTtcbiAgaWYgKCFyZXN1bHQudmFsaWQgJiYgIWl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IHJlc3VsdC5tZXNzYWdlO1xuICAgIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSA9IHtcbiAgICAgIHJlZjogZWxlbWVudFxuICAgIH07XG4gICAgZm9ybS5lcnJvcnMucmVmLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAocmVzdWx0LnZhbGlkICYmIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXSkge1xuICAgIGl0ZW1zW3ZhbGlkYXRvci5uYW1lXS5yZWYucmVtb3ZlKCk7XG4gICAgaXRlbXNbdmFsaWRhdG9yLm5hbWVdID0gbnVsbDtcbiAgfVxufTtcblxuY29uc3QgRm9ybSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgY29uc3QgZm9ybUNvbnRyb2xzID0gb3B0aW9ucy5jb250cm9scy5tYXAoY3RybCA9PiBuZXcgRm9ybUNvbnRyb2woY3RybCkpO1xuICBsZXQgdmFsaWRhdG9ycyA9IG9wdGlvbnMudmFsaWRhdG9ycyB8fCBbXTtcbiAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb3JtJyk7XG4gIGxldCBlcnJvcnNXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGxldCBzdWJtaXRXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGxldCBmb3JtQ29udHJvbHNSZWZzID0gZm9ybUNvbnRyb2xzLm1hcChjdHJsID0+IGN0cmwucmVmKTtcbiAgZXJyb3JzV3JhcHBlci5jbGFzc05hbWUgPSAnZXJyb3JzJztcbiAgc3VibWl0V3JhcHBlci5jbGFzc05hbWUgPSAnYWN0aW9ucyc7XG4gIHN1Ym1pdFdyYXBwZXIuaW5uZXJIVE1MID0gJzxpbnB1dCB0eXBlPVwic3VibWl0XCIgdmFsdWU9XCJTdWJtaXRcIiAvPic7XG4gIHN1Ym1pdFJlZiA9IHN1Ym1pdFdyYXBwZXIucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInN1Ym1pdFwiXScpO1xuXG4gIFtcbiAgICBlcnJvcnNXcmFwcGVyLFxuICAgIC4uLmZvcm1Db250cm9sc1JlZnMsXG4gICAgc3VibWl0V3JhcHBlclxuICBdLmZvckVhY2goaXRlbSA9PiB3cmFwcGVyLmFwcGVuZENoaWxkKGl0ZW0pKTtcbiAgXG4gIGxldCBmb3JtID0ge1xuICAgIHJlZjogd3JhcHBlcixcbiAgICBlcnJvcnM6IHtcbiAgICAgIHJlZjogZXJyb3JzV3JhcHBlcixcbiAgICAgIGl0ZW1zOiB7fVxuICAgIH0sXG4gICAgY29udHJvbHM6IGZvcm1Db250cm9scyxcbiAgICBzdWJtaXQ6IHtcbiAgICAgIGhhbmRsZXI6IG9wdGlvbnMuc3VibWl0LmhhbmRsZXJcbiAgICB9XG4gIH07XG5cbiAgb3B0aW9ucy52YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHtcbiAgICB2YWxpZGF0b3IuY29udHJvbHMuZm9yRWFjaChjb250cm9sID0+IHtcbiAgICAgIGNvbnRyb2wuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICAgIHZhbGlkYXRlKHZhbGlkYXRvciwgZm9ybSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgc3VibWl0UmVmLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICBsZXQgZXJyb3JzQW1vdW50ID0gMDtcbiAgICB2YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHZhbGlkYXRlKHZhbGlkYXRvciwgZm9ybSkpO1xuICAgIGZvcm0uY29udHJvbHMuZm9yRWFjaChjdHJsID0+IGN0cmwudmFsaWRhdGUoKSk7XG4gICAgT2JqZWN0LnZhbHVlcyhmb3JtLmVycm9ycy5pdGVtcykuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgaWYgKCEhdmFsKSB7XG4gICAgICAgIGVycm9yc0Ftb3VudCsrO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGZvcm0uY29udHJvbHMuZm9yRWFjaChjdHJsID0+IHtcbiAgICAgIE9iamVjdC52YWx1ZXMoY3RybC5lcnJvcnMuaXRlbXMpLmZvckVhY2godmFsID0+IHtcbiAgICAgICAgaWYgKCEhdmFsKSB7XG4gICAgICAgICAgZXJyb3JzQW1vdW50Kys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmIChlcnJvcnNBbW91bnQgPiAwKSB7XG4gICAgICBjb25zb2xlLmxvZygnRm9ybSBpcyBub3QgdmFsaWQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IHZhbHVlcyA9IHt9O1xuICAgIGZvcm0uY29udHJvbHMuZm9yRWFjaChjdHJsID0+IHtcbiAgICAgIHZhbHVlc1tjdHJsLmtleU5hbWVdID0gY3RybC52YWx1ZTtcbiAgICB9KTtcbiAgICBmb3JtLnN1Ym1pdC5oYW5kbGVyKHZhbHVlcywgZXZ0KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZvcm07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvcm07XG59LHtcIi4vRm9ybUNvbnRyb2xcIjo0N31dLDQ3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHZhbGlkYXRlID0gZnVuY3Rpb24oY29udHJvbCkge1xuICBjb250cm9sID0gY29udHJvbCB8fCB0aGlzO1xuICBsZXQgYWRkID0ge307XG4gIGxldCByZW1vdmUgPSB7fTtcbiAgbGV0IGl0ZW1zID0gY29udHJvbC5lcnJvcnMuaXRlbXM7XG4gIGxldCB2YWxpZGF0b3JzID0gY29udHJvbC52YWxpZGF0b3JzO1xuXG4gIGlmICghY29udHJvbC5yZXF1aXJlZCAmJiBjb250cm9sLnZhbHVlID09PSAnJykge1xuICAgIE9iamVjdC5rZXlzKGl0ZW1zKS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgaWYgKCEhaXRlbXNbaXRlbV0pIHJlbW92ZVtpdGVtXSA9IHRydWU7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoY29udHJvbC5yZXF1aXJlZCAmJiBjb250cm9sLnZhbHVlID09PSAnJykge1xuICAgIGlmICghaXRlbXNbJ3JlcXVpcmVkJ10pIHtcbiAgICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJ1RoaXMgZmllbGQgaXMgcmVxdWlyZWQnO1xuICAgICAgaXRlbXNbJ3JlcXVpcmVkJ10gPSB7XG4gICAgICAgIHJlZjogZWxlbWVudFxuICAgICAgfVxuICAgICAgY29udHJvbC5lcnJvcnMucmVmLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChjb250cm9sLnZhbHVlLmxlbmd0aCA+IDAgJiYgISFpdGVtc1sncmVxdWlyZWQnXSkge1xuICAgIHJlbW92ZVsncmVxdWlyZWQnXSA9IHRydWU7XG4gIH1cblxuICBpZiAoY29udHJvbC52YWx1ZSAhPT0gJycpIHtcbiAgICB2YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHtcbiAgICAgIGxldCByZXN1bHQgPSB2YWxpZGF0b3IuaGFuZGxlcihjb250cm9sLnZhbHVlLCBjb250cm9sKTtcbiAgICAgIGlmICghcmVzdWx0LnZhbGlkICYmICFpdGVtc1t2YWxpZGF0b3IubmFtZV0pIHtcbiAgICAgICAgYWRkW3ZhbGlkYXRvci5uYW1lXSA9IHJlc3VsdDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHJlc3VsdC52YWxpZCAmJiBpdGVtc1t2YWxpZGF0b3IubmFtZV0pIHtcbiAgICAgICAgcmVtb3ZlW3ZhbGlkYXRvci5uYW1lXSA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBPYmplY3Qua2V5cyhhZGQpLmZvckVhY2goZXJyb3IgPT4ge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGFkZFtlcnJvcl0ubWVzc2FnZTtcbiAgICBpdGVtc1tlcnJvcl0gPSB7XG4gICAgICByZWY6IGVsZW1lbnRcbiAgICB9O1xuICAgIGNvbnRyb2wuZXJyb3JzLnJlZi5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgfSk7XG5cbiAgT2JqZWN0LmtleXMocmVtb3ZlKS5mb3JFYWNoKGVycm9yID0+IHtcbiAgICBpdGVtc1tlcnJvcl0ucmVmLnJlbW92ZSgpO1xuICAgIGl0ZW1zW2Vycm9yXSA9IG51bGw7XG4gIH0pO1xufTtcblxuY29uc3QgYmluZEVycm9ySGFuZGxpbmcgPSBmdW5jdGlvbihjb250cm9sKSB7XG4gIGNvbnRyb2wuY29udHJvbFJlZi5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICB2YWxpZGF0ZShjb250cm9sKTtcbiAgfSk7XG59O1xuXG5jb25zdCB0YWdJbnB1dCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgbGV0IHByZXBlbmQgPSBvcHRpb25zLnByZXBlbmQgfHwgJyc7XG4gIGxldCBhcHBlbmQgPSBvcHRpb25zLmFwcGVuZCB8fCAnJztcbiAgbGV0IGxhYmVsID1cbiAgICBvcHRpb25zLmxhYmVsID9cbiAgICBgPGxhYmVsIGZvcj1cIiR7b3B0aW9ucy5pZH1cIj4ke29wdGlvbnMubGFiZWx9PC9sYWJlbD5gIDpcbiAgICAnJztcbiAgbGV0IGVycm9ycyA9IG9wdGlvbnMuZXJyb3JzO1xuICBsZXQgZXJyb3JzUG9zaXRpb24gPVxuICAgIGVycm9ycyAmJiBlcnJvcnMucG9zaXRpb24gP1xuICAgIGVycm9ycyAmJiBlcnJvcnMucG9zaXRpb24gOlxuICAgICdiZWZvcmVBcHBlbmQnO1xuICBsZXQgZXJyb3JzQ2xhc3MgPVxuICAgIGVycm9ycyAmJiBlcnJvcnMuY2xhc3MgP1xuICAgIGVycm9ycyAmJiBlcnJvcnMuY2xhc3MgOlxuICAgICdlcnJvcnMnXG4gIGxldCBlcnJvcnNIVE1MID0gYDxkaXYgY2xhc3M9XCIke2Vycm9yc0NsYXNzfVwiPjwvZGl2PmA7XG4gIGxldCBjb250cm9sSFRNTCA9ICc8aW5wdXQ+JztcbiAgbGV0IGh0bWw7XG4gIFxuICBzd2l0Y2ggKGVycm9yc1Bvc2l0aW9uKSB7XG4gICAgY2FzZSAnYmVmb3JlUHJlcGVuZCc6XG4gICAgICBodG1sID0gZXJyb3JzSFRNTCArIHByZXBlbmQgKyBsYWJlbCArIGNvbnRyb2xIVE1MICsgYXBwZW5kO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmVmb3JlTGFiZWwnOlxuICAgICAgaHRtbCA9IHByZXBlbmQgKyBlcnJvcnNIVE1MICsgbGFiZWwgKyBjb250cm9sSFRNTCArIGFwcGVuZDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JlZm9yZUNvbnRyb2wnOlxuICAgICAgaHRtbCA9IHByZXBlbmQgKyBsYWJlbCArIGVycm9yc0hUTUwgKyBjb250cm9sSFRNTCArIGFwcGVuZDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JlZm9yZUFwcGVuZCc6XG4gICAgICBodG1sID0gcHJlcGVuZCArIGxhYmVsICsgY29udHJvbEhUTUwgKyBlcnJvcnNIVE1MICsgYXBwZW5kO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYWZ0ZXJBcHBlbmQnOlxuICAgICAgaHRtbCA9IHByZXBlbmQgKyBsYWJlbCArIGNvbnRyb2xIVE1MICsgYXBwZW5kICsgZXJyb3JzSFRNTDtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgbGV0IGNvbnRyb2xJZCA9ICdpbnB1dCc7IC8vIHRvIGlkZW50aWZ5IGl0IGluIHRoZSBET00gd2hlbiBpdCdzIHJlbmRlcmVkXG4gIGxldCBlcnJvcnNJZCA9IGVycm9yc0NsYXNzOyAvLyBmb3IgdGhpcyB0b29cblxuICBsZXQgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB3cmFwcGVyLmNsYXNzTmFtZSA9IChvcHRpb25zLndyYXBwZXIgJiYgb3B0aW9ucy53cmFwcGVyLmNsYXNzKSB8fCAnJztcbiAgd3JhcHBlci5pbm5lckhUTUwgPSBodG1sO1xuICBsZXQgY29udHJvbFJlZiA9IHdyYXBwZXIucXVlcnlTZWxlY3Rvcihjb250cm9sSWQpO1xuICBsZXQgZXJyb3JzUmVmID0gd3JhcHBlci5xdWVyeVNlbGVjdG9yKCcuJytlcnJvcnNJZCk7XG5cbiAgaWYgKG9wdGlvbnMuYXR0cmlidXRlcykge1xuICAgIG9wdGlvbnMuYXR0cmlidXRlcy5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgY29udHJvbFJlZi5zZXRBdHRyaWJ1dGUoYXR0ci5uYW1lLCBhdHRyLnZhbHVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGxldCBjb250cm9sID0ge1xuICAgIGtleU5hbWU6IG9wdGlvbnMua2V5TmFtZSB8fCAnJyxcbiAgICByZWY6IHdyYXBwZXIsXG4gICAgY29udHJvbFJlZjogY29udHJvbFJlZixcbiAgICBlcnJvcnM6IHtcbiAgICAgIHJlZjogZXJyb3JzUmVmLFxuICAgICAgaXRlbXM6IHt9XG4gICAgfSxcbiAgICByZXF1aXJlZDogb3B0aW9ucy5yZXF1aXJlZCB8fCBmYWxzZSxcbiAgICB2YWxpZDogbnVsbCxcbiAgICB2YWxpZGF0b3JzOiBvcHRpb25zLnZhbGlkYXRvcnMgfHwgW10sXG4gICAgdmFsaWRhdGU6IHZhbGlkYXRlXG4gIH07XG5cbiAgYmluZEVycm9ySGFuZGxpbmcoY29udHJvbCk7XG5cbiAgaWYgKG9wdGlvbnMuaGFuZGxlcnNPYmpzKSB7XG4gICAgbGV0IGV2ZW50cyA9IHt9O1xuICAgIGxldCBoYW5kbGVyc09ianMgPSBvcHRpb25zLmhhbmRsZXJzO1xuICAgIGhhbmRsZXJzT2Jqcy5mb3JFYWNoKG9iaiA9PiB7XG4gICAgICBpZiAoIWV2ZW50c1tvYmouZXZlbnRdKSB7XG4gICAgICAgIGV2ZW50c1tvYmouZXZlbnRdID0gW107XG4gICAgICB9XG4gICAgICBldmVudHNbb2JqLmV2ZW50XS5wdXNoKG9iai5oYW5kbGVyKTtcbiAgICB9KTtcbiAgICBPYmplY3Qua2V5cyhldmVudHMpLmZvckVhY2goZXZlbnROYW1lID0+IHtcbiAgICAgIGNvbnRyb2wuY29udHJvbFJlZi5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZXZ0ID0+IHtcbiAgICAgICAgZXZlbnRzW2V2ZW50TmFtZV0uZm9yRWFjaChoYW5kbGVyID0+IGhhbmRsZXIoZXZ0KSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb250cm9sLCAndmFsdWUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gdGhpcy5jb250cm9sUmVmLnZhbHVlfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7dGhpcy5jb250cm9sUmVmLnZhbHVlID0gbmV3VmFsdWV9XG4gIH0pXG5cbiAgcmV0dXJuIGNvbnRyb2w7XG59O1xuXG5jb25zdCBnZXRIYW5kbGVyID0gZnVuY3Rpb24odGFnKSB7XG4gIGxldCBmbjtcbiAgLy8gU3dpdGNoIHNlZW1zIHRvIGJlIGZhc3RlciB0aGFuIG9iamVjdCBsb29rIHVwXG4gIC8vIFNlYXJjaCBmb3IgJ2pzIHN3aXRjaCB2cyBvYmplY3QnXG4gIHN3aXRjaCh0YWcpIHtcbiAgICBjYXNlICdpbnB1dCc6XG4gICAgICBmbiA9IHRhZ0lucHV0O1xuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIGZuO1xufTtcblxuY29uc3QgRm9ybUNvbnRyb2wgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHJldHVybiBnZXRIYW5kbGVyKG9wdGlvbnMudGFnKShvcHRpb25zKVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtQ29udHJvbDtcbn0se31dLDQ4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEZvcm0gPSByZXF1aXJlKCcuL0Zvcm0nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtO1xufSx7XCIuL0Zvcm1cIjo0Nn1dLDQ5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IG1pbkxlbmd0aCA9IGZ1bmN0aW9uKHZhbHVlLCBjb250cm9sKSB7XG4gIHJldHVybiB7XG4gICAgdmFsaWQ6IHZhbHVlLmxlbmd0aCA+PSA1LFxuICAgIG1lc3NhZ2U6ICdUaGlzIGZpZWxkc1xcJ3MgbGVuZ3RoIGlzIGxlc3MgdGhhbiA1IGNoYXJzJ1xuICB9XG59O1xuXG5jb25zdCBtYXhMZW5ndGggPSBmdW5jdGlvbih2YWx1ZSwgY29udHJvbCkge1xuICByZXR1cm4ge1xuICAgIHZhbGlkOiB2YWx1ZS5sZW5ndGggPD0gMTAsXG4gICAgbWVzc2FnZTogJ1RoaXMgZmllbGRzXFwncyBsZW5ndGggaXMgZ3JlYXRlciB0aGFuIDEwIGNoYXJzJ1xuICB9XG59O1xuXG5jb25zdCBzdGFydHNXaXRoTnVtYmVyID0gZnVuY3Rpb24odmFsdWUsIGNvbnRyb2wpIHtcbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogIS9eXFxkKy9pLnRlc3QodmFsdWUpLFxuICAgIG1lc3NhZ2U6ICdVc2VybmFtZSBtdXN0IG5vdCBzdGFydCB3aXRoIG51bWJlcnMnXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtaW5MZW5ndGgsXG4gIG1heExlbmd0aCxcbiAgc3RhcnRzV2l0aE51bWJlclxufTtcbn0se31dLDUwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmZ1bmN0aW9uIGNvbmZpZ3VyZShvcHRpb25zKSB7XG4gIGxldCBsb2NhdGlvbiA9IG9wdGlvbnMubG9jYXRpb247XG4gIGxvY2F0aW9uID0gbG9jYXRpb25bbG9jYXRpb24ubGVuZ3RoLTFdID09PSAnLycgP1xuICAgIGxvY2F0aW9uIDpcbiAgICBsb2NhdGlvbiArICcvJztcbiAgXG4gIHRoaXMubG9jYXRpb24gPSBsb2NhdGlvbjtcbn1cblxuZnVuY3Rpb24gZ2V0Q29ycmVjdFVybCh1cmwpIHtcbiAgdXJsID0gdXJsWzBdID09PSAnLycgP1xuICAgIHVybC5zbGljZSgxKSA6XG4gICAgdXJsO1xuXG4gIHJldHVybiB1cmw7XG59XG5cbmZ1bmN0aW9uIHNldEF1dGhvcml6YXRpb25IZWFkZXIoeGhyKSB7XG4gIGNvbnN0IHRva2VuID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhdXRoX3Rva2VuJyk7XG5cbiAgaWYgKHRva2VuKSB7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ2F1dGhvcml6YXRpb24nLCBgQmVhcmVyICR7dG9rZW59YCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0KHVybCwgb3B0aW9ucykge1xuICByZXR1cm4gdGhpcy5tYWtlUmVxdWVzdCgnR0VUJywgdXJsLCBudWxsLCBvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gcG9zdCh1cmwsIGJvZHksIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHRoaXMubWFrZVJlcXVlc3QoJ1BPU1QnLCB1cmwsIGJvZHksIG9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiBtYWtlUmVxdWVzdChtZXRob2QsIHVybCwgYm9keSwgb3B0aW9ucykge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHVybCA9IHRoaXMuZ2V0Q29ycmVjdFVybCh1cmwpO1xuXG4gICAgeGhyLm9wZW4obWV0aG9kLCB0aGlzLmxvY2F0aW9uICsgdXJsKTtcblxuICAgIGlmIChtZXRob2QgPT0gJ1BPU1QnKSB7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcbiAgICAgICAgJ0NvbnRlbnQtVHlwZScsXG4gICAgICAgIChvcHRpb25zICYmIG9wdGlvbnMuY29udGVudFR5cGUpIHx8IHRoaXMuY29udGVudFR5cGVzLmpzb25cbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gRWFjaCB0aW1lIGFsb25nIHdpdGggdGhlIHJlcXVlc3Qgd2Ugc2VuZCBhdXRoX3Rva2VuIGlmIGl0IGV4aXN0c1xuICAgIHRoaXMuc2V0QXV0aG9yaXphdGlvbkhlYWRlcih4aHIpO1xuXG4gICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBpc0pzb24gPSB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ0NvbnRlbnQtVHlwZScpLm1hdGNoKHRoaXMuY29udGVudFR5cGVzLmpzb24pO1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBpc0pzb24gP1xuICAgICAgICBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpIDpcbiAgICAgICAgeGhyLnJlc3BvbnNlVGV4dDtcblxuICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgfSk7XG5cbiAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbigpIHtcbiAgICAgIHJlamVjdCgnTmV0d29yayBlcnJvciBvY2N1cmVkJyk7XG4gICAgfSk7XG5cbiAgICBpZiAobWV0aG9kID09ICdHRVQnKSB7XG4gICAgICB4aHIuc2VuZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChtZXRob2QgPT0gJ1BPU1QnKSB7XG4gICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShib2R5KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvY2F0aW9uOiBudWxsLFxuICBnZXRDb3JyZWN0VXJsOiBnZXRDb3JyZWN0VXJsLFxuICBjb25maWd1cmU6IGNvbmZpZ3VyZSxcbiAgc2V0QXV0aG9yaXphdGlvbkhlYWRlcjogc2V0QXV0aG9yaXphdGlvbkhlYWRlcixcbiAgY29udGVudFR5cGVzOiB7XG4gICAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nXG4gIH0sXG4gIG1ha2VSZXF1ZXN0OiBtYWtlUmVxdWVzdCxcbiAgZ2V0OiBnZXQsXG4gIHBvc3Q6IHBvc3Rcbn07XG59LHt9XSw1MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7Y3JlYXRlRWxlbWVudEZyb21IVE1MfSA9IHJlcXVpcmUoJ2NzcC1hcHAvbGlicy91dGlsaXRpZXMnKTtcblxuY29uc3QgcmFkaWFsR3JhZGllbnRPbkhvdmVyID0gZnVuY3Rpb24oYnRuLCBvcHRzKSB7XG4gIGNvbnN0IHRleHQgPSBidG4uaW5uZXJIVE1MO1xuICBjb25zdCB3cmFwcGVyID0gY3JlYXRlRWxlbWVudEZyb21IVE1MKC8qaHRtbCovYFxuICAgIDxkaXYgY2xhc3M9XCJyZy1idG5cIj5cbiAgICAgIDxzcGFuPiR7dGV4dH08L3NwYW4+XG4gICAgPC9kaXY+XG4gIGApO1xuICBidG4uaW5uZXJIVE1MID0gJyc7XG4gIGJ0bi5zdHlsZS5wYWRkaW5nID0gMDtcblxuICBpZiAoTnVtYmVyLmlzSW50ZWdlcihvcHRzLnBhZGRpbmcpKSB7XG4gICAgd3JhcHBlci5zdHlsZS5wYWRkaW5nID0gb3B0cy5wYWRkaW5nICsgJ3B4JztcbiAgfVxuICBlbHNlIGlmIChvcHRzLnBhZGRpbmcgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIGlmIChvcHRzLnBhZGRpbmcubGVuZ3RoID09IDIpIHtcbiAgICAgIHdyYXBwZXIuc3R5bGUucGFkZGluZ1RvcCA9IHdyYXBwZXIuc3R5bGUucGFkZGluZ0JvdHRvbSA9IG9wdHMucGFkZGluZ1swXSArICdweCc7XG4gICAgICB3cmFwcGVyLnN0eWxlLnBhZGRpbmdMZWZ0ID0gd3JhcHBlci5zdHlsZS5wYWRkaW5nUmlnaHQgPSBvcHRzLnBhZGRpbmdbMV0gKyAncHgnO1xuICAgIH1cbiAgfVxuXG4gIGJ0bi5hcHBlbmRDaGlsZCh3cmFwcGVyKTtcblxuICBidG4uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZXZ0ID0+IHtcbiAgICBjb25zdCBjb29yZGluYXRlcyA9IGV2dC50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgeCA9IGV2dC5jbGllbnRYIC0gY29vcmRpbmF0ZXMubGVmdDtcbiAgICBjb25zdCB5ID0gZXZ0LmNsaWVudFkgLSBjb29yZGluYXRlcy50b3A7XG4gICAgZXZ0LnRhcmdldC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS14JywgYCR7IHggfXB4YCk7XG4gICAgZXZ0LnRhcmdldC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS15JywgYCR7IHkgfXB4YCk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSByYWRpYWxHcmFkaWVudE9uSG92ZXI7XG59LHtcImNzcC1hcHAvbGlicy91dGlsaXRpZXNcIjo1OX1dLDUyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IFJvdXRlciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJvdXRlcyA9IFtdO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS5yZWdleHBQYXJhbXMgPSAvKFxcKDooW1xcd1xcZFxcLV9dKylcXCkpL2dpO1xuXG5Sb3V0ZXIucHJvdG90eXBlLnRyaW1Sb3V0ZSA9IGZ1bmN0aW9uKHJvdXRlKSB7XG4gIHJvdXRlID0gcm91dGVbMF0gPT09ICcvJ1xuICAgID8gcm91dGUuc3Vic3RyKDEpXG4gICAgOiByb3V0ZTtcblxuICByb3V0ZSA9IHJvdXRlW3JvdXRlLmxlbmd0aCAtIDFdID09PSAnLydcbiAgICA/IHJvdXRlLnN1YnN0cigwLCByb3V0ZS5sZW5ndGggLSAxKVxuICAgIDogcm91dGU7XG5cbiAgcmV0dXJuIHJvdXRlO1xufSxcblxuUm91dGVyLnByb3RvdHlwZS5nZXRQYXJhbXNOYW1lcyA9IGZ1bmN0aW9uKHJvdXRlKSB7XG4gIGxldCByZXN1bHQ7XG4gIGxldCBwYXJhbXNOYW1lcyA9IFtdO1xuICB3aGlsZSAoKHJlc3VsdCA9IHRoaXMucmVnZXhwUGFyYW1zLmV4ZWMocm91dGUpKSAhPT0gbnVsbCkge1xuICAgIHBhcmFtc05hbWVzLnB1c2gocmVzdWx0WzJdKTtcbiAgfVxuICByZXR1cm4gcGFyYW1zTmFtZXM7XG59XG5cblJvdXRlci5wcm90b3R5cGUuYWRkUm91dGUgPSBmdW5jdGlvbihyb3V0ZSwgb2JqKSB7XG4gIHJvdXRlID0gdGhpcy50cmltUm91dGUocm91dGUpO1xuICBsZXQgcGFyYW1zTmFtZXMgPSB0aGlzLmdldFBhcmFtc05hbWVzKHJvdXRlKTtcbiAgbGV0IHJlZ2V4cFN0ciA9IHJvdXRlLnJlcGxhY2UodGhpcy5yZWdleHBQYXJhbXMsICcoW1xcXFx3XFxcXGRcXC1fXSspJyk7XG4gIGxldCByZWdleHAgPSBSZWdFeHAoYF4ke3JlZ2V4cFN0cn0oXFxcXC98JClgLCAnZ2knKTtcblxuICBsZXQgcm91dGVPYmogPSB7XG4gICAgdHlwZTogJ3JvdXRlJyxcbiAgICByZWdleHA6IHJlZ2V4cCxcbiAgICBwYXJhbXNOYW1lczogcGFyYW1zTmFtZXNcbiAgfTtcblxuICBpZiAodHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8qKlxuICAgICAqIFJvdXRlIGhhbmRsZXIgd2lsbCBiZSBpbnZva2VkIHdoZW4gdXNlciBnb2VzIHRvIHRoZSBjb3JyZXNwb25kaW5nXG4gICAgICogcm91dGUgYW5kIG5vdCB0ZXJtaW5hdGVkIGJ5IG1pZGRsZXdhcmVzIHVuZGVyd2F5XG4gICAgICogQGZ1bmN0aW9uIGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaGFuZGxlclBhcmFtcyAtIHBhcmFtcyBtYXkgYmUgZ2l2ZW4gd2hlbiBSb3V0ZXIubmF2aWdhdGUgaXMgaW52b2tlZFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSByb3V0ZVBhcmFtcyAtIHBhcmFtcyBleGlzdGluZyBvbiB0aGUgcm91dGUgaWYgYW55XG4gICAgICogQHBhcmFtIHthbnl9IGFyZyAtIHRoaXMgaXMgZ2l2ZW4gYnkgdGhlIGxhc3QgbWlkZGxld2FyZSBpZiBhbnlcbiAgICAgKi9cbiAgICByb3V0ZU9iai5oYW5kbGVyID0gb2JqO1xuICB9XG5cbiAgZWxzZSBpZiAob2JqIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICByb3V0ZU9iai5jaGlsZHJlbiA9IG9iajtcbiAgfVxuXG4gIGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKCdFcnJvciBvY2N1cmVkIHdoaWxlIGFkZGluZyByb3V0ZScpO1xuICAgIHRocm93IG5ldyBFcnJvcigncm91dGUgZXJyb3InKTtcbiAgfVxuXG4gIHRoaXMucm91dGVzLnB1c2gocm91dGVPYmopO1xuICByZXR1cm4gdGhpcztcbn07XG5cblJvdXRlci5wcm90b3R5cGUuZ2V0Um91dGUgPSBmdW5jdGlvbihsaW5rLCByb3V0ZXMgPSB0aGlzLnJvdXRlcykge1xuICBsaW5rID0gbGluayA9PT0gJycgPyAnLycgOiBsaW5rO1xuICBsZXQgbWlkZGxld2FyZXMgPSBbXTtcbiAgbGV0IHBhcmFtcyA9IHt9O1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aCwgcm91dGUgPSByb3V0ZXNbaV07IGkrKykge1xuICAgIGlmIChyb3V0ZS50eXBlID09ICdtaWRkbGV3YXJlJykge1xuICAgICAgbWlkZGxld2FyZXMucHVzaChyb3V0ZS5mbik7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAocm91dGUudHlwZSA9PSAncm91dGVzJykge1xuICAgICAgY29uc3QgY2hpbGRyZW5DaGVjayA9IHRoaXMuZ2V0Um91dGUobGluaywgcm91dGUucm91dGVzKTtcbiAgICAgIGlmIChjaGlsZHJlbkNoZWNrICE9PSBudWxsKSB7XG4gICAgICAgIGNoaWxkcmVuQ2hlY2subWlkZGxld2FyZXMgPSBtaWRkbGV3YXJlcy5jb25jYXQoY2hpbGRyZW5DaGVjay5taWRkbGV3YXJlcyk7XG4gICAgICAgIGNoaWxkcmVuQ2hlY2sucGFyYW1zID0gT2JqZWN0LmFzc2lnbihwYXJhbXMsIGNoaWxkcmVuQ2hlY2sucGFyYW1zKTtcbiAgICAgICAgcmV0dXJuIGNoaWxkcmVuQ2hlY2s7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBsZXQgcmVnZXhwID0gcm91dGUucmVnZXhwO1xuICAgIGxldCByZXN1bHQgPSByZWdleHAuZXhlYyhsaW5rKTtcbiAgICBsZXQgbmV3TGluaztcblxuICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCA+IDEpIHtcbiAgICAgIHBhcmFtcyA9IHt9O1xuICAgICAgZm9yIChsZXQgaWR4ID0gMTsgaWR4IDwgcmVzdWx0Lmxlbmd0aCAtIDE7IGlkeCsrKSB7XG4gICAgICAgIHBhcmFtc1tyb3V0ZS5wYXJhbXNOYW1lc1tpZHgtMV1dID0gcmVzdWx0W2lkeF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJlZ2V4cC5sYXN0SW5kZXggPiAwKSB7XG4gICAgICBuZXdMaW5rID0gbGluay5zdWJzdHIocmVnZXhwLmxhc3RJbmRleCk7XG4gICAgfVxuXG4gICAgaWYgKHJlZ2V4cC5sYXN0SW5kZXggPiAwICYmIG5ld0xpbmsubGVuZ3RoID4gMCkge1xuICAgICAgcmVnZXhwLmxhc3RJbmRleCA9IDA7XG4gICAgICBpZiAocm91dGUuY2hpbGRyZW4gJiYgcm91dGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICBsZXQgY2hpbGRyZW5DaGVjayA9IHRoaXMuZ2V0Um91dGUobmV3TGluaywgcm91dGUuY2hpbGRyZW4pO1xuICAgICAgICBpZiAoY2hpbGRyZW5DaGVjayAhPT0gbnVsbCkge1xuICAgICAgICAgIGNoaWxkcmVuQ2hlY2subWlkZGxld2FyZXMgPSBtaWRkbGV3YXJlcy5jb25jYXQoY2hpbGRyZW5DaGVjay5taWRkbGV3YXJlcyk7XG4gICAgICAgICAgY2hpbGRyZW5DaGVjay5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHBhcmFtcywgY2hpbGRyZW5DaGVjay5wYXJhbXMpO1xuICAgICAgICAgIHJldHVybiBjaGlsZHJlbkNoZWNrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIEluIGNhc2UgaXQncyB0ZXJtaW5hbCByb3V0ZVxuICAgIGVsc2UgaWYgKHJlZ2V4cC5sYXN0SW5kZXggPiAwKSB7XG4gICAgICByZWdleHAubGFzdEluZGV4ID0gMDtcbiAgICAgIGlmIChyb3V0ZS5oYW5kbGVyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaGFuZGxlcjogcm91dGUuaGFuZGxlcixcbiAgICAgICAgICBwYXJhbXM6IHBhcmFtcyxcbiAgICAgICAgICBtaWRkbGV3YXJlczogbWlkZGxld2FyZXNcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gU2luY2UgaXQncyBkb25lIGFuZCBsaW5rIGlzIChhY3R1YWxseSwgd2lsbCBiZSB3aGVuIHdlXG4gICAgICAvLyBnZXQgaW50byByZWN1cnNpb24pICcvJywgc28gd2UgbG9vayB1cCBjaGlsZHJlbiB0b1xuICAgICAgLy8gdG8gbWF0Y2ggdGhlIHJvb3QgJy8nIHdoaWNoIG11c3QgZXhpc3QgdGhlcmVcbiAgICAgIGlmIChyb3V0ZS5jaGlsZHJlbikge1xuICAgICAgICByZWdleHAubGFzdEluZGV4ID0gMDtcbiAgICAgICAgbGV0IGNoaWxkcmVuQ2hlY2sgPSB0aGlzLmdldFJvdXRlKG5ld0xpbmssIHJvdXRlLmNoaWxkcmVuKTtcbiAgICAgICAgaWYgKGNoaWxkcmVuQ2hlY2sgIT09IG51bGwpIHtcbiAgICAgICAgICBjaGlsZHJlbkNoZWNrLm1pZGRsZXdhcmVzID0gbWlkZGxld2FyZXMuY29uY2F0KGNoaWxkcmVuQ2hlY2subWlkZGxld2FyZXMpO1xuICAgICAgICAgIGNoaWxkcmVuQ2hlY2sucGFyYW1zID0gT2JqZWN0LmFzc2lnbihwYXJhbXMsIGNoaWxkcmVuQ2hlY2sucGFyYW1zKTtcbiAgICAgICAgICByZXR1cm4gY2hpbGRyZW5DaGVjaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cblJvdXRlci5wcm90b3R5cGUuYWRkUm91dGVzID0gZnVuY3Rpb24ocm91dGVzKSB7XG4gIHRoaXMucm91dGVzLnB1c2goe1xuICAgIHR5cGU6ICdyb3V0ZXMnLFxuICAgIHJvdXRlczogcm91dGVzXG4gIH0pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS5hZGRNaWRkbGV3YXJlID0gZnVuY3Rpb24oZm4pIHtcbiAgdGhpcy5yb3V0ZXMucHVzaCh7XG4gICAgdHlwZTogJ21pZGRsZXdhcmUnLFxuICAgIGZuOiBmblxuICB9KTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cblJvdXRlci5wcm90b3R5cGUubmF2aWdhdGUgPSBmdW5jdGlvbihsaW5rLCBoYW5kbGVyUGFyYW1zKSB7XG4gIGxpbmsgPSB0aGlzLnRyaW1Sb3V0ZShsaW5rKTtcbiAgbGV0IHJvdXRlID0gdGhpcy5nZXRSb3V0ZShsaW5rKTtcbiAgaWYgKCFyb3V0ZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ05vIHN1aXRhYmxlIHJvdXRlIGhhcyBiZWVuIGZvdW5kIScpO1xuICAgIHJldHVybjtcbiAgfVxuICBcbiAgZm5zID0gcm91dGUubWlkZGxld2FyZXMuY29uY2F0KFtyb3V0ZS5oYW5kbGVyLmJpbmQobnVsbCwgaGFuZGxlclBhcmFtcyldKTtcbiAgZm9yIChsZXQgaSA9IGZucy5sZW5ndGggLSAxOyBpID4gMCwgZm4gPSBmbnNbaV07IGktLSkge1xuICAgIGlmIChpICE9PSBmbnMubGVuZ3RoIC0gMSkge1xuICAgICAgZm5zW2ldID0gZm4uYmluZChudWxsLCBmbnNbaSsxXSwgcm91dGUucGFyYW1zKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBmbnNbaV0gPSBmbi5iaW5kKG51bGwsIHJvdXRlLnBhcmFtcyk7XG4gICAgfVxuICB9XG4gIGZuc1swXSgpO1xuICBoaXN0b3J5LnB1c2hTdGF0ZSgnJywgJycsICcvJyArIGxpbmspO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS50ZXN0TmF2ID0gZnVuY3Rpb24obGluaywgaGFuZGxlclBhcmFtcykge1xuICBsaW5rID0gdGhpcy50cmltUm91dGUobGluayk7XG4gIGxldCByb3V0ZSA9IHRoaXMuZ2V0Um91dGUobGluayk7XG4gIGlmICghcm91dGUpIHtcbiAgICBjb25zb2xlLmxvZygnTm8gc3VpdGFibGUgcm91dGUgaGFzIGJlZW4gZm91bmQnKVxuICAgIHJldHVybjtcbiAgfVxuICAvLyBjb25zb2xlLmxvZyhyb3V0ZSk7XG4gIGZucyA9IHJvdXRlLm1pZGRsZXdhcmVzLmNvbmNhdChbcm91dGUuaGFuZGxlci5iaW5kKG51bGwsIGhhbmRsZXJQYXJhbXMpXSk7XG4gIGZvciAobGV0IGkgPSBmbnMubGVuZ3RoIC0gMTsgaSA+IDAsIGZuID0gZm5zW2ldOyBpLS0pIHtcbiAgICBpZiAoaSAhPT0gZm5zLmxlbmd0aCAtIDEpIHtcbiAgICAgIGZuc1tpXSA9IGZuLmJpbmQobnVsbCwgZm5zW2krMV0sIHJvdXRlLnBhcmFtcyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZm5zW2ldID0gZm4uYmluZChudWxsLCByb3V0ZS5wYXJhbXMpO1xuICAgIH1cbiAgfVxuICAvLyBjb25zb2xlLmxvZyhmbnMpXG4gIGZuc1swXSgpO1xufTtcblxuY29uc3QgU3Vicm91dGVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucm91dGVzID0gW107XG59O1xuU3Vicm91dGVyLnByb3RvdHlwZSA9IFJvdXRlci5wcm90b3R5cGU7XG5Sb3V0ZXIuU3Vicm91dGVyID0gU3Vicm91dGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJvdXRlcjtcbn0se31dLDUzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHRhZ3MgPSBbJ2RpdicsICdzcGFuJywgJ2J1dHRvbiddO1xuXG5jb25zdCBIZWFkZXJJdGVtID0gZnVuY3Rpb24ob3B0cykge1xuICBjb25zdCB0aXRsZSA9IG9wdHMudGl0bGUgfHwgJyc7XG4gIGNvbnN0IGNsYXNzTmFtZSA9IG9wdHMuY2xhc3NOYW1lIHx8ICcnO1xuICBjb25zdCB0YWcgPSB0YWdzLmZpbmQodGFnID0+IHRhZyA9PT0gb3B0cy50YWcpID9cbiAgICBvcHRzLnRhZyA6XG4gICAgJ3NwYW4nO1xuXG4gIGNvbnN0IGhlYWRlckl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG4gIGhlYWRlckl0ZW0uY2xhc3NOYW1lID0gJ3RhYnMtaGVhZGVyLWl0ZW0gJyArIGNsYXNzTmFtZTtcbiAgaGVhZGVySXRlbS5pbm5lckhUTUwgPSB0aXRsZTtcblxuICBpZiAob3B0cy5hdHRyaWJ1dGVzKSB7XG4gICAgb3B0cy5hdHRyaWJ1dGVzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBoZWFkZXJJdGVtLnNldEF0dHJpYnV0ZShhdHRyLm5hbWUsIGF0dHIudmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBlbGVtZW50OiBoZWFkZXJJdGVtXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlckl0ZW07XG59LHt9XSw1NDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBkZWZhdWx0QW5pbSA9IGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBoYW5kbGVyKGV2dCkge1xuICAgIGNvbnN0IHRhYiA9IGV2dC50YXJnZXQuY2xvc2VzdCgnLnRhYnMtaGVhZGVyLWl0ZW0nKS5kYXRhc2V0Lm9yZGVyO1xuICAgIHRoaXMuZ290b1RhYih0YWIpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ290b1RhYih0YWIpIHtcbiAgICB0YWItLTtcbiAgICBjb25zdCBuZXdIZWFkZXJJdGVtID0gdGhpcy5oZWFkZXIuaXRlbXNbdGFiXTtcbiAgICBjb25zdCBuZXdDb250ZW50SXRlbSA9IHRoaXMuY29udGVudC5pdGVtc1t0YWJdO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcblxuICAgIG5ld0hlYWRlckl0ZW0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgbmV3Q29udGVudEl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gICAgbmV3Q29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cbiAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtID0gbmV3SGVhZGVySXRlbTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbSA9IG5ld0NvbnRlbnRJdGVtO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdGlhbGl6ZSh0YWIpIHtcbiAgICB0YWI7XG4gICAgY29uc3QgYWN0aXZlSGVhZGVySXRlbSA9IHRoaXMuaGVhZGVyLml0ZW1zW3RhYl07XG4gICAgY29uc3QgYWN0aXZlQ29udGVudEl0ZW0gPSB0aGlzLmNvbnRlbnQuaXRlbXNbdGFiXTtcbiAgICBjb25zdCBub25BY3RpdmVDb250ZW50SXRlbXMgPSB0aGlzLmNvbnRlbnQuaXRlbXMuZmlsdGVyKGl0ZW0gPT4gaXRlbSAhPT0gYWN0aXZlQ29udGVudEl0ZW0pO1xuXG4gICAgYWN0aXZlSGVhZGVySXRlbS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICBhY3RpdmVDb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblxuICAgIG5vbkFjdGl2ZUNvbnRlbnRJdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKSk7XG5cbiAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtID0gYWN0aXZlSGVhZGVySXRlbTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbSA9IGFjdGl2ZUNvbnRlbnRJdGVtO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBoYW5kbGVyLFxuICAgIGdvdG9UYWIsXG4gICAgaW5pdGlhbGl6ZVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0QW5pbTtcbn0se31dLDU1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHNldENvbnRlbnRJdGVtc1dpZHRocyA9IGZ1bmN0aW9uKG9wdGlvbnMsIGFuaW1QYXJhbXMpIHtcbiAgY29uc3QgY29udHJvbGxlciA9IG9wdGlvbnMuY29udHJvbGxlciB8fCB7fTtcbiAgY29uc3QgbmV3T3JkZXIgPSBvcHRpb25zLm5ld09yZGVyO1xuICBjb25zdCBzZXRGb3JOZXdPcmRlciA9IG9wdGlvbnMuc2V0Rm9yTmV3T3JkZXIgfHwgZmFsc2U7XG4gIGNvbnN0IGl0ZW1zID0gY29udHJvbGxlci5jb250ZW50Lml0ZW1zO1xuICBjb25zdCBsZW4gPSBpdGVtcy5sZW5ndGg7XG4gIGNvbnN0IHdpZHRoID0gY29udHJvbGxlci5jb250ZW50LmVsZW1lbnQuY2xpZW50V2lkdGg7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW4sIGl0ZW0gPSBpdGVtc1tpXTsgaSsrKSB7XG4gICAgaWYgKHNldEZvck5ld09yZGVyIHx8IGl0ZW0gIT09IGl0ZW1zW25ld09yZGVyXSkge1xuICAgICAgaXRlbS5zdHlsZS53aWR0aCA9ICh3aWR0aCAtIDIqYW5pbVBhcmFtcy5wYWRkaW5nKSArICdweCc7XG4gICAgfVxuICB9XG59O1xuXG5jb25zdCBzZXRDb250ZW50SXRlbXNQb3NpdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBvcHRpb25zLmNvbnRyb2xsZXIgfHwge307XG4gIGNvbnN0IG5ld09yZGVyID0gb3B0aW9ucy5uZXdPcmRlcjtcbiAgY29uc3Qgc2V0Rm9yTmV3T3JkZXIgPSBvcHRpb25zLnNldEZvck5ld09yZGVyIHx8IGZhbHNlO1xuICBjb25zdCBpdGVtcyA9IGNvbnRyb2xsZXIuY29udGVudC5pdGVtcztcbiAgY29uc3QgbGVuID0gaXRlbXMubGVuZ3RoO1xuICBjb25zdCB3aWR0aCA9IGNvbnRyb2xsZXIuY29udGVudC5lbGVtZW50LmNsaWVudFdpZHRoO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuLCBpdGVtID0gaXRlbXNbaV07IGkrKykge1xuICAgIGlmIChzZXRGb3JOZXdPcmRlciB8fCBpdGVtICE9PSBpdGVtc1tuZXdPcmRlcl0pIHtcbiAgICAgIGl0ZW0uc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZVgoJHsoaS1uZXdPcmRlcikqd2lkdGh9cHgpYDtcbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0IHNldENvbnRlbnRJdGVtc0Rpc3BsYXkgPSBmdW5jdGlvbihvcHRzKSB7XG4gIGNvbnN0IGNvbnRlbnRJdGVtcyA9IG9wdHMuY29udHJvbGxlci5jb250ZW50Lml0ZW1zO1xuICBjb25zdCBkaXNwbGF5ID0gb3B0cy5kaXNwbGF5O1xuICBjb25zdCBuZXdPcmRlciA9IG9wdHMubmV3T3JkZXI7XG4gIGNvbnN0IHNldEZvck5ld09yZGVyID0gb3B0cy5zZXRGb3JOZXdPcmRlcjtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRlbnRJdGVtcy5sZW5ndGgsIGNpID0gY29udGVudEl0ZW1zW2ldOyBpKyspIHtcbiAgICBpZiAoc2V0Rm9yTmV3T3JkZXIgfHwgY2kgIT09IGNvbnRlbnRJdGVtc1tuZXdPcmRlcl0pIHtcbiAgICAgIGNpLnN0eWxlLmRpc3BsYXkgPSBkaXNwbGF5O1xuICAgIH1cbiAgfVxufTtcblxuY29uc3QgVGFic0Zsb3dBbmltYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgbGV0IHBhcmFtcztcblxuICBmdW5jdGlvbiBoYW5kbGVyKGV2dCkge1xuICAgIGlmICh0aGlzLmFjdGl2ZS53b3JraW5nKSByZXR1cm47XG4gICAgdGhpcy5hY3RpdmUud29ya2luZyA9IHRydWU7XG4gICAgLy8gSEkgc3RhbmRzIGZvciBIZWFkZXIgSXRlbVxuICAgIC8vIENJIHN0YW5kcyBmb3IgQ29udGVudCBJdGVtXG4gICAgY29uc3QgbmV3SEkgPSBldnQudGFyZ2V0LmNsb3Nlc3QoJy50YWJzLWhlYWRlci1pdGVtJyk7XG4gICAgY29uc3Qgb3JkZXIgPSArbmV3SEkuZGF0YXNldC5vcmRlciAtIDE7XG4gICAgY29uc3QgbmV3Q0kgPSB0aGlzLmNvbnRlbnQuaXRlbXNbb3JkZXJdO1xuICAgIGNvbnN0IHNwZWVkID0gcGFyYW1zLnNwZWVkO1xuICAgIGNvbnN0IG9sZE9yZGVyID0gK3RoaXMuYWN0aXZlLmhlYWRlckl0ZW0uZGF0YXNldC5vcmRlciAtIDE7XG5cbiAgICBzZXRDb250ZW50SXRlbXNQb3NpdGlvbnMoe2NvbnRyb2xsZXI6IHRoaXMsIG5ld09yZGVyOiBvbGRPcmRlciwgc2V0Rm9yTmV3T3JkZXI6IGZhbHNlfSk7XG4gICAgc2V0Q29udGVudEl0ZW1zRGlzcGxheSh7Y29udHJvbGxlcjogdGhpcywgbmV3T3JkZXI6IG9yZGVyLCBzZXRGb3JOZXdPcmRlcjogdHJ1ZSwgZGlzcGxheTogJ2Jsb2NrJ30pO1xuICAgIG5ld0hJLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgdGhpcy5jb250ZW50LmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uY2xpZW50SGVpZ2h0ICsgJ3B4JztcbiAgICB0aGlzLmNvbnRlbnQuZWxlbWVudC5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSBzcGVlZCArICdtcyc7XG4gICAgdGhpcy5jb250ZW50LmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gbmV3Q0kuY2xpZW50SGVpZ2h0ICsgJ3B4JztcblxuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbS5zdHlsZS50b3AgPSBwYXJhbXMucGFkZGluZyArICdweCc7XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uc3R5bGUubGVmdCA9IHBhcmFtcy5wYWRkaW5nICsgJ3B4JztcblxuICAgIHRoaXMuY29udGVudC5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSBzcGVlZCArICdtcycpO1xuXG4gICAgc2V0Q29udGVudEl0ZW1zV2lkdGhzKHtjb250cm9sbGVyOiB0aGlzLCBuZXdPcmRlcjogb3JkZXIsIHNldEZvck5ld09yZGVyOiB0cnVlfSwgcGFyYW1zKTtcbiAgICBzZXRDb250ZW50SXRlbXNQb3NpdGlvbnMoe2NvbnRyb2xsZXI6IHRoaXMsIG5ld09yZGVyOiBvcmRlciwgc2V0Rm9yTmV3T3JkZXI6IHRydWV9KTtcbiAgICBcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIG5ld0NJLnN0eWxlLnBvc2l0aW9uID0gJ3N0YXRpYyc7XG4gICAgICBuZXdDSS5zdHlsZS53aWR0aCA9ICdhdXRvJztcbiAgICAgIHRoaXMuY29udGVudC5lbGVtZW50LnN0eWxlLmhlaWdodCA9ICdhdXRvJztcbiAgICAgIHRoaXMuY29udGVudC5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAnMG1zJyk7XG4gICAgICB0aGlzLmNvbnRlbnQuZWxlbWVudC5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAnMG1zJztcbiAgICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0gPSBuZXdISTtcbiAgICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtID0gbmV3Q0k7XG4gICAgICB0aGlzLmFjdGl2ZS53b3JraW5nID0gZmFsc2U7XG4gICAgICBzZXRDb250ZW50SXRlbXNEaXNwbGF5KHtcbiAgICAgICAgY29udHJvbGxlcjogdGhpcyxcbiAgICAgICAgbmV3T3JkZXI6IG9yZGVyLFxuICAgICAgICBzZXRGb3JOZXdPcmRlcjogZmFsc2UsXG4gICAgICAgIGRpc3BsYXk6ICdub25lJ1xuICAgICAgfSk7XG4gICAgfSwgc3BlZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ290b1RhYih0YWIpIHtcblxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdGlhbGl6ZSh0YWIsIGFuaW1PcHRpb25zKSB7XG4gICAgcGFyYW1zID0gYW5pbU9wdGlvbnMgfHwge307XG4gICAgLy8gQWRkIGNsYXNzZXNcbiAgICB0aGlzLmNvbnRlbnQuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCd0YWJzLWZsb3ctY29udGVudCcpO1xuICAgIHRoaXMuY29udGVudC5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCd0YWJzLWZsb3ctQ0knKSk7XG4gICAgXG4gICAgLy8gU2V0IGluZGl2aWR1YWwgQ1NTXG4gICAgY29uc3QgQ0lzID0gdGhpcy5jb250ZW50Lml0ZW1zO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgQ0lzLmxlbmd0aCwgaXRlbSA9IENJc1tpXTsgaSsrKSB7XG4gICAgICBpZiAoaSAhPT0gdGFiKSB7XG4gICAgICAgIENJc1tpXS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7ICAgIFxuICAgICAgICBDSXNbaV0uc3R5bGUudG9wID0gcGFyYW1zLnBhZGRpbmcgKyAncHgnO1xuICAgICAgICBDSXNbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5oZWFkZXIuaXRlbXNbdGFiXS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblxuICAgIC8vIFNldCBhY3RpdmUgb2JqZWN0XG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IHRoaXMuaGVhZGVyLml0ZW1zW3RhYl07XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSB0aGlzLmNvbnRlbnQuaXRlbXNbdGFiXTtcblxuICAgIC8vIEFkZCBvbiByZXNpemluZyBldmVudCBoYW5kbGVyXG4gICAgY29uc3QgbmV3T3JkZXIgPSArdGhpcy5hY3RpdmUuaGVhZGVySXRlbS5kYXRhc2V0Lm9yZGVyIC0gMTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgY29uc3QgbmV3T3JkZXIgPSArY29udHJvbGxlci5hY3RpdmUuaGVhZGVySXRlbS5kYXRhc2V0Lm9yZGVyIC0gMTtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7Y29udHJvbGxlcjogdGhpcywgbmV3T3JkZXI6IG5ld09yZGVyfTtcbiAgICAgIGlmICh0aGlzLmFjdGl2ZS53b3JraW5nKSB7XG4gICAgICAgIHNldENvbnRlbnRJdGVtc1dpZHRocyhvcHRpb25zLCBwYXJhbXMpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHNldENvbnRlbnRJdGVtc1dpZHRocyhvcHRpb25zLCBwYXJhbXMpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBzZXRDb250ZW50SXRlbXNQb3NpdGlvbnMob3B0aW9ucylcbiAgICB9KTtcblxuICAgIHNldENvbnRlbnRJdGVtc0Rpc3BsYXkoe1xuICAgICAgY29udHJvbGxlcjogdGhpcyxcbiAgICAgIG5ld09yZGVyOiBuZXdPcmRlcixcbiAgICAgIHNldEZvck5ld09yZGVyOiBmYWxzZSxcbiAgICAgIGRpc3BsYXk6ICdub25lJ1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBoYW5kbGVyLFxuICAgIGdvdG9UYWIsXG4gICAgaW5pdGlhbGl6ZVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYWJzRmxvd0FuaW1hdGlvbjtcbn0se31dLDU2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGRlZmF1bHRBbmltID0gcmVxdWlyZSgnLi9kZWZhdWx0Jyk7XG5jb25zdCBsb2dpblNpZ251cFN3aXRjaCA9IHJlcXVpcmUoJy4vbG9naW5TaWdudXBTd2l0Y2gnKTtcbmNvbnN0IHRhYnNGbG93QW5pbWF0aW9uID0gcmVxdWlyZSgnLi9mbG93Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBkZWZhdWx0QW5pbSxcbiAgbG9naW5TaWdudXBTd2l0Y2gsXG4gIHRhYnNGbG93QW5pbWF0aW9uXG59O1xufSx7XCIuL2RlZmF1bHRcIjo1NCxcIi4vZmxvd1wiOjU1LFwiLi9sb2dpblNpZ251cFN3aXRjaFwiOjU3fV0sNTc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgbG9naW5TaWdudXBTd2l0Y2ggPSBmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gaGFuZGxlcihldnQpIHtcbiAgICBpZiAodGhpcy5iZWluZ0FuaW1hdGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuYmVpbmdBbmltYXRlZCA9IHRydWU7XG5cbiAgICBjb25zdCBvbGRISXRlbSA9IHRoaXMuYWN0aXZlLmhlYWRlckl0ZW07XG4gICAgY29uc3Qgb2xkQ0l0ZW0gPSB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbTtcbiAgICBjb25zdCBuZXdISXRlbSA9IGV2dC50YXJnZXQuY2xvc2VzdCgnLnRhYnMtaGVhZGVyLWl0ZW0nKTtcbiAgICBjb25zdCBvcmRlciA9IG5ld0hJdGVtLmRhdGFzZXQub3JkZXI7XG4gICAgY29uc3QgbmV3Q0l0ZW0gPSB0aGlzLmNvbnRlbnQuaXRlbXNbb3JkZXItMV07XG5cbiAgICBvbGRISXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdsb2dpblNpZ251cC1ISS1hY3RpdmUnKTtcbiAgICBuZXdISXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1ISS1hY3RpdmUnKTtcblxuICAgIG9sZENJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnVwLUNJLWFjdGl2ZScpO1xuICAgIG9sZENJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJLWhpZGluZycpO1xuICAgIG5ld0NJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnVwLUNJLWhpZGRlbicpO1xuICAgIG5ld0NJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJLWFjdGl2YXRpbmcnKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgb2xkQ0l0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnbG9naW5TaWdudXAtQ0ktaGlkaW5nJyk7XG4gICAgICBvbGRDSXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1oaWRkZW4nKTtcblxuICAgICAgbmV3Q0l0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnbG9naW5TaWdudXAtQ0ktYWN0aXZhdGluZycpO1xuICAgICAgbmV3Q0l0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktYWN0aXZlJyk7XG5cbiAgICAgIHRoaXMuYWN0aXZlLmhlYWRlckl0ZW0gPSBuZXdISXRlbTtcbiAgICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtID0gbmV3Q0l0ZW07XG5cbiAgICAgIHRoaXMuYmVpbmdBbmltYXRlZCA9IGZhbHNlO1xuICAgIH0sIDUwMCk7XG4gIH1cblxuICBmdW5jdGlvbiBnb3RvVGFiKHRhYikge1xuICAgIGNvbnN0IG5ld0hlYWRlckl0ZW0gPSB0aGlzLmhlYWRlci5pdGVtc1t0YWJdO1xuICAgIGNvbnN0IG5ld0NvbnRlbnRJdGVtID0gdGhpcy5jb250ZW50Lml0ZW1zW3RhYl07XG5cbiAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnVwLUhJLWFjdGl2ZScpO1xuICAgIHRoaXMuYWN0aXZlLmNvbnRlbnRJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnUtQ0ktYWN0aXZlJyk7XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtQ0ktaGlkZGVuJyk7XG5cbiAgICBuZXdIZWFkZXJJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUhJLWFjdGl2ZScpO1xuICAgIG5ld0NvbnRlbnRJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvZ2luU2lnbnVwLUNJLWhpZGRlbicpO1xuICAgIG5ld0NvbnRlbnRJdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJLWFjdGl2ZScpO1xuXG4gICAgdGhpcy5hY3RpdmUuaGVhZGVySXRlbSA9IG5ld0hlYWRlckl0ZW07XG4gICAgdGhpcy5hY3RpdmUuY29udGVudEl0ZW0gPSBuZXdDb250ZW50SXRlbTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUodGFiKSB7XG4gICAgdGhpcy5oZWFkZXIuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1oZWFkZXInKTtcbiAgICB0aGlzLmNvbnRlbnQuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1jb250ZW50Jyk7XG4gICAgdGhpcy5oZWFkZXIuaXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnbG9naW5TaWdudXAtSEknKSk7XG4gICAgdGhpcy5jb250ZW50Lml0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLmNsYXNzTGlzdC5hZGQoJ2xvZ2luU2lnbnVwLUNJJykpO1xuXG4gICAgY29uc3QgYWN0aXZlSGVhZGVySXRlbSA9IHRoaXMuaGVhZGVyLml0ZW1zW3RhYl07XG4gICAgY29uc3QgYWN0aXZlQ29udGVudEl0ZW0gPSB0aGlzLmNvbnRlbnQuaXRlbXNbdGFiXTtcbiAgICBjb25zdCBub25BY3RpdmVDb250ZW50SXRlbXMgPSB0aGlzLmNvbnRlbnQuaXRlbXMuZmlsdGVyKGl0ZW0gPT4gaXRlbSAhPT0gYWN0aXZlQ29udGVudEl0ZW0pO1xuXG4gICAgYWN0aXZlSGVhZGVySXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1ISS1hY3RpdmUnKTtcbiAgICBhY3RpdmVDb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1hY3RpdmUnKTtcblxuICAgIG5vbkFjdGl2ZUNvbnRlbnRJdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCdsb2dpblNpZ251cC1DSS1oaWRkZW4nKSk7XG5cbiAgICB0aGlzLmFjdGl2ZS5oZWFkZXJJdGVtID0gYWN0aXZlSGVhZGVySXRlbTtcbiAgICB0aGlzLmFjdGl2ZS5jb250ZW50SXRlbSA9IGFjdGl2ZUNvbnRlbnRJdGVtO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBoYW5kbGVyLFxuICAgIGdvdG9UYWIsXG4gICAgaW5pdGlhbGl6ZVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBsb2dpblNpZ251cFN3aXRjaDtcbn0se31dLDU4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IEhlYWRlckl0ZW0gPSByZXF1aXJlKCcuL0hlYWRlckl0ZW0nKTtcbmNvbnN0IGFuaW1zID0gcmVxdWlyZSgnLi9hbmltYXRpb25zJyk7XG5cbmNvbnN0IFRhYnMgPSBmdW5jdGlvbihvcHRzKSB7XG4gIGNvbnN0IGhlYWRlckl0ZW1zID1cbiAgICBvcHRzLmhlYWRlci5pdGVtcy5tYXAoaXRlbSA9PiBuZXcgSGVhZGVySXRlbShpdGVtKS5lbGVtZW50KSB8fCBbXTtcbiAgY29uc3QgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGhlYWRlci5jbGFzc05hbWUgPSAndGFicy1oZWFkZXIgJyArIG9wdHMuaGVhZGVyLmNsYXNzTmFtZTtcbiAgaGVhZGVySXRlbXMuZm9yRWFjaChpdGVtID0+IGhlYWRlci5hcHBlbmRDaGlsZChpdGVtKSk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBoZWFkZXJJdGVtcy5sZW5ndGg7IGkrKykge1xuICAgIGhlYWRlckl0ZW1zW2ldLmRhdGFzZXQub3JkZXIgPSBpKzE7XG4gIH1cblxuICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGNvbnRlbnQuY2xhc3NOYW1lID0gJ3RhYnMtY29udGVudCAnICsgKG9wdHMuY29udGVudC5jbGFzc05hbWUgfHwgJycpO1xuICBjb25zdCBjb250ZW50SXRlbXMgPSBvcHRzLmNvbnRlbnQuaXRlbXMgfHwgW107XG4gIGNvbnRlbnRJdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgndGFicy1jb250ZW50LWl0ZW0nKTtcbiAgICBjb250ZW50LmFwcGVuZENoaWxkKGl0ZW0pO1xuICB9KTtcblxuICBjb25zdCBhY3RpdmUgPSB7XG4gICAgaGVhZGVySXRlbTogbnVsbCxcbiAgICBjb250ZW50SXRlbTogbnVsbFxuICB9O1xuXG4gIGNvbnN0IGFuaW0gPSBhbmltc1tvcHRzLmFuaW1hdGlvbi5uYW1lXSA/XG4gICAgbmV3IGFuaW1zW29wdHMuYW5pbWF0aW9uLm5hbWVdIDpcbiAgICBuZXcgYW5pbXNbJ2RlZmF1bHRBbmltJ107XG5cbiAgY29uc3QgdGFicyA9IHtcbiAgICBoZWFkZXI6IHtcbiAgICAgIGVsZW1lbnQ6IGhlYWRlcixcbiAgICAgIGl0ZW1zOiBoZWFkZXJJdGVtc1xuICAgIH0sXG4gICAgY29udGVudDoge1xuICAgICAgZWxlbWVudDogY29udGVudCxcbiAgICAgIGl0ZW1zOiBjb250ZW50SXRlbXNcbiAgICB9LFxuICAgIGFjdGl2ZTogYWN0aXZlLFxuICAgIGdvdG9UYWI6IGFuaW0uZ290b1RhYixcbiAgICBpbWl0YXRlQ2xpY2tPblRhYjogZnVuY3Rpb24odGFiKSB7XG4gICAgICB0aGlzLmhlYWRlci5pdGVtc1t0YWJdLmNsaWNrKCk7XG4gICAgfVxuICB9O1xuICAgIFxuICBoZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgIGNvbnN0IGxpbmsgPSBldnQudGFyZ2V0O1xuICAgIGNvbnN0IHJlc3VsdCA9IGhlYWRlckl0ZW1zLmZpbmQoaXRlbSA9PiBpdGVtID09PSBsaW5rLmNsb3Nlc3QoJy50YWJzLWhlYWRlci1pdGVtJykpO1xuXG4gICAgaWYgKCFyZXN1bHQgfHwgcmVzdWx0ID09PSB0YWJzLmFjdGl2ZS5oZWFkZXJJdGVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgYW5pbS5oYW5kbGVyLmNhbGwodGFicywgZXZ0KTtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IGluaXRpYWxpemVyID1cbiAgICBvcHRzLmFuaW1hdGlvbi5pbml0aWFsaXplciA/XG4gICAgb3B0cy5hbmltYXRpb24uaW5pdGlhbGl6ZXIgLSAxIDpcbiAgICAwO1xuICBcbiAgYW5pbS5pbml0aWFsaXplLmNhbGwodGFicywgaW5pdGlhbGl6ZXIsIG9wdHMuYW5pbWF0aW9uLnBhcmFtcyk7XG5cbiAgcmV0dXJuIHRhYnM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhYnM7XG59LHtcIi4vSGVhZGVySXRlbVwiOjUzLFwiLi9hbmltYXRpb25zXCI6NTZ9XSw1OTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBjcmVhdGVFbGVtZW50RnJvbUhUTUwgPSBmdW5jdGlvbihodG1sKSB7XG4gIGNvbnN0IHRlbXBQYXJlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdGVtcFBhcmVudC5pbm5lckhUTUwgPSBodG1sO1xuICByZXR1cm4gdGVtcFBhcmVudC5maXJzdEVsZW1lbnRDaGlsZDtcbn07XG5cbmZ1bmN0aW9uIFNpbmdsZXRvbihmbikge1xuICBmdW5jdGlvbiBDbGFzcygpIHtcbiAgICBpZiAoQ2xhc3MuaW5zdGFuY2UpIHtcbiAgICAgIHJldHVybiBDbGFzcy5pbnN0YW5jZTtcbiAgICB9XG5cbiAgICByZXR1cm4gQ2xhc3MuaW5zdGFuY2UgPSBmbigpO1xuICB9XG5cbiAgQ2xhc3MuZ2V0SW5zdGFuY2UgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gQ2xhc3MuaW5zdGFuY2UgfHwgbmV3IENsYXNzKCk7XG4gIH07XG5cbiAgQ2xhc3MuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIENsYXNzLmluc3RhbmNlID0gbnVsbDtcbiAgfTtcblxuICByZXR1cm4gQ2xhc3M7XG59XG5cbmZ1bmN0aW9uIHJhbmdlKHN0YXJ0LCBlbmQpIHtcbiAgbGV0IGFyciA9IFtdO1xuICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPD0gZW5kOyBpKyspIGFyci5wdXNoKGkpO1xuICByZXR1cm4gYXJyO1xufVxuXG5mdW5jdGlvbiBzb3J0TnVtYmVycyhhLCBiKSB7XG4gIGlmIChhID4gYikgcmV0dXJuIDE7XG4gIGlmIChhIDwgYikgcmV0dXJuIC0xO1xuICByZXR1cm4gMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCxcbiAgU2luZ2xldG9uLFxuICByYW5nZSxcbiAgc29ydE51bWJlcnNcbn07XG59LHt9XSw2MDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCBSb290ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL21haW4vcm9vdENvbXBvbmVudCcpO1xuY29uc3QgRGFzaGJvYXJkID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL2Rhc2hib2FyZCcpO1xuY29uc3QgTWFpbkNvbnRyb2xsZXIgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvbWFpbicpO1xuY29uc3Qge3JvdXRlcn0gPSBNYWluQ29udHJvbGxlcjtcblxuY29uc3QgUm91dGVyID0gcmVxdWlyZSgnY3NwLWFwcC9saWJzL3JvdXRlcicpO1xuY29uc3QgU3RhcnQgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvc3RhcnQnKTtcbmNvbnN0IFRlc3QgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvdGVzdCcpXG5cbi8vIGNvbnN0IHJvdXRlciA9IG5ldyBSb3V0ZXIoKTtcbi8vIE1haW5Db250cm9sbGVyLnJvdXRlciA9IHJvdXRlcjtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvaHR0cCcpO1xuXG5odHRwLmNvbmZpZ3VyZSh7IGxvY2F0aW9uOiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyB9KTtcblxuY29uc3QgdmVyaWZpY2F0aW9uUm91dGUgPSByZXF1aXJlKCdjc3AtYXBwL3JvdXRlcy9hdXRoL3ZlcmlmaWNhdGlvbicpO1xuY29uc3Qgcm9vdEhhbmRsZXIgPSByZXF1aXJlKCdjc3AtYXBwL3JvdXRlcy9yb290Jyk7XG5jb25zdCB7c2NoZWR1bGVySGFuZGxlciwgdXNlcnNIYW5kbGVyLCB1c2VySGFuZGxlcn0gPSByZXF1aXJlKCdjc3AtYXBwL3JvdXRlcy9kYXNoYm9hcmQnKTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgIGNvbnN0IGxpbmsgPSBldnQudGFyZ2V0LmNsb3Nlc3QoJ2EnKTtcblxuICAgIGlmIChsaW5rICYmIGxpbmsuZGF0YXNldC5yb3V0ZSkge1xuICAgICAgICByb3V0ZXIubmF2aWdhdGUobGluay5kYXRhc2V0LnJvdXRlKTtcbiAgICB9XG59KTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgZXZ0ID0+IHtcbiAgICBjb25zb2xlLmxvZygncGFnZSBjaGFuZ2VkOiAnLCBkb2N1bWVudC5sb2NhdGlvbik7XG4gICAgY29uc29sZS5sb2coZXZ0KTtcbiAgICByb3V0ZXIubmF2aWdhdGUoZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUpO1xufSk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbihldnQpIHtcbiAgICBsZXQgcGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgICBjb25zdCByb290SW5zdGFuY2UgPSBSb290LmNyZWF0ZSgpO1xuICAgIE1haW5Db250cm9sbGVyLmluaXRpYWxpemUocm9vdEluc3RhbmNlKTtcblxuICAgIHJvdXRlclxuICAgICAgICAvLyAuYWRkUm91dGUoJy8nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gICAgIE1haW5Db250cm9sbGVyLnJlbmRlckNoYWluKFtTdGFydF0pXG4gICAgICAgIC8vIH0pXG4gICAgICAgIC5hZGRSb3V0ZSgnLycsIHJvb3RIYW5kbGVyKVxuICAgICAgICAuYWRkUm91dGUoJ2Rhc2hib2FyZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgTWFpbkNvbnRyb2xsZXIucmVuZGVyQ2hhaW4oW1Rlc3RdKVxuICAgICAgICB9KVxuICAgICAgICAuYWRkUm91dGUoJ2xvZ2luJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgfSlcbiAgICAgICAgLmFkZFJvdXRlKCdzaWdudXAvdmVyaWZ5JywgdmVyaWZpY2F0aW9uUm91dGUpXG4gICAgICAgIC5hZGRSb3V0ZSgnc2NoZWR1bGVyJywgc2NoZWR1bGVySGFuZGxlcilcbiAgICAgICAgLmFkZFJvdXRlKCd1c2VycycsIHVzZXJzSGFuZGxlcilcbiAgICAgICAgLmFkZFJvdXRlKCd1c2Vycy8oOmlkKScsIHVzZXJIYW5kbGVyKVxuICAgIFxuICAgIHJvdXRlci5uYXZpZ2F0ZShwYXRoKVxufSk7XG59LHtcImNzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmRcIjoxLFwiY3NwLWFwcC9jb21wb25lbnRzL21haW5cIjo1LFwiY3NwLWFwcC9jb21wb25lbnRzL21haW4vcm9vdENvbXBvbmVudFwiOjYsXCJjc3AtYXBwL2NvbXBvbmVudHMvc3RhcnRcIjoyNSxcImNzcC1hcHAvY29tcG9uZW50cy90ZXN0XCI6MjksXCJjc3AtYXBwL2xpYnMvaHR0cFwiOjUwLFwiY3NwLWFwcC9saWJzL3JvdXRlclwiOjUyLFwiY3NwLWFwcC9yb3V0ZXMvYXV0aC92ZXJpZmljYXRpb25cIjo2MSxcImNzcC1hcHAvcm91dGVzL2Rhc2hib2FyZFwiOjYyLFwiY3NwLWFwcC9yb3V0ZXMvcm9vdFwiOjY2fV0sNjE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3Qge3JlbmRlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvbWFpbicpO1xuY29uc3QgVmVyaWZpY2F0aW9uQ29tcG9uZW50ID0gcmVxdWlyZSgnY3NwLWFwcC9ncm91cHMvYXV0aC92ZXJpZmljYXRpb24nKTtcblxuZnVuY3Rpb24gdmVyaWZpY2F0aW9uKCkge1xuICByZW5kZXIoW25ldyBWZXJpZmljYXRpb25Db21wb25lbnQoKV0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHZlcmlmaWNhdGlvbjtcbn0se1wiY3NwLWFwcC9jb21wb25lbnRzL21haW5cIjo1LFwiY3NwLWFwcC9ncm91cHMvYXV0aC92ZXJpZmljYXRpb25cIjo0NH1dLDYyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHNjaGVkdWxlckhhbmRsZXIgPSByZXF1aXJlKCcuL3NjaGVkdWxlcicpOyBcbmNvbnN0IHVzZXJzSGFuZGxlciA9IHJlcXVpcmUoJy4vdXNlcnMnKTtcbmNvbnN0IHVzZXJIYW5kbGVyID0gcmVxdWlyZSgnLi91c2VyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzY2hlZHVsZXJIYW5kbGVyLFxuICB1c2Vyc0hhbmRsZXIsXG4gIHVzZXJIYW5kbGVyXG59O1xufSx7XCIuL3NjaGVkdWxlclwiOjYzLFwiLi91c2VyXCI6NjQsXCIuL3VzZXJzXCI6NjV9XSw2MzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7cmVuZGVyfSA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9tYWluJyk7XG5jb25zdCBEYXNoYm9hcmQgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkJyk7XG5jb25zdCBTY2hlZHVsZXJDb21wb25lbnQgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvc2NoZWR1bGVyJyk7XG5cbmNvbnN0IFNjaGVkdWxlckhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgcmVuZGVyKFtEYXNoYm9hcmQsIFNjaGVkdWxlckNvbXBvbmVudF0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTY2hlZHVsZXJIYW5kbGVyO1xufSx7XCJjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkXCI6MSxcImNzcC1hcHAvY29tcG9uZW50cy9tYWluXCI6NSxcImNzcC1hcHAvY29tcG9uZW50cy9zY2hlZHVsZXJcIjoxNH1dLDY0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IHtyZW5kZXJ9ID0gcmVxdWlyZSgnY3NwLWFwcC9jb21wb25lbnRzL21haW4nKTtcbmNvbnN0IERhc2hib2FyZCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmQnKTtcbmNvbnN0IHtVc2VyUGFnZUNvbXBvbmVudH0gPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvdXNlcnMvc3RhbmRhbG9uZXMnKTtcblxuY29uc3QgVXNlckhhbmRsZXIgPSBmdW5jdGlvbihub25lLCBwYXJhbXMpIHtcbiAgcmVuZGVyKFtEYXNoYm9hcmQsIFVzZXJQYWdlQ29tcG9uZW50KHBhcmFtcy5pZCldKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVXNlckhhbmRsZXI7XG59LHtcImNzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmRcIjoxLFwiY3NwLWFwcC9jb21wb25lbnRzL21haW5cIjo1LFwiY3NwLWFwcC9jb21wb25lbnRzL3VzZXJzL3N0YW5kYWxvbmVzXCI6MzF9XSw2NTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5jb25zdCB7cmVuZGVyfSA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9tYWluJyk7XG5jb25zdCBEYXNoYm9hcmQgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkJyk7XG5jb25zdCBVc2Vyc0NvbXBvbmVudCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy91c2VycycpO1xuXG5jb25zdCBVc2Vyc0hhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgcmVuZGVyKFtEYXNoYm9hcmQsIFVzZXJzQ29tcG9uZW50XSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVzZXJzSGFuZGxlcjtcbn0se1wiY3NwLWFwcC9jb21wb25lbnRzL2Rhc2hib2FyZFwiOjEsXCJjc3AtYXBwL2NvbXBvbmVudHMvbWFpblwiOjUsXCJjc3AtYXBwL2NvbXBvbmVudHMvdXNlcnNcIjozMH1dLDY2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdjc3AtYXBwL2xpYnMvaHR0cCcpO1xuY29uc3Qge3JlbmRlcn0gPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvbWFpbicpO1xuY29uc3QgU3RhcnQgPSByZXF1aXJlKCdjc3AtYXBwL2NvbXBvbmVudHMvc3RhcnQnKTtcbmNvbnN0IERhc2hib2FyZCA9IHJlcXVpcmUoJ2NzcC1hcHAvY29tcG9uZW50cy9kYXNoYm9hcmQnKTtcblxuY29uc3QgY2hlY2tBdXRoID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgcmV0dXJuIGh0dHBcbiAgICAucG9zdCgnYXV0aC9hdXRoZW50aWNhdGUnLCB7dG9rZW46IHRva2VufSlcbiAgO1xufTtcblxuY29uc3Qgcm9vdEhhbmRsZXIgPSBhc3luYyBmdW5jdGlvbigpIHtcbiAgY29uc3QgdG9rZW4gPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2F1dGhfdG9rZW4nKSB8fCBudWxsO1xuICBjb25zdCBpc0F1dGhlbnRpY2F0ZWQgPSB0b2tlbiA/IChhd2FpdCBjaGVja0F1dGgodG9rZW4pKS5zdWNjZXNzIDogZmFsc2U7XG5cbiAgaWYgKGlzQXV0aGVudGljYXRlZCkge1xuICAgIHJlbmRlcihbRGFzaGJvYXJkXSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmVuZGVyKFtTdGFydF0pO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvb3RIYW5kbGVyO1xufSx7XCJjc3AtYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkXCI6MSxcImNzcC1hcHAvY29tcG9uZW50cy9tYWluXCI6NSxcImNzcC1hcHAvY29tcG9uZW50cy9zdGFydFwiOjI1LFwiY3NwLWFwcC9saWJzL2h0dHBcIjo1MH1dfSx7fSxbNjBdKTtcbiJdLCJmaWxlIjoic291cmNlLmpzIn0=
