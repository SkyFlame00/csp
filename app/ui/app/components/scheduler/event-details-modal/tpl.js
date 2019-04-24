const {createElementFromHTML} = require('csp-app/libs/utilities');

function template(e) {
  const date = `${e.date.getDate()}/${e.date.getMonth()}/${e.date.getFullYear()}`;
  const timeFromHH = e['time_from'].getHours().toString().length == 1 ? '0' + e['time_from'].getHours() : e['time_from'].getHours();
  const timeFromMM = e['time_from'].getMinutes().toString().length == 1 ? '0' + e['time_from'].getMinutes() : e['time_from'].getMinutes();
  const timeToHH = e['time_to'].getHours().toString().length == 1 ? '0' + e['time_to'].getHours() : e['time_to'].getHours();
  const timeToMM = e['time_to'].getMinutes().toString().length == 1 ? '0' + e['time_to'].getMinutes() : e['time_to'].getMinutes();
  const time = `${timeFromHH}:${timeFromMM}-${timeToHH}:${timeToMM}`;
  const linkShortened = e.link && e.link.length > 20 ? e.link.length.slice(0, 17) + '...' : e.link;
  let importance;

  switch(e.importance) {
    case 'none':
      importance = 'peace';
      importanceText = 'Free to decide';
      importanceHint = 'The event is not important';
      break;
    case 'desirable':
      importance = 'rock';
      importanceText = 'Desirable';
      importanceHint = 'The event is desirable to visit';
      break;
    case 'important':
      importance = 'paper';
      importanceText = 'Important';
      importanceHint = 'The event is obligatory to visit';
      break;
    default:
      importance = 'peace';
      importanceText = 'Free to decide';
      importanceHint = 'The event is not important';
      break;
  }

  const html = /*html*/`
    <div class="cmp_event-details">
      <div class="top">
        <div class="item date item-simple">
          <i class="i i-calendar"></i>
          <span>${ date }</span>
        </div>

        <div class="item time item-simple">
          <i class="i i-clock"></i>
          <span>${ time }</span>
        </div>

        ${
          e.link ?
          /*html*/`<a class="item link item-bullet" href="${ e.link }"><i class="i i-link"></i><span>${ linkShortened }</span></a>` :
          ''
        }

        ${
          e['category_id'] ?
          /*html*/`<div class="item category item-simple"><i class="i"></i><span>${ e['category_name'] }</span></div>` :
          ''
        }

        <div class="item importance item-bullet ${ importance }">
          <i class="i i-hand-${ importance }"></i>
          <span>${ importanceText }</span>
        </div>
      </div>

      <div class="description">
        ${ e.description ? e.description : 'No description provided' }
      </div>

      <div class="participants">
        <div class="participants-header">Participants</div>
        <div class="participants-body">
          ${
            e.participants.map(p => {
              return /*html*/`
                <div class="participant ${ p.you ? 'you' : '' }">
                  ${ p.you ? 'You' : p.username }
                </div>
              `;
            }).join('')
          }
        </div>
      </div>

      <div class="files">

      </div>
    </div>
  `;

  const element = createElementFromHTML(html);

  return {
    root: element
  };
}

module.exports = template;