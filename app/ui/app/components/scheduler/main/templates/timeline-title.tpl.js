const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(data) {
  const html = /*html*/`
    <div class="date">${ data.title }</div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element
  };
}

module.exports = template;