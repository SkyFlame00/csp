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