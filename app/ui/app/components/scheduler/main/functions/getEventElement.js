const {eventTemplate} = require('../templates');

function getEventElement(event) {
  const eventTplController = eventTemplate({ id: event.id });
  const el = eventTplController.root;
  const timeFrom = event['time_from'] ? event['time_from'] : event.time.from;
  const timeTo = event['time_to'] ? event['time_to'] : event.time.to;
  const offset = this.calcOffset(timeFrom);
  const width = this.calcWidth(timeFrom, timeTo);
  el.style.left = offset + 'px';
  el.style.width = width + 'px';
  return el;
}

module.exports = getEventElement;