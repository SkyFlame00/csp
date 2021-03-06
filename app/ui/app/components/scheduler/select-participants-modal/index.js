const Modal = require('csp-app/components/modals');
const http = require('csp-app/libs/http');
const {createElementFromHTML} = require('csp-app/libs/utilities');

function listTemplate() {
  const html = /*html*/`
    <div class="cmp_sel-ps"></div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element
  };
}

function participantTemplate(participant) {
  const selected = participant.selected ? 'selected' : '';
  const username = participant.you ? 'You' : participant['username'];
  const html = /*html*/`
    <div class="participant ${ selected }" data-id="${ participant['user_id'] }">
      <div class="select-box"><i class="i i-check"></i></div>
      <div class="user-info">
        <div class="user-name">${ username }</div>
        ${
          participant['busy'] ?
          /*html*/`<div class="busy"><i class="i i-clock"></i><span>Busy</span></div>`
          : ''
        }
      </div>
    </div>
  `;
  const element = createElementFromHTML(html);

  return {
    root: element
  };
}

function SPModal(options) {
  const {
    participants: participantsSelected,
    date,
    timeFrom,
    timeTo
  } = options;

  const SPModalInstance = Modal.create({
    type: 'standard',
    title: 'Select participants',
    width: 300,
    height: 200,
    defaultActions: true,
    destroyOnClose: true
  });

  const tplController = listTemplate();
  const submit = SPModalInstance.elements.submit;
  const isAllFriends = date && timeFrom && timeTo;
  let participants = [];
  let params;
  let apiURL = '';
  
  SPModalInstance.elements.body.appendChild(tplController.root);

  if (isAllFriends) {
    params = {
      date: date.toString(),
      timeFrom: timeFrom.toString(),
      timeTo: timeTo.toString()
    };
    apiURL = 'scheduler/getAllFriendsBasedOnAvailability';
  }
  else {
    apiURL = 'scheduler/getAllFriendsAndMe';
  }

  http.post(apiURL, params || {})
    .then(friends => {
      friends = friends.sort((a, b) => {
        if (a.you == false) return 1;
        if (b.you == false) return -1;
        return 0;
      });

      friends.forEach(friend => {
        const selected = participantsSelected.findIndex(p => p['user_id'] === friend['user_id']);
        friend.selected = selected > -1;
        participants.push(friend);
      });

      participants.forEach(p => {
        const PItemTplController = participantTemplate(p);
        tplController.root.appendChild(PItemTplController.root);
      });

      tplController.root.addEventListener('click', evt => {
        const participantTpl = evt.target.closest('.participant');
        if (!participantTpl) return;
        const userId = +participantTpl.dataset.id;
        const participant = participants.find(p => p['user_id'] === userId);
        participant.selected = !participant.selected;
        participantTpl.classList.toggle('selected');
        disableOnBusySelected();
      });

      submit.addEventListener('click', () => {
        const data = participants.filter(p => p.selected);
        const submitEvent = new CustomEvent('participantsSelected', { detail: {participants: data} });
        SPModalInstance.elements.root.dispatchEvent(submitEvent);
        SPModalInstance.close();
      });

      disableOnBusySelected();
    })
  ;

  function disableOnBusySelected() {
    const busySelected = participants.find(p => p.selected && p['busy']);

    if (busySelected && !submit.getAttribute('disabled')) {
      submit.setAttribute('disabled', 'disabled');
    }

    if (!busySelected && submit.getAttribute('disabled')) {
      submit.removeAttribute('disabled');
    }
  }

  return SPModalInstance;
}

module.exports = {
  create: options => new SPModal(options)
};