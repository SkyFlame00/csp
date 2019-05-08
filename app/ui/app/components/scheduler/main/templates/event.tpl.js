const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(event) {
  const html = /*html*/`
    <div class="event" data-event-id="${ event.id }"></div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element
  };
}

module.exports = template;