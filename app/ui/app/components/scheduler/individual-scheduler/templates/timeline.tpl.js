const {createElementFromHTML} = require('csp-app/libs/utilities');

function template() {
  const html = /*html*/`
    <div class="timeline"></div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element
  };
}

module.exports = template;