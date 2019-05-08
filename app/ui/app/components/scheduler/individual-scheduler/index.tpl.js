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