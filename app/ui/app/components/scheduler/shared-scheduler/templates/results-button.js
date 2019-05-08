const {createElementFromHTML, getMonthName} = require('csp-app/libs/utilities');

function template(options) {
  const className = options.hasFreeIntevals ? 'btn-primary' : '';
  const monthName = getMonthName(options.date.getMonth());
  const title = `${monthName}, ${options.date.getDate()}`;
  const html = /*html*/`
    <button class="results-btn ${className}" data-day-id="${options.id}">${title}</button>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element
  };
}

module.exports = template;