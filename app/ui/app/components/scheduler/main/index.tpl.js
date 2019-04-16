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