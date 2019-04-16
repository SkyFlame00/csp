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