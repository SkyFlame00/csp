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