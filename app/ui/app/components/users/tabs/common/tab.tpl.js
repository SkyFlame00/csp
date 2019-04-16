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