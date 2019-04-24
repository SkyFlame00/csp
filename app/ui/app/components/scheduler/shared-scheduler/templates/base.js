const modalTemplate = require('../main/modal.tpl');
const {range, createElementFromHTML} = require('csp-app/libs/utilities');

const sidebarTpl = /*html*/`
  <div class="sidebar-ss">
    <div class="participants">
      <div class="header">
        <h2>Participants</h2>
        <button class="btn-open-sp">Select participants</button>
      </div>

      <div class="body"></div>
    </div>

    <div class="days">
      <div class="header">Specify days</div>
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
      <div class="header"><h2>Specify time span</h2></div>

      <div class="options">
        <div class="input-block">
          <input type="radio" name="time" value="floating" id="time-floating" />
          <label for="time-floating">Floating</label>
        </div>
      
        <div class="input-block">
          <input type="radio" name="time" value="fixed" id="time-fixed" />
          <label for="time-fixed">Fixed</label>
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
          <label for="time-fi">Time</label>
          <input type="text" placeholder="hh:mm" id="time-fi" />
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
    <div class="loading"><p>Loading. Please wait...</p></div>
    <div class="scheduler"></div>
  </div>
`;

function template() {
  const sidebarTplController = createElementFromHTML(sidebarTpl);
  const mainTplController = createElementFromHTML(mainTpl);

  return {
    sidebar: {
      root: sidebarTplController,
      participants: {
        root: sidebarTplController.querySelector('.participants'),
        button: sidebarTplController.querySelector('.btn-open-sp'),
        body: sidebarTplController.querySelector('.participants .body')
      },
      days: {
        root: sidebarTplController.querySelector('.days'),
        btnFrom: sidebarTplController.querySelector('#days-from'),
        btnTo: sidebarTplController.querySelector('#days-to')
      },
      time: {
        root: sidebarTplController.querySelector('.time'),
        options: {
          floating: sidebarTplController.querySelector('#time-floating'),
          fixed: sidebarTplController.querySelector('#time-fixed')
        },
        inputs: {
          floating: {
            from: sidebarTplController.querySelector('#time-fl-from'),
            to: sidebarTplController.querySelector('#time-fl-to')
          },
          fixed: sidebarTplController.querySelector('#time-fi')
        }
      },
      searchBtn: sidebarTplController.querySelector('.submit-wrapper button'),
      results: {
        root: sidebarTplController.querySelector('.results'),
        body: sidebarTplController.querySelector('.body')
      }
    },
    main: {
      scheduler: {

      }
    }
  };
}

module.exports = template;