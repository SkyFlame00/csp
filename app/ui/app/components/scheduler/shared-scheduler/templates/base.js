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