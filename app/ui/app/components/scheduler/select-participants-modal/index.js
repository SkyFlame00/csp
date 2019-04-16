const Modal = require('csp-app/components/modals');
const http = require('csp-app/libs/http');

function SPModal(options) {
  const {
    participants,
    date,
    timeFrom,
    timeTo
  } = options;

  const SPModalInstance = Modal.create({
    type: 'standard',
    title: 'Select participants',
    width: 250,
    defaultActions: true,
    destroyOnClose: true
  });

  const params = { date, timeFrom, timeTo };

  http.post('scheduler/getAllFriendsBasedOnAvailability', params)
    .then(friends => {

    })
  ;

  return SPModalInstance;
}

module.exports = {
  create: () => new SPModal()
};