const http = require('csp-app/libs/http');
const Modal = require('csp-app/components/modals');
const mainTemplate = require('./tpl');

function EDModal(options) {
  const EDModalInstance = Modal.create({
    type: 'standard',
    title: '',
    width: 300,
    destroyOnClose: true,
    actions: [{
      id: 'cancel',
      type: 'primary',
      title: 'OK'
    }]
  });

  const {eventId} = options;

  http.get(`scheduler/getEventInfo/${ eventId }`)
    .then(event => {
      event.date = new Date(event.date);
      event['time_from'] = new Date(event['time_from']);
      event['time_to'] = new Date(event['time_to']);
      const tplController = mainTemplate(event);
      EDModalInstance.elements.title.textContent = event.title;
      EDModalInstance.elements.body.appendChild(tplController.root);
    })
  ;

  return EDModalInstance;
}

module.exports = {
  create: options => new EDModal(options)
};