const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(event) {
  const timeFrom = event['time_from'] ? event['time_from'] : event.time.from;
  const timeTo = event['time_to'] ? event['time_to'] : event.time.to;
  const startsAtHH = timeFrom.getHours().toString().length == 1 ? '0' + timeFrom.getHours() : timeFrom.getHours();
  const startsAtMM = timeFrom.getMinutes().toString().length == 1 ? '0' + timeFrom.getMinutes() : timeFrom.getMinutes();
  const endsAtHH = timeTo.getHours().toString().length == 1 ? '0' + timeTo.getHours() : timeTo.getHours();
  const endsAtMM = timeTo.getMinutes().toString().length == 1 ? '0' + timeTo.getMinutes() : timeTo.getMinutes();
  const timePeriod = `${ startsAtHH }:${ startsAtMM }-${ endsAtHH }:${ endsAtMM }`;
  let importance;
  let importanceHint;
  let description;

  switch(event.importance) {
    case 'none':
      importance = 'peace';
      importanceHint = 'The event is not important';
      break;
    case 'desirable':
      importance = 'rock';
      importanceHint = 'The event is desirable to visit';
      break;
    case 'important':
      importance = 'paper';
      importanceHint = 'The event is obligatory to visit';
      break;
    default:
      importance = 'peace';
      importanceHint = 'The event is not important';
      break;
  }

  if (event.description && event.description.length > 150) {
    description = event.description.slice(0, 146) + '...';
  }
  else if (!event.description || event.description.length == 0) {
    description = 'No description provided';
  }
  else {
    description = event.description;
  }

  const html = /*html*/`
    <div class="tooltip no-display">
      <div class="header">
        <div class="title"><h3>${ event.title }</h3></div>
        <div class="importance" title="${ importanceHint }"><i class="i i-hand-${ importance }"></i></div>
      </div>
      <div class="description">${ description }</div>
      <div class="footer">
        <div class="time">${ timePeriod }</div>
        <div class="items">
          <div class="item details"><button title="Show details"><i class="i i-info"></i></button></div>

          ${
            event.link ?
            /*html*/`<div class="item link" title="${ event.link }"><a href="${ event.link }"><i class="i i-link"></i></a></div>` :
            ''
          }

          ${
            event['project_id'] ?
            /*html*/`<div class="item project" title="Project's page"><a data-route="${ event['project_id'] }"><i class="i i-project"></i></a></div>` :
            ''
          }
          
          <div class="item participants" title="Number of participants (including you)">
            <i class="i i-users"></i> 
            <span>${ event['participants_num'] }</span>
          </div>
        </div>
      </div>
    </div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element,
    details: element.querySelector('.details button')
  };
}

module.exports = template;