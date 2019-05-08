function calcSizes(controllerName) {
  return function() {
    const controller = this[controllerName];

    const startHour = 9;
    const endHour = 21;
    const margin = 30;
    const width = controller.scheduler.timeline.offsetWidth - margin*2;
    const minute = (width)/((endHour - startHour)*60);

    this.sizes = {
      startHour,
      endHour,
      width,
      margin,
      minute
    };
  }
}

module.exports = calcSizes;