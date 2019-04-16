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