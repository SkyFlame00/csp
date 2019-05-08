const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(data) {
  const fromHHStr = data.from.getHours().toString();
  const fromMMStr = data.from.getMinutes().toString();
  const fromHH = fromHHStr.length == 1 ? '0' + fromHHStr : fromHHStr;
  const fromMM = fromMMStr.length == 1 ? '0' + fromMMStr : fromMMStr;

  const toHHStr = data.to.getHours().toString();
  const toMMStr = data.to.getMinutes().toString();
  const toHH = toHHStr.length == 1 ? '0' + toHHStr : toHHStr;
  const toMM = toMMStr.length == 1 ? '0' + toMMStr : toMMStr;

  const from = `${fromHH}:${fromMM}`;
  const to = `${toHH}:${toMM}`;
  const hint = `Free in ${from}-${to}`;

  const html = /*html*/`
    <div class="common-fi" title="${hint}"></div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element
  };
}

module.exports = template;