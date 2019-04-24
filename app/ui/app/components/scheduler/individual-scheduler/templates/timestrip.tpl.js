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